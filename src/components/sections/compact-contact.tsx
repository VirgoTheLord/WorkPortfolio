import { BallpointLink } from '@/components/interactive/ballpoint-link'
import { CopyButton } from '@/components/interactive/copy-button'
import { LocalTime } from '@/components/interactive/local-time'
import { compact } from '@/content/compact'
import { contact as details } from '@/content/site'
import { CompactSection } from './compact-section'

const { contact, intro } = compact

/*
 * The way to get in touch: the full site's invitation, the address set large
 * with a copy button beside it (ratneshc.com's), the email and profile links as
 * small chips drawn in ballpoint (Cairn's button, still), and the owner's local time and how far it is from the visitor's.
 */
export function CompactContact() {
  return (
    <CompactSection id="contact">
      <p className="cp-contact-lead">{contact.lead}</p>
      <p className="cp-contact-email">
        <a href={`mailto:${details.email}`} className="cp-contact-address">
          {details.email}
        </a>
        <CopyButton text={details.email} label={contact.copy.label} done={contact.copy.done} />
      </p>
      <ul className="cp-chips">
        <li>
          <BallpointLink label={contact.write} href={`mailto:${details.email}`} />
        </li>
        {contact.profiles.map((profile) => (
          <li key={profile.href}>
            <BallpointLink label={profile.label} href={profile.href} />
          </li>
        ))}
      </ul>
      <p className="cp-contact-time font-label">
        <span className="text-fg-muted">{contact.time}</span>{' '}
        <LocalTime zone={intro.time.zone} fallback={intro.time.fallback} gap />
      </p>
    </CompactSection>
  )
}
