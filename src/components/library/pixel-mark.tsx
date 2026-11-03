import Link from 'next/link'
import type { ComponentProps, CSSProperties } from 'react'
import './pixel-mark.css'

/* A 5×5 bitmap alphabet: "#" is a cell, "." is empty. */
const GLYPHS: Record<string, readonly string[]> = {
  A: ['.###.', '#...#', '#####', '#...#', '#...#'],
  B: ['####.', '#...#', '####.', '#...#', '####.'],
  C: ['.####', '#....', '#....', '#....', '.####'],
  D: ['####.', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '####.', '#....', '#####'],
  F: ['#####', '#....', '####.', '#....', '#....'],
  G: ['.####', '#....', '#..##', '#...#', '.###.'],
  H: ['#...#', '#...#', '#####', '#...#', '#...#'],
  I: ['.###.', '..#..', '..#..', '..#..', '.###.'],
  J: ['..###', '...#.', '...#.', '#..#.', '.##..'],
  K: ['#..#.', '#.#..', '##...', '#.#..', '#..#.'],
  L: ['#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'],
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '####.', '#....', '#....'],
  Q: ['.###.', '#...#', '#.#.#', '#..#.', '.##.#'],
  R: ['####.', '#...#', '####.', '#..#.', '#...#'],
  S: ['.####', '#....', '.###.', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#.#.#', '##.##', '#...#'],
  X: ['#...#', '.#.#.', '..#..', '.#.#.', '#...#'],
  Y: ['#...#', '.#.#.', '..#..', '..#..', '..#..'],
  Z: ['#####', '...#.', '..#..', '.#...', '#####'],
  ' ': ['.....', '.....', '.....', '.....', '.....'],
}

/* Each cell waits this long per column (ms) and a little per row, so the word builds left to right. */
const COLUMN = 18
const ROW = 6

type PixelMarkProps = Omit<ComponentProps<typeof Link>, 'children' | 'className'> & {
  /** What shows at rest, set in the mark face (the logo, "AW"). */
  mark: string
  /** What it rebuilds into on hover or focus, A–Z and spaces ("ALWIN"). */
  word: string
  /** The link's accessible name. */
  label: string
  className?: string
}

/*
 * A logo that turns into a pixel word (pixel-mark.css): at rest it is the mark
 * in the blackletter; hovered or focused, the mark blurs away and the word is
 * built from small square cells, column by column, a few of them in the accent,
 * like the full site's hero name in miniature. The cells are laid out on the
 * server from a 5×5 alphabet, so it is pure CSS: no script, nothing to hydrate.
 * The word is decoration (hidden from assistive tech); the label names the link.
 * Reduced motion: the swap is instant.
 *
 * Kept for the UI library; on the site only on the compact site's workbench
 * (/compact/components/pixel-mark). Built as one of the options for the
 * compact site's way back to the full site (owner's choice, 24 October 2026:
 * keep it as a component; the bar uses the terminal line instead).
 */
export function PixelMark({ mark, word, label, className = '', ...props }: PixelMarkProps) {
  let column = 0
  return (
    <Link {...props} className={`pixel-mark ${className}`}>
      <span className="sr-only">{label}</span>
      <span aria-hidden="true" className="pixel-mark-ink font-mark">
        {mark}
      </span>
      <span aria-hidden="true" className="pixel-mark-cells">
        {[...word.toUpperCase()].map((char, index) => {
          const rows = GLYPHS[char] ?? GLYPHS[' ']!
          const start = column
          column += 6
          return (
            <span key={index} className="pixel-mark-letter">
              {rows.flatMap((row, r) =>
                [...row].map((cell, c) => (
                  <i
                    key={`${r}-${c}`}
                    data-on={cell === '#' || undefined}
                    // A sprinkle of accent cells, the same on every render.
                    data-hot={(cell === '#' && (index * 7 + r * 3 + c * 5) % 11 === 0) || undefined}
                    style={{ '--d': `${(start + c) * COLUMN + r * ROW}ms` } as CSSProperties}
                  />
                )),
              )}
            </span>
          )
        })}
      </span>
    </Link>
  )
}
