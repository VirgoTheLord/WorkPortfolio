import Link from 'next/link'
import { site } from '@/content/site'

const [first = site.name] = site.name.split(' ')

/*
 * The logo: the mark ("AW", in Deutsch Gothic), which rolls up to the first name
 * in the same face while the menu is open (the roll is driven by the menu's open
 * state, see site-menu.css). The link's name is the full name, so the roll is
 * hidden from assistive tech.
 */
export function SiteBrand() {
  return (
    <Link
      href="/"
      aria-label={`${site.name}, home`}
      className="menu-brand-link inline-flex min-h-11 items-center font-mark text-xl font-normal text-ink transition-colors duration-base ease-out hover:text-accent hover:duration-fast focus-visible:text-accent focus-visible:duration-fast active:translate-y-px active:duration-instant"
    >
      <span aria-hidden="true" className="menu-roll menu-roll-brand">
        <span className="menu-roll-track">
          <span className="tracking-widest">{site.mark}</span>
          <span>{first}</span>
        </span>
      </span>
    </Link>
  )
}
