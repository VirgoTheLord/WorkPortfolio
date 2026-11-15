'use client'

import { useSyncExternalStore } from 'react'

const noop = () => () => {}
/* Apple devices use ⌘; everything else (Windows, Linux, ChromeOS) Ctrl. The
   same test the search's own shortcut uses (library/cairn/lens-search.tsx). */
const apple = () =>
  /mac|iphone|ipad|ipod/i.test(
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ||
      navigator.platform,
  )

/** Whether the visitor is on an Apple device; null until the browser says. */
export function useApple() {
  return useSyncExternalStore(noop, apple, () => null)
}

/*
 * The search shortcut's modifier as the visitor's keyboard has it: ⌘ on Apple
 * devices, Ctrl elsewhere. Until the browser says which (the server cannot
 * know), it holds its place invisibly, so a Windows visitor never sees ⌘
 * flash first.
 */
export function ShortcutModifier() {
  const mac = useApple()
  return (
    <span data-known={mac !== null || undefined} className="cp-modifier">
      {mac === false ? 'Ctrl' : '⌘'}
    </span>
  )
}
