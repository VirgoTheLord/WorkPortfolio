'use client'

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { playScramble } from '@/lib/motion/scramble'

/*
 * The footer's two behaviours (layout and the entrance are CSS, site-footer.css):
 *   - the small lines rise and the watermark's letters slide up once, when a fifth
 *     of the footer is on screen (the reference's threshold). Without JavaScript,
 *     with reduced motion, or when it is on screen at load, nothing is armed.
 *   - a destination scrambles into place when the pointer reaches it, or when it
 *     takes keyboard focus.
 * No listener runs while scrolling.
 */
export function FooterStage({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    const footer = root?.closest('footer')
    if (!root || !footer) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

    let observer: IntersectionObserver | undefined
    if (!reduced.matches && 'IntersectionObserver' in window) {
      if (footer.getBoundingClientRect().top > window.innerHeight * 0.8) {
        footer.dataset.footer = 'pending'
        observer = new IntersectionObserver(
          ([entry]) => {
            if (!entry?.isIntersecting) return
            footer.dataset.footer = 'in'
            observer?.disconnect()
          },
          { threshold: 0.2 },
        )
        observer.observe(footer)
      }
    }

    const cancels = new Map<HTMLElement, () => void>()
    const scramble = (link: HTMLElement) => {
      const node = link.querySelector<HTMLElement>('[data-menu-scramble]')
      if (!node || reduced.matches) return
      cancels.get(node)?.()
      cancels.set(node, playScramble(node, node.dataset.menuScramble ?? '', 500))
    }
    const linkOf = (target: EventTarget | null) =>
      (target as Element | null)?.closest<HTMLElement>('[data-scramble-link]') ?? null
    const onOver = (event: PointerEvent) => {
      const link = linkOf(event.target)
      if (link && event.pointerType === 'mouse' && !link.contains(event.relatedTarget as Node)) {
        scramble(link)
      }
    }
    const onFocus = (event: FocusEvent) => {
      const link = linkOf(event.target)
      if (link && (event.target as Element).matches(':focus-visible')) scramble(link)
    }
    root.addEventListener('pointerover', onOver)
    root.addEventListener('focusin', onFocus)

    return () => {
      observer?.disconnect()
      root.removeEventListener('pointerover', onOver)
      root.removeEventListener('focusin', onFocus)
      cancels.forEach((cancel) => cancel())
    }
  }, [])

  return (
    <div ref={ref} className="contents">
      {children}
    </div>
  )
}
