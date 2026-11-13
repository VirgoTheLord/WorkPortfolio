import type { CSSProperties } from 'react'
import { SkillsSwipe } from '@/components/interactive/skills-swipe'
import { HeadlineWipe } from '@/components/motion/headline-wipe'
import { SkillsDrum } from '@/components/motion/skills-drum'
import { skills } from '@/content/skills'
import { SkillLogo } from '@/components/sections/skill-logo'
import './skills.css'

const pad = (n: number) => String(n).padStart(2, '0')
/* A level as lights out of three, for the phone's cards. */
const lights: Record<string, number> = { Expert: 3, Intermediate: 2 }

/*
 * Skills, two ways (owner's picks from rounds of previews), one shown at a
 * time (skills.css):
 *   - from md, a drum: the skills on the faces of a cylinder turned by the
 *     scroll, the accent flowing to the face in front, the title standing on
 *     its side in a rail at the drum's left with the count (motion/skills-drum.tsx).
 *   - on a phone, a swipe carousel: one large card per skill, snapping one at a
 *     time, the next peeking in, marks under it (interactive/skills-swipe.tsx).
 * The one heading names the section for assistive tech; the hidden layout is
 * display: none, so only the one on screen is read.
 */
export function Skills() {
  const title = skills.headline.join(' ')
  const count = skills.rows.length

  return (
    <section id="skills" aria-labelledby="skills-heading" className="skills scroll-mt-header">
      <h2 id="skills-heading" className="sr-only">
        {title}
      </h2>

      <SkillsDrum count={count}>
        {/* The rail: the title on its side and the count at its foot (the
            island keeps the count on the face in front). */}
        <p aria-hidden="true" className="skills-rail font-display">
          <span>{title}</span>
          <span data-skills-count className="skills-rail-count font-label text-label">
            {pad(1)}/{pad(count)}
          </span>
        </p>
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

      <div className="skills-swipe">
        <p aria-hidden="true" className="skills-swipe-title font-display">
          <HeadlineWipe lines={skills.headline} />
        </p>
        <p aria-hidden="true" className="skills-swipe-hint font-label text-label uppercase">
          {skills.swipeHint}
        </p>
        <SkillsSwipe count={count}>
          {/* The row scrolls sideways; as a named region it can take focus and
              be scrolled from the keyboard too, and the list keeps its role. */}
          <div
            data-skills-rail
            role="region"
            tabIndex={0}
            // Named apart from the section (also a region) so the two are told apart.
            aria-label={`${title}, ${skills.swipeHint.toLowerCase()}`}
            className="skills-cards"
          >
            <ul className="skills-cards-list">
              {skills.rows.map((row, i) => (
                <li key={row.name} className="skills-card" data-tone={i % 3}>
                  <span aria-hidden="true" className="skills-card-marks">
                    {row.logos.map((logo) => (
                      <SkillLogo key={logo} name={logo} className="skills-card-mark" />
                    ))}
                  </span>
                  <span aria-hidden="true" className="skills-card-n font-label text-label">
                    {pad(i + 1)} / {pad(count)}
                  </span>
                  <span className="skills-card-body">
                    <span className="skills-card-name font-display">{row.name}</span>
                    <span className="skills-card-level font-label text-label uppercase">
                      <span className="sr-only">: </span>
                      {row.detail}
                      <span aria-hidden="true" className="skills-card-lights">
                        {[0, 1, 2].map((j) => (
                          <i key={j} data-on={j < (lights[row.detail] ?? 0) || undefined} />
                        ))}
                      </span>
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </SkillsSwipe>
      </div>
    </section>
  )
}
