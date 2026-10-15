'use client'

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import './rise.css'

/*
 * The Skills pages' entrance, from the reference (studionamma.com): each line,
 * label or block marked `data-rise` inside this island rises once into place as it
 * reaches the screen, out of a mask its parent provides (rise.css). Nothing
 * reverses on the way back up, as on the reference.
 *
 * `at` is how far up the screen an element must come before it rises, as a share
 * of the screen's height from the bottom (0: as soon as it shows).
 *
 * Only elements still below the fold at mount are armed, so the server HTML
 * carries no hidden state: without JavaScript, with reduced motion, or for
 * anything already on screen, the content is simply there.
 */
export function Rise({ children, at = 0 }: { children: ReactNode; at?: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root || !('IntersectionObserver' in window)) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const line = window.innerHeight * (1 - at)
    const pending = Array.from(root.querySelectorAll<HTMLElement>('[data-rise]')).filter(
      (el) => el.getBoundingClientRect().top > line,
    )
    if (!pending.length) return

    // A masked line is watched through its parent, its mask: a line that has
    // dropped out of its mask is clipped away entirely, and the observer never
    // counts a fully clipped element as on screen. Blocks that fade or open in
    // place have no mask and are watched themselves.
    const waiting = new Map<Element, HTMLElement[]>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          for (const el of waiting.get(entry.target) ?? []) el.dataset.rise = 'in'
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: `0px 0px ${-at * 100}% 0px` },
    )
    for (const el of pending) {
      el.dataset.rise = 'pending'
      const masked = !el.dataset.riseAs || el.dataset.riseAs === 'label'
      const mask = (masked && el.parentElement) || el
      waiting.set(mask, [...(waiting.get(mask) ?? []), el])
      observer.observe(mask)
    }
    // Armed elements stay armed: a Strict Mode remount finds them below the fold
    // again and observes them anew, with nothing shown and hidden in between.
    return () => observer.disconnect()
  }, [at])

  return (
    <div ref={ref} className="contents">
      {children}
    </div>
  )
}
