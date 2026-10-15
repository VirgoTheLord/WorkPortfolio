import Image from 'next/image'
import type { CSSProperties } from 'react'
import { Rise } from '@/components/motion/rise'
import { SkillsHeadline } from '@/components/sections/skills-headline'
import { ArrowLink } from '@/components/ui/arrow-link'
import { skillsPage } from '@/content/skills'
import './skills-page.css'

/*
 * The heart of the Skills page, from the reference's services: a headline in large
 * capitals, then the groups in the right three quarters of the frame while their
 * label holds at the top of the left quarter (sticky). Each group: its name, a
 * paragraph, its skills in two monospace columns, a link where there is somewhere
 * to go, and beside it a screenshot of this site (or, for the tools, the build's
 * own route table set as text). Below lg it is one column with the visual under
 * the text. Everything rises once as it arrives (motion/rise.tsx).
 */
export function SkillsGroups() {
  const { heading, groups, groupsLabel } = skillsPage
  return (
    <section aria-labelledby="skills-groups" className="skills-groups">
      <Rise>
        <h2 id="skills-groups" className="skills-headline font-display">
          <SkillsHeadline {...heading} />
        </h2>

        <div className="skills-groups-grid">
          <div className="skills-groups-label">
            <div className="skills-headline-mask">
              <p
                data-rise=""
                data-rise-as="label"
                className="font-label text-label text-fg uppercase"
              >
                {groupsLabel}
              </p>
            </div>
          </div>

          <ol className="skills-groups-list">
            {groups.map((group) => (
              <li key={group.name} className="skills-group">
                <div className="skills-group-copy">
                  <div className="skills-headline-mask">
                    <h3 data-rise="" className="skills-group-name font-display text-fg">
                      <span className="sr-only">{group.index} </span>
                      {group.name}
                    </h3>
                  </div>
                  <p data-rise="" data-rise-as="fade" className="skills-lead text-fg">
                    {group.text}
                  </p>
                  <ul aria-label={`${group.name}: skills`} className="skills-group-skills">
                    {group.skills.map((skill, i) => (
                      <li key={skill} className="skills-headline-mask">
                        <span
                          data-rise=""
                          data-rise-as="label"
                          className="block font-label text-label text-fg uppercase"
                          style={{ '--rise-delay': `${(i % 4) * 60}ms` } as CSSProperties}
                        >
                          {skill}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {group.link ? (
                    <div className="skills-headline-mask">
                      <span data-rise="" data-rise-as="label" className="inline-block">
                        <ArrowLink href={group.link.href}>{group.link.label}</ArrowLink>
                      </span>
                    </div>
                  ) : null}
                </div>

                <div data-rise="" data-rise-as="clip" className="skills-group-visual">
                  {'image' in group.visual ? (
                    <Image
                      src={group.visual.image}
                      alt={group.visual.alt}
                      sizes="(min-width: 64rem) 22vw, 100vw"
                    />
                  ) : (
                    <figure className="skills-build bg-surface-2">
                      <pre className="font-label text-xs text-fg">
                        {group.visual.build.join('\n')}
                      </pre>
                      <figcaption className="sr-only">{group.visual.label}</figcaption>
                    </figure>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Rise>
    </section>
  )
}
