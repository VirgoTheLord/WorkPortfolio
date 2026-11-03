'use client'

import { useId, useRef, useState, type PointerEvent } from 'react'
import './neo-switch.css'

type NeoSwitchProps = {
  /** The switch's name, shown beside it unless `hideLabel`. */
  label: string
  hideLabel?: boolean
  /** Controlled state. Leave it out and the switch keeps its own. */
  checked?: boolean
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  size?: 'sm' | 'md'
  disabled?: boolean
  className?: string
}

type Drag = { x0: number; from: number; span: number; x: number; moved: boolean }

/* How long the dome takes to cross the groove (neo-switch.css). */
const ROLL = 330

/*
 * A switch moulded out of the surface it sits on (neo-switch.css): a groove
 * pressed into the page and a dome riding in it, shaped only by a light from
 * the top left. Pressed, the dome sinks and stretches like a rubber key;
 * released, it rolls across, squashes against the end and springs back, and
 * the cup in its crown fills with the accent. Hovered, it leans toward the
 * side it would go to; on a phone it ticks as it lands.
 *
 * The dome can be dragged and lands on the nearer side. A real switch
 * (role="switch") in a label, so the text toggles it too, and named by it. The look is CSS on
 * aria-checked, so it is right before hydration; a drag writes one custom
 * property and never re-renders.
 */
export function NeoSwitch({
  label,
  hideLabel = false,
  checked,
  defaultChecked = false,
  onChange,
  size = 'md',
  disabled = false,
  className = '',
}: NeoSwitchProps) {
  const [own, setOwn] = useState(defaultChecked)
  const on = checked ?? own
  const track = useRef<HTMLButtonElement>(null)
  const drag = useRef<Drag | null>(null)
  const dragged = useRef(false)
  const labelId = useId()

  const set = (next: boolean) => {
    if (track.current) track.current.dataset.used = ''
    if (checked === undefined) setOwn(next)
    onChange?.(next)
    window.setTimeout(() => navigator.vibrate?.(8), ROLL)
  }

  const release = (event: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    drag.current = null
    if (!d?.moved) return
    const el = event.currentTarget
    delete el.dataset.dragging
    el.style.removeProperty('--wui-neo-x')
    dragged.current = true
    if (d.x > 0.5 !== on) set(d.x > 0.5)
  }

  return (
    <label data-size={size} className={`wui-neo ${className}`}>
      <button
        ref={track}
        type="button"
        role="switch"
        aria-checked={on}
        aria-labelledby={labelId}
        disabled={disabled}
        onClick={() => {
          if (dragged.current) dragged.current = false
          else set(!on)
        }}
        onPointerDown={(event) => {
          const r = event.currentTarget.getBoundingClientRect()
          event.currentTarget.setPointerCapture(event.pointerId)
          drag.current = { x0: event.clientX, from: on ? 1 : 0, span: r.width - r.height, x: on ? 1 : 0, moved: false }
        }}
        onPointerMove={(event) => {
          const d = drag.current
          if (!d) return
          const dx = event.clientX - d.x0
          if (!d.moved && Math.abs(dx) < 4) return
          d.moved = true
          d.x = Math.min(1, Math.max(0, d.from + dx / d.span))
          event.currentTarget.dataset.dragging = ''
          event.currentTarget.style.setProperty('--wui-neo-x', d.x.toFixed(3))
        }}
        onPointerUp={release}
        onPointerCancel={release}
        className="wui-neo-track"
      >
        <span aria-hidden="true" className="wui-neo-thumb">
          <span className="wui-neo-cup" />
        </span>
      </button>
      <span id={labelId} className={hideLabel ? 'wui-sr-only' : undefined}>{label}</span>
    </label>
  )
}
