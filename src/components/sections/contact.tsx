import type { CSSProperties } from 'react'
import { SectionReveal } from '@/components/motion/section-reveal'
import { contact } from '@/content/site'
import './contact.css'

const index = (i: number) => ({ '--i': i }) as CSSProperties

/*
 * The closing page: a quiet label, one statement, and the address itself as the
 * only action. A one-screen section like Hero, About and Skills, so spacing
 * comes from the flex layout and nothing is added around it. The link's single
 * interaction is a brass rule that extends on hover and keyboard focus alike.
 */
export function Contact() {
  return (
    <SectionReveal
      id="contact"
      aria-labelledby="contact-heading"
      className="mx-auto flex section-screen w-full max-w-content scroll-mt-header flex-col justify-between gap-12 px-margin pb-8 focus:outline-none md:gap-16 md:pb-10"
    >
      <div>
        <div aria-hidden="true" className="contact-draw h-px bg-rule-strong" style={index(0)} />
        <h2
          id="contact-heading"
          className="contact-mask flex items-center gap-4 pt-4 font-label text-label text-fg-subtle uppercase"
          style={index(1)}
        >
          <span aria-hidden="true" className="h-px w-8 bg-accent-secondary" />
          <span aria-hidden="true" className="font-medium text-accent tabular-nums">
            {contact.index}
          </span>
          <span aria-hidden="true">—</span>
          {contact.label}
        </h2>
      </div>

      <div className="grid grid-cols-4 gap-x-gutter md:grid-cols-12">
        <p className="col-span-4 font-display text-3xl wrap-break-word text-fg md:col-span-9 md:col-start-4">
          {contact.statement.map((sentence, i) => (
            <span key={sentence} className="contact-mask block" style={index(3 + i * 2)}>
              {sentence}{' '}
            </span>
          ))}
        </p>
      </div>

      <div className="grid grid-cols-4 items-baseline gap-x-gutter gap-y-4 md:grid-cols-12">
        <p
          className="contact-mask col-span-4 font-label text-label text-fg-subtle uppercase md:col-span-3"
          style={index(7)}
        >
          {contact.emailLabel}
        </p>
        <div className="contact-mask col-span-4 md:col-span-9" style={index(8)}>
          <a
            href={`mailto:${contact.email}`}
            className="group relative block w-fit max-w-full pb-3 font-display text-3xl wrap-break-word text-accent transition-colors duration-base ease-out hover:duration-fast focus-visible:duration-fast active:translate-y-px active:duration-instant"
          >
            {contact.email}
            <span
              aria-hidden="true"
              className="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-15 bg-accent-secondary transition-transform duration-base ease-out group-hover:scale-x-100 group-hover:duration-fast group-focus-visible:scale-x-100 group-focus-visible:duration-fast"
            />
          </a>
        </div>
      </div>
    </SectionReveal>
  )
}
