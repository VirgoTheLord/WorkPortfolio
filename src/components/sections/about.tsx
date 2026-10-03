import type { CSSProperties } from 'react'
import { SectionReveal } from '@/components/motion/section-reveal'
import { about } from '@/content/site'
import './about.css'

const index = (i: number) => ({ '--i': i }) as CSSProperties

/*
 * An editorial statement: a small label in the left columns, the statement
 * offset into the right. The h2 is the visible label, so the heading is real
 * text for assistive technology whether or not the reveal has played.
 */
export function About() {
  return (
    <SectionReveal
      id="about"
      aria-labelledby="about-heading"
      className="mx-auto flex section-screen w-full max-w-content scroll-mt-header flex-col justify-between gap-8 px-margin pb-8 focus:outline-none md:gap-16 md:pb-10"
    >
      <div>
        <div aria-hidden="true" className="about-draw h-px bg-rule-strong" style={index(0)} />

        <h2
          id="about-heading"
          className="about-mask flex items-center gap-4 pt-4 font-label text-label text-fg-subtle uppercase"
          style={index(1)}
        >
          <span aria-hidden="true" className="h-px w-8 bg-accent-secondary" />
          <span aria-hidden="true" className="font-medium text-accent tabular-nums">
            {about.index}
          </span>
          <span aria-hidden="true">—</span>
          {about.label}
        </h2>
      </div>

      <div className="grid grid-cols-4 gap-x-gutter md:grid-cols-12">
        <p className="col-span-4 font-display text-3xl wrap-break-word text-fg md:col-span-9 md:col-start-4">
          {about.statement.map((sentence, i) => (
            <span key={sentence} className="about-mask block" style={index(3 + i * 2)}>
              {sentence}{' '}
            </span>
          ))}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-x-gutter gap-y-8 md:grid-cols-12">
        <p
          className="about-mask col-span-4 max-w-measure font-text text-lg wrap-break-word text-fg-muted md:col-span-5 md:col-start-4"
          style={index(9)}
        >
          {about.body}
        </p>

        <dl className="col-span-4 font-label text-label md:col-span-3 md:col-start-10">
          {about.details.map((item, i) => (
            <div
              key={item.term}
              className="about-mask border-t border-rule py-3 last:border-b"
              style={index(10 + i)}
            >
              <dt className="text-fg-subtle uppercase">{item.term}</dt>
              <dd className="mt-1 font-medium text-fg">{item.detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </SectionReveal>
  )
}
