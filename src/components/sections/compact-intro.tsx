import { Fragment, type CSSProperties } from 'react'
import { BallpointLink } from '@/components/interactive/ballpoint-link'
import { LocalTime } from '@/components/interactive/local-time'
import { ScribbleLine } from '@/components/interactive/scribble-line'
import { compact } from '@/content/compact'
import { site } from '@/content/site'
import { RollText } from '@/components/ui/roll-text'

const { intro } = compact

/*
 * The compact site's opening (DESIGN.md §5b): where and what time it is there,
 * the name (printed over an accent impression a hair out of register, which
 * slips further out and thumps back in on hover, word by word), the
 * role, the full site's statement with one hand-drawn red line under its key
 * words (drawn once on arrival, and it wobbles when the statement is hovered,
 * compact.css), a line on now, and the ways out as small chips inside a
 * sentence (10xshivam.dev's), each drawn in ballpoint (Cairn's button, still).
 */
export function CompactIntro() {
  return (
    <section aria-labelledby="intro-heading" className="cp-intro">
      <p className="cp-intro-where font-label">
        <span aria-hidden="true" className="cp-square" />
        <span className="cp-roll-host">
          <RollText alt={intro.coords}>{intro.place}</RollText>
        </span>
        <span aria-hidden="true" className="cp-intro-dot">
          ·
        </span>
        <LocalTime zone={intro.time.zone} fallback={intro.time.fallback} />
      </p>
      <h1 id="intro-heading" className="cp-intro-name">
        <span className="sr-only">{site.name}</span>
        <span aria-hidden="true">
          {site.name.split(' ').map((word, w) => (
            <Fragment key={word}>
              {w > 0 ? ' ' : null}
              <span
                className="cp-print-word"
                data-word={word}
                style={{ '--w': w } as CSSProperties}
              >
                {word}
              </span>
            </Fragment>
          ))}
        </span>
      </h1>
      <p className="cp-intro-role font-label">{intro.role}</p>
      <p className="cp-intro-statement">
        {intro.statement.before}
        <span className="cp-scribble-words">
          {intro.statement.mark}
          <ScribbleLine />
        </span>
        {intro.statement.after}
      </p>
      <p className="cp-intro-note">{intro.note}</p>
      <p className="cp-intro-reach">
        {intro.reach.map((part) =>
          typeof part === 'string' ? (
            part
          ) : (
            <BallpointLink key={part.href} label={part.label} href={part.href} />
          ),
        )}
      </p>
    </section>
  )
}
