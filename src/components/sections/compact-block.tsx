import type { ReactNode } from 'react'
import { compact } from '@/content/compact'
import type { CompactSectionId } from '@/types/content'

type Props = {
  id: CompactSectionId
  /** A quiet note at the heading's right: a count, a hint, a link. */
  aside?: ReactNode
  children: ReactNode
}

/*
 * One section of the compact home: a small heading, an aside on its right, and
 * what follows. It takes focus (not in the tab order), so the search can move
 * focus to it along with the scroll.
 */
export function CompactBlock({ id, aside, children }: Props) {
  const section = compact.sections.find((item) => item.id === id)
  if (!section) return null
  return (
    <section id={id} tabIndex={-1} aria-labelledby={`${id}-heading`} className="cp-block">
      <div className="cp-block-head">
        <h2 id={`${id}-heading`} className="cp-block-title">
          {section.title}
        </h2>
        {aside ? <div className="cp-meta">{aside}</div> : null}
      </div>
      {children}
    </section>
  )
}
