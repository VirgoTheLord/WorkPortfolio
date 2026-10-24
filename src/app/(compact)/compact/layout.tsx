import { Bunny } from '@/components/interactive/bunny'
import { CompactFooter } from '@/components/sections/compact-footer'
import { CompactHeader } from '@/components/sections/compact-header'
import { compact } from '@/content/compact'
import type { Viewport } from 'next'
import '@/components/sections/compact.css'

/* The browser's own chrome (the address bar on phones) in the page's colours:
   the off-white, and the compact site's deep black (globals.css tokens). */
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#eeeeee' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

/*
 * The compact site's frame (DESIGN.md §5b), shared by /compact and the
 * workbench pages: the bar across the top, then one column of content (from
 * 80rem anchored left, beside the section rail, with the free space on the
 * right for the work's preview and the bunny), and the footer under it. In the
 * (compact) route group, so none of the full site's frame (navbar, footer,
 * preloader, smooth scroll, pointer effects) loads here.
 */
export default function CompactLayout({ children }: LayoutProps<'/compact'>) {
  return (
    <div id="top" tabIndex={-1} className="cp">
      <CompactHeader />
      <div className="cp-sheet">
        <main id="main" tabIndex={-1} className="cp-main">
          {children}
        </main>
        <CompactFooter />
      </div>
      <Bunny label={compact.ui.bunny} />
    </div>
  )
}
