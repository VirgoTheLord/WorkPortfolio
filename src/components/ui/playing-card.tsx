import './playing-card.css'

/* The suits, in the order a hand deals them: red for hearts and diamonds, ink
   for spades and clubs. Drawn on a 24-unit square. */
export const SUITS = ['spade', 'heart', 'club', 'diamond'] as const
export type Suit = (typeof SUITS)[number]

const SUIT_PATH: Record<Suit, string> = {
  spade:
    'M12 2C9 6.5 4 9.5 4 13.5a4 4 0 0 0 7 2.6V18l-2.2 4h6.4L13 18v-1.9a4 4 0 0 0 7-2.6C20 9.5 15 6.5 12 2z',
  heart: 'M12 21s-8.5-5.6-8.5-11.4A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8.5 2.6C20.5 15.4 12 21 12 21z',
  club: 'M12 2.5a4 4 0 0 0-3.4 6.1A4 4 0 1 0 10.6 16H11l-1.6 5.5h5.2L13 16h.4a4 4 0 1 0 2-7.4A4 4 0 0 0 12 2.5z',
  diamond: 'M12 2l7.5 10L12 22 4.5 12z',
}

function SuitMark({ suit }: { suit: Suit }) {
  return (
    <svg viewBox="0 0 24 24" className="playing-card-suit">
      <path d={SUIT_PATH[suit]} />
    </svg>
  )
}

/*
 * A playing card carrying a letter or a figure (owner's idea, first for the
 * About hand): white in either mode with a fine grain, the index (the letter
 * over its suit) in two corners, the second upside down, and the letter large
 * in the middle over its suit. Sized by --card, its height (playing-card.css).
 * Decoration: the caller hides it from assistive tech or names it.
 */
export function PlayingCard({
  letter,
  suit,
  className = '',
}: {
  letter: string
  suit: Suit
  className?: string
}) {
  return (
    <span className={`playing-card ${className}`} data-suit={suit}>
      <span className="playing-card-index">
        <span className="font-display">{letter}</span>
        <SuitMark suit={suit} />
      </span>
      <span className="playing-card-center">
        <span className="playing-card-letter font-display">{letter}</span>
        <SuitMark suit={suit} />
      </span>
      <span className="playing-card-index" data-flip="">
        <span className="font-display">{letter}</span>
        <SuitMark suit={suit} />
      </span>
    </span>
  )
}
