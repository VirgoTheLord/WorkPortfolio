import type { Metadata } from 'next'
import Link from 'next/link'
import { CompactIntro } from '@/components/sections/compact-intro'
import { CompactShelf } from '@/components/sections/compact-shelf'
import { CompactWork } from '@/components/sections/compact-work'
import { compact } from '@/content/compact'
import { site } from '@/content/site'
import '@/components/sections/compact.css'

export const metadata: Metadata = {
  title: compact.meta.title,
  description: compact.meta.description,
}

/*
 * The compact site: a workbench rather than an exhibition (DESIGN.md §5b). No
 * navbar, footer, preloader, smooth scroll or pointer effects: it is in the
 * (compact) route group, outside the full site's frame.
 */
export default function CompactPage() {
  return (
    <div className="compact">
      <header className="compact-bar">
        <Link
          href="/"
          aria-label={`${site.name}, full site`}
          className="inline-flex min-h-11 items-center font-mark text-xl tracking-widest text-fg transition-colors duration-base ease-out hover:text-accent hover:duration-fast focus-visible:text-accent"
        >
          {site.mark}
        </Link>
        <Link
          href={compact.back.href}
          className="inline-flex min-h-11 items-center gap-1 font-label text-label text-fg-muted uppercase transition-colors duration-base ease-out hover:text-fg hover:duration-fast focus-visible:text-fg"
        >
          {compact.back.label} <span aria-hidden="true">↗</span>
        </Link>
      </header>
      <main id="main" tabIndex={-1} className="compact-col focus:outline-none">
        <CompactIntro />
        <CompactWork />
        <CompactShelf />
      </main>
    </div>
  )
}
