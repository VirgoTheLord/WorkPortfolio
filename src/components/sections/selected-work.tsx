import Image from 'next/image'
import Link from 'next/link'
import { WorkTogetherButton } from '@/components/interactive/work-together-button'
import { ScrambleText } from '@/components/layout/scramble-text'
import { CursorLabel } from '@/components/motion/cursor-label'
import { HeadlineWipe } from '@/components/motion/headline-wipe'
import { WorkStage } from '@/components/motion/work-stage'
import { projects } from '@/content/projects'
import { work } from '@/content/site'
import './work.css'

/*
 * Selected Work, recreated from the reference's work section, on a dark band.
 * From lg a left column stays pinned to the screen (headline, line of copy, one
 * thumbnail per project with a square beside the current one, the action) while
 * the projects scroll past on its right: a 16:10 image whose picture drifts inside
 * its frame, then a title and tags. Below lg it is a single column. Everything is
 * in the HTML; the island (motion/work-stage.tsx) only tracks the current project
 * and runs the scrambles. A project links out only when it has an `href`.
 */
export function SelectedWork() {
  const linked = projects.some((project) => project.href)

  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      data-theme="dark"
      className="work scroll-mt-header bg-bg text-fg"
    >
      <WorkStage>
        <div className="work-grid">
          <div className="work-side">
            <div className="work-intro">
              <h2 id="work-heading" className="font-display text-3xl font-normal text-fg">
                <HeadlineWipe lines={work.headline} />
              </h2>
              <p className="mt-6 text-base text-fg-muted">{work.text}</p>
            </div>

            <nav aria-label={work.thumbsLabel} className="work-thumbs">
              <span aria-hidden="true" data-work-marker className="work-marker bg-accent" />
              {projects.map((project, i) => (
                <a
                  key={project.slug}
                  href={`#work-${project.slug}`}
                  data-work-thumb={i}
                  data-active={i === 0 ? '' : undefined}
                  aria-label={`${work.goTo} ${project.title}`}
                  aria-current={i === 0 ? 'true' : undefined}
                  className="work-thumb"
                >
                  <Image
                    src={project.cover.image}
                    alt=""
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                </a>
              ))}
            </nav>

            <div className="work-cta">
              <WorkTogetherButton label={work.action.label} href={work.action.href} tone="accent" />
            </div>
          </div>

          <ol className="work-list">
            {projects.map((project) => {
              const Media = project.href ? Link : 'div'
              const mediaProps = project.href
                ? { href: project.href, 'data-cursor-text': 'View project' }
                : {}
              return (
                <li
                  key={project.slug}
                  id={`work-${project.slug}`}
                  data-work-project
                  className="work-project"
                >
                  <Media
                    // The pointer scrambles the title the way the reference's does.
                    {...(mediaProps as { href: string })}
                    data-work-media
                    className="work-media"
                  >
                    <div className="work-drift">
                      <div className="work-zoom">
                        <Image
                          src={project.cover.image}
                          alt={project.cover.alt}
                          fill
                          placeholder="blur"
                          sizes="(min-width: 64rem) 85vw, 100vw"
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </Media>

                  <div className="work-caption">
                    <h3 className="work-title">
                      <ScrambleText text={project.title} />
                    </h3>
                    <p className="work-tags font-label text-label text-fg-muted uppercase">
                      <span>[{project.category}]</span>
                      <span aria-hidden="true">—</span>
                      <span>[{project.year}]</span>
                    </p>
                  </div>
                  <p className="sr-only">{project.summary}</p>
                </li>
              )
            })}
          </ol>
        </div>
      </WorkStage>
      {linked ? <CursorLabel /> : null}
    </section>
  )
}
