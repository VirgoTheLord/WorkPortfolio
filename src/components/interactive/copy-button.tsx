'use client'

import { useEffect, useRef, useState } from 'react'
import { Icon } from '@/components/ui/icon'
import { copyText } from '@/lib/copy-text'

type Props = {
  text: string
  /** The button's name ("Copy email address"). */
  label: string
  /** Announced, and shown as the tooltip, once the text is on the clipboard. */
  done: string
}

/* How long the check stays before the copy icon comes back (ms). */
const HOLD = 1800

/*
 * A small square button that copies a value beside where it is shown (the
 * compact site's email). A copy swaps the icon for a check with a small press
 * and settle (compact.css), and says so, politely for assistive tech and in a
 * small tag beside the button. Hidden without script, so never a dead control.
 */
export function CopyButton({ text, label, done }: Props) {
  const [copied, setCopied] = useState(false)
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = async () => {
    if (!(await copyText(text))) return
    setCopied(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), HOLD)
  }

  return (
    <span className="cp-copy-wrap">
      <button
        type="button"
        onClick={() => void copy()}
        className="cp-copy"
        data-copied={copied || undefined}
      >
        <span className="sr-only">{label}</span>
        <Icon name={copied ? 'check' : 'copy'} className="size-4" />
      </button>
      <span role="status" className="cp-copy-done font-label">
        {copied ? done : ''}
      </span>
    </span>
  )
}
