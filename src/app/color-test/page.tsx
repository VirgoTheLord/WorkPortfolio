import type { Metadata } from 'next'
import Link from 'next/link'
import { colorTestPage, modes } from '@/content/color-test'
import { PaletteSample } from './palette-sample'

export const metadata: Metadata = {
  title: 'Color test',
  description: 'Color system reference.',
  robots: { index: false, follow: false },
}

export default function ColorTestPage() {
  return (
    <div className="bg-bg text-fg">
      <div className="mx-auto max-w-content px-margin pt-16 pb-12">
        <p className="font-label text-label text-fg-subtle uppercase">{colorTestPage.eyebrow}</p>
        <h1 className="mt-4 font-display text-3xl">{colorTestPage.title}</h1>
        <p className="mt-6 max-w-measure font-text text-base text-fg-muted">{colorTestPage.lede}</p>
        <ol className="mt-8 flex flex-wrap gap-x-8 gap-y-2 font-label text-label">
          {colorTestPage.index.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
        <p className="mt-8">
          <Link href="/" className="font-label text-label underline underline-offset-4">
            {colorTestPage.home}
          </Link>
        </p>
      </div>
      {modes.map((mode) => (
        <PaletteSample key={mode.id} mode={mode} />
      ))}
    </div>
  )
}
