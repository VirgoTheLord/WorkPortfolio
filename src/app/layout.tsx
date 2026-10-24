import type { Metadata } from 'next'
import { about, site } from '@/content/site'
import { themeScript } from '@/lib/compact-theme'
import { fontVariables } from '@/lib/fonts'
import './globals.css'

/* Every page's title ends with the owner's name; a page sets only its own part
   ("Skills — Alwin Aby Mathew"). The icon is app/icon.png (the AW mark). */
const description = `${site.role}. ${about.statement}`

export const metadata: Metadata = {
  title: { default: site.name, template: `%s — ${site.name}` },
  description,
  applicationName: site.name,
  authors: [{ name: site.name }],
  creator: site.name,
  openGraph: {
    type: 'website',
    siteName: site.name,
    title: site.name,
    description,
    locale: 'en_IN',
  },
  twitter: { card: 'summary', title: site.name, description },
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
            links (a hash) and for every route but the home page. Once this tab
            has seen it (sessionStorage 'intro-seen', set by hero-intro.tsx) a
            reload marks .is-enter instead: the hero's entrance alone, no
            preloader, with the same starting states before first paint. If the intro
            island has not picked it up within 4s (scripts failed or are very
            slow), the page is released in its final state. On the compact site only,
            a light or dark mode the visitor chose there is put back
            (lib/compact-theme.ts). */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var d=document.documentElement;d.classList.add('js');try{localStorage.removeItem('theme')}catch(e){}var seen=false;try{seen=sessionStorage.getItem('intro-seen')==='1'}catch(e){}if(location.pathname==='/'&&!location.hash&&!matchMedia('(prefers-reduced-motion: reduce)').matches){if(seen){d.classList.add('is-enter')}else{d.classList.add('is-intro');history.scrollRestoration='manual'}setTimeout(function(){if(!d.classList.contains('intro-live'))d.classList.remove('is-intro','is-enter')},4000)}}catch(e){}" +
              themeScript,
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
        {/* Each route group brings its own frame and its own <main id="main">:
            (full) the navbar, footer and pointer effects; (compact) none of them. */}
        {children}
      </body>
    </html>
  )
}
