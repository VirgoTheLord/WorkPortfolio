import type { ComponentProps } from 'react'
import type Link from 'next/link'

/*
 * Whether a link stays on this page (a hash, or the home page's hash from the home
 * page's own links) or leaves the site's router entirely (mailto:). Those render a
 * plain anchor: the browser scrolls to a fragment on every click, even when the
 * address already ends in it, where next/link sees the same URL and does nothing,
 * so "Let's Talk" stopped working once you had used it and scrolled back up.
 */
export function isInPageHref(href: ComponentProps<typeof Link>['href']): href is string {
  return typeof href === 'string' && /^(#|\/#|mailto:)/.test(href)
}
