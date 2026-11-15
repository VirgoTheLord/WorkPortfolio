import Link from 'next/link'
import { Icon } from '@/components/ui/icon'
import { workbench } from '@/content/workbench'
import type { WorkbenchItem } from '@/types/content'
import { FlapText } from '@/components/ui/flap-text'

/*
 * The workbench pieces as a grid of cells, two to a row from 36rem: number,
 * name, one line, and where it comes from. Each whole cell is the link to the
 * piece's own page (the name's link, stretched), where it runs live; on hover
 * its name flips over letter by letter (ui/flap-text.tsx).
 */
const kinds = {
  cairn: workbench.labels.cairn,
  site: workbench.labels.site,
  library: workbench.labels.library,
}

/* Each name is a heading one level under the section it sits in: h3 under the
   compact home's "Components" h2, h2 straight under the index page's h1. */
export function WorkbenchList({
  items = workbench.items,
  heading: Heading = 'h3',
}: {
  items?: readonly WorkbenchItem[]
  heading?: 'h2' | 'h3'
}) {
  return (
    <ul className="cp-bench">
      {items.map((item, index) => (
        <li key={item.slug} className="cp-bench-item">
          <p aria-hidden="true" className="cp-bench-number font-label">
            {String(index + 1).padStart(2, '0')}
          </p>
          <Heading className="cp-bench-name">
            <Link href={`/compact/components/${item.slug}`} className="cp-bench-link">
              <FlapText>{item.name}</FlapText>
            </Link>
            <Icon name="arrow" className="cp-nudge size-3" />
          </Heading>
          <p className="cp-bench-note">{item.note}</p>
          <p className="cp-bench-kind font-label">{kinds[item.kind]}</p>
        </li>
      ))}
    </ul>
  )
}
