import Image from 'next/image'
import { Rise } from '@/components/motion/rise'
import { SkillsRows } from '@/components/motion/skills-rows'
import { ArrowLink } from '@/components/ui/arrow-link'
import { skills } from '@/content/skills'
import './skills.css'

/*
 * Skills, recreated from the reference's services list (studionamma.com): the
 * label, then the skills as one centred stack of large capitals, then a link to
 * the full page (/skills).
 *
 * With a fine pointer, from lg (skills.css): hovering a row dims the others, shows
 * its detail beside it and opens a screenshot of this site at the frame's left
 * edge. On screens without hover the row passing the top of the screen is the one
 * at full strength (motion/skills-rows.tsx). Each row rises out of its mask as it
 * arrives (motion/rise.tsx). The detail is real text either way; the screenshot
 * is decoration here (the full page carries the same images with their alt text).
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
                <span aria-hidden="true" className="skills-row-visual">
                  <Image src={row.visual.image} alt="" sizes="28vw" />
                </span>
              </li>
            ))}
          </ul>
        </SkillsRows>

        <div className="skills-mask skills-more">
          <span data-rise="" data-rise-as="label" className="inline-block">
            <ArrowLink href={skills.more.href} data-cursor-tag={skills.more.tag}>
              {skills.more.label}
            </ArrowLink>
          </span>
        </div>
      </Rise>
    </section>
  )
}
