'use client'

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { loadScrollTrigger } from '@/lib/motion/gsap'

/* How far each piece is held below its place, in pixels per pixel of scroll the
   reference spends settling them, from the mark and then the four columns left to
   right. Measured on neuemontreal.com: the columns lag in a ratio of about 1 : 2 :
   4 : 6 and the mark sits between the first two (the reference's is a ring). A narrow
   screen has less to spend, so the lag is gentler. */
const RATES = { full: [0.31, 0.225, 0.445, 0.885, 1.33], compact: [0.2, 0.15, 0.3, 0.45, 0.6] }

/* The distance, as a share of the screen's height, the reference spends settling
   them: from the footer's top at the bottom edge to 78% down (about 200px of it
   showing). The offsets are sized by this and kept; the range they settle over is
   longer (RANGE_END), so the same movement is spread over more scroll and is
   slower. */
const TRAVEL = 0.22

/* Where the footer's top is when the pieces have settled: 40% down the screen (30%
   on a narrow one, where the page ends sooner). Clamped to the end of the page, so
   the settled footer never waits on scroll the page cannot give. */
const RANGE_END = { full: 'clamp(top 40%)', compact: 'clamp(top 30%)' }

/* How long the animation takes to catch up with the scroll, in seconds. Not zero:
   a little catch-up is what makes the motion glide instead of following the wheel
   in steps. It still comes to rest exactly where the scroll is, and runs back the
   same way. */
const GLIDE = 1

/* The bottom of the footer comes in more slowly still: its catch-up is five times
   as long. The catch-up is front-loaded (most of it happens in the first third), so
   this is what makes the name keep rising for a second or two after a flick of the
   wheel instead of arriving in a blink. The page ends where the name finishes, so
   there is only so much scroll to spend on it, and this is how it is stretched. */
const NAME_GLIDE = 5

/*
 * The footer's scroll scene, scrubbed to the scroll position, so it is the same
 * motion going down and coming back up, wherever the visitor turns round. Nothing is
 * triggered once and left finished.
 *
 * What the reference does, measured, and what is taken from it: its footer is in
 * the ordinary flow (no pinning); its mark and four columns are each held below
 * their places in proportion to the footer's remaining travel (RATES), and settle
 * together as it comes up. That is the first timeline here, only transform moving.
 * Ours is slower than the reference (the same offsets over a longer stretch of
 * scroll) and glides (GLIDE).
 *
 * Of our own, which the reference's footer was not seen to have, a second timeline
 * for the bottom of the footer, from the moment it comes into view until it is
 * fully on screen: the hairline draws itself in, the name rises a letter at a time
 * from behind its masks, and the credits rise after it. Every range is clamped to
 * the end of the page.
 *
 * Without JavaScript, or with reduced motion, none of this runs: the footer is
 * simply there. The scene reads the browser's scroll, so a
 * smooth-scroll layer can be added later by calling ScrollTrigger.update from its
 * scroll event.
 */
export function FooterScene({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    const footer = root?.closest('footer')
    if (!root || !footer) return

    let cancelled = false
    let revert: (() => void) | undefined

    void loadScrollTrigger().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return
      const mm = gsap.matchMedia()
      mm.add(
        {
          full: '(min-width: 48rem) and (prefers-reduced-motion: no-preference)',
          compact: '(max-width: 47.99rem) and (prefers-reduced-motion: no-preference)',
        },
        (context) => {
          const size = context.conditions?.full ? 'full' : 'compact'
          const all = (selector: string) => gsap.utils.toArray<HTMLElement>(selector, root)
          // 1. The mark and the four columns, held back and let go as the footer rises.
          const settle = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: footer,
              start: 'clamp(top bottom)',
              end: RANGE_END[size],
              scrub: GLIDE,
              invalidateOnRefresh: true,
            },
          })
          const pieces = [...all('[data-footer-badge]'), ...all('[data-footer-column]')]
          pieces.forEach((piece, index) => {
            const rate = RATES[size][index] ?? 0
            settle.fromTo(
              piece,
              { y: () => rate * window.innerHeight * TRAVEL },
              { y: 0, immediateRender: true },
              0,
            )
          })

          // 2. The bottom: the rule draws, the name rises letter by letter, the
          // credits follow. Their start states are set outright, because a staggered
          // fromTo only applies the start state to the first of its targets until the
          // playhead reaches the rest, which would leave most of the letters in view
          // before their turn.
          const bottom = root.querySelector<HTMLElement>('.footer-bottom')
          if (bottom) {
            const rule = all('[data-footer-rule]')
            const letters = all('[data-footer-letter]')
            const credits = all('[data-footer-credit]')
            gsap.set(rule, { scaleX: 0 })
            gsap.set([...letters, ...credits], { yPercent: 118 })

            const rise = gsap.timeline({
              scrollTrigger: {
                trigger: bottom,
                start: 'clamp(top 125%)',
                end: 'clamp(bottom bottom)',
                scrub: NAME_GLIDE,
                invalidateOnRefresh: true,
              },
            })
            rise.to(rule, { scaleX: 1, ease: 'power2.inOut', duration: 0.35 }, 0)
            rise.to(
              letters,
              { yPercent: 0, ease: 'power3.out', duration: 0.8, stagger: 0.075 },
              0.15,
            )
            rise.to(
              credits,
              { yPercent: 0, ease: 'power2.out', duration: 0.5, stagger: 0.15 },
              1.35,
            )
          }
        },
      )
      revert = () => mm.revert()
      // Type metrics settle once the faces are in; measure the ranges again then.
      void document.fonts.ready.then(() => {
        if (!cancelled) ScrollTrigger.refresh()
      })
    })

    return () => {
      cancelled = true
      revert?.()
    }
  }, [])

  return (
    <div ref={ref} className="contents">
      {children}
    </div>
  )
}
