import { BallpointLink } from '@/components/interactive/ballpoint-link'
import { compact } from '@/content/compact'
import { workbench } from '@/content/workbench'
import { CompactSection } from './compact-section'
import { WorkbenchList } from './workbench-list'

/*
 * The workbench, in short: Cairn's premium pieces, each opening its own page
 * where it runs live (app/(compact)/compact/components); the link under them
 * goes to all of it, the site's own pieces too.
 */
const cairn = workbench.items.filter((item) => item.kind === 'cairn')

export function CompactWorkbench() {
  return (
    <CompactSection id="workbench" meta={`${cairn.length} pieces`}>
      <p className="cp-note">{compact.workbench.note}</p>
      <WorkbenchList items={cairn} />
      <p className="cp-more">
        <BallpointLink label={compact.workbench.open} href="/compact/components" />
      </p>
    </CompactSection>
  )
}
