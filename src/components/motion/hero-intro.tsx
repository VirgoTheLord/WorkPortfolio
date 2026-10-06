'use client'

import { useEffect, useRef } from 'react'
import { loadGsap } from '@/lib/motion/gsap'
import { NOISE } from '@/lib/motion/scramble'
import './hero-intro.css'

type Gsap = Awaited<ReturnType<typeof loadGsap>>

/* The loader's label. UI microcopy, decorative only (the overlay is aria-hidden). */
const LABEL = 'Loading'

/* The loader's beats (s), taken from the reference's own timeline. */
const ROLL = { duration: 0.5, ease: 'expo.inOut' }
/* The squares are done; the field starts to sweep. */
const SWEEP = 1.625
const SWEEP_DURATION = 1.05
/* The sweep reaches 90% of its travel (expo.inOut at 61.6% of its time), the
   reference's cue for the page to start entering. The hero is timed from here. */
const REVEAL = SWEEP + 0.616 * SWEEP_DURATION
/* The page enters 0.35s after that. Measured on the reference against the end
   of its sweep, as are the two beats below. */
const ENTER = REVEAL + 0.35
/* From 768px the navbar and the copy wait 0.35s more (the reference's lead). */
const ART_LEAD = 0.35
/* The copy starts 0.3s after the navbar is in. */
const COPY = 0.3

/*
 * Preloader, page reveal and hero entrance as ONE timeline.
 *
 *   Loader   0.00   the label scrambles in: faint noise fills it from the left
 *                   (0.1–0.7), the letters resolve 0.1 behind it (0.2–0.8);
 *                   four squares roll out one by
 *                   one, each a quarter turn over its bottom-right corner into
 *                   the next slot (0.5s, expo.inOut, each starting 25% before
 *                   the previous lands: 0, 0.375, 0.75, 1.125)
 *   Sweep    1.625  the field is cut away by a line pivoting on its bottom-left
 *                   corner: the line's far end runs along the top edge, then
 *                   down the right edge (1.05s, expo.inOut); the mark fades from
 *                   1.765 (0.28s, power3.out)
 *   Reveal   2.27   at 90% of the sweep the page is cued to enter
 *   Enter    2.62   the page enters
 *            +0.35  (from 768px; at once below) the navbar slides down and fades
 *                   in as one piece (0.9s, power3.out): logo, menu and action
 *                   arrive together
 *            +0.65  the copy (`t` below): each headline line is wiped by an
 *                   accent block and a text-coloured block that cross it and
 *                   leave (0.45s each, power3.inOut; lines 0.15s apart), the
 *                   line switching on while it is covered; the line under it
 *                   rises from its mask at t+0.15 (0.8s, power3.out); the
 *                   actions lift in at t+0.3 (0.6s, power3.out), the stack row
 *                   from t+0.5 (0.5s, power3.out, 0.08s apart)
 *   Settle   ~4.6   the stack row, last, has landed
 *
 * Every value is the reference's own: durations and eases from its code, the
 * three entry beats measured frame by frame against it.
 *
 * Runs only when <html> has .is-intro (inline script in layout.tsx). Any input
 * (wheel, touch, key) fast-forwards it. If anything fails, the page is simply
 * shown in its final state.
 */
export function HeroIntro() {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = document.documentElement
    const overlay = overlayRef.current
    const hero = document.querySelector<HTMLElement>('[data-hero]')
    if (!overlay || !root.classList.contains('is-intro')) return
    if (!hero) {
      root.classList.remove('is-intro')
      return
    }
    // Tells the inline failsafe that the intro has been picked up.
    root.classList.add('intro-live')

    let cancelled = false
    let revert: (() => void) | undefined
    let timeline: ReturnType<Gsap['timeline']> | undefined
    let giveUp = 0
    const inertTargets = [document.getElementById('main'), document.querySelector('.site-header')]
    inertTargets.forEach((el) => el?.setAttribute('inert', ''))
    window.scrollTo(0, 0)

    const hurry = () => timeline?.timeScale(3)
    const width = window.innerWidth
    const onResize = () => {
      if (window.innerWidth !== width) timeline?.progress(1)
    }
    const inputs = ['wheel', 'touchmove', 'keydown'] as const
    inputs.forEach((type) => window.addEventListener(type, hurry, { passive: true }))
    window.addEventListener('resize', onResize)

    const detach = () => {
      inputs.forEach((type) => window.removeEventListener(type, hurry))
      window.removeEventListener('resize', onResize)
      inertTargets.forEach((el) => el?.removeAttribute('inert'))
    }
    // Revert first: the final inline state and the class-free CSS are the same
    // frame, so the hand-back is invisible.
    const finish = () => {
      window.clearTimeout(giveUp)
      revert?.()
      revert = undefined
      detach()
      root.classList.remove('is-intro', 'intro-live')
      window.scrollTo(0, 0)
    }
    // GSAP and the fonts get a short window. A slow connection skips the intro
    // rather than holding a blank screen.
    giveUp = window.setTimeout(finish, 2500)

    const fontsReady = Promise.race([
      document.fonts.ready,
      new Promise((resolve) => window.setTimeout(resolve, 1500)),
    ])

    Promise.all([loadGsap(), fontsReady])
      .then(([gsap]) => {
        if (cancelled || !root.classList.contains('is-intro')) return
        window.clearTimeout(giveUp)
        const ctx = gsap.context(() => {
          timeline = build(gsap, overlay, hero, finish)
        })
        revert = () => ctx.revert()
      })
      .catch(finish)

    return () => {
      cancelled = true
      window.clearTimeout(giveUp)
      revert?.()
      detach()
      root.classList.remove('intro-live')
    }
  }, [])

  return (
    <div ref={overlayRef} aria-hidden="true" data-theme="brand" className="intro bg-bg text-fg">
      <div data-intro-mark className="intro-mark">
        <div className="intro-squares">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} data-intro-square className="intro-square bg-fg" />
          ))}
        </div>
        {/* The real word sizes the line, invisibly. Over it, the resolved letters
            and a band of noise in the accent, which on the brand field is orange
            on orange: present, but faint. */}
        <div className="intro-label text-sm uppercase">
          <span className="opacity-0">{LABEL}</span>
          <span className="absolute inset-0 whitespace-pre">
            <span data-intro-label />
            <span data-intro-noise className="text-accent" />
          </span>
        </div>
      </div>
    </div>
  )
}

function build(gsap: Gsap, overlay: HTMLElement, hero: HTMLElement, onDone: () => void) {
  const all = (selector: string, scope: ParentNode) =>
    Array.from(scope.querySelectorAll<HTMLElement>(selector))

  const mark = all('[data-intro-mark]', overlay)
  const squares = all('[data-intro-square]', overlay)
  const label = all('[data-intro-label]', overlay)

  // The navbar lives in the header, outside the hero.
  const nav = all('[data-hero-nav]', document.body)
  const lines = all('.hero-line', hero)
  const sentence = all('[data-hero-intro]', hero)
  const actions = all('[data-hero-actions]', hero)
  const stack = all('[data-hero-stack]', hero)

  /* Every `from` below carries y: 0. The CSS starting states are percentage
     translates, which GSAP reads back as a pixel y; without the reset that y
     would stay behind on top of the yPercent tween. */
  const tl = gsap.timeline({ onComplete: onDone })

  /* Loader. Two fronts cross the label from the left, 0.1s apart: noise appears,
     then the letters resolve over it. */
  const noise = all('[data-intro-noise]', overlay)
  const word = { time: 0 }
  const front = (t: number) => Math.round(Math.min(Math.max(t / 0.6, 0), 1) * LABEL.length)
  tl.to(
    word,
    {
      time: 0.8,
      duration: 0.8,
      ease: 'none',
      onUpdate: () => {
        const resolved = front(word.time - 0.2)
        const scrambled = front(word.time - 0.1) - resolved
        let band = ''
        for (let i = 0; i < scrambled; i++) band += NOISE[Math.floor(Math.random() * NOISE.length)]
        label.forEach((el) => (el.textContent = LABEL.slice(0, resolved)))
        noise.forEach((el) => (el.textContent = band))
      },
    },
    0,
  )

  /* Each square starts on top of the one before and rolls over its bottom-right
     corner into the next slot; the first comes in from off the track. Positions
     follow the rendered square, so the track scales with the spacing token. */
  const size = squares[0]?.offsetWidth ?? 0
  const step = size * 1.125
  squares.forEach((square, i) => {
    tl.fromTo(
      square,
      { x: i === 0 ? -size : (i - 1) * step, rotation: 0 },
      { x: step * i - size, rotation: 90, ...ROLL, immediateRender: false },
      i === 0 ? 0 : '>-25%',
    )
  })

  /* Sweep. A line from the bottom-left corner cuts the field away: its far end
     runs along the top edge in the first half, down the right edge in the second.
     The mark lets go just after the line starts. */
  const sweep = { progress: 0 }
  tl.to(
    sweep,
    {
      progress: 1,
      duration: SWEEP_DURATION,
      ease: 'expo.inOut',
      onUpdate: () => {
        const p = sweep.progress
        overlay.style.clipPath =
          p <= 0.5
            ? `polygon(0% 100%, ${p * 200}% 0%, 100% 0%, 100% 100%)`
            : `polygon(0% 100%, 100% ${(p - 0.5) * 200}%, 100% 100%)`
      },
    },
    SWEEP,
  )
  tl.to(mark, { opacity: 0, duration: 0.28, ease: 'power3.out' }, SWEEP + 0.14)
  tl.set(overlay, { autoAlpha: 0 }, SWEEP + SWEEP_DURATION)

  /* Enter. From 768px the navbar and the copy hold back a little longer, as the
     reference's do. */
  const lead = window.matchMedia('(min-width: 48rem)').matches ? ART_LEAD : 0
  tl.fromTo(
    nav,
    { yPercent: -100, y: 0, opacity: 0 },
    { yPercent: 0, opacity: 1, duration: 0.9, ease: 'power3.out' },
    ENTER + lead,
  )

  /* Headline. Per line, an accent block runs across it and a text-coloured block
     follows 0.1s behind; the line switches on under them, and they leave to the
     right in the same order. */
  const t = ENTER + lead + COPY
  const cross = { duration: 0.45, ease: 'power3.inOut' }
  lines.forEach((line, i) => {
    const text = all('[data-hero-text]', line)
    const accent = all('[data-hero-block="lead"]', line)
    const ink = all('[data-hero-block="trail"]', line)
    const at = t + i * 0.15
    tl.fromTo(accent, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, ...cross }, at)
    tl.fromTo(ink, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, ...cross }, at + 0.1)
    tl.set(text, { opacity: 1 }, at + 0.5)
    tl.set([...accent, ...ink], { transformOrigin: '100% 50%' }, at + 0.5)
    tl.to(ink, { scaleX: 0, ...cross }, at + 0.5)
    tl.to(accent, { scaleX: 0, ...cross }, at + 0.6)
  })

  /* The line under the headline rises from its mask; the actions and the stack
     row lift in behind it. */
  tl.fromTo(
    sentence,
    { yPercent: 100, y: 0 },
    { yPercent: 0, duration: 0.8, ease: 'power3.out' },
    t + 0.15,
  )
  const lift = { opacity: 0, y: 20 }
  tl.fromTo(actions, lift, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, t + 0.3)
  tl.fromTo(
    stack,
    lift,
    { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.08 },
    t + 0.5,
  )

  return tl
}
