import Link from 'next/link'
import { compact } from '@/content/compact'
import { legal } from '@/content/legal'
import { site } from '@/content/site'

const { footer } = compact

/*
 * The foot, read as two sides under a rule: on the left who made it, the name
 * in a quick pen hand (Kristi) and where it was made; on the right where to go
 * next, one link to a line: the full site, the terms, back to the top.
 */
export function CompactFoot() {
  return (
    <footer className="cp-foot">
      <div className="cp-foot-sign">
        <p className="cp-sign">{site.name}</p>
        <p className="cp-meta">{footer.made}</p>
      </div>
      <nav aria-label={footer.label} className="cp-foot-nav">
        <Link href={footer.back.href} className="cp-link">
          {footer.back.label}
        </Link>
        <Link href={legal.footerLink.href} className="cp-link">
          {legal.footerLink.label}
        </Link>
        <a href="#top" className="cp-link">
          {footer.top}
        </a>
      </nav>
    </footer>
  )
}
