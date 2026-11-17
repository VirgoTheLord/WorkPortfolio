import Image from 'next/image'
import { BallpointLink } from '@/components/interactive/ballpoint-link'
import { compact } from '@/content/compact'
import { projects } from '@/content/projects'
import { workbench } from '@/content/workbench'
import { CompactBlock } from './compact-block'

const { work } = compact
/* Read by any project's slug (the content lists them by name). */
const roles: Readonly<Record<string, string>> = work.roles

/*
 * The work, the page's centre (owner's call after the review): each project
 * with a large screenshot, what it is, what he did and when, the line about it
 * and its links. Cairn also opens its pieces running live on the workbench,
 * which used to be a section of its own. No placeholder rows.
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
              <a href={href} tabIndex={-1} aria-hidden="true" className="cp-work-shot" {...away}>
                <Image
                  src={project.cover.image}
                  alt={project.cover.alt}
                  sizes="(min-width: 40rem) 20rem, 92vw"
                />
              </a>
              <div className="cp-work-text">
                <h3 className="cp-work-title">
                  <a href={href} {...away}>
                    {project.title}
                  </a>
                </h3>
                <p className="cp-work-meta">
                  <span>{project.category}</span>
                  <span>{roles[project.slug]}</span>
                  <span>{project.year}</span>
                </p>
                <p className="cp-work-note">{project.summary}</p>
                <p className="cp-work-links">
                  <BallpointLink
                    label={project.href ? new URL(project.href).host : work.visit}
                    href={href}
                  />
                  {project.slug === 'cairn' ? (
                    <BallpointLink
                      label={`${workbench.items.length} ${work.pieces}`}
                      href="/compact/components"
                    />
                  ) : null}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </CompactBlock>
  )
}
