import Link from 'next/link'
import { site } from '@/content/site'

const tone = {
  ink: 'text-fg hover:text-accent focus-visible:text-accent hover:decoration-accent focus-visible:decoration-accent',
  onGreen:
    'text-accent-fg hover:decoration-accent-fg focus-visible:decoration-accent-fg focus-visible:outline-accent-fg',
} as const

/*
 * The wordmark. `masked` wraps the text for the menu's reveal; the header
 * instance stays plain. The mask lives inside the link so its focus ring is
 * never clipped.
 */
export function SiteBrand({
  tone: toneName = 'ink',
  masked = false,
}: {
  tone?: keyof typeof tone
  masked?: boolean
}) {
  return (
    <Link
      href="/"
      aria-label={`${site.name}, home`}
      className={`inline-flex h-11 items-center font-label text-label font-medium uppercase underline decoration-transparent underline-offset-4 transition-colors duration-base ease-out hover:duration-fast focus-visible:duration-fast active:translate-y-px active:duration-instant ${tone[toneName]}`}
    >
      {masked ? (
        <span className="block overflow-hidden">
          <span data-menu-bar className="block">
            {site.name}
          </span>
        </span>
      ) : (
        site.name
      )}
    </Link>
  )
}
