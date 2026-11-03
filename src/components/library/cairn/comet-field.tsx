'use client'

import { useState, type ChangeEvent, type ComponentProps, type CSSProperties } from 'react'
import './comet-field.css'

type CometFieldProps = Omit<ComponentProps<'input'>, 'onChange' | 'value' | 'defaultValue' | 'className'> & {
  /** The field's label: it sits in the field and climbs out on focus. */
  label: string
  /** Controlled value. Leave it out and the field keeps its own. */
  value?: string
  defaultValue?: string
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void
  className?: string
}

/*
 * A text field whose label climbs out of it, a letter at a time, while a comet
 * with a prism head laps its edge once (comet-field.css). It lands at the middle
 * of the bottom edge and comes to rest as a thin border in the accent, with
 * light spreading inside from where it landed.
 *
 * A real input inside its label, so clicking anywhere on it focuses it and
 * every input attribute (type, name, autoComplete, required…) passes through.
 * The look is CSS on :focus-within and data-has, so it is right before
 * hydration, and nothing runs at rest. With reduced motion there is no comet:
 * the border and the light are simply there.
 */
export function CometField({ label, value, defaultValue, onChange, className = '', ...props }: CometFieldProps) {
  const [own, setOwn] = useState(defaultValue ?? '')
  const current = value ?? own

  return (
    <label data-has={current ? '' : undefined} className={`wui-comet ${className}`}>
      <span aria-hidden="true" className="wui-comet-label">
        {[...label].map((char, i) => (
          <span key={i} style={{ '--i': i } as CSSProperties}>
            {char === ' ' ? ' ' : char}
          </span>
        ))}
      </span>
      <span className="wui-sr-only">{label}</span>
      <input
        {...props}
        value={current}
        onChange={(event) => {
          if (value === undefined) setOwn(event.target.value)
          onChange?.(event.target.value, event)
        }}
        className="wui-comet-input"
      />
      <span aria-hidden="true" className="wui-comet-low" />
      <span aria-hidden="true" data-soft="" className="wui-comet-ring" />
      <span aria-hidden="true" className="wui-comet-ring" />
    </label>
  )
}
