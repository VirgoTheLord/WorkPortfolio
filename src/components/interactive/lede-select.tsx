'use client'

import { useState } from 'react'
import type { CompactContent } from '@/types/content'

type Props = { children: string; restyle: CompactContent['intro']['restyle'] }

type Face = Props['restyle']['faces'][number]['id']
type Ink = Props['restyle']['inks'][number]['id']

/*
 * "one thing well" in the opening sentence (owner's pick; shwn.design's idea,
 * made the site's own): the words shown selected as in an editor, in red, with
 * a small toolbar under them that sets them in another of the site's faces
 * (Bricolage, Caveat, Kristi, Mono) or ink. Real buttons, each saying whether
 * it is on. The words read as words.
 */
export function LedeSelect({ children, restyle }: Props) {
  const [face, setFace] = useState<Face>('display')
  const [ink, setInk] = useState<Ink>('ink')

  return (
    <span className="cp-select" data-face={face} data-ink={ink}>
      {children}
      <span role="toolbar" aria-label={restyle.label} className="cp-select-bar">
        {restyle.faces.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={face === option.id}
            onClick={() => setFace(option.id)}
            className="cp-select-face"
          >
            {option.label}
          </button>
        ))}
        {restyle.inks.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-label={option.label}
            aria-pressed={ink === option.id}
            onClick={() => setInk(option.id)}
            className="cp-select-ink"
            data-ink={option.id}
          />
        ))}
      </span>
    </span>
  )
}
