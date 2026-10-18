import { CompactLead } from '@/components/interactive/compact-lead'
import { compact } from '@/content/compact'
import { site } from '@/content/site'

/*
 * The compact site's opening: the name, set modestly, and one paragraph of facts
 * in which four words answer hover, focus and tap, their details shown in a
 * readout under it (CompactLead). The paragraph reads complete without touching
 * anything.
 */
export function CompactIntro() {
  return (
    <section aria-labelledby="compact-name" className="compact-intro">
      <h1 id="compact-name" className="compact-name font-display">
        {site.name}
      </h1>
      <CompactLead parts={compact.intro} hint={compact.readoutHint} />
    </section>
  )
}
