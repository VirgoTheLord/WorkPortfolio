'use client'

import { useEffect } from 'react'
import { loadScrollTrigger } from '@/lib/motion/gsap'

/* How quickly the page catches up with the wheel: each frame closes this share of
   the gap. Lower is floatier; the references use 0.07 to 0.1. */
const LERP = 0.09

/*
 * Smooth scrolling, with Lenis (ARCHITECTURE.md §6.10, §9). One instance for the
 * life of the page, created here and destroyed here; nothing else imports it.
 *
 *   - It is fetched after the page is interactive (a dynamic import, in its own
 *     chunk), so it is never in the initial bundle, and the page is fully usable
 *     with native scrolling in the meantime and without it.
 *   - GSAP's ticker is its only frame loop (`autoRaf: false`), so Lenis, every
 *     timeline and every ScrollTrigger are stepped by the same frame; and Lenis
 *     calls ScrollTrigger.update on each scroll, so they agree on the position.
 *     lagSmoothing(0) is the library's recommended pairing: without it GSAP slows
 *     its clock after a slow frame and the scroll would stutter. The default is
 *     put back when this unmounts.
 *   - It is off for reduced motion, and switches off or on as that preference
 *     changes. Touch keeps native scrolling (syncTouch is left false), which is
 *     what a touch device does best.
 *   - While the page is locked it is held off: during the intro (html.is-intro)
 *     and while the full-screen menu is open. overflow: hidden on the root stops
 *     the visitor but not a library that calls scrollTo, so `prevent` hands the
 *     wheel back to the browser, which the lock then stops. Nested scrollers (the
 *     menu's panel) carry data-lenis-prevent.
 *   - Everything else that scrolls the page (hash links, focus, window.scrollTo)
 *     stays native; Lenis follows it.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const root = document.documentElement
    let cancelled = false
    let teardown: (() => void) | undefined

    const locked = () =>
      root.classList.contains('is-intro') ||
      document.querySelector('.menu')?.getAttribute('data-open') === 'true'

    const start = async () => {
      if (teardown || reduced.matches) return
      const [{ gsap, ScrollTrigger }, { default: Lenis }] = await Promise.all([
        loadScrollTrigger(),
        import('lenis'),
      ])
      if (cancelled || teardown || reduced.matches) return

      const lenis = new Lenis({
        lerp: LERP,
        autoRaf: false,
        syncTouch: false,
        prevent: locked,
      })
      lenis.on('scroll', ScrollTrigger.update)
      const step = (time: number) => lenis.raf(time * 1000)
      gsap.ticker.add(step)
      gsap.ticker.lagSmoothing(0)

      teardown = () => {
        gsap.ticker.remove(step)
        gsap.ticker.lagSmoothing(500, 33)
        lenis.destroy()
        teardown = undefined
      }
    }

    const sync = () => {
      if (reduced.matches) teardown?.()
      else void start()
    }

    // After the page is interactive, so it never competes with the first paint.
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(() => void start(), { timeout: 2000 })
      : window.setTimeout(() => void start(), 300)
    reduced.addEventListener('change', sync)

    return () => {
      cancelled = true
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle)
      else window.clearTimeout(idle)
      reduced.removeEventListener('change', sync)
      teardown?.()
    }
  }, [])

  return null
}
