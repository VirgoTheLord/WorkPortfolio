'use client'

import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}
const apple = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
const none = () => null

/*
 * The search's shortcut as this visitor's keyboard writes it, as two separate
 * key caps with a little air between them: ⌘ K on Apple devices, Ctrl K
 * elsewhere. The server cannot know which, so the first cap stays empty until
 * the client's first render fills it in (its width is reserved, compact.css).
 */
export function ShortcutKey({ className }: { className?: string }) {
  const mac = useSyncExternalStore(subscribe, apple, none)
  return (
    <kbd className={className}>
      <kbd>{mac === null ? '' : mac ? '⌘' : 'Ctrl'}</kbd>
      <kbd>K</kbd>
    </kbd>
  )
}
