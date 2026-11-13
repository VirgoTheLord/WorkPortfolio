import type { CSSProperties } from 'react'
import { HeadlineWipe } from '@/components/motion/headline-wipe'
import { SkillsDrum } from '@/components/motion/skills-drum'
import { skills } from '@/content/skills'
import { SkillLogo } from '@/components/sections/skill-logo'
import './skills.css'

/*
 * Skills, as a drum (owner's pick from two rounds of previews): the skills sit on
 * the faces of a cylinder that turns with the scroll, one face square to the
 * reader at a time, in the accent, with its level. The section holds the drum on
 * screen while the page scrolls through it (motion/skills-drum.tsx).
 *
 * The title rides above the drum, in the Selected Work headline's style. The
 * server renders a plain list, and the island only stands it up as a drum:
 * without JavaScript, or with reduced motion, it is that list, name, marks and
 * level on each line.
 */
export function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-heading" className="skills scroll-mt-header">
      <SkillsDrum count={skills.rows.length}>
        {/* The title stays with the drum while it turns: it is in the pinned
            stage, above it, wiped in as the headlines elsewhere are. */}
        <h2 id="skills-heading" className="skills-heading font-display">
          <HeadlineWipe lines={[skills.label]} />
        </h2>
        <ul data-skills-ring className="skills-ring">
          {skills.rows.map((row, i) => (
            <li
              key={row.name}
              data-skills-face
              className="skills-face"
              style={{ '--i': i } as CSSProperties}
            >
              <span className="skills-face-name font-display">
                <span aria-hidden="true" className="skills-face-marks">
                  {row.logos.map((logo) => (
                    <SkillLogo key={logo} name={logo} className="skills-face-mark" />
                  ))}
                </span>
                {row.name}
              </span>
              <span className="skills-face-level font-label text-label uppercase">
                <span className="sr-only">: </span>
                {row.detail}
              </span>
            </li>
          ))}
        </ul>
      </SkillsDrum>
    </section>
  )
}
