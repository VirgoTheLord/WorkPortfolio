import { WorkMotion } from '@/components/motion/work-motion'
import { ProjectFrame } from '@/components/sections/project-frame'
import type { Composition } from '@/components/sections/project-frame'
import { projects } from '@/content/projects'
import { work } from '@/content/site'

const compositions: readonly Composition[] = ['wide', 'image-right', 'image-left']

/*
 * Selected Work is the deliberate exception to the one-screen-per-section
 * rhythm: it is the storytelling section, so each project gets its own
 * viewport-sized frame in normal document flow. Server-rendered and complete on
 * its own; WorkMotion only adds a gentle entrance and a small image drift.
 */
export function SelectedWork() {
  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="mx-auto w-full max-w-content scroll-mt-header px-margin focus:outline-none"
    >
      <WorkMotion>
        <div>
          <div aria-hidden="true" data-work-rule className="h-px bg-rule-strong" />
          <h2
            id="work-heading"
            data-work-label
            className="flex items-center gap-4 pt-4 font-label text-label text-fg-subtle uppercase"
          >
            <span aria-hidden="true" className="h-px w-8 bg-accent-secondary" />
            <span aria-hidden="true" className="font-medium text-accent tabular-nums">
              {work.index}
            </span>
            <span aria-hidden="true">—</span>
            {work.label}
          </h2>
        </div>

        <ol>
          {projects.map((project, i) => (
            <ProjectFrame
              key={project.slug}
              project={project}
              position={i}
              composition={compositions[i % compositions.length] ?? 'wide'}
            />
          ))}
        </ol>
      </WorkMotion>
    </section>
  )
}
