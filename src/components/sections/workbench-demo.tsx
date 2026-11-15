import Image from 'next/image'
import { ChromeUploadDemo } from '@/components/interactive/chrome-upload-demo'
import { FlapSegments } from '@/components/library/cairn/flap-segments'
import { FoilCards } from '@/components/library/cairn/foil-cards'
import { RecordStack } from '@/components/library/cairn/record-stack'
import { WaveformSlider } from '@/components/library/cairn/waveform-slider'
import { workbench } from '@/content/workbench'

const { cairn } = workbench.demo

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
 * site's own files, with props like Cairn's own stage. Nothing is a picture of
 * a component.
 */
export function WorkbenchDemo({ slug }: { slug: string }) {
  switch (slug) {
    case 'chrome-upload':
      return <ChromeUploadDemo />
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
    case 'record-stack':
      return <RecordStack label={cairn.records.label} records={records} />
    default:
      return null
  }
}
