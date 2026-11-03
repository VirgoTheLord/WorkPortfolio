/*
 * The drawing behind the ballpoint button (ballpoint-button.tsx). It builds an
 * SVG of hand-ruled ballpoint lines around the button and runs one small frame
 * loop, only while something moves:
 *
 * - The face is four ruled edges, each gone over three times with less ink on
 *   every pass, overshooting the corners. A pass that lands leaves a dot.
 * - Behind the face, a block runs down and to the right. Its depth is a spring:
 *   15px at rest, 17px on hover, 2px pressed, with a bounce on release. The
 *   block's sides are hatched, then cross-hatched.
 * - When it first scrolls into view the pen rules the face, the block springs up
 *   off the page, and the sides hatch in from the left. data-intro is pending
 *   until then and run while it plays, so the label can wait and fade in with
 *   the rising face rather than jump.
 * - Hover sends a lighter fourth pass round the face, as if firming it up.
 * - replay() plays the intro again on the same drawing: the block sinks flat,
 *   the lines undraw and the label fades (data-intro="out"), then it draws in.
 *
 * Every line's wobble is fixed when it is built, so the corner connectors that
 * stretch as the block moves keep their character instead of boiling. A line
 * only rewrites its path when its ends or its progress change.
 */

const NS = 'http://www.w3.org/2000/svg'

/* Space round the button for the block, the overshoots and the focus loop. */
export const BLEED = 30

const DEPTH = { rest: 15, hover: 17, press: 2 }
const SPRING = { k: 520, c: 16, press: 1400 }
const DIR = Math.SQRT1_2 // the block runs down-right at 45°

/* The ballpoint: three quick passes, each lighter and finer than the last. */
const PASSES = [
  { width: 0.95, opacity: 1 },
  { width: 0.8, opacity: 0.7 },
  { width: 0.7, opacity: 0.45 },
]
const JITTER = 1
const SHIFT = 0.9
const OVER: [number, number] = [1, 4.5]
const HATCH_GAP = 3
const CROSS_GAP = 3.4

/* Intro timing, in ms from when it comes into view. */
const EDGE_STAGGER = 150
const EDGE_MS = 340
const RISE_AT = 680
const HATCH_AT = 820
const HATCH_SPREAD = 520
const HATCH_MS = 130
const INTRO_MS = 1600
/* Replay: how long the old drawing takes to sink and undraw first. */
const OUT_MS = 260
/* A quick click is held this long so the whole throw shows. */
const HOLD_MS = 140

type Pt = [number, number]
type Corner = 'tl' | 'tr' | 'br' | 'bl'
type Params = { n: number; jit: number[]; bow: number; o1: number; o2: number; sh: Pt }

const rng = (seed: number) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296)
const jitter = (r: () => number, a: number) => (r() - 0.5) * 2 * a
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const easeOut = (t: number) => 1 - (1 - t) ** 3
const fmt = (n: number) => n.toFixed(1)

function params(r: () => number, n: number, over: [number, number], jit: number, shift: number): Params {
  const span = over[1] - over[0]
  return {
    n,
    jit: Array.from({ length: n + 1 }, () => jitter(r, jit)),
    bow: jitter(r, jit * 1.2),
    o1: over[0] + r() * span,
    o2: over[0] + r() * span,
    sh: [jitter(r, shift), jitter(r, shift)],
  }
}

/* A line ruled by hand: past both ends, bowed, a little jagged at every segment. */
function ruled(a: Pt, b: Pt, p: Params): Pt[] {
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1
  const ux = dx / len, uy = dy / len
  const ax = a[0] - ux * p.o1 + p.sh[0], ay = a[1] - uy * p.o1 + p.sh[1]
  const bx = b[0] + ux * p.o2 + p.sh[0], by = b[1] + uy * p.o2 + p.sh[1]
  const out: Pt[] = []
  for (let i = 0; i <= p.n; i++) {
    const t = i / p.n
    const off = (i === 0 || i === p.n ? p.jit[i]! * 0.4 : p.jit[i]!) + p.bow * Math.sin(Math.PI * t)
    out.push([ax + (bx - ax) * t - uy * off, ay + (by - ay) * t + ux * off])
  }
  return out
}

/* The first `prog` of a polyline's length. */
function cut(p: Pt[], prog: number): Pt[] {
  if (prog >= 1) return p
  const s = [0]
  for (let i = 1; i < p.length; i++) s.push(s[i - 1]! + Math.hypot(p[i]![0] - p[i - 1]![0], p[i]![1] - p[i - 1]![1]))
  const end = prog * s[s.length - 1]!, out: Pt[] = [p[0]!]
  for (let i = 1; i < p.length; i++) {
    if (s[i]! <= end) { out.push(p[i]!); continue }
    const k = (end - s[i - 1]!) / (s[i]! - s[i - 1]! || 1)
    out.push([p[i - 1]![0] + (p[i]![0] - p[i - 1]![0]) * k, p[i - 1]![1] + (p[i]![1] - p[i - 1]![1]) * k])
    break
  }
  return out
}

const el = <K extends keyof SVGElementTagNameMap>(parent: Element, tag: K, attrs: Record<string, string> = {}) => {
  const node = document.createElementNS(NS, tag)
  for (const k in attrs) node.setAttribute(k, attrs[k]!)
  parent.append(node)
  return node
}

class Stroke {
  prog = 1
  private last = ''
  node: SVGPathElement
  dot?: SVGCircleElement
  constructor(parent: Element, readonly p: Params, width: number, opacity: number, dot = false) {
    this.node = el(parent, 'path', { 'stroke-width': String(width), opacity: String(opacity) })
    if (dot) this.dot = el(parent, 'circle', { r: String(width * 1.15), class: 'wui-ballpoint-dot' })
  }
  draw(a: Pt, b: Pt) {
    const key = `${a[0]},${a[1]},${b[0]},${b[1]},${this.prog}`
    if (key === this.last) return
    this.last = key
    const q = this.prog > 0 ? cut(ruled(a, b, this.p), this.prog) : []
    this.node.setAttribute('d', q.length < 2 ? '' : 'M' + q.map((v) => `${fmt(v[0])} ${fmt(v[1])}`).join('L'))
    if (this.dot) {
      this.dot.setAttribute('cx', fmt(q[0]?.[0] ?? 0))
      this.dot.setAttribute('cy', fmt(q[0]?.[1] ?? 0))
      this.dot.style.opacity = q.length < 2 ? '0' : ''
    }
  }
}

export type Engine = { destroy: () => void; replay: () => void }

export function createEngine(root: HTMLElement, svg: SVGSVGElement, id: string, { intro }: { intro: boolean }): Engine {
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const s = { d: intro && !still ? 0 : DEPTH.rest, v: 0, hover: false, down: false, trace: 0 }
  let introAt = -1 // -1 not started, 0 starting, else the start time
  let introDone = !intro || still
  let raf = 0, last = 0, downAt = 0, holdTimer = 0
  let paint: (t: number) => void = () => {}
  let size = ''
  let outAt = -1 // replay: -1 none, 0 starting, else the start time
  let outFrom = 0
  let out = -1 // replay: how far the old drawing has sunk and undrawn, 0 to 1

  /* ---------- Build the drawing for the button's size ---------- */
  const build = (w: number, h: number) => {
    svg.replaceChildren()
    svg.setAttribute('viewBox', `0 0 ${w + BLEED * 2} ${h + BLEED * 2}`)
    const hw = w / 2, hh = h / 2, cx = hw + BLEED, cy = hh + BLEED
    const corners: Record<Corner, Pt> = { tl: [-hw, -hh], tr: [hw, -hh], br: [hw, hh], bl: [-hw, hh] }
    const r = rng(Math.round(w) * 977 + Math.round(h) * 13)
    const nFor = (len: number) => Math.max(3, Math.round(len / 13))

    const defs = el(svg, 'defs')
    const filter = el(defs, 'filter', { id: `${id}-ink` })
    el(filter, 'feTurbulence', { type: 'fractalNoise', baseFrequency: '0.1', seed: '6', result: 'w' })
    el(filter, 'feDisplacementMap', { in: 'SourceGraphic', in2: 'w', scale: '0.8', xChannelSelector: 'R', yChannelSelector: 'G' })
    const sides = el(el(defs, 'clipPath', { id: `${id}-sides` }), 'polygon')

    const ink = { filter: `url(#${id}-ink)` }
    const gBlock = el(svg, 'g', ink)
    const gHatch = el(gBlock, 'g', { 'clip-path': `url(#${id}-sides)` })
    const gCross = el(gBlock, 'g', { 'clip-path': `url(#${id}-sides)` })
    const gEdges = el(gBlock, 'g')
    const gPaper = el(svg, 'g')
    el(gPaper, 'polygon', { class: 'wui-ballpoint-paper', points: `${-hw},${-hh} ${hw},${-hh} ${hw},${hh} ${-hw},${hh}` })
    const gFace = el(svg, 'g', ink)

    const edges: [Corner, Corner][] = [['tl', 'tr'], ['tr', 'br'], ['br', 'bl'], ['bl', 'tl']]
    const face: { line: Stroke; a: Corner; z: Corner; delay: number }[] = []
    PASSES.forEach((pass, k) =>
      edges.forEach(([a, z], i) => {
        const p = params(r, nFor(i % 2 ? h : w), OVER, JITTER * (1 + k * 0.15), k ? SHIFT : SHIFT * 0.3)
        face.push({ line: new Stroke(gFace, p, pass.width, pass.opacity, k === 0), a, z, delay: i * EDGE_STAGGER + k * 80 })
      }),
    )
    const trace = edges.map(([a, z], i) => ({ line: new Stroke(gFace, params(r, nFor(i % 2 ? h : w), OVER, JITTER * 1.1, SHIFT), 0.75, 0.4), a, z, i }))
    const back: { line: Stroke; a: Corner; z: Corner }[] = []
    const links: { line: Stroke; c: Corner }[] = []
    PASSES.forEach((pass) => {
      back.push(
        { line: new Stroke(gEdges, params(r, nFor(h), OVER, JITTER, SHIFT), pass.width, pass.opacity), a: 'tr', z: 'br' },
        { line: new Stroke(gEdges, params(r, nFor(w), OVER, JITTER, SHIFT), pass.width, pass.opacity), a: 'br', z: 'bl' },
      )
      for (const c of ['tr', 'br', 'bl'] as const) links.push({ line: new Stroke(gEdges, params(r, 2, [0.5, 2], JITTER * 0.6, SHIFT), pass.width, pass.opacity), c })
    })

    // Hatching: quick flicks up and to the right, each a slightly different length.
    const span = h + 48
    const hatch: { line: Stroke; a: Pt; b: Pt; delay: number }[] = []
    for (let x = cx - hw - span; x < cx + hw + 34; x += HATCH_GAP) {
      const y0 = cy + hh + 24 + jitter(r, 2), x0 = x + jitter(r, 0.6), trim = r() * 6
      hatch.push({ line: new Stroke(gHatch, params(r, 5, [0, 2], 0.5, 0), 0.7, 0.9), a: [x0 + trim, y0 - trim], b: [x0 + span, y0 - span], delay: 0 })
    }
    for (let x = cx - hw - 10; x < cx + hw + span + 34; x += CROSS_GAP) {
      const y0 = cy + hh + 24 + jitter(r, 2), x0 = x + jitter(r, 0.6), trim = r() * 6
      hatch.push({ line: new Stroke(gCross, params(r, 5, [0, 2], 0.5, 0), 0.65, 0.7), a: [x0 - trim, y0 - trim], b: [x0 - span, y0 - span], delay: 0 })
    }
    hatch.sort((m, n) => m.a[0] - n.a[0]).forEach((l, i) => (l.delay = HATCH_AT + (i / hatch.length) * HATCH_SPREAD))

    // Focus: one loose loop round the whole block, drawn by CSS with a dash.
    const ring = el(svg, 'path', { class: 'wui-ballpoint-ring', pathLength: '1' })
    {
      const rr = rng(w * 7 + h), pts: Pt[] = []
      const [x0, y0, x1, y1] = [cx - hw - 14, cy - hh - 18, cx + hw + 20, cy + hh + 16]
      const seg = (ax: number, ay: number, bx: number, by: number, m: number) => {
        for (let i = 0; i < m; i++) pts.push([ax + ((bx - ax) * i) / m + jitter(rr, 0.8), ay + ((by - ay) * i) / m + jitter(rr, 0.8)])
      }
      seg(x0 + 6, y0, x1, y0, 10); seg(x1, y0, x1, y1, 4); seg(x1, y1, x0, y1, 10); seg(x0, y1, x0, y0, 4)
      pts.push([x0 + 8, y0 - 1], [x0 + 30, y0 + 1])
      ring.setAttribute('d', 'M' + pts.map((v) => `${fmt(v[0])} ${fmt(v[1])}`).join('L'))
    }

    if (!introDone && introAt <= 0) for (const l of [...face, ...hatch]) l.line.prog = 0

    paint = (t: number) => {
      const off = DIR * (DEPTH.rest / 2 - s.d), base = DIR * (DEPTH.rest / 2)
      const at = (c: Corner, o: number): Pt => [cx + o + corners[c][0], cy + o + corners[c][1]]
      const move = `translate(${fmt(cx + off)} ${fmt(cy + off)})`
      gPaper.setAttribute('transform', move)
      gFace.setAttribute('transform', move)
      for (const l of face) {
        if (out >= 0) l.line.prog = 1 - out * out
        else if (!introDone) l.line.prog = easeOut(clamp01((t - l.delay) / EDGE_MS))
        l.line.draw(corners[l.a], corners[l.z])
      }
      for (const l of trace) {
        l.line.prog = clamp01(s.trace * 4 - l.i * 0.9)
        l.line.draw(corners[l.a], corners[l.z])
      }
      const shown = clamp01(s.d / 4)
      gEdges.style.opacity = String(shown)
      gPaper.style.opacity = introDone && out < 0 ? '1' : String(shown)
      for (const l of back) l.line.draw(at(l.a, base), at(l.z, base))
      for (const l of links) l.line.draw(at(l.c, off), at(l.c, base))
      for (const l of hatch) {
        if (out >= 0) l.line.prog = 1 - out
        else if (!introDone) l.line.prog = clamp01((t - l.delay) / HATCH_MS)
        l.line.draw(l.a, l.b)
      }
      const poly = (pts: Pt[]) => pts.map((v) => v.map(fmt).join(',')).join(' ')
      sides.setAttribute('points', poly([at('tl', off), at('tr', off), at('tr', base), at('br', base), at('bl', base), at('bl', off)]))
      root.style.setProperty('--wui-ballpoint-x', `${fmt(off)}px`)
      root.style.setProperty('--wui-ballpoint-y', `${fmt(off)}px`)
    }
  }

  /* ---------- One frame loop, only while something moves ---------- */
  const target = () => (s.down ? DEPTH.press : s.hover ? DEPTH.hover : DEPTH.rest)
  const frame = (now: number) => {
    raf = 0
    const dt = Math.min(1 / 30, last ? (now - last) / 1000 : 1 / 60)
    last = now
    // Replay, first half: the block sinks flat and the lines undraw, then the intro starts over.
    if (outAt !== -1) {
      if (outAt === 0) { outAt = now; outFrom = s.d }
      out = clamp01((now - outAt) / OUT_MS)
      s.d = outFrom * (1 - out * out * (3 - 2 * out)); s.v = 0; s.trace = 0
      paint(Infinity)
      if (out >= 1) {
        outAt = -1; out = -1; s.d = 0
        introDone = false; introAt = 0
        root.dataset.intro = 'run'
      }
      raf = requestAnimationFrame(frame)
      return
    }
    let t = Infinity
    if (!introDone) {
      if (introAt === 0) introAt = now
      t = now - introAt
      if (t > INTRO_MS) { introDone = true; delete root.dataset.intro }
    }
    const goal = !introDone && t < RISE_AT ? 0 : target()
    if (still) { s.d = goal; s.v = 0 } else {
      s.v += ((s.down ? SPRING.press : SPRING.k) * (goal - s.d) - SPRING.c * s.v) * dt
      s.d += s.v * dt
    }
    if (Math.abs(goal - s.d) < 0.01 && Math.abs(s.v) < 0.05) { s.d = goal; s.v = 0 }
    const traceGoal = s.hover && introDone ? 1 : 0
    s.trace = still ? traceGoal : traceGoal > s.trace ? Math.min(1, s.trace + dt / 0.55) : Math.max(0, s.trace - dt / 0.22)
    paint(t)
    if (!introDone || s.d !== goal || s.v !== 0 || s.trace !== traceGoal) raf = requestAnimationFrame(frame)
    else last = 0
  }
  const kick = () => { if (!raf && size) raf = requestAnimationFrame(frame) }

  const measure = () => {
    const w = root.offsetWidth, h = root.offsetHeight, key = `${w}x${h}`
    if (!w || !h || key === size) return
    size = key
    build(w, h)
    paint(introDone ? Infinity : 0)
    root.dataset.ready = ''
    if (!introDone && introAt === 0) kick()
  }
  const resize = new ResizeObserver(measure)
  resize.observe(root)
  measure()

  const seen = new IntersectionObserver(
    ([e]) => {
      if (!e?.isIntersecting || introAt !== -1) return
      seen.disconnect()
      introAt = 0
      root.dataset.intro = 'run'
      kick()
    },
    { threshold: 0.6 },
  )
  if (introDone) introAt = 1
  else { root.dataset.intro = 'pending'; seen.observe(root) }

  /* ---------- Input ---------- */
  const disabled = () => root.matches(':disabled, [aria-disabled="true"]')
  const set = (k: 'hover' | 'down', v: boolean) => { if (v && disabled()) return; s[k] = v; kick() }
  const press = () => { window.clearTimeout(holdTimer); downAt = performance.now(); set('down', true) }
  const release = () => {
    const wait = HOLD_MS - (performance.now() - downAt)
    window.clearTimeout(holdTimer)
    if (wait > 0) holdTimer = window.setTimeout(() => set('down', false), wait)
    else set('down', false)
  }
  const on: [string, (e: Event) => void][] = [
    ['pointerenter', (e) => (e as PointerEvent).pointerType === 'mouse' && set('hover', true)],
    ['pointerleave', () => { set('hover', root.matches(':focus-visible')); if (s.down) release() }],
    ['pointerdown', (e) => (e as PointerEvent).button === 0 && press()],
    ['pointerup', release],
    ['pointercancel', release],
    ['keydown', (e) => { const k = (e as KeyboardEvent); if ((k.key === ' ' || k.key === 'Enter') && !k.repeat) press() }],
    ['keyup', (e) => { const k = (e as KeyboardEvent).key; if (k === ' ' || k === 'Enter') release() }],
    ['focus', () => root.matches(':focus-visible') && set('hover', true)],
    ['blur', () => { s.down = false; set('hover', false) }],
  ]
  for (const [type, fn] of on) root.addEventListener(type, fn)

  return {
    replay() {
      if (still || !size) return
      window.clearTimeout(holdTimer)
      s.down = false
      seen.disconnect()
      introDone = true
      outAt = 0
      root.dataset.intro = 'out'
      kick()
    },
    destroy() {
      cancelAnimationFrame(raf)
      window.clearTimeout(holdTimer)
      resize.disconnect()
      seen.disconnect()
      delete root.dataset.intro
      for (const [type, fn] of on) root.removeEventListener(type, fn)
    },
  }
}
