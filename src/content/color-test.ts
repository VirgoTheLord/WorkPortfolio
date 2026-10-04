/**
 * Copy and reference data for /color-test, the permanent visual reference for
 * the green color system. The page renders with the production tokens
 * (src/app/globals.css) through data-theme scopes, so what you see is the real
 * system. The hex values below only label swatches and feed the contrast table:
 * they mirror globals.css and must be updated with it.
 */

export const colorTestPage = {
  eyebrow: 'Color reference',
  title: 'The green system, light and dark',
  lede: 'Four exact greens on pure white, and the same palette in its own dark composition. Both specimens render with the production tokens, so this page is the reference to check against while building. Development only; not indexed.',
  index: ['01 GREEN / LIGHT', '02 GREEN / DARK'],
  home: 'Home',
} as const

/** Specimen copy, kept local so the reference never depends on page content. */
export const specimen = {
  name: 'Alwin Aby Mathew',
  nav: ['About', 'Skills', 'Selected Work', 'Contact'],
  year: '2026',
  eyebrow: 'Selected work',
  statement: ['I build digital work with an eye', 'for detail.'],
  role: 'Software engineer',
  index: '01 / 03',
  heading: 'I make interfaces where engineering and visual craft meet.',
  body: 'Most of my attention goes to the front end: typography, interaction and performance, built with as few moving parts as the work allows.',
  details: [
    ['Focus', 'Frontend engineering'],
    ['Interests', 'Interaction, visual craft'],
    ['Approach', 'Performance and accessibility first'],
  ],
  band: 'Selected work',
} as const

export const brand = [
  { hex: '#5C7057', name: 'Primary green', token: 'green-deep' },
  { hex: '#89A482', name: 'Secondary green', token: 'green-mid' },
  { hex: '#ACC5A6', name: 'Soft green', token: 'green-soft' },
  { hex: '#D1EDD3', name: 'Light green', token: 'green-light' },
] as const

export type Mode = {
  id: string
  label: string
  title: string
  theme: 'light' | 'dark'
  note: string
  modeColors: readonly { name: string; hex: string }[]
  /** Semantic tokens as rendered in this mode. */
  tokens: readonly { token: string; hex: string; role: string }[]
  /** Static class sets for the few jobs that differ per mode. */
  cls: {
    chip: string
    band2: string
    fx: string
  }
  limits: readonly string[]
}

export const modes = [
  {
    id: '01',
    label: '01 — GREEN / LIGHT',
    title: 'Green / Light',
    theme: 'light',
    note: 'Pure white is the page. The primary green does all the reading and the strong fields; the lighter greens give the page its volume as mats, bands and marks.',
    modeColors: [{ name: 'Canvas', hex: '#FFFFFF' }],
    tokens: [
      { token: 'bg', hex: '#FFFFFF', role: 'Page background' },
      { token: 'fg', hex: '#5C7057', role: 'Primary text' },
      { token: 'fg-muted', hex: '#5C7057', role: 'Secondary text' },
      { token: 'fg-subtle', hex: '#5C7057', role: 'Metadata and labels' },
      { token: 'surface', hex: '#D1EDD3', role: 'Mats and plates' },
      { token: 'surface-2', hex: '#ACC5A6', role: 'Second surface' },
      { token: 'rule', hex: '#ACC5A6', role: 'Hairlines' },
      { token: 'rule-strong', hex: '#89A482', role: 'Emphasized rules' },
      { token: 'accent', hex: '#5C7057', role: 'Identity, fields, links' },
      { token: 'accent-secondary', hex: '#89A482', role: 'Marks and graphics' },
      { token: 'accent-fg', hex: '#FFFFFF', role: 'Text on accent' },
      { token: 'focus', hex: '#5C7057', role: 'Focus ring' },
    ],
    cls: {
      chip: 'bg-accent text-accent-fg',
      band2: 'bg-surface text-fg',
      fx: 'bg-surface-2',
    },
    limits: [
      'Only the primary green reads on white (5.4:1), so text, links and the focus ring share it; hierarchy comes from size and weight, and link state from underline weight.',
      'The secondary and soft greens (2.7:1 and 1.9:1) are graphics and fields only, never text.',
      'On the light green the primary green reaches 4.3:1: large text only.',
    ],
  },
  {
    id: '02',
    label: '02 — GREEN / DARK',
    title: 'Green / Dark',
    theme: 'dark',
    note: 'The same greens in a deep green-black room. Roles reverse: the lightest greens carry the text, the secondary green is the strong field, and the primary green drops to hairlines and panels.',
    modeColors: [
      { name: 'Mode surface', hex: '#0D130E' },
      { name: 'Mode surface, raised', hex: '#161E17' },
    ],
    tokens: [
      { token: 'bg', hex: '#0D130E', role: 'Page background (mode surface)' },
      { token: 'fg', hex: '#D1EDD3', role: 'Primary text' },
      { token: 'fg-muted', hex: '#ACC5A6', role: 'Secondary text' },
      { token: 'fg-subtle', hex: '#89A482', role: 'Metadata and labels' },
      { token: 'surface', hex: '#161E17', role: 'Mats and plates (raised)' },
      { token: 'surface-2', hex: '#161E17', role: 'Second surface (raised)' },
      { token: 'rule', hex: '#5C7057', role: 'Hairlines' },
      { token: 'rule-strong', hex: '#89A482', role: 'Emphasized rules' },
      { token: 'accent', hex: '#89A482', role: 'Identity, fields, links' },
      { token: 'accent-secondary', hex: '#ACC5A6', role: 'Marks and graphics' },
      { token: 'accent-fg', hex: '#0D130E', role: 'Text on accent' },
      { token: 'focus', hex: '#D1EDD3', role: 'Focus ring' },
    ],
    cls: {
      chip: 'bg-green-deep text-white',
      band2: 'bg-green-deep text-green-light',
      fx: 'bg-green-deep',
    },
    limits: [
      'The primary green is only 3.5:1 on the surface: hairlines, panels and graphics, never small text.',
      'Light text on the primary green is 4.3:1 (light green, large text) or 5.4:1 (white, small labels).',
      'The secondary green carries dark text as a field (6.9:1) and works as small text on the surface.',
    ],
  },
] as const satisfies readonly Mode[]
