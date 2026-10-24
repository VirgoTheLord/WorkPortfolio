import type { Metadata } from 'next'
import { SectionIndex } from '@/components/interactive/section-index'
import { CompactAbout } from '@/components/sections/compact-about'
import { CompactContact } from '@/components/sections/compact-contact'
import { CompactExperience } from '@/components/sections/compact-experience'
import { CompactIntro } from '@/components/sections/compact-intro'
import { CompactStack } from '@/components/sections/compact-stack'
import { CompactWork } from '@/components/sections/compact-work'
import { CompactWorkbench } from '@/components/sections/compact-workbench'
import { compact } from '@/content/compact'

export const metadata: Metadata = {
  title: { absolute: compact.meta.title },
  description: compact.meta.description,
  openGraph: { title: compact.meta.title, description: compact.meta.description },
}

/*
 * The compact site's home: the portfolio in short, with the section index in
 * the left margin and the work's preview in the right one when there is room.
 * The frame is layout.tsx.
 */
export default function CompactPage() {
  return (
    <>
      <CompactIntro />
      <CompactWork />
      <CompactWorkbench />
      <CompactExperience />
      <CompactStack />
      <CompactAbout />
      <CompactContact />
      <SectionIndex label={compact.ui.index} items={compact.sections} />
    </>
  )
}
