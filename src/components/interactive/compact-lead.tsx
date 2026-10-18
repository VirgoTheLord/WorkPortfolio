'use client'

import { Fragment, useEffect, useId, useRef, useState } from 'react'
import type { CompactDetail } from '@/types/content'
import './compact-lead.css'

/* The cells word: how many cell rows the capitals get, the share of a cell the
   letter must cover to draw it, and how long the print takes to cross the word. */
const ROWS = 9
const MIN_COVER = 0.5
const SWEEP = 220

type Props = {
  parts: readonly (string | CompactDetail)[]
  hint: { pointer: string; touch: string }
}

/*
 * The compact intro's paragraph and its readout (compact-lead.css). Some words
 * answer hover, keyboard focus and tap: the word's underline turns accent and its
 * detail rolls into the readout, a fixed line under the paragraph, so nothing ever
 * covers the text (a chip above the word did) and the eye always knows where to
 * look. At rest the readout says how to use it. Escape or a tap elsewhere clears
 * it. Each word is a real button described by its detail, so a screen reader
 * hears both; the visible readout is a duplicate and hidden from it. A detail of
 * kind `cells` also redraws its word in pixel cells while active.
 *
 * Punctuation that follows a word is kept with it, so a line never starts with
 * one.
 */
export function CompactLead({ parts, hint }: Props) {
  const base = useId()
  const [active, setActive] = useState<number | null>(null)
  // Tapped (sticky until a tap elsewhere) rather than hovered or focused.
  const [pinned, setPinned] = useState(false)

  useEffect(() => {
    if (!pinned) return
    const away = (event: PointerEvent) => {
      if (!(event.target as Element).closest?.('.compact-lead-word')) {
        setPinned(false)
        setActive(null)
      }
    }
    document.addEventListener('pointerdown', away)
    return () => document.removeEventListener('pointerdown', away)
  }, [pinned])

  const details = parts.filter((part): part is CompactDetail => typeof part !== 'string')
  const current = active === null ? null : details[active]

  // Each word, with any punctuation that opens the next run kept beside it.
  let index = -1
  const runs: React.ReactNode[] = []
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!
    if (typeof part === 'string') {
      runs.push(<Fragment key={i}>{part}</Fragment>)
      continue
    }
    index++
    const n = index
    const next = parts[i + 1]
    const glue = typeof next === 'string' ? (/^[.,;:!?]+/.exec(next)?.[0] ?? '') : ''
    runs.push(
      <span key={i} className="compact-lead-keep">
        <button
          type="button"
          className="compact-lead-word"
          data-active={active === n || undefined}
          aria-describedby={`${base}-${n}`}
          onPointerEnter={(event) => {
            if (event.pointerType === 'mouse' && !pinned) setActive(n)
          }}
          onPointerLeave={(event) => {
            if (event.pointerType === 'mouse' && !pinned) setActive(null)
          }}
          onFocus={(event) => {
            if (event.currentTarget.matches(':focus-visible')) setActive(n)
          }}
          onBlur={() => {
            if (!pinned) setActive(null)
          }}
          onClick={() => {
            const same = active === n && pinned
            setPinned(!same)
            setActive(same ? null : n)
          }}
          onKeyDown={(event) => {
            if (event.key !== 'Escape') return
            setPinned(false)
            setActive(null)
          }}
        >
          <span className="compact-lead-label">{part.text}</span>
          {part.kind === 'cells' ? <CellsWord text={part.text} on={active === n} /> : null}
          <span id={`${base}-${n}`} className="sr-only">
            {part.detail}
          </span>
        </button>
        {glue}
      </span>,
    )
    if (glue) {
      const rest = (next as string).slice(glue.length)
      runs.push(<Fragment key={`${i}-rest`}>{rest}</Fragment>)
      i++
    }
  }

  return (
    <div className="compact-lead">
      <p className="compact-lead-para">{runs}</p>
      <p aria-hidden="true" className="compact-readout font-label text-label">
        <span className="compact-readout-rule" />
        <span className="compact-readout-window">
          <span
            key={active ?? 'hint'}
            className="compact-readout-line"
            data-idle={current ? undefined : ''}
          >
            {current ? (
              <>
                {current.kind === 'place' ? <span className="compact-readout-dot" /> : null}
                {current.detail}
              </>
            ) : (
              <>
                <span className="compact-readout-hint-pointer">{hint.pointer}</span>
                <span className="compact-readout-hint-touch">{hint.touch}</span>
              </>
            )}
          </span>
        </span>
      </p>
    </div>
  )
}

/* The word redrawn in pixel cells over its own box while `on`, printing left to
   right (the full site's hero motif, at text size). */
function CellsWord({ text, on }: { text: string; on: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = ref.current
    const button = c?.parentElement
    const word = button?.querySelector<HTMLElement>('.compact-lead-label')
    const ctx = c?.getContext('2d')
    if (!c || !button || !word || !ctx) return
    if (!on) {
      delete button.dataset.cells
      return
    }
    const style = getComputedStyle(word)
    const box = word.getBoundingClientRect()
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    const size = parseFloat(style.fontSize)
    const cell = Math.max(2, (size * 0.72) / ROWS)
    c.width = Math.round(box.width * ratio)
    c.height = Math.round(box.height * ratio)
    // Sample the word as it is set, at 2x, cell by cell.
    const scale = 2
    const probe = document.createElement('canvas')
    probe.width = Math.ceil(box.width * scale)
    probe.height = Math.ceil(box.height * scale)
    const p = probe.getContext('2d', { willReadFrequently: true })
    if (!p) return
    p.scale(scale, scale)
    p.font = `${style.fontWeight} ${size}px ${style.fontFamily}`
    p.textBaseline = 'alphabetic'
    const m = p.measureText(text)
    const baseline =
      (box.height - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2 +
      m.fontBoundingBoxAscent
    p.fillText(text, 0, baseline)
    const data = p.getImageData(0, 0, probe.width, probe.height).data
    const cells: [number, number][] = []
    for (let y = 0; y + cell <= box.height + cell / 2; y += cell) {
      for (let x = 0; x < box.width; x += cell) {
        let sum = 0
        let count = 0
        const y1 = Math.min(probe.height, Math.ceil((y + cell) * scale))
        const x1 = Math.min(probe.width, Math.ceil((x + cell) * scale))
        for (let yy = Math.floor(y * scale); yy < y1; yy++) {
          for (let xx = Math.floor(x * scale); xx < x1; xx++) {
            sum += data[(yy * probe.width + xx) * 4 + 3]!
            count++
          }
        }
        if (count && sum / (255 * count) >= MIN_COVER) cells.push([x, y])
      }
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ink = style.color
    const start = performance.now()
    let frame = 0
    const paint = (now: number) => {
      const reach = reduced ? Infinity : ((now - start) / SWEEP) * box.width
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      ctx.clearRect(0, 0, box.width, box.height)
      ctx.fillStyle = ink
      for (const [x, y] of cells) if (x <= reach) ctx.fillRect(x, y, cell - 0.5, cell - 0.5)
      frame = reach < box.width ? requestAnimationFrame(paint) : 0
    }
    button.dataset.cells = 'on'
    frame = requestAnimationFrame(paint)
    return () => cancelAnimationFrame(frame)
  }, [on, text])

  return <canvas ref={ref} aria-hidden="true" className="compact-lead-cells" />
}
