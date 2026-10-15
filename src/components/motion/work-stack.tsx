'use client'

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { loadScrollTrigger } from '@/lib/motion/gsap'

/* The headline enters the way the hero's name does (motion/hero-intro.tsx): per
   line, an accent block runs across it and a text-coloured block follows 0.1s
   behind; the line switches on under them and they leave to the right in the
   same order. Lines 0.15s apart. It plays once the headline's top is this far up
   the screen. */
const CROSS = { duration: 0.45, ease: 'power3.inOut' }
const LINE_GAP = 0.15
const WIPE_AT = 0.15

/* The stack only exists here (work.css), so the dimming does too. */
const STACKED =
  '(min-width: 64rem) and (min-height: 40rem) and (prefers-reduced-motion: no-preference)'

/*
 * Selected Work's two pieces of motion (the layout is CSS, work.css):
 *
 * - The headline is wiped in once, line by line, as it reaches the screen. Only
 *   armed if the headline is still below that line at mount, so the server HTML
 *   carries no hidden state: without JavaScript, with reduced motion, or when it
 *   is already on screen, the lines are simply there.
 * - Where the cards stack, each card's text fades as the next card slides over it,
 *   tied directly to the scroll as on the reference: fully there when the card
 *   comes to rest, gone when the next one has covered it. Every card is the same
 *   height and sticks at the same top, so card i rests from i card-heights into
 *   the list; one ScrollTrigger over the list sets every card's opacity from that.
 *   The last card is never covered.
 */
export function WorkStack({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    let cancelled = false
    let revert: (() => void) | undefined
    let observer: IntersectionObserver | undefined

    const lines = Array.from(root.querySelectorAll<HTMLElement>('.work-line'))
    const heading = lines[0]?.closest('h2')
    const armWipe =
      heading &&
      'IntersectionObserver' in window &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
      heading.getBoundingClientRect().top > window.innerHeight * (1 - WIPE_AT)

    void loadScrollTrigger().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return
      const ctx = gsap.context(() => {
        if (armWipe) {
          const texts = lines.map((line) => line.querySelector('[data-work-line-text]'))
          gsap.set(texts, { opacity: 0 })
          observer = new IntersectionObserver(
            ([entry]) => {
              if (!entry?.isIntersecting) return
              observer?.disconnect()
              ctx.add(() => {
                const tl = gsap.timeline()
                lines.forEach((line, i) => {
                  const text = line.querySelector('[data-work-line-text]')
                  const accent = line.querySelector('[data-work-block="lead"]')
                  const ink = line.querySelector('[data-work-block="trail"]')
                  const at = i * LINE_GAP
                  tl.fromTo(
                    accent,
                    { scaleX: 0, transformOrigin: '0% 50%' },
                    { scaleX: 1, ...CROSS },
                    at,
                  )
                  tl.fromTo(
                    ink,
                    { scaleX: 0, transformOrigin: '0% 50%' },
                    { scaleX: 1, ...CROSS },
                    at + 0.1,
                  )
                  tl.set(text, { opacity: 1 }, at + 0.5)
                  tl.set([accent, ink], { transformOrigin: '100% 50%' }, at + 0.5)
                  tl.to(ink, { scaleX: 0, ...CROSS }, at + 0.5)
                  tl.to(accent, { scaleX: 0, ...CROSS }, at + 0.6)
                })
              })
            },
            { rootMargin: `0px 0px ${-WIPE_AT * 100}% 0px` },
          )
          observer.observe(heading)
        }
      }, root)

      const mm = gsap.matchMedia()
      mm.add(STACKED, () => {
        const list = root.querySelector<HTMLElement>('[data-work-list]')
        const items = Array.from(root.querySelectorAll<HTMLElement>('.work-item'))
        const bodies = items.map((item) => item.querySelector<HTMLElement>('[data-work-body]'))
        if (!list || items.length < 2) return

        const covers = items.length - 1
        const height = () => items[0]!.offsetHeight
        const apply = (progress: number) => {
          const at = progress * covers
          bodies.forEach((body, i) => {
            if (!body || i === covers) return
            body.style.opacity = String(1 - Math.min(1, Math.max(0, at - i)))
          })
        }
        const st = ScrollTrigger.create({
          trigger: list,
          start: 'top top',
          end: () => `+=${covers * height()}`,
          invalidateOnRefresh: true,
          onUpdate: (self) => apply(self.progress),
          onRefresh: (self) => apply(self.progress),
        })
        apply(st.progress)

        return () => {
          st.kill()
          bodies.forEach((body) => body?.style.removeProperty('opacity'))
        }
      })

      revert = () => {
        observer?.disconnect()
        ctx.revert()
        mm.revert()
      }
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
