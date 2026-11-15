'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import type { CompactContent } from '@/types/content'

const VERTEX = 'attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }'

/* The photo, a little alive. Coordinates are the photo's own (y up): the sun
   sits at (.504, .5625), the horizon's clouds between .39 and .57, the city
   below .36. Over the horizon the air shimmers with heat; the sun's light
   breathes; the city's few lights flicker; the whole has a film grain. The
   picture covers the canvas around its centre, zoomed a hair so the shimmer
   never shows an edge. High precision where there is any: the grain's hash
   breaks at medium. */
const FRAGMENT = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D IMG; uniform vec2 R; uniform float T, D, IA;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + 1.), f.x), f.y);
}
void main(){
  vec2 uv = gl_FragCoord.xy / R;
  float ca = R.x / R.y;
  vec2 vis = (ca > IA ? vec2(1., IA / ca) : vec2(ca / IA, 1.)) / 1.04;
  vec2 p = (1. - vis) * .5 + uv * vis;
  float band = smoothstep(.39, .5, p.y) * smoothstep(.82, .57, p.y);
  p.x += (sin(p.y * 133. + T * 2.) * .0016 + (noise(vec2(p.y * 36., T)) - .5) * .002) * band;
  vec3 c = texture2D(IMG, p).rgb;
  vec2 sd = (p - vec2(.504, .5625)) * vec2(IA, 1.);
  c += vec3(1., .55, .3) * exp(-dot(sd, sd) * 178.) * (.12 + .08 * sin(T * .9));
  float lit = smoothstep(.25, .5, dot(c, vec3(.299, .587, .114))) * step(p.y, .36);
  c *= 1. + lit * (noise(vec2(p.x * 260., p.y * 115. + T * 2.)) - .5) * .8;
  c += (hash(floor(gl_FragCoord.xy / D) + fract(T * 7.)) - .5) * .04;
  gl_FragColor = vec4(c, 1.);
}`

/* Half the display's rate is plenty for a shimmer, and half the battery. */
const FRAME = 1000 / 30

/*
 * The compact home's picture (owner's pick of seven, November 2026): a red sun
 * setting over a city, by Szymon Shields on Unsplash (credited on /legal),
 * made a little alive in WebGL. Home only: the workbench pages share the
 * layout but not the picture.
 *
 * It answers nothing and takes no input. It draws only while on screen, at 30
 * frames a second; with reduced motion it draws one still frame. The photo
 * itself, as a plain image, stands in before the first frame and without
 * WebGL (compact.css).
 */
export function SunsetScene({ image, alt }: CompactContent['intro']['scene']) {
  // The export ends every route in a slash (next.config.ts).
  const home = usePathname().replace(/\/$/, '') === '/compact'
  const root = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const box = root.current
    const cv = canvas.current
    if (!box || !cv) return
    const gl = cv.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
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
    const uT = gl.getUniformLocation(program, 'T')

    let raf = 0
    let alive = true
    let visible = false
    let ready = false
    let last = 0
    const t0 = performance.now()
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const measure = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      cv.width = Math.max(1, Math.round(cv.clientWidth * ratio))
      cv.height = Math.max(1, Math.round(cv.clientHeight * ratio))
      gl.viewport(0, 0, cv.width, cv.height)
      gl.uniform2f(gl.getUniformLocation(program, 'R'), cv.width, cv.height)
      gl.uniform1f(gl.getUniformLocation(program, 'D'), ratio)
    }
    const frame = (now: number) => {
      raf = 0
      if (!ready || !alive) return
      if (now - last >= FRAME || still) {
        last = now
        // A still frame is a moment into the scene, not its first.
        gl.uniform1f(uT, still ? 8 : (now - t0) / 1000)
        gl.drawArrays(gl.TRIANGLES, 0, 3)
        box.dataset.gl = 'on'
      }
      if (visible && !still) raf = requestAnimationFrame(frame)
    }
    const kick = () => {
      if (!raf && alive && (visible || still)) raf = requestAnimationFrame(frame)
    }

    const photo = new Image()
    photo.decoding = 'async'
    photo.onload = () => {
      if (!alive) return
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture())
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, photo)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.uniform1i(gl.getUniformLocation(program, 'IMG'), 0)
      gl.uniform1f(gl.getUniformLocation(program, 'IA'), photo.naturalWidth / photo.naturalHeight)
      ready = true
      kick()
    }
    photo.src = image.src

    measure()
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
    const lost = (event: Event) => {
      event.preventDefault()
      box.dataset.gl = 'off'
    }
    cv.addEventListener('webglcontextlost', lost)

    return () => {
      alive = false
      photo.onload = null
      cancelAnimationFrame(raf)
      seen.disconnect()
      resize.disconnect()
      cv.removeEventListener('webglcontextlost', lost)
    }
  }, [image.src, home])

  if (!home) return null
  return (
    <div ref={root} role="img" aria-label={alt} className="cp-scene">
      {/* eslint-disable-next-line @next/next/no-img-element -- a plain stand-in
          under the canvas; the static export has no image optimiser */}
      <img src={image.src} alt="" className="cp-scene-still" />
      <canvas ref={canvas} className="cp-scene-canvas" />
    </div>
  )
}
