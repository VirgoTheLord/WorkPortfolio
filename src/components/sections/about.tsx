import type { CSSProperties } from 'react'
import { AboutCards } from '@/components/motion/about-cards'
import { ScrambleText } from '@/components/layout/scramble-text'
import { about } from '@/content/site'
import './about.css'

const index = (i: number) => ({ '--i': i }) as CSSProperties

/*
 * A row of tall cards, recreated from the reference's section after the hero:
 * the statement first, then the three details. Each card carries a large line
 * at the top and a small label at the bottom. The label is the card's heading
 * (h2 for the statement, h3 for each detail), first in the source and shown last
 * (about.css), so the outline reads About › Focus, Interests, Approach.
 */
export function About() {
  const cards = [
    { label: about.label, line: about.statement, heading: 'h2' as const },
    ...about.details.map((item) => ({
      label: item.term,
      line: item.detail,
      heading: 'h3' as const,
    })),
  ]

  return (
    <section id="about" aria-labelledby="about-heading" className="about scroll-mt-header">
      <AboutCards className="about-grid">
        {cards.map(({ label, line, heading: Heading }, i) => (
          <div key={label} data-about-card className="about-card bg-surface-2" style={index(i)}>
            <Heading
              id={i === 0 ? 'about-heading' : undefined}
              className="about-label font-label text-label text-fg uppercase"
            >
              <span aria-hidden="true" className="about-square bg-accent" />
              <span className="about-label-text">
                <ScrambleText text={label} />
              </span>
            </Heading>
            <p className="font-display text-2xl font-normal text-fg lg:text-xl xl:text-2xl">
              {line}
            </p>
          </div>
        ))}
      </AboutCards>
    </section>
  )
}
