import type { Metadata } from 'next'
import { CompactAlive } from '@/components/sections/compact-alive'
import { CompactExperience } from '@/components/sections/compact-experience'
import { CompactLede } from '@/components/sections/compact-lede'
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
 * The compact site's home: the portfolio in short (owner's direction, November
 * 2026, after chloemaillot.fr, wlovedaypowell.com and nachi.design): one
 * sentence, then the work, the pieces, the experience and the stack as plain
 * rows, and what brings him alive. The frame is layout.tsx.
 */
export default function CompactPage() {
  return (
    <>
      <CompactLede />
      <CompactWork />
      <CompactWorkbench />
      <CompactExperience />
      <CompactStack />
      <CompactAlive />
    </>
  )
}
