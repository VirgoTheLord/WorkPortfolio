import type { CSSProperties } from 'react'
import { HeadlineWipe } from '@/components/motion/headline-wipe'
import { KeyLink } from '@/components/ui/key-link'
import { TextLink } from '@/components/ui/text-link'
import { SectionReveal } from '@/components/motion/section-reveal'
import { contact, menu, site } from '@/content/site'
import './contact.css'

const step = (i: number) => ({ '--i': i }) as CSSProperties

/*
 * The closing statement, recreated from the reference's final section. Two
 * columns from lg, on the hero's frame: the headline over a 16:9 panel (the
 * reference's photograph; here the brand field carrying the address), and a
 * column of the lead, a few details, the action and a sign-off, spread over the
 * same height. Below lg everything stacks. The headline and the lead wipe in; the
 * rest rises from masks (contact.css). Only real content: the address, the role
 * and year the menu already states, the name.
 */
export function Contact() {
  return (
    <SectionReveal
      id="contact"
      aria-labelledby="contact-heading"
      className="contact scroll-mt-header bg-bg text-fg"
    >
      <div className="contact-grid">
        <div className="contact-left">
          <h2 id="contact-heading" className="font-display text-3xl font-normal text-fg">
            <HeadlineWipe lines={[contact.headline]} />
          </h2>

          <div data-theme="brand" className="contact-panel bg-bg text-fg" style={step(0)}>
            <p className="font-label text-label uppercase">{contact.emailLabel}</p>
            <TextLink href={`mailto:${contact.email}`} className="contact-email font-display">
              {contact.email}
            </TextLink>
          </div>
        </div>

        <div className="contact-right">
          <p className="font-display text-xl text-fg">
            <HeadlineWipe lines={contact.statement} delay={0.3} />
          </p>

          <ul className="text-base text-fg">
            {menu.status.map((line, i) => (
              <li key={line} className="contact-mask">
                <span className="contact-rise" style={step(i)}>
                  {line}
                </span>
              </li>
            ))}
          </ul>

          <div className="contact-mask contact-hit w-fit">
            <div className="contact-rise" style={step(2)}>
              <KeyLink label={menu.action.label} href={`mailto:${contact.email}`} />
            </div>
          </div>

          <p className="contact-mask text-base text-fg">
            <span className="contact-rise" style={step(3)}>
              {site.name}
            </span>
          </p>
        </div>
      </div>
    </SectionReveal>
  )
}
