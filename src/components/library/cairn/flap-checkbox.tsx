'use client'

import { useRef } from 'react'
import './flap-checkbox.css'

type FlapCheckboxProps = {
  /** The checkbox's name, shown beside it unless `hideLabel`. */
  label: string
  hideLabel?: boolean
  /** Controlled state. Leave it out and the checkbox keeps its own. */
  checked?: boolean
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  name?: string
  value?: string
  className?: string
}

const TICK = (
  <svg viewBox="0 0 24 26" aria-hidden="true" className="wui-flap-tick">
    <path d="M6.5 13.5 10.5 17.5 18 9" />
  </svg>
)

/*
 * A checkbox as one departures-board cell (flap-checkbox.css). Checked, the
 * flap falls and lands on a tick in the accent; unchecked, it falls back to a
 * blank face. A real checkbox in a label: it submits with a form, Space
 * toggles it, and the text toggles it too. The fall plays only once it has
 * been used, never on load.
 */
export function FlapCheckbox({
  label,
  hideLabel = false,
  checked,
  defaultChecked,
  onChange,
  disabled,
  name,
  value,
  className = '',
}: FlapCheckboxProps) {
  const root = useRef<HTMLLabelElement>(null)

  return (
    <label ref={root} className={`wui-flap ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        name={name}
        value={value}
        onChange={(event) => {
          if (root.current) root.current.dataset.used = ''
          onChange?.(event.target.checked)
        }}
        className="wui-flap-input"
      />
      <span aria-hidden="true" className="wui-flap-cell">
        <span data-top="" data-new="" className="wui-flap-half">
          {TICK}
        </span>
        <span data-bottom="" data-old="" className="wui-flap-half">
          {TICK}
        </span>
        <span data-top="" data-old="" data-moving="" className="wui-flap-half">
          {TICK}
        </span>
        <span data-bottom="" data-new="" data-moving="" className="wui-flap-half">
          {TICK}
        </span>
      </span>
      <span className={hideLabel ? 'wui-sr-only' : undefined}>{label}</span>
    </label>
  )
}
