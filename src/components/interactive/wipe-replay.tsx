'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { BallpointButton } from '@/components/library/cairn/ballpoint-button'

/*
 * Plays the headline wipe (motion/headline-wipe.css) on the workbench stage,
 * and again on Replay. The wipe keys off `data-wipe` on any ancestor, so this
 * wrapper sets it: pending (the lines hidden), then "in" a frame later, which
 * restarts the animations. Nothing plays with reduced motion: the headline is
 * simply there and the button is hidden (compact.css).
 */
function play(el: HTMLElement | null) {
  if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  el.dataset.wipe = 'pending'
  requestAnimationFrame(() => requestAnimationFrame(() => (el.dataset.wipe = 'in')))
}

export function WipeReplay({ label, children }: { label: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => play(ref.current), [])

  return (
    <div className="cp-replay">
      <div ref={ref}>{children}</div>
      <BallpointButton
        label={label}
        intro={false}
        onClick={() => play(ref.current)}
        className="cp-ink cp-replay-button"
      />
    </div>
  )
}
