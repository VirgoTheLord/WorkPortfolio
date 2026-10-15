import type { ComponentProps } from 'react'
import './section-label.css'

type SectionLabelProps = Omit<ComponentProps<'p'>, 'children'> & {
  name: string
}

/*
 * How a home section is named (today only Selected Work carries one): a small
 * accent square and its name, in the label face, centred over a short double
 * rule. The square is decoration; the name is what is read.
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
