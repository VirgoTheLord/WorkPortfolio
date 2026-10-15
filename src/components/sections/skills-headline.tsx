import Image from 'next/image'
import type { SkillVisual } from '@/types/content'

/*
 * A Skills page headline in large capitals, one entry per line, with a small
 * screenshot set at the start of one line (the reference's "Craft and / [image]
 * No-code / oriented"). Each line rises out of its own mask (motion/rise.tsx in
 * the page section around it); the screenshot opens with its line. Rendered inside
 * the section's own heading element.
 */
export function SkillsHeadline({
  lines,
  visualLine,
  visual,
}: {
  lines: readonly string[]
  visualLine: number
  visual: SkillVisual
}) {
  return (
    <>
      {lines.map((line, i) => (
        <span key={line} className="skills-headline-line">
          {i === visualLine ? (
            <span data-rise="" data-rise-as="clip" className="skills-headline-visual">
              <Image src={visual.image} alt={visual.alt} sizes="12vw" />
            </span>
          ) : null}
          <span className="skills-headline-mask">
            <span data-rise="" className="block">
              {line}
            </span>
          </span>
        </span>
      ))}
    </>
  )
}
