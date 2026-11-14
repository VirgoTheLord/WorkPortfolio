'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  label: string
  parts: readonly {
    id: string
    title: string
    sections: readonly { id: string; heading: string }[]
  }[]
}

/*
 * The terms page's index rail (app/legal): every part and clause in a column
 * beside the text, from lg, standing in view while the page scrolls. The clause
 * being read is marked by one red bar that glides along the rail's line to it
 * (legal.css), as the compact site's index marks its section. Plain links
 * without script; with it, an IntersectionObserver marks the clause crossing a
 * line just below the top of the screen (where a jump lands it). Nothing scrolls by itself.
 */
export function LegalRail({ label, parts }: Props) {
  const [current, setCurrent] = useState<string | null>(null)
  const list = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const clauses = parts
      .flatMap((part) => part.sections.map((section) => `${part.id}-${section.id}`))
      .map((id) => document.getElementById(id))
      .filter((clause): clause is HTMLElement => clause !== null)
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setCurrent(entry.target.id)
      },
      { rootMargin: '-12% 0px -87% 0px' },
    )
    clauses.forEach((clause) => observer.observe(clause))

    // The last clauses can never scroll up to the line: at the foot of the page
    // the clause jumped to (if it is on screen) is the one being read, else the
    // last.
    const atFoot = () => {
      const root = document.documentElement
      if (window.scrollY + window.innerHeight < root.scrollHeight - 2) return
      const target = clauses.find((clause) => `#${clause.id}` === window.location.hash)
      const shown = target && target.getBoundingClientRect().top < window.innerHeight
      setCurrent((shown ? target : clauses.at(-1))?.id ?? null)
    }
    // A jump to a clause already on screen at the foot does not scroll.
    window.addEventListener('scroll', atFoot, { passive: true })
    window.addEventListener('hashchange', atFoot)
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', atFoot)
      window.removeEventListener('hashchange', atFoot)
    }
  }, [parts])

  // Move the one bar level with the current clause, and as tall as its link.
  useEffect(() => {
    const rail = list.current
    const link = rail?.querySelector<HTMLElement>('[aria-current]')
    if (!rail || !link) return
    rail.style.setProperty('--bar-y', `${link.offsetTop}px`)
    rail.style.setProperty('--bar-h', `${link.offsetHeight}px`)
    rail.dataset.marked = ''
  }, [current])

  return (
    <nav aria-label={label} className="legal-rail">
      <p
        aria-hidden="true"
        className="legal-rail-label font-label text-label text-fg-muted uppercase"
      >
        {label}
      </p>
      <div ref={list} className="legal-rail-list">
        <span aria-hidden="true" className="legal-rail-bar" />
        {parts.map((part) => (
          <div key={part.id} className="legal-rail-group">
            <a href={`#${part.id}`} className="legal-rail-part">
              {part.title}
            </a>
            <ol>
              {part.sections.map((section) => {
                const id = `${part.id}-${section.id}`
                return (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      aria-current={current === id ? 'location' : undefined}
                      className="legal-rail-link"
                    >
                      {section.heading}
                    </a>
                  </li>
                )
              })}
            </ol>
          </div>
        ))}
      </div>
    </nav>
  )
}
