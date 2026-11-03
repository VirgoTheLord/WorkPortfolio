'use client'

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { createRecordStack, glyph } from './record-stack-engine'
import './record-stack.css'

export type StackRecord = {
  title: string
  artist?: string
  /** The cover: an image, a gradient, anything that fills a square. */
  art: ReactNode
  /** The audio. Leave it out and the stack runs a silent clock for `duration`. */
  src?: string
  /** Seconds, for the silent clock (the audio's own length wins when there is a src). */
  duration?: number
}

type RecordStackProps = {
  records: readonly StackRecord[]
  /** The stack's accessible name. */
  label: string
  /** `flick`: drag or flick the top cover to change record. `fan`: the covers fan out to pick from. */
  variant?: 'flick' | 'fan'
  defaultIndex?: number
  onChange?: (index: number) => void
  onPlayChange?: (playing: boolean) => void
  className?: string
  style?: CSSProperties
}

const Glyph = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="wui-stack-glyph">
    {glyph(0).map((d, k) => (
      <path key={k} d={d} />
    ))}
  </svg>
)

/*
 * A stack of record covers (record-stack.css, record-stack-engine.ts). The top
 * cover is the record playing, and a hairline round its edge fills with the
 * song. Drag it and it hangs from where you grabbed it, tilting with your hand;
 * flick it right and it swings out on one arc, passes behind the pile and
 * settles at the back of the deck while the next cover steps up; flick it left
 * and the back one swings out and lands on top. In the fan variant the covers spread in an
 * arc to pick from instead. Under the stack, a ticker line holds the title and
 * artist, sliding the way the covers went, beside a play button and the time.
 *
 * Any number of records. The pile is a slider over the records (in the fan
 * variant, a button that opens the fan): arrow keys change record, Enter or
 * Space plays (in the fan, Enter opens it, arrows move along it, Enter picks,
 * Escape folds it). The play button is a real button and each
 * change is announced politely. Reduced motion changes the record without the
 * motion. With a src the audio plays through an <audio> element; without one a
 * silent clock runs, so it doubles as a showcase.
 */
export function RecordStack({ records, label, variant = 'flick', defaultIndex = 0, onChange, onPlayChange, className = '', style }: RecordStackProps) {
  const root = useRef<HTMLDivElement>(null)
  const first = Math.min(Math.max(0, defaultIndex), Math.max(0, records.length - 1))
  const callbacks = useRef({ onChange, onPlayChange })
  useEffect(() => {
    callbacks.current = { onChange, onPlayChange }
  })

  // The engine owns the motion; it is rebuilt when the records or the variant change.
  const startAt = useRef(first)
  useEffect(() => {
    if (!root.current || !records.length) return
    const engine = createRecordStack(root.current, {
      records,
      index: startAt.current,
      variant,
      onChange: (i) => {
        startAt.current = i
        callbacks.current.onChange?.(i)
      },
      onPlayChange: (p) => callbacks.current.onPlayChange?.(p),
    })
    return engine.destroy
  }, [records, variant])

  if (!records.length) return null
  const n = records.length
  const current = records[first]

  return (
    <div ref={root} role="group" aria-label={label} data-variant={variant} className={`wui-stack ${className}`} style={style}>
      <div
        className="wui-stack-pile"
        tabIndex={0}
        {...(variant === 'fan'
          ? { role: 'button', 'aria-expanded': false, 'aria-label': `${n} records. Enter fans them out; arrow keys choose, Enter plays.` }
          : {
              role: 'slider',
              'aria-label': 'Record. Arrow keys change record, Enter plays or pauses.',
              'aria-valuemin': 1,
              'aria-valuemax': n,
              'aria-valuenow': first + 1,
              'aria-valuetext': `${current!.title}, ${first + 1} of ${n}`,
            })}
      >
        {records.map((r, i) => (
          <div key={i} className="wui-stack-card" data-slot={Math.min((i - first + n) % n, 4)} style={{ zIndex: 2 * (n - ((i - first + n) % n)) }}>
            <span className="wui-stack-art">{r.art}</span>
            <svg className="wui-stack-edge" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <rect className="wui-stack-edge-track" x="0" y="0" width="100" height="100" rx="12.7" />
              <rect className="wui-stack-edge-fill" x="0" y="0" width="100" height="100" rx="12.7" pathLength={1} />
            </svg>
          </div>
        ))}
      </div>
      <div className="wui-stack-ticker">
        <button type="button" className="wui-stack-play" aria-label="Play">
          <Glyph />
        </button>
        <div className="wui-stack-window">
          {[0, 1].map((k) => (
            <div key={k} className="wui-stack-slide" aria-hidden={k === 1 ? true : undefined} style={k === 1 ? { opacity: 0 } : undefined}>
              <span className="wui-stack-title">{k === 0 ? current!.title : ''}</span>
              <span className="wui-stack-artist">{k === 0 ? (current!.artist ?? '') : ''}</span>
            </div>
          ))}
        </div>
        <span className="wui-stack-time">0:00</span>
      </div>
      <span className="wui-sr-only" aria-live="polite" />
    </div>
  )
}
