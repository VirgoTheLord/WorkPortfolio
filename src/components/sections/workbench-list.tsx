import Link from 'next/link'
import { Icon } from '@/components/ui/icon'
import { workbench } from '@/content/workbench'
import { RollText } from '@/components/ui/roll-text'

/*
 * The workbench pieces as a grid of cells, two to a row from 36rem: number,
 * name, one line, and whether it is on the site or kept for the library. Each
 * whole cell is the link to the piece's own page (the name's link, stretched),
 * where it runs live.
 */
export function WorkbenchList() {
  return (
    <ul className="cp-bench">
      {workbench.items.map((item, index) => (
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
          <p className="cp-bench-kind font-label">
            {item.kind === 'library' ? workbench.labels.library : workbench.labels.site}
          </p>
        </li>
      ))}
    </ul>
  )
}
