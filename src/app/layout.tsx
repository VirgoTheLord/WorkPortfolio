import type { Metadata } from 'next'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { SmoothScroll } from '@/components/motion/smooth-scroll'
import { fontVariables } from '@/lib/fonts'
import './globals.css'

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Software engineering portfolio.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={fontVariables || undefined} suppressHydrationWarning>
      <head>
        {/* Adds .js (scripting is on; ARCHITECTURE.md §6). The colour mode follows the
            system (prefers-color-scheme) and nothing overrides it: the stored choice
            an earlier light/dark switch saved is cleared, so no visitor stays locked
            to the mode they once picked. On the home page it also
            marks the intro as playing before first paint, so the overlay
            covers the hero from the start. Skipped for reduced motion, for deep
            links (a hash), and for every route but the home page. If the intro
            island has not picked it up within 4s (scripts failed or are very
            slow), the page is released in its final state. It also picks what the
            preloader's ring does while it counts, for the comparison
            (?ring=comet or sweep; dial otherwise); remove with the losing ones. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var d=document.documentElement;d.classList.add('js');try{localStorage.removeItem('theme')}catch(e){}if(location.pathname==='/'&&!location.hash&&!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('is-intro');var r=new URLSearchParams(location.search).get('ring');d.dataset.ring=r==='comet'||r==='sweep'?r:'dial';history.scrollRestoration='manual';setTimeout(function(){if(!d.classList.contains('intro-live'))d.classList.remove('is-intro')},4000)}}catch(e){}",
          }}
        />
      </head>
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
        <SmoothScroll />
      </body>
    </html>
  )
}
