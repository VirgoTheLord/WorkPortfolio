import { AboutReveal } from '@/components/motion/about-reveal'
import { ScrambleText } from '@/components/layout/scramble-text'
import { HoverDeck } from '@/components/library/cairn/hover-deck'
import { PlayingCard, SUITS } from '@/components/ui/playing-card'
import { about, hero } from '@/content/site'
import type { AboutContent } from '@/types/content'
import { StatementMark } from './statement-mark'
import './about.css'

/*
 * About: one statement and three facts, set as an editorial block rather than a
 * row of cards (DESIGN.md §3: card-heavy layouts). The small label is the
 * section's heading; the statement is set large and the facts are a definition
 * list on hairlines. From lg the label sits in a narrow column and the rest is
 * offset to its right (DESIGN.md §4, asymmetry).
 *
 * The section is a folder on the brand field (data-theme="brand"): its name on
 * the tab (globals.css, Panels), its edges stitched. From lg it slides
 * up over the pinned hero (about.css). The statement's words each sit in a mask,
 * so its lines can rise out of them in turn (motion/about-reveal.tsx); the
 * sentence is read once, from the hidden copy, not word by word. Three of its
 * words carry a small drawing of themselves (statement-mark.tsx).
 */
const marks: AboutContent['marks'] = about.marks

/* A word of the statement, with its drawing (if it has one) raised against it
   before any punctuation, inside the word's mask so the two rise together. */
function Word({ word }: { word: string }) {
  const [, bare = word, mark = ''] = /^(.*?)([,.:;]*)$/.exec(word) ?? []
  const name = marks[bare]
  if (!name) return word
  return (
    <>
      {bare}
      <StatementMark name={name} />
      {mark}
    </>
  )
}

export function About() {
  const words = about.statement.split(' ')
  // The name's letters, one to a card, for the deck in the left column.
  const letters = [...(hero.title[0] ?? '').toUpperCase()]

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      data-theme="brand"
      className="about edge-top edge-bottom scroll-mt-header bg-bg text-fg"
    >
      {/* The section's name rides the panel's folder tab (globals.css, Panels). */}
      <h2 id="about-heading" className="panel-tab font-label text-label uppercase">
        {about.label}
      </h2>
      <AboutReveal className="about-grid">
        {/* From lg, in the column left of the statement: the name dealt as a
            hand of cards, standing up (Cairn's hover deck, library/cairn).
            Decoration: the name is the page's h1. */}
        <div className="about-deck">
          <HoverDeck
            layout="hand"
            orientation="vertical"
            decorative
            deal
            feel="snappy"
            fan={34}
            label={hero.title[0] ?? ''}
            items={letters.map((letter, i) => ({
              title: letter,
              art: <PlayingCard letter={letter} suit={SUITS[i % SUITS.length]!} />,
            }))}
          />
        </div>
        <div className="about-body">
          <p className="about-statement font-display">
            <span className="sr-only">{about.statement}</span>
            <span aria-hidden="true">
              {words.map((word, i) => (
                <span key={i}>
                  <span data-about-word className="about-mask">
                    <span data-about-rise className="about-rise">
                      <Word word={word} />
                    </span>
                  </span>
                  {i < words.length - 1 ? ' ' : null}
                </span>
              ))}
            </span>
          </p>
          <dl className="about-details">
            {about.details.map((item) => (
              <div key={item.term} data-about-item className="about-detail">
                <dt className="about-term font-label text-label uppercase">
                  <span className="about-mask">
                    <span data-about-rise className="about-rise">
                      <ScrambleText text={item.term} />
                    </span>
                  </span>
                </dt>
                <dd className="about-value">
                  <span className="about-mask about-mask-block">
                    <span data-about-rise className="about-rise">
                      {item.detail}
                    </span>
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </AboutReveal>
    </section>
  )
}
