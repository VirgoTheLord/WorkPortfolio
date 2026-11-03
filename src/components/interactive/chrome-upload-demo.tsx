'use client'

import { ChromeUpload } from '@/components/library/cairn/chrome-upload'

/*
 * The workbench stage's upload (Cairn's own stage does the same): no picker and
 * no network. A made-up file goes up in uneven steps, so every state shows with
 * one click.
 */
const select = async () => new File([new Uint8Array(16)], 'brief.pdf', { type: 'application/pdf' })

const upload = (_file: File, progress: (fraction: number) => void) =>
  new Promise<void>((resolve) => {
    let done = 0
    const tick = () => {
      done = Math.min(1, done + 0.04 + Math.random() * 0.12)
      progress(done)
      if (done < 1) window.setTimeout(tick, 170 + Math.random() * 300)
      else resolve()
    }
    window.setTimeout(tick, 250)
  })

export function ChromeUploadDemo() {
  return <ChromeUpload chrome="accent" select={select} upload={upload} />
}
