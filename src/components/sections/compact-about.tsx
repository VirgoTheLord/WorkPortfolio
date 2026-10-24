import { compact } from '@/content/compact'
import { CompactSection } from './compact-section'

/* About: a short note from the owner, signed; the name draws a little
   flourish under itself when the note is hovered (compact.css). */
export function CompactAbout() {
  return (
    <CompactSection id="about">
      <div className="cp-about">
        {compact.about.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <p className="cp-about-sign font-label">
          <span className="cp-sign">
            {compact.about.signoff}
            <svg
              aria-hidden="true"
              viewBox="0 0 120 12"
              preserveAspectRatio="none"
              className="cp-sign-line"
            >
              <path pathLength={1} d="M2 8c18-5 34-6 52-3s38 4 64-3" />
            </svg>
          </span>
        </p>
      </div>
    </CompactSection>
  )
}
