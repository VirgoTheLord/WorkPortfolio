import { Rise } from '@/components/motion/rise'
import { SkillsTools } from '@/components/sections/skills-tools'
import { skillsPage } from '@/content/skills'
import './skills-page.css'

/*
 * The Skills page's intro, from the reference's: a monospace line on the left, the
 * statement in the right column, then the row of tool marks rising one by one
 * once it is well up the screen (about 30% in, as measured).
 */
export function SkillsIntro() {
  const { intro, tools } = skillsPage
  return (
    <section aria-labelledby="skills-intro" className="skills-intro">
      <Rise>
        <div className="skills-intro-grid">
          <div className="skills-headline-mask">
            <h2
              id="skills-intro"
              data-rise=""
              data-rise-as="label"
              className="font-label text-label text-fg uppercase"
            >
              {intro.label}
            </h2>
          </div>
          <p data-rise="" data-rise-as="fade" className="skills-lead text-fg">
            {intro.text}
          </p>
        </div>
      </Rise>
      <Rise at={0.3}>
        <SkillsTools {...tools} />
      </Rise>
    </section>
  )
}
