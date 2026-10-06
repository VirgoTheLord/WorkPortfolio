import Image from 'next/image'
import Link from 'next/link'
import { TextLink } from '@/components/ui/text-link'
import { ThemeToggle } from '@/components/interactive/theme-toggle'
import { ScrambleText } from '@/components/layout/scramble-text'
import { projects } from '@/content/projects'
import { contact, menu, site } from '@/content/site'

const items = [menu.home, ...site.nav]
const cards = projects.slice(0, 2)

/*
 * The expanded navbar's contents, server-rendered and handed to the menu island
 * as children. Three columns from lg up, on the reference's spans (4, 2 and 5 of 12):
 * the destinations, the details, and two project cards; stacked destinations
 * then details below that. The data-menu-*
 * attributes are the hooks the island's GSAP timeline and marker use. Every
 * reveal sits in a mask (.menu-mask) so text rises from a clean edge, and the
 * mask is always inside the link so its focus ring is never clipped.
 */
export function SiteNav() {
  return (
    <div className="grid grid-cols-1 gap-y-8 lg:grid-cols-12 lg:gap-x-gutter">
      <nav aria-label="Primary" data-menu-nav className="relative lg:col-span-4">
        {/* One square that follows the current row: the active destination, or
            whichever row is hovered or focused. */}
        <span aria-hidden="true" data-menu-marker className="menu-marker">
          <span className="menu-marker-square bg-accent" />
        </span>
        <ol>
          {items.map((item) => (
            <li key={item.href} data-menu-item>
              <Link
                href={item.href}
                className="menu-link block w-fit py-1 font-display text-2xl whitespace-nowrap text-ink transition-colors duration-base ease-out md:text-3xl lg:text-2xl xl:text-3xl"
              >
                <span className="menu-mask block">
                  <span data-menu-reveal className="block">
                    {item.label}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      <div className="flex flex-col gap-6 lg:col-span-2 lg:col-start-6">
        <div className="flex flex-col gap-1">
          <p className="menu-mask font-label text-label text-ink uppercase">
            <span data-menu-line className="block">
              {menu.contactLabel}
            </span>
          </p>
          <TextLink
            href={`mailto:${contact.email}`}
            className="w-fit text-sm break-words text-ink xl:text-base"
          >
            <span className="menu-mask block">
              <span data-menu-line className="block">
                {contact.email}
              </span>
            </span>
          </TextLink>
        </div>

        <div className="flex flex-col gap-1">
          <p className="menu-mask font-label text-label text-ink uppercase">
            <span data-menu-line className="block">
              {menu.focusLabel}
            </span>
          </p>
          <p className="menu-mask text-sm text-ink xl:text-base">
            <span data-menu-line className="block">
              {menu.focus}
            </span>
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <p className="menu-mask font-label text-label text-ink uppercase">
            <span data-menu-line className="block">
              {menu.themeLabel}
            </span>
          </p>
          <div data-menu-fade className="w-fit">
            <ThemeToggle />
          </div>
        </div>

        <ul className="mt-auto flex flex-col gap-2 font-label text-label text-ink uppercase">
          {menu.status.map((line) => (
            <li key={line} className="flex items-start gap-2">
              <span aria-hidden="true" data-menu-fade className="mt-1 shrink-0">
                <span className="menu-dot block size-2 bg-accent" />
              </span>
              <ScrambleText text={line} />
            </li>
          ))}
        </ul>
      </div>

      <ul
        aria-label={menu.projectsLabel}
        className="hidden gap-4 lg:col-span-5 lg:col-start-8 lg:flex"
      >
        {cards.map((project) => (
          <li key={project.slug} data-menu-card className="flex min-w-0 flex-1">
            <Link
              href={`/#work-${project.slug}`}
              className="menu-card group flex w-full flex-col gap-2 text-ink"
            >
              <span className="relative block min-h-0 flex-1 overflow-hidden bg-surface">
                {/* The caption is the link's name; the cover is a teaser for it. */}
                <Image
                  src={project.cover.image}
                  alt=""
                  fill
                  sizes="(min-width: 64rem) 22vw, 0px"
                  className="object-cover object-left"
                />
              </span>
              <span className="block h-10 overflow-hidden font-label text-label uppercase">
                <ScrambleText text={project.title} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
