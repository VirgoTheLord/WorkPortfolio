import { WipeReplay } from '@/components/interactive/wipe-replay'
import { FrameButton } from '@/components/library/frame-button'
import { KeyLink } from '@/components/library/key-link'
import { ScrambleButton } from '@/components/library/scramble-button'
import { SectionLabel } from '@/components/library/section-label'
import { ContactBoard } from '@/components/motion/contact-board'
import { HeadlineWipe } from '@/components/motion/headline-wipe'
import { PointerFx } from '@/components/motion/pointer-fx'
import { ArrowLink } from '@/components/ui/arrow-link'
import { TextLink } from '@/components/ui/text-link'
import { workbench } from '@/content/workbench'
import { contact, menu } from '@/content/site'

/* The stage's links stay on the stage: a hash to the stage itself. */
const here = '#stage'
const { demo } = workbench

/*
 * What each workbench piece shows on its stage: the real component from the
 * site's own files, with the props the site gives it (or, for library pieces,
 * the ones it last had). Nothing is a picture of a component.
 */
export function WorkbenchDemo({ slug }: { slug: string }) {
  switch (slug) {
    case 'frame-button':
      return <FrameButton label={menu.action.label} href={here} />
    case 'departures-board':
      return (
        <div className="cp-demo-wide">
          <ContactBoard email={contact.email} {...contact.board} />
        </div>
      )
    case 'headline-wipe':
      return (
        <WipeReplay label={workbench.labels.replay}>
          <p className="cp-demo-headline">
            <HeadlineWipe lines={contact.statement} />
          </p>
        </WipeReplay>
      )
    case 'arrow-link':
      return <ArrowLink href={here}>{demo.arrow}</ArrowLink>
    case 'text-link':
      return (
        <p className="cp-demo-sentence">
          {contact.statement[0]} <TextLink href={`mailto:${contact.email}`}>write to me</TextLink>.
        </p>
      )
    case 'pointer-effects':
      return (
        <div className="cp-demo-pointer">
          <PointerFx />
          <a href={here} className="cp-demo-target">
            {demo.lens}
          </a>
          <span data-cursor-tag={demo.tag} className="cp-demo-target">
            {demo.tagged}
          </span>
        </div>
      )
    case 'key':
      return <KeyLink label={demo.key} href={here} />
    case 'scramble-button':
      return (
        <div className="cp-demo-row">
          <ScrambleButton label={menu.action.label} href={here} />
          <ScrambleButton label={menu.action.label} href={here} tone="ink" />
        </div>
      )
    case 'section-label':
      return <SectionLabel name={demo.section} />
    default:
      return null
  }
}
