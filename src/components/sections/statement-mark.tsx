import type { StatementMark as Mark } from '@/types/content'

/*
 * A small drawing of the word it follows in the About statement, raised like a
 * footnote mark (owner's pick from a set of previews, November 2026): the
 * pointer for "hover", a clock for "timing", a little cluster of pixels for
 * "pixel". Set superscript, the line keeps its rhythm and the drawings
 * annotate rather than interrupt; they are in the text's colour and answer
 * when the statement is pointed at (about.css, The marks). Decoration: the
 * sentence is read whole from the statement's hidden copy.
 */
export function StatementMark({ name }: { name: Mark }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`about-mark about-${name}`}>
      {name === 'pointer' ? (
        <path d="M4 1.5 21 12.5l-7.6 1.8L9.6 22.5z" />
      ) : name === 'clock' ? (
        <>
          <circle cx="12" cy="12" r="9.5" />
          <path className="about-hand" d="M12 6.5V12l3.5 2.2" />
        </>
      ) : (
        <>
          <rect x="2" y="2" width="6" height="6" />
          <rect x="9" y="2" width="6" height="6" />
          <rect className="about-lit" x="9" y="9" width="6" height="6" />
          <rect x="16" y="9" width="6" height="6" />
          <rect x="9" y="16" width="6" height="6" />
        </>
      )}
    </svg>
  )
}
