import type { CSSProperties } from 'react'
import type { Metadata } from 'next'
import { FrameButton } from '@/components/library/frame-button'
import { PlayingCard, SUITS } from '@/components/ui/playing-card'
import { TextLink } from '@/components/ui/text-link'
import { notFound } from '@/content/legal'
import '@/components/sections/not-found.css'

export const metadata: Metadata = {
  title: notFound.title,
  robots: { index: false },
}

/*
 * The not-found page (out/404.html in the static export). It sits outside both
 * route groups, so it has neither site's frame: one centred column with the
 * About hand's playing cards spelling 404 (the site's own motif, dealt into a
 * fan once on arrival; not-found.css), what happened, and the way home.
 */
export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="nf focus:outline-none">
      <div aria-hidden="true" className="nf-hand">
        {notFound.cards.map((card, i) => (
          // Its place in the fan: -1, 0, 1 from the middle.
          <span key={i} className="nf-slot" style={{ '--i': i - 1 } as CSSProperties}>
            <PlayingCard letter={card} suit={SUITS[i % SUITS.length]!} className="nf-card" />
          </span>
        ))}
      </div>
      <h1 className="nf-heading font-display">{notFound.heading}</h1>
      <p className="nf-body text-fg-muted">{notFound.body}</p>
      <div className="nf-actions">
        <FrameButton href={notFound.home.href} label={notFound.home.label} />
        <TextLink href={notFound.compact.href} className="font-label text-label uppercase">
          {notFound.compact.label}
        </TextLink>
      </div>
    </main>
  )
}
