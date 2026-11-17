'use client'

import type { MouseEvent, ReactNode } from 'react'

type Props = { children: ReactNode; className?: string }

/*
 * Back to the top, as a scroll rather than a jump (owner's note): the page
 * glides up, and focus goes to the top of the page, so the next Tab starts
 * there. A plain #top link without script; with reduced motion it jumps.
 */
export function BackToTop({ children, className }: Props) {
  const up = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: still ? 'auto' : 'smooth' })
    document.getElementById('top')?.focus({ preventScroll: true })
  }
  return (
    <a href="#top" onClick={up} className={className}>
      {children}
    </a>
  )
}
