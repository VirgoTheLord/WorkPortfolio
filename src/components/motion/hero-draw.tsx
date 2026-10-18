'use client'

import { useEffect, useRef } from 'react'
import { cellTrail } from '@/lib/motion/cell-trail'

/*
 * Drawing on the hero's grid, for touch screens (hero.css). Phones get none of
 * the hero's own interaction (the grid's bend and the name's halftone both answer
 * hover), so here a finger dragged across the hero lights the cells it passes and
 * each fades away (lib/motion/cell-trail.ts). Drag only: a tap leaves no mark. The
 * trail sits behind the name and the button, so it never covers them or takes a
 * tap. The listeners are passive: the page always scrolls as it would, and the
 * trail stays where it was drawn on the hero.
 *
 * Touch only (no hover, a coarse pointer); nothing for reduced motion, without
 * script, or while the intro plays. Decorative: aria-hidden.
 */
export function HeroDraw() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const hero = canvas?.closest<HTMLElement>('[data-hero]')
    if (!canvas || !hero) return
    if (!window.matchMedia('(hover: none) and (pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const trail = cellTrail(canvas, hero)
    if (!trail) return

    const at = (touch: Touch) => {
      const box = hero.getBoundingClientRect()
      return { x: touch.clientX - box.left, y: touch.clientY - box.top }
    }
    const onStart = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (!touch || document.documentElement.classList.contains('is-intro')) return
      trail.begin(at(touch))
    }
    const onMove = (event: TouchEvent) => {
      const touch = event.touches[0]
      // The prompt goes for the visit with the first stroke.
      if (touch && trail.move(at(touch))) hero.dataset.drawn = 'on'
    }
    const onEnd = () => trail.end()

    const resize = new ResizeObserver(trail.resize)
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
      trail.destroy()
      delete hero.dataset.draw
      delete hero.dataset.drawn
    }
  }, [])

  return <canvas ref={ref} aria-hidden="true" className="hero-draw" />
}
