'use client'

import { useState } from 'react'
import { BallpointButton } from '@/components/library/cairn/ballpoint-button'

/*
 * The ballpoint button on the workbench stage, with a second one under it,
 * small and still like the site's chips, that plays the first's intro again
 * (Cairn's `replay` counter). Both are the real component.
 */
export function BallpointReplay({ label, replay }: { label: string; replay: string }) {
  const [take, setTake] = useState(0)

  return (
    <div className="cp-demo-stack">
      <BallpointButton label={label} replay={take} />
      <BallpointButton
        label={replay}
        intro={false}
        onClick={() => setTake((n) => n + 1)}
        className="cp-ink cp-demo-replay"
      />
    </div>
  )
}
