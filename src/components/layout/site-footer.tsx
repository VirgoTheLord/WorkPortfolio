import Link from 'next/link'
import { ScrambleText } from '@/components/layout/scramble-text'
import { FooterStage } from '@/components/motion/footer-stage'
import { TextLink } from '@/components/ui/text-link'
import { contact, footer, hero, menu, site } from '@/content/site'
import './site-footer.css'

const items = [menu.home, ...site.nav]
const colophon = [footer.typeNote, `${hero.stack.label} ${hero.stack.items.join(', ')}`]
const step = (i: number) => ({ '--i': i }) as React.CSSProperties

/*
 * The foot of the page, recreated from the reference's footer on a dark band and
 * a screen tall: three columns across the top (the colophon with pulsing dots,
 * the destinations centred, the address and the way back up), the small print
 * centred below them, and the name set huge across the bottom edge. As the
 * footer scrolls into view its contents rise into place (site-footer.css); the
 * watermark's letters then slide up one by one and the small lines rise from
 * masks (motion/footer-stage.tsx arms both). Without the island, or with reduced
 * motion, all of it is simply there. The destinations scramble on hover, as the
 * reference's do.
 */
export function SiteFooter() {
  return (
    <footer data-theme="dark" className="footer bg-bg text-fg">
      <FooterStage>
        <div className="footer-frame">
          <div className="footer-top">
            <ul className="footer-colophon font-label text-label text-fg-muted uppercase">
              {colophon.map((line, i) => (
                <li key={line} className="footer-mask">
                  <span className="footer-rise footer-line" style={step(i)}>
                    <span aria-hidden="true" className="footer-dot bg-accent" />
                    <span>{line}</span>
                  </span>
                </li>
              ))}
            </ul>

            <nav aria-label={footer.navLabel} className="footer-nav">
              <ul>
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      data-scramble-link
                      className="footer-link font-label text-label text-fg-muted uppercase"
                    >
                      <ScrambleText text={item.label} />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="footer-contact text-base text-fg-muted">
              <div className="footer-mask w-fit">
                <div className="footer-rise" style={step(0)}>
                  <TextLink href={`mailto:${contact.email}`}>{contact.email}</TextLink>
                </div>
              </div>
              <div className="footer-mask w-fit">
                <div className="footer-rise" style={step(1)}>
                  <TextLink href="#main">{footer.toTop}</TextLink>
                </div>
              </div>
            </div>
          </div>

          <p className="footer-legal text-base text-fg-muted">
            <span className="footer-mask block">
              <span className="footer-rise block tabular-nums" style={step(0)}>
                © {site.year}
              </span>
            </span>
            <span className="footer-mask block">
              <span className="footer-rise block" style={step(1)}>
                {site.name}
              </span>
            </span>
            <span className="footer-mask block">
              <span className="footer-rise block" style={step(2)}>
                {site.role}
              </span>
            </span>
          </p>

          {/* The name, huge and faint: decorative (it is the first thing in the page's
              title and the sign-off above), so hidden from assistive tech. */}
          <div aria-hidden="true" className="footer-mark-box">
            <p className="footer-mark font-display">
              {Array.from(site.name).map((char, i) => (
                <span key={i} className="footer-letter" style={{ '--i': i } as React.CSSProperties}>
                  {char === ' ' ? ' ' : char}
                </span>
              ))}
            </p>
          </div>
        </div>
      </FooterStage>
    </footer>
  )
}
