import { WorkIndex } from '@/components/interactive/work-index'
import { compact } from '@/content/compact'
import { projects } from '@/content/projects'

/*
 * The compact site's work: the same projects as the full site, as an index
 * (interactive/work-index.tsx). It lists however many `content/projects` holds.
 */
export function CompactWork() {
  return (
    <section aria-labelledby="compact-work" className="compact-section">
      <h2 id="compact-work" className="compact-section-label font-label text-label uppercase">
        {compact.work.label}
      </h2>
      <WorkIndex projects={projects} />
    </section>
  )
}
