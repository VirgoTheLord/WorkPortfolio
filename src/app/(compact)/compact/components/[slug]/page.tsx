import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Icon } from '@/components/ui/icon'
import { WorkbenchDemo } from '@/components/sections/workbench-demo'
import { compact } from '@/content/compact'
import { site } from '@/content/site'
import { repository, workbench } from '@/content/workbench'
import { RollText } from '@/components/ui/roll-text'

const { items, labels } = workbench

export const dynamicParams = false

export function generateStaticParams() {
  return items.map((item) => ({ slug: item.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<'/compact/components/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const item = items.find((entry) => entry.slug === slug)
  if (!item) return {}
  const title = `${item.name} · ${workbench.meta.title}`
  return {
    title,
    description: item.note,
    openGraph: { title: `${title} — ${site.name}`, description: item.note },
  }
}

/*
 * One workbench piece (DESIGN.md §5b): where it sits, its name and one line,
 * then the stage, a dotted mat with the real component running on it and a
 * hint for what to do with it; how it behaves, what moves it, its source in
 * the repository and where it is on the full site; then the pieces either side.
 */
export default async function WorkbenchPiece({ params }: PageProps<'/compact/components/[slug]'>) {
  const { slug } = await params
  const index = items.findIndex((entry) => entry.slug === slug)
  const item = items[index]
  if (!item) notFound()
  const prev = items[(index - 1 + items.length) % items.length] ?? item
  const next = items[(index + 1) % items.length] ?? item

  return (
    <article className="cp-piece">
      <nav aria-label={labels.crumb} className="cp-crumbs font-label">
        <ol>
          <li>
            <Link href="/compact">
              <RollText>{compact.ui.home}</RollText>
            </Link>
          </li>
          <li>
            <Link href="/compact/components">
              <RollText>{workbench.title}</RollText>
            </Link>
          </li>
          <li aria-current="page">{item.name}</li>
        </ol>
      </nav>

      <header className="cp-piece-head">
        <p className="cp-piece-kind font-label">
          <span aria-hidden="true" className="cp-square" />
          {labels[item.kind]}
          <span className="text-fg-muted">
            {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
          </span>
        </p>
        <h1 className="cp-piece-title">{item.name}</h1>
        <p className="cp-piece-note">{item.note}</p>
      </header>

      <section
        id="stage"
        tabIndex={-1}
        aria-label={`${item.name}, ${labels.stage}`}
        className="cp-stage"
      >
        <p aria-hidden="true" className="cp-stage-badge font-label">
          <span className="cp-stage-dot" />
          {labels.stage}
        </p>
        <div className="cp-stage-floor">
          <WorkbenchDemo slug={item.slug} />
        </div>
        <p className="cp-stage-hint font-label">{item.hint}</p>
      </section>

      <section aria-labelledby="behaviour-heading" className="cp-section">
        <div className="cp-head">
          <h2 id="behaviour-heading" className="cp-head-title">
            {labels.behaviour}
          </h2>
          <span aria-hidden="true" className="cp-head-rule" />
        </div>
        <ol className="cp-steps">
          {item.details.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
        <dl className="cp-rows cp-piece-facts">
          <div className="cp-row">
            <dt className="cp-row-label font-label">{labels.tech}</dt>
            <dd className="cp-row-body">
              <ul className="cp-stack">
                {item.tech.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>
            </dd>
          </div>
          <div className="cp-row">
            <dt className="cp-row-label font-label">{labels.source}</dt>
            <dd className="cp-row-body">
              <a
                href={`${repository}${item.source}`}
                target="_blank"
                rel="noreferrer"
                className="cp-piece-link font-label"
              >
                <Icon name="github" className="size-3.5 shrink-0" />
                {item.source.replace('src/components/', '')}
                <Icon name="arrow" className="cp-nudge size-3" />
              </a>
            </dd>
          </div>
          <div className="cp-row">
            <dt className="cp-row-label font-label">
              {item.kind === 'cairn' ? labels.docs : labels.where}
            </dt>
            <dd className="cp-row-body">
              {item.live ? (
                <Link href={item.live.href} className="cp-piece-link">
                  <RollText>{item.live.label}</RollText>
                  <Icon name="arrow" className="cp-nudge size-3" />
                </Link>
              ) : (
                <span className="text-fg-muted">{labels.kept}</span>
              )}
            </dd>
          </div>
        </dl>
      </section>

      <nav aria-label={workbench.title} className="cp-pager">
        <Link href={`/compact/components/${prev.slug}`} className="cp-pager-link">
          <span className="cp-pager-label font-label">← {labels.prev}</span>
          <RollText>{prev.name}</RollText>
        </Link>
        <Link href="/compact/components" className="cp-pager-all font-label">
          <RollText>{labels.all}</RollText>
        </Link>
        <Link href={`/compact/components/${next.slug}`} className="cp-pager-link cp-pager-next">
          <span className="cp-pager-label font-label">{labels.next} →</span>
          <RollText>{next.name}</RollText>
        </Link>
      </nav>
    </article>
  )
}
