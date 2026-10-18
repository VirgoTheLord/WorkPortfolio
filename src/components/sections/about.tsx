import type { CSSProperties } from 'react'
import { AboutReveal } from '@/components/motion/about-reveal'
import { ScrambleText } from '@/components/layout/scramble-text'
import { about } from '@/content/site'
import './about.css'

const index = (i: number) => ({ '--i': i }) as CSSProperties

/*
 * About: one statement and three facts, set as an editorial block rather than a
 * row of cards (DESIGN.md §3: card-heavy layouts; the cards were mostly empty
 * space). The small label is the section's heading; the statement is set large
 * and the facts are a definition list on hairlines. From lg the label sits in a
 * narrow column and the rest is offset to its right (DESIGN.md §4, asymmetry).
 */
export function About() {
  return (
    <section id="about" aria-labelledby="about-heading" className="about scroll-mt-header">
      <AboutReveal className="about-grid">
        <h2 id="about-heading" className="about-label font-label text-label uppercase">
          <span aria-hidden="true" className="about-square bg-accent" />
          {about.label}
        </h2>
        <div className="about-body">
          <p data-about-item className="about-statement font-display" style={index(0)}>
            {about.statement}
          </p>
          <dl className="about-details">
            {about.details.map((item, i) => (
              <div key={item.term} data-about-item className="about-detail" style={index(i + 1)}>
                <dt className="about-term font-label text-label uppercase">
                  <ScrambleText text={item.term} />
                </dt>
                <dd className="about-value">{item.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </AboutReveal>
    </section>
  )
}
