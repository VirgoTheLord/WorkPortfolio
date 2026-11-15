'use client'

import { useEffect, useRef, useSyncExternalStore } from 'react'
import { readTheme, subscribeTheme, switchTheme } from '@/lib/theme'
import type { CompactContent } from '@/types/content'

const none = () => null

const VERTEX = 'attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }'

/* A sun drawn in contour lines, in red inside the shape and the text colour
   outside, with a solid core and eight short rays; a second disc slides
   across and cuts it to a crescent as the rays draw in (S, 0 light to 1
   dark). K is how many lines a unit holds, set so they stay about four
   CSS pixels apart at any size; H drifts them while the pointer rests. */
const FRAGMENT = `precision mediump float;
uniform vec2 R; uniform float S, H, D, K; uniform vec3 FG, RED;
void main(){
  vec2 p = (gl_FragCoord.xy - .5 * R) / R.y;
  float r = length(p);
  float sun = r - .3;
  float cut = length(p - vec2(mix(.9, .16, S), .1)) - .27;
  float f = max(sun, -cut);
  float line = abs(fract(f * K - H * .6) - .5);
  float w = .55 * D * K / R.y, aa = .6 * D * K / R.y;
  float m = smoothstep(w + aa, w - aa, line) * smoothstep(.2, .1, abs(f + .02));
  vec3 col = f < 0. ? RED : FG;
  float alpha = m;
  // The sun's own: a solid core, and eight short rays round it, which draw in
  // as the moon comes (and turn a little while the pointer rests).
  float px = D / R.y;
  float lit = 1. - smoothstep(0., .55, S);
  float core = smoothstep(.13 * lit + px, .13 * lit - px, r);
  float ang = atan(p.y, p.x) + H * .35;
  float k = 8.;
  float arc = abs(fract(ang / 6.28318 * k) - .5) * 6.28318 / k * r;
  float reach = mix(.47, .36, S);
  float ray = smoothstep(1.1 * px + px, 1.1 * px - px, arc)
    * smoothstep(.36, .38, r) * smoothstep(reach + px, reach - px, r) * lit;
  float sunny = max(core, ray);
  col = mix(col, RED, sunny);
  alpha = max(alpha, sunny);
  gl_FragColor = vec4(col * alpha, alpha);
}`

/* The pointer must rest on the switch this long before the lines drift. */
const INTENT = 180

/*
 * The compact site's light/dark switch (owner's pick, November 2026, from ten
 * WebGL switches): a sun drawn in contour lines that morphs into a crescent
 * moon for the dark, the lines drifting while a mouse rests on it.
 *
 * Built to cost nothing at rest: it draws only while the shape or the drift
 * eases toward its target, keeps its last frame, and stops off screen. A real
 * switch (role="switch") once the mode is known; before that, and without
 * WebGL, a still CSS drawing of the same shape stands in (compact.css, keyed
 * off <html>'s mode). One choice with the full site's switch (lib/theme.ts);
 * the new mode opens as a circle from the switch.
 */
export function ContourSwitch({ label }: CompactContent['theme']) {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, none)
  const root = useRef<HTMLButtonElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const target = useRef<{ dark: boolean; set?: (dark: boolean) => void }>({ dark: false })

  // Declared before the engine, so the engine starts from the current mode.
  useEffect(() => {
    // Unknown (null) until hydration: the engine reads the mode itself then.
    if (theme === null) return
    target.current.dark = theme === 'dark'
    target.current.set?.(theme === 'dark')
  }, [theme])

  useEffect(() => {
    const box = root.current
    const cv = canvas.current
    const mode = target.current
    if (!box || !cv) return
    const gl = cv.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      // Kept, so the browser's snapshots of a theme change (the view
      // transition) hold the drawing instead of an empty canvas.
      preserveDrawingBuffer: true,
      powerPreference: 'low-power',
    })
    if (!gl || gl.isContextLost()) {
      box.dataset.gl = 'off'
      return
    }
    const shader = (type: number, source: string) => {
      const s = gl.createShader(type)
      if (!s) return null
      gl.shaderSource(s, source)
      gl.compileShader(s)
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null
    }
    const vs = shader(gl.VERTEX_SHADER, VERTEX)
    const fs = shader(gl.FRAGMENT_SHADER, FRAGMENT)
    const program = gl.createProgram()
    if (!vs || !fs || !program) {
      box.dataset.gl = 'off'
      return
    }
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      box.dataset.gl = 'off'
      return
    }
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const at = gl.getAttribLocation(program, 'a')
    gl.enableVertexAttribArray(at)
    gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0)
    const u = {
      R: gl.getUniformLocation(program, 'R'),
      S: gl.getUniformLocation(program, 'S'),
      H: gl.getUniformLocation(program, 'H'),
      D: gl.getUniformLocation(program, 'D'),
      K: gl.getUniformLocation(program, 'K'),
      FG: gl.getUniformLocation(program, 'FG'),
      RED: gl.getUniformLocation(program, 'RED'),
    }

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Colour tokens arrive as CSS colours; a 2D context turns them into rgb.
    const probe = document.createElement('canvas').getContext('2d')
    const rgb = (value: string) => {
      if (!probe) return [0, 0, 0] as const
      probe.fillStyle = '#000'
      probe.fillStyle = value
      const hex = probe.fillStyle
      if (hex.startsWith('#')) {
        const n = parseInt(hex.slice(1), 16)
        return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255] as const
      }
      const parts = hex.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0]
      return [parts[0]! / 255, parts[1]! / 255, parts[2]! / 255] as const
    }
    const recolour = () => {
      const style = getComputedStyle(box)
      gl.uniform3fv(u.FG, rgb(style.color))
      gl.uniform3fv(u.RED, rgb(style.getPropertyValue('--color-red').trim() || '#ef3e42'))
    }

    let raf = 0
    let last = 0
    let visible = false
    let alive = true
    // Start where the page already is, so nothing plays on arrival.
    mode.dark = readTheme() === 'dark'
    let s = mode.dark ? 1 : 0
    let h = 0
    let aimH = 0

    const measure = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      cv.width = Math.max(1, Math.round(cv.clientWidth * ratio))
      cv.height = Math.max(1, Math.round(cv.clientHeight * ratio))
      gl.viewport(0, 0, cv.width, cv.height)
      gl.uniform2f(u.R, cv.width, cv.height)
      gl.uniform1f(u.D, ratio)
      gl.uniform1f(u.K, cv.height / (4 * ratio))
    }
    const frame = (time: number) => {
      raf = 0
      const aimS = mode.dark ? 1 : 0
      const dt = Math.min(48, last ? time - last : 16) / 16.67
      last = time
      const ease = (rate: number) => 1 - Math.pow(1 - rate, dt)
      s = still ? aimS : s + (aimS - s) * ease(0.085)
      h = still ? aimH : h + (aimH - h) * ease(0.12)
      const settled = Math.abs(aimS - s) < 0.001 && Math.abs(aimH - h) < 0.001
      if (settled) {
        s = aimS
        h = aimH
      }
      gl.uniform1f(u.S, s)
      gl.uniform1f(u.H, h)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      box.dataset.gl = 'on'
      if (alive && visible && !settled) raf = requestAnimationFrame(frame)
      else last = 0
    }
    const kick = () => {
      if (!raf && alive && visible) raf = requestAnimationFrame(frame)
    }
    /* Draw now, as things stand: in the same task as a mode change, so the
       new snapshot already has the new colours. */
    const paint = () => {
      gl.uniform1f(u.S, s)
      gl.uniform1f(u.H, h)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    measure()
    recolour()
    mode.set = () => kick()

    const seen = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting
      kick()
    })
    seen.observe(box)
    const resize = new ResizeObserver(() => {
      measure()
      kick()
    })
    resize.observe(cv)
    // The text colour follows the mode, so the lines outside the shape do too.
    const modes = new MutationObserver(() => {
      recolour()
      paint()
      kick()
    })
    modes.observe(document.documentElement, { attributeFilter: ['data-theme', 'class'] })
    const scheme = window.matchMedia('(prefers-color-scheme: dark)')
    const onScheme = () => {
      recolour()
      paint()
      kick()
    }
    scheme.addEventListener('change', onScheme)

    /* The drift answers a mouse resting on the switch, never one passing. */
    let timer = 0
    const enter = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      timer = window.setTimeout(() => {
        aimH = 1
        kick()
      }, INTENT)
    }
    const leave = () => {
      window.clearTimeout(timer)
      aimH = 0
      kick()
    }
    if (!still) {
      box.addEventListener('pointerenter', enter)
      box.addEventListener('pointerleave', leave)
    }
    const lost = (event: Event) => {
      event.preventDefault()
      box.dataset.gl = 'off'
    }
    cv.addEventListener('webglcontextlost', lost)

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      window.clearTimeout(timer)
      mode.set = undefined
      seen.disconnect()
      resize.disconnect()
      modes.disconnect()
      scheme.removeEventListener('change', onScheme)
      box.removeEventListener('pointerenter', enter)
      box.removeEventListener('pointerleave', leave)
      cv.removeEventListener('webglcontextlost', lost)
    }
  }, [])

  return (
    <button
      ref={root}
      type="button"
      // A switch must say whether it is on, and the mode is unknown until
      // hydration, so it is a plain button until then.
      role={theme === null ? undefined : 'switch'}
      aria-checked={theme === null ? undefined : theme === 'dark'}
      aria-label={label}
      onClick={(event) => {
        const box = event.currentTarget.getBoundingClientRect()
        switchTheme({ x: box.left + box.width / 2, y: box.top + box.height / 2 })
      }}
      className="cp-contour"
    >
      <canvas ref={canvas} aria-hidden="true" className="cp-contour-canvas" />
      {/* Before the first frame, and without WebGL: the same shape, still. */}
      <svg aria-hidden="true" viewBox="0 0 32 32" className="cp-contour-still">
        <circle cx="16" cy="16" r="9.6" className="cp-contour-sun" />
        <circle cx="16" cy="16" r="6.4" className="cp-contour-sun" />
        <circle cx="16" cy="16" r="4.2" className="cp-contour-core" />
        <path
          d="M16 1.5v3M16 27.5v3M1.5 16h3M27.5 16h3M5.7 5.7l2.1 2.1M24.2 24.2l2.1 2.1M5.7 26.3l2.1-2.1M24.2 7.8l2.1-2.1"
          className="cp-contour-rays"
        />
        <circle cx="21.1" cy="12.8" r="8.6" className="cp-contour-cut" />
      </svg>
    </button>
  )
}
