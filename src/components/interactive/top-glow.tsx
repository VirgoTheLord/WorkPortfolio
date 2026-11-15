'use client'

import { useEffect, useRef } from 'react'

const VERTEX = 'attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }'

/* A red glow coming down from the top edge, in grain (owner's pick of four
   textures, November 2026): a broad, soft bloom from the top centre, a few
   slower wisps in it, and the whole broken up by an uneven film grain, like a
   photograph of red light. On white it is a little stronger than on black
   (DARK), where the same red reads brighter. Premultiplied alpha, so it lays over the page colour. */
const FRAGMENT = `precision mediump float;
uniform vec2 R; uniform vec3 RED; uniform float DARK, D;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + 1.), f.x), f.y);
}
float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.03; a *= .5; } return v; }
void main(){
  vec2 uv = gl_FragCoord.xy / R;
  float y = 1. - uv.y;
  float x = (uv.x - .5) * R.x / R.y;
  float bloom = exp(-(x * x * .8 + y * y * 7.));
  float wide = exp(-(x * x * .15 + y * y * 14.)) * .45;
  float wisp = fbm(vec2(x * 1.4, y * .9) + vec2(3.1, 7.7));
  float glow = clamp((bloom * (.7 + .3 * wisp) + wide) * smoothstep(.75, .1, y), 0., 1.);
  float grain = hash(floor(gl_FragCoord.xy / (1.5 * D)));
  float clump = fbm(gl_FragCoord.xy / (6. * D));
  float a = glow * mix(.24, .2, DARK) * (.55 + .9 * grain * clump);
  gl_FragColor = vec4(RED * a, a);
}`

/*
 * The compact site's top: a red glow coming down from the top of the page
 * (owner's request, November 2026, so the space above the name feels used),
 * on desktop and phone alike. Decoration only: it answers nothing and moves
 * nothing. It draws once, and again only when the page is resized or the mode
 * changes; without WebGL there is simply no glow. Fades in on its first frame.
 */
export function TopGlow() {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = canvas.current
    if (!cv) return
    const gl = cv.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: true,
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
    const u = {
      R: gl.getUniformLocation(program, 'R'),
      RED: gl.getUniformLocation(program, 'RED'),
      DARK: gl.getUniformLocation(program, 'DARK'),
      D: gl.getUniformLocation(program, 'D'),
    }

    // Colour tokens arrive as CSS colours; a 2D context turns them into rgb.
    const probe = document.createElement('canvas').getContext('2d')
    const rgb = (value: string) => {
      if (!probe) return [0.937, 0.243, 0.259]
      probe.fillStyle = '#000'
      probe.fillStyle = value
      const n = parseInt(probe.fillStyle.slice(1), 16)
      return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
    }

    let raf = 0
    const draw = () => {
      raf = 0
      // Full pixels (to 1.5×): the grain is the texture, and it is drawn once.
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      const width = Math.max(1, Math.round(cv.clientWidth * ratio))
      const height = Math.max(1, Math.round(cv.clientHeight * ratio))
      if (cv.width !== width || cv.height !== height) {
        cv.width = width
        cv.height = height
      }
      const style = getComputedStyle(cv)
      const bg = rgb(style.getPropertyValue('--color-bg').trim() || '#ffffff')
      const dark = (bg[0]! + bg[1]! + bg[2]!) / 3 < 0.5 ? 1 : 0
      gl.viewport(0, 0, width, height)
      gl.uniform2f(u.R, width, height)
      gl.uniform1f(u.D, ratio)
      gl.uniform1f(u.DARK, dark)
      gl.uniform3fv(u.RED, rgb(style.getPropertyValue('--color-red').trim()))
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      cv.dataset.gl = 'on'
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(draw)
    }

    draw()
    const resize = new ResizeObserver(kick)
    resize.observe(cv)
    // The mode is a class or attribute on <html> (lib/theme.ts), or the system's.
    const modes = new MutationObserver(draw)
    modes.observe(document.documentElement, { attributeFilter: ['data-theme'] })
    const scheme = window.matchMedia('(prefers-color-scheme: dark)')
    scheme.addEventListener('change', kick)

    return () => {
      cancelAnimationFrame(raf)
      resize.disconnect()
      modes.disconnect()
      scheme.removeEventListener('change', kick)
    }
  }, [])

  return <canvas ref={canvas} aria-hidden="true" className="cp-glow" />
}
