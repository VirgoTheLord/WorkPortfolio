import { CopyButton } from '@/components/interactive/copy-button'
import { LocalTime } from '@/components/interactive/local-time'
import { Icon } from '@/components/ui/icon'
import { compact } from '@/content/compact'
import { contact as details } from '@/content/site'
import { CompactSection } from './compact-section'
import { RollText } from '@/components/ui/roll-text'

const { contact, intro } = compact

/*
 * The way to get in touch: the full site's invitation, the address set large
 * with a copy button beside it (ratneshc.com's), the email and profile links as
 * chips, and the owner's local time and how far it is from the visitor's.
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
          <a href={`mailto:${details.email}`} className="cp-chip">
            <Icon name="mail" className="size-3.5" />
            <RollText>{contact.write}</RollText>
          </a>
        </li>
        {contact.profiles.map((profile) => (
          <li key={profile.href}>
            <a href={profile.href} target="_blank" rel="noreferrer" className="cp-chip">
              <Icon name={profile.icon} className="size-3.5" />
              <RollText>{profile.label}</RollText>
            </a>
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
