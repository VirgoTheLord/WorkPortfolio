'use client'

import { useEffect, useRef, useState, type CSSProperties, type FocusEvent, type ReactNode } from 'react'
import './chrome-upload.css'

type Chrome = 'silver' | 'champagne' | 'rose' | 'glacier' | 'jade' | 'accent'

type ChromeUploadProps = {
  label?: string
  /** The icon before the label. Defaults to a cloud, or an arrow on a link; `false` for none. */
  icon?: ReactNode | false
  /** The face colour, any CSS colour. Defaults to --wui-chrome-face. */
  face?: string
  chrome?: Chrome
  /**
   * Whether the reflection keeps flowing at rest (default). Turn it off to draw
   * only while the pointer is on it or a file is going up, for a page with many
   * of these or a low-power target.
   */
  ambient?: boolean
  className?: string
} & (
  | {
      /** Sends the file. Call `progress` with 0-1 as it goes; resolve when done, reject on failure. */
      upload: (file: File, progress: (fraction: number) => void) => Promise<void>
      /** Where the file comes from. By default the native file picker opens. */
      select?: () => Promise<File | null>
      /** File types for the picker, as the input's accept attribute. */
      accept?: string
      onDone?: (file: File) => void
      onError?: (error: unknown) => void
      href?: never
    }
  | {
      /**
       * Makes it a link in the same chrome: the resting pill alone, with no
       * track and nothing to upload, for a call to action.
       */
      href: string
      upload?: never
      select?: never
      accept?: never
      onDone?: never
      onError?: never
    }
)

/* The chrome's silver tone for each finish, 0-1 RGB. */
const TINTS: Record<Exclude<Chrome, 'accent'>, [number, number, number]> = {
  silver: [0.8, 0.81, 0.84],
  champagne: [0.93, 0.82, 0.62],
  rose: [0.95, 0.75, 0.7],
  glacier: [0.68, 0.84, 0.97],
  jade: [0.6, 0.88, 0.77],
}

const PAD = 64
const HOLD = 1900

const VERTEX = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'

/* P the pill's centre (y up) and half size, D pixel ratio, F the reflection's
   phase, S how hard it runs (0-1), H hover 0-1 and M the pointer, Z the
   border sweep and W the face wash (0-1, negative when idle). F0 and F1 are
   the face's top and bottom, RIM and LIP the chrome's dark and silver tones. */
const FRAGMENT = `precision highp float;
uniform vec2 M;uniform vec4 P;uniform float D,F,S,H,Z,W;uniform vec3 F0,F1,RIM,LIP;
float sdPill(vec2 p,vec2 h){float r=h.y;vec2 q=vec2(max(abs(p.x)-(h.x-r),0.),p.y);return length(q)-r;}
vec3 spectrum(float x){return clamp(vec3(1.5-abs(x*3.-.4)*1.6,1.3-abs(x*3.-1.4)*1.5,1.5-abs(x*3.-2.5)*1.6),0.,1.);}
float env(float a){a+=.26*sin(2.*a+F*.9)+.1*sin(3.*a-F*1.3);
 return .5+.5*(.82*cos(a-F*.8)+.18*cos(2.*a-F*.4+1.3));}
float adiff(float a,float b){return abs(mod(a-b+3.14159265,6.2831853)-3.14159265);}
void main(){
 vec2 g=gl_FragCoord.xy,p=g-P.xy,h=P.zw;
 float d=sdPill(p,h);
 float aa=.7*D;
 float inside=1.-smoothstep(-1.6*aa,1.2*aa,d);
 float sh=(1.-smoothstep(-2.*D,10.*D,sdPill(p+vec2(0.,3.*D),h)))*.2*(1.-inside);
 float a=atan(p.y/h.y,p.x/max(h.x,1.)*1.6);
 float v=env(a);
 float k=(v-.5)/(.045*(1.+S*.8));
 float glint=exp(-k*k);
 vec3 line=mix(RIM,LIP,smoothstep(.32,.68,v))+glint*(spectrum(.5+k*.3)*.9+.35*exp(-k*k*4.));
 if(Z>=0.){float az=-1.5707963+Z*6.2831853;float f=exp(-pow(adiff(a,az)/.24,2.))*sin(3.14159*Z);line+=f*(spectrum(.5+(a-az)*2.)*.7+.9);}
 line+=H*exp(-dot(g-M,g-M)/(70.*D*70.*D))*.45;
 float yf=clamp(p.y/h.y*.5+.5,0.,1.);
 vec3 face=mix(F1,F0,smoothstep(0.,1.,yf));
 face*=1.-.04*exp(-max(-d-2.*D,0.)/(6.*D));
 if(W>=0.){float ux=p.x/max(h.x,1.)*.5+.5+p.y/h.y*.06;float q=(ux-W*1.5+.25)/.13;
  vec3 cf=mix(RIM,LIP*1.08,smoothstep(-.6,.9,sin(p.y/h.y*2.4+ux*5.-W*4.)))+exp(-pow(abs(q)-1.15,2.)*10.)*spectrum(.5+sign(q)*.4)*.22;
  face=mix(face,cf,exp(-q*q)*.8);}
 float tt=clamp(-d/(4.4*D),0.,1.);
 vec3 col=mix(face,line,pow(sin(3.14159*pow(tt,.85)),1.6));
 gl_FragColor=vec4(col*inside,inside+sh);}`

/* A colour token resolved to 0-1 RGB, by letting a 2D canvas parse it. */
let parser: CanvasRenderingContext2D | null | undefined
function readColor(el: Element, name: string): [number, number, number] {
  const ctx = (parser ??= document.createElement('canvas').getContext('2d'))
  if (!ctx) return [0.96, 0.96, 0.96]
  ctx.fillStyle = '#f4f4f4'
  ctx.fillStyle = getComputedStyle(el).getPropertyValue(name).trim() || '#f4f4f4'
  const value = String(ctx.fillStyle)
  if (value.startsWith('#')) return [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16) / 255) as [number, number, number]
  const [r = 0, g = 0, b = 0] = (value.match(/[\d.]+/g) ?? []).map(Number)
  return [r / 255, g / 255, b / 255]
}

/* The chrome tinted by --wui-accent: the accent lifted toward white, so it
   still reads as polished metal. A grey accent (ink) stays silver. */
function accentTint(el: Element): [number, number, number] {
  const c = readColor(el, '--wui-accent')
  if (Math.max(...c) - Math.min(...c) < 0.15) return TINTS.silver
  return c.map((x) => x * 0.6 + 0.4) as [number, number, number]
}

type Spring = { x: number; v: number; t: number }
function step(s: Spring, k: number, c: number, dt: number) {
  for (let i = 0; i < 4; i++) {
    s.v += (-k * (s.x - s.t) - c * s.v) * (dt / 4)
    s.x += s.v * (dt / 4)
  }
}

type Phase = 'idle' | 'up' | 'done'
type Face = { id: number; phase: Phase; leaving: boolean }

const CLOUD = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7.5 17.5H7a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 9a4 4 0 0 1-.5 8" />
    <path d="M12 20v-8M9 15l3-3 3 3" />
  </svg>
)
const ARROW = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)
const INFINITY = 'M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4z'

/*
 * An upload button in liquid chrome (chrome-upload.css). A frosted pill sits
 * in a recessed track; its thin border reflects a sweep of dark and silver
 * with prism glints where the two meet, and the light gathers under the
 * pointer. The reflection keeps flowing at rest (at 30 fps; `ambient={false}`
 * holds it still, drawing only while the pointer is on it or a file is going
 * up). Press it and the pill grows along the track as
 * the file goes up, an infinity loader running; at the end a band of chrome
 * washes across the face, a check draws in, and the pill glides home.
 *
 * The pill is a real button (a file can also be dropped on the track); the
 * chrome is one WebGL canvas, drawn only while on screen (and, without `ambient`, only while something changes). Reduced motion
 * holds the chrome still and jumps between sizes. Without WebGL it is a plain
 * pill. Inspired by "Upload Button Shader Exploration" on Dribbble.
 */
export function ChromeUpload({
  upload,
  select,
  href,
  label = href ? 'Open' : 'Upload',
  icon,
  accept,
  face,
  chrome = 'silver',
  onDone,
  onError,
  ambient = true,
  className = '',
}: ChromeUploadProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [faces, setFaces] = useState<Face[]>([{ id: 0, phase: 'idle', leaving: false }])
  const [percent, setPercent] = useState<number | null>(null)
  const [status, setStatus] = useState('')
  const root = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const button = useRef<HTMLButtonElement & HTMLAnchorElement>(null)
  const measurer = useRef<HTMLSpanElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const busy = useRef(false)
  /* What the render loop reads; the handlers below write it. */
  // Bumped when the browser restores a lost WebGL context, to build the scene again.
  const [epoch, setEpoch] = useState(0)
  const ambientRef = useRef(ambient)
  const engine = useRef({ progress: -1, speed: 1, hover: 0, press: 0, mouse: [0, 0], flash: -1, wash: -1, kick: () => {}, recolour: () => {} })

  const show = (next: Phase) => {
    setPhase(next)
    setFaces((list) => [...list.filter((f) => !f.leaving).map((f) => ({ ...f, leaving: true })), { id: Date.now(), phase: next, leaving: false }])
  }

  useEffect(() => {
    if (!faces.some((f) => f.leaving)) return
    const t = window.setTimeout(() => setFaces((list) => list.filter((f) => !f.leaving)), 320)
    return () => window.clearTimeout(t)
  }, [faces])

  useEffect(() => {
    const el = root.current
    const box = track.current
    const canvas = canvasRef.current
    const btn = button.current
    const m = measurer.current
    if (!el || !box || !canvas || !btn || !m) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const e = engine.current
    const width: Spring = { x: 0, v: 0, t: 0 }
    const squash: Spring = { x: 0, v: 0, t: 0 }
    let ratio = 1
    let w0 = 160
    let wMax = 400
    // The pill's inset in the track and its height, as the stylesheet sets them.
    let inset = 8
    let tall = 60
    let phaseAt = Math.random() * 40
    let speed = 1
    let hover = 0
    let raf = 0
    let last = 0
    let onScreen = false
    let alive = true
    let lastW = ''
    let lastScale = ''
    let busy = true
    let colours = { face0: [1, 1, 1], face1: [0.93, 0.93, 0.93], rim: [0.24, 0.24, 0.26], lip: TINTS.silver }

    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' })
    const lost = (event: Event) => event.preventDefault()
    const restored = () => setEpoch((n) => n + 1)
    canvas.addEventListener('webglcontextlost', lost)
    canvas.addEventListener('webglcontextrestored', restored)
    let program: WebGLProgram | null = null
    const loc: Record<string, WebGLUniformLocation | null> = {}
    if (gl && !gl.isContextLost()) {
      const shader = (type: number, source: string) => {
        const s = gl.createShader(type)!
        gl.shaderSource(s, source)
        gl.compileShader(s)
        return s
      }
      program = gl.createProgram()!
      gl.attachShader(program, shader(gl.VERTEX_SHADER, VERTEX))
      gl.attachShader(program, shader(gl.FRAGMENT_SHADER, FRAGMENT))
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) program = null
      else {
        gl.useProgram(program)
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
        gl.enableVertexAttribArray(0)
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
        for (const name of ['P', 'D', 'F', 'S', 'H', 'M', 'Z', 'W', 'F0', 'F1', 'RIM', 'LIP']) loc[name] = gl.getUniformLocation(program, name)
      }
    }
    if (program) el.dataset.gl = ''
    let coloursDirty = true

    /* Everything the shader and label need, from the face colour and the tint. */
    e.recolour = () => {
      const c = readColor(el, '--wui-chrome-face')
      const light = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2] > 0.45
      const tint = el.dataset.chrome === 'accent' ? accentTint(el) : (TINTS[el.dataset.chrome as keyof typeof TINTS] ?? TINTS.silver)
      const fit = (x: number) => Math.min(1, Math.max(0, x))
      colours = {
        face0: c.map((x) => fit(x + (light ? 0.03 : 0.05))),
        face1: c.map((x) => fit(x * (light ? 0.94 : 0.82))),
        rim: c.map((x, i) => fit(x * (light ? 0.26 : 0.55) * 0.8 + tint[i]! * 0.06)),
        lip: light ? tint : (tint.map((x) => x * 0.92) as [number, number, number]),
      }
      el.dataset.tone = light ? 'light' : 'dark'
      coloursDirty = true
      e.kick()
    }

    const measure = () => {
      ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      inset = btn.offsetTop
      tall = btn.offsetHeight
      w0 = Math.ceil(m.offsetWidth) + PAD * (tall / 60)
      // A link is the resting pill alone: its track hugs it.
      if ('bare' in el.dataset) el.style.setProperty('--wui-chrome-width', `${w0 + inset * 2}px`)
      canvas.width = Math.max(2, Math.round(box.clientWidth * ratio))
      canvas.height = Math.max(2, Math.round(box.clientHeight * ratio))
      wMax = Math.max(w0, box.clientWidth - inset * 2)
      if (!width.x) width.x = w0
    }

    const draw = () => {
      if (!gl || !program) return
      gl.useProgram(program)
      gl.viewport(0, 0, canvas.width, canvas.height)
      const s = squash.x
      gl.uniform4f(loc.P!, (inset + width.x / 2) * ratio, canvas.height / 2, (width.x / 2) * (1 - 0.015 * s) * ratio, (tall / 2) * (1 - 0.05 * s) * ratio)
      gl.uniform1f(loc.D!, ratio)
      gl.uniform1f(loc.F!, phaseAt)
      gl.uniform1f(loc.S!, Math.max(0, speed - 1) / 1.4)
      gl.uniform1f(loc.H!, hover)
      gl.uniform2f(loc.M!, e.mouse[0]!, e.mouse[1]!)
      gl.uniform1f(loc.Z!, e.flash)
      gl.uniform1f(loc.W!, e.wash)
      if (coloursDirty) {
        gl.uniform3fv(loc.F0!, colours.face0)
        gl.uniform3fv(loc.F1!, colours.face1)
        gl.uniform3fv(loc.RIM!, colours.rim)
        gl.uniform3fv(loc.LIP!, colours.lip)
        coloursDirty = false
      }
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const frame = (now: number) => {
      // At rest, the ambient flow draws at 30 fps: a slow drift does not show the difference.
      if (!busy && ambientRef.current && last && now - last < 32) {
        raf = alive && onScreen && !still ? requestAnimationFrame(frame) : 0
        return
      }
      const dt = Math.min(0.05, (now - (last || now)) / 1000)
      last = now
      width.t = e.progress < 0 ? w0 : w0 + e.progress * (wMax - w0)
      squash.t = e.press
      if (still) {
        width.x = width.t
        squash.x = squash.t
        hover = e.hover
        e.flash = e.wash = -1
      } else {
        step(width, 120, 18, dt)
        step(squash, 520, 26, dt)
        hover += (e.hover - hover) * Math.min(1, dt * 7)
        speed += (e.speed - speed) * Math.min(1, dt * 1.6)
        phaseAt += dt * speed
        if (e.flash >= 0) e.flash = e.flash + dt / 1.3 > 1 ? -1 : e.flash + dt / 1.3
        if (e.wash >= 0) e.wash = e.wash + dt / 1.15 > 1 ? -1 : e.wash + dt / 1.15
      }
      const w = `${width.x.toFixed(2)}px`
      const scale = `scale(${(1 - 0.015 * squash.x).toFixed(4)}, ${(1 - 0.05 * squash.x).toFixed(4)})`
      if (w !== lastW) btn.style.width = lastW = w
      if (scale !== lastScale) btn.style.transform = lastScale = scale
      draw()
      if (!('ready' in el.dataset)) el.dataset.ready = ''
      // Frames run while something is changing (a spring, the hover easing, a
      // transfer, a sweep or a wash) and, when ambient, at rest too. Without
      // ambient the reflection holds still at rest and the loop stops.
      const moving =
        Math.abs(width.x - width.t) > 0.05 ||
        Math.abs(width.v) > 0.05 ||
        Math.abs(squash.x - squash.t) > 0.001 ||
        Math.abs(squash.v) > 0.001 ||
        Math.abs(hover - e.hover) > 0.003 ||
        Math.abs(speed - e.speed) > 0.01
      const active = e.progress >= 0 || e.hover > 0 || e.flash >= 0 || e.wash >= 0
      busy = moving || active
      raf = alive && onScreen && !still && (busy || ambientRef.current) ? requestAnimationFrame(frame) : 0
    }
    e.kick = () => {
      if (!raf && alive) {
        last = 0
        raf = requestAnimationFrame(frame)
      }
    }

    const move = (event: PointerEvent) => {
      const r = box.getBoundingClientRect()
      e.mouse = [(event.clientX - r.left) * ratio, (r.bottom - event.clientY) * ratio]
      if (event.pointerType === 'mouse') e.hover = 1
      e.kick()
    }
    const leave = () => {
      e.hover = 0
      e.press = 0
      e.kick()
    }
    box.addEventListener('pointermove', move)
    box.addEventListener('pointerleave', leave)

    let ready = false
    void document.fonts.ready.then(() => {
      if (!alive) return
      ready = true
      measure()
      width.x = w0
      e.recolour()
    })
    measure()
    e.recolour()
    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = !!entry?.isIntersecting
      if (onScreen) e.kick()
    })
    visibility.observe(el)
    const resize = new ResizeObserver(() => {
      measure()
      e.kick()
    })
    resize.observe(box)
    // A theme or accent set on any ancestor swaps the tokens under the canvas.
    const theme = new MutationObserver(() => ready && e.recolour())
    for (let node = el.parentElement; node; node = node.parentElement) theme.observe(node, { attributeFilter: ['data-theme', 'class', 'style'] })
    const scheme = window.matchMedia('(prefers-color-scheme: dark)')
    const onScheme = () => e.recolour()
    scheme.addEventListener('change', onScheme)

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      raf = 0
      e.kick = () => {}
      box.removeEventListener('pointermove', move)
      box.removeEventListener('pointerleave', leave)
      visibility.disconnect()
      resize.disconnect()
      theme.disconnect()
      scheme.removeEventListener('change', onScheme)
      canvas.removeEventListener('webglcontextlost', lost)
      canvas.removeEventListener('webglcontextrestored', restored)
    }
  }, [epoch])

  useEffect(() => {
    engine.current.recolour()
  }, [face, chrome])

  useEffect(() => {
    ambientRef.current = ambient
    engine.current.kick()
  }, [ambient])

  const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))

  const run = async (file: File) => {
    if (busy.current || !upload) return
    busy.current = true
    const e = engine.current
    e.speed = 2.4
    e.progress = 0
    setPercent(null)
    setStatus(`Uploading ${file.name}`)
    show('up')
    e.kick()
    try {
      await upload(file, (fraction) => {
        const f = Math.min(1, Math.max(0, fraction))
        e.progress = f
        setPercent(Math.round(f * 100))
        e.kick()
      })
      e.progress = 1
      e.kick()
      await wait(380)
      e.speed = 1
      e.flash = 0
      e.wash = 0
      setStatus(`${file.name} uploaded`)
      show('done')
      onDone?.(file)
      await wait(HOLD)
    } catch (error) {
      e.speed = 1
      setStatus(`${file.name} did not upload`)
      onError?.(error)
    }
    e.progress = -1
    e.kick()
    await wait(140)
    show('idle')
    busy.current = false
  }

  const start = async () => {
    if (busy.current || !upload) return
    if (!select) {
      input.current?.click()
      return
    }
    const file = await select()
    if (file) void run(file)
  }

  const content = (p: Phase) => {
    if (p === 'up')
      return (
        <>
          <span className="wui-chrome-icon wui-chrome-infinity" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d={INFINITY} opacity=".22" />
              <path d={INFINITY} pathLength={100} className="wui-chrome-run" />
            </svg>
          </span>
          {percent !== null && <span>{percent}%</span>}
        </>
      )
    if (p === 'done')
      return (
        <span className="wui-chrome-icon wui-chrome-check" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9.5" pathLength={100} />
            <path d="m8 12.4 2.8 2.8 5.2-5.6" pathLength={100} />
          </svg>
        </span>
      )
    return (
      <>
        {icon !== false && (
          <span className="wui-chrome-icon" aria-hidden="true">
            {icon ?? (href ? ARROW : CLOUD)}
          </span>
        )}
        <span>{label}</span>
      </>
    )
  }

  const press = {
    onPointerDown: () => {
      engine.current.press = 1
      engine.current.kick()
    },
    onPointerUp: () => {
      engine.current.press = 0
      engine.current.kick()
    },
    onFocus: (event: FocusEvent<HTMLElement>) => {
      if (!event.currentTarget.matches(':focus-visible')) return
      engine.current.hover = 1
      engine.current.kick()
    },
    onBlur: () => {
      engine.current.hover = 0
      engine.current.kick()
    },
  }

  return (
    <div
      ref={root}
      data-chrome={chrome}
      data-bare={href !== undefined || undefined}
      className={`wui-chrome ${className}`}
      style={face ? ({ '--wui-chrome-face': face } as CSSProperties) : undefined}
    >
      <div
        ref={track}
        className="wui-chrome-track"
        onDragOver={(event) => {
          if (!busy.current && upload) event.preventDefault()
        }}
        onDrop={(event) => {
          event.preventDefault()
          const file = event.dataTransfer.files[0]
          if (file && upload) void run(file)
        }}
      >
        <canvas ref={canvasRef} aria-hidden="true" className="wui-chrome-canvas" />
        {href !== undefined ? (
          <a ref={button} href={href} {...press} className="wui-chrome-pill">
            <span className="wui-chrome-face" data-first>
              {content('idle')}
            </span>
          </a>
        ) : (
          <button
            ref={button}
            type="button"
            aria-busy={phase === 'up' || undefined}
            aria-label={phase === 'idle' ? label : phase === 'up' ? `Uploading${percent !== null ? `, ${percent}%` : ''}` : 'Uploaded'}
            onClick={() => void start()}
            {...press}
            className="wui-chrome-pill"
          >
            {faces.map((f) => (
              <span key={f.id} className="wui-chrome-face" data-first={f.id === 0 || undefined} data-leaving={f.leaving || undefined}>
                {content(f.phase)}
              </span>
            ))}
          </button>
        )}
        <span ref={measurer} className="wui-chrome-face wui-chrome-measure" aria-hidden="true">
          {content('idle')}
        </span>
        {href === undefined && (
          <input
            ref={input}
            type="file"
            accept={accept}
            tabIndex={-1}
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (file) void run(file)
            }}
          />
        )}
      </div>
      <p className="wui-sr-only" aria-live="polite">
        {status}
      </p>
    </div>
  )
}
