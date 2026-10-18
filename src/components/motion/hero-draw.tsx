'use client'

import { useEffect, useRef } from 'react'

/* The brush, in cells (a square of BRUSH × BRUSH), and how long a drawn cell
   lasts before it has faded out completely. */
const BRUSH = 2
const LIFE = 600
/* The most cells alive at once: past this the oldest go first. */
const CAP = 1500
/* The hairline between neighbouring cells, as the name's (hero-cells.tsx). */
const GAP = 1
/* Every cell grows in from the centre of its square over GROW ms (an ease-out,
   as the name's cells print), so nothing pops. */
const GROW = 70

/*
 * Drawing on the hero's grid, for touch screens (hero.css). Phones get none of
 * the hero's own interaction (the grid's bend and the name's halftone both answer
 * hover), so here a finger dragged across the hero lights the cells it passes, in
 * the ink colour, a third of a grid square each and on the grid's own lines
 * (columns from the centre line, rows from the top), and each fades out over
 * LIFE. Drag only: nothing is drawn until the finger has travelled half a cell,
 * so a tap leaves no mark. The trail sits behind the name and the button, so it
 * never covers them or takes a tap. The listeners are passive: the page always
 * scrolls as it would, and the trail stays where it was drawn on the hero.
 *
 * Touch only (no hover, a coarse pointer); nothing for reduced motion, without
 * script, or while the intro plays. The canvas draws only while a trail is
 * fading and sleeps once it has gone. Decorative: aria-hidden.
 */
export function HeroDraw() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const hero = canvas?.closest<HTMLElement>('[data-hero]')
    const ctx = canvas?.getContext('2d')
    if (!canvas || !hero || !ctx) return
    if (!window.matchMedia('(hover: none) and (pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let width = 0
    let height = 0
    let ratio = 1
    let cell = 0
    let ox = 0
    let ink = ''
    let frame = 0
    // Where the finger touched down, and the last point drawn once it is a drag.
    let down: { x: number; y: number } | null = null
    let last: { x: number; y: number } | null = null
    // Each lit cell, keyed "column,row", and when it was drawn.
    const alive = new Map<string, number>()

    const size = () => {
      const box = hero.getBoundingClientRect()
      const root = getComputedStyle(document.documentElement)
      const grid = parseFloat(root.getPropertyValue('--spacing-grid')) * parseFloat(root.fontSize)
      width = box.width
      height = box.height
      cell = grid / 3
      // Columns from the hero's centre line, as the grid behind.
      ox = (width / 2) % cell
      ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
    }

    const light = (col: number, row: number, now: number) => {
      const key = `${col},${row}`
      // A cell still growing in keeps its start, so a slow drag does not restart it.
      const was = alive.get(key)
      const born = was !== undefined && now - was < GROW ? was : now
      // Re-inserted, so the map stays in age order for the cap.
      alive.delete(key)
      alive.set(key, born)
    }
    const stamp = (x: number, y: number, now: number) => {
      const col = Math.floor((x - ox) / cell - (BRUSH - 1) / 2)
      const row = Math.floor(y / cell - (BRUSH - 1) / 2)
      for (let dy = 0; dy < BRUSH; dy++) {
        for (let dx = 0; dx < BRUSH; dx++) light(col + dx, row + dy, now)
      }
      while (alive.size > CAP) alive.delete(alive.keys().next().value!)
    }

    // A swipe arrives as sparse points; fill the path between them.
    const stroke = (from: { x: number; y: number }, to: { x: number; y: number }, now: number) => {
      const steps = Math.max(1, Math.ceil(Math.hypot(to.x - from.x, to.y - from.y) / (cell / 2)))
      for (let i = 1; i <= steps; i++) {
        stamp(from.x + ((to.x - from.x) * i) / steps, from.y + ((to.y - from.y) * i) / steps, now)
      }
    }

    const draw = (now: number) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = ink
      const full = (cell - GAP) * ratio
      for (const [key, born] of alive) {
        const age = now - born
        const t = age / LIFE
        if (t >= 1) {
          alive.delete(key)
          continue
        }
        const [col, row] = key.split(',').map(Number) as [number, number]
        // In: grows from the square's centre on an ease-out. Out: holds, then
        // eases away, most of the fade in the second half.
        const grow = 1 - (1 - Math.min(1, age / GROW)) ** 3
        ctx.globalAlpha = grow * (1 - t * t)
        const side = full * (0.35 + 0.65 * grow)
        const cx = (ox + col * cell + cell / 2) * ratio
        const cy = (row * cell + cell / 2) * ratio
        // Whole device pixels, so every square edge is crisp.
        const px = Math.max(1, Math.round(side))
        ctx.fillRect(Math.round(cx - px / 2), Math.round(cy - px / 2), px, px)
      }
      ctx.globalAlpha = 1
    }

    const tick = (now: number) => {
      draw(now)
      frame = alive.size ? requestAnimationFrame(tick) : 0
    }
    const run = () => {
      if (!frame) frame = requestAnimationFrame(tick)
    }

    const at = (touch: Touch) => {
      const box = hero.getBoundingClientRect()
      return { x: touch.clientX - box.left, y: touch.clientY - box.top }
    }
    const onStart = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (!touch || document.documentElement.classList.contains('is-intro')) return
      down = at(touch)
      last = null
    }
    const onMove = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (!touch || !down) return
      const point = at(touch)
      const now = performance.now()
      if (!last) {
        // Not a drag until the finger has travelled half a cell; then the trail
        // starts where it touched down.
        if (Math.hypot(point.x - down.x, point.y - down.y) <= cell / 2) return
        ink = getComputedStyle(hero).color
        hero.dataset.drawn = 'on'
        stamp(down.x, down.y, now)
        last = down
      }
      stroke(last, point, now)
      last = point
      run()
    }
    const onEnd = () => {
      down = null
      last = null
    }

    size()
    const resize = new ResizeObserver(size)
    resize.observe(hero)
    hero.addEventListener('touchstart', onStart, { passive: true })
    hero.addEventListener('touchmove', onMove, { passive: true })
    hero.addEventListener('touchend', onEnd)
    hero.addEventListener('touchcancel', onEnd)
    hero.dataset.draw = 'on'

    return () => {
      resize.disconnect()
      hero.removeEventListener('touchstart', onStart)
      hero.removeEventListener('touchmove', onMove)
      hero.removeEventListener('touchend', onEnd)
      hero.removeEventListener('touchcancel', onEnd)
      if (frame) cancelAnimationFrame(frame)
      delete hero.dataset.draw
      delete hero.dataset.drawn
    }
  }, [])

  return <canvas ref={ref} aria-hidden="true" className="hero-draw" />
}
