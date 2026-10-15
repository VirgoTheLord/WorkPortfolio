import Link from 'next/link'
import type { ComponentProps } from 'react'
import { isInPageHref } from '@/lib/in-page-href'
import './key-link.css'

type KeyLinkProps = Omit<ComponentProps<typeof Link>, 'children' | 'className'> & {
  label: string
  /** `compact` for small type and tight spaces (the footer's columns): a smaller key, still a 44px target. */
  size?: keyof typeof sizes
  className?: string
}

const sizes = { default: '', compact: 'key-compact' } as const

/*
 * The site's call to action: a key, recreated from the tag buttons on
 * indevelopment.studio ("Creative development", "Design"). A face with a heavy
 * outline sits on a solid block that runs down and to the left at 45°, so it reads
 * as a key seen from above; it lifts off the block when hovered and presses into
 * it when pressed (key-link.css). It is a real link (a plain anchor in the page, next/link
 * to another route; lib/in-page-href.ts), so hash links and mailto: work as anywhere, without JavaScript, and the label is its accessible
 * name. Used for the contact section's and the footer's calls to action (the
 * site's main CTAs use the frame button, frame-button.tsx); only the label,
 * destination and (in small type) the size change.
 */
export function KeyLink({ label, size = 'default', className = '', ...props }: KeyLinkProps) {
  const classes = `key ${sizes[size]} ${className}`
  const face = <span className="key-face font-display font-medium">{label}</span>
  const { href } = props
  return isInPageHref(href) ? (
    <a {...props} href={href} className={classes}>
      {face}
    </a>
  ) : (
    <Link {...props} className={classes}>
      {face}
    </Link>
  )
}
