import Image from 'next/image'
import Link from 'next/link'
import { Icon } from '@/components/ui/icon'
import { compact } from '@/content/compact'
import { projects } from '@/content/projects'
import { workbench } from '@/content/workbench'
import { CompactBlock } from './compact-block'

const { work } = compact
/* Read by any project's slug (the content lists them by name). */
const roles: Readonly<Record<string, string>> = work.roles

/*
 * The work, the page's centre (owner's call after the review): each project
 * is a folder (owner's pick of four cards), its name on the tab, the width of
 * the section. Inside lies its screenshot as a sheet, tucked in; pointed at or
 * tabbed into, the sheet slides up out of the folder. On the folder's face:
 * what it is, what he did and when, the line about it and its links (Cairn
 * also opens its pieces running live on the workbench). No placeholder rows.
 */
export function CompactWork() {
  return (
    <CompactBlock id="work">
      <ul className="cp-work">
        {projects.map((project) => {
          const href = project.href ?? `/#work-${project.slug}`
          const away = project.href ? { target: '_blank', rel: 'noreferrer' } : {}
          return (
            <li key={project.slug} className="cp-work-item">
              <h3 className="cp-work-tab">
                <a href={href} {...away}>
                  {project.title}
                </a>
              </h3>
              <div className="cp-work-folder">
                <a href={href} tabIndex={-1} aria-hidden="true" className="cp-work-sheet" {...away}>
                  <Image
                    src={project.cover.image}
                    alt={project.cover.alt}
                    sizes="(min-width: 40rem) 18rem, 92vw"
                  />
                </a>
                <span aria-hidden="true" className="cp-work-lip" />
                <div className="cp-work-text">
                  <p className="cp-work-meta">
                    <span>{project.category}</span>
                    <span>{roles[project.slug]}</span>
                    <span>{project.year}</span>
                  </p>
                  <p className="cp-work-note">{project.summary}</p>
                  <p className="cp-work-links">
                    <a href={href} className="cp-work-link" {...away}>
                      {project.href ? new URL(project.href).host : work.visit}
                      <Icon name="arrow" className="cp-nudge size-3" />
                    </a>
                    {project.slug === 'cairn' ? (
                      <Link href="/compact/components" className="cp-work-link">
                        {workbench.items.length} {work.pieces}
                        <Icon name="arrow" className="cp-nudge size-3" />
                      </Link>
                    ) : null}
                  </p>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </CompactBlock>
  )
}
