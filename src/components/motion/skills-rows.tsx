'use client'

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

/* Where the reading line sits, as a share of the screen's height from the top. */
const LINE = 0.3

/*
 * The Skills list on screens without hover (skills.css). The reference, on a
 * phone, picks one row as the list scrolls past and dims the others: the list's
 * progress past a line near the top of the screen chooses the row, and before or
 * after the list every row is at full strength. This island sets that row as
 * data-current and the list as data-active; the look is CSS. With a fine pointer
 * the rows answer hover instead, in CSS alone, and this island does nothing.
 * The scroll listener is attached only while the list is on screen.
 */
export function SkillsRows({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const list = ref.current?.querySelector<HTMLElement>('[data-skills-rows]')
    if (!list) return
    const rows = Array.from(list.querySelectorAll<HTMLElement>('[data-skills-row]'))
    const touch = window.matchMedia('(hover: none)')

    let current = -1
    let frame = 0

    const mark = (index: number) => {
      if (index === current) return
      current = index
      rows.forEach((row, i) => row.toggleAttribute('data-current', i === index))
      list.toggleAttribute('data-active', index >= 0)
    }

    const update = () => {
      frame = 0
      if (!touch.matches) return mark(-1)
      const rect = list.getBoundingClientRect()
      const progress = (window.innerHeight * LINE - rect.top) / rect.height
      mark(progress < 0 || progress >= 1 ? -1 : Math.floor(progress * rows.length))
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    const visibility = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        window.addEventListener('scroll', onScroll, { passive: true })
        update()
      } else {
        window.removeEventListener('scroll', onScroll)
        mark(-1)
      }
    })
    visibility.observe(list)
    touch.addEventListener('change', update)

    return () => {
      visibility.disconnect()
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      touch.removeEventListener('change', update)
      mark(-1)
    }
  }, [])

  return (
    <div ref={ref} className="contents">
      {children}
    </div>
  )
}
