import Link from 'next/link'
import { Icon } from '@/components/ui/icon'
import { compact } from '@/content/compact'
import { workbench } from '@/content/workbench'
import { CompactSection } from './compact-section'
import { WorkbenchList } from './workbench-list'
import { RollText } from '@/components/ui/roll-text'

/*
 * The workbench: the small pieces the site is built from. Each opens its own
 * page where it runs live (app/(compact)/compact/components).
 */
export function CompactWorkbench() {
  return (
    <CompactSection id="workbench" meta={`${workbench.items.length} pieces`}>
      <p className="cp-note">{compact.workbench.note}</p>
      <WorkbenchList />
      <p className="cp-more">
        <Link href="/compact/components" className="cp-chip">
          <Icon name="box" className="size-3.5" />
          <RollText>{compact.workbench.open}</RollText>
          <Icon name="arrow" className="cp-nudge size-3" />
        </Link>
      </p>
    </CompactSection>
  )
}
