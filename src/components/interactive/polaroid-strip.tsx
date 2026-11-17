'use client'

import Image from 'next/image'
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import type { CompactContent } from '@/types/content'

type Props = CompactContent['alive']

/* Where the strip starts on a phone: the third photo, with photos either side. */
const PHONE_START = 2

/*
 * Stuff that brings me alive (owner's pick: the film strip): instant photos in
 * a row that scrolls and swipes sideways, snapping one into the middle, which
 * straightens up; a tap turns a photo over to the note on its back (a tap on
 * one to the side brings it to the middle). Arrows, the arrow keys and a mouse
 * drag move along it too. The photos show as they are (owner's call, once the
 * shake-to-develop idea had gone).
 */
export function PolaroidStrip({ label, prev, next, turn, items }: Props) {
  const strip = useRef<HTMLUListElement>(null)
  const [current, setCurrent] = useState(0)
  const [turned, setTurned] = useState<readonly number[]>([])

  // The one in the middle, as the strip scrolls.
  useEffect(() => {
    const row = strip.current
    if (!row) return
    let frame = 0
    const middle = () => {
      frame = 0
      const mid = row.scrollLeft + row.clientWidth / 2
      let best = 0
      let gap = Infinity
      ;[...row.children].forEach((child, i) => {
        const el = child as HTMLElement
        const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid)
        if (d < gap) {
          gap = d
          best = i
        }
      })
      setCurrent(best)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(middle)
    }
    // On a phone the strip starts on the third photo (owner's call), so there
    // are photos either side to swipe to; on a wide screen it starts on the first.
    const start = row.children[PHONE_START] as HTMLElement | undefined
    if (start && window.matchMedia('(max-width: 40rem)').matches) {
      row.scrollLeft = start.offsetLeft + start.offsetWidth / 2 - row.clientWidth / 2
      setCurrent(PHONE_START)
    }
    row.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      row.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  const go = (i: number) => {
    const row = strip.current
    const el = row?.children[Math.max(0, Math.min(items.length - 1, i))] as HTMLElement | undefined
    if (!row || !el) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    row.scrollTo({
      left: el.offsetLeft + el.offsetWidth / 2 - row.clientWidth / 2,
      behavior: still ? 'auto' : 'smooth',
    })
  }

  const press = (i: number) => {
    if (i !== current) return go(i)
    setTurned((now) => (now.includes(i) ? now.filter((n) => n !== i) : [...now, i]))
  }

  // A mouse can drag the strip; a tap stays a tap.
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null)
  const down = (event: PointerEvent<HTMLUListElement>) => {
    if (event.pointerType !== 'mouse' || !strip.current) return
    drag.current = { x: event.clientX, left: strip.current.scrollLeft, moved: false }
  }
  const move = (event: PointerEvent<HTMLUListElement>) => {
    const d = drag.current
    const row = strip.current
    if (!d || !row) return
    const dx = event.clientX - d.x
    if (!d.moved && Math.abs(dx) < 6) return
    if (!d.moved) {
      d.moved = true
      row.setPointerCapture(event.pointerId)
      row.dataset.dragging = ''
    }
    row.scrollLeft = d.left - dx
  }
  const up = () => {
    const d = drag.current
    drag.current = null
    if (!d?.moved || !strip.current) return
    delete strip.current.dataset.dragging
    go(current)
  }
  const keys = (event: KeyboardEvent<HTMLUListElement>) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (!step) return
    event.preventDefault()
    go(current + step)
    const target = strip.current?.children[current + step]?.querySelector('button')
    target?.focus({ preventScroll: true })
  }

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label} className="cp-strip">
      <ul
        ref={strip}
        className="cp-strip-row"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onKeyDown={keys}
      >
        {items.map((item, i) => (
          <li key={item.title} className="cp-strip-slot" data-on={i === current || undefined}>
            <button
              type="button"
              className="cp-pol"
              aria-pressed={turned.includes(i)}
              aria-label={`${item.title}: ${turn}`}
              data-turned={turned.includes(i) || undefined}
              onClick={(event) => {
                // The click that ends a drag is not a tap.
                if (strip.current?.dataset.dragging !== undefined) return event.preventDefault()
                press(i)
              }}
            >
              <span className="cp-pol-in">
                <span className="cp-pol-face">
                  <span className="cp-pol-window">
                    <Image
                      src={item.image}
                      alt={item.alt}
                      sizes="10rem"
                      draggable={false}
                      className="cp-pol-photo"
                    />
                  </span>
                  <span className="cp-pol-title">{item.title}</span>
                </span>
                <span className="cp-pol-face cp-pol-back">
                  <span className="cp-pol-note">{item.note}</span>
                  <span className="cp-pol-stamp">
                    <b>{item.stamp[0]}</b>
                    <span>{item.stamp[1]}</span>
                  </span>
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div className="cp-strip-ctrls">
        <button
          type="button"
          aria-label={prev}
          className="cp-strip-key"
          disabled={current === 0}
          onClick={() => go(current - 1)}
        >
          ←
        </button>
        <span aria-hidden="true" className="cp-strip-dots">
          {items.map((item, i) => (
            <i key={item.title} data-on={i === current || undefined} />
          ))}
        </span>
        <button
          type="button"
          aria-label={next}
          className="cp-strip-key"
          disabled={current === items.length - 1}
          onClick={() => go(current + 1)}
        >
          →
        </button>
      </div>
    </div>
  )
}
