import localFont from 'next/font/local'

/*
 * Production faces (DESIGN.md §9.1). Display and text are one family;
 * globals.css maps both roles to --font-text-face. Preload only that face.
 * Licenses: src/fonts/licenses.
 */

const bricolageGrotesque = localFont({
  src: '../fonts/bricolage-grotesque.woff2',
  variable: '--font-text-face',
  weight: '400 600',
  display: 'swap',
  adjustFontFallback: 'Arial',
  fallback: ['Arial', 'sans-serif'],
})

const azeretMono = localFont({
  src: '../fonts/azeret-mono.woff2',
  variable: '--font-label-face',
  weight: '400 500',
  display: 'swap',
  adjustFontFallback: false,
  preload: false,
  fallback: ['ui-monospace', 'monospace'],
})

/* The logo's face. Served as the original TTF: its licence allows distribution
   only unaltered (src/fonts/licenses/DEUTSCH.TXT), so it is not converted or
   subset. Preloaded, because the mark is in the navbar on every page. */
const deutschGothic = localFont({
  src: '../fonts/deutsch-gothic.ttf',
  variable: '--font-mark-face',
  weight: '400',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['serif'],
})

export const fontVariables = [
  bricolageGrotesque.variable,
  azeretMono.variable,
  deutschGothic.variable,
].join(' ')
