'use client'

import { ShortcutModifier } from './shortcut-label'

type Props = { label: string; touch: string }

/*
 * The search, said rather than shown (owner's call, November 2026): a small
 * "⌘K to search" (Ctrl K off Apple devices) in the top line instead of a
 * field; on a touch screen, where there is no keyboard, just "Search". Pressing it opens the palette, as the shortcut does, by pressing the
 * search's own trigger, which stays mounted out of sight (compact.css).
 */
export function SearchHint({ label, touch }: Props) {
  return (
    <button
      type="button"
      className="cp-hint cp-meta"
      onClick={() =>
        document.querySelector<HTMLButtonElement>('.cp-search .wui-lens-trigger')?.click()
      }
    >
      <span className="cp-hint-keys">
        <kbd className="cp-hint-key">
          <ShortcutModifier />
        </kbd>
        <kbd className="cp-hint-key">K</kbd>
        <span>{label}</span>
      </span>
      {/* No keyboard on a touch screen: just the word, to tap. */}
      <span className="cp-hint-touch">{touch}</span>
    </button>
  )
}
