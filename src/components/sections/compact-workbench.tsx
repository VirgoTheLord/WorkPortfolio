import Link from 'next/link'
import { compact } from '@/content/compact'
import { workbench } from '@/content/workbench'
import { CompactBlock } from './compact-block'

const cairn = workbench.items.filter((item) => item.kind === 'cairn')
const featured = compact.workbench.featured
  .map((slug) => cairn.find((item) => item.slug === slug))
  .filter((item) => item !== undefined)

/*
 * Components: five of Cairn's pieces (the owner's picks), each opening its
 * own page where it runs live (app/(compact)/compact/components); the rest are
 * a link away in Cairn's own docs.
 */
export function CompactWorkbench() {
  return (
    <CompactBlock
      id="workbench"
      aside={
        <a href={compact.workbench.all.href} target="_blank" rel="noreferrer" className="cp-link">
          {compact.workbench.all.label(cairn.length)}
        </a>
      }
    >
      <ul className="cp-list">
        {featured.map((item) => (
          <li key={item.slug}>
            <Link href={`/compact/components/${item.slug}`} className="cp-line cp-line-wide">
              <span>{item.name}</span>
              <span className="cp-line-note">{item.note}</span>
            </Link>
          </li>
        ))}
      </ul>
    </CompactBlock>
  )
}
