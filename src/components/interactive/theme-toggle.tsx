'use client'

import { useSyncExternalStore } from 'react'
import { readTheme, subscribeTheme, switchTheme } from '@/lib/theme'
import type { CompactContent } from '@/types/content'

const none = () => null
/* The sun's rays, one every 45°. */
const RAYS = [0, 45, 90, 135, 180, 225, 270, 315]

/*
 * The compact site's light/dark switch (lib/theme.ts; one choice with the full
 * site's switch): two slots, a sun
 * and a moon, in one hairline pill, and a block in the accent that glides to
 * whichever is on. The sun's rays spread as it lights; the moon tips back and a
 * star glints beside it. All CSS (compact.css), keyed off <html>'s mode, so it
 * is right before hydration. A real switch (`role="switch"`), named for what it
 * is; a click anywhere on it flips the mode, opened as a circle from the block.
 */
export function ThemeToggle({ label }: CompactContent['theme']) {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, none)

  return (
    <button
      type="button"
      role="switch"
      aria-checked={theme === null ? undefined : theme === 'dark'}
      aria-label={label}
      onClick={(event) => {
        const thumb = event.currentTarget.querySelector('.cp-theme-thumb')
        const box = (thumb ?? event.currentTarget).getBoundingClientRect()
        switchTheme({ x: box.left + box.width / 2, y: box.top + box.height / 2 })
      }}
      className="cp-theme"
    >
      <span aria-hidden="true" className="cp-theme-thumb" />
      <span aria-hidden="true" className="cp-theme-slot cp-theme-sun">
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="4.5" className="cp-theme-fill" />
          <g className="cp-theme-rays">
            {RAYS.map((angle) => (
              <line
                key={angle}
                x1="12"
                y1="2.5"
                x2="12"
                y2="4.5"
                transform={`rotate(${angle} 12 12)`}
              />
            ))}
          </g>
        </svg>
      </span>
      <span aria-hidden="true" className="cp-theme-slot cp-theme-moon">
        <svg viewBox="0 0 24 24">
          <path d="M19.5 14.6A8 8 0 0 1 9.4 4.5a8 8 0 1 0 10.1 10.1Z" className="cp-theme-fill" />
          <path
            d="M17.5 3.5l.55 1.45 1.45.55-1.45.55-.55 1.45-.55-1.45-1.45-.55 1.45-.55Z"
            className="cp-theme-glint cp-theme-fill"
          />
        </svg>
      </span>
    </button>
  )
}
