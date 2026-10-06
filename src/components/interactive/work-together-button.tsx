'use client'

import { useEffect, useRef, type PointerEvent } from 'react'
import { NOISE } from '@/lib/motion/scramble'
import './work-together-button.css'

type WorkTogetherButtonProps = {
  label: string
  href: string
  /** Which ground it sits on: `accent` is the orange fill, `ink` is black on a light ground (white on a dark one). */
  tone?: 'accent' | 'ink'
  className?: string
}

const tones = {
  accent: { fill: 'bg-accent text-accent-fg', focus: 'focus-visible:outline-focus' },
  ink: { fill: 'bg-ink text-canvas', focus: 'focus-visible:outline-ink' },
} as const

const SCRAMBLE_MS = 600
const FRAME_MS = 45

/*
 * The call-to-action. A real link whose label scrambles into place, letter by
 * letter from the left, while the plus changes sides (work-together-button.css).
 * The scramble is only a visual layer: the accessible name is the plain label,
 * and nothing runs for touch, keyboard-less pointers or reduced motion.
 */
export function WorkTogetherButton({
  label,
  href,
  tone = 'accent',
  className = '',
}: WorkTogetherButtonProps) {
  const textRef = useRef<HTMLSpanElement>(null)
  const frame = useRef(0)

  const stop = () => {
    window.cancelAnimationFrame(frame.current)
    if (textRef.current) textRef.current.textContent = label
  }
  // The frame loop outlives the event that started it, so it is stopped on unmount.
  useEffect(() => () => window.cancelAnimationFrame(frame.current), [])

  const scramble = () => {
    const node = textRef.current
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    window.cancelAnimationFrame(frame.current)
    const start = performance.now()
    let last = 0
    const tick = (now: number) => {
      const progress = Math.min((now - start) / SCRAMBLE_MS, 1)
      if (now - last >= FRAME_MS || progress === 1) {
        last = now
        const settled = Math.floor(progress * label.length)
        node.textContent = Array.from(label, (char, i) =>
          i < settled || char === ' ' ? char : NOISE[Math.floor(Math.random() * NOISE.length)],
        ).join('')
      }
      if (progress < 1) frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
  }

  const onPointerEnter = (event: PointerEvent) => {
    if (event.pointerType === 'mouse') scramble()
  }

  const { fill, focus } = tones[tone]
  const square = (extra: string) => (
    <span aria-hidden="true" className={`wtb-square ${extra} ${fill}`}>
      <svg viewBox="0 0 12 12" fill="none" className="size-3">
        <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
      </svg>
    </span>
  )

  return (
    <a
      href={href}
      onPointerEnter={onPointerEnter}
      onPointerLeave={stop}
      onFocus={(event) => {
        if (event.currentTarget.matches(':focus-visible')) scramble()
      }}
      onBlur={stop}
      className={`wtb inline-flex font-label text-label font-medium uppercase ${focus} ${className}`}
    >
      <span className="wtb-inner">
        {square('wtb-square-in')}
        <span className={`wtb-label ${fill}`}>
          <span className="sr-only">{label}</span>
          <span key={label} ref={textRef} aria-hidden="true">
            {label}
          </span>
        </span>
        {square('wtb-square-out')}
      </span>
    </a>
  )
}
