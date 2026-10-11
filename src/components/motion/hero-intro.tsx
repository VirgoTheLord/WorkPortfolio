'use client'

import { useEffect, useRef } from 'react'
import { loadGsap } from '@/lib/motion/gsap'
import './hero-intro.css'

type Gsap = Awaited<ReturnType<typeof loadGsap>>

/* The ring's line, in em of the counter, and the least it may be (px): a light
   outline, about 3.5px at desktop size. The zero it contracts onto, the digit
   slots and the ring at rest are per typeface and live in hero-intro.css as
   custom properties; they are read once, below. */
const LINE = 0.026
const LINE_MIN = 3

/* The loader's beats (s). The count starts once the fonts and GSAP are ready
   (the timeline is only built then); the page itself is static and loaded.
   The count is an odometer: every column slides up continuously, the units
   through every number, the tens in proportion, on one in-out curve, and the
   ring's comet runs on the same curve, closing into the ring as 100 lands. */
const COUNT = 3.9
/* 100 has landed and holds for a beat, then the ring contracts onto the middle
   zero. */
const CONTRACT = COUNT + 0.35
const CONTRACT_DURATION = 0.85
/* The reveal is one growth, from a point at the zero's centre to past the
   corners, on one curve; it starts just before the ring lands, so the ring
   never stops. */
const REVEAL_DURATION = 1.7

/* From 768px the navbar and the copy wait 0.35s more (the reference's lead). */
const ART_LEAD = 0.35
/* The copy starts 0.3s after the navbar is in. */
const COPY = 0.3

/*
 * Preloader, page reveal and hero entrance as ONE timeline.
 *
 *   Count    0.00   the counter in the ring runs from 01 to 100 as an odometer
 *                   (3.9s, power3.inOut): each column is a strip of figures
 *                   sliding up behind its slot, the units through every
 *                   number, the tens in proportion, so digits leave over the
 *                   top as the next rise from below; the 1 of 100 rises with
 *                   the last ten as its slot opens. The ring is a comet over a
 *                   faint track of itself: a bright arc orbits (two turns,
 *                   faster as it goes) with a tail growing from 50 degrees to
 *                   the whole circle, so it catches its own tail as 100 lands
 *   Contract 4.25   100 has held for 0.35s; the ring contracts onto the middle
 *                   zero's outline (0.85s, power3.inOut), its corners tightening
 *                   from a circle to the zero's; the digits never move
 *   Reveal   5.00   0.1s before the ring lands, one growth begins (1.7s,
 *                   power4.inOut): a window onto the hero opens from a point at
 *                   the zero's centre, grows out through the zero (taking its
 *                   ink with it) to the ring, and from there the ring and the
 *                   window carry on together, past the farthest corner. One
 *                   curve, so it never stops or changes gear at the zero
 *   Enter    6.70   the hero is fully revealed and the page enters
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
 *   Settle   ~8.7   the stack row, last, has landed
 *
 * The hero entrance (from Enter) is the reference's own: durations and eases
 * from its code, the entry beats measured frame by frame against it. The loader
 * is this site's own.
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
    // data-bar-ignore: the navbar must not take this cover's theme (site-menu.tsx).
    <div
      ref={overlayRef}
      aria-hidden="true"
      data-theme="brand"
      data-bar-ignore
      className="intro text-fg"
    >
      <div className="intro-field">
        <p className="intro-count">
          {/* Each slot holds a strip of digits; the island adds the rest of
              each strip and rolls it. */}
          {[
            ['hundreds', '\u00a0'],
            ['tens', '0'],
            ['units', '1'],
          ].map(([slot, digit]) => (
            <span key={slot} data-intro-slot={slot} className="intro-slot">
              <span data-intro-strip className="intro-strip block">
                <span>{digit}</span>
              </span>
            </span>
          ))}
        </p>
      </div>
      <div data-intro-track className="intro-ring intro-track" />
      <div data-intro-ring className="intro-ring" />
    </div>
  )
}

function build(gsap: Gsap, overlay: HTMLElement, hero: HTMLElement, onDone: () => void) {
  const all = (selector: string, scope: ParentNode) =>
    Array.from(scope.querySelectorAll<HTMLElement>(selector))

  const field = all('.intro-field', overlay)[0]
  const slots = all('[data-intro-slot]', overlay)
  const ringEl = all('[data-intro-ring]', overlay)[0]
  const trackEl = all('[data-intro-track]', overlay)[0]

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

  /* The ring starts around "01" (the counter's box is centred). Where the
     middle zero of "100" sits is measured from its own cell when the ring
     starts to contract, once, so the target is the zero as rendered: --zc below
     the cell's top, centred across it. The zero's size and the corner radius it
     is drawn with come from the typeface's custom properties. */
  const style = getComputedStyle(overlay)
  const em = parseFloat(style.fontSize) || 0
  const unit = (name: string) => (parseFloat(style.getPropertyValue(name)) || 0) * em
  const ringSize = unit('--ring')
  const zeroX = unit('--zx')
  const zeroY = unit('--zy')
  const zeroRadius = unit('--zr')
  const zeroCentre = unit('--zc')
  const one = unit('--one')
  // The reveal starts 0.1s before the ring lands; the hero enters when it ends.
  const openAt = CONTRACT + CONTRACT_DURATION - 0.1
  const enter = openAt + REVEAL_DURATION
  const box = slots[0]?.parentElement?.getBoundingClientRect()
  const width = window.innerWidth
  const height = window.innerHeight
  const line = Math.max(LINE_MIN, LINE * em)
  overlay.style.setProperty('--line', `${line}px`)
  const zero = { x: width / 2, y: height / 2 }
  let tensCell: () => Element | null = () => null
  const findZero = () => {
    const cell = tensCell()?.getBoundingClientRect()
    if (cell) {
      zero.x = cell.left + cell.width / 2
      zero.y = cell.top + zeroCentre
    }
  }
  // The ring's inner edge past the farthest corner.
  const far = () =>
    Math.hypot(Math.max(zero.x, width - zero.x), Math.max(zero.y, height - zero.y)) + line + 2

  /* The ring: its centre, outer half-sizes and corner radius drive the element
     (via --cx/--cy, --rx/--ry and --rr) and, once it opens, the hole cut in the
     field, which is the ring's own inner edge, grown half a pixel under the line
     so no seam shows. */
  const ring = {
    x: box ? box.left + box.width / 2 : width / 2,
    y: box ? box.top + box.height / 2 : height / 2,
    rx: ringSize,
    ry: ringSize,
    r: ringSize,
  }
  let open = false
  // How much of the ring's inner edge the window has grown to (0 to 1).
  const win = { k: 0 }
  const draw = () => {
    overlay.style.setProperty('--cx', `${ring.x}px`)
    overlay.style.setProperty('--cy', `${ring.y}px`)
    overlay.style.setProperty('--rx', `${ring.rx}px`)
    overlay.style.setProperty('--ry', `${ring.ry}px`)
    overlay.style.setProperty('--rr', `${ring.r}px`)
    if (!open || !field) return
    // The window is the ring's inner edge, one line in (the same rounded
    // rectangle, grown half a pixel under the line so no seam shows), scaled
    // about the ring's centre by how far it has grown.
    const ax = (ring.rx - line + 0.5) * win.k
    const ay = (ring.ry - line + 0.5) * win.k
    if (ax < 0.5 || ay < 0.5) {
      field.style.clipPath = 'none'
      return
    }
    const k = Math.max(0, Math.min((ring.r - line + 0.5) * win.k, ax, ay))
    const [l, t, r, b] = [ring.x - ax, ring.y - ay, ring.x + ax, ring.y + ay]
    const arc = `A${k} ${k} 0 0 1`
    field.style.clipPath =
      `path(evenodd, 'M0 0H${width}V${height}H0Z` +
      `M${l + k} ${t}H${r - k}${arc} ${r} ${t + k}V${b - k}${arc} ${r - k} ${b}` +
      `H${l + k}${arc} ${l} ${b - k}V${t + k}${arc} ${l + k} ${t}Z')`
  }
  draw()

  /* Count. Each column's strip is filled here (so a re-run starts clean): the
     units 0–9 ten times and a last 0, the tens 0–9 and a last 0, the hundreds
     a blank and the 1. One tally drives all three. */
  const strip = (name: string) =>
    overlay.querySelector<HTMLElement>(`[data-intro-slot="${name}"] > [data-intro-strip]`)
  const fill = (el: HTMLElement | null, cells: string[]) => {
    el?.replaceChildren(
      ...cells.map((digit) => {
        const cell = document.createElement('span')
        cell.textContent = digit
        return cell
      }),
    )
  }
  const units = strip('units')
  const tens = strip('tens')
  const hundreds = strip('hundreds')
  const hundredsSlot = hundreds?.parentElement
  tensCell = () => tens?.lastElementChild ?? null
  fill(
    units,
    Array.from({ length: 101 }, (_, i) => String(i % 10)),
  )
  fill(
    tens,
    Array.from({ length: 11 }, (_, i) => String(i % 10)),
  )
  fill(hundreds, ['\u00a0', '1'])
  const tally = { value: 1 }
  const roll = () => {
    const value = tally.value
    // The 1 rises, and its slot opens, over the last ten.
    const last = Math.min(Math.max((value - 90) / 10, 0), 1)
    if (units) units.style.transform = `translateY(${-value}em)`
    if (tens) tens.style.transform = `translateY(${(-10 * (value - 1)) / 99}em)`
    if (hundreds) hundreds.style.transform = `translateY(${-last}em)`
    if (hundredsSlot) hundredsSlot.style.width = `${one * last}px`
    // The comet: a bright arc orbits (two turns over the count, faster as it
    // goes), its tail growing from 50° to the whole circle, the tail's far end
    // rising from clear to solid over the last twelve, so it is the whole ring
    // at 100 (hero-intro.css turns these into a conic mask on the ring).
    const done = Math.min(value, 100)
    const ease = (x: number) => x * x * (3 - 2 * x)
    const clamp = (x: number) => Math.min(Math.max(x, 0), 1)
    overlay.style.setProperty('--spin', `${done * 7.2}deg`)
    overlay.style.setProperty('--tail', `${50 + 310 * ((done - 1) / 99)}deg`)
    overlay.style.setProperty('--floor', `${ease(clamp((done - 88) / 12))}`)
  }
  roll()
  tl.to(tally, { value: 100, duration: COUNT, ease: 'power3.inOut', onUpdate: roll }, 0)
  // Closed: the mask comes off (no seam where the comet met its tail) and the
  // track under it, no longer needed, goes.
  tl.call(() => ringEl?.setAttribute('data-full', ''), undefined, COUNT)
  if (trackEl) tl.set(trackEl, { opacity: 0 }, COUNT)

  /* Contract: the ring closes onto the middle zero's outer contour, its corners
     tightening to the zero's as it goes. */
  tl.to(
    ring,
    {
      x: () => {
        findZero()
        return zero.x
      },
      y: () => {
        findZero()
        return zero.y
      },
      rx: zeroX,
      ry: zeroY,
      r: zeroRadius,
      duration: CONTRACT_DURATION,
      ease: 'power3.inOut',
      onUpdate: draw,
    },
    CONTRACT,
  )
  /* Reveal: one growth on one curve. The window onto the hero is the ring's
     inner edge, scaled about its centre: it opens from a point at the zero's
     centre and fills the zero's outline when it reaches `inner` (the zero's
     inner half-height); past that the ring and the window grow together, each
     size inflated by the same amount, so the zero's rounded rectangle slides
     into a circle as it goes. */
  const inner = Math.min(zeroX, zeroY) - line + 0.5
  const reveal = { w: 0 }
  tl.call(
    () => {
      open = true
      draw()
    },
    undefined,
    openAt,
  )
  tl.to(
    reveal,
    {
      w: () => inner + Math.max(0, far() - zeroX),
      duration: REVEAL_DURATION,
      ease: 'power4.inOut',
      onUpdate: () => {
        win.k = Math.min(1, reveal.w / inner)
        const grow = Math.max(0, reveal.w - inner)
        ring.rx = zeroX + grow
        ring.ry = zeroY + grow
        ring.r = zeroRadius + grow
        draw()
      },
    },
    openAt,
  )
  tl.set(overlay, { autoAlpha: 0 }, enter)

  /* Enter. From 768px the navbar and the copy hold back a little longer, as the
     reference's do. */
  const lead = window.matchMedia('(min-width: 48rem)').matches ? ART_LEAD : 0
  tl.fromTo(
    nav,
    { yPercent: -100, y: 0, opacity: 0 },
    { yPercent: 0, opacity: 1, duration: 0.9, ease: 'power3.out' },
    enter + lead,
  )

  /* Headline. Per line, an accent block runs across it and a text-coloured block
     follows 0.1s behind; the line switches on under them, and they leave to the
     right in the same order. */
  const t = enter + lead + COPY
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
