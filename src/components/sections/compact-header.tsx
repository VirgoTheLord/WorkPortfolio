import Link from 'next/link'
import type { CSSProperties } from 'react'
import { SiteSearch } from '@/components/interactive/site-search'
import { TerminalHint } from '@/components/interactive/terminal-hint'
import { ThemeToggle } from '@/components/interactive/theme-toggle'
import { compact } from '@/content/compact'
import { site } from '@/content/site'

/*
 * The compact site's bar, on every compact page: at the top of the page, not
 * pinned (it scrolls away; the side rail is the menu), its contents lined up
 * with the column below. The AW mark is the link back to the full site. It is a
 * rubber stamp: it thumps down once on arrival, and on hover or focus its
 * letters hop one after the other while the accent print slips out from under
 * them and the way back types itself beside it as a command, `cd ../full-site`
 * (interactive/terminal-hint.tsx), without moving anything in the bar; a press
 * squashes it (compact.css). Then the search field and
 * the light/dark switch.
 */
export function CompactHeader() {
  return (
    <header className="cp-bar">
      <div className="cp-bar-inner">
        <Link href="/" className="cp-logo">
          <span className="sr-only">{`${site.name}, ${compact.back.label.toLowerCase()}`}</span>
          <span aria-hidden="true" className="cp-logo-ink font-mark">
            {[...site.mark].map((letter, index) => (
              <span
                key={letter}
                data-letter={letter}
                className="cp-logo-letter"
                style={{ '--i': index } as CSSProperties}
              >
                {letter}
              </span>
            ))}
          </span>
          <TerminalHint {...compact.terminal} />
        </Link>
        <div className="cp-bar-end">
          <SiteSearch {...compact.search} />
          <ThemeToggle {...compact.theme} />
        </div>
      </div>
    </header>
  )
}
