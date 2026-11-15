'use client'

import { useEffect, useRef, useState } from 'react'

type Props = { items: readonly string[] }

/*
 * The stack as key caps (owner's pick, November 2026). Typing a letter
 * anywhere on the page (outside a field, with no modifier) presses the key of
 * the first tool starting with it; the same letter again moves to the next
 * one. A plain list without script; nothing runs at rest.
 */
export function StackKeys({ items }: Props) {
  const [down, setDown] = useState<string | null>(null)
  const turn = useRef<Record<string, number>>({})
  const timer = useRef(0)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.key.length !== 1) return
      if ((event.target as HTMLElement | null)?.closest('input, textarea, [contenteditable]'))
        return
      const letter = event.key.toLowerCase()
      const hits = items.filter((item) => item.toLowerCase().startsWith(letter))
      if (!hits.length) return
      const next = ((turn.current[letter] ?? -1) + 1) % hits.length
      turn.current[letter] = next
      setDown(hits[next] ?? null)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setDown(null), 220)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(timer.current)
    }
  }, [items])

  return (
    <ul className="cp-keycaps">
      {items.map((item) => (
        <li key={item}>
          <kbd className="cp-keycap" data-down={down === item || undefined}>
            {item}
          </kbd>
        </li>
      ))}
    </ul>
  )
}
