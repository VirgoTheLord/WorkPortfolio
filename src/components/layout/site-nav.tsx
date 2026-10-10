import Link from 'next/link'
import { menu, site } from '@/content/site'

const items = [menu.home, ...site.nav]

/*
 * The full-screen menu's destinations, server-rendered and handed to the menu
 * island as children: one centred run of display type from lg up (a stacked,
 * centred list below, the index above its word under md), the weights
 * alternating heavy and light. Each has its
 * index at the top-left corner of its capitals and a hairline slash after it.
 *
 * Each word is set twice. The real text stays in the flow, sizing the line and
 * naming the link; over it sits a decorative copy split into letters, which the
 * island unfolds out of the first letter. The island places each letter where
 * the browser set it in the real word, so the kerning is the font's own. Until
 * the island has split a word (and without JavaScript) the real text shows.
 * The data-menu-* attributes are the island's hooks; every reveal sits in a
 * mask inside the link, so its focus ring is never clipped.
 */
export function SiteNav() {
  return (
    <nav aria-label="Primary" className="flex min-h-full flex-col justify-center">
      <ol className="menu-list flex flex-col items-center lg:flex-row lg:flex-wrap lg:justify-center">
        {items.map((item, index) => (
          <li
            key={item.href}
            data-menu-item
            className="menu-item flex items-start font-display md:text-display lg:text-display-xl"
          >
            <Link
              href={item.href}
              className={`menu-link flex flex-col items-start gap-1 text-ink md:flex-row md:gap-3 ${index % 2 === 0 ? 'font-semibold' : 'font-normal'}`}
            >
              <span className="menu-mask shrink-0">
                <span
                  aria-hidden="true"
                  data-menu-index
                  className="menu-index flex items-center gap-1.5 font-label text-label font-medium"
                >
                  {String(index + 1).padStart(2, '0')}
                  <span className="menu-current block size-2 bg-accent" />
                </span>
              </span>
              <span className="menu-mask whitespace-nowrap">
                <span data-menu-word className="relative block">
                  <span data-menu-text className="menu-text block">
                    {item.label}
                  </span>
                  <span aria-hidden="true" className="menu-chars">
                    {Array.from(item.label, (char, i) => (
                      <span key={i} data-menu-char>
                        {char}
                      </span>
                    ))}
                  </span>
                </span>
              </span>
            </Link>
            <span
              aria-hidden="true"
              data-menu-slash
              className="menu-slash hidden text-fg-muted lg:block"
            >
              <svg viewBox="0 0 55 201" preserveAspectRatio="none" className="block size-full">
                <path
                  d="M0.5 200.5L54.5 0.5"
                  stroke="currentColor"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                  fill="none"
                />
              </svg>
            </span>
          </li>
        ))}
      </ol>
    </nav>
  )
}
