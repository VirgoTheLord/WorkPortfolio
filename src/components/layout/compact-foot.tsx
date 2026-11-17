import { BackToTop } from '@/components/interactive/back-to-top'
import { DominoRow } from '@/components/interactive/domino-row'
import { DiagonalLink } from '@/components/library/cairn/diagonal-link'
import { compact } from '@/content/compact'
import { legal } from '@/content/legal'
import { site } from '@/content/site'

const { footer } = compact

/*
 * The foot, read as two sides under a rule: on the left who made it, the name
 * in a quick pen hand (Kristi) and where it was made; on the right where to go
 * next, one link to a line: the full site, the terms, back to the top. Under
 * them, standing on the page's bottom edge, a row of dominoes to push over.
 */
export function CompactFoot() {
  return (
    <footer className="cp-foot">
      <div className="cp-foot-sign">
        <p className="cp-sign">{site.name}</p>
        <p className="cp-meta">{footer.made}</p>
      </div>
      <nav aria-label={footer.label} className="cp-foot-nav">
        {/* All three roll on Cairn's diagonal link. */}
        <DiagonalLink
          href={footer.back.href}
          label={footer.back.label}
          className="cp-foot-link cp-foot-diagonal"
        />
        <DiagonalLink
          href={legal.footerLink.href}
          label={legal.footerLink.label}
          className="cp-foot-link cp-foot-diagonal"
        />
        <BackToTop label={footer.top} className="cp-foot-link cp-foot-diagonal" />
      </nav>
      <DominoRow hint={footer.push} />
    </footer>
  )
}
