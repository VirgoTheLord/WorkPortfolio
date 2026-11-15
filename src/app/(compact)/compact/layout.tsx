import type { Viewport } from 'next'
import { BlurReveal } from '@/components/interactive/blur-reveal'
import { SunsetScene } from '@/components/interactive/sunset-scene'
import { TopGlow } from '@/components/interactive/top-glow'
import { CompactFoot } from '@/components/layout/compact-foot'
import { CompactTop } from '@/components/layout/compact-top'
import { compact } from '@/content/compact'
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
 * workbench pages: a red glow from the top edge, one narrow column, the
 * sunset (home only), the top line, the page, the foot. In the
 * (compact) route group, so none of the full site's frame (navbar, footer,
 * preloader, smooth scroll, pointer effects) loads here.
 */
export default function CompactLayout({ children }: LayoutProps<'/compact'>) {
  return (
    <div id="top" tabIndex={-1} className="cp">
      <TopGlow />
      <div className="cp-col">
        <SunsetScene {...compact.intro.scene} />
        <CompactTop />
        <main id="main" tabIndex={-1} className="cp-main">
          {children}
        </main>
        <CompactFoot />
      </div>
      <BlurReveal />
    </div>
  )
}
