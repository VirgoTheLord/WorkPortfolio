import type { Metadata } from 'next'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { fontVariables } from '@/lib/fonts'
import './globals.css'

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Software engineering portfolio.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={fontVariables || undefined}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only bg-bg px-4 py-3 text-fg focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50"
        >
          Skip to content
        </a>
        <SiteHeader />
        {/* tabIndex lets the skip link move focus into <main> in every browser; main is
            not interactive, so it gets no focus ring of its own. */}
        <main id="main" tabIndex={-1} className="flex-1 pt-header focus:outline-none">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  )
}
