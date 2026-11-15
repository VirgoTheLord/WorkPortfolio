import Image from 'next/image'
import { BallpointLink } from '@/components/interactive/ballpoint-link'
import { compact } from '@/content/compact'
import { projects } from '@/content/projects'

const { intro } = compact
const [project] = projects
const [job] = compact.experience

/*
 * The opening: one sentence, the page's heading (wlovedaypowell.com's), the
 * greeting in the text colour and the rest a step back. The job and the work
 * ride in it as chips; the work's cover peeks up out of its chip on hover or
 * focus, like a photo pulled from a pocket. Under it, the ways out as small
 * ballpoint chips (Cairn's button, drawn still).
 */
export function CompactLede() {
  return (
    <>
      <h1 className="cp-lede">
        <span className="cp-ink-text">{intro.hello}</span>
        {intro.lede.map((part, i) => {
          if (typeof part === 'string') return part
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
