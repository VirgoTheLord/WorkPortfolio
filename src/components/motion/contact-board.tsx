'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

type ContactBoardProps = {
  email: string
  /** The button's accessible name, before the address ("Copy email address"). */
  copyLabel: string
  /** The hint under the board, for a pointer and for touch. */
  hint: string
  touchHint: string
  /** What the board and the hint say once the address is copied. */
  done: string
}

/* Each tile runs through a few characters before it lands (more for later
   tiles, a little more for every fifth), one tile after another. */
const CHARS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@.-'
const FLIP_MS = 120
const STAGGER_MS = 45
const QUICK_STAGGER_MS = 25
/* How long COPIED stays up before the address flips back. */
const HOLD_MS = 1800

/*
 * The contact section's departures board (contact.css): the email address as a
 * row of split-flap tiles, and a real button. Clicking or tapping it copies the
 * address, the board flipping to COPIED and back; the hint under it says how and
 * then confirms, and a polite live region says so to a screen reader. The
 * button's accessible name is the action and the address, so it is clear what it
 * does without the picture. Writing (the mail app) is the section's own link
 * beside it, not this.
 *
 * The tiles are rendered with the address on the server, so without script, with
 * reduced motion, or when the section is already on screen, the address is
 * simply there. The tiles flip in once, as the section arrives. On a phone the
 * board breaks at the @ into two rows (contact.css), so every tile stays legible.
 */
export function ContactBoard({ email, copyLabel, hint, touchHint, done }: ContactBoardProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const timers = useRef(new Set<number>())
  const [copied, setCopied] = useState(false)

  const at = email.indexOf('@')
  const rows = at > 0 ? [email.slice(0, at), email.slice(at)] : [email]
  const chars = Array.from(email.toUpperCase())
  const longest = Math.max(...rows.map((row) => row.length))

  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.current.delete(id)
      fn()
    }, ms)
    timers.current.add(id)
  }

  const faces = () =>
    Array.from(ref.current?.querySelectorAll<HTMLElement>('[data-board-face]') ?? [])

  /* Flip every tile to `text` (one character per tile), each a little after the last. */
  const flipTo = (text: string[], stagger: number) => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    faces().forEach((face, i) => {
      const target = text[i] ?? ' '
      if (reduced) {
        face.textContent = target
        return
      }
      const steps = 3 + (i % 5)
      let k = 0
      const flip = () => {
        const char =
          k < steps ? CHARS[(CHARS.indexOf(target) + 7 * (steps - k)) % CHARS.length]! : target
        face.animate(
          [
            { transform: 'rotateX(0deg)' },
            { transform: 'rotateX(-90deg)', offset: 0.5 },
            { transform: 'rotateX(90deg)', offset: 0.51 },
            { transform: 'rotateX(0deg)' },
          ],
          { duration: FLIP_MS, easing: 'linear' },
        )
        later(() => (face.textContent = char), FLIP_MS / 2)
        if (k++ < steps) later(flip, FLIP_MS)
      }
      later(flip, i * stagger)
    })
  }

  /* A message across the tiles: centred in the longer row when the board is in
     two rows (a phone), across the whole board otherwise. */
  const message = (word: string) => {
    const stacked = window.matchMedia('not all and (min-width: 48rem)').matches
    const text = Array<string>(chars.length).fill(' ')
    if (stacked && rows.length > 1) {
      const row = rows[0]!.length >= rows[1]!.length ? 0 : 1
      const start =
        (row === 0 ? 0 : rows[0]!.length) + Math.floor((rows[row]!.length - word.length) / 2)
      Array.from(word).forEach((c, i) => (text[start + i] = c))
    } else {
      const start = Math.floor((chars.length - word.length) / 2)
      Array.from(word).forEach((c, i) => (text[start + i] = c))
    }
    return text
  }

  // The entrance: only when the board is still below the screen at mount.
  useEffect(() => {
    const board = ref.current
    const pending = timers.current
    if (!board || !('IntersectionObserver' in window)) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (board.getBoundingClientRect().top < window.innerHeight) return
    faces().forEach((face) => (face.textContent = ' '))
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        observer.disconnect()
        flipTo(chars, STAGGER_MS)
      },
      // Once most of the board is on screen (it sits at the section's foot).
      { threshold: 0.6 },
    )
    observer.observe(board)
    return () => {
      observer.disconnect()
      pending.forEach((id) => window.clearTimeout(id))
      pending.clear()
      faces().forEach((face, i) => (face.textContent = chars[i] ?? ' '))
    }
    // The address is fixed for the life of the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const copy = async () => {
    let ok = false
    try {
      await navigator.clipboard.writeText(email)
      ok = true
    } catch {
      // An older browser, or no permission: the selection fallback.
      const field = document.createElement('textarea')
      field.value = email
      field.setAttribute('readonly', '')
      field.style.position = 'fixed'
      field.style.opacity = '0'
      document.body.append(field)
      field.select()
      ok = document.execCommand('copy')
      field.remove()
    }
    if (!ok) return
    timers.current.forEach((id) => window.clearTimeout(id))
    timers.current.clear()
    setCopied(true)
    flipTo(message(done.toUpperCase()), QUICK_STAGGER_MS)
    later(() => {
      setCopied(false)
      flipTo(chars, QUICK_STAGGER_MS)
    }, HOLD_MS)
  }

  let index = 0
  return (
    <div className="board-wrap">
      <button
        ref={ref}
        type="button"
        onClick={() => void copy()}
        aria-label={`${copyLabel}: ${email}`}
        className="board"
        style={{ '--n': chars.length, '--m': longest } as CSSProperties}
      >
        {rows.map((row) => (
          <span key={row} aria-hidden="true" className="board-row">
            {Array.from(row.toUpperCase()).map((char) => {
              const i = index++
              return (
                <span key={i} className="board-tile">
                  <span
                    data-board-face
                    className="board-face"
                    style={{ '--i': i } as CSSProperties}
                  >
                    {char}
                  </span>
                </span>
              )
            })}
          </span>
        ))}
      </button>
      <p aria-hidden="true" className="board-hint font-label text-label uppercase">
        {copied ? (
          <span>{done}</span>
        ) : (
          <>
            <span className="board-hint-pointer">{hint}</span>
            <span className="board-hint-touch">{touchHint}</span>
          </>
        )}
      </p>
      <span role="status" className="sr-only">
        {copied ? done : ''}
      </span>
    </div>
  )
}
