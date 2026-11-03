import Image from 'next/image'
import { BallpointReplay } from '@/components/interactive/ballpoint-replay'
import { ChromeUploadDemo } from '@/components/interactive/chrome-upload-demo'
import { CodeInputDemo } from '@/components/interactive/code-input-demo'
import { WipeReplay } from '@/components/interactive/wipe-replay'
import { CometField } from '@/components/library/cairn/comet-field'
import { FlapCheckbox } from '@/components/library/cairn/flap-checkbox'
import { FlapSegments } from '@/components/library/cairn/flap-segments'
import { FoilCards } from '@/components/library/cairn/foil-cards'
import { LensSearch } from '@/components/library/cairn/lens-search'
import { NeoSwitch } from '@/components/library/cairn/neo-switch'
import { RecordStack } from '@/components/library/cairn/record-stack'
import { WaveformSlider } from '@/components/library/cairn/waveform-slider'
import { FrameButton } from '@/components/library/frame-button'
import { KeyLink } from '@/components/library/key-link'
import { PixelMark } from '@/components/library/pixel-mark'
import { ScrambleButton } from '@/components/library/scramble-button'
import { ContactBoard } from '@/components/motion/contact-board'
import { HeadlineWipe } from '@/components/motion/headline-wipe'
import { workbench } from '@/content/workbench'
import { contact, menu, site } from '@/content/site'

/* The stage's links stay on the stage: a hash to the stage itself. */
const here = '#stage'
const { demo } = workbench
const { cairn } = demo

/* The record stack's covers: Cairn's illustrated stage covers (public/workbench/covers). */
const records = cairn.records.items.map((record) => ({
  ...record,
  art: (
    <Image
      src={`/workbench/covers/${record.title.toLowerCase().replace(/[^a-z]+/g, '-')}.jpg`}
      alt=""
      width={480}
      height={480}
      draggable={false}
    />
  ),
}))

/*
 * What each workbench piece shows on its stage: the real component from the
 * site's own files, with the props the site gives it (for library pieces, the
 * ones it last had; for Cairn's, ones like Cairn's own stage). Nothing is a
 * picture of a component.
 */
export function WorkbenchDemo({ slug }: { slug: string }) {
  switch (slug) {
    case 'chrome-upload':
      return <ChromeUploadDemo />
    case 'neo-switch':
      return (
        <div className="cp-demo-column">
          {cairn.switches.map((label, i) => (
            <NeoSwitch key={label} label={label} defaultChecked={i !== 1} />
          ))}
        </div>
      )
    case 'flap-checkbox':
      return (
        <div className="cp-demo-column">
          {cairn.checks.map((label, i) => (
            <FlapCheckbox key={label} label={label} defaultChecked={i === 0} />
          ))}
        </div>
      )
    case 'foil-cards':
      return (
        <div className="cp-demo-wide">
          <FoilCards
            label={cairn.cards.label}
            options={cairn.cards.options}
            defaultValue={cairn.cards.value}
          />
        </div>
      )
    case 'flap-segments':
      return (
        <FlapSegments
          label={cairn.segments.label}
          options={cairn.segments.options}
          defaultValue={cairn.segments.value}
        />
      )
    case 'waveform-slider':
      return <WaveformSlider label={cairn.slider} defaultValue={40} />
    case 'comet-field':
      return (
        <div className="cp-demo-field">
          <CometField
            label={cairn.field.label}
            type="email"
            placeholder={cairn.field.placeholder}
            autoComplete="off"
          />
        </div>
      )
    case 'lens-search':
      return (
        <div className="cp-demo-search">
          <LensSearch
            label={cairn.search}
            placeholder={cairn.search}
            limit={5}
            items={workbench.items.map((item) => ({
              label: item.name,
              hint: item.kind === 'cairn' ? workbench.labels.cairn : workbench.labels.site,
            }))}
          />
        </div>
      )
    case 'code-input':
      return <CodeInputDemo label={cairn.code.label} code={cairn.code.value} />
    case 'ballpoint-button':
      return <BallpointReplay {...cairn.ballpoint} />
    case 'record-stack':
      return <RecordStack label={cairn.records.label} records={records} />
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
    case 'key':
      return <KeyLink label={demo.key} href={here} />
    case 'scramble-button':
      return (
        <div className="cp-demo-row">
          <ScrambleButton label={menu.action.label} href={here} />
          <ScrambleButton label={menu.action.label} href={here} tone="ink" />
        </div>
      )
    case 'pixel-mark':
      return (
        <PixelMark
          mark={site.mark}
          word={demo.pixel}
          label={site.name}
          href={here}
          className="cp-demo-pixel"
        />
      )
    default:
      return null
  }
}
