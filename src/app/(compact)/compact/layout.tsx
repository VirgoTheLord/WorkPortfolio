import type { Viewport } from 'next'
import { CompactFoot } from '@/components/layout/compact-foot'
import { CompactTop } from '@/components/layout/compact-top'
import '@/components/library/cairn/cairn-tokens.css'
import '@/components/sections/compact.css'

/* The browser's own chrome (the address bar on phones) in the page's colours:
   white, and the compact site's deep black (globals.css tokens). */
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

/*
 * The compact site's frame (DESIGN.md §5b), shared by /compact and the
 * workbench pages: one narrow column, the top line, the page, the foot. In the
 * (compact) route group, so none of the full site's frame (navbar, footer,
 * preloader, smooth scroll, pointer effects) loads here.
 */
export default function CompactLayout({ children }: LayoutProps<'/compact'>) {
  return (
    <div id="top" tabIndex={-1} className="cp">
      <div className="cp-col">
        <CompactTop />
        <main id="main" tabIndex={-1} className="cp-main">
          {children}
        </main>
        <CompactFoot />
      </div>
    </div>
  )
}
