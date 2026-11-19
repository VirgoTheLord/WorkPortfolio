import { BlurReveal } from '@/components/interactive/blur-reveal'
import { TopGlow } from '@/components/interactive/top-glow'
import { CompactFoot } from '@/components/layout/compact-foot'
import { CompactTop } from '@/components/layout/compact-top'
import '@/components/library/cairn/cairn-tokens.css'
import '@/components/sections/compact.css'

/* No theme colour, as on the full site: X's in-app browser answers one with a
   solid bar above the page in that colour, which read as a blank band at the
   top of the compact site (owner's report, November 2026). */
/*
 * The compact site's frame (DESIGN.md §5b), shared by /compact and the
 * workbench pages: a red glow from the top edge, one narrow column, the top
 * line, the page, the foot. In the
 * (compact) route group, so none of the full site's frame (navbar, footer,
 * preloader, smooth scroll, pointer effects) loads here.
 */
export default function CompactLayout({ children }: LayoutProps<'/compact'>) {
  return (
    <div id="top" tabIndex={-1} className="cp">
      <TopGlow />
      <div className="cp-col">
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
