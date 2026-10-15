import type { CSSProperties } from 'react'
import { skillsPage } from '@/content/skills'
import './skills-page.css'

/*
 * The Skills page's first screen, from the reference's: the headline alone, in
 * large capitals, centred in the screen, its lines rising out of their masks on
 * load one after another (CSS only, skills-page.css, so it needs no script and
 * is still for reduced motion), and the scroll cue at the bottom edge.
 */
export function SkillsHero() {
  return (
    <section aria-labelledby="skills-title" className="skills-hero">
      <h1 id="skills-title" className="skills-hero-title font-display">
        {skillsPage.title.map((line, i) => (
          <span key={line} className="skills-headline-mask">
            <span className="skills-hero-line" style={{ '--line': i } as CSSProperties}>
              {line}
            </span>
          </span>
        ))}
      </h1>
      <p aria-hidden="true" className="skills-hero-cue font-label text-label text-fg uppercase">
        [ {skillsPage.scrollCue} ]
      </p>
    </section>
  )
}
