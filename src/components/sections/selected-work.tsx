import Image from 'next/image'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import { FrameButton } from '@/components/library/frame-button'
import { WorkStack } from '@/components/motion/work-stack'
import { SectionLabel } from '@/components/ui/section-label'
import { projects } from '@/content/projects'
import { work } from '@/content/site'
import './work.css'

const index = (i: number) => String(i + 1).padStart(2, '0')

/* The tab's mark: a three-step stair, drawn on a 16px grid. */
function StairMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="work-tab-mark">
      <path d="M11 1h4v14H1v-4h5V6h5z" />
    </svg>
  )
}

/*
 * Selected Work, recreated from the "Featured Works" section of kushbothra.com
 * (measured in a browser, not guessed): an oversized two-line headline, wiped in
 * line by line as the hero's is, and a small line over it; then one card per project, each a folder with a numbered tab. From lg the cards
 * are all `position: sticky` at the same top, so each one slides up over the one
 * before and comes to rest on it, its tab beside the earlier tabs, and the covered
 * card's text fades as it is covered (motion/work-stack.tsx). Pure CSS stacking:
 * nothing is pinned by script. Below lg, and for reduced motion, the cards are
 * simply in a column. A card is a link only when its project has an `href`.
 */
export function SelectedWork() {
  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="work scroll-mt-header text-fg"
      style={{ '--work-count': projects.length } as CSSProperties}
    >
      <WorkStack>
        <header className="work-head">
          <SectionLabel name={work.label} />
          <h2 id="work-heading" className="work-heading font-display">
            {work.headline.map((line) => (
              <span key={line} className="work-heading-line">
                <span className="work-line">
                  <span data-work-line-text>{line}</span>
                  <span
                    aria-hidden="true"
                    data-work-block="lead"
                    className="work-block bg-accent"
                  />
                  <span aria-hidden="true" data-work-block="trail" className="work-block bg-fg" />
                </span>
              </span>
            ))}
          </h2>
        </header>

        <ol className="work-list" data-work-list>
          {projects.map((project, i) => {
            const Card = project.href ? Link : 'div'
            const cardProps = project.href ? { href: project.href } : {}
            return (
              <li
                key={project.slug}
                id={`work-${project.slug}`}
                className="work-item"
                style={{ '--i': i } as CSSProperties}
              >
                <p className="work-tab font-label uppercase">
                  <span className="work-tab-face">
                    <StairMark />
                    {work.projectLabel} {index(i)}
                  </span>
                </p>

                <article aria-labelledby={`work-${project.slug}-title`} className="work-card">
                  <Card {...(cardProps as { href: string })} className="work-card-inner">
                    <div className="work-text">
                      <div data-work-body className="work-body">
                        <p className="work-date font-label uppercase">
                          <span aria-hidden="true" className="work-dot" />
                          {project.year}
                        </p>
                        <h3 id={`work-${project.slug}-title`} className="work-title font-display">
                          {project.title}
                        </h3>
                        <p className="work-summary">{project.summary}</p>
                        {project.href ? (
                          <span className="work-view font-label uppercase">
                            View project
                            <svg aria-hidden="true" viewBox="0 0 16 16" className="work-view-arrow">
                              <path d="M2 7.25h10.2L8 3.06l1.06-1.06L15.06 8l-6 6L8 12.94l4.2-4.19H2z" />
                            </svg>
                          </span>
                        ) : null}
                      </div>
                      <ul className="work-tags" aria-label="Built with">
                        {project.stack.map((item) => (
                          <li key={item} className="work-tag font-label uppercase">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="work-media">
                      <div className="work-frame">
                        <Image
                          src={project.cover.image}
                          alt={project.cover.alt}
                          fill
                          placeholder="blur"
                          sizes="(min-width: 64rem) 45vw, 90vw"
                          className="object-cover object-top"
                        />
                        <span aria-hidden="true" className="work-hatch" />
                        {/* Always ink on paper: it sits on the screenshot, not the page. */}
                        <span data-theme="light" className="work-badge font-label uppercase">
                          {project.category}
                        </span>
                      </div>
                      <span aria-hidden="true" className="work-handle" data-corner="tl" />
                      <span aria-hidden="true" className="work-handle" data-corner="tr" />
                      <span aria-hidden="true" className="work-handle" data-corner="br" />
                      <span aria-hidden="true" className="work-handle" data-corner="bl" />
                    </div>
                  </Card>
                </article>
              </li>
            )
          })}
        </ol>

        <div className="work-end">
          <FrameButton label={work.action.label} href={work.action.href} />
        </div>
      </WorkStack>
    </section>
  )
}
