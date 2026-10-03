import type { Metadata } from 'next'
import Link from 'next/link'
import { typeTestPage } from '@/content/type-test'
import { TypeSpecimen } from './type-specimen'

export const metadata: Metadata = {
  title: 'Type test',
  description: 'Production type specimen.',
  robots: { index: false, follow: false },
}

export default function TypeTestPage() {
  return (
    <div className="mx-auto max-w-content px-margin pt-16 pb-section-y">
      <p className="font-label text-label text-fg-subtle uppercase">{typeTestPage.eyebrow}</p>
      <h1 className="mt-4 font-display text-3xl text-fg">{typeTestPage.title}</h1>
      <p className="mt-6 max-w-measure font-text text-base text-fg-muted">{typeTestPage.lede}</p>
      <p className="mt-8">
        <Link href="/" className="font-label text-label text-fg underline underline-offset-4">
          {typeTestPage.home}
        </Link>
      </p>
      <TypeSpecimen />
    </div>
  )
}
