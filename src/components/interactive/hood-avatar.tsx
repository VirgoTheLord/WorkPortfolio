'use client'

import { useEffect, useRef } from 'react'
import type { CompactContent } from '@/types/content'

const VERTEX = 'attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }'

/* The drawing as a two-plate print: a red plate (what is red in the drawing)
   and a black plate (what is dark), on paper with a little grain. H pushes
   the plates apart along one diagonal, the way a press drifts out of
   register. Colours come in as uniforms from the site's tokens. */
const FRAGMENT = `precision mediump float;
uniform sampler2D T; uniform vec2 R; uniform float H, D; uniform vec3 PAPER, RED, INK;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float lum(vec3 c){ return dot(c, vec3(.299, .587, .114)); }
float redness(vec3 c){ return clamp((c.r - (c.g + c.b) * .5) * 1.8, 0., 1.); }
void main(){
  vec2 u = gl_FragCoord.xy / R; u.y = 1. - u.y;
  vec2 off = vec2(.024, -.018) * H;
  vec3 a = texture2D(T, u + off).rgb, b = texture2D(T, u - off * .6).rgb;
  float grain = hash(floor(gl_FragCoord.xy / D)) * .14;
  vec3 col = PAPER;
  col *= mix(vec3(1.), RED, clamp(redness(a) - grain, 0., 1.));
  col *= mix(vec3(1.), INK, clamp((1. - lum(b)) * step(redness(b), .3) - grain, 0., 1.));
  gl_FragColor = vec4(col, 1.);
}`

/* The pointer must rest on the picture this long before the plates slip. */
const INTENT = 180

/*
 * The profile picture (owner's pick, November 2026): the hood drawing
 * (content/profile/hood.svg), printed in WebGL as a red plate and a black
 * plate. Resting the pointer on it slips the plates out of register, and they
 * spring back with a thump when it leaves: the same press the name uses.
 *
 * It draws once when it comes into view, then only while the plates move. The
 * drawing itself, as a plain image, stands in before the first frame and
 * without WebGL (compact.css). Decoration beside the name it pictures, so it
 * is hidden from assistive tech.
 */
export function HoodAvatar({ image }: CompactContent['intro']['avatar']) {
  const root = useRef<HTMLSpanElement>(null)
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
    const uH = gl.getUniformLocation(program, 'H')

    // Colour tokens arrive as CSS colours; a 2D context turns them into rgb.
    const probe = document.createElement('canvas').getContext('2d')
    const rgb = (value: string) => {
      if (!probe) return [0, 0, 0]
      probe.fillStyle = '#000'
      probe.fillStyle = value
      const n = parseInt(probe.fillStyle.slice(1), 16)
      return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
    }
    const style = getComputedStyle(box)
    gl.uniform3fv(
      gl.getUniformLocation(program, 'PAPER'),
      rgb(style.getPropertyValue('--color-card-paper').trim() || '#f4f3f2'),
    )
    gl.uniform3fv(
      gl.getUniformLocation(program, 'RED'),
      rgb(style.getPropertyValue('--color-red').trim()),
    )
    gl.uniform3fv(
      gl.getUniformLocation(program, 'INK'),
      rgb(style.getPropertyValue('--color-black').trim()),
    )

    let raf = 0
    let alive = true
    let visible = false
    let ready = false
    let h = 0
    let v = 0
    let aim = 0
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const measure = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      cv.width = Math.max(1, Math.round(cv.clientWidth * ratio))
      cv.height = Math.max(1, Math.round(cv.clientHeight * ratio))
      gl.viewport(0, 0, cv.width, cv.height)
      gl.uniform2f(gl.getUniformLocation(program, 'R'), cv.width, cv.height)
      gl.uniform1f(gl.getUniformLocation(program, 'D'), ratio)
    }
    /* A spring, so the plates come back with a thump rather than an ease. */
    const frame = () => {
      raf = 0
      if (!ready) return
      v += (aim - h) * 0.18 - v * 0.3
      h += v
      const settled = Math.abs(aim - h) < 0.001 && Math.abs(v) < 0.001
      if (settled) {
        h = aim
        v = 0
      }
      gl.uniform1f(uH, h)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      box.dataset.gl = 'on'
      if (alive && visible && !settled) raf = requestAnimationFrame(frame)
    }
    const kick = () => {
      if (!raf && alive && visible) raf = requestAnimationFrame(frame)
    }

    // The drawing, rasterised once at the canvas's size, is the texture.
    const art = new Image()
    art.decoding = 'async'
    art.onload = () => {
      if (!alive) return
      const side = 256
      const raster = document.createElement('canvas')
      raster.width = raster.height = side
      raster.getContext('2d')?.drawImage(art, 0, 0, side, side)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture())
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, raster)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.uniform1i(gl.getUniformLocation(program, 'T'), 0)
      ready = true
      kick()
    }
    art.src = image.src

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

    let timer = 0
    const enter = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      timer = window.setTimeout(() => {
        aim = 1
        kick()
      }, INTENT)
    }
    const leave = () => {
      window.clearTimeout(timer)
      aim = 0
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
      art.onload = null
      cancelAnimationFrame(raf)
      window.clearTimeout(timer)
      seen.disconnect()
      resize.disconnect()
      box.removeEventListener('pointerenter', enter)
      box.removeEventListener('pointerleave', leave)
      cv.removeEventListener('webglcontextlost', lost)
    }
  }, [image.src])

  return (
    <span ref={root} aria-hidden="true" className="cp-avatar">
      {/* eslint-disable-next-line @next/next/no-img-element -- a plain stand-in
          under the canvas; the static export has no image optimiser */}
      <img src={image.src} alt="" className="cp-avatar-still" />
      <canvas ref={canvas} className="cp-avatar-canvas" />
    </span>
  )
}
