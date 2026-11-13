import type { CSSProperties } from 'react'
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
 * The server renders a plain list, and the island only stands it up as a drum:
 * without JavaScript, or with reduced motion, it is that list, name, marks and
 * level on each line.
 */
export function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-heading" className="skills scroll-mt-header">
      {/* No visible title (owner's choice): the list speaks for itself, and the
          heading stays for assistive technology and the section's name. */}
      <h2 id="skills-heading" className="sr-only">
        {skills.label}
      </h2>

      <SkillsDrum count={skills.rows.length}>
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
