import type { CSSProperties } from 'react'
import { SectionReveal } from '@/components/motion/section-reveal'
import { skills } from '@/content/site'
import './skills.css'

const index = (i: number) => ({ '--i': i }) as CSSProperties

/*
 * A capability index: each row is a capability (large), what it means in
 * practice (middle), and the tools that support it (small, right). Rows reveal
 * one at a time as they scroll into view, so a tall section never finishes
 * its animation off-screen. Same grid as About: labels in the left columns,
 * content from column 4, secondary detail from column 10.
 */
export function Skills() {
  const last = skills.groups.length - 1

  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="mx-auto flex section-screen w-full max-w-content scroll-mt-header flex-col px-margin pb-8 focus:outline-none md:pb-10"
    >
      <SectionReveal as="div">
        <div aria-hidden="true" className="skills-draw h-px bg-rule-strong" style={index(0)} />
        <h2
          id="skills-heading"
          className="skills-mask flex items-center gap-4 pt-4 font-label text-label text-fg-subtle uppercase"
          style={index(1)}
        >
          <span aria-hidden="true" className="h-px w-8 bg-accent-secondary" />
          <span aria-hidden="true" className="font-medium text-accent tabular-nums">
            {skills.index}
          </span>
          <span aria-hidden="true">—</span>
          {skills.label}
        </h2>
      </SectionReveal>

      <ol className="flex flex-1 flex-col pt-8 md:pt-10">
        {skills.groups.map((group, i) => (
          <SectionReveal
            key={group.name}
            as="li"
            className="relative grid flex-1 grid-cols-4 content-start items-baseline gap-x-gutter gap-y-3 py-5 md:grid-cols-12 md:gap-y-4 md:py-8"
            style={{ '--row': i } as CSSProperties}
          >
            <span
              aria-hidden="true"
              className="skills-draw absolute inset-x-0 top-0 h-px bg-rule"
              style={index(0)}
            />
            {i === last ? (
              <span
                aria-hidden="true"
                className="skills-draw absolute inset-x-0 bottom-0 h-px bg-rule"
                style={index(3)}
              />
            ) : null}

            <p
              className="skills-mask col-span-1 font-label text-label font-medium text-accent tabular-nums md:col-span-3 md:row-start-1"
              style={index(1)}
            >
              {group.index}
            </p>

            <h3
              className="skills-mask col-span-3 font-display text-2xl wrap-break-word text-fg md:col-span-5 md:col-start-4 md:row-start-1"
              style={index(1)}
            >
              {group.name}
            </h3>
            <p
              className="skills-mask col-span-4 max-w-measure font-text text-base wrap-break-word text-fg-muted md:col-span-5 md:col-start-4 md:row-start-2"
              style={index(2)}
            >
              {group.description}
            </p>

            <ul
              aria-label={`${group.name}: tools and practices`}
              className="skills-mask col-span-4 flex flex-wrap gap-x-5 gap-y-1 font-label text-sm font-medium text-fg-muted md:col-span-3 md:col-start-10 md:row-span-2 md:row-start-1 md:flex-col md:gap-x-0"
              style={index(3)}
            >
              {group.tools.map((tool) => (
                <li key={tool}>{tool}</li>
              ))}
            </ul>
          </SectionReveal>
        ))}
      </ol>
    </section>
  )
}
