'use client'

import { useId, useState } from 'react'
import './flap-segments.css'

type Palette = 'auto' | 'departures' | 'signal' | 'paper' | 'platform'

type FlapSegmentsProps = {
  /** The group's name, read to screen readers. */
  label: string
  options: readonly (string | { value: string; label: string })[]
  /** Controlled value. Leave it out and the control keeps its own. */
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  /** The board's colours. `auto` follows the theme, the chosen tile in the accent. */
  palette?: Palette
  /** The radios' name, for a form. */
  name?: string
  className?: string
}

/*
 * A segmented control as a row of departures-board tiles (flap-segments.css).
 * Each tile has two faces on one hinge: choosing one flips it over to its
 * face, and the one before flips back. Real radios in a fieldset, so arrow
 * keys move the choice and it submits with a form; the look is CSS on the
 * checked radio, so it is right before hydration and costs nothing at rest.
 * Reduced motion swaps the faces without the flip.
 */
export function FlapSegments({
  label,
  options,
  value,
  defaultValue,
  onChange,
  palette = 'auto',
  name,
  className = '',
}: FlapSegmentsProps) {
  const items = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))
  const [own, setOwn] = useState(defaultValue ?? items[0]?.value)
  const current = value ?? own
  const fallbackName = useId()

  return (
    <fieldset data-palette={palette} className={`wui-flapseg ${className}`}>
      <legend className="wui-sr-only">{label}</legend>
      {items.map((item) => (
        <label key={item.value} className="wui-flapseg-option">
          <input
            type="radio"
            name={name ?? fallbackName}
            value={item.value}
            checked={item.value === current}
            onChange={() => {
              if (value === undefined) setOwn(item.value)
              onChange?.(item.value)
            }}
            className="wui-flapseg-input"
          />
          <span className="wui-flapseg-tile">
            <span className="wui-flapseg-face">{item.label}</span>
            <span aria-hidden="true" data-back="" className="wui-flapseg-face">
              {item.label}
            </span>
          </span>
        </label>
      ))}
    </fieldset>
  )
}
