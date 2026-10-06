'use client'

import { useEffect, useRef } from 'react'
import { loadGsap } from '@/lib/motion/gsap'
import './cursor-label.css'

/* The reference's own values: the label trails the pointer (0.7s, expo.out), tilts
   with its horizontal speed (half a degree per pixel, at most 35), pops in with a
   small overshoot (0.35s) and out (0.25s). */
const FOLLOW = { duration: 0.7, ease: 'expo.out' }
const TILT = { max: 35, gain: 0.5 }

/*
 * A label that follows the pointer while it is over anything carrying
 * data-cursor-text (the reference's "View project"). The real cursor stays; this
 * is a local label above it. Fine pointers only, never under reduced motion. The
 * pointer listener exists only while the pointer is over a target, so nothing
 * runs the rest of the time. Decorative: the target is a real link with its own
 * accessible name.
 */
export function CursorLabel() {
  const posRef = useRef<HTMLDivElement>(null)
  const tiltRef = useRef<HTMLDivElement>(null)
  const pillRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const pos = posRef.current
    const tilt = tiltRef.current
    const pill = pillRef.current
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!pos || !tilt || !pill || !fine.matches || reduced.matches) return

    let cancelled = false
    let cleanup: (() => void) | undefined

    void loadGsap().then((gsap) => {
      if (cancelled) return
      gsap.set(pill, { scale: 0 })
      const x = gsap.quickTo(pos, 'x', FOLLOW)
      const y = gsap.quickTo(pos, 'y', FOLLOW)
      const rotate = gsap.quickTo(tilt, 'rotation', { duration: 0.35, ease: 'power2.out' })

      let target: Element | null = null
      let lastX = 0
      let speed = 0
      let idle = 0

      const move = (event: PointerEvent) => {
        x(event.clientX)
        y(event.clientY)
        // Smoothed horizontal speed, as the reference measures it per frame.
        speed = 0.7 * speed + 0.3 * (event.clientX - lastX)
        lastX = event.clientX
        rotate(Math.max(-TILT.max, Math.min(TILT.max, speed * TILT.gain)))
        window.clearTimeout(idle)
        idle = window.setTimeout(() => {
          speed = 0
          rotate(0)
        }, 80)
      }

      const show = (el: Element, event: PointerEvent) => {
        target = el
        pill.textContent = el.getAttribute('data-cursor-text') ?? ''
        lastX = event.clientX
        speed = 0
        gsap.set(pos, { x: event.clientX, y: event.clientY })
        pos.dataset.on = 'true'
        gsap.killTweensOf(pill)
        gsap.to(pill, { scale: 1, duration: 0.35, ease: 'back.out(1.7)' })
        document.addEventListener('pointermove', move)
      }

      const hide = () => {
        target = null
        document.removeEventListener('pointermove', move)
        window.clearTimeout(idle)
        rotate(0)
        pos.dataset.on = 'false'
        gsap.killTweensOf(pill)
        gsap.to(pill, { scale: 0, duration: 0.25, ease: 'power2.inOut' })
      }

      const onOver = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse') return
        const el = (event.target as Element).closest('[data-cursor-text]')
        if (el && el !== target) show(el, event)
      }
      const onOut = (event: PointerEvent) => {
        if (!target) return
        const to = event.relatedTarget as Node | null
        if (!to || !target.contains(to)) hide()
      }
      document.addEventListener('pointerover', onOver)
      document.addEventListener('pointerout', onOut)

      cleanup = () => {
        document.removeEventListener('pointerover', onOver)
        document.removeEventListener('pointerout', onOut)
        document.removeEventListener('pointermove', move)
        window.clearTimeout(idle)
        gsap.killTweensOf([pos, tilt, pill])
      }
    })

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [])

  return (
    <div ref={posRef} aria-hidden="true" data-on="false" className="cursor-label">
      <div ref={tiltRef} className="cursor-label-tilt">
        <div
          ref={pillRef}
          className="cursor-label-pill bg-accent font-label text-label text-accent-fg uppercase"
        />
      </div>
    </div>
  )
}
