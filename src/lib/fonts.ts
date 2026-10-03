/*
 * Local font registry (ARCHITECTURE.md §1, DESIGN.md §4 Typography).
 *
 * Once typography is decided (DESIGN.md §9.1), add one `next/font/local`
 * instance per role with its woff2 files in src/fonts/, e.g.
 *
 *   const text = localFont({
 *     src: '../fonts/text-variable.woff2',
 *     variable: '--font-text-face',
 *     display: 'swap',
 *   })
 *
 * Each instance sets a --font-<role>-face variable that globals.css maps to the
 * display / text / label roles. Preload only the primary face.
 */
type FontVariable = { variable: string }

const fonts: FontVariable[] = []

export const fontVariables = fonts.map((font) => font.variable).join(' ')
