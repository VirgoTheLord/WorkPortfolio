'use client'

import Image from 'next/image'
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import type { CompactContent } from '@/types/content'

type Props = CompactContent['alive']

/* The print's size on the GPU; each photo's canvas is this, shown smaller. */
const S = 292
/* Where the strip starts on a phone: the third photo, with photos either side. */
const PHONE_START = 2
/* How long a print takes to develop once it is in the middle, in seconds. */
const DEVELOP = 2.4

const VERTEX =
  'attribute vec2 a;varying vec2 v;void main(){v=a*.5+.5;v.y=1.-v.y;gl_Position=vec4(a,0.,1.);}'

/* An instant print developing (owner's pick): milky grey with a ghost of the
   picture first, then the shadows, then colour with a cool cast that warms,
   unevenly, the edges last as the chemistry spreads in from the pod. Grain
   and a soft corner fall-off throughout; once developed, a band of gloss
   follows the pointer across the print. */
const FRAGMENT = `precision mediump float;varying vec2 v;uniform sampler2D T;uniform float dev,seed,gloss;uniform vec2 L;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
float fb(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*n(p);p*=2.1;a*=.5;}return s;}
void main(){vec3 c=texture2D(T,v).rgb;float lum=dot(c,vec3(.299,.587,.114));
float edge=min(min(v.x,1.-v.x),min(v.y,1.-v.y));float blot=fb(v*4.+seed)*.55+(1.-smoothstep(0.,.18,edge))*.35;
float d=smoothstep(0.,1.,clamp(dev*1.7-blot-lum*.35,0.,1.));
vec3 milk=vec3(.24,.26,.28)+vec3(.05,.06,.07)*fb(v*9.+seed);vec3 ghost=mix(milk,vec3(lum)*.55+.12,.18*dev);
vec3 tint=c*vec3(.86,.98,1.08)+vec3(0.,.02,.05);vec3 col=mix(ghost,mix(tint,c,smoothstep(.55,1.,d)),d);
col+=(h(v*vec2(311.,173.)+seed)-.5)*.05;col*=1.-.18*pow(length(v-.5)*1.25,2.5);
if(gloss>0.){vec2 q=v-L;float band=exp(-pow(dot(q,normalize(vec2(1.,-.8)))*7.,2.))*exp(-dot(q,q)*1.2);col+=band*.22*gloss*d;}
gl_FragColor=vec4(col,1.);}`

type Print = {
  ctx: CanvasRenderingContext2D
  tex: WebGLTexture | null
  dev: number
  rate: number
  gloss: number
  hover: boolean
  lx: number
  ly: number
  seed: number
}

/*
 * Stuff that brings me alive (owner's pick: the film strip): instant photos in
 * a row that scrolls and swipes sideways, snapping one into the middle; the
 * one in the middle straightens up and develops, and a tap turns a photo over
 * to the note on its back (a tap on one to the side brings it to the middle).
 * Arrows, the arrow keys and a mouse drag move along it too.
 *
 * One WebGL context develops every print: each is drawn there and copied onto
 * its own canvas, and only while one is developing or its gloss is moving.
 * Without WebGL, or with reduced motion, the photos are simply there.
 */
export function PolaroidStrip({ label, prev, next, turn, items }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const strip = useRef<HTMLUListElement>(null)
  const prints = useRef<Print[]>([])
  const developRef = useRef<(i: number) => void>(() => {})
  const glossRef = useRef<(i: number, on: boolean, x?: number, y?: number) => void>(() => {})
  const [current, setCurrent] = useState(0)
  const [turned, setTurned] = useState<readonly number[]>([])

  useEffect(() => {
    const box = root.current
    if (!box || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const glc = document.createElement('canvas')
    glc.width = glc.height = S
    const gl = glc.getContext('webgl', {
      preserveDrawingBuffer: true,
      antialias: false,
      powerPreference: 'low-power',
    })
    if (!gl || gl.isContextLost()) return
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
    if (!vs || !fs || !program) return
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const at = gl.getAttribLocation(program, 'a')
    gl.enableVertexAttribArray(at)
    gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0)
    gl.viewport(0, 0, S, S)
    const u = {
      dev: gl.getUniformLocation(program, 'dev'),
      seed: gl.getUniformLocation(program, 'seed'),
      gloss: gl.getUniformLocation(program, 'gloss'),
      L: gl.getUniformLocation(program, 'L'),
    }

    const paint = (p: Print) => {
      if (!p.tex) return
      gl.bindTexture(gl.TEXTURE_2D, p.tex)
      gl.uniform1f(u.dev, p.dev)
      gl.uniform1f(u.seed, p.seed)
      gl.uniform1f(u.gloss, p.gloss)
      gl.uniform2f(u.L, p.lx, p.ly)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      p.ctx.drawImage(glc, 0, 0)
    }

    const busy = new Set<Print>()
    let raf = 0
    let last = 0
    const tick = (t: number) => {
      const dt = Math.min(0.05, last ? (t - last) / 1000 : 1 / 60)
      last = t
      for (const p of busy) {
        p.dev = Math.min(1, p.dev + p.rate * dt)
        p.gloss += ((p.hover ? 1 : 0) - p.gloss) * Math.min(1, dt * 8)
        paint(p)
        const glossed = Math.abs((p.hover ? 1 : 0) - p.gloss) < 0.01
        if ((p.dev >= 1 || p.rate === 0) && glossed) busy.delete(p)
      }
      if (busy.size) raf = requestAnimationFrame(tick)
      else {
        raf = 0
        last = 0
      }
    }
    const wake = (p: Print) => {
      busy.add(p)
      if (!raf) raf = requestAnimationFrame(tick)
    }

    // Each photo's own <img> is the texture, once it has loaded.
    const canvases = [...box.querySelectorAll<HTMLCanvasElement>('.cp-pol-print')]
    const images = [...box.querySelectorAll<HTMLImageElement>('.cp-pol-photo')]
    prints.current = canvases.flatMap((canvas, i) => {
      const ctx = canvas.getContext('2d')
      const img = images[i]
      if (!ctx || !img) return []
      const p: Print = {
        ctx,
        tex: null,
        dev: 0,
        rate: 0,
        gloss: 0,
        hover: false,
        lx: 0.5,
        ly: 0.5,
        seed: i * 7.3 + 1,
      }
      const upload = () => {
        const tex = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, tex)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img)
        p.tex = tex
        paint(p)
        canvas.dataset.on = ''
      }
      if (img.complete && img.naturalWidth) upload()
      else img.addEventListener('load', upload, { once: true })
      return [p]
    })
    box.dataset.gl = ''

    developRef.current = (i) => {
      const p = prints.current[i]
      if (!p || p.dev >= 1) return
      p.rate = 1 / DEVELOP
      wake(p)
    }
    glossRef.current = (i, on, x, y) => {
      const p = prints.current[i]
      if (!p || p.dev < 0.3) return
      p.hover = on
      if (x !== undefined && y !== undefined) {
        p.lx = x
        p.ly = y
      }
      wake(p)
    }

    return () => {
      cancelAnimationFrame(raf)
      developRef.current = () => {}
      glossRef.current = () => {}
      delete box.dataset.gl
    }
  }, [])

  // The one in the middle, as the strip scrolls; it develops once it settles.
  useEffect(() => {
    const row = strip.current
    if (!row) return
    let settle = 0
    let frame = 0
    const middle = () => {
      frame = 0
      const mid = row.scrollLeft + row.clientWidth / 2
      let best = 0
      let gap = Infinity
      ;[...row.children].forEach((child, i) => {
        const el = child as HTMLElement
        const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid)
        if (d < gap) {
          gap = d
          best = i
        }
      })
      setCurrent(best)
      window.clearTimeout(settle)
      settle = window.setTimeout(() => developRef.current(best), 140)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(middle)
    }
    // On a phone the strip starts on the third photo (owner's call), so there
    // are photos either side to swipe to; on a wide screen it starts on the first.
    const start = row.children[PHONE_START] as HTMLElement | undefined
    if (start && window.matchMedia('(max-width: 40rem)').matches) {
      row.scrollLeft = start.offsetLeft + start.offsetWidth / 2 - row.clientWidth / 2
      setCurrent(PHONE_START)
    }
    // Develop the one in the middle only once the strip is on screen.
    const seen = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) middle()
      },
      { threshold: 0.4 },
    )
    seen.observe(row)
    row.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      seen.disconnect()
      row.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
      window.clearTimeout(settle)
    }
  }, [])

  const go = (i: number) => {
    const row = strip.current
    const el = row?.children[Math.max(0, Math.min(items.length - 1, i))] as HTMLElement | undefined
    if (!row || !el) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    row.scrollTo({
      left: el.offsetLeft + el.offsetWidth / 2 - row.clientWidth / 2,
      behavior: still ? 'auto' : 'smooth',
    })
  }

  const press = (i: number) => {
    if (i !== current) return go(i)
    setTurned((now) => (now.includes(i) ? now.filter((n) => n !== i) : [...now, i]))
    developRef.current(i)
  }

  // A mouse can drag the strip; a tap stays a tap.
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null)
  const down = (event: PointerEvent<HTMLUListElement>) => {
    if (event.pointerType !== 'mouse' || !strip.current) return
    drag.current = { x: event.clientX, left: strip.current.scrollLeft, moved: false }
  }
  const move = (event: PointerEvent<HTMLUListElement>) => {
    const d = drag.current
    const row = strip.current
    if (!d || !row) return
    const dx = event.clientX - d.x
    if (!d.moved && Math.abs(dx) < 6) return
    if (!d.moved) {
      d.moved = true
      row.setPointerCapture(event.pointerId)
      row.dataset.dragging = ''
    }
    row.scrollLeft = d.left - dx
  }
  const up = () => {
    const d = drag.current
    drag.current = null
    if (!d?.moved || !strip.current) return
    delete strip.current.dataset.dragging
    go(current)
  }
  const keys = (event: KeyboardEvent<HTMLUListElement>) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (!step) return
    event.preventDefault()
    go(current + step)
    const target = strip.current?.children[current + step]?.querySelector('button')
    target?.focus({ preventScroll: true })
  }

  return (
    <div
      ref={root}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className="cp-strip"
    >
      <ul
        ref={strip}
        className="cp-strip-row"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onKeyDown={keys}
      >
        {items.map((item, i) => (
          <li key={item.title} className="cp-strip-slot" data-on={i === current || undefined}>
            <button
              type="button"
              className="cp-pol"
              aria-pressed={turned.includes(i)}
              aria-label={`${item.title}: ${turn}`}
              data-turned={turned.includes(i) || undefined}
              onClick={(event) => {
                // The click that ends a drag is not a tap.
                if (strip.current?.dataset.dragging !== undefined) return event.preventDefault()
                press(i)
              }}
              onPointerEnter={(event) => {
                if (event.pointerType === 'mouse') glossRef.current(i, true)
              }}
              onPointerLeave={() => glossRef.current(i, false)}
              onPointerMove={(event) => {
                if (event.pointerType !== 'mouse') return
                const b = event.currentTarget.querySelector('canvas')?.getBoundingClientRect()
                if (b)
                  glossRef.current(
                    i,
                    true,
                    (event.clientX - b.left) / b.width,
                    (event.clientY - b.top) / b.height,
                  )
              }}
            >
              <span className="cp-pol-in">
                <span className="cp-pol-face">
                  <span className="cp-pol-window">
                    <Image
                      src={item.image}
                      alt={item.alt}
                      sizes="10rem"
                      draggable={false}
                      className="cp-pol-photo"
                    />
                    <canvas width={S} height={S} aria-hidden="true" className="cp-pol-print" />
                  </span>
                  <span className="cp-pol-title">{item.title}</span>
                </span>
                <span className="cp-pol-face cp-pol-back">
                  <span className="cp-pol-note">{item.note}</span>
                  <span className="cp-pol-stamp">
                    <b>{item.stamp[0]}</b>
                    <span>{item.stamp[1]}</span>
                  </span>
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div className="cp-strip-ctrls">
        <button
          type="button"
          aria-label={prev}
          className="cp-strip-key"
          disabled={current === 0}
          onClick={() => go(current - 1)}
        >
          ←
        </button>
        <span aria-hidden="true" className="cp-strip-dots">
          {items.map((item, i) => (
            <i key={item.title} data-on={i === current || undefined} />
          ))}
        </span>
        <button
          type="button"
          aria-label={next}
          className="cp-strip-key"
          disabled={current === items.length - 1}
          onClick={() => go(current + 1)}
        >
          →
        </button>
      </div>
    </div>
  )
}
