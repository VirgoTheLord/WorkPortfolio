import { ContactBoard } from '@/components/motion/contact-board'
import { HeadlineWipe } from '@/components/motion/headline-wipe'
import { KeyLink } from '@/components/library/key-link'
import { contact, menu } from '@/content/site'
import './contact.css'

/*
 * Contact, on the dark field: the email address as a departures board (the
 * owner's choice from a set of studied contact sections and layouts: centred).
 * One column, centred, read top to bottom the way a visitor uses it: the
 * invitation, one quiet line (the heading); the address, set large as a board
 * that copies itself when clicked, with the hint right under it
 * (motion/contact-board.tsx); then the key that opens their mail app. Copying
 * and writing are two clearly separate actions. Nothing else: the footer,
 * directly below, carries the name and the rest.
 */
export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      data-theme="dark"
      className="contact scroll-mt-header bg-bg text-fg"
    >
      <h2 id="contact-heading" className="contact-statement font-display">
        <HeadlineWipe lines={contact.statement} />
      </h2>

      <ContactBoard
        email={contact.email}
        copyLabel={contact.board.copyLabel}
        hint={contact.board.hint}
        touchHint={contact.board.touchHint}
        done={contact.board.done}
      />

      <KeyLink label={menu.action.label} href={`mailto:${contact.email}`} />
    </section>
  )
}
