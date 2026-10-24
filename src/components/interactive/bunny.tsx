'use client'

import { useEffect, useRef } from 'react'

/* The bunny, three lines of ASCII. Only the face (and the ears mid-hop) change. */
const FRAMES = {
  sit: '(\\_/)\n(o.o)\n(")(")',
  blink: '(\\_/)\n(-.-)\n(")(")',
  happy: '(\\_/)\n(^.^)\n(")(")',
  hop: '(\\_\\)\n(o.o)\n(")(")',
  sleep: '(\\_/)\n(-.-)\n(")(")',
} as const

/* Where it may roam: on wide screens, the free space right of the content. */
const WIDE = '(min-width: 64rem)'
/* One hop: how far (px), how high (px) and how long (ms). */
const HOP = { step: 30, height: 10, ms: 460 }
/* Quiet this long (ms) and it falls asleep. */
const NAP = 25_000

const between = (min: number, max: number) => min + Math.random() * (max - min)

/*
 * The compact site's resident (DESIGN.md §5b): a small ASCII bunny that lives
 * in the empty space beside the content on wide screens and never crosses the
 * text. Now and then it hops somewhere new, blinks, and falls asleep (a "z"
 * drifts up) when nobody has moved the pointer for a while. Hovered, it looks
 * pleased; clicked or pressed, it jumps and a heart rises.
 *
 * Built to cost nothing: one fixed button moved only by `transform` (Web
 * Animations, on the compositor), its face swapped by writing one text node,
 * and a single timer for its next idea. No frame loop, no React state, nothing
 * while the tab is hidden. With reduced motion it sits still and only smiles.
 */
export function Bunny({ label }: { label: string }) {
  const button = useRef<HTMLButtonElement>(null)
  const art = useRef<HTMLPreElement>(null)

  useEffect(() => {
    const el = button.current
    const face = art.current
    const sheet = document.querySelector('.cp-sheet')
    if (!el || !face || !sheet) return
    const wide = window.matchMedia(WIDE)
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let x = 0
    let zone = { min: 0, max: 0 }
    let timer = 0
    let busy = false
    let hovered = false
    let asleep = false
    let lastMove = performance.now()

    const show = (frame: keyof typeof FRAMES) => {
      face.textContent = FRAMES[frame]
    }
    const rest = () => show(hovered ? 'happy' : asleep ? 'sleep' : 'sit')
    const place = () => {
      el.style.transform = `translate3d(${x}px, 0, 0)`
    }

    const measure = () => {
      el.hidden = false
      const right = sheet.getBoundingClientRect().right
      const width = el.offsetWidth
      zone = { min: right + 24, max: window.innerWidth - width - 24 }
      const room = wide.matches && zone.max >= zone.min
      el.hidden = !room
      if (!room) return false
      x = Math.min(Math.max(x || between(zone.min, zone.max), zone.min), zone.max)
      place()
      return true
    }

    // Something floats up out of it: a heart, or a z while it sleeps.
    const puff = (text: string, className: string) => {
      const bit = document.createElement('span')
      bit.textContent = text
      bit.className = className
      bit.setAttribute('aria-hidden', 'true')
      el.append(bit)
      const drift = still
        ? [{ opacity: 1 }, { opacity: 0 }]
        : [
            { opacity: 0, transform: 'translate(0, 0) scale(0.6)' },
            { opacity: 1, transform: 'translate(-2px, -14px) scale(1)', offset: 0.25 },
            { opacity: 0, transform: 'translate(4px, -34px) scale(0.9)' },
          ]
      bit
        .animate(drift, { duration: 1800, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' })
        .finished.then(() => bit.remove())
        .catch(() => bit.remove())
    }

    const hop = async (to: number, height = HOP.height) => {
      const from = x
      el.style.scale = `${to < from ? -1 : 1} 1`
      show('hop')
      const motion = el.animate(
        [
          { transform: `translate3d(${from}px, 0, 0)` },
          { transform: `translate3d(${(from + to) / 2}px, ${-height}px, 0)`, offset: 0.45 },
          { transform: `translate3d(${to}px, 0, 0)` },
        ],
        { duration: HOP.ms, easing: 'cubic-bezier(0.37, 0, 0.63, 1)' },
      )
      x = to
      place()
      await motion.finished.catch(() => {})
      rest()
    }

    const wander = async () => {
      if (busy || asleep || el.hidden || document.hidden) return
      busy = true
      const target = between(zone.min, zone.max)
      const hops = Math.max(1, Math.round(Math.abs(target - x) / HOP.step))
      const step = (target - x) / hops
      for (let i = 0; i < hops && !hovered; i++) await hop(x + step)
      busy = false
    }

    const blink = () => {
      if (busy || hovered || asleep) return
      show('blink')
      window.setTimeout(rest, 140)
    }

    // One timer decides what happens next: a nap, a hop, a blink.
    const next = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(
        () => {
          if (!document.hidden && !el.hidden) {
            if (!asleep && performance.now() - lastMove > NAP) {
              asleep = true
              rest()
            }
            if (asleep) puff('z', 'cp-bunny-z')
            else if (Math.random() < 0.45) void wander()
            else blink()
          }
          next()
        },
        between(2200, 4200),
      )
    }

    const wake = () => {
      lastMove = performance.now()
      if (asleep) {
        asleep = false
        rest()
      }
    }

    const enter = () => {
      hovered = true
      wake()
      if (!busy) rest()
    }
    const leave = () => {
      hovered = false
      if (!busy) rest()
    }
    const pet = async () => {
      wake()
      puff('♥', 'cp-bunny-heart')
      if (still || busy) {
        show('happy')
        window.setTimeout(rest, 1200)
        return
      }
      busy = true
      await hop(x, HOP.height * 2.4)
      show('happy')
      window.setTimeout(() => {
        busy = false
        rest()
      }, 900)
    }

    const resize = () => measure()
    show('sit')
    measure()
    el.addEventListener('pointerenter', enter)
    el.addEventListener('pointerleave', leave)
    el.addEventListener('click', pet)
    window.addEventListener('resize', resize, { passive: true })
    wide.addEventListener('change', resize)
    if (!still) {
      window.addEventListener('pointermove', wake, { passive: true })
      next()
    }
    return () => {
      window.clearTimeout(timer)
      el.removeEventListener('pointerenter', enter)
      el.removeEventListener('pointerleave', leave)
      el.removeEventListener('click', pet)
      window.removeEventListener('resize', resize)
      wide.removeEventListener('change', resize)
      window.removeEventListener('pointermove', wake)
    }
  }, [])

  return (
    <button ref={button} type="button" aria-label={label} hidden className="cp-bunny">
      <pre ref={art} aria-hidden="true" className="cp-bunny-art font-label" />
    </button>
  )
}
