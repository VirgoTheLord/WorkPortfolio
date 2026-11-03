'use client'

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import './waveform-slider.css'

type WaveformSliderProps = {
  /** The slider's name, shown above it unless `hideLabel`. */
  label: string
  hideLabel?: boolean
  min?: number
  max?: number
  step?: number
  /** Controlled value. Leave it out and the slider keeps its own. */
  value?: number
  defaultValue?: number
  onChange?: (value: number) => void
  /** How the value reads beside the label. */
  format?: (value: number) => ReactNode
  /** How many bars. */
  bars?: number
  /** Shapes the waveform; any number gives a different one. */
  seed?: number
  disabled?: boolean
  name?: string
  className?: string
}

/* The bars sit this far in from each end, half the input's thumb, so the
   value under the pointer is the value drawn. */
const INSET = 8

const VERTEX = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'

/* TR the travel (left end, right end, centre y, px); V the value 0-1; A how
   hard the bars near the thumb bounce; H a bar's tallest half height; N the
   bar count and S the seed; FG and ACC the text and accent colours. No clock:
   the bars only move when a uniform does. */
const FRAGMENT = `precision mediump float;
uniform vec3 TR,FG,ACC;uniform float D,V,A,H,N,S;
float h1(float n){return fract(sin(n*12.9898)*43758.5453);}
float sdBox(vec2 p,vec2 c,vec2 h,float r){vec2 q=abs(p-c)-h+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
float cover(float d){return 1.-smoothstep(-.7*D,.7*D,d);}
void main(){vec2 p=gl_FragCoord.xy;float tx=TR.x+V*(TR.y-TR.x);float gap=(TR.y-TR.x)/N;float i=floor((p.x-TR.x)/gap);
 float x=TR.x+(i+.5)*gap;float base=.22+.78*pow(.5+.5*sin(i*.55+S)*cos(i*.23+1.+S*.7)*(.6+.4*h1(i+S)),1.2);
 float near=exp(-pow((x-tx)/(40.*D),2.));float h=(base*(1.+A*near*.55)+near*.12)*H;
 float bw=gap*.42;float a=cover(sdBox(p,vec2(x,TR.z),vec2(bw,h),bw))*step(-.5,i)*step(i,N-.5);
 float lit=step(x,tx);vec3 c=mix(FG,ACC,lit);float al=a*mix(.16,1.,lit);
 float bar=(1.-smoothstep(.5*D,1.2*D,abs(p.x-tx)))*step(abs(p.y-TR.z),H*1.25);
 c=mix(c,FG,bar);al=max(al,bar*.85);gl_FragColor=vec4(c*al,al);}`

/* A colour token resolved to 0-1 RGB, by letting a 2D canvas parse it. */
let parser: CanvasRenderingContext2D | null | undefined
function readColor(el: Element, name: string): [number, number, number] {
  const ctx = (parser ??= document.createElement('canvas').getContext('2d'))
  if (!ctx) return [0.5, 0.5, 0.5]
  ctx.fillStyle = '#000'
  ctx.fillStyle = getComputedStyle(el).getPropertyValue(name).trim() || '#000'
  const value = String(ctx.fillStyle)
  if (value.startsWith('#')) return [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16) / 255) as [number, number, number]
  const [r = 0, g = 0, b = 0] = (value.match(/[\d.]+/g) ?? []).map(Number)
  return [r / 255, g / 255, b / 255]
}

/*
 * A slider drawn as an audio waveform (waveform-slider.css): a row of bars
 * that light up in the accent to the value, a hairline marking the thumb.
 * Drag fast and the bars around the thumb bounce, settling as it slows.
 *
 * A real range input lies over the bars, so the pointer, arrow keys, Page
 * Up/Down, Home/End and forms all work as they do on any slider. The bars are
 * one WebGL canvas that draws only while the value moves and stops when it
 * settles, and pauses off screen. Reduced motion keeps the bounce off; without
 * WebGL it is a plain filled bar.
 */
export function WaveformSlider({
  label,
  hideLabel = false,
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue,
  onChange,
  format = (v) => v,
  bars = 48,
  seed = 0,
  disabled = false,
  name,
  className = '',
}: WaveformSliderProps) {
  const [own, setOwn] = useState(defaultValue ?? min + (max - min) / 2)
  // Bumped when the browser restores a lost WebGL context, to build the scene again.
  const [epoch, setEpoch] = useState(0)
  const current = Math.min(max, Math.max(min, value ?? own))
  const fraction = max > min ? (current - min) / (max - min) : 0
  const shown = format(current)
  // What a screen reader hears: the formatted value when it is plain text.
  const valueText = typeof shown === 'string' || typeof shown === 'number' ? String(shown) : undefined
  const labelId = useId()
  const field = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const kick = useRef(() => {})
  /* What the render loop reads; the effect below keeps it told. */
  const live = useRef({ fraction, bars, seed })
  useEffect(() => {
    live.current = { fraction, bars, seed }
    kick.current()
  }, [fraction, bars, seed])

  useEffect(() => {
    const box = field.current
    const cv = canvas.current
    if (!box || !cv) return
    const gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' })
    if (!gl || gl.isContextLost()) return
    const lost = (event: Event) => event.preventDefault()
    const restored = () => setEpoch((n) => n + 1)
    cv.addEventListener('webglcontextlost', lost)
    cv.addEventListener('webglcontextrestored', restored)
    const shader = (type: number, source: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, source)
      gl.compileShader(s)
      return s
    }
    const program = gl.createProgram()!
    gl.attachShader(program, shader(gl.VERTEX_SHADER, VERTEX))
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, FRAGMENT))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    const u: Record<string, WebGLUniformLocation | null> = {}
    for (const n of ['TR', 'FG', 'ACC', 'D', 'V', 'A', 'H', 'N', 'S']) u[n] = gl.getUniformLocation(program, n)

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let ratio = 1
    let shown = live.current.fraction
    let amp = 0
    let raf = 0
    let visible = false
    let alive = true

    const measure = () => {
      ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      cv.width = Math.max(1, Math.round(box.clientWidth * ratio))
      cv.height = Math.max(1, Math.round(box.clientHeight * ratio))
      gl.viewport(0, 0, cv.width, cv.height)
      gl.uniform3f(u.TR!, INSET * ratio, cv.width - INSET * ratio, cv.height / 2)
      gl.uniform1f(u.H!, cv.height * 0.3)
      gl.uniform1f(u.D!, ratio)
    }
    const recolour = () => {
      gl.uniform3f(u.FG!, ...readColor(box, '--wui-fg'))
      gl.uniform3f(u.ACC!, ...readColor(box, '--wui-accent'))
    }

    const frame = () => {
      raf = 0
      const target = live.current.fraction
      const before = shown
      shown = still ? target : shown + (target - shown) * 0.3
      amp = still ? 0 : amp * 0.88 + Math.min(Math.abs(shown - before) * 8, 0.8) * 0.4
      gl.uniform1f(u.V!, shown)
      gl.uniform1f(u.A!, amp)
      gl.uniform1f(u.N!, live.current.bars)
      gl.uniform1f(u.S!, live.current.seed)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      box.dataset.gl = 'on'
      const settled = Math.abs(target - shown) < 0.0004 && amp < 0.002
      if (settled) {
        shown = target
        amp = 0
      } else if (alive && visible) raf = requestAnimationFrame(frame)
    }
    /* The canvas keeps its last frame, so a frame is asked for only on change. */
    const ask = () => {
      if (!raf && alive && visible) raf = requestAnimationFrame(frame)
    }
    kick.current = ask

    measure()
    recolour()
    const seen = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting
      ask()
    })
    seen.observe(box)
    const resize = new ResizeObserver(() => {
      measure()
      ask()
    })
    resize.observe(box)
    // A theme or accent set on any ancestor changes the colours under the bars.
    const theme = new MutationObserver(() => {
      recolour()
      ask()
    })
    for (let node = box.parentElement; node; node = node.parentElement) theme.observe(node, { attributeFilter: ['data-theme', 'class', 'style'] })
    const scheme = window.matchMedia('(prefers-color-scheme: dark)')
    const onScheme = () => {
      recolour()
      ask()
    }
    scheme.addEventListener('change', onScheme)

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      kick.current = () => {}
      seen.disconnect()
      resize.disconnect()
      theme.disconnect()
      scheme.removeEventListener('change', onScheme)
      cv.removeEventListener('webglcontextlost', lost)
      cv.removeEventListener('webglcontextrestored', restored)
    }
  }, [epoch])

  return (
    <div className={`wui-wave ${className}`}>
      <div className={hideLabel ? 'wui-sr-only' : 'wui-wave-head'}>
        <span id={labelId}>{label}</span>
        <output className="wui-wave-value" aria-hidden="true">
          {shown}
        </output>
      </div>
      <div ref={field} className="wui-wave-field" style={{ '--wui-wave-v': fraction } as CSSProperties}>
        <canvas ref={canvas} aria-hidden="true" className="wui-wave-canvas" />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={current}
          disabled={disabled}
          name={name}
          aria-labelledby={labelId}
          aria-valuetext={valueText}
          onChange={(event) => {
            const next = Number(event.target.value)
            if (value === undefined) setOwn(next)
            onChange?.(next)
          }}
          className="wui-wave-input"
        />
      </div>
    </div>
  )
}
