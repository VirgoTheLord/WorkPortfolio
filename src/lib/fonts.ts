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

/* The preloader's counter (motion/hero-intro.tsx): Archivo, its Expanded
   instance (width 125) at weight 600 (SIL OFL), cut down to the ten digits
   (2.5 KB), the only glyphs the counter draws; the intro is aria-hidden, so the
   digits are never read as text. Preloaded, and `block` so the count never shows
   in a fallback face first; the intro waits for fonts before it measures the
   zero it contracts onto. */
const archivoExpanded = localFont({
  src: '../fonts/archivo-expanded-digits.woff2',
  variable: '--font-count-face',
  weight: '600',
  display: 'block',
  adjustFontFallback: false,
  fallback: ['sans-serif'],
})

/* The hero name's face: Archivo again, its Expanded instance (width 125) at
   weight 900 (Black), the preloader counter's family, so the loader's 100 and the
   name share one voice. Cut down to the capitals A–Z (2.5 KB WOFF2): the name is
   set in capitals (hero.css). Preloaded, because it is the first thing on the
   home page. SIL OFL 1.1, src/fonts/licenses/OFL-archivo.txt. */
const archivoExpandedBlack = localFont({
  src: '../fonts/archivo-expanded-black-caps.woff2',
  variable: '--font-hero-face',
  weight: '900',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['Arial Black', 'sans-serif'],
})

/* The hand: the note in the menu that points to the compact site
   (layout/site-nav.tsx), a pen's note in the margin. Caveat (SIL OFL 1.1,
   src/fonts/licenses/OFL-caveat.txt), its weight-600 instance cut down to
   lowercase and a little punctuation (14 KB), all the note uses. Not preloaded:
   it is only seen once the menu opens. */
const caveat = localFont({
  src: '../fonts/caveat-note.woff2',
  variable: '--font-hand-face',
  weight: '600',
  display: 'swap',
  adjustFontFallback: false,
  preload: false,
  fallback: ['cursive'],
})

/* The signed name: the owner's name at the foot of the compact site, in a
   quick pen hand. Kristi (SIL OFL 1.1, src/fonts/licenses/OFL-kristi.txt), cut
   down to the alphabet and a little punctuation (12 KB). Not preloaded: it is
   only seen at the foot of the page. */
const kristi = localFont({
  src: '../fonts/kristi-name.woff2',
  variable: '--font-sign-face',
  weight: '400',
  display: 'swap',
  adjustFontFallback: false,
  preload: false,
  fallback: ['cursive'],
})

export const fontVariables = [
  bricolageGrotesque.variable,
  azeretMono.variable,
  deutschGothic.variable,
  archivoExpanded.variable,
  archivoExpandedBlack.variable,
  caveat.variable,
  kristi.variable,
].join(' ')
