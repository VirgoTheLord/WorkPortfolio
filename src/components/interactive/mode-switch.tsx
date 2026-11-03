'use client'

import { useRef, useSyncExternalStore } from 'react'
import { NeoSwitch } from '@/components/library/cairn/neo-switch'
import { readTheme, subscribeTheme, switchTheme } from '@/lib/compact-theme'

const none = () => null

/*
 * The full site's light and dark switch: Cairn's neumorph switch, small, in the
 * bar beside "Let's Talk" (beside the menu trigger below lg; site-menu.tsx),
 * clean, without the accent cup. On is dark. The new mode opens as a circle
 * from the switch (lib/compact-theme.ts) and is kept for the tab. Before
 * hydration the mode is unknown, so the switch waits to show.
 */
export function ModeSwitch({ label }: { label: string }) {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, none)
  const ref = useRef<HTMLSpanElement>(null)

  if (theme === null) return null

  return (
    <span ref={ref} className="flex">
      <NeoSwitch
        label={label}
        hideLabel
        size="sm"
        checked={theme === 'dark'}
        onChange={() => {
          const box = ref.current?.getBoundingClientRect()
          switchTheme(box && { x: box.left + box.width / 2, y: box.top + box.height / 2 }, 'site')
        }}
      />
    </span>
  )
}
