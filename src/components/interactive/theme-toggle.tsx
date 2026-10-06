'use client'

import { useEffect, useId, useState } from 'react'
import { menu } from '@/content/site'
import { centreOf, currentTheme, toggleTheme } from '@/lib/page-modes'
import './theme-toggle.css'

/*
 * The colour-mode switch. What it looks like comes from CSS alone, off the mode
 * on <html> (theme-toggle.css), so it is right on the first paint with no flash.
 * The knob is a sun that rolls across the track and is eclipsed into a moon as
 * it goes; pressing it grows the new mode over the page from the knob.
 */
export function ThemeToggle() {
  const mask = useId()
  const [dark, setDark] = useState(false)

  // aria-pressed needs the real mode; read it once mounted and after every change.
  useEffect(() => {
    const sync = () => setDark(currentTheme() === 'dark')
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    return () => observer.disconnect()
  }, [])

  return (
    <button
      type="button"
      aria-label={menu.themeLabel}
      aria-pressed={dark}
      onClick={(event) =>
        toggleTheme(centreOf(event.currentTarget.querySelector('svg') ?? event.currentTarget))
      }
      className="theme-toggle group inline-flex min-h-11 items-center gap-3 font-label text-label text-ink uppercase"
    >
      <span aria-hidden="true" className="theme-track">
        <span className="theme-knob">
          <svg viewBox="0 0 24 24" className="size-full">
            <mask id={mask}>
              <rect width="24" height="24" fill="white" />
              <circle className="theme-bite" cx="18" cy="7" r="6.5" fill="black" />
            </mask>
            <circle cx="12" cy="12" r="6" fill="currentColor" mask={`url(#${mask})`} />
            <g className="theme-rays" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1" />
            </g>
          </svg>
        </span>
      </span>
      <span aria-hidden="true" className="theme-word">
        <span className="theme-word-light">{menu.themeLight}</span>
        <span className="theme-word-dark">{menu.themeDark}</span>
      </span>
    </button>
  )
}
