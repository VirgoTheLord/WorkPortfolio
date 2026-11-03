import { Rise } from '@/components/motion/rise'
import { SkillsRows } from '@/components/motion/skills-rows'
import { skills } from '@/content/skills'
import { SkillLogo } from '@/components/sections/skill-logo'
import './skills.css'

/*
 * Skills, recreated from the reference's services list (studionamma.com): the
 * label, then the skills as one centred stack of large capitals.
 *
 * With a fine pointer, from lg (skills.css): hovering a row dims the others, shows
 * its detail beside it and opens the tool's mark on a brand panel at the
 * frame's left edge. On screens without hover the row passing the top of the screen is the one
 * at full strength (motion/skills-rows.tsx). Each row rises out of its mask as it
 * arrives (motion/rise.tsx). The detail is real text either way; the mark is
 * decoration (the row's name says the same).
 */
export function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-heading" className="skills scroll-mt-header">
      <Rise>
        {/* No visible title (owner's choice): the list speaks for itself, and the
            heading stays for assistive technology and the section's name. */}
        <h2 id="skills-heading" className="sr-only">
          {skills.label}
        </h2>

        <SkillsRows>
          <ul data-skills-rows className="skills-rows">
            {skills.rows.map((row) => (
              <li key={row.name} data-skills-row className="skills-row">
                <span className="skills-row-word">
                  <span className="skills-mask">
                    <span data-rise="" className="skills-row-name font-display">
                      {row.name}
                    </span>
                  </span>
                  <span className="skills-row-detail font-label text-label uppercase">
                    <span className="sr-only">: </span>
                    {row.detail}
                  </span>
                </span>
                <span aria-hidden="true" data-theme="brand" className="skills-row-visual">
                  {row.logos.map((logo) => (
                    <SkillLogo key={logo} name={logo} className="skills-row-logo" />
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </SkillsRows>
      </Rise>
    </section>
  )
}
