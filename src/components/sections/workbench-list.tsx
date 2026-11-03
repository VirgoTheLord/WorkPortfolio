import Link from 'next/link'
import { Icon } from '@/components/ui/icon'
import { workbench } from '@/content/workbench'
import type { WorkbenchItem } from '@/types/content'
import { RollText } from '@/components/ui/roll-text'

/*
 * The workbench pieces as a grid of cells, two to a row from 36rem: number,
 * name, one line, and where it comes from (Cairn, the site, or kept). Each
 * whole cell is the link to the piece's own page (the name's link, stretched),
 * where it runs live.
 */
const kinds = {
  cairn: workbench.labels.cairn,
  site: workbench.labels.site,
  library: workbench.labels.library,
}

export function WorkbenchList({ items = workbench.items }: { items?: readonly WorkbenchItem[] }) {
  return (
    <ul className="cp-bench">
      {items.map((item, index) => (
        <li key={item.slug} className="cp-bench-item">
          <p aria-hidden="true" className="cp-bench-number font-label">
            {String(index + 1).padStart(2, '0')}
          </p>
          <h3 className="cp-bench-name">
            <Link href={`/compact/components/${item.slug}`} className="cp-bench-link">
              <RollText>{item.name}</RollText>
            </Link>
            <Icon name="arrow" className="cp-nudge size-3" />
          </h3>
          <p className="cp-bench-note">{item.note}</p>
          <p className="cp-bench-kind font-label">{kinds[item.kind]}</p>
        </li>
      ))}
    </ul>
  )
}
