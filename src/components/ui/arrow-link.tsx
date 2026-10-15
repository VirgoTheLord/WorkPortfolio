import Link from 'next/link'
import type { ComponentProps } from 'react'
import { isInPageHref } from '@/lib/in-page-href'
import './arrow-link.css'

/*
 * A small monospace link with a pixel-stepped arrow after it, from the
 * reference's own ("See all", "Learn more"): on hover or focus the arrow steps 4px to the right
 * (arrow-link.css). The Skills section and the Skills page use it for every link
 * that leads on. A real anchor: next/link to another route, a plain anchor for a
 * hash on the home page (lib/in-page-href.ts).
 */
export function ArrowLink({ children, className = '', ...props }: ComponentProps<typeof Link>) {
  const classes = `arrow-link font-label text-label uppercase ${className}`
  const content = (
    <>
      <span>{children}</span>
      <svg aria-hidden="true" viewBox="0 0 14 8" className="arrow-link-arrow">
        <path d="M0 3.5h12v1H0zM12 2.5h1v3h-1zM13 3.5h1v1h-1zM11 1.5h1v1h-1zM11 5.5h1v1h-1zM10 .5h1v1h-1zM10 6.5h1v1h-1z" />
      </svg>
    </>
  )
  const { href } = props
  return isInPageHref(href) ? (
    <a {...props} href={href} className={classes}>
      {content}
    </a>
  ) : (
    <Link {...props} className={classes}>
      {content}
    </Link>
  )
}
