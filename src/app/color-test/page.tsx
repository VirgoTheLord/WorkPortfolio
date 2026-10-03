import type { Metadata } from 'next'
import Link from 'next/link'
import { colorTestPage } from '@/content/color-test'
import { ColorSpecimen } from './color-specimen'

export const metadata: Metadata = {
  title: 'Color test',
  description: 'Production color specimen.',
  robots: { index: false, follow: false },
}

export default function ColorTestPage() {
  return (
    <div className="mx-auto max-w-content px-margin pt-16 pb-section-y">
      <p className="font-label text-label text-fg-subtle uppercase">{colorTestPage.eyebrow}</p>
      <h1 className="mt-4 font-display text-3xl text-fg">{colorTestPage.title}</h1>
      <p className="mt-6 max-w-measure font-text text-base text-fg-muted">{colorTestPage.lede}</p>
      <p className="mt-8">
        <Link href="/" className="font-label text-label text-fg underline underline-offset-4">
          {colorTestPage.home}
        </Link>
      </p>
      <ColorSpecimen />
    </div>
  )
}
