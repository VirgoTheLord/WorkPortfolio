import Image from 'next/image'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import { KeyLink } from '@/components/ui/key-link'
import { CursorLabel } from '@/components/motion/cursor-label'
import { HeadlineWipe } from '@/components/motion/headline-wipe'
import { WorkStage } from '@/components/motion/work-stage'
import { projects } from '@/content/projects'
import { work } from '@/content/site'
import './work.css'

/*
 * Selected Work, on a dark band. The choreography is recreated from the pinned
 * "Wear it easily, trust it daily" section of numa.uprock.pro (measured in a
 * browser, not guessed): from lg the section is one screen tall per project, a
 * stage stays stuck to the screen for all but the last, and scrolling sweeps one
 * project's cover away and the next one in as a rising curtain, the description
 * and the marker beside the tabs changing with it (motion/work-stage.tsx).
 * Everything is in the HTML in reading order. Below lg, and for reduced motion,
 * nothing is pinned: the projects are a row of cards to swipe. A project links
 * out only when it has an `href`.
 */
export function SelectedWork() {
  const linked = projects.some((project) => project.href)

  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      data-theme="dark"
      className="work scroll-mt-header bg-bg text-fg"
      style={{ '--work-count': projects.length } as CSSProperties}
    >
      <WorkStage>
        <div className="work-track">
          <div className="work-camera">
            <div className="work-grid">
              <div className="work-intro">
                <h2 id="work-heading" className="font-display text-3xl font-normal text-fg">
                  <HeadlineWipe lines={work.headline} />
                </h2>
                <p className="mt-6 text-base text-fg-muted">{work.text}</p>
              </div>

              <nav aria-label={work.thumbsLabel} className="work-tabs">
                <span aria-hidden="true" data-work-marker className="work-marker bg-accent" />
                {projects.map((project, i) => (
                  <a
                    key={project.slug}
                    href={`#work-${project.slug}`}
                    data-work-tab={i}
                    aria-current={i === 0 ? 'true' : undefined}
                    aria-label={`${work.goTo} ${project.title}`}
                    className="work-tab font-label text-sm uppercase"
                  >
                    <span aria-hidden="true" className="text-fg-muted">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {project.title}
                  </a>
                ))}
              </nav>

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
                        {...(mediaProps as { href: string })}
                        data-work-media
                        className="work-media"
                      >
                        <Image
                          src={project.cover.image}
                          alt={project.cover.alt}
                          fill
                          placeholder="blur"
                          sizes="(min-width: 64rem) 65vw, 85vw"
                          className="object-cover object-top"
                        />
                      </Media>

                      <div data-work-caption className="work-caption">
                        <h3 className="work-title">{project.title}</h3>
                        <p className="work-summary text-base text-fg-muted">{project.summary}</p>
                        <p className="work-tags font-label text-label text-fg-muted uppercase">
                          <span>[{project.category}]</span>
                          <span aria-hidden="true">—</span>
                          <span>[{project.year}]</span>
                        </p>
                        <p className="work-stack font-label text-label text-fg-muted uppercase">
                          {project.stack.join(' · ')}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ol>

              <div className="work-cta">
                <KeyLink label={work.action.label} href={work.action.href} size="compact" />
              </div>
            </div>
          </div>
        </div>
      </WorkStage>
      {linked ? <CursorLabel /> : null}
    </section>
  )
}
