import Image from 'next/image'
import { WorkPreview } from '@/components/interactive/work-preview'
import { Icon } from '@/components/ui/icon'
import { compact } from '@/content/compact'
import { projects } from '@/content/projects'
import { CompactSection } from './compact-section'
import { RollText } from '@/components/ui/roll-text'

/*
 * Selected work as a numbered index, not cards (DESIGN.md §5b): one row each,
 * the title and its category and year on one line, the summary and stack
 * beneath. The whole row is the link to the project on the full site (the
 * title's link, stretched); a public source is its own link above that, so no
 * link sits inside another. With room and a mouse the cover shows in the right
 * margin (interactive/work-preview.tsx); otherwise each row carries a small
 * thumbnail.
 */
export function CompactWork() {
  return (
    <CompactSection id="work" meta={`${projects.length} projects`}>
      <p className="cp-note">{compact.work.note}</p>
      <WorkPreview
        items={projects.map((project) => ({ slug: project.slug, image: project.cover.image }))}
      >
        <ol className="cp-work-list">
          {projects.map((project, index) => (
            <li key={project.slug} data-slug={project.slug} className="cp-work-row">
              <span aria-hidden="true" className="cp-work-number font-label">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="cp-work-body">
                <div className="cp-work-top">
                  <h3 className="cp-work-title">
                    <a href={project.href ?? `/#work-${project.slug}`} className="cp-work-link">
                      <RollText>{project.title}</RollText>
                      <span className="sr-only">, {compact.work.view}</span>
                    </a>
                    <Icon name="arrow" className="cp-nudge cp-work-arrow size-3.5" />
                  </h3>
                  <p className="cp-work-meta font-label">
                    {project.category}, {project.year}
                  </p>
                </div>
                <p className="cp-work-summary">{project.summary}</p>
                <div className="cp-work-foot">
                  <p className="cp-work-stack font-label">{project.stack.join(' / ')}</p>
                  {project.source ? (
                    <a
                      href={project.source}
                      target="_blank"
                      rel="noreferrer"
                      className="cp-work-source font-label"
                    >
                      <Icon name="github" className="size-3.5" />
                      {compact.work.source}
                    </a>
                  ) : null}
                </div>
              </div>
              <Image
                src={project.cover.image}
                alt={project.cover.alt}
                sizes="8rem"
                className="cp-work-thumb"
              />
            </li>
          ))}
        </ol>
      </WorkPreview>
    </CompactSection>
  )
}
