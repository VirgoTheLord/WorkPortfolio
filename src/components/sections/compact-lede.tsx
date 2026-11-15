import Image from 'next/image'
import { BallpointLink } from '@/components/interactive/ballpoint-link'
import { LedeLight } from '@/components/interactive/lede-light'
import { LedeSelect } from '@/components/interactive/lede-select'
import { LedeTiles } from '@/components/interactive/lede-tiles'
import { compact } from '@/content/compact'
import { projects } from '@/content/projects'
import type { LedePart } from '@/types/content'

const { intro } = compact
/* Read as the declared parts, so each kind narrows on its own key. */
const lede: readonly LedePart[] = intro.lede
const [project] = projects
const [job] = compact.experience

/*
 * The opening: one sentence, the page's heading (wlovedaypowell.com's), the
 * greeting in the text colour and the rest a step back. The job and the work
 * ride in it as chips; the work's cover peeks up out of its chip on hover or
 * focus, like a photo pulled from a pocket. Three bits of it play (owner's
 * picks): "by day" and "by night" put it in that light, "interface pieces" are
 * key caps to pick up, and "one thing well" sits selected with a toolbar to
 * restyle it. Under it, the ways out as small ballpoint chips.
 */
export function CompactLede() {
  return (
    <>
      <h1 className="cp-lede">
        <span className="cp-ink-text">{intro.hello}</span>
        {lede.map((part, i) => {
          if (typeof part === 'string') return part
          if ('light' in part)
            return (
              <LedeLight key={i} light={part.light}>
                {part.text}
              </LedeLight>
            )
          if ('tiles' in part) return <LedeTiles key={i} words={part.tiles} />
          if ('select' in part)
            return (
              <LedeSelect key={i} restyle={intro.restyle}>
                {part.select}
              </LedeSelect>
            )
          if (part.chip === 'job')
            return (
              <a key={i} href="#experience" className="cp-chip">
                <span aria-hidden="true" className="cp-chip-dot" />
                {job?.org}
              </a>
            )
          if (!project) return null
          return (
            <a key={i} href={project.href ?? '#work'} className="cp-chip cp-chip-work">
              <span aria-hidden="true" className="cp-chip-mark">
                {project.title[0]}
              </span>
              {project.title}
              <span aria-hidden="true" className="cp-peek">
                <Image src={project.cover.image} alt="" sizes="13rem" />
              </span>
            </a>
          )
        })}
      </h1>
      <p className="cp-reach">
        {intro.reach.map((part) =>
          typeof part === 'string' ? (
            part
          ) : (
            <BallpointLink key={part.href} label={part.label} href={part.href} />
          ),
        )}
      </p>
    </>
  )
}
