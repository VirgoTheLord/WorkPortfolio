'use client'

import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import type { CompactContent } from '@/types/content'

type Restyle = CompactContent['intro']['restyle']
type Props = { children: string; restyle: Restyle }

type Face = Restyle['faces'][number]['id']
type Ink = Restyle['inks'][number]['id']
type Mark = Restyle['marks'][number]['id']
type Style = Restyle['styles'][number]['id']

/* The size steps, as a multiple of the face's own size; the second is as set. */
const SIZES = [0.85, 1, 1.15, 1.3] as const
const AS_SET = 1

type Look = {
  face: Face
  ink: Ink
  mark: Mark | null
  styles: readonly Style[]
  size: number
}

const PLAIN: Look = { face: 'bricolage', ink: 'ink', mark: null, styles: [], size: AS_SET }

/* Puts each sliding marker over its group's pressed button (or hides it).
   The first placement is not animated: `data-ready` turns the slide on. */
function glide(tools: HTMLElement) {
  tools.querySelectorAll<HTMLElement>('[data-glide]').forEach((marker) => {
    const on = tools.querySelector<HTMLElement>(
      `[data-group="${marker.dataset.glide}"][aria-pressed="true"]`,
    )
    marker.toggleAttribute('data-off', !on)
    if (!on) return
    marker.style.setProperty('--x', `${on.offsetLeft}px`)
    marker.style.setProperty('--y', `${on.offsetTop}px`)
    marker.style.setProperty('--w', `${on.offsetWidth}px`)
    marker.style.setProperty('--h', `${on.offsetHeight}px`)
  })
  requestAnimationFrame(() => tools.setAttribute('data-ready', ''))
}

/*
 * "one thing well" in the opening sentence (owner's pick; shwn.design's idea,
 * made the site's own): the words shown selected as in an editor, in red, with
 * a toolbar under them, a small text editor for three words: six faces with
 * real weights and italics (each named in itself), bold, italic, underline and strike, four
 * sizes, ink or red, the desk's three highlighters, and a reset. The chosen
 * face, ink and highlighter are each shown by one marker that slides between
 * the buttons rather than jumping (owner's note). Real buttons,
 * each saying whether it is on. The words read as words.
 *
 * The toolbar opens only when the words are clicked or tapped (owner's call,
 * so the opening reads as a sentence first), and closes on a second click,
 * Escape or a click elsewhere.
 *
 * The toolbar hangs under the words but never past the sentence's edges: it is
 * measured and slid back inside (the words sit near the right edge on a
 * phone), again whenever the words, the bar or the page change size.
 */
export function LedeSelect({ children, restyle }: Props) {
  const [look, setLook] = useState<Look>(PLAIN)
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLSpanElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const words = useRef<HTMLButtonElement>(null)
  const barId = useId()

  // Escape, or a press anywhere else, closes it.
  useEffect(() => {
    if (!open) return
    const away = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    const key = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      words.current?.focus()
    }
    document.addEventListener('pointerdown', away)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('pointerdown', away)
      document.removeEventListener('keydown', key)
    }
  }, [open])

  useLayoutEffect(() => {
    const words = root.current
    const tools = bar.current
    const sentence = words?.closest('.cp-lede')
    if (!words || !tools || !sentence) return
    const place = () => {
      glide(tools)
      const w = words.getBoundingClientRect()
      const t = tools.getBoundingClientRect()
      const s = sentence.getBoundingClientRect()
      const centred = w.left + (w.width - t.width) / 2
      const left = Math.min(Math.max(centred, s.left), s.right - t.width)
      tools.style.setProperty('--cp-bar-x', `${Math.round(left - w.left)}px`)
    }
    place()
    // The bar is watched too: its own faces arrive late and widen it.
    const watch = new ResizeObserver(place)
    watch.observe(words)
    watch.observe(tools)
    watch.observe(sentence)
    void document.fonts.ready.then(place)
    return () => watch.disconnect()
  }, [])

  // The chosen face, ink and highlighter: one marker each, sliding to it.
  useLayoutEffect(() => {
    if (bar.current) glide(bar.current)
  }, [look.face, look.ink, look.mark])

  const toggle = (id: Style) =>
    setLook((now) => ({
      ...now,
      styles: now.styles.includes(id) ? now.styles.filter((s) => s !== id) : [...now.styles, id],
    }))
  const step = (by: -1 | 1) =>
    setLook((now) => {
      const at = SIZES.indexOf(now.size as (typeof SIZES)[number])
      const next = SIZES[Math.min(SIZES.length - 1, Math.max(0, at + by))] ?? AS_SET
      return { ...now, size: next }
    })
  const smallest = look.size === SIZES[0]
  const largest = look.size === SIZES[SIZES.length - 1]
  const plain =
    look.face === PLAIN.face &&
    look.ink === PLAIN.ink &&
    look.mark === null &&
    look.styles.length === 0 &&
    look.size === AS_SET

  return (
    <span
      ref={root}
      className="cp-select"
      data-face={look.face}
      data-ink={look.ink}
      data-mark={look.mark ?? undefined}
      data-bold={look.styles.includes('bold') || undefined}
      data-italic={look.styles.includes('italic') || undefined}
      data-underline={look.styles.includes('underline') || undefined}
      data-strike={look.styles.includes('strike') || undefined}
      data-open={open || undefined}
      style={{ '--cp-select-size': look.size } as CSSProperties}
    >
      <button
        ref={words}
        type="button"
        aria-expanded={open}
        aria-controls={barId}
        onClick={() => setOpen((now) => !now)}
        className="cp-select-words"
      >
        {children}
      </button>
      <span
        ref={bar}
        id={barId}
        role="toolbar"
        aria-label={restyle.label}
        inert={!open}
        aria-hidden={!open || undefined}
        className="cp-select-bar"
      >
        <span aria-hidden="true" className="cp-select-glide" data-glide="face" />
        <span aria-hidden="true" className="cp-select-ring" data-glide="ink" />
        <span aria-hidden="true" className="cp-select-ring" data-glide="mark" />
        <span className="cp-select-row">
          {restyle.faces.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={look.face === option.id}
              onClick={() => setLook((now) => ({ ...now, face: option.id }))}
              className="cp-select-face"
              data-group="face"
              data-face={option.id}
            >
              {option.label}
            </button>
          ))}
        </span>
        <span className="cp-select-row">
          {restyle.styles.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-label={option.label}
              aria-pressed={look.styles.includes(option.id)}
              onClick={() => toggle(option.id)}
              className="cp-select-tool"
              data-style={option.id}
            >
              {option.glyph}
            </button>
          ))}
          <span aria-hidden="true" className="cp-select-gap" />
          <button
            type="button"
            aria-label={restyle.size.smaller}
            disabled={smallest}
            onClick={() => step(-1)}
            className="cp-select-tool"
          >
            <span aria-hidden="true" className="cp-select-a cp-select-a-small">
              A
            </span>
          </button>
          <button
            type="button"
            aria-label={restyle.size.larger}
            disabled={largest}
            onClick={() => step(1)}
            className="cp-select-tool"
          >
            <span aria-hidden="true" className="cp-select-a">
              A
            </span>
          </button>
          <span aria-hidden="true" className="cp-select-gap" />
          {restyle.inks.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-label={option.label}
              aria-pressed={look.ink === option.id}
              onClick={() => setLook((now) => ({ ...now, ink: option.id }))}
              className="cp-select-ink"
              data-group="ink"
              data-ink={option.id}
            />
          ))}
          {restyle.marks.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-label={option.label}
              aria-pressed={look.mark === option.id}
              onClick={() =>
                setLook((now) => ({ ...now, mark: now.mark === option.id ? null : option.id }))
              }
              className="cp-select-mark"
              data-group="mark"
              data-mark={option.id}
            />
          ))}
          <span aria-hidden="true" className="cp-select-gap" />
          <button
            type="button"
            aria-label={restyle.reset}
            disabled={plain}
            onClick={() => setLook(PLAIN)}
            className="cp-select-tool"
          >
            <span aria-hidden="true">↺</span>
          </button>
        </span>
      </span>
    </span>
  )
}
