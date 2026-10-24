import type { Metadata } from 'next'
import Link from 'next/link'
import { WorkbenchList } from '@/components/sections/workbench-list'
import { compact } from '@/content/compact'
import { site } from '@/content/site'
import { workbench } from '@/content/workbench'
import { RollText } from '@/components/ui/roll-text'

export const metadata: Metadata = {
  title: workbench.meta.title,
  description: workbench.meta.description,
  openGraph: {
    title: `${workbench.meta.title} — ${site.name}`,
    description: workbench.meta.description,
  },
}

/* The workbench: every piece the site is built from, each to its own page. */
export default function WorkbenchPage() {
  return (
    <article className="cp-piece">
      <nav aria-label={workbench.labels.crumb} className="cp-crumbs font-label">
        <ol>
          <li>
            <Link href="/compact">
              <RollText>{compact.ui.home}</RollText>
            </Link>
          </li>
          <li aria-current="page">{workbench.title}</li>
        </ol>
      </nav>
      <header className="cp-piece-head">
        <h1 className="cp-piece-title">{workbench.title}</h1>
        <p className="cp-piece-note">{workbench.note}</p>
      </header>
      <WorkbenchList />
    </article>
  )
}
