import Link from 'next/link'
import { FlapText } from '@/components/ui/flap-text'
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
        <Link href={footer.back.href} className="cp-flap-link">
          <FlapText>{footer.back.label}</FlapText>
        </Link>
        <Link href={legal.footerLink.href} className="cp-flap-link">
          <FlapText>{legal.footerLink.label}</FlapText>
        </Link>
        <a href="#top" className="cp-flap-link">
          <FlapText>{footer.top}</FlapText>
        </a>
      </nav>
    </footer>
  )
}
