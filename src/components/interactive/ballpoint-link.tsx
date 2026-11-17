'use client'

import { useRouter } from 'next/navigation'
import type { MouseEvent } from 'react'
import { BallpointButton } from '@/components/library/cairn/ballpoint-button'

type Props = {
  label: string
  href: string
}

/*
 * Cairn's ballpoint button as the compact site's small chips: drawn still (no
 * intro), set small (compact.css, .cp-ink) in the chips' old places. Hover and
 * press keep the button's own feedback. It renders a plain <a>, so a link
 * inside the site is routed on the client here, as next/link would, rather
 * than reloading the page; outside links open in a new tab. A modified click
 * (new tab, new window) is left to the browser.
 */
export function BallpointLink({ label, href }: Props) {
  const router = useRouter()
  const external = /^(https?:|mailto:)/.test(href)

  const go = (event: MouseEvent<HTMLAnchorElement>) => {
    if (external || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    router.push(href)
  }

  return (
    <BallpointButton
      label={label}
      href={href}
      intro={false}
      onClick={go}
      className="cp-ink"
      {...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
    />
  )
}
