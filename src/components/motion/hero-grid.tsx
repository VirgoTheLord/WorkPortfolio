'use client'

import { useEffect, useRef } from 'react'
import './hero-grid.css'

/* The field around the pointer, in cells: lines inside it bend, lines outside
   stay straight. */
const REACH = 2.6
/* The push, in cells. The peak displacement is about 30% of this, near half the
   reach (so about a seventh of a cell, 7px at the desktop cell). Below the reach,
   so the field can never fold a line over its neighbour. */
const PUSH = 0.5
/* Per-frame easing at 60fps: how quickly the field catches the pointer, rises
   and settles. Exponential, so it arrives without overshoot. */
const FOLLOW = 0.2
const RISE = 0.14
const SETTLE = 0.07
/* How long the pointer may rest before the surface settles (ms). */
const REST_MS = 600
/* Spacing of the points a bent line is drawn through (px). */
const STEP = 6

type Colors = { groove: string; lit: string; near: string; nearLit: string }

/*
 * The hero grid, drawn so it can bend (hero-grid.css). The grid is CSS on the
 * hero (hero.css) and stays the page's grid without JavaScript, on touch and for
 * reduced motion. For a fine pointer that can hover, this canvas draws the same
 * grid in the same place (same cell, centre line, hairlines, lit edge and
 * crossings; the same mask), then the hero's CSS grid steps aside.
 *
 * The pointer presses into it: every point within REACH cells of the pointer is
 * pushed outward along the line from the pointer, by an amount that is zero at
 * the pointer, peaks between and falls smoothly to zero at the edge of the field
 * ((1 − r²/R²)², times r/R). The lines part around the pointer like a fine mesh
 * under a fingertip, every crossing stays on both its lines, and nothing outside
 * the field moves. Inside it the grooves also deepen a little in proportion to
 * the pressure (--color-groove-near), so the bend reads as depth.
 *
 * The canvas draws once at rest and again only while something is changing: a
 * requestAnimationFrame loop runs while the field follows the pointer, rises or
 * settles, and stops as soon as it has arrived. The field rises when the pointer
 * moves in the hero and settles (back to the exact rest frame) when it leaves or
 * rests for REST_MS. No React state, no scroll listener.
 */
export function HeroGrid() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const hero = canvas?.closest<HTMLElement>('[data-hero]')
    const ctx = canvas?.getContext('2d')
    if (!canvas || !hero || !ctx) return

    const query = window.matchMedia(
      '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    )
    const scheme = window.matchMedia('(prefers-color-scheme: dark)')

    let width = 0
    let height = 0
    let ratio = 1
    let cell = 0
    let colors: Colors = { groove: '', lit: '', near: '', nearLit: '' }
    // The pointer (target) and the field's centre (eased), in the hero's
    // coordinates; the field's strength and where it is heading.
    let tx = 0
    let ty = 0
    let fx = 0
    let fy = 0
    let strength = 0
    let aim = 0
    let frame = 0
    let last = 0
    let rest = 0
    let live = false

    const read = () => {
      const style = getComputedStyle(canvas)
      const token = (name: string) => style.getPropertyValue(name).trim()
      colors = {
        groove: token('--color-groove'),
        lit: token('--color-groove-lit'),
        near: token('--color-groove-near'),
        nearLit: token('--color-groove-lit-near'),
      }
      cell = parseFloat(token('--cell-px')) || 0
    }

    const measure = () => {
      width = hero.clientWidth
      height = hero.clientHeight
      ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
    }

    /* The field at a point: its displacement and its pressure (0–1). */
    const field = (x: number, y: number): [number, number, number] => {
      if (strength <= 0) return [0, 0, 0]
      const reach = REACH * cell
      const dx = x - fx
      const dy = y - fy
      const d2 = dx * dx + dy * dy
      if (d2 >= reach * reach) return [0, 0, 0]
      const q = 1 - d2 / (reach * reach)
      const pressure = q * q * strength
      const k = (PUSH * cell * pressure) / reach
      return [dx * k, dy * k, pressure]
    }

    /* One line, from (x0, y0) along (ux, uy) for `length`, into the base paths
       (groove and lit edge, offset by the lit side) and, where it is pressed,
       into the near strokes. */
    const line = (
      x0: number,
      y0: number,
      ux: number,
      uy: number,
      length: number,
      groove: Path2D,
      lit: Path2D,
      near: [number, number, number, number, number][],
    ) => {
      // Lit edge: right of a vertical line, below a horizontal one.
      const ox = uy
      const oy = ux
      const reach = REACH * cell
      const across = ux === 0 ? Math.abs(x0 - fx) : Math.abs(y0 - fy)
      if (strength <= 0 || across >= reach) {
        groove.moveTo(x0 + 0.5 * ox, y0 + 0.5 * oy)
        groove.lineTo(x0 + ux * length + 0.5 * ox, y0 + uy * length + 0.5 * oy)
        lit.moveTo(x0 + 1.5 * ox, y0 + 1.5 * oy)
        lit.lineTo(x0 + ux * length + 1.5 * ox, y0 + uy * length + 1.5 * oy)
        return
      }
      // Straight up to the field, bent through it, straight after it.
      const along = ux === 0 ? fy : fx
      const from = Math.max(0, along - reach)
      const to = Math.min(length, along + reach)
      const points: [number, number, number][] = [[x0, y0, 0]]
      for (let t = from; t <= to; t += STEP) {
        const x = x0 + ux * t
        const y = y0 + uy * t
        const [dx, dy, p] = field(x, y)
        points.push([x + dx, y + dy, p])
      }
      points.push([x0 + ux * length, y0 + uy * length, 0])
      for (const [offset, path] of [
        [0.5, groove],
        [1.5, lit],
      ] as const) {
        points.forEach(([x, y], i) => {
          if (i === 0) path.moveTo(x + offset * ox, y + offset * oy)
          else path.lineTo(x + offset * ox, y + offset * oy)
        })
      }
      for (let i = 1; i < points.length - 1; i++) {
        const [ax, ay, ap] = points[i]!
        const [bx, by, bp] = points[i + 1]!
        const p = (ap + bp) / 2
        if (p > 0.02) near.push([ax + 0.5 * ox, ay + 0.5 * oy, bx + 0.5 * ox, by + 0.5 * oy, p])
      }
    }

    const draw = () => {
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      ctx.clearRect(0, 0, width, height)
      if (cell <= 0) return
      const groove = new Path2D()
      const lit = new Path2D()
      const dots = new Path2D()
      const near: [number, number, number, number, number][] = []

      // Columns are centred on the hero's centre line; rows hang from its top.
      const mid = width / 2
      const first = mid - Math.ceil(mid / cell) * cell
      const columns: number[] = []
      for (let x = first; x <= width; x += cell) columns.push(x)
      const rows: number[] = []
      for (let y = 0; y <= height; y += cell) rows.push(y)

      columns.forEach((x) => line(x, 0, 0, 1, height, groove, lit, near))
      rows.forEach((y) => line(0, y, 1, 0, width, groove, lit, near))
      columns.forEach((x) =>
        rows.forEach((y) => {
          const [dx, dy] = field(x, y)
          dots.moveTo(x + dx + 1, y + dy)
          dots.arc(x + dx, y + dy, 1, 0, Math.PI * 2)
        }),
      )

      ctx.lineWidth = 1
      ctx.strokeStyle = colors.lit
      ctx.stroke(lit)
      ctx.strokeStyle = colors.groove
      ctx.stroke(groove)
      ctx.fillStyle = colors.groove
      ctx.fill(dots)
      // The pressed stretch, deeper in proportion to the pressure, with its own
      // lit edge a pixel off.
      for (const [ax, ay, bx, by, p] of near) {
        ctx.globalAlpha = Math.min(p, 1)
        const vertical = Math.abs(bx - ax) < Math.abs(by - ay)
        ctx.strokeStyle = colors.nearLit
        ctx.beginPath()
        ctx.moveTo(ax + (vertical ? 1 : 0), ay + (vertical ? 0 : 1))
        ctx.lineTo(bx + (vertical ? 1 : 0), by + (vertical ? 0 : 1))
        ctx.stroke()
        ctx.strokeStyle = colors.near
        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.lineTo(bx, by)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }

    const tick = (now: number) => {
      const steps = last ? Math.min((now - last) / (1000 / 60), 4) : 1
      last = now
      const ease = (rate: number) => 1 - Math.pow(1 - rate, steps)
      fx += (tx - fx) * ease(FOLLOW)
      fy += (ty - fy) * ease(FOLLOW)
      strength += (aim - strength) * ease(aim > strength ? RISE : SETTLE)
      const arrived =
        Math.abs(tx - fx) < 0.1 && Math.abs(ty - fy) < 0.1 && Math.abs(aim - strength) < 0.002
      if (arrived) {
        fx = tx
        fy = ty
        strength = aim
      }
      draw()
      frame = arrived ? 0 : window.requestAnimationFrame(tick)
    }
    const run = () => {
      if (frame) return
      last = 0
      frame = window.requestAnimationFrame(tick)
    }

    const point = (event: PointerEvent) => {
      const rect = hero.getBoundingClientRect()
      tx = event.clientX - rect.left
      ty = event.clientY - rect.top
    }
    const settle = () => {
      window.clearTimeout(rest)
      aim = 0
      run()
    }
    const onEnter = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      point(event)
      // A fresh press starts under the pointer, not sliding in from the last one.
      if (strength < 0.01) {
        fx = tx
        fy = ty
      }
    }
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      point(event)
      aim = 1
      window.clearTimeout(rest)
      rest = window.setTimeout(settle, REST_MS)
      run()
    }

    const repaint = () => {
      read()
      draw()
    }
    const resize = new ResizeObserver(() => {
      measure()
      repaint()
    })

    const start = () => {
      if (live) return
      live = true
      read()
      measure()
      draw()
      // The canvas is drawn; the CSS grid underneath steps aside.
      hero.dataset.grid = 'live'
      resize.observe(hero)
      hero.addEventListener('pointerenter', onEnter)
      hero.addEventListener('pointermove', onMove, { passive: true })
      hero.addEventListener('pointerleave', settle)
      scheme.addEventListener('change', repaint)
    }
    const stop = () => {
      if (!live) return
      live = false
      delete hero.dataset.grid
      resize.disconnect()
      hero.removeEventListener('pointerenter', onEnter)
      hero.removeEventListener('pointermove', onMove)
      hero.removeEventListener('pointerleave', settle)
      scheme.removeEventListener('change', repaint)
      window.clearTimeout(rest)
      window.cancelAnimationFrame(frame)
      frame = 0
      strength = aim = 0
      canvas.width = canvas.height = 0
    }
    const sync = () => (query.matches ? start() : stop())

    sync()
    query.addEventListener('change', sync)
    return () => {
      query.removeEventListener('change', sync)
      stop()
    }
  }, [])

  return <canvas ref={ref} aria-hidden="true" className="hero-grid" />
}
