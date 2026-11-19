'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/* What arrives with a blur (keep in step with compact.css, "Arrival"). The
   first screen arrives with it too (owner's note: the blur on every arrival,
   the top line and the opening sentence first). */
const ARRIVING = [
  '.cp-who',
  '.cp-contour',
  '.cp-top-meta',
  '.cp-lede',
  '.cp-reach',
  '.cp-block-head',
  '.cp-list > li',
  '.cp-work-item',
  '.cp-keycaps > li',
  '.cp-strip',
  '.cp-foot > :not(.cp-dominoes)',
  '.cp-crumbs',
  '.cp-piece-head > *',
  '.cp-stage',
  '.cp-section > .cp-block-head',
  '.cp-steps > li',
  '.cp-rows > div',
  '.cp-pager',
  '.cp-bench-item',
].join(',')

/* The opening sequence (what is on screen on arrival): it waits a beat, then
   each thing starts a step after the one before and takes a little longer
   than it, so the page settles slowly. What scrolls in later comes in at the
   opening's first pace. In ms. */
const BEAT = 200
const STEP = 140
const LONGEST_WAIT = 2400
const FIRST_TAKES = 1400
const EACH_LONGER = 90
const LONGEST_TAKES = 2600
const FONT_WAIT = 600

/*
 * The compact site's arrival (owner's pick: blur, then sharp): everything
 * comes in out of a blur, one thing after another; what is below the screen
 * does the same as it scrolls into view, once. The hidden state is CSS, keyed
 * off the `js` class the root layout sets before first paint, so nothing
 * shows and then vanishes; this only says when each thing is in, and how
 * long it takes.
 *
 * It starts over on every arrival: a page load, a link, and the browser's
 * back and forward too, whether the router keeps the page or the browser
 * restores it from its back-forward cache (`pageshow`), and the arrows
 * between places on one page (`popstate`). Without starting
 * over, a page brought back half-revealed played half an entrance. With
 * reduced motion CSS never hides anything, and this does nothing.
 */
export function BlurReveal() {
  const path = usePathname()

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const html = document.documentElement
    // Too late: the root layout already showed the page as it is (.cp-still),
    // and hiding it again now would blank what the visitor is reading.
    if (html.classList.contains('cp-still')) return
    html.classList.add('cp-live')
    const root = document.querySelector('.cp')
    if (!root) return

    let seen: IntersectionObserver | null = null
    let alive = true

    const start = () => {
      seen?.disconnect()
      const all = [...root.querySelectorAll<HTMLElement>(ARRIVING)]
      all.forEach((el) => el.removeAttribute('data-in'))
      // Settle the hidden state now, so the entrance always starts from it
      // (without this a quick return could mark things in before the browser
      // had seen them out, and they would simply appear).
      void root.getBoundingClientRect()
      let opening = true
      seen = new IntersectionObserver(
        (entries) => {
          const arriving = entries
            .filter((entry) => entry.isIntersecting)
            .map((entry) => entry.target as HTMLElement)
            .sort((a, b) =>
              a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
            )
          arriving.forEach((el, i) => {
            const wait = opening ? Math.min(BEAT + i * STEP, LONGEST_WAIT) : i * STEP
            const takes = opening
              ? Math.min(FIRST_TAKES + i * EACH_LONGER, LONGEST_TAKES)
              : FIRST_TAKES
            el.style.setProperty('--cp-in-delay', `${wait}ms`)
            el.style.setProperty('--cp-in-time', `${takes}ms`)
            el.setAttribute('data-in', '')
            seen?.unobserve(el)
          })
          // Only the first batch is the opening; later ones come as they scroll in.
          if (arriving.length) opening = false
        },
        { rootMargin: '0px 0px -6% 0px', threshold: 0.12 },
      )
      all.forEach((el) => seen?.observe(el))
    }

    // Start once the type is in, so nothing arrives and then reflows, but
    // not later than FONT_WAIT: a slow font must not keep the page blank.
    void Promise.race([
      document.fonts.ready,
      new Promise((done) => setTimeout(done, FONT_WAIT)),
    ]).then(() => {
      if (alive) start()
    })
    const restored = (event: PageTransitionEvent) => {
      if (event.persisted) start()
    }
    window.addEventListener('pageshow', restored)
    // The back and forward arrows within one page (the search adds #section
    // to the address) arrive here without a new path.
    const stepped = () => start()
    window.addEventListener('popstate', stepped)

    return () => {
      alive = false
      seen?.disconnect()
      window.removeEventListener('pageshow', restored)
      window.removeEventListener('popstate', stepped)
    }
  }, [path])

  return null
}
