'use client'

import { useRef, useSyncExternalStore } from 'react'
import { NeoSwitch } from '@/components/library/cairn/neo-switch'
import { readTheme, subscribeTheme, switchTheme } from '@/lib/theme'

const none = () => null

/*
 * The full site's light and dark switch: Cairn's neumorph switch, small, in the
 * bar beside "Let's Talk" (beside the menu trigger below lg; site-menu.tsx),
 * clean, without the accent cup. On is dark. The new mode opens as a circle
 * from the switch (lib/theme.ts); the choice is the compact site's too. Before
 * hydration the mode is unknown, so the switch waits to show.
 */
export function ModeSwitch({ label }: { label: string }) {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, none)
  const ref = useRef<HTMLSpanElement>(null)

  if (theme === null) return null

  return (
    <span ref={ref} data-mode={theme} className="mode-switch">
      {/* The sun and the moon say what the switch is for; the one that is on is
          in ink. Decoration: the switch is named for assistive tech. */}
      <svg aria-hidden="true" viewBox="0 0 24 24" className="mode-switch-sun">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
      </svg>
      <NeoSwitch
        label={label}
        hideLabel
        size="sm"
        checked={theme === 'dark'}
        onChange={() => {
          const box = ref.current?.getBoundingClientRect()
          switchTheme(box && { x: box.left + box.width / 2, y: box.top + box.height / 2 })
        }}
      />
      <svg aria-hidden="true" viewBox="0 0 24 24" className="mode-switch-moon">
        <path d="M19.5 14.6A8 8 0 0 1 9.4 4.5a8 8 0 1 0 10.1 10.1Z" />
      </svg>
    </span>
  )
}
