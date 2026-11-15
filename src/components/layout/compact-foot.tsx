import Link from 'next/link'
import { compact } from '@/content/compact'
import { legal } from '@/content/legal'
import { site } from '@/content/site'

/* The foot: the name in a quick pen hand (Kristi), where it was made, and the ways out. */
export function CompactFoot() {
  return (
    <footer className="cp-foot">
      <p className="cp-sign">{site.name}</p>
      <p className="cp-meta">{compact.footer.made}</p>
      <p className="cp-meta cp-foot-links">
        <Link href={compact.footer.back.href} className="cp-link">
          {compact.footer.back.label}
        </Link>
        <Link href={legal.footerLink.href} className="cp-link">
          {legal.footerLink.label}
        </Link>
      </p>
    </footer>
  )
}
