import Link from 'next/link'
import { WorkTogetherButton } from '@/components/interactive/work-together-button'
import { SiteMenu } from '@/components/motion/site-menu'
import { SiteBrand } from '@/components/layout/site-brand'
import { SiteNav } from '@/components/layout/site-nav'
import { menu, site } from '@/content/site'

/*
 * The navbar: fixed, one header-height tall while closed (--spacing-header), and
 * unfolding into the expanded panel below its bar when opened. <main> clears the
 * closed height once, so sections never compensate for it themselves. The
 * header carries data-hero-nav so the home page intro reveals it with the hero.
 */
export function SiteHeader() {
  return (
    <>
      {/* The top 50px of the document: once it has scrolled away the bar turns
          into a card (site-menu.tsx). */}
      <span
        aria-hidden="true"
        data-menu-sentinel
        className="pointer-events-none absolute inset-x-0 top-0 h-12.5"
      />
      <header data-hero-nav className="site-header pointer-events-none fixed inset-x-0 top-0 z-40">
        <SiteMenu
          brand={<SiteBrand />}
          action={
            <WorkTogetherButton label={menu.action.label} href={menu.action.href} tone="ink" />
          }
        >
          <SiteNav />
        </SiteMenu>
        {/* Without JavaScript the menu cannot open, so the destinations are listed
          plainly and the header returns to normal flow. */}
        <noscript>
          <style>{'.site-header{position:static}.menu-trigger{display:none}'}</style>
          <nav aria-label="Primary" className="pointer-events-auto">
            <ul className="mx-auto flex max-w-content flex-wrap gap-x-6 gap-y-1 px-margin pb-3 font-label text-label uppercase">
              {[menu.home, ...site.nav].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-block py-2 text-fg underline underline-offset-4"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </noscript>
      </header>
    </>
  )
}
