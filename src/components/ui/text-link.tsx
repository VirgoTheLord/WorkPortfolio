import Link from 'next/link'
import type { ComponentProps } from 'react'
import './text-link.css'

/*
 * The site's text link, from the reference's own link: a line under the text that
 * runs out to the right on hover and focus while a new one runs in from the left
 * behind it, and the reverse on leaving (text-link.css). One motif for every
 * inline link that is not a navigation row or a button. A real anchor
 * (next/link), so mailto: and hash links work as they do anywhere.
 */
export function TextLink({ children, className = '', ...props }: ComponentProps<typeof Link>) {
  return (
    <Link {...props} className={`text-link ${className}`}>
      {children}
      <span aria-hidden="true" className="text-link-rule">
        <span />
        <span />
      </span>
    </Link>
  )
}
