'use client'

import { useEffect, useRef } from 'react'
import './pointer-fx.css'

/* The trail, as the preloader's comet draws its ring: one continuous line behind a
   bright head, thickest at the head and tapering to nothing at its tail. Its
   behaviour is the reference's, measured on heronaiapp.com's own canvas frame by
   frame at three pointer speeds (about 290, 810 and 2,140px/s):
   - while the pointer moves, a point lives about half a second (the tail was 510ms
     of path at the slow speed and 484ms at the medium one), but the tail is never
     longer than about 590px (at 2,140px/s it stopped at 587px, 274ms of path);
   - when the pointer stops, the tail holds for about 70ms and then retracts fast,
     gone in 185ms (slow) to 385ms (fast): it ages about twice as quickly once the
     pointer is still, so it does not linger;
   - the line is a smooth hairline curve, about 1.5px thick at its head.
   To keep the curve smooth whatever the mouse's event rate or jitter, the line is
   not drawn from the raw events: a follower chases the pointer on an exponential
   and is sampled once a frame, so the samples are evenly spaced in time, and a
   Catmull-Rom spline is drawn through them. The head is a small solid square in the
   accent colour (the ink colour on a brand field, where orange would vanish) that is
   always there while the pointer is on the page, still or moving. */
const TRAIL = {
  width: 1.8,
  alpha: 0.95,
  // Seconds a point lives while the pointer moves.
  life: 0.5,
  // The longest the tail may be, in px.
  length: 590,
  // How much faster points age once the pointer has been still for IDLE ms.
  hurry: 2.1,
  idle: 70,
  // The head square is the follower, and the line is drawn from it: it trails the
  // real cursor a little while the pointer moves (about a 60ms time constant) and
  // glides back onto it when the pointer is still (about 30ms). Rates per second.
  follow: { moving: 16, still: 34 },
  // Passes of neighbour-averaging over the samples before the spline, which take the
  // last of a mouse's jitter out of the line.
  relax: 2,
  // The path is smoothed through its samples (a Catmull-Rom spline), drawn from this
  // many points per sample.
  smooth: 6,
  max: 140,
} as const

/* What the lens answers to: anything that does something when clicked. A label
   that already follows the pointer (data-cursor-text, the "View project" pill)
   keeps it to itself. */
const INTERACTIVE = 'a[href], button, [role="button"], summary, [data-cursor="lens"]'
const SKIP = '[data-cursor="off"], [data-cursor-text], [data-cursor-tag]'

/* What turns the head into a tag carrying a word (the Skills "See all" and the
   Skills page's "Say hello"; studionamma.com's own cursor does this). */
const TAGGED = '[data-cursor-tag]'

type Point = { x: number; y: number; age: number; color: string }

/*
 * The pointer's two small effects, from heronaiapp.com (inspected in a browser; its
 * own cursor is the native one, kept, with these on top):
 *
 *   - a square at the pointer and a comet's tail behind it: one tapering line of
 *     the pointer's recent path, drawn on one fixed canvas
 *     that no event can reach. The canvas only repaints while a square is alive:
 *     the frame loop starts with the first square and ends with the last, so an
 *     idle pointer costs nothing.
 *   - a lens: over a link or a button a square, 2.8rem, grows from 0.43 under the
 *     pointer and desaturates what is beneath it (mix-blend-mode: saturation), so
 *     orange text goes grey under the pointer. It is one element moved by
 *     transform; a single delegated listener finds the targets, so no element
 *     carries a listener of its own.
 *   - a tag: over anything carrying data-cursor-tag the head becomes a small
 *     orange label with that word, tilted 7 degrees and riding the head's own
 *     trailing position (studionamma.com's cursor, measured: it grows in about
 *     0.15s and is gone the moment the pointer leaves). No trail while it shows.
 *
 * Fine pointers only (hover and precision, not a screen width), never for reduced
 * motion, and held off while the intro plays and while the full-screen menu is
 * open. Everything is decorative: nothing here takes a pointer event, receives
 * focus or is read by assistive tech.
 */
export function PointerFx() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lensRef = useRef<HTMLDivElement>(null)
  const headRef = useRef<HTMLDivElement>(null)
  const tagRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const lens = lensRef.current
    const head = headRef.current
    const tag = tagRef.current
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const root = document.documentElement
    if (!canvas || !lens || !head || !tag) return

    let teardown: (() => void) | undefined

    const start = () => {
      const ctx = canvas.getContext('2d')
      if (teardown || !ctx || !fine.matches || reduced.matches) return

      const points: Point[] = []
      let raf = 0

      const paused = () =>
        root.classList.contains('is-intro') ||
        document.querySelector('.menu')?.getAttribute('data-open') === 'true'

      const size = () => {
        const ratio = Math.min(window.devicePixelRatio || 1, 2)
        canvas.width = Math.round(window.innerWidth * ratio)
        canvas.height = Math.round(window.innerHeight * ratio)
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
        ctx.lineCap = 'butt'
      }
      size()

      const colourAt = (target: Element | null) => {
        const surface = target?.closest('[data-theme]') ?? root
        const brand = surface.getAttribute('data-theme') === 'brand'
        return getComputedStyle(surface)
          .getPropertyValue(brand ? '--color-black' : '--color-accent')
          .trim()
      }

      /* The ribbon is one polygon: each sample is given a half-width that follows
         its age, and is offset to either side along the line's local direction, so
         the width tapers continuously to a point at the tail. A gradient along the
         line takes the colour from nothing at the tail to full at the head. */
      const rgb = (css: string) => {
        const hex = css.replace('#', '')
        const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex
        const n = parseInt(full.slice(0, 6), 16)
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const
      }
      /* A Catmull-Rom spline through the samples, resampled finely, each new point
         carrying the age it would have had at that spot along the path. */
      const curve = (run: Point[]) => {
        if (run.length < 3) return run
        const out: Point[] = []
        for (let i = 0; i < run.length - 1; i += 1) {
          const p0 = run[Math.max(0, i - 1)]!
          const p1 = run[i]!
          const p2 = run[i + 1]!
          const p3 = run[Math.min(run.length - 1, i + 2)]!
          for (let k = 0; k < TRAIL.smooth; k += 1) {
            const t = k / TRAIL.smooth
            const t2 = t * t
            const t3 = t2 * t
            const at = (a: number, b: number, c: number, d: number) =>
              0.5 *
              (2 * b +
                (-a + c) * t +
                (2 * a - 5 * b + 4 * c - d) * t2 +
                (-a + 3 * b - 3 * c + d) * t3)
            out.push({
              x: at(p0.x, p1.x, p2.x, p3.x),
              y: at(p0.y, p1.y, p2.y, p3.y),
              age: p1.age + (p2.age - p1.age) * t,
              color: p2.color,
            })
          }
        }
        out.push(run[run.length - 1]!)
        return out
      }
      const ribbon = (sampled: Point[]) => {
        const run = curve(sampled)
        if (run.length < 2) return
        const half = run.map(
          (point) => (TRAIL.width / 2) * Math.max(0, 1 - point.age / TRAIL.life) ** 0.9,
        )
        const left: [number, number][] = []
        const right: [number, number][] = []
        run.forEach((point, i) => {
          const before = run[Math.max(0, i - 1)]!
          const after = run[Math.min(run.length - 1, i + 1)]!
          const dx = after.x - before.x
          const dy = after.y - before.y
          const length = Math.hypot(dx, dy) || 1
          const nx = -dy / length
          const ny = dx / length
          left.push([point.x + nx * half[i]!, point.y + ny * half[i]!])
          right.push([point.x - nx * half[i]!, point.y - ny * half[i]!])
        })
        const tail = run[0]!
        const head = run[run.length - 1]!
        const [r, g, b] = rgb(head.color)
        const fill = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y)
        fill.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`)
        fill.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${TRAIL.alpha})`)
        ctx.fillStyle = fill
        ctx.beginPath()
        ctx.moveTo(left[0]![0], left[0]![1])
        for (let i = 1; i < left.length; i += 1) ctx.lineTo(left[i]![0], left[i]![1])
        for (let i = right.length - 1; i >= 0; i -= 1) ctx.lineTo(right[i]![0], right[i]![1])
        ctx.closePath()
        ctx.fill()
      }

      // The pointer, the follower that chases it, and when the pointer last moved.
      const target = { x: 0, y: 0, on: false }
      const chase = { x: 0, y: 0 }
      let lastMove = 0
      let last = 0
      let surface: Element | null = null
      let colour = ''

      const trim = () => {
        // Never longer than TRAIL.length: walk back from the head and drop the rest.
        let run = 0
        for (let i = points.length - 1; i > 0; i -= 1) {
          run += Math.hypot(points[i]!.x - points[i - 1]!.x, points[i]!.y - points[i - 1]!.y)
          if (run > TRAIL.length) {
            points.splice(0, i)
            break
          }
        }
      }

      const frame = (now: number) => {
        raf = 0
        const dt = Math.min(Math.max((now - last) / 1000, 0.001), 0.05)
        last = now
        const idle = now - lastMove > TRAIL.idle
        const reveal = root.dataset.inkReveal === 'true'

        // The follower chases the pointer, slowly while it moves and quickly once it
        // is still, and is sampled once a frame, so the samples are evenly spaced in
        // time however the mouse delivers its events. It is the head square, and the
        // line starts from it.
        if (target.on) {
          const k = 1 - Math.exp(-(idle ? TRAIL.follow.still : TRAIL.follow.moving) * dt)
          chase.x += (target.x - chase.x) * k
          chase.y += (target.y - chase.y) * k
          lead(chase.x, chase.y)
          const previous = points[points.length - 1]
          if (
            !reveal &&
            tag.dataset.on !== 'true' &&
            (!previous || Math.hypot(chase.x - previous.x, chase.y - previous.y) > 0.5)
          ) {
            points.push({ x: chase.x, y: chase.y, age: 0, color: colour })
            if (points.length > TRAIL.max) points.shift()
            trim()
          }
        }
        // While the footer's reveal is open the tiles are the cursor: no trail, and
        // what was drawn goes at once.
        if (reveal) points.length = 0

        // Age, faster once the pointer is still, so the tail retracts instead of
        // lingering.
        const rate = idle ? TRAIL.hurry : 1
        for (const point of points) point.age += dt * rate
        while (points.length && points[0]!.age >= TRAIL.life) points.shift()

        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
        // Each sample is pulled toward the average of its neighbours (1, 2, 1) a couple
        // of times; the ends stay where they are, so the line still meets the pointer.
        let drawn = points.slice()
        for (let pass = 0; pass < TRAIL.relax; pass += 1) {
          drawn = drawn.map((point, i) => {
            const before = drawn[i - 1]
            const after = drawn[i + 1]
            if (!before || !after) return point
            return {
              ...point,
              x: (before.x + 2 * point.x + after.x) / 4,
              y: (before.y + 2 * point.y + after.y) / 4,
            }
          })
        }
        ribbon(drawn)

        // Run while there is a tail to draw or the follower is still catching up.
        const catching = target.on && Math.hypot(target.x - chase.x, target.y - chase.y) > 0.3
        if (points.length || catching) raf = requestAnimationFrame(frame)
      }

      const place = (x: number, y: number) => {
        lens.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(var(--s))`
      }
      const lead = (x: number, y: number) => {
        head.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(var(--hs))`
        // `translate`, not `transform`: the tag's own tilt (rotate) is applied before
        // `transform`, and would turn its position with it.
        tag.style.translate = `${x}px ${y}px`
      }

      const onMove = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse') return
        // Something else owns the screen (the intro, the full-screen menu): no head.
        if (paused()) {
          head.dataset.on = 'false'
          return
        }
        const under = event.target as Element
        place(event.clientX, event.clientY)
        head.dataset.on = 'true'
        const here = under.closest?.('[data-theme]') ?? null
        head.dataset.surface = here?.getAttribute('data-theme') ?? ''
        // The trail's colour is read only when the surface under the pointer changes.
        if (here !== surface || !colour) {
          surface = here
          colour = colourAt(under)
        }
        // A pointer that has just come back starts its line where it is.
        if (!target.on) {
          chase.x = event.clientX
          chase.y = event.clientY
          lead(chase.x, chase.y)
        }
        target.x = event.clientX
        target.y = event.clientY
        target.on = true
        lastMove = performance.now()
        if (!raf) {
          last = performance.now()
          raf = requestAnimationFrame(frame)
        }
      }

      const lensOff = () => {
        lens.dataset.on = 'false'
      }
      // The tag: on at once with its word, off at once, as the reference's.
      const tagOff = () => {
        tag.dataset.on = 'false'
        head.dataset.tagged = 'false'
      }
      const onOver = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse') return
        const tagged = (event.target as Element).closest?.(TAGGED)
        if (tagged && !paused()) {
          const word = tagged.getAttribute('data-cursor-tag') ?? ''
          if (tag.textContent !== word) tag.textContent = word
          tag.dataset.on = 'true'
          head.dataset.tagged = 'true'
          points.length = 0
        } else tagOff()
        const target = (event.target as Element).closest?.(INTERACTIVE)
        if (!target || target.closest(SKIP) || paused()) return lensOff()
        place(event.clientX, event.clientY)
        lens.dataset.on = 'true'
      }
      // Off the page, or the window loses the pointer: nothing may stay behind.
      const onLeave = () => {
        lensOff()
        tagOff()
        head.dataset.on = 'false'
        target.on = false
        points.length = 0
      }

      document.addEventListener('pointermove', onMove, { passive: true })
      document.addEventListener('pointerover', onOver, { passive: true })
      root.addEventListener('pointerleave', onLeave)
      window.addEventListener('blur', onLeave)
      window.addEventListener('resize', size)

      teardown = () => {
        document.removeEventListener('pointermove', onMove)
        document.removeEventListener('pointerover', onOver)
        root.removeEventListener('pointerleave', onLeave)
        window.removeEventListener('blur', onLeave)
        window.removeEventListener('resize', size)
        if (raf) cancelAnimationFrame(raf)
        head.dataset.on = 'false'
        points.length = 0
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        lensOff()
        tagOff()
        teardown = undefined
      }
    }

    const sync = () => {
      if (fine.matches && !reduced.matches) start()
      else teardown?.()
    }
    fine.addEventListener('change', sync)
    reduced.addEventListener('change', sync)
    sync()

    return () => {
      fine.removeEventListener('change', sync)
      reduced.removeEventListener('change', sync)
      teardown?.()
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-trail" />
      <div ref={lensRef} aria-hidden="true" data-on="false" className="pointer-lens" />
      <div ref={headRef} aria-hidden="true" data-on="false" className="pointer-head" />
      <div
        ref={tagRef}
        aria-hidden="true"
        data-on="false"
        className="pointer-tag font-display text-accent-fg"
      />
    </>
  )
}
