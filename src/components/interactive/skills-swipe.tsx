'use client'

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

/*
 * The phone's skills carousel (sections/skills.css): the cards are a row that
 * scrolls sideways and snaps, in CSS. This island only keeps the marks under it
 * on the card in view: one passive scroll listener on the row, at most one
 * update a frame. Without it the cards still swipe; the marks are decoration.
 */
export function SkillsSwipe({ count, children }: { count: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    const rail = root?.querySelector<HTMLElement>('[data-skills-rail]')
    const marks = Array.from(root?.querySelectorAll<HTMLElement>('[data-skills-mark]') ?? [])
    if (!rail || !marks.length) return
    let frame = 0
    let current = -1

    const update = () => {
      frame = 0
      const span = rail.scrollWidth - rail.clientWidth
      const at = span > 0 ? Math.round((rail.scrollLeft / span) * (count - 1)) : 0
      if (at === current) return
      marks[current]?.removeAttribute('data-on')
      marks[at]?.setAttribute('data-on', '')
      current = at
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    update()
    rail.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.cancelAnimationFrame(frame)
      rail.removeEventListener('scroll', onScroll)
    }
  }, [count])

  return (
    <div ref={ref}>
      {children}
      <div aria-hidden="true" className="skills-marks">
        {Array.from({ length: count }, (_, i) => (
          <i key={i} data-skills-mark />
        ))}
      </div>
    </div>
  )
}
