'use client'

import { useSyncExternalStore } from 'react'

type Props = { label: string }

const noop = () => () => {}
const apple = () => /mac|iphone|ipad|ipod/i.test(navigator.platform)

/*
 * The search, said rather than shown (owner's call, November 2026): a small
 * "⌘K to search" (Ctrl K off Apple devices) in the top line instead of a
 * field. Pressing it opens the palette, as the shortcut does, by pressing the
 * search's own trigger, which stays mounted out of sight (compact.css).
 */
export function SearchHint({ label }: Props) {
  const mac = useSyncExternalStore(noop, apple, () => null)

  return (
    <button
      type="button"
      className="cp-hint cp-meta"
      onClick={() =>
        document.querySelector<HTMLButtonElement>('.cp-search .wui-lens-trigger')?.click()
      }
    >
      <kbd className="cp-hint-key">{mac === false ? 'Ctrl' : '⌘'}</kbd>
      <kbd className="cp-hint-key">K</kbd>
      <span>{label}</span>
    </button>
  )
}
