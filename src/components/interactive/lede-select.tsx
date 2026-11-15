'use client'

import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import type { CompactContent } from '@/types/content'

type Restyle = CompactContent['intro']['restyle']
type Props = { children: string; restyle: Restyle }

type Face = Restyle['faces'][number]['id']
type Ink = Restyle['inks'][number]['id']
type Mark = Restyle['marks'][number]['id']
type Style = Restyle['styles'][number]['id']

/* The size steps, as a multiple of the face's own size; the second is as set. */
const SIZES = [0.85, 1, 1.2, 1.45] as const
const AS_SET = 1

type Look = {
  face: Face
  ink: Ink
  mark: Mark | null
  styles: readonly Style[]
  size: number
}

const PLAIN: Look = { face: 'display', ink: 'ink', mark: null, styles: [], size: AS_SET }

/*
 * "one thing well" in the opening sentence (owner's pick; shwn.design's idea,
 * made the site's own): the words shown selected as in an editor, in red, with
 * a toolbar under them, a small text editor for three words: the site's six
 * faces (each named in itself), bold, italic, underline and strike, four
 * sizes, ink or red, the desk's three highlighters, and a reset. Real buttons,
 * each saying whether it is on. The words read as words.
 *
 * The toolbar hangs under the words but never past the sentence's edges: it is
 * measured and slid back inside (the words sit near the right edge on a
 * phone), again whenever the words, the bar or the page change size.
 */
export function LedeSelect({ children, restyle }: Props) {
  const [look, setLook] = useState<Look>(PLAIN)
  const root = useRef<HTMLSpanElement>(null)
  const bar = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const words = root.current
    const tools = bar.current
    const sentence = words?.closest('.cp-lede')
    if (!words || !tools || !sentence) return
    const place = () => {
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
      style={{ '--cp-select-size': look.size } as CSSProperties}
    >
      {children}
      <span ref={bar} role="toolbar" aria-label={restyle.label} className="cp-select-bar">
        <span className="cp-select-row">
          {restyle.faces.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={look.face === option.id}
              onClick={() => setLook((now) => ({ ...now, face: option.id }))}
              className="cp-select-face"
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
