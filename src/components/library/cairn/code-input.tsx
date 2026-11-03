'use client'

import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react'
import './code-input.css'

type CodeInputProps = {
  /** How many digits. */
  length?: number
  /** The field's accessible name. */
  label?: string
  /** Controlled value, digits only. Leave it out and the field keeps its own. */
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  /**
   * Called with the code once every digit is in. Return true if it is right,
   * false if it is wrong (the digits clear themselves), or nothing to leave
   * the verdict to you. It may return a promise.
   */
  onComplete?: (code: string) => boolean | void | Promise<boolean | void>
  /** Shown to assistive technology with the verdict. */
  verifiedText?: string
  wrongText?: string
  name?: string
  disabled?: boolean
  className?: string
}

type State = 'idle' | 'ok' | 'bad' | 'clear'

/*
 * A one-time code as a row of raised blank keys (code-input.css). Each digit
 * presses its key down and prints its legend; the next key stands a little
 * taller to show where you are. A right code sends a hop through the row and
 * the caps take the accent; a wrong one rattles the row, then the keys spring
 * back up and blank, one after another.
 *
 * One native input lies over the keys, so typing, paste ("428-913"), the
 * mobile one-time-code suggestion and backspace all work as in any field. It
 * keeps digits only. The look is CSS driven by each key's filled attribute, so
 * the row is right before hydration; the verdict is announced politely.
 */
export function CodeInput({
  length = 6,
  label = 'Verification code',
  value,
  defaultValue = '',
  onChange,
  onComplete,
  verifiedText = 'Verified',
  wrongText = 'Wrong code',
  name,
  disabled,
  className = '',
}: CodeInputProps) {
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  const [own, setOwn] = useState(defaultValue.replace(/\D/g, '').slice(0, length))
  const [ghost, setGhost] = useState(own)
  const [state, setState] = useState<State>('idle')
  const [focused, setFocused] = useState(false)
  const code = (value ?? own).replace(/\D/g, '').slice(0, length)
  // What the verdict timer needs, kept current so the timer is not restarted by a new callback.
  const latest = useRef({ onComplete, onChange, controlled: value !== undefined })
  const reset = useRef(0)

  useEffect(() => {
    latest.current = { onComplete, onChange, controlled: value !== undefined }
  })

  const setCode = (next: string) => {
    if (value === undefined) setOwn(next)
    // The legend stays on a key while it springs back up and blanks.
    setGhost((last) => Array.from({ length }, (_, i) => next[i] ?? last[i] ?? '').join(''))
    onChange?.(next)
  }

  // Six digits in: after a beat, ask for the verdict. A wrong code waits, then
  // clears itself one key at a time. Typing again cancels all of it.
  useEffect(() => {
    if (code.length !== length) return
    let live = true
    let wait = 0
    const check = window.setTimeout(async () => {
      const ok = await latest.current.onComplete?.(code)
      if (!live || ok === undefined) return
      setState(ok ? 'ok' : 'bad')
      if (ok) return
      wait = window.setTimeout(() => {
        setState('clear')
        if (!latest.current.controlled) setOwn('')
        latest.current.onChange?.('')
        reset.current = window.setTimeout(() => setState('idle'), 700)
      }, 950)
    }, 300)
    return () => {
      live = false
      window.clearTimeout(check)
      window.clearTimeout(wait)
    }
  }, [code, length])

  useEffect(() => () => window.clearTimeout(reset.current), [])

  const onInput = (event: ChangeEvent<HTMLInputElement>) => {
    window.clearTimeout(reset.current)
    setState('idle')
    const next = event.target.value.replace(/\D/g, '').slice(0, length)
    event.target.value = next
    setCode(next)
  }

  // The caret always sits after the last digit: a key is never edited in the middle.
  const toEnd = () => input.current?.setSelectionRange(code.length, code.length)

  const verdict = state === 'ok' ? verifiedText : state === 'bad' ? wrongText : ''

  return (
    <div
      className={`wui-code ${className}`}
      data-state={state}
      style={{ '--wui-code-length': length } as React.CSSProperties}
    >
      <input
        ref={input}
        id={id}
        name={name}
        value={code}
        onChange={onInput}
        onFocus={() => {
          setFocused(true)
          toEnd()
        }}
        onBlur={() => setFocused(false)}
        onPointerUp={toEnd}
        onKeyUp={toEnd}
        disabled={disabled}
        inputMode="numeric"
        autoComplete="one-time-code"
        spellCheck={false}
        aria-label={label}
        aria-invalid={state === 'bad' || undefined}
        className="wui-code-input"
      />
      <span className="wui-code-slots" aria-hidden="true">
        {Array.from({ length }, (_, i) => (
          <span
            key={i}
            className="wui-code-slot"
            data-filled={i < code.length}
            data-on={focused && i === code.length && code.length < length ? '' : undefined}
            style={{ '--wui-code-i': i } as React.CSSProperties}
          >
            <span className="wui-code-cap">{code[i] ?? ghost[i] ?? ''}</span>
          </span>
        ))}
      </span>
      <span className="wui-sr-only" role="status">
        {verdict}
      </span>
    </div>
  )
}
