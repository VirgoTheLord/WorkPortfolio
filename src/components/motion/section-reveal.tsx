'use client'

import { useEffect, useRef } from 'react'
import type { ComponentProps, ElementType } from 'react'

type RevealProps = Omit<ComponentProps<'section'>, 'ref'> & {
  /** The element to render. A tall section can reveal row by row with `li` or `div`. */
  as?: 'section' | 'div' | 'li'
}

/*
 * Renders a <section> (or `as` another element) and, only when motion will actually play, arms it to
 * reveal once as it scrolls into view. The server HTML carries no state, so
 * without JavaScript, with reduced motion, or when the section is already on
 * screen at load, the content is simply visible. The animation itself is CSS,
 * keyed on data-reveal (see the section's stylesheet).
 */
export function SectionReveal({ as = 'section', children, ...props }: RevealProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element || !('IntersectionObserver' in window)) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // Already in view (or scrolled past): nothing to reveal.
    if (element.getBoundingClientRect().top < window.innerHeight * 0.85) return

    element.dataset.reveal = 'pending'
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        element.dataset.reveal = 'in'
        observer.disconnect()
      },
      { rootMargin: '0px 0px -15% 0px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const Tag = as as ElementType
  return (
    <Tag ref={ref} {...props}>
      {children}
    </Tag>
  )
}
