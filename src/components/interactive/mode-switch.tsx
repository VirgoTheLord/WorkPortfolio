'use client'

import { useSyncExternalStore } from 'react'
import { readTheme, subscribeTheme, switchTheme } from '@/lib/theme'

const none = () => null

/* The icon twice, in the same place: the ink one over a red impression of it
   (site-menu.css). */
function Icons() {
  return (
    <>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="mode-key-icon mode-key-sun">
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" />
      </svg>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="mode-key-icon mode-key-moon">
        <path d="M19.5 14.6A8 8 0 0 1 9.4 4.5a8 8 0 1 0 10.1 10.1Z" />
      </svg>
    </>
  )
}

/*
 * The full site's light and dark switch: the printed key (owner's pick, from the
 * key and the offset print). A key face on a thin ink lip, its sun or moon
 * printed in register over a red impression. Pressing dark latches the key down
 * and it takes the red; light lifts it back. On every press the impression slips
 * out of register and thumps back as the icon changes. The look is CSS on the
 * page's mode (site-menu.css), so the key is server-rendered and right before
 * hydration, and arrives with the rest of the bar in its entrance. Until the mode
 * is known it is a plain button (a switch must say whether it is on). The page
 * dips through the new mode's colour (lib/theme.ts); the choice is the compact
 * site's too.
 */
export function ModeSwitch({ label }: { label: string }) {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, none)

  return (
    <button
      type="button"
      role={theme === null ? undefined : 'switch'}
      aria-checked={theme === null ? undefined : theme === 'dark'}
      aria-label={label}
      className="mode-key"
      onClick={(event) => {
        const button = event.currentTarget
        // Alternates two identical keyframes so the slip replays on every press.
        button.dataset.pressed = button.dataset.pressed === 'a' ? 'b' : 'a'
        switchTheme()
      }}
    >
      <span aria-hidden="true" className="mode-key-block" />
      <span aria-hidden="true" className="mode-key-face">
        <span className="mode-key-layer mode-key-print">
          <Icons />
        </span>
        <span className="mode-key-layer mode-key-ink">
          <Icons />
        </span>
      </span>
    </button>
  )
}
