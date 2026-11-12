import type { ReactNode } from 'react'
import { compact } from '@/content/compact'
import type { CompactSectionId } from '@/types/content'

type Props = {
  id: CompactSectionId
  /** A short fact at the end of the heading's rule ("4 projects"). */
  meta?: string
  children: ReactNode
}

/*
 * One section of the compact site, under its heading: the red square and
 * the section's number (the full site's section label, made small), the title,
 * a dashed rule to the edge and, at its end, a short fact. The section takes
 * focus (not in the tab order) so the palette and the index can move focus to
 * it along with the scroll.
 */
export function CompactSection({ id, meta, children }: Props) {
  const section = compact.sections.find((item) => item.id === id)
  if (!section) return null
  return (
    <section id={id} tabIndex={-1} aria-labelledby={`${id}-heading`} className="cp-section">
      <div className="cp-head">
        <h2 id={`${id}-heading`} className="cp-head-title">
          <span aria-hidden="true" className="cp-head-number font-label">
            {section.number}
          </span>
          {section.title}
        </h2>
        <span aria-hidden="true" className="cp-head-rule" />
        {meta ? <p className="cp-head-meta font-label">{meta}</p> : null}
      </div>
      {children}
    </section>
  )
}
