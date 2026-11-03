'use client'

import { useEffect, useRef } from 'react'
import type { CompactContent } from '@/types/content'

/* How fast it types (ms per character, plus a little jitter) and deletes. */
const TYPE = 38
const JITTER = 40
const ERASE = 14

/*
 * The way back from the compact site, typed as a command beside the AW mark
 * (DESIGN.md §5b): hovering or focusing the link around it types
 * `~/compact $ cd ../full-site` after a hairline, a block cursor blinking at the
 * end; leaving deletes it a character at a time, and once it is empty the line
 * is gone (compact.css). One text node is written, no React state. Mouse and
 * keyboard only: on touch a tap simply follows the link. Decorative (the link
 * is named by its own label); with reduced motion the command appears whole.
 */
export function TerminalHint({ prompt, command }: CompactContent['terminal']) {
  const line = useRef<HTMLSpanElement>(null)
  const text = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = line.current
    const out = text.current
    const link = el?.closest('a')
    if (!el || !out || !link) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let timer = 0

    const type = () => {
      window.clearTimeout(timer)
      el.dataset.on = ''
      if (still) {
        out.textContent = command
        return
      }
      const next = () => {
        const length = out.textContent?.length ?? 0
        if (length >= command.length) return
        out.textContent = command.slice(0, length + 1)
        timer = window.setTimeout(next, TYPE + Math.random() * JITTER)
      }
      timer = window.setTimeout(next, 120)
    }

    const erase = () => {
      window.clearTimeout(timer)
      const back = () => {
        const current = out.textContent ?? ''
        if (!current || still) {
          out.textContent = ''
          delete el.dataset.on
          return
        }
        out.textContent = current.slice(0, -1)
        timer = window.setTimeout(back, ERASE)
      }
      back()
    }

    const enter = (event: PointerEvent) => event.pointerType === 'mouse' && type()
    const leave = (event: PointerEvent) => event.pointerType === 'mouse' && erase()
    const focus = () => link.matches(':focus-visible') && type()

    link.addEventListener('pointerenter', enter)
    link.addEventListener('pointerleave', leave)
    link.addEventListener('focus', focus)
    link.addEventListener('blur', erase)
    return () => {
      window.clearTimeout(timer)
      link.removeEventListener('pointerenter', enter)
      link.removeEventListener('pointerleave', leave)
      link.removeEventListener('focus', focus)
      link.removeEventListener('blur', erase)
    }
  }, [command])

  return (
    <span ref={line} aria-hidden="true" className="cp-term font-label">
      <span className="cp-term-prompt">{prompt}</span> <span ref={text} />
      <span className="cp-term-cursor" />
    </span>
  )
}
