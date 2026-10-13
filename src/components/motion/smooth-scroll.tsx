'use client'

import { useEffect } from 'react'
import { loadScrollTrigger } from '@/lib/motion/gsap'
import { scrollZone } from '@/lib/motion/scroll-zone'

/* How quickly the page catches up with the wheel: each frame closes this share of
   the gap. Lower is floatier; the references use 0.07 to 0.1. */
const LERP = 0.09

/* Around a pinned stretch (lib/motion/scroll-zone.ts) the scroller eases toward a
   steadier feel, over this many screens on each side: the page moves a little less
   per notch (ZONE_SPEED of the usual) and follows the wheel more loosely (ZONE_LERP;
   numa.uprock.pro's own Lenis runs at 0.05; ours stops short of it to stay
   responsive), so the pinned stretch is entered and
   left by degrees, not at a step, where the page otherwise stops dead and then
   runs at full speed. Full effect inside the stretch, none beyond the ramp. */
const ZONE_RAMP = 1.2
const ZONE_SPEED = 0.9
const ZONE_LERP = 0.07
const smoothstep = (t: number) => t * t * (3 - 2 * t)

/* A pinned stretch also settles: when the scroll has slowed to under SNAP_VELOCITY
   px a frame for SNAP_IDLE ms (Lenis's tail is long, so waiting for it to stop
   would be a second late) between two of its rests (one per project), the page eases to the one it was
   heading for (the next, once it is past SNAP_PAST of the way there; otherwise the
   one behind), over SNAP_TIME seconds plus a little for the distance, on an ease-out
   quint that arrives softly. The reference does not snap; this is ours. A wheel
   turn during it takes over at once. */
const SNAP_IDLE = 60
const SNAP_VELOCITY = 5
const SNAP_PAST = 0.2
const SNAP_TIME = 0.7
const easeOutQuint = (t: number) => 1 - (1 - t) ** 5

/* How long a key holds its pressed state before the page moves (ms): long enough
   for the face to be seen going down, short enough to still feel immediate. */
const PRESS_MS = 220

/* From the full-screen menu, the page starts moving this long after the menu
   starts to close (ms): about halfway through its fold, while the frost clears. */
const MENU_LEAD_MS = 500

/* A followed link's scroll: its length grows with the distance, within limits, on
   a symmetric curve so it leaves and arrives gently. */
const travel = (distance: number) => Math.min(Math.max(0.8 + distance / 5000, 0.9), 1.6)
const inOutQuart = (t: number) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2)

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
 *   - Links within the page scroll to their section instead of jumping (Lenis,
 *     or the browser's smooth scroll before it has loaded; at once for reduced
 *     motion), and the address and focus follow as they would natively. A key
 *     (components/ui/key-link.tsx) is held down for PRESS_MS first, so its press
 *     is seen even on a quick click, and only then does the page move (or the
 *     mail app open). A link followed from the full-screen menu scrolls as the menu
 *     clears (MENU_LEAD_MS). This listens from the document, after the page's own
 *     handlers, and leaves alone anything they have already handled.
 *   - Everything else that scrolls the page (focus, window.scrollTo) stays
 *     native; Lenis follows it.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const root = document.documentElement
    let cancelled = false
    let teardown: (() => void) | undefined
    let lenis: InstanceType<typeof import('lenis').default> | undefined

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

      // Lenis reads wheelMultiplier once, when it is made, so the zone's lighter
      // touch is applied to each wheel event as it arrives instead.
      let zoneSpeed = 1
      const instance = new Lenis({
        lerp: LERP,
        autoRaf: false,
        syncTouch: false,
        prevent: locked,
        virtualScroll: (data) => {
          if (zoneSpeed !== 1) {
            data.deltaX *= zoneSpeed
            data.deltaY *= zoneSpeed
          }
          return true
        },
      })
      lenis = instance
      const tune = () => {
        let share = 0
        if (scrollZone.active) {
          const y = instance.scroll
          const ramp = window.innerHeight * ZONE_RAMP
          const away = y < scrollZone.start ? scrollZone.start - y : Math.max(0, y - scrollZone.end)
          share = away >= ramp ? 0 : smoothstep(1 - away / ramp)
        }
        instance.options.lerp = LERP - (LERP - ZONE_LERP) * share
        zoneSpeed = 1 - (1 - ZONE_SPEED) * share
      }
      let direction = 0
      let lastY = instance.scroll
      let snapTimer = 0
      const snap = () => {
        const points = scrollZone.snaps
        if (!scrollZone.active || points.length < 2 || locked()) return
        const y = instance.scroll
        const first = points[0]!
        const last = points[points.length - 1]!
        if (y < first - 1 || y > last + 1) return
        const lower = Math.max(...points.filter((point) => point <= y + 0.5))
        const upper = Math.min(...points.filter((point) => point >= y - 0.5))
        const gap = upper - lower
        if (!(gap > 2)) return
        const share = (y - lower) / gap
        const toward =
          direction > 0 ? share > SNAP_PAST : direction < 0 ? share > 1 - SNAP_PAST : share > 0.5
        const target = toward ? upper : lower
        if (Math.abs(target - y) < 1) return
        instance.scrollTo(target, {
          duration: SNAP_TIME + (Math.abs(target - y) / gap) * 0.5,
          easing: easeOutQuint,
        })
      }
      instance.on('scroll', () => {
        ScrollTrigger.update()
        tune()
        const y = instance.scroll
        const moved = Math.abs(y - lastY)
        if (moved > 0.5) direction = Math.sign(y - lastY)
        lastY = y
        window.clearTimeout(snapTimer)
        if (moved < SNAP_VELOCITY) {
          snapTimer = window.setTimeout(snap, SNAP_IDLE)
        }
      })
      const step = (time: number) => instance.raf(time * 1000)
      gsap.ticker.add(step)
      gsap.ticker.lagSmoothing(0)

      teardown = () => {
        window.clearTimeout(snapTimer)
        gsap.ticker.remove(step)
        gsap.ticker.lagSmoothing(500, 33)
        instance.destroy()
        lenis = undefined
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

    // ---- Links within the page ------------------------------------------------
    const scrollTo = (target: HTMLElement) => {
      if (lenis && !reduced.matches) {
        const distance = Math.abs(target.getBoundingClientRect().top)
        lenis.scrollTo(target, { duration: travel(distance), easing: inOutQuart, force: true })
      } else {
        target.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth' })
      }
    }
    const focus = (target: HTMLElement) => {
      if (!target.matches('a, button, input, select, textarea, [tabindex]')) {
        target.setAttribute('tabindex', '-1')
      }
      target.focus({ preventScroll: true })
    }

    // A key goes down on the pointer, and stays down until its click has been
    // handled (or the pointer lets go elsewhere).
    const press = (key: HTMLElement) => {
      key.dataset.pressed = 'true'
    }
    const unpress = (key: HTMLElement) => {
      delete key.dataset.pressed
    }
    const keyOf = (event: Event) => (event.target as Element).closest?.<HTMLElement>('a.key')
    const onPointerDown = (event: PointerEvent) => {
      const key = event.isPrimary && event.button === 0 ? keyOf(event) : null
      if (key) press(key)
    }
    const onPointerUp = (event: PointerEvent) => {
      document
        .querySelectorAll<HTMLElement>('a.key[data-pressed]')
        .forEach((key) => key !== keyOf(event) && unpress(key))
    }

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const link = (event.target as Element).closest?.<HTMLAnchorElement>('a[href]')
      if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download')) return
      const key = link.classList.contains('key') ? link : null

      if (link.protocol === 'mailto:') {
        if (!key) return
        event.preventDefault()
        press(key)
        window.setTimeout(() => {
          unpress(key)
          window.location.href = link.href
        }, PRESS_MS)
        return
      }

      const samePage = link.origin === location.origin && link.pathname === location.pathname
      const target = samePage && link.hash ? document.getElementById(link.hash.slice(1)) : null
      if (!target) {
        if (key) unpress(key)
        return
      }
      event.preventDefault()
      if (key) press(key)

      // From the menu: once it is mostly out of the way (it is closing already).
      // The menu moves focus to the destination itself as it finishes.
      const menu = link.closest('#site-menu')?.closest<HTMLElement>('.menu')
      const go = () => {
        if (key) unpress(key)
        if (location.hash !== link.hash) history.pushState(null, '', link.hash)
        scrollTo(target)
        if (!menu) focus(target)
      }
      const wait = menu?.dataset.shown === 'true' ? MENU_LEAD_MS : key ? PRESS_MS : 0
      window.setTimeout(go, wait)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('pointerup', onPointerUp)
    document.addEventListener('pointercancel', onPointerUp)
    document.addEventListener('click', onClick)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('pointerup', onPointerUp)
      document.removeEventListener('pointercancel', onPointerUp)
      document.removeEventListener('click', onClick)
      cancelled = true
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle)
      else window.clearTimeout(idle)
      reduced.removeEventListener('change', sync)
      teardown?.()
    }
  }, [])

  return null
}
