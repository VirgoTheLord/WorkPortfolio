'use client'

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import './foil-cards.css'

type Finish = 'red' | 'black' | 'silver' | 'gold'

type FoilOption = {
  value: string
  title: ReactNode
  /** A short line under the title, such as a price. */
  meta?: ReactNode
  description?: ReactNode
}

type FoilCardsProps = {
  /** The group's name, read to screen readers. */
  label: string
  options: readonly FoilOption[]
  /** Controlled value. Leave it out and the group keeps its own. */
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  finish?: Finish
  /** The radios' name, for a form. */
  name?: string
  className?: string
}

/* Each finish: four tones the foil runs through, how much rainbow its sheen
   carries, and how bright the sheen is. */
const FINISHES: Record<Finish, { stops: number[][]; iri: number; sheen: number }> = {
  red: { stops: [[0.29, 0.03, 0.06], [0.64, 0.07, 0.12], [0.8, 0.2, 0.26], [0.86, 0.38, 0.4]], iri: 0.12, sheen: 0.26 },
  black: { stops: [[0.03, 0.03, 0.035], [0.1, 0.1, 0.12], [0.2, 0.21, 0.25], [0.3, 0.31, 0.35]], iri: 0.14, sheen: 0.22 },
  silver: { stops: [[0.55, 0.57, 0.6], [0.74, 0.76, 0.8], [0.88, 0.9, 0.92], [0.98, 0.98, 0.99]], iri: 0.3, sheen: 0.3 },
  gold: { stops: [[0.45, 0.31, 0.09], [0.72, 0.53, 0.2], [0.88, 0.72, 0.38], [1, 0.93, 0.7]], iri: 0.14, sheen: 0.32 },
}

/* Where the sheen rests when nobody is looking: the card's top left. */
const REST = [-0.95, 0.95]
const WIPE = 700
/* How long the pointer must rest on the chosen card before the sheen follows. */
const INTENT = 180

const VERTEX = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'

/* N the chosen card and O the one before it (centre xy, half size zw, px, y
   up), R their corner radius; W the wipe 0-1, negative when none; L where the
   sheen is on the card (-1 to 1 on each axis); C0-C3 the finish's tones, I
   its rainbow and S its sheen; D the pixel ratio. No clock: nothing moves
   unless a uniform does. */
const FRAGMENT = `precision mediump float;
uniform vec4 N,O;uniform vec2 L;uniform vec3 C0,C1,C2,C3;uniform float W,I,S,D,R;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
vec3 spectrum(float x){return clamp(vec3(1.5-abs(x*3.-.4)*1.6,1.3-abs(x*3.-1.4)*1.5,1.5-abs(x*3.-2.5)*1.6),0.,1.);}
vec3 pal(float x){x=abs(fract(x)*2.-1.);return x<.33?mix(C0,C1,x/.33):(x<.66?mix(C1,C2,(x-.33)/.33):mix(C2,C3,(x-.66)/.34));}
float sdRB(vec2 p,vec4 r){vec2 q=abs(p-r.xy)-r.zw+R;return length(max(q,0.))+min(max(q.x,q.y),0.)-R;}
float wipe(vec2 p,vec4 r){return((p.x-(r.x-r.z))/(2.*r.z)+(1.-(p.y-(r.y-r.w))/(2.*r.w)))*.5;}
float inside(vec2 p,vec4 r){return 1.-smoothstep(-.8*D,.8*D,sdRB(p,r));}
vec3 foil(vec2 p,vec4 r){vec2 uv=(p-r.xy)/r.w;
 float f=(noise(uv*.7)*.6+noise(uv*1.5)*.3+noise(uv*3.1)*.1)*.5+uv.x*.3+uv.y*.18+dot(L,vec2(.35,.22));vec3 c=pal(f);
 vec2 sp=r.xy+L*r.zw*1.1;float sh=exp(-pow(dot(p-sp,vec2(.7071))/(70.*D),2.));
 vec2 o=uv-vec2(-1.6,-1.2)-L*.35;float rays=.5+.5*sin(atan(o.y,o.x)*110.);
 c+=(spectrum(fract(length(o)*.32+dot(L,vec2(.2,.12))+rays*.035))-.5)*I*(.2+.8*sh)*(.8+.2*rays);
 c+=sh*S+(hash(floor(p/(1.4*D)))-.5)*.02;
 c+=(1.-smoothstep(0.,1.6*D,-sdRB(p,r)))*.22;return clamp(c,0.,1.);}
void main(){vec2 p=gl_FragCoord.xy;float t=W<0.?2.:W*1.15;
 float s=wipe(p,N);float m=inside(p,N)*smoothstep(s-.05,s,t);
 float front=exp(-pow((s-t)/.025,2.))*inside(p,N)*step(W,.999)*step(0.,W);
 vec3 c=foil(p,N)+front*.6;float a=max(m,front*.8);
 if(W>=0.&&W<1.){float so=wipe(p,O);float mo=inside(p,O)*(1.-smoothstep(so-.05,so,t));if(mo>a){c=foil(p,O);a=mo;}}
 gl_FragColor=vec4(c*a,a);}`

type Engine = { select: (index: number) => void; refinish: () => void }

/*
 * Radio cards whose chosen card is struck in holographic foil (foil-cards.css).
 * Choosing one wipes the foil off the old card and onto the new along a bright
 * edge. Resting the pointer on the chosen card turns its sheen toward the
 * pointer, a rainbow running through it as through real foil; leaving, it
 * eases back to the top left. Four finishes: red, black, silver and gold.
 *
 * Built to cost nothing at rest. The canvas draws only when something changes
 * (a pick, the sheen easing, a resize), keeps its last frame otherwise, clips
 * each frame to the card(s) it touches, and stops off screen. Passing over the
 * card does nothing; the sheen waits for the pointer to settle. Touch gets the
 * foil and the wipe, not the sheen. Real radios in a fieldset, so arrow keys
 * move the choice and it submits with a form. Reduced motion holds the foil
 * still; without WebGL it is a still CSS foil.
 */
export function FoilCards({
  label,
  options,
  value,
  defaultValue,
  onChange,
  finish = 'silver',
  name,
  className = '',
}: FoilCardsProps) {
  const [own, setOwn] = useState(defaultValue ?? options[0]?.value)
  // Bumped when the browser restores a lost WebGL context, to build the scene again.
  const [epoch, setEpoch] = useState(0)
  const current = value ?? own
  const index = options.findIndex((o) => o.value === current)
  const fallbackName = useId()
  const root = useRef<HTMLFieldSetElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const engine = useRef<Engine | null>(null)
  /* What the engine reads at mount; the effects below keep it told. */
  const live = useRef({ index, finish })
  useEffect(() => {
    live.current = { index, finish }
  })

  useEffect(() => {
    const el = root.current
    const cv = canvas.current
    if (!el || !cv) return
    const gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' })
    if (!gl || gl.isContextLost()) {
      el.dataset.gl = 'off'
      return
    }
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
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      el.dataset.gl = 'off'
      return
    }
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.enable(gl.SCISSOR_TEST)
    const u: Record<string, WebGLUniformLocation | null> = {}
    for (const n of ['N', 'O', 'L', 'C0', 'C1', 'C2', 'C3', 'W', 'I', 'S', 'D', 'R']) u[n] = gl.getUniformLocation(program, n)

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let now = live.current.index
    let before = now
    let wipeAt = -1
    let ratio = 1
    let rects: number[][] = []
    let raf = 0
    let visible = false
    let alive = true
    let look = REST.slice()
    let aim = REST.slice()

    const cards = () => [...el.querySelectorAll<HTMLElement>('.wui-foil-card')]
    const measure = () => {
      ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      cv.width = Math.max(1, Math.round(el.clientWidth * ratio))
      cv.height = Math.max(1, Math.round(el.clientHeight * ratio))
      const list = cards()
      rects = list.map((c) => [(c.offsetLeft + c.offsetWidth / 2) * ratio, cv.height - (c.offsetTop + c.offsetHeight / 2) * ratio, (c.offsetWidth / 2) * ratio, (c.offsetHeight / 2) * ratio])
      gl.uniform1f(u.R!, (parseFloat(getComputedStyle(list[0] ?? el).borderTopLeftRadius) || 0) * ratio)
      gl.uniform1f(u.D!, ratio)
    }
    const refinish = () => {
      const f = FINISHES[live.current.finish] ?? FINISHES.silver
      f.stops.forEach((c, i) => gl.uniform3f(u['C' + i]!, c[0]!, c[1]!, c[2]!))
      gl.uniform1f(u.I!, f.iri)
      gl.uniform1f(u.S!, f.sheen)
    }
    /* Clip a frame to the card(s) it touches, plus a couple of pixels. */
    const clip = (list: number[][]) => {
      const x0 = Math.min(...list.map((r) => r[0]! - r[2]!)) - 2
      const x1 = Math.max(...list.map((r) => r[0]! + r[2]!)) + 2
      const y0 = Math.min(...list.map((r) => r[1]! - r[3]!)) - 2
      const y1 = Math.max(...list.map((r) => r[1]! + r[3]!)) + 2
      gl.scissor(Math.max(0, Math.floor(x0)), Math.max(0, Math.floor(y0)), Math.ceil(x1 - x0), Math.ceil(y1 - y0))
    }

    const frame = (t: number) => {
      raf = 0
      const n = rects[now]
      if (!n) return
      let w = -1
      if (wipeAt >= 0) {
        w = Math.min(1, (t - wipeAt) / WIPE)
        if (w >= 1) wipeAt = -1
      }
      look[0] = look[0]! + (aim[0]! - look[0]!) * 0.16
      look[1] = look[1]! + (aim[1]! - look[1]!) * 0.16
      const settled = Math.abs(aim[0]! - look[0]!) < 0.002 && Math.abs(aim[1]! - look[1]!) < 0.002
      if (settled) look = aim.slice()
      const o = rects[before] ?? n
      gl.viewport(0, 0, cv.width, cv.height)
      clip(w >= 0 && o !== n ? [n, o] : [n])
      gl.uniform4f(u.N!, n[0]!, n[1]!, n[2]!, n[3]!)
      gl.uniform4f(u.O!, o[0]!, o[1]!, o[2]!, o[3]!)
      gl.uniform1f(u.W!, w)
      gl.uniform2f(u.L!, look[0]!, look[1]!)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      el.dataset.gl = 'on'
      if (alive && visible && (wipeAt >= 0 || !settled)) raf = requestAnimationFrame(frame)
    }
    /* The canvas keeps its last frame, so a frame is asked for only on change. */
    const kick = () => {
      if (!raf && alive && visible) raf = requestAnimationFrame(frame)
    }

    measure()
    refinish()
    engine.current = {
      select: (i) => {
        if (i === now) return
        before = now
        now = i
        aim = REST.slice()
        wipeAt = still ? -1 : performance.now()
        kick()
      },
      refinish: () => {
        refinish()
        kick()
      },
    }

    const seen = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting
      kick()
    })
    seen.observe(el)
    const resize = new ResizeObserver(() => {
      measure()
      kick()
    })
    resize.observe(el)

    /* The sheen follows the pointer only over the chosen card, and only once
       it has rested there: passing over on the way somewhere else does nothing. */
    let enteredAt = -1
    let last: number[] | null = null
    let pending = 0
    const follow = () => {
      pending = 0
      const next = last && enteredAt >= 0 && performance.now() - enteredAt >= INTENT ? last : REST
      if (next[0] !== aim[0] || next[1] !== aim[1]) {
        aim = next.slice()
        kick()
      }
    }
    const move = (event: PointerEvent) => {
      const card = cards()[now]
      if (!card || event.pointerType !== 'mouse') return
      const r = card.getBoundingClientRect()
      const x = ((event.clientX - r.left) / r.width) * 2 - 1
      const y = 1 - ((event.clientY - r.top) / r.height) * 2
      if (Math.abs(x) > 1 || Math.abs(y) > 1) {
        enteredAt = -1
        last = null
        follow()
        return
      }
      if (enteredAt < 0) enteredAt = performance.now()
      last = [x, y]
      if (performance.now() - enteredAt >= INTENT) follow()
      else if (!pending) pending = window.setTimeout(follow, INTENT - (performance.now() - enteredAt))
    }
    const leave = () => {
      enteredAt = -1
      last = null
      window.clearTimeout(pending)
      follow()
    }
    if (!still) {
      el.addEventListener('pointermove', move)
      el.addEventListener('pointerleave', leave)
    }

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      window.clearTimeout(pending)
      cv.removeEventListener('webglcontextlost', lost)
      cv.removeEventListener('webglcontextrestored', restored)
      seen.disconnect()
      resize.disconnect()
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
      engine.current = null
    }
  }, [epoch])

  useEffect(() => {
    if (index >= 0) engine.current?.select(index)
  }, [index])

  useEffect(() => {
    engine.current?.refinish()
  }, [finish])

  return (
    <fieldset
      ref={root}
      data-finish={finish}
      className={`wui-foil ${className}`}
    >
      <legend className="wui-sr-only">{label}</legend>
      <canvas ref={canvas} aria-hidden="true" className="wui-foil-canvas" />
      {options.map((option) => (
        <label key={option.value} className="wui-foil-card">
          <input
            type="radio"
            name={name ?? fallbackName}
            value={option.value}
            checked={option.value === current}
            onChange={() => {
              if (value === undefined) setOwn(option.value)
              onChange?.(option.value)
            }}
            className="wui-foil-input"
          />
          <span className="wui-foil-title">{option.title}</span>
          {option.meta && <span className="wui-foil-meta">{option.meta}</span>}
          {option.description && <span className="wui-foil-description">{option.description}</span>}
        </label>
      ))}
    </fieldset>
  )
}
