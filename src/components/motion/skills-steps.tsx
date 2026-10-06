'use client'

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

/* The reference's mapping from scroll progress to the current step: the first
   sixth of the pinned scroll belongs to the first step, the rest is shared
   evenly by the others. */
const LEAD = 1 / 6

const PINNED = '(min-width: 64rem) and (prefers-reduced-motion: no-preference)'

/*
 * The Skills section's behaviour (layout and motion are CSS, skills.css):
 *   - while pinned (from lg, motion allowed), the scroll position picks the
 *     current step: it is marked data-current, the marker moves to it (turning a
 *     quarter on every move) and the panel strip slides to its panel (--active).
 *     Clicking a step scrolls to its part of the pin.
 * The scroll listener is attached only while the section is on screen.
 */
export function SkillsSteps({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    const section = root?.closest('section')
    if (!root || !section) return
    const steps = Array.from(root.querySelectorAll<HTMLElement>('[data-skills-step]'))
    const marker = root.querySelector<HTMLElement>('[data-skills-marker]')
    const pinned = window.matchMedia(PINNED)

    let current = 0
    let turns = 0
    let frame = 0

    const place = (index: number) => {
      steps.forEach((step, i) => step.toggleAttribute('data-current', i === index))
      root.style.setProperty('--active', String(index))
      const step = steps[index]
      if (marker && step) marker.style.setProperty('--marker-y', `${step.offsetTop}px`)
    }

    const update = () => {
      frame = 0
      if (!pinned.matches) return
      const rect = section.getBoundingClientRect()
      const travel = rect.height - window.innerHeight
      const progress = travel > 0 ? Math.min(Math.max(-rect.top / travel, 0), 1) : 0
      const last = steps.length - 1
      const index =
        progress < LEAD
          ? 0
          : Math.min(Math.floor(((progress - LEAD) / (1 - LEAD)) * last) + 1, last)
      if (index === current) return
      current = index
      turns += 1
      marker?.style.setProperty('--marker-turn', `${turns * 90}deg`)
      place(index)
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    // Listen to scroll only while the section is on screen.
    const visibility = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        window.addEventListener('scroll', onScroll, { passive: true })
        update()
      } else window.removeEventListener('scroll', onScroll)
    })
    visibility.observe(section)

    // Clicking a step scrolls to the middle of its share of the pin.
    const onClick = (event: MouseEvent) => {
      if (!pinned.matches) return
      const step = (event.target as Element).closest<HTMLElement>('[data-skills-step]')
      if (!step) return
      const i = steps.indexOf(step)
      const last = steps.length - 1
      const at = i === 0 ? LEAD / 2 : LEAD + ((1 - LEAD) / last) * (i - 0.5)
      const top = section.getBoundingClientRect().top + window.scrollY
      window.scrollTo({ top: top + at * (section.offsetHeight - window.innerHeight) })
    }
    root.addEventListener('click', onClick)

    // Re-measure on layout changes between the two layouts.
    const onLayout = () => {
      place(current)
      update()
    }
    pinned.addEventListener('change', onLayout)
    window.addEventListener('resize', onLayout)
    place(current)

    return () => {
      visibility.disconnect()
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      root.removeEventListener('click', onClick)
      pinned.removeEventListener('change', onLayout)
      window.removeEventListener('resize', onLayout)
    }
  }, [])

  return (
    <div ref={ref} className="contents">
      {children}
    </div>
  )
}
