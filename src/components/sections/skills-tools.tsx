import type { CSSProperties, ReactNode } from 'react'
import type { SkillsPageContent } from '@/types/content'

type Mark = SkillsPageContent['tools']['items'][number]

/*
 * The row of four marks under the Skills page's intro, standing in for the
 * reference's rendered tool logos: simple marks drawn here for the four tools this
 * site is built with, in the page's ink, not the projects' own artwork. Each sits
 * in a mask and rises in turn, left to right, as the row comes up the screen
 * (motion/rise.tsx; measured on the reference: 100ms apart). One list, named for
 * assistive tech; the drawings themselves are decoration.
 */
export function SkillsTools({ label, items }: SkillsPageContent['tools']) {
  return (
    <ul aria-label={label} className="skills-tools">
      {items.map((item, i) => (
        <li key={item} className="skills-tool">
          <span
            data-rise=""
            className="skills-tool-mark"
            style={{ '--rise-delay': `${i * 100}ms` } as CSSProperties}
          >
            <span className="sr-only">{names[item]}</span>
            <svg aria-hidden="true" viewBox="0 0 120 96">
              {marks[item]}
            </svg>
          </span>
        </li>
      ))}
    </ul>
  )
}

const names: Record<Mark, string> = {
  next: 'Next.js',
  react: 'React',
  typescript: 'TypeScript',
  gsap: 'GSAP',
}

/* Drawn on a 120 × 96 box. Ink is currentColor; the counter-colour is the page's. */
const marks: Record<Mark, ReactNode> = {
  next: (
    <>
      <circle cx="60" cy="48" r="40" className="skills-tool-ink" />
      <path d="M46 66V30l30 40M74 30v26" className="skills-tool-cut" />
    </>
  ),
  react: (
    <g className="skills-tool-line">
      <ellipse cx="60" cy="48" rx="46" ry="17" />
      <ellipse cx="60" cy="48" rx="46" ry="17" transform="rotate(60 60 48)" />
      <ellipse cx="60" cy="48" rx="46" ry="17" transform="rotate(-60 60 48)" />
      <circle cx="60" cy="48" r="7" className="skills-tool-ink" />
    </g>
  ),
  typescript: (
    <>
      <rect x="20" y="8" width="80" height="80" className="skills-tool-ink" />
      <text x="94" y="82" fontSize="34" textAnchor="end" className="skills-tool-text">
        TS
      </text>
    </>
  ),
  gsap: (
    <g className="skills-tool-line">
      <path d="M20 84h80M20 84V12" className="skills-tool-axis" />
      <path d="M20 84C58 84 62 12 100 12" />
      <circle cx="100" cy="12" r="6" className="skills-tool-dot" />
    </g>
  ),
}
