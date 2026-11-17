import { FooterInk } from '@/components/motion/footer-ink'
import { FooterScene } from '@/components/motion/footer-scene'
import { DiagonalLink } from '@/components/library/cairn/diagonal-link'
import { legal } from '@/content/legal'
import { projects } from '@/content/projects'
import { compactNotice, contact, footer, menu, site } from '@/content/site'
import './site-footer.css'

/* The destinations, then the compact site, so it is always one click away. */
const items = [menu.home, ...site.nav, compactNotice.link]

/*
 * The footer, recreated from neuemontreal.com's: a solid field (here the brand
 * field, black on red, a single surface) in the ordinary flow, with a mark at
 * the left, four columns each headed by a line of text over a hairline with its
 * links beside a vertical hairline, a hairline across, the name set as wide as
 * the frame along the bottom edge, a hairline, and the credits. Four columns, as
 * working portfolios set them (owner's call, November 2026): the destinations,
 * the work (live sites), the ways to get in touch (the address is only in the
 * link, never printed), and what the owner does now and where. Every link is
 * Cairn's diagonal link; the arrows roll with the words (↗ leaves the site, ↑
 * goes back up) and stay out of the names (aria-label). The
 * reference's mark is a ring of its own letters; this one is the logo ("AW"). Without
 * script, or with reduced motion, it is all simply there; FooterScene
 * (motion/footer-scene.tsx) adds the scroll-linked motion over the data-footer-*
 * hooks.
 */
export function SiteFooter() {
  return (
    <footer data-theme="brand" className="footer bg-bg text-fg">
      <FooterScene>
        <div className="footer-frame">
          <div className="footer-top">
            <p
              data-footer-badge
              aria-hidden="true"
              className="footer-badge font-mark text-2xl font-normal"
            >
              {site.mark}
            </p>

            <div className="footer-columns text-base">
              <nav aria-label={footer.navLabel} data-footer-column className="footer-column">
                <h2 className="footer-heading">{footer.navigationLabel}</h2>
                <ul className="footer-links">
                  {items.map((item) => (
                    <li key={item.href}>
                      <DiagonalLink href={item.href} label={item.label} className="footer-diagonal" />
                    </li>
                  ))}
                </ul>
              </nav>

              <div data-footer-column className="footer-column">
                <h2 className="footer-heading">{footer.workLabel}</h2>
                <ul className="footer-links">
                  {projects.map(({ slug, href, title }) =>
                    href ? (
                      <li key={slug}>
                        {/* External: marked with an arrow, its own tab is the visitor's choice. */}
                        <DiagonalLink
                          href={href}
                          rel="noreferrer"
                          label={`${title} ↗`}
                          aria-label={title}
                          className="footer-diagonal footer-diagonal-out"
                        />
                      </li>
                    ) : null,
                  )}
                </ul>
              </div>

              <div data-footer-column className="footer-column">
                <h2 className="footer-heading">{footer.connectLabel}</h2>
                <ul className="footer-links">
                  <li>
                    <DiagonalLink
                      href={`mailto:${contact.email}`}
                      label={footer.email}
                      className="footer-diagonal"
                    />
                  </li>
                  {site.profiles.map((profile) => (
                    <li key={profile.href}>
                      <DiagonalLink
                        href={profile.href}
                        rel="noreferrer"
                        label={`${profile.label} ↗`}
                        aria-label={profile.label}
                        className="footer-diagonal footer-diagonal-out"
                      />
                    </li>
                  ))}
                </ul>
              </div>

              <div data-footer-column className="footer-column">
                <h2 className="footer-heading">{footer.nowLabel}</h2>
                <ul className="footer-links">
                  {footer.now.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                  {/* At the foot of the column, apart from the facts above it. */}
                  <li className="footer-to-top">
                    {/* The way up points up, apart from the arrows that leave the site. */}
                    <DiagonalLink
                      href="#main"
                      label={`${footer.toTop} ↑`}
                      aria-label={footer.toTop}
                      className="footer-diagonal footer-diagonal-up"
                    />
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            {/* The name, a letter at a time, each in its own mask. It is one label for
                assistive tech; the letters are for the eye. */}
            <p
              aria-label={site.name}
              data-footer-mark
              className="footer-mark font-display font-semibold"
            >
              {Array.from(site.name).map((char, i) =>
                char === ' ' ? (
                  <span key={i} aria-hidden="true" className="footer-space">
                    {' '}
                  </span>
                ) : (
                  <span key={i} aria-hidden="true" className="footer-letter-mask">
                    <span data-footer-letter className="footer-letter">
                      {char}
                    </span>
                  </span>
                ),
              )}
            </p>
            <span aria-hidden="true" data-footer-rule className="footer-rule" />
            <div className="footer-credits text-base">
              <p className="footer-credit-mask tabular-nums">
                <span data-footer-credit className="footer-credit">
                  © {site.year} {site.name}
                </span>
              </p>
              <p className="footer-credit-mask">
                <span data-footer-credit className="footer-credit">
                  <DiagonalLink
                    href={legal.footerLink.href}
                    label={legal.footerLink.label}
                    className="footer-diagonal"
                  />
                </span>
              </p>
              <p className="footer-credit-mask">
                <span data-footer-credit className="footer-credit">
                  {site.role}
                </span>
              </p>
            </div>
          </div>
        </div>
      </FooterScene>
      <FooterInk />
    </footer>
  )
}
