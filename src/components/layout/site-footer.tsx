import Link from 'next/link'
import { footer, site } from '@/content/site'

/* The same hover and focus treatment as the header's brand link: colour and an
   underline arrive together, quickly in and slowly out. */
const link =
  'inline-flex min-h-11 items-center underline decoration-transparent underline-offset-4 transition-colors duration-base ease-out hover:text-accent hover:decoration-accent hover:duration-fast focus-visible:text-accent focus-visible:decoration-accent focus-visible:duration-fast active:translate-y-px active:duration-instant md:min-h-0 md:py-1'

/*
 * The closing element: a strong hairline like each section's, the name, the
 * existing destinations, and one line of small print. Compact on purpose; it
 * should read as the foot of the page, not another page. Static and calm: no
 * motion at all.
 */
export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-content px-margin pb-8 md:pb-10">
      <div aria-hidden="true" className="h-px bg-rule-strong" />

      <div className="grid grid-cols-4 gap-x-gutter gap-y-8 pt-8 md:grid-cols-12 md:pt-10">
        <div className="col-span-4 md:col-span-6">
          <p className="font-display text-2xl text-fg">{site.name}</p>
          <p className="mt-2 font-label text-label text-fg-subtle uppercase">{site.role}</p>
        </div>

        <nav
          aria-label={footer.navLabel}
          className="col-span-4 font-label text-label text-fg-muted uppercase md:col-span-3 md:col-start-7"
        >
          <ul className="grid grid-cols-2 gap-x-gutter md:block">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={link}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="col-span-4 font-label text-label text-fg-muted uppercase md:col-span-3 md:col-start-10">
          <a href="#main" className={link}>
            {footer.toTop}
          </a>
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-2 border-t border-rule pt-4 font-label text-label text-fg-subtle md:mt-10 md:flex-row md:items-baseline md:justify-between">
        <p className="tabular-nums">
          © {site.year} {site.name}
        </p>
        <p>{footer.typeNote}</p>
      </div>
    </footer>
  )
}
