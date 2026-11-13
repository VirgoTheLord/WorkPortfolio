import { AboutReveal } from '@/components/motion/about-reveal'
import { ScrambleText } from '@/components/layout/scramble-text'
import { HoverDeck } from '@/components/library/cairn/hover-deck'
import { about, hero } from '@/content/site'
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
 * sentence is read once, from the hidden copy, not word by word.
 */
/* The name's letters as playing cards (owner's idea): each has a suit, in turn,
   red for hearts and diamonds and ink for spades and clubs. Drawn on a 24-unit
   square, decoration (the name is the page's h1). */
const SUITS = ['spade', 'heart', 'club', 'diamond'] as const
type Suit = (typeof SUITS)[number]
const SUIT_PATH: Record<Suit, string> = {
  spade:
    'M12 2C9 6.5 4 9.5 4 13.5a4 4 0 0 0 7 2.6V18l-2.2 4h6.4L13 18v-1.9a4 4 0 0 0 7-2.6C20 9.5 15 6.5 12 2z',
  heart: 'M12 21s-8.5-5.6-8.5-11.4A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8.5 2.6C20.5 15.4 12 21 12 21z',
  club: 'M12 2.5a4 4 0 0 0-3.4 6.1A4 4 0 1 0 10.6 16H11l-1.6 5.5h5.2L13 16h.4a4 4 0 1 0 2-7.4A4 4 0 0 0 12 2.5z',
  diamond: 'M12 2l7.5 10L12 22 4.5 12z',
}

function SuitMark({ suit }: { suit: Suit }) {
  return (
    <svg viewBox="0 0 24 24" className="about-card-suit">
      <path d={SUIT_PATH[suit]} />
    </svg>
  )
}

/* One card: the index (letter over suit) in two corners, the second upside
   down, and the letter large in the middle over its suit. */
function PlayingCard({ letter, suit }: { letter: string; suit: Suit }) {
  return (
    <span className="about-card" data-suit={suit}>
      <span className="about-card-index">
        <span className="font-display">{letter}</span>
        <SuitMark suit={suit} />
      </span>
      <span className="about-card-center">
        <span className="about-card-letter font-display">{letter}</span>
        <SuitMark suit={suit} />
      </span>
      <span className="about-card-index" data-flip="">
        <span className="font-display">{letter}</span>
        <SuitMark suit={suit} />
      </span>
    </span>
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
                      {word}
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
