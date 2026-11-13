'use client'

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

/*
 * The phone's skills deck (owner's pick; sections/skills.css). The cards are a
 * pile, the top one in front; this island moves them, with the motion of
 * Cairn's record stack (library/cairn/record-stack-engine.ts), written again
 * here for plain cards (the record stack also carries a player):
 *
 * - Every card rides four springs (x, y, tilt, scale) on one frame loop that
 *   runs only while something moves. The top card hangs from where it was
 *   grabbed and tilts with the drag; past the line it gives a small detent and
 *   the card below lifts to meet it.
 * - Release reads the pointer's speed. Flicked right, or dragged far enough,
 *   the card swings out on one arc, passes behind the pile at the top of the
 *   swing and settles at the back while the rest step up: the next skill.
 *   Flicked left, the back card swings out the other way and lands on top.
 *   Anything less springs back.
 * - The marks under the deck follow the card on top. ← and → deal from the
 *   keyboard once the deck has focus.
 *
 * Reduced motion: the same changes, without the travel.
 */

type Pose = { x: number; y: number; r: number; s: number }
type Spring = { x: number; v: number; t: number; k: number; c: number; live: boolean }
type Body = { el: HTMLElement; x: Spring; y: Spring; r: Spring; s: Spring }

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
const TILTS = [0, -2.4, 1.8, -1.2]

export function SkillsDeck({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    const pile = root?.querySelector<HTMLElement>('[data-skills-pile]')
    if (!root || !pile) return
    const cards = Array.from(pile.querySelectorAll<HTMLElement>('[data-skills-card]'))
    const marks = Array.from(root.querySelectorAll<HTMLElement>('[data-skills-mark]'))
    const N = cards.length
    if (!N) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // The deck from the top: order[0] is the card in front.
    let order = cards.map((_, i) => i)
    const spring = (x: number): Spring => ({ x, v: 0, t: x, k: 260, c: 24, live: false })
    const bodies: Body[] = cards.map((el) => ({
      el,
      x: spring(0),
      y: spring(0),
      r: spring(0),
      s: spring(1),
    }))
    const slotOf = (b: Body) => order.indexOf(bodies.indexOf(b))
    const slot = (k: number): Pose => {
      const d = Math.min(k, 3)
      return { x: d * 4, y: d * 9, r: TILTS[d] ?? 0, s: 1 - d * 0.035 }
    }
    const paint = (b: Body) => {
      b.el.style.transform = `translate(${b.x.x.toFixed(2)}px, ${b.y.x.toFixed(2)}px) rotate(${b.r.x.toFixed(2)}deg) scale(${b.s.x.toFixed(4)})`
    }
    const stack = () =>
      bodies.forEach((b) => {
        const k = slotOf(b)
        b.el.style.zIndex = String(N - k)
        b.el.style.visibility = k > 3 ? 'hidden' : 'visible'
      })
    const showMarks = () => marks.forEach((m, i) => m.toggleAttribute('data-on', i === order[0]))

    // One frame loop for every spring, only while one moves.
    let raf = 0
    let last = 0
    const tick = (now: number) => {
      raf = 0
      const dt = Math.min(1 / 30, last ? (now - last) / 1000 : 1 / 60)
      last = now
      let moving = false
      for (const b of bodies) {
        let any = false
        for (const sp of [b.x, b.y, b.r, b.s]) {
          if (!sp.live) continue
          for (let i = 0; i < 4; i++) {
            const h = dt / 4
            sp.v += (-sp.k * (sp.x - sp.t) - sp.c * sp.v) * h
            sp.x += sp.v * h
          }
          if (Math.abs(sp.x - sp.t) < 0.01 && Math.abs(sp.v) < 0.02) {
            sp.x = sp.t
            sp.v = 0
            sp.live = false
          } else moving = true
          any = true
        }
        if (any) paint(b)
      }
      if (moving) raf = requestAnimationFrame(tick)
      else last = 0
    }
    const to = (b: Body, p: Pose, k = 260, c = 24, vx?: number) => {
      const pairs: [Spring, number][] = [
        [b.x, p.x],
        [b.y, p.y],
        [b.r, p.r],
        [b.s, p.s],
      ]
      for (const [sp, t] of pairs) {
        sp.t = t
        sp.k = k
        sp.c = c
        if (still) {
          sp.x = t
          sp.v = 0
          sp.live = false
        } else sp.live = true
      }
      if (vx != null) b.x.v = vx
      if (still) paint(b)
      else if (!raf) raf = requestAnimationFrame(tick)
    }
    const settle = (skip: Body | null, stagger: number) => {
      stack()
      bodies.forEach((b) => {
        if (b === skip) return
        const k = slotOf(b)
        const go = () => to(b, slot(k), 240, 24)
        if (stagger && k && !still) window.setTimeout(go, stagger * Math.min(k, 3))
        else go()
      })
    }

    // The arc: from where the card was let go, out to one side and behind the pile.
    let busy = false
    const arc = (b: Body, end: Pose, side: number, ms: number, peak: () => void) =>
      new Promise<void>((done) => {
        for (const sp of [b.x, b.y, b.r, b.s]) sp.live = false
        const from: Pose = { x: b.x.x, y: b.y.x, r: b.r.x, s: b.s.x }
        const reach = pile.offsetWidth * 0.66
        const lift = pile.offsetWidth * 0.06
        const t0 = performance.now()
        let passed = false
        const step = () => {
          const t = still ? 1 : clamp((performance.now() - t0) / ms)
          const e = ease(t)
          const bump = Math.sin(Math.PI * e)
          const p = {
            x: lerp(from.x, end.x, e) + side * reach * bump,
            y: lerp(from.y, end.y, e) - lift * bump,
            r: lerp(from.r, end.r, e) + side * 10 * bump,
            s: lerp(from.s, end.s, e) - 0.05 * bump,
          }
          b.x.x = p.x
          b.y.x = p.y
          b.r.x = p.r
          b.s.x = p.s
          paint(b)
          if (!passed && e >= 0.5) {
            passed = true
            peak()
          }
          if (t < 1) requestAnimationFrame(step)
          else {
            for (const [sp, v] of [
              [b.x, end.x],
              [b.y, end.y],
              [b.r, end.r],
              [b.s, end.s],
            ] as const)
              sp.t = v
            done()
          }
        }
        requestAnimationFrame(step)
      })
    const next = async (vx = 0) => {
      if (busy) return
      busy = true
      const b = bodies[order[0]!]!
      await arc(b, slot(Math.min(N - 1, 3)), 1, clamp(640 - Math.abs(vx) * 0.08, 460, 640), () => {
        order = [...order.slice(1), order[0]!]
        b.el.style.zIndex = '0'
        settle(b, 60)
        showMarks()
      })
      stack()
      busy = false
    }
    const prev = async () => {
      if (busy) return
      busy = true
      const b = bodies[order[N - 1]!]!
      b.el.style.visibility = 'visible'
      await arc(b, slot(0), -1, 600, () => {
        order = [order[N - 1]!, ...order.slice(0, N - 1)]
        settle(b, 50)
        b.el.style.zIndex = String(N + 1)
        showMarks()
      })
      stack()
      busy = false
    }

    // The pointer: the top card hangs from the grab and tilts with the drag.
    let drag: Body | null = null
    let x0 = 0
    let y0 = 0
    let hang = 1
    let over = false
    let moved = 0
    let pts: [number, number][] = []
    const velocity = () => {
      const t = performance.now()
      pts = pts.filter((p) => t - p[0] < 90)
      if (pts.length < 2) return 0
      const a = pts[0]!
      const z = pts[pts.length - 1]!
      return (z[1] - a[1]) / Math.max(0.001, (z[0] - a[0]) / 1000)
    }
    const line = () => pile.offsetWidth * 0.3
    const down = (e: PointerEvent) => {
      const b = bodies[order[0]!]!
      if (busy || (e.target as Element).closest('[data-skills-card]') !== b.el) return
      drag = b
      x0 = e.clientX
      y0 = e.clientY
      over = false
      moved = 0
      pts = [[performance.now(), e.clientX]]
      const r = b.el.getBoundingClientRect()
      hang = e.clientY < r.top + r.height / 2 ? 1 : -1
      to(b, { ...slot(0), s: 1.03 }, 900, 40)
      pile.setPointerCapture(e.pointerId)
    }
    const move = (e: PointerEvent) => {
      if (!drag) return
      pts.push([performance.now(), e.clientX])
      const dx = e.clientX - x0
      const dy = e.clientY - y0
      moved = Math.max(moved, Math.hypot(dx, dy))
      if (moved < 4) return
      root.dataset.dragging = ''
      for (const sp of [drag.x, drag.y, drag.r]) sp.live = false
      drag.x.x = drag.x.t = dx
      drag.y.x = drag.y.t = dy * 0.35
      drag.r.x = drag.r.t = dx * 0.07 * hang
      paint(drag)
      const below = bodies[order[1]!]
      if (below) {
        const p = clamp(Math.abs(dx) / 110) * 0.6
        const s1 = slot(1)
        to(below, {
          x: lerp(s1.x, 0, p),
          y: lerp(s1.y, 0, p),
          r: lerp(s1.r, 0, p),
          s: lerp(s1.s, 1, p),
        })
      }
      const isOver = Math.abs(dx) > line()
      if (isOver !== over) {
        over = isOver
        drag.s.t = isOver ? 1.07 : 1.03
        drag.s.live = !still
        if (!raf && !still) raf = requestAnimationFrame(tick)
      }
    }
    const up = () => {
      if (!drag) return
      const b = drag
      drag = null
      delete root.dataset.dragging
      if (moved < 4) {
        to(b, slot(0), 380, 20)
        return
      }
      const vx = velocity()
      const dx = b.x.x
      if (dx > line() || vx > 650) void next(vx)
      else if (dx < -line() || vx < -650) {
        to(b, slot(0), 260, 22, vx)
        void prev()
      } else {
        to(b, slot(0), 380, 20, vx)
        settle(b, 0)
      }
    }
    const key = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') void next()
      else if (e.key === 'ArrowLeft') void prev()
      else return
      e.preventDefault()
    }

    root.dataset.deck = 'on'
    bodies.forEach((b) => {
      const p = slot(slotOf(b))
      b.x.x = b.x.t = p.x
      b.y.x = b.y.t = p.y
      b.r.x = b.r.t = p.r
      b.s.x = b.s.t = p.s
      paint(b)
    })
    stack()
    showMarks()
    pile.addEventListener('pointerdown', down)
    pile.addEventListener('pointermove', move)
    pile.addEventListener('pointerup', up)
    pile.addEventListener('pointercancel', up)
    pile.addEventListener('keydown', key)

    return () => {
      cancelAnimationFrame(raf)
      pile.removeEventListener('pointerdown', down)
      pile.removeEventListener('pointermove', move)
      pile.removeEventListener('pointerup', up)
      pile.removeEventListener('pointercancel', up)
      pile.removeEventListener('keydown', key)
      delete root.dataset.deck
      cards.forEach((el) => {
        el.style.transform = ''
        el.style.zIndex = ''
        el.style.visibility = ''
      })
    }
  }, [])

  return <div ref={ref}>{children}</div>
}
