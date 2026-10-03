import Link from 'next/link'
import { site } from '@/content/site'

/*
 * The destinations, set large on the green surface. Server-rendered and passed
 * to the menu island as children. The data-menu-* attributes are the hooks the
 * island's GSAP timeline animates; every reveal sits in an overflow mask so
 * text rises into place from a clean edge.
 */
export function SiteNav() {
  const last = site.nav.length - 1

  return (
    <>
      <nav aria-label="Primary" className="flex flex-1 flex-col justify-end py-8 md:justify-center">
        <ol className="menu-list">
          {site.nav.map((item, i) => (
            <li key={item.href} data-menu-row className="relative">
              <span
                aria-hidden="true"
                data-menu-rule
                className="absolute inset-x-0 top-0 h-px origin-left bg-accent-fg/25"
              />
              {i === last ? (
                <span
                  aria-hidden="true"
                  data-menu-rule
                  className="absolute inset-x-0 bottom-0 h-px origin-left bg-accent-fg/25"
                />
              ) : null}
              <Link
                href={item.href}
                className="menu-link group relative grid grid-cols-4 items-baseline gap-x-gutter py-4 md:grid-cols-12 md:py-5"
              >
                <span className="col-span-1 block overflow-hidden md:col-span-2">
                  <span
                    data-menu-reveal
                    className="block font-label text-label font-medium text-accent-fg/75 tabular-nums"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </span>
                <span className="menu-label col-span-3 block overflow-hidden duration-base ease-out group-hover:translate-x-2 group-hover:duration-fast group-focus-visible:translate-x-2 group-focus-visible:duration-fast group-active:translate-x-0.5 group-active:duration-instant md:col-span-9">
                  <span data-menu-reveal className="block font-display text-display text-accent-fg">
                    {item.label}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="hidden self-center overflow-hidden transition-transform duration-base ease-out group-hover:translate-x-1 group-hover:duration-fast group-focus-visible:translate-x-1 group-focus-visible:duration-fast md:col-span-1 md:block md:justify-self-end"
                >
                  <svg
                    data-menu-reveal
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="block size-6 text-accent-fg/75"
                  >
                    <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" />
                  </svg>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      <div className="grid grid-cols-4 gap-x-gutter font-label text-label text-accent-fg/75 uppercase md:grid-cols-12">
        <p className="col-span-2 overflow-hidden md:col-span-4">
          <span data-menu-meta className="block">
            {site.role}
          </span>
        </p>
        <p className="col-span-2 overflow-hidden text-right tabular-nums md:col-span-2 md:col-start-11">
          <span data-menu-meta className="block">
            {site.year}
          </span>
        </p>
      </div>
    </>
  )
}
