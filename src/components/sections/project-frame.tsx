import Image from 'next/image'
import type { ProjectMeta } from '@/types/content'
import './work.css'

export type Composition = 'wide' | 'image-right' | 'image-left'

/*
 * One project, one frame. The data-work-* attributes are the only contract
 * with the animation island; with JavaScript off this is a complete, readable
 * composition. Three compositions rotate so no two consecutive projects share
 * a geometry (DESIGN.md §5).
 */
export function ProjectFrame({
  project,
  position,
  composition,
}: {
  project: ProjectMeta
  position: number
  composition: Composition
}) {
  const index = String(position + 1).padStart(2, '0')
  const id = `work-${project.slug}`
  const wide = composition === 'wide'

  const figure = (
    <figure
      data-work-figure
      className={
        wide
          ? 'relative aspect-wide md:aspect-auto md:min-h-0 md:flex-1'
          : `relative col-span-4 aspect-wide md:col-span-8 md:row-start-1 md:aspect-auto md:min-h-0 ${composition === 'image-right' ? 'md:col-start-5' : 'md:col-start-1'}`
      }
    >
      <div data-work-image className="absolute inset-0 bg-surface-2 p-3 md:p-4">
        <div className="relative size-full overflow-hidden border border-rule-strong">
          <div data-work-zoom className="absolute inset-0">
            <div data-work-parallax className="work-parallax absolute inset-x-0">
              <Image
                src={project.cover.image}
                alt={project.cover.alt}
                fill
                placeholder="blur"
                sizes={wide ? '(min-width: 768px) 92vw, 100vw' : '(min-width: 768px) 62vw, 100vw'}
                className={`object-cover ${project.cover.focus === 'left' ? 'object-left' : 'object-center'}`}
              />
            </div>
          </div>
        </div>
      </div>
    </figure>
  )

  const title = (
    <h3
      id={id}
      data-work-reveal
      className={`font-display wrap-break-word text-fg ${wide ? 'text-3xl md:text-display' : 'text-3xl'}`}
    >
      {project.title}
    </h3>
  )

  const detail = (
    <>
      <p
        data-work-reveal
        className="max-w-measure font-text text-base wrap-break-word text-fg-muted"
      >
        {project.summary}
      </p>
      <ul
        aria-label={`${project.title}: built with`}
        data-work-reveal
        className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-label text-sm font-medium text-fg-muted"
      >
        {project.stack.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </>
  )

  return (
    <li data-work-frame>
      <article
        aria-labelledby={id}

        className="flex flex-col gap-6 pt-8 pb-8 md:section-screen md:pt-10 md:pb-10"
      >
        <div
          data-work-reveal
          className="flex items-baseline justify-between gap-4 font-label text-label text-fg-subtle uppercase"
        >
          <p>
            <span className="font-medium text-accent tabular-nums">{index}</span>
            <span aria-hidden="true"> — </span>
            {project.category}
          </p>
          <p className="tabular-nums">{project.year}</p>
        </div>

        {wide ? (
          <>
            {figure}
            <div className="grid grid-cols-4 items-end gap-x-gutter gap-y-4 md:grid-cols-12">
              <div className="col-span-4 md:col-span-8">{title}</div>
              <div className="col-span-4 md:col-span-4 md:col-start-9">{detail}</div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-4 gap-x-gutter gap-y-6 md:min-h-0 md:flex-1 md:grid-cols-12">
            {figure}
            <div
              className={`col-span-4 flex flex-col justify-between gap-8 md:col-span-4 md:row-start-1 ${composition === 'image-right' ? 'md:col-start-1' : 'md:col-start-9'}`}
            >
              <div>{title}</div>
              <div>{detail}</div>
            </div>
          </div>
        )}
      </article>
    </li>
  )
}
