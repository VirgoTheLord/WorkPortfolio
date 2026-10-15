import Link from 'next/link'
import type { ComponentProps, CSSProperties } from 'react'
import { isInPageHref } from '@/lib/in-page-href'
import './frame-button.css'

type FrameButtonProps = Omit<ComponentProps<typeof Link>, 'children' | 'className'> & {
  label: string
  /** `compact` for a bar (the navbar's 40px row); the default is 48px tall. */
  size?: keyof typeof sizes
  className?: string
}

const sizes = { default: '', compact: 'frame-button-compact' } as const

const corners = ['tl', 'tr', 'br', 'bl'] as const

/* Three chevrons, each 4.5 wide and 9 tall, 6 apart; separate paths so they can
   light up in turn (--n). */
const chevrons = ['M1 3.5 5.5 8 1 12.5', 'M7 3.5 11.5 8 7 12.5', 'M13 3.5 17.5 8 13 12.5']

function Chevrons() {
  return (
    <svg viewBox="0 0 19 16" className="frame-button-chevrons">
      {chevrons.map((d, n) => (
        <path key={d} d={d} style={{ '--n': n } as CSSProperties} />
      ))}
    </svg>
  )
}

/*
 * The site's primary call to action (frame-button.css): an ink plate with an
 * accent square holding two chevrons and a monospace label. On hover or focus it
 * turns into a selected frame, as in a design tool: the plate goes to the page's
 * tone with a hairline and grows a touch, square handles come out at its four
 * corners, the square goes from accent to ink while its three chevrons light up
 * in turn (a chase), and the label's letters flip over one after another like a
 * departures board (frame-button.css). First built for Selected Work (after the
 * "View all case studies" key on kushbothra.com), then made the hero's, the
 * navbar's and the Skills page's call to action.
 *
 * A real link: a plain anchor for a hash on the home page (so the smooth
 * scroller takes it, lib/in-page-href.ts), next/link to another route. The label
 * is its accessible name (a visually hidden copy; the flipping letters are
 * decoration). Pure CSS: no script.
 */
export function FrameButton({
  label,
  size = 'default',
  className = '',
  ...props
}: FrameButtonProps) {
  const classes = `frame-button ${sizes[size]} ${className}`
  const content = (
    <>
      <span aria-hidden="true" className="frame-button-plate" />
      {corners.map((corner) => (
        <span
          key={corner}
          aria-hidden="true"
          className="frame-button-handle"
          data-corner={corner}
        />
      ))}
      <span aria-hidden="true" className="frame-button-icon">
        <Chevrons />
      </span>
      <span className="frame-button-label font-label uppercase">
        <span className="sr-only">{label}</span>
        <span aria-hidden="true" className="frame-button-letters">
          {Array.from(label).map((char, i) => (
            <span key={i} className="frame-button-char" style={{ '--i': i } as CSSProperties}>
              {char}
            </span>
          ))}
        </span>
      </span>
    </>
  )
  const { href } = props
  return isInPageHref(href) ? (
    <a {...props} href={href} className={classes}>
      {content}
    </a>
  ) : (
    <Link {...props} className={classes}>
      {content}
    </Link>
  )
}
