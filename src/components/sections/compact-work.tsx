import Image from 'next/image'
import { compact } from '@/content/compact'
import { projects } from '@/content/projects'
import { CompactBlock } from './compact-block'

const { soon } = compact.work

/*
 * The work as plain rows (chloemaillot.fr's): the name, what it is, the year
 * and a small thumbnail that grows and tilts on hover while the year makes
 * room. What is not out yet follows as rows of its own, saying so, with no
 * names made up for it.
 */
export function CompactWork() {
  return (
    <CompactBlock id="work">
      <ul className="cp-list">
        {projects.map((project) => (
          <li key={project.slug}>
            <a
              href={project.href ?? `/#work-${project.slug}`}
              className="cp-line"
              {...(project.href ? { target: '_blank', rel: 'noreferrer' } : {})}
            >
              <span>{project.title}</span>
              <span className="cp-line-note">{project.category}</span>
              <span className="cp-meta">{project.year}</span>
              <span className="cp-thumb">
                <Image src={project.cover.image} alt={project.cover.alt} sizes="6rem" />
              </span>
            </a>
          </li>
        ))}
        {soon.items.map((name) => (
          <li key={name} className="cp-line cp-line-soon">
            <span>{name}</span>
            <span className="cp-line-note">{soon.note}</span>
            <span className="cp-meta">
              <span aria-hidden="true" className="cp-pulse" />
              {soon.state}
            </span>
            <span aria-hidden="true" className="cp-thumb cp-thumb-empty" />
          </li>
        ))}
      </ul>
    </CompactBlock>
  )
}
