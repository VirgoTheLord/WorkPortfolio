'use client'

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { loadScrollTrigger } from '@/lib/motion/gsap'
import { scrollZone } from '@/lib/motion/scroll-zone'

/* The unit of the timeline is one step of scroll (--work-step in work.css). Every
   project has the same share of it: a rest (--work-dwell of a step) with its cover
   fully in, and every change of project the same sweep between two rests
   (--work-sweep), so the scroll to go from any project to the next, forward or
   back, is the same, and so is the rest at either end before the stage lets go.
   The timeline is that many steps long, and a project is at rest in the middle of
   its dwell. */

/* The motion does not follow the scroll directly: it is a spring chasing it. A
   little under critically damped (damping ratio about 0.65: 6 for stiffness,
   3.2 for damping), so it is slow to pick up, runs on past a flick and settles
   with a soft overshoot, and runs back the same way. Lenis smooths the scroll
   itself underneath. */
const STIFFNESS = 6
const DAMPING = 3.2

/* Each change of project, measured on numa.uprock.pro's pinned section: the cover
   is swept over most of a screen of scroll, on an in-out curve; the description
   and the marker change late in the sweep, once most of the next cover is in.
   These are shares of that sweep. */
const TEXT_OUT = [0.4, 0.72] as const
const MARKER = [0.56, 0.72] as const
const TEXT_IN = [0.72, 0.89] as const
/* How far the incoming description rises from, in pixels. */
const RISE = 22

/*
 * Selected Work's scroll scene (layout, the first state and the layout without it
 * are CSS, work.css). Only from lg and only where motion is allowed.
 *
 * The covers are all full-size frames in one place, never moving; each is a window
 * (clip-path), as the reference's are (its frames shrink and grow in height over
 * pictures held still). As the track scrolls, the first cover's window closes from
 * the bottom while the next one opens beneath it, 16px apart, so a curtain rises
 * with the new project under it. The gap is only there while both are open.
 * Everything is driven by the scroll position (through the spring), so it is
 * the same motion backwards, wherever the visitor turns; nothing is triggered
 * once and left finished.
 *
 * The windows are computed from the timeline's time on every update rather than
 * tweened one by one, so any jump of the scroll (a tab, a reload partway down, a
 * fast flick) lands on the right frame. The current project is whichever cover is
 * more than half in: its tab is aria-current, and only its cover and description
 * are not inert, so a link in a covered project is never reachable.
 */
export function WorkStage({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return

    let cancelled = false
    let revert: (() => void) | undefined

    void loadScrollTrigger().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return
      const mm = gsap.matchMedia()
      mm.add(
        '(min-width: 64rem) and (min-height: 38rem) and (prefers-reduced-motion: no-preference)',
        () => {
          const track = root.querySelector<HTMLElement>('.work-track')
          const medias = Array.from(root.querySelectorAll<HTMLElement>('[data-work-media]'))
          const captions = Array.from(root.querySelectorAll<HTMLElement>('[data-work-caption]'))
          const tabs = Array.from(root.querySelectorAll<HTMLElement>('[data-work-tab]'))
          const marker = root.querySelector<HTMLElement>('[data-work-marker]')
          const count = medias.length
          if (!track || count < 2 || captions.length !== count || tabs.length !== count) return

          const ease = gsap.parseEase('power2.inOut')
          // The timeline's shape, in steps (work.css): one rest per project, one sweep
          // per change, all equal.
          const css = (name: string, fallback: number) =>
            parseFloat(getComputedStyle(track).getPropertyValue(name)) || fallback
          const DWELL = css('--work-dwell', 0.55)
          const SWEEP = css('--work-sweep', 0.8)
          // Where sweep k starts, and where project k is at rest.
          const sweepAt = (k: number) => DWELL + k * (SWEEP + DWELL)
          const restAt = (k: number) => k * (SWEEP + DWELL) + DWELL / 2
          const gapPx = parseFloat(getComputedStyle(document.documentElement).fontSize)

          // The stage's height, for the gap's share of it; read again on refresh.
          let frame = medias[0]?.offsetHeight || 1
          const place = (el: HTMLElement, top: number, bottom: number) => {
            // Fractions of the frame's height, from its top.
            el.style.clipPath = `inset(${top * 100}% 0 ${(1 - bottom) * 100}% 0 round var(--work-radius))`
          }

          /* Sweep k (project k to k+1) at progress s: the first window's height goes
           from the whole frame to nothing, the next one fills what is left after
           the gap. */
          const sweep = (s: number) => {
            const h = 1 - s
            const gap = Math.min(1, (s * frame) / gapPx, (h * frame) / gapPx) * (gapPx / frame)
            return { closeTo: h, openFrom: h + gap }
          }

          let current = 0
          const select = (index: number) => {
            if (index === current) return
            current = index
            tabs.forEach((tab, i) => {
              if (i === index) tab.setAttribute('aria-current', 'true')
              else tab.removeAttribute('aria-current')
            })
            medias.forEach((media, i) => media.toggleAttribute('inert', i !== index))
            captions.forEach((caption, i) => caption.toggleAttribute('inert', i !== index))
          }
          medias.forEach((media, i) => media.toggleAttribute('inert', i !== 0))
          captions.forEach((caption, i) => caption.toggleAttribute('inert', i !== 0))

          const apply = (time: number) => {
            const s = Array.from({ length: count - 1 }, (_, k) => {
              const t = (time - sweepAt(k)) / SWEEP
              return ease(Math.min(1, Math.max(0, t)))
            })
            medias.forEach((media, j) => {
              const incoming = j > 0 ? (s[j - 1] ?? 1) : 1
              const outgoing = j < count - 1 ? (s[j] ?? 0) : 0
              if (incoming < 1) {
                // Opening, beneath the previous cover.
                place(media, incoming === 0 ? 1 : sweep(incoming).openFrom, 1)
              } else {
                place(media, 0, outgoing > 0 ? sweep(outgoing).closeTo : 1)
              }
            })
            // A sweep's midpoint is where the next cover becomes the one more than half in.
            let now = 0
            for (let k = 0; k < count - 1; k += 1) if (time >= sweepAt(k) + SWEEP / 2) now = k + 1
            select(now)
          }

          gsap.set(captions[0]!, { opacity: 1 })
          gsap.set(captions.slice(1), { opacity: 0, y: RISE })
          gsap.set(tabs[0]!, { opacity: 1 })
          gsap.set(tabs.slice(1), { opacity: 0.4 })

          const tabY = (i: number) => () => {
            const tab = tabs[i]
            return tab && marker ? tab.offsetTop + (tab.offsetHeight - marker.offsetHeight) / 2 : 0
          }
          if (marker) gsap.set(marker, { y: tabY(0) })

          // Paused: it is only ever set to a time, by the spring below.
          const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } })

          // The marker and tabs change together, and the description a little later.
          for (let k = 0; k < count - 1; k += 1) {
            const t0 = sweepAt(k)
            const at = (share: number) => t0 + share * SWEEP
            const span = (range: readonly [number, number]) => (range[1] - range[0]) * SWEEP

            tl.fromTo(
              captions[k]!,
              { opacity: 1 },
              { opacity: 0, duration: span(TEXT_OUT), immediateRender: false },
              at(TEXT_OUT[0]),
            )
            tl.fromTo(
              captions[k + 1]!,
              { opacity: 0, y: RISE },
              {
                opacity: 1,
                y: 0,
                duration: span(TEXT_IN),
                ease: 'back.out(1.5)',
                immediateRender: false,
              },
              at(TEXT_IN[0]),
            )
            if (marker) {
              tl.fromTo(
                marker,
                { y: tabY(k) },
                {
                  y: tabY(k + 1),
                  duration: span(MARKER),
                  ease: 'back.out(1.7)',
                  immediateRender: false,
                },
                at(MARKER[0]),
              )
            }
            // Explicit start values: a tween's own would be read from whatever the tab
            // looks like when the timeline is first rendered (the CSS dims every tab
            // but the current one), which is wrong whenever that is not the first.
            tl.fromTo(
              tabs[k]!,
              { opacity: 1 },
              { opacity: 0.4, duration: span(MARKER), immediateRender: false },
              at(MARKER[0]),
            )
            tl.fromTo(
              tabs[k + 1]!,
              { opacity: 0.4 },
              { opacity: 1, duration: span(MARKER), immediateRender: false },
              at(MARKER[0]),
            )
          }
          // The timeline is exactly as long as the pin: a rest for each project and a
          // sweep for each change, the last cover resting as long as the first.
          const total = count * DWELL + (count - 1) * SWEEP
          tl.set({}, {}, total)

          const render = (time: number) => {
            const clamped = Math.min(total, Math.max(0, time))
            tl.time(clamped, true)
            apply(clamped)
          }
          render(0)

          // The spring: `target` is where the scroll says we should be, `position`
          // is where we are; the ticker only runs while they differ.
          let position = 0
          let velocity = 0
          let target = 0
          let running = false
          const tick = (_time: number, delta: number) => {
            const dt = Math.min(delta, 50) / 1000
            const steps = Math.max(1, Math.ceil(dt * 120))
            const h = dt / steps
            for (let i = 0; i < steps; i += 1) {
              velocity += (-STIFFNESS * (position - target) - DAMPING * velocity) * h
              position += velocity * h
            }
            if (Math.abs(position - target) < 0.0005 && Math.abs(velocity) < 0.002) {
              position = target
              velocity = 0
              render(position)
              stop()
              return
            }
            render(position)
          }
          const stop = () => {
            running = false
            gsap.ticker.remove(tick)
          }
          const wake = () => {
            if (running) return
            running = true
            gsap.ticker.add(tick)
          }

          // One rest per project: where its cover has just filled the stage.
          const setZone = (start: number, end: number) => {
            scrollZone.start = start
            scrollZone.end = end
            scrollZone.snaps = Array.from(
              { length: count },
              (_, k) => start + ((end - start) * restAt(k)) / total,
            )
          }
          const st = ScrollTrigger.create({
            trigger: track,
            start: 'top top',
            end: 'bottom bottom',
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              target = self.progress * total
              wake()
            },
            onRefresh: (self) => {
              // A resize or a late image: measure again and land where the scroll is.
              frame = medias[0]?.offsetHeight || 1
              setZone(self.start, self.end)
              tl.invalidate()
              target = self.progress * total
              position = target
              velocity = 0
              render(position)
            },
          })

          scrollZone.active = true
          setZone(st.start, st.end)

          const onClick = (event: MouseEvent) => {
            const tab = (event.target as Element).closest<HTMLElement>('[data-work-tab]')
            if (!tab || event.button !== 0) return
            event.preventDefault()
            const index = tabs.indexOf(tab)
            const top = st.start + ((st.end - st.start) * restAt(index)) / total
            window.scrollTo({ top, behavior: 'smooth' })
          }
          root.addEventListener('click', onClick)

          return () => {
            stop()
            st.kill()
            scrollZone.active = false
            scrollZone.snaps = []
            root.removeEventListener('click', onClick)
            medias.forEach((media) => {
              media.style.removeProperty('clip-path')
              media.removeAttribute('inert')
            })
            captions.forEach((caption) => caption.removeAttribute('inert'))
            tabs.forEach((tab, i) => {
              if (i === 0) tab.setAttribute('aria-current', 'true')
              else tab.removeAttribute('aria-current')
            })
          }
        },
      )
      revert = () => {
        mm.revert()
        ScrollTrigger.refresh()
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
