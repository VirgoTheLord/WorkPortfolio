import { FooterScene } from '@/components/motion/footer-scene'
import { TextLink } from '@/components/ui/text-link'
import { contact, footer, hero, menu, site } from '@/content/site'
import './site-footer.css'

const items = [menu.home, ...site.nav]
// The initials, as the navbar's wordmark sets them.
const initials = site.name
  .split(' ')
  .map((word) => word.charAt(0))
  .join('')

/*
 * The footer, recreated from neuemontreal.com's: a solid field (here the brand
 * field, black on orange, a single surface) in the ordinary flow, with a mark at
 * the left, four columns each headed by a line of text over a hairline with its
 * links beside a vertical hairline, a hairline across, the name set as wide as
 * the frame along the bottom edge, a hairline, and the credits. Four columns of
 * what the project really holds: the destinations, the stack, the two typefaces,
 * and the way to write (the address is only in the link, never printed). The
 * reference's mark is a ring of its own letters; this one is the initials. Without
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
              className="footer-badge font-display text-3xl font-semibold"
            >
              {initials}
            </p>

            <div className="footer-columns text-base">
              <nav aria-label={footer.navLabel} data-footer-column className="footer-column">
                <h2 className="footer-heading">{footer.navigationLabel}</h2>
                <ul className="footer-links">
                  {items.map((item) => (
                    <li key={item.href}>
                      <TextLink href={item.href}>{item.label}</TextLink>
                    </li>
                  ))}
                </ul>
              </nav>

              <div data-footer-column className="footer-column">
                <h2 className="footer-heading">{hero.stack.label}</h2>
                <ul className="footer-links">
                  {hero.stack.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div data-footer-column className="footer-column">
                <h2 className="footer-heading">{footer.typefacesLabel}</h2>
                <ul className="footer-links">
                  {footer.typefaces.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div data-footer-column className="footer-column">
                <h2 className="footer-heading">{footer.contactLabel}</h2>
                <ul className="footer-links">
                  <li>
                    <TextLink href={`mailto:${contact.email}`}>{menu.action.label}</TextLink>
                  </li>
                  <li>
                    <TextLink href="#main">{footer.toTop}</TextLink>
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
                  {site.role}
                </span>
              </p>
            </div>
          </div>
        </div>
      </FooterScene>
    </footer>
  )
}
