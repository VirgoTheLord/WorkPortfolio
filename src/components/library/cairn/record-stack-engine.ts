/*
 * The motion and playback behind the record stack (record-stack.tsx). React
 * renders the cards and the ticker once; this takes them over and moves them
 * with springs, on one shared frame loop that only runs while something moves.
 *
 * - Every card has four springs (x, y, rotation, scale). The top card hangs
 *   from where it was grabbed and tilts with the drag; past the line it gives a
 *   small detent and the card below lifts to meet it.
 * - Release reads the pointer's speed. Flicked right (or dragged far enough),
 *   the card swings out on one smooth arc, passes behind the pile at the top of
 *   the swing and settles at the back of the deck while the others step up: the
 *   next record. Flicked left, the back card swings out the other way and lands
 *   on top: the previous one.
 * - The fan variant spreads the cards in an arc instead; picking one lifts it
 *   and folds the fan back under it.
 * - The title line below slides in the direction of the change, and a hairline
 *   round the top card's edge fills with the song.
 *
 * Playback is an <audio> element when a record has a src; without one, a clock
 * runs for the record's duration, so the stack works as a silent showcase.
 */

type Record = { title: string; artist?: string; src?: string; duration?: number }
export type Options = {
  records: readonly Record[]
  index: number
  variant: 'flick' | 'fan'
  onChange?: (index: number) => void
  onPlayChange?: (playing: boolean) => void
}
export type Engine = { destroy: () => void }

/* ---------- springs on one frame loop ---------- */
const active = new Set<(dt: number) => boolean>()
let raf = 0
let last = 0
const tick = (t: number) => {
  const dt = Math.min(1 / 30, last ? (t - last) / 1000 : 1 / 60)
  last = t
  for (const f of [...active]) if (!f(dt)) active.delete(f)
  raf = active.size ? requestAnimationFrame(tick) : ((last = 0), 0)
}
const run = (f: (dt: number) => boolean) => {
  active.add(f)
  if (!raf) raf = requestAnimationFrame(tick)
}

type Spring = { x: number; v: number; t: number; k: number; c: number; to: (t: number, v?: number) => Spring; set: (x: number) => Spring; done: () => Promise<void>; stop: () => void }
function spring(x: number, k: number, c: number, still: boolean, on: (x: number) => void): Spring {
  let live = false
  let settle: (() => void) | null = null
  const s = { x, v: 0, t: x, k, c } as Spring
  const step = (dt: number) => {
    if (!live) return false
    if (still) { s.x = s.t; s.v = 0 } else {
      for (let i = 0; i < 4; i++) { const h = dt / 4; s.v += (-s.k * (s.x - s.t) - s.c * s.v) * h; s.x += s.v * h }
    }
    const done = Math.abs(s.x - s.t) < 0.005 && Math.abs(s.v) < 0.02
    if (done) { s.x = s.t; s.v = 0 }
    on(s.x)
    if (done) { live = false; settle?.(); settle = null }
    return !done
  }
  s.to = (t, v) => { s.t = t; if (v != null) s.v = v; if (!live) { live = true; run(step) } return s }
  s.set = (v) => { s.x = s.t = v; s.v = 0; on(v); return s }
  s.done = () => (live ? new Promise((r) => (settle = r)) : Promise.resolve())
  s.stop = () => { live = false; settle = null }
  return s
}

/* ---------- the play ↔ pause glyph: two quads that become two bars ---------- */
const PLAY = [[[7.2, 5], [12.6, 8.6], [12.6, 15.4], [7.2, 19]], [[12.6, 8.6], [18.6, 12], [18.6, 12], [12.6, 15.4]]]
const PAUSE = [[[6.5, 5.5], [10.1, 5.5], [10.1, 18.5], [6.5, 18.5]], [[13.9, 5.5], [17.5, 5.5], [17.5, 18.5], [13.9, 18.5]]]
export const glyph = (p: number) =>
  PLAY.map((quad, k) => 'M' + quad.map((q, j) => `${(q[0]! + (PAUSE[k]![j]![0]! - q[0]!) * p).toFixed(2)} ${(q[1]! + (PAUSE[k]![j]![1]! - q[1]!) * p).toFixed(2)}`).join('L') + 'Z')

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export function createRecordStack(root: HTMLElement, o: Options): Engine {
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const pile = root.querySelector<HTMLElement>('.wui-stack-pile')!
  const cards = [...pile.querySelectorAll<HTMLElement>('.wui-stack-card')]
  const play = root.querySelector<HTMLButtonElement>('.wui-stack-play')!
  const slides = [...root.querySelectorAll<HTMLElement>('.wui-stack-slide')]
  const time = root.querySelector<HTMLElement>('.wui-stack-time')!
  const live = root.querySelector<HTMLElement>('[aria-live]')!
  const N = cards.length
  let index = o.index
  let alive = true

  /* ---------- geometry, relative to the card's size ---------- */
  let f = pile.offsetWidth / 196 || 1
  const slot = (s: number) =>
    s === 0 ? { x: 0, y: 0, r: -2, s: 1 }
    : s === 1 ? { x: 10 * f, y: 8 * f, r: 5, s: 0.97 }
    : s === 2 ? { x: -10 * f, y: 12 * f, r: -7, s: 0.94 }
    : { x: 0, y: 15 * f, r: 0, s: 0.9 }
  const slotOf = (i: number) => (i - index + N) % N

  type Body = { el: HTMLElement; i: number; x: Spring; y: Spring; r: Spring; s: Spring }
  const bodies: Body[] = cards.map((el, i) => {
    const b = { el, i } as Body
    const paint = () => (el.style.transform = `translate(${b.x.x.toFixed(2)}px, ${b.y.x.toFixed(2)}px) rotate(${b.r.x.toFixed(2)}deg) scale(${b.s.x.toFixed(4)})`)
    b.x = spring(0, 260, 24, still, paint)
    b.y = spring(0, 260, 24, still, paint)
    b.r = spring(0, 260, 24, still, paint)
    b.s = spring(1, 400, 22, still, paint)
    return b
  })
  const stiff = (b: Body, k: number, c: number) => { for (const s of [b.x, b.y, b.r]) { s.k = k; s.c = c } }
  const to = (b: Body, p: { x?: number; y?: number; r?: number; s?: number }, v: { x?: number; r?: number } = {}) => {
    if (p.x != null) b.x.to(p.x, v.x)
    if (p.y != null) b.y.to(p.y)
    if (p.r != null) b.r.to(p.r, v.r)
    if (p.s != null) b.s.to(p.s)
  }
  const place = (b: Body, p: { x: number; y: number; r: number; s: number }) => { b.x.set(p.x); b.y.set(p.y); b.r.set(p.r); b.s.set(p.s) }
  const stack = () => bodies.forEach((b) => {
    const s = slotOf(b.i)
    b.el.style.zIndex = String(2 * (N - s))
    b.el.dataset.slot = String(Math.min(s, 4))
  })
  const layout = (stagger = 0) => {
    stack()
    bodies.forEach((b) => {
      const s = slotOf(b.i)
      const go = () => { stiff(b, 260, 24); to(b, slot(s)) }
      if (stagger && s) setTimeout(go, stagger * Math.min(s, 3)); else go()
    })
  }
  const top = () => bodies.find((b) => slotOf(b.i) === 0)!
  bodies.forEach((b) => place(b, slot(slotOf(b.i))))
  stack()
  root.dataset.ready = ''

  /* ---------- playback: an <audio> element, or a silent clock ---------- */
  let playing = false
  let audio: HTMLAudioElement | null = null
  let clockFrom = 0
  let clockAt = 0
  const rec = () => o.records[index]
  const duration = () => (audio && Number.isFinite(audio.duration) ? audio.duration : rec()?.duration ?? 180)
  const now = () => (audio ? audio.currentTime : playing ? clockFrom + (performance.now() - clockAt) / 1000 : clockFrom)
  const load = () => {
    const src = rec()?.src
    if (src) { audio ??= new Audio(); audio.preload = 'metadata'; if (audio.src !== new URL(src, location.href).href) audio.src = src; audio.onended = () => next() }
    else if (audio) { audio.pause(); audio = null }
    clockFrom = 0
    clockAt = performance.now()
  }
  load()

  const glyphs = [[...play.querySelectorAll<SVGPathElement>('.wui-stack-glyph path')]]
  const morph = spring(0, 420, 22, still, (p) => {
    const d = glyph(p)
    for (const paths of glyphs) paths.forEach((path, k) => path.setAttribute('d', d[k]!))
  })
  morph.set(0)

  let loop = 0
  const frame = () => {
    loop = 0
    if (!alive) return
    const t = now(), d = duration()
    pile.style.setProperty('--wui-stack-progress', clamp(t / d).toFixed(4))
    time.textContent = mmss(t)
    if (!audio && playing && t >= d) { next(); return }
    if (playing) loop = requestAnimationFrame(frame)
  }
  const setPlaying = (on: boolean) => {
    if (on === playing) return
    if (on) { clockAt = performance.now(); audio?.play().catch(() => setPlaying(false)) }
    else { clockFrom = now(); audio?.pause() }
    playing = on
    if (on) root.dataset.playing = ''
    else delete root.dataset.playing
    play.setAttribute('aria-label', on ? 'Pause' : 'Play')
    morph.to(on ? 1 : 0)
    o.onPlayChange?.(on)
    if (!loop) loop = requestAnimationFrame(frame)
  }

  /* ---------- the ticker: the title slides the way the cards went ---------- */
  let shown = 0
  const fill = (el: HTMLElement, i: number) => {
    el.querySelector('.wui-stack-title')!.textContent = o.records[i]!.title
    el.querySelector('.wui-stack-artist')!.textContent = o.records[i]!.artist ?? ''
  }
  let dir = 1
  const slide = spring(1, 200, 24, still, (v) => {
    const cur = slides[shown], old = slides[1 - shown], w = slides[0]!.parentElement!.offsetWidth
    cur!.style.transform = `translateX(${((v - 1) * dir * w).toFixed(2)}px)`
    cur!.style.opacity = v.toFixed(3)
    old!.style.transform = `translateX(${(v * dir * w).toFixed(2)}px)`
    old!.style.opacity = (1 - v).toFixed(3)
  })
  slide.set(1)

  const change = (i: number, d: number) => {
    const was = playing
    if (was) setPlaying(false)
    index = (i + N) % N
    dir = d
    shown = 1 - shown
    fill(slides[shown]!, index)
    slides[shown]!.removeAttribute('aria-hidden')
    slides[1 - shown]!.setAttribute('aria-hidden', 'true')
    slide.set(0); slide.to(1)
    load()
    pile.style.setProperty('--wui-stack-progress', '0')
    time.textContent = '0:00'
    const r = rec()
    live.textContent = `${r!.title}${r!.artist ? `, ${r!.artist}` : ''}`
    if (o.variant === 'flick') {
      pile.setAttribute('aria-valuenow', String(index + 1))
      pile.setAttribute('aria-valuetext', `${r!.title}, ${index + 1} of ${N}`)
    }
    o.onChange?.(index)
    if (was) setPlaying(true)
  }

  /* ---------- flick: one clean arc that carries a card behind the deck ----------
     The card leaves from wherever it was let go, swings out to the side and, at
     the top of the swing, passes behind the pile; then it settles into the back
     of the deck. Previous runs the same arc the other way round: the back card
     swings out to the left and lands on top. The rest step up (or down) at the
     peak, a beat apart. */
  type Pose = { x: number; y: number; r: number; s: number }
  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
  const settle = (skip: Body, stagger: number) => {
    stack()
    bodies.forEach((b) => {
      if (b === skip) return
      const s = slotOf(b.i)
      const go = () => { stiff(b, 240, 24); to(b, slot(s)) }
      if (stagger && s) setTimeout(go, stagger * Math.min(s, 3)); else go()
    })
  }
  const arc = (b: Body, end: Pose, side: number, ms: number, peak: () => void) =>
    new Promise<void>((done) => {
      for (const sp of [b.x, b.y, b.r, b.s]) sp.stop()
      const from: Pose = { x: b.x.x, y: b.y.x, r: b.r.x, s: b.s.x }
      const reach = pile.offsetWidth * 0.66, lift = pile.offsetWidth * 0.06
      const t0 = performance.now()
      let passed = false
      const step = () => {
        if (!alive) return done()
        const t = still ? 1 : clamp((performance.now() - t0) / ms), e = ease(t), bump = Math.sin(Math.PI * e)
        place(b, {
          x: lerp(from.x, end.x, e) + side * reach * bump,
          y: lerp(from.y, end.y, e) - lift * bump,
          r: lerp(from.r, end.r, e) + side * 10 * bump,
          s: lerp(from.s, end.s, e) - 0.05 * bump,
        })
        if (!passed && e >= 0.5) { passed = true; peak() }
        if (t < 1) requestAnimationFrame(step)
        else done()
      }
      requestAnimationFrame(step)
    })
  let busy = false
  const next = async (vx = 0, b = top()) => {
    if (busy) return
    busy = true
    const ms = clamp(640 - Math.abs(vx) * 0.08, 460, 640)
    await arc(b, slot(Math.min(N - 1, 3)), 1, ms, () => {
      change(index + 1, 1)
      settle(b, 60)
      b.el.style.zIndex = '0'
    })
    stack()
    busy = false
  }
  const prev = async () => {
    if (busy) return
    busy = true
    const b = bodies.find((x) => slotOf(x.i) === N - 1)!
    b.el.dataset.slot = '3'
    await arc(b, slot(0), -1, 600, () => {
      change(index - 1, -1)
      settle(b, 50)
      b.el.style.zIndex = String(4 * N)
    })
    stack()
    busy = false
  }

  /* ---------- fan ---------- */
  let fanned = false
  let focus = 0
  let intent = 0
  /* The fan: an even arc, wider for more records, never running off the screen. */
  const fanSlot = (k: number) => {
    const mid = (N - 1) / 2, rel = N > 1 ? (k - mid) / mid : 0
    const scale = N <= 3 ? 0.9 : N <= 5 ? 0.84 : 0.78
    const box = pile.getBoundingClientRect(), centre = box.left + box.width / 2
    const room = Math.min(centre, document.documentElement.clientWidth - centre) - (pile.offsetWidth * scale) / 2 - 12
    const reach = Math.max(0, Math.min(Math.min(130, 44 * (N - 1)) * f, room))
    return { x: rel * reach, y: (rel * rel * 18 - 6) * f, r: rel * Math.min(18, 7 * (N - 1)), s: scale }
  }
  const fan = (on: boolean) => {
    fanned = on
    if (on) {
      focus = index
      bodies.forEach((b) => {
        b.el.style.zIndex = String(10 + b.i)
        b.el.dataset.slot = '0'
        setTimeout(() => { stiff(b, 240, 20); to(b, fanSlot(b.i)) }, b.i * 40)
      })
      hi(index)
    } else layout(35)
    pile.setAttribute('aria-expanded', String(on))
  }
  const hi = (k: number) => { focus = k; bodies.forEach((b) => b.s.to(fanSlot(b.i).s + (b.i === k ? 0.07 : 0))) }
  const pick = (i: number) => {
    const b = bodies[i]
    b!.el.style.zIndex = '99'
    stiff(b!, 300, 22)
    to(b!, { y: -18 * f, s: 1.04 })
    setTimeout(() => {
      if (i !== index) change(i, 1)
      fan(false)
      setPlaying(true)
    }, still ? 0 : 170)
  }

  /* ---------- pointer ---------- */
  let drag: Body | null = null
  let x0 = 0, y0 = 0, hang = 1, over = false, moved = 0
  let pts: [number, number][] = []
  const velocity = () => {
    const t = performance.now()
    pts = pts.filter((p) => t - p[0] < 90)
    if (pts.length < 2) return 0
    const a = pts[0], z = pts[pts.length - 1]
    return (z![1] - a![1]) / Math.max(0.001, (z![0] - a![0]) / 1000)
  }
  const down = (e: PointerEvent) => {
    if (o.variant === 'fan') return
    const t = top()
    if (busy || (e.target as Element).closest('.wui-stack-card') !== t.el) return
    drag = t; x0 = e.clientX; y0 = e.clientY; over = false; moved = 0; pts = [[performance.now(), e.clientX]]
    const r = t.el.getBoundingClientRect()
    hang = e.clientY < r.top + r.height / 2 ? 1 : -1
    stiff(t, 900, 40)
    t.s.to(1.03)
    pile.setPointerCapture(e.pointerId)
  }
  const move = (e: PointerEvent) => {
    if (o.variant === 'fan') {
      if (!fanned) return
      const el = (e.target as Element).closest<HTMLElement>('.wui-stack-card')
      const k = el ? cards.indexOf(el) : -1
      if (k >= 0 && k !== focus) hi(k)
      return
    }
    if (!drag) return
    pts.push([performance.now(), e.clientX])
    const dx = e.clientX - x0, dy = e.clientY - y0
    moved = Math.max(moved, Math.hypot(dx, dy))
    if (moved < 4) return
    root.dataset.dragging = ''
    drag.x.set(dx); drag.y.set(dy * 0.35); drag.r.set(slot(0).r + dx * 0.07 * hang)
    const below = bodies.find((b) => slotOf(b.i) === 1)
    if (below) {
      const p = clamp(Math.abs(dx) / 110) * 0.6, s1 = slot(1)
      to(below, { x: lerp(s1.x, 0, p), y: lerp(s1.y, 0, p), r: lerp(s1.r, 0, p), s: lerp(s1.s, 1, p) })
    }
    const isOver = Math.abs(dx) > 90 * f
    if (isOver !== over) { over = isOver; drag.s.to(isOver ? 1.07 : 1.03, isOver ? 1.4 : 0) }
  }
  const up = () => {
    if (!drag) return
    const b = drag
    drag = null
    delete root.dataset.dragging
    if (moved < 4) { stiff(b, 380, 20); to(b, slot(0)); return }
    const vx = velocity(), dx = b.x.x, line = 90 * f
    if (dx > line || vx > 650) next(vx, b)
    else if (dx < -line || vx < -650) { stiff(b, 260, 22); to(b, slot(0), { x: vx }); prev() }
    else { stiff(b, 380, 20); to(b, slot(0), { x: vx }); layout() }
  }
  const enter = (e: PointerEvent) => {
    if (o.variant !== 'fan' || e.pointerType !== 'mouse') return
    intent = window.setTimeout(() => !fanned && fan(true), 160)
  }
  const leave = () => { clearTimeout(intent); if (fanned) fan(false) }
  const click = (e: MouseEvent) => {
    if (o.variant !== 'fan') return
    const el = (e.target as Element).closest<HTMLElement>('.wui-stack-card')
    if (!fanned) return fan(true)
    if (el) pick(cards.indexOf(el))
  }
  const key = (e: KeyboardEvent) => {
    if (o.variant === 'fan') {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        if (fanned) pick(focus)
        else fan(true)
      }
      else if (fanned && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { e.preventDefault(); hi(clamp(focus + (e.key === 'ArrowRight' ? 1 : -1), 0, N - 1)) }
      else if (e.key === 'Escape' && fanned) fan(false)
      return
    }
    if (e.key === 'ArrowRight') { e.preventDefault(); next() }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPlaying(!playing) }
  }
  const blur = () => fanned && fan(false)
  const toggle = () => setPlaying(!playing)
  const resize = new ResizeObserver(() => {
    const nf = pile.offsetWidth / 196 || 1
    if (Math.abs(nf - f) < 0.01) return
    f = nf
    if (!fanned) layout()
  })
  resize.observe(pile)

  pile.addEventListener('pointerdown', down)
  pile.addEventListener('pointermove', move)
  pile.addEventListener('pointerup', up)
  pile.addEventListener('pointercancel', up)
  pile.addEventListener('pointerenter', enter)
  pile.addEventListener('pointerleave', leave)
  pile.addEventListener('click', click)
  pile.addEventListener('keydown', key)
  pile.addEventListener('blur', blur)
  play.addEventListener('click', toggle)

  return {
    destroy() {
      alive = false
      cancelAnimationFrame(loop)
      clearTimeout(intent)
      resize.disconnect()
      audio?.pause()
      for (const b of bodies) for (const s of [b.x, b.y, b.r, b.s]) s.stop()
      morph.stop(); slide.stop()
      pile.removeEventListener('pointerdown', down)
      pile.removeEventListener('pointermove', move)
      pile.removeEventListener('pointerup', up)
      pile.removeEventListener('pointercancel', up)
      pile.removeEventListener('pointerenter', enter)
      pile.removeEventListener('pointerleave', leave)
      pile.removeEventListener('click', click)
      pile.removeEventListener('keydown', key)
      pile.removeEventListener('blur', blur)
      play.removeEventListener('click', toggle)
      delete root.dataset.playing
    },
  }
}
