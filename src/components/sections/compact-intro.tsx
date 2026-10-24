import { Fragment, type CSSProperties } from 'react'
import { LocalTime } from '@/components/interactive/local-time'
import { Icon } from '@/components/ui/icon'
import { compact } from '@/content/compact'
import { site } from '@/content/site'
import { RollText } from '@/components/ui/roll-text'

const { intro } = compact

/*
 * The compact site's opening (DESIGN.md §5b): where and what time it is there,
 * the name (its letters ripple up in orange, one after another, on hover), the
 * role, the full site's statement with one hand-drawn orange line under its key
 * words (drawn once on arrival, and it wobbles when the statement is hovered,
 * compact.css), a line on now, and the ways out as small chips inside a
 * sentence (10xshivam.dev's), their icons wiggling on hover.
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
          {site.name.split(' ').map((word, w, words) => {
            const start = words.slice(0, w).join('').length
            return (
              <Fragment key={word}>
                {w > 0 ? ' ' : null}
                <span className="cp-wave-word">
                  {[...word].map((letter, l) => (
                    <span
                      key={l}
                      className="cp-wave-letter"
                      style={{ '--i': start + l } as CSSProperties}
                    >
                      {letter}
                    </span>
                  ))}
                </span>
              </Fragment>
            )
          })}
        </span>
      </h1>
      <p className="cp-intro-role font-label">{intro.role}</p>
      <p className="cp-intro-statement">
        {intro.statement.before}
        <span className="cp-scribble-words">
          {intro.statement.mark}
          <svg
            aria-hidden="true"
            viewBox="0 0 200 14"
            preserveAspectRatio="none"
            className="cp-scribble"
          >
            <path pathLength={1} d="M3 8.5C48 4.2 112 3.1 197 5.6M22 11.6c42-2.4 96-2.9 158-1.4" />
          </svg>
        </span>
        {intro.statement.after}
      </p>
      <p className="cp-intro-note">{intro.note}</p>
      <p className="cp-intro-reach">
        {intro.reach.map((part) =>
          typeof part === 'string' ? (
            part
          ) : (
            <a
              key={part.href}
              href={part.href}
              {...(part.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
              className="cp-chip"
            >
              <Icon name={part.icon} className="size-3.5" />
              <RollText>{part.label}</RollText>
            </a>
          ),
        )}
      </p>
    </section>
  )
}
