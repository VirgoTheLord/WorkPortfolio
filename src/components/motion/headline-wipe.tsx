'use client'

import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import './headline-wipe.css'

/*
 * A headline set one line per entry, wiped in once as it enters the screen
 * (headline-wipe.css). Renders inside the section's own <h2>, so the heading is
 * real text whether or not the wipe plays. Without JavaScript, with reduced
 * motion, or when it is already on screen at load, nothing is armed and the lines
 * are simply there. `delay` (seconds) holds the whole wipe back, so a second
 * headline can follow the first.
 */
export function HeadlineWipe({ lines, delay = 0 }: { lines: readonly string[]; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root || !('IntersectionObserver' in window)) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (root.getBoundingClientRect().top <= window.innerHeight) return

    root.dataset.wipe = 'pending'
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return
      root.dataset.wipe = 'in'
      observer.disconnect()
    })
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  return (
    <span ref={ref} style={delay ? ({ '--wipe-delay': `${delay}s` } as CSSProperties) : undefined}>
      {lines.map((line, i) => (
        <span key={line} className="headline-wipe-line" style={{ '--line': i } as CSSProperties}>
          <span className="headline-wipe-text">{line}</span>
          <span aria-hidden="true" className="headline-wipe-block bg-accent" />
          <span aria-hidden="true" className="headline-wipe-block bg-fg" />
        </span>
      ))}
    </span>
  )
}
