'use client'

import { useEffect, useRef, useState } from 'react'

/* A domino, in CSS pixels: its size, the gap between neighbours, its pips. */
const TALL = 24
const WIDE = 6
const PITCH = 12
const PIPS = [5, 9, TALL - 6]
/* How long they lie fallen before standing back up, and how far apart they rise (s). */
const LIE = 1.6
const RISE_STEP = 0.03
/* A move of fewer than this many pixels between two events does not push. */
const PUSH = 0.25

type Domino = { x: number; a: number; v: number; dir: number }
type Props = { hint: string }

/*
 * The foot's last line (owner's pick of seven): a row of small dominoes
 * standing along the bottom edge of the page. Push through them, with a mouse
 * or a finger, and they fall in a chain the way you moved, each knocking the
 * next until it leans on it; a moment after they settle they stand back up, one
 * after another, from the far end. Kept quiet (owner's note): small, and in
 * the muted grey, with a little note above inviting the push, which goes once
 * they have been pushed. Decoration: hidden from assistive tech, and with
 * reduced motion they simply stand. It draws only while one is moving.
 */
export function DominoRow({ hint }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [pushed, setPushed] = useState(false)

  useEffect(() => {
    const cv = canvas.current
    const ctx = cv?.getContext('2d')
    if (!cv || !ctx) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let row: Domino[] = []
    let W = 0
    let H = 0
    let settled = 0
    let rising = -1
    let raf = 0
    let last = 0
    let pointer: { x: number; t: number } | null = null
    // The angle at which a falling domino comes to lean on its neighbour.
    const lean = Math.atan2(PITCH - WIDE, TALL) + 0.55

    const size = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      W = cv.clientWidth
      H = cv.clientHeight
      cv.width = Math.round(W * ratio)
      cv.height = Math.round(H * ratio)
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      const n = Math.max(1, Math.floor((W - PITCH) / PITCH))
      const start = (W - (n - 1) * PITCH) / 2
      row = Array.from({ length: n }, (_, i) => ({ x: start + i * PITCH, a: 0, v: 0, dir: 0 }))
      rising = -1
      settled = 0
    }

    const draw = () => {
      const style = getComputedStyle(cv)
      const ink = style.getPropertyValue('--color-fg-muted').trim()
      const paper = style.getPropertyValue('--color-bg').trim()
      ctx.clearRect(0, 0, W, H)
      ctx.globalAlpha = 0.55
      for (const d of row) {
        const pivot = d.a >= 0 ? d.x + WIDE / 2 : d.x - WIDE / 2
        ctx.save()
        ctx.translate(pivot, H)
        ctx.rotate(d.a)
        ctx.translate(-pivot, -H)
        ctx.fillStyle = ink
        ctx.beginPath()
        ctx.roundRect(d.x - WIDE / 2, H - TALL, WIDE, TALL, 1.5)
        ctx.fill()
        ctx.fillStyle = paper
        ctx.fillRect(d.x - WIDE / 2 + 1.5, H - TALL / 2 - 0.4, WIDE - 3, 0.8)
        for (const y of PIPS) {
          ctx.beginPath()
          ctx.arc(d.x, H - TALL + y, 1.1, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }
    }

    const step = (now: number) => {
      raf = 0
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60)
      last = now
      let moving = false
      if (rising < 0) {
        row.forEach((d, i) => {
          if (d.dir === 0) return
          d.v += Math.sin(Math.abs(d.a) + 0.15) * 26 * d.dir * dt
          d.a += d.v * dt
          const next = row[i + d.dir]
          const limit = next ? lean : 1.45
          if (Math.abs(d.a) >= limit) {
            d.a = limit * d.dir
            d.v = 0
            if (next && next.dir === 0) {
              next.dir = d.dir
              next.v = 2.6 * d.dir
            }
          } else moving = true
        })
        if (!moving && row.some((d) => d.dir !== 0)) {
          settled += dt
          if (settled > LIE) {
            rising = 0
            settled = 0
          }
          moving = true
        }
      } else {
        rising += dt
        let up = true
        row.forEach((d, i) => {
          // The far end of the fall rises first.
          const turn = d.dir > 0 ? row.length - i : i
          if (rising < turn * RISE_STEP) {
            if (d.dir !== 0) up = false
            return
          }
          d.a += (0 - d.a) * Math.min(1, dt * 14)
          if (Math.abs(d.a) < 0.01) {
            d.a = 0
            d.dir = 0
            d.v = 0
          } else up = false
        })
        if (up) rising = -1
        moving = !up
      }
      draw()
      if (moving) raf = requestAnimationFrame(step)
      else last = 0
    }
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(step)
    }

    // A move across the row pushes the domino under it the way it went.
    const push = (event: PointerEvent) => {
      const box = cv.getBoundingClientRect()
      const x = event.clientX - box.left
      const y = box.bottom - event.clientY
      const now = performance.now()
      const before = pointer
      pointer = { x, t: now }
      if (!before || rising >= 0 || y > TALL + 10) return
      const speed = (x - before.x) / Math.max(8, now - before.t)
      if (Math.abs(speed) < PUSH) return
      for (const d of row) {
        if (d.dir === 0 && Math.abs(d.x - x) < WIDE) {
          d.dir = Math.sign(speed)
          d.v = 3 * d.dir
          setPushed(true)
          wake()
        }
      }
    }
    const leave = () => {
      pointer = null
    }

    size()
    draw()
    const resize = new ResizeObserver(() => {
      size()
      draw()
    })
    resize.observe(cv)
    // The mode is a class or attribute on <html> (lib/theme.ts), or the system's.
    const modes = new MutationObserver(draw)
    modes.observe(document.documentElement, { attributeFilter: ['data-theme', 'class'] })
    const scheme = window.matchMedia('(prefers-color-scheme: dark)')
    scheme.addEventListener('change', draw)
    if (!still) {
      cv.addEventListener('pointermove', push)
      cv.addEventListener('pointerdown', push)
      cv.addEventListener('pointerleave', leave)
      cv.addEventListener('pointerup', leave)
    }

    return () => {
      cancelAnimationFrame(raf)
      resize.disconnect()
      modes.disconnect()
      scheme.removeEventListener('change', draw)
      cv.removeEventListener('pointermove', push)
      cv.removeEventListener('pointerdown', push)
      cv.removeEventListener('pointerleave', leave)
      cv.removeEventListener('pointerup', leave)
    }
  }, [])

  return (
    <div aria-hidden="true" className="cp-dominoes">
      <p className="cp-dominoes-hint" data-gone={pushed || undefined}>
        {hint}
      </p>
      <canvas ref={canvas} />
    </div>
  )
}
