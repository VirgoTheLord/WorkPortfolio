import type { ComponentProps } from 'react'
import './section-label.css'

type SectionLabelProps = Omit<ComponentProps<'p'>, 'children'> & {
  name: string
}

/*
 * How a section is named: a small accent square and its name, in the label face,
 * centred over a short double rule. The square is decoration; the name is what is
 * read.
 *
 * Not on the site: kept for the UI library. It sat above Selected Work's
 * headline, which said the same words larger, so the section named itself twice.
 */
export function SectionLabel({ name, className = '', ...props }: SectionLabelProps) {
  return (
    <p {...props} className={`section-label font-label text-label uppercase ${className}`}>
      <span className="section-label-row">
        <span aria-hidden="true" className="section-label-mark" />
        <span>{name}</span>
      </span>
    </p>
  )
}
