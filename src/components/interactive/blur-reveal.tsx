'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/* What arrives with a blur (keep in step with compact.css, "Arrival"). */
const ARRIVING = [
  '.cp-who',
  '.cp-contour',
  '.cp-top-meta',
  '.cp-lede',
  '.cp-reach',
  '.cp-block-head',
  '.cp-list > li',
  '.cp-keycaps > li',
  '.cp-thing',
  '.cp-foot > *',
  '.cp-crumbs',
  '.cp-piece-head > *',
  '.cp-stage',
  '.cp-head',
  '.cp-steps > li',
  '.cp-rows > div',
  '.cp-pager',
  '.cp-bench-item',
].join(',')

/* The gap between things arriving together, and the most any one waits;
   the first arrival waits a beat for the page to settle. */
const STAGGER = 120
const MOST = 1800
const FIRST = 150

/*
 * The compact site's arrival (owner's pick: blur, then sharp): everything
 * comes in out of a blur, a little after the thing before it; what is below
 * the screen does the same as it scrolls into view, once. The hidden state is
 * CSS, keyed off the `js` class the root layout sets before first paint, so
 * nothing shows and then vanishes; this only says when each thing is in.
 * Runs again on each page of the compact site. With reduced motion CSS never
 * hides anything, and this does nothing.
 */
export function BlurReveal() {
  const path = usePathname()

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const root = document.querySelector('.cp')
    if (!root) return
    const waiting = [...root.querySelectorAll<HTMLElement>(ARRIVING)].filter(
      (el) => !el.hasAttribute('data-in'),
    )
    let first = FIRST
    const seen = new IntersectionObserver(
      (entries) => {
        const arriving = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target as HTMLElement)
          .sort((a, b) =>
            a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
          )
        arriving.forEach((el, i) => {
          el.style.setProperty('--cp-in-delay', `${Math.min(first + i * STAGGER, MOST)}ms`)
          el.setAttribute('data-in', '')
          seen.unobserve(el)
        })
        // Only the page's first arrival waits; later ones come as they scroll in.
        first = 0
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.12 },
    )
    // Start once the type is in, so nothing arrives and then reflows.
    let alive = true
    void document.fonts.ready.then(() => {
      if (alive) waiting.forEach((el) => seen.observe(el))
    })
    return () => {
      alive = false
      seen.disconnect()
    }
  }, [path])

  return null
}
