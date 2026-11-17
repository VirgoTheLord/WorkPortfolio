'use client'

import type { MouseEvent } from 'react'
import { DiagonalLink } from '@/components/library/cairn/diagonal-link'

type Props = { label: string; className?: string }

/*
 * Back to the top, as a scroll rather than a jump (owner's note): the page
 * glides up, and focus goes to the top of the page, so the next Tab starts
 * there. A plain #top link without script; with reduced motion it jumps.
 * Drawn as Cairn's diagonal link, like the foot's other links.
 */
export function BackToTop({ label, className }: Props) {
  const up = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: still ? 'auto' : 'smooth' })
    document.getElementById('top')?.focus({ preventScroll: true })
  }
  return <DiagonalLink href="#top" onClick={up} label={label} className={className} />
}
