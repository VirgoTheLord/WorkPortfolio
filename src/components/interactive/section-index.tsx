'use client'

import { useEffect, useRef, useState } from 'react'
import { RollText } from '@/components/ui/roll-text'

type Props = {
  label: string
  items: readonly { id: string; title: string; number: string }[]
}

/*
 * The compact site's margin index (DESIGN.md §5b, after karthikponna.me's): the
 * sections in the left margin from 80rem, the one being read marked by one
 * red square that glides from entry to entry with a little spring
 * (compact.css). Plain links without script; with it, an IntersectionObserver
 * marks the section crossing a line a third of the way down the screen. Nothing
 * scrolls by itself.
 */
export function SectionIndex({ label, items }: Props) {
  const [current, setCurrent] = useState<string | null>(null)
  const list = useRef<HTMLOListElement>(null)

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => section !== null)
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setCurrent(entry.target.id)
      },
      { rootMargin: '-33% 0px -66% 0px' },
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [items])

  // Move the one marker level with the current entry.
  useEffect(() => {
    const ol = list.current
    const link = ol?.querySelector<HTMLElement>('[aria-current]')
    if (!ol || !link) return
    ol.style.setProperty('--marker', `${link.offsetTop + link.offsetHeight / 2}px`)
    ol.dataset.marked = ''
  }, [current])

  return (
    <nav aria-label={label} className="cp-index">
      <p aria-hidden="true" className="cp-index-label font-label">
        {label}
      </p>
      <ol ref={list} className="cp-index-list">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={current === item.id ? 'location' : undefined}
              className="cp-index-link"
            >
              <span className="cp-index-number font-label">{item.number}</span>
              <RollText>{item.title}</RollText>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
