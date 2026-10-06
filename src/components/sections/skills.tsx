import { HeadlineWipe } from '@/components/motion/headline-wipe'
import { SkillsSteps } from '@/components/motion/skills-steps'
import { skills } from '@/content/site'
import './skills.css'

/*
 * Skills, recreated from the reference's process section: a headline with the
 * section label beside it, then the three groups as numbered steps, each with a
 * panel of the tools behind it (standing in for the reference's photographs).
 *
 * From lg, with motion allowed and scripting on, the section is pinned for a few
 * screens of scroll and one step is current at a time; the island
 * (motion/skills-steps.tsx) picks it from the scroll position and moves the
 * marker and the panel strip to it. Otherwise it is a plain list, each step
 * followed by its panel. Every step and panel is in the HTML and readable either
 * way; the first step is current from the start.
 */
export function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-heading" className="skills scroll-mt-header">
      <SkillsSteps>
        <div className="skills-sticky">
          <div className="skills-frame">
            <div className="skills-head">
              <h2 id="skills-heading" className="font-display text-3xl font-normal text-fg">
                <HeadlineWipe lines={[skills.headline]} />
              </h2>
              <p className="font-label text-base tracking-wide text-fg uppercase">
                <span aria-hidden="true" className="text-accent">
                  {'// '}
                </span>
                {skills.label}
              </p>
            </div>

            <div className="skills-body">
              <div className="skills-list">
                <span aria-hidden="true" data-skills-marker className="skills-marker bg-accent" />
                <ol className="skills-steps">
                  {skills.groups.map((group, i) => (
                    <li
                      key={group.name}
                      data-skills-step={i}
                      data-current={i === 0 ? '' : undefined}
                      className="skills-step"
                    >
                      <span className="skills-step-mark">
                        <span aria-hidden="true" className="skills-step-square bg-accent" />
                        <span className="font-label text-sm text-fg-muted tabular-nums">
                          {group.index}
                        </span>
                      </span>
                      <div className="skills-step-copy">
                        <h3 className="font-display text-xl text-fg">{group.name}</h3>
                        <p className="mt-2 text-base text-fg-muted">{group.description}</p>
                      </div>
                      <SkillsPanel name={group.name} index={group.index} tools={group.tools} />
                    </li>
                  ))}
                </ol>
              </div>

              {/* Pinned only: one panel per step in a strip that slides to the current
                  one. The list carries each panel too, for assistive tech. */}
              <div aria-hidden="true" className="skills-window">
                <div className="skills-strip">
                  {skills.groups.map((group) => (
                    <SkillsPanel
                      key={group.name}
                      name={group.name}
                      index={group.index}
                      tools={group.tools}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SkillsSteps>
    </section>
  )
}

/* The tools behind one group. */
function SkillsPanel({
  name,
  index,
  tools,
}: {
  name: string
  index: string
  tools: readonly string[]
}) {
  return (
    <div className="skills-panel bg-surface-2">
      <p className="font-label text-label text-fg uppercase">
        <span className="tabular-nums">{index}</span> — {name}
      </p>
      <ul aria-label={`${name}: tools and practices`} className="font-display text-2xl text-fg">
        {tools.map((tool) => (
          <li key={tool}>{tool}</li>
        ))}
      </ul>
    </div>
  )
}
