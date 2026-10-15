import Image from 'next/image'
import { Rise } from '@/components/motion/rise'
import { SkillsHeadline } from '@/components/sections/skills-headline'
import { FrameButton } from '@/components/library/frame-button'
import { ArrowLink } from '@/components/ui/arrow-link'
import { skillsPage } from '@/content/skills'
import './skills-page.css'

/*
 * The Skills page's ending, from the reference's: where it quotes a client, this
 * page states something checkable instead (the skills above are the ones this
 * site is built with) under a screenshot of the site, with a link to the work.
 * Then the call to action: a large two-line headline with a screenshot set into
 * its second line, and a short line and link to the contact section beside it.
 * The site's footer follows.
 */
export function SkillsClosing() {
  const { closing, cta } = skillsPage
  return (
    <>
      <section aria-labelledby="skills-closing" className="skills-closing">
        <Rise>
          <div className="skills-headline-mask skills-closing-label">
            <p
              data-rise=""
              data-rise-as="label"
              className="font-label text-label text-fg uppercase"
            >
              {closing.label}
            </p>
          </div>
          <div data-rise="" data-rise-as="clip" className="skills-closing-visual">
            <Image
              src={closing.visual.image}
              alt={closing.visual.alt}
              sizes="(min-width: 64rem) 20vw, 60vw"
            />
          </div>
          <h2 id="skills-closing" className="skills-statement font-display">
            {closing.statement.map((line) => (
              <span key={line} className="skills-headline-mask">
                <span data-rise="" className="block">
                  {line}
                </span>
              </span>
            ))}
          </h2>
          <div className="skills-headline-mask skills-closing-link">
            <span data-rise="" data-rise-as="label" className="inline-block">
              <ArrowLink href={closing.link.href}>{closing.link.label}</ArrowLink>
            </span>
          </div>
        </Rise>
      </section>

      <section aria-labelledby="skills-cta" className="skills-cta">
        <Rise>
          <h2 id="skills-cta" className="skills-headline font-display">
            <SkillsHeadline lines={cta.lines} visualLine={cta.visualLine} visual={cta.visual} />
          </h2>
          <div className="skills-cta-copy">
            <p data-rise="" data-rise-as="fade" className="skills-lead text-fg">
              {cta.text.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
            <div className="skills-headline-mask">
              <span data-rise="" data-rise-as="label" className="inline-block">
                <FrameButton
                  label={cta.link.label}
                  href={cta.link.href}
                  data-cursor-tag={cta.link.tag}
                />
              </span>
            </div>
          </div>
        </Rise>
      </section>
    </>
  )
}
