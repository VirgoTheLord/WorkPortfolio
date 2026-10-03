import Link from 'next/link'
import { SiteMenu } from '@/components/motion/site-menu'
import { SiteBrand } from '@/components/layout/site-brand'
import { SiteNav } from '@/components/layout/site-nav'
import { site } from '@/content/site'

/*
 * Fixed, one header-height tall (--spacing-header). <main> clears it once, so
 * sections never compensate for it themselves.
 */
export function SiteHeader() {
  return (
    <header className="site-header fixed inset-x-0 top-0 z-40 bg-bg">
      <div className="mx-auto flex h-header w-full max-w-content items-center justify-between px-margin">
        <SiteBrand />
        <SiteMenu brand={<SiteBrand tone="onGreen" masked />}>
          <SiteNav />
        </SiteMenu>
      </div>
      {/* Without JavaScript the menu cannot open, so the destinations are listed
          plainly and the header returns to normal flow. */}
      <noscript>
        <style>{'.site-header{position:static}.site-menu-trigger{display:none}'}</style>
        <nav aria-label="Primary">
          <ul className="mx-auto flex max-w-content flex-wrap gap-x-6 gap-y-1 px-margin pb-3 font-label text-label uppercase">
            {site.nav.map((item) => (
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
  )
}
