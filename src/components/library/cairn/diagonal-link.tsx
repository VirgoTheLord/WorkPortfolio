import type { ComponentProps, CSSProperties } from 'react'
import './diagonal-link.css'

type DiagonalLinkProps = Omit<ComponentProps<'a'>, 'children'> & {
  label: string
}

/*
 * A link whose letters roll up out of their line on hover or focus while an
 * accent copy rolls in from below, each letter a beat after the last, so the
 * change runs across the word on a diagonal (diagonal-link.css). Leaving runs
 * it back. The label is its accessible name; both rolling copies are
 * decoration. Pure CSS: it was a GSAP timeline per link, and needs none.
 */
export function DiagonalLink({ label, className = '', ...props }: DiagonalLinkProps) {
  return (
    <a {...props} className={`wui-diagonal-link ${className}`}>
      <span className="wui-sr-only">{label}</span>
      <span aria-hidden="true" className="wui-diagonal-link-letters">
        {Array.from(label).map((char, i) => (
          <span key={i} className="wui-diagonal-link-char" style={{ '--i': i } as CSSProperties}>
            <span>{char}</span>
            <span>{char}</span>
          </span>
        ))}
      </span>
    </a>
  )
}
