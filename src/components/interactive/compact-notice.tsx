'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { CompactNoticeContent } from '@/types/content'
import './compact-notice.css'

/* How long after the hero has arrived the notice comes in (ms), and how far down
   the page it stays (px). */
const DELAY = 1000
const NEAR_TOP = 120
const STORE = 'compact-notice-dismissed'

/*
 * The notice at the top of the home page that offers the compact site
 * (compact-notice.css): a slim ink bar under the navbar, "Prefer it short?
 * Compact version →", and a dismiss button. It comes in a second after the hero
 * has arrived (once the intro's or a reload's entrance classes are gone from
 * <html>), never over the preloader or the wipe; it is there only near the top,
 * so it never sits over the content; and once dismissed it stays away in this
 * browser (localStorage, guarded: a private window simply shows it again). The
 * one deliberate exception to "no pop-ups" (DESIGN.md §5b): it answers the
 * owner's wish to offer the short version, and asks nothing of the visitor.
 */
export function CompactNotice({ text, link, dismiss, label }: CompactNoticeContent) {
  const [ready, setReady] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [nearTop, setNearTop] = useState(true)

  useEffect(() => {
    const root = document.documentElement
    let timer = 0
    const arrived = () =>
      !root.classList.contains('is-intro') && !root.classList.contains('is-enter')
    // Whether it was dismissed before is read when it would come in.
    const comeIn = () => {
      let stored = false
      try {
        stored = window.localStorage.getItem(STORE) === '1'
      } catch {
        // Storage blocked: it shows, and is dismissed for this page only.
      }
      setDismissed(stored)
      setReady(true)
    }
    const watch = new MutationObserver(() => {
      if (!arrived()) return
      watch.disconnect()
      timer = window.setTimeout(comeIn, DELAY)
    })
    if (arrived()) timer = window.setTimeout(comeIn, DELAY)
    else watch.observe(root, { attributes: true, attributeFilter: ['class'] })

    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        setNearTop(window.scrollY < NEAR_TOP)
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      watch.disconnect()
      window.clearTimeout(timer)
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const onDismiss = () => {
    setDismissed(true)
    try {
      window.localStorage.setItem(STORE, '1')
    } catch {
      // Storage blocked: dismissed for this page only.
    }
  }

  return (
    <aside
      aria-label={label}
      className="compact-notice font-label text-label uppercase"
      data-shown={(ready && !dismissed && nearTop) || undefined}
    >
      <span className="compact-notice-text">{text}</span>
      <Link href={link.href} className="compact-notice-link">
        {link.label} <span aria-hidden="true">→</span>
      </Link>
      <button type="button" onClick={onDismiss} className="compact-notice-close">
        <span className="sr-only">{dismiss}</span>
        <svg aria-hidden="true" viewBox="0 0 12 12" className="compact-notice-x">
          <path d="M2 2l8 8M10 2l-8 8" />
        </svg>
      </button>
    </aside>
  )
}
