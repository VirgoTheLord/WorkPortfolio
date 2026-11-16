import Link from 'next/link'
import { FlapText } from '@/components/ui/flap-text'
import { compact } from '@/content/compact'
import { workbench } from '@/content/workbench'
import { CompactBlock } from './compact-block'

/*
 * Components: the workbench's five pieces from Cairn (the owner's picks, a
 * preview), each opening its own page where it runs live
 * (app/(compact)/compact/components); the rest are a link away in Cairn.
 */
export function CompactWorkbench() {
  return (
    <CompactBlock
      id="workbench"
      aside={
        <a
          href={compact.workbench.all.href}
          target="_blank"
          rel="noreferrer"
          className="cp-flap-link"
        >
          <FlapText>{compact.workbench.all.label}</FlapText>
        </a>
      }
    >
      <ul className="cp-list cp-list-band">
        {workbench.items.map((item) => (
          <li key={item.slug}>
            <Link href={`/compact/components/${item.slug}`} className="cp-line cp-line-wide">
              <span>{item.name}</span>
              <span className="cp-line-note">{item.line}</span>
            </Link>
          </li>
        ))}
      </ul>
    </CompactBlock>
  )
}
