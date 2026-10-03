'use client'

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { loadScrollTrigger, motion } from '@/lib/motion/gsap'

type Loaded = Awaited<ReturnType<typeof loadScrollTrigger>>
type Gsap = Loaded['gsap']

/* Text reveals share the masked wipe used across the site; negative insets keep
   ascenders, descenders and tight tracking unclipped. */
const MASK_HIDDEN = 'inset(0% 0% 100% 0%)'
const MASK_SHOWN = 'inset(-0.2em -0.1em -0.3em -0.1em)'

/* The one scroll-linked effect: the image drifts this far (percent of its own
   height) from one end of its travel to the other. The overscan in work.css is
   larger, so an edge never shows. */
const DRIFT = 2

/*
 * Selected Work motion, deliberately small. Every project stays in normal
 * document flow, so the user's scroll position is the only thing that moves the
 * page. On top of that:
 *
 *   once    each project's image opens slightly and settles, and its labels,
 *           title and text reveal in sequence, then stay put
 *   scroll  (desktop only) the image drifts 2% inside its frame, tied 1:1 to
 *           scroll position with no smoothing, so it can be reversed or stopped
 *           anywhere and the picture is always where the scroll puts it
 *
 * There is no pinning and no transition between projects: scrolling into the
 * next one is the transition. GSAP and ScrollTrigger load only as the section
 * nears the viewport, and gsap.matchMedia() builds and reverts everything as
 * the viewport or the reduced-motion preference changes.
 */
export function WorkMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    let cancelled = false
    let revert: (() => void) | undefined

    function build({ gsap }: Loaded, element: HTMLElement) {
      const matchMedia = gsap.matchMedia()
      revert = () => matchMedia.revert()

      matchMedia.add(
        {
          desktop: '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
          mobile: '(max-width: 767px) and (prefers-reduced-motion: no-preference)',
        },
        (context) => {
          const desktop = Boolean(context.conditions?.desktop)

          revealHeader(gsap, element)
          gsap.utils.toArray<HTMLElement>('[data-work-frame]', element).forEach((frame) => {
            revealFrame(gsap, frame)
            if (desktop) driftImage(gsap, frame)
          })
        },
      )
    }

    // Fetch GSAP only when the section is within a viewport of appearing.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        observer.disconnect()
        loadScrollTrigger()
          .then((loaded) => {
            if (!cancelled) build(loaded, root)
          })
          .catch(() => undefined) // the static composition is already complete
      },
      { rootMargin: '100% 0px' },
    )
    observer.observe(root)

    return () => {
      cancelled = true
      observer.disconnect()
      revert?.()
    }
  }, [])

  return <div ref={rootRef}>{children}</div>
}

function revealHeader(gsap: Gsap, root: HTMLElement) {
  const rule = root.querySelector('[data-work-rule]')
  const label = root.querySelector('[data-work-label]')
  if (!rule || !label) return

  gsap
    .timeline({ scrollTrigger: { trigger: rule, start: 'top 90%', once: true } })
    .fromTo(
      rule,
      { scaleX: 0, transformOrigin: 'left center' },
      { scaleX: 1, duration: motion.slow, ease: motion.inOut },
      0,
    )
    .fromTo(
      label,
      { clipPath: MASK_HIDDEN, y: 12 },
      { clipPath: MASK_SHOWN, y: 0, duration: motion.slow, ease: motion.out },
      0.1,
    )
}

/* Once per project: the picture opens a little and settles, then the type
   arrives. Gentle enough to be felt more than watched. */
function revealFrame(gsap: Gsap, frame: HTMLElement) {
  const image = frame.querySelector('[data-work-image]')
  const zoom = frame.querySelector('[data-work-zoom]')
  const texts = gsap.utils.toArray<HTMLElement>('[data-work-reveal]', frame)

  gsap
    .timeline({ scrollTrigger: { trigger: frame, start: 'top 70%', once: true } })
    .fromTo(
      image,
      { clipPath: 'inset(0% 0% 18% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: motion.inOut },
      0,
    )
    .fromTo(zoom, { scale: 1.02 }, { scale: 1, duration: 1.1, ease: motion.out }, 0)
    .fromTo(
      texts,
      { clipPath: MASK_HIDDEN, y: 12 },
      { clipPath: MASK_SHOWN, y: 0, duration: 0.7, ease: motion.out, stagger: 0.06 },
      0.15,
    )
}

/* The single scroll-linked effect. scrub: true binds progress directly to scroll
   position (no catch-up lag), across the image frame's whole trip through the
   viewport. Page up, image slightly slower. */
function driftImage(gsap: Gsap, frame: HTMLElement) {
  const figure = frame.querySelector('[data-work-figure]')
  const parallax = frame.querySelector('[data-work-parallax]')
  if (!figure || !parallax) return

  gsap.fromTo(
    parallax,
    { yPercent: -DRIFT },
    {
      yPercent: DRIFT,
      ease: 'none',
      scrollTrigger: { trigger: figure, start: 'top bottom', end: 'bottom top', scrub: true },
    },
  )
}
