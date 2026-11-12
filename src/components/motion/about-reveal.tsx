'use client'

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { scrambleFrame } from '@/lib/motion/scramble'

const SCRAMBLE_MS = 500

/*
 * The About block's two behaviours:
 *   - everything rises once out of its mask as the block comes up the screen
 *     (the motion is CSS, keyed on data-reveal; see about.css): the statement
 *     line by line, then each fact's term and value. The lines are
 *     read from the layout at arming time, so they match the wrap on any screen:
 *     each word gets its line's step, and words on one line rise together.
 *     Without JavaScript, with reduced motion, or when the block is already on
 *     screen, nothing is armed and everything is simply there.
 *   - hovering a fact with a mouse scrambles its term back into place.
 * The server-rendered block is passed in as children.
 */
export function AboutReveal({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const grid = ref.current
    if (!grid) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let observer: IntersectionObserver | undefined
    if (!reduced && 'IntersectionObserver' in window) {
      if (grid.getBoundingClientRect().top > window.innerHeight * 0.8) {
        const step = (el: Element | null, value: number) => {
          if (el instanceof HTMLElement) el.style.setProperty('--d', String(value))
        }
        // One step per visual line of the statement, from where the words sit.
        const tops: number[] = []
        grid.querySelectorAll<HTMLElement>('[data-about-word]').forEach((word) => {
          const top = Math.round(word.offsetTop)
          if (tops.at(-1) !== top) tops.push(top)
          step(word.firstElementChild, 1 + tops.length - 1)
        })

        // The facts follow the last line, a little apart, each value just after its term.
        grid.querySelectorAll<HTMLElement>('[data-about-item]').forEach((item, i) => {
          const at = tops.length + 1.5 + i * 0.6
          const [term, value] = item.querySelectorAll('[data-about-rise]')
          step(term ?? null, at)
          step(value ?? null, at + 0.4)
        })

        grid.dataset.reveal = 'pending'
        observer = new IntersectionObserver(
          ([entry]) => {
            if (!entry?.isIntersecting) return
            grid.dataset.reveal = 'in'
            observer?.disconnect()
          },
          { rootMargin: '0px 0px -20% 0px' },
        )
        observer.observe(grid)
      }
    }

    // Scramble a fact's term on hover. One frame loop per term, only while it runs.
    const frames = new WeakMap<HTMLElement, number>()
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const onOver = (event: PointerEvent) => {
      if (reduced || !fine.matches || event.pointerType !== 'mouse') return
      const item = (event.target as Element).closest<HTMLElement>('[data-about-item]')
      if (!item || item.contains(event.relatedTarget as Node)) return
      const node = item.querySelector<HTMLElement>('[data-menu-scramble]')
      if (!node) return
      const text = node.dataset.menuScramble ?? ''
      window.cancelAnimationFrame(frames.get(node) ?? 0)
      const start = performance.now()
      const tick = (now: number) => {
        const progress = Math.min((now - start) / SCRAMBLE_MS, 1)
        node.textContent = progress === 1 ? text : scrambleFrame(text, progress)
        if (progress < 1) frames.set(node, window.requestAnimationFrame(tick))
      }
      frames.set(node, window.requestAnimationFrame(tick))
    }
    grid.addEventListener('pointerover', onOver)

    return () => {
      observer?.disconnect()
      grid.removeEventListener('pointerover', onOver)
      grid.querySelectorAll<HTMLElement>('[data-menu-scramble]').forEach((node) => {
        window.cancelAnimationFrame(frames.get(node) ?? 0)
        node.textContent = node.dataset.menuScramble ?? ''
      })
    }
  }, [])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
