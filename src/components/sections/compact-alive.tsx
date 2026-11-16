import { PolaroidStrip } from '@/components/interactive/polaroid-strip'
import { compact } from '@/content/compact'
import { CompactBlock } from './compact-block'

const { alive } = compact

/*
 * Stuff that brings me alive: the one odd, colourful thing on the page (owner's
 * call), what he loves doing as a strip of instant photos that develop in the
 * middle and turn over for a note.
 */
export function CompactAlive() {
  return (
    <CompactBlock id="alive" aside={alive.hint}>
      <PolaroidStrip {...alive} />
    </CompactBlock>
  )
}
