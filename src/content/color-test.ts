/**
 * Copy and reference data for /color-test, the permanent visual reference for
 * the orange color system, taken from the good-fella.com reference. The page renders with the production tokens
 * (src/app/globals.css) through data-theme scopes, so what you see is the real
 * system. The hex values below only label swatches and feed the contrast table:
 * they mirror globals.css and must be updated with it.
 */

export const colorTestPage = {
  eyebrow: 'Color reference',
  title: 'Black, white and signature orange',
  lede: 'The exact palette of the good-fella.com reference. Off-white and off-black carry the page and the text, greys carry secondary text, translucent rules carry structure, and orange is the signature accent. Every specimen renders with the production tokens, so this page is the reference to check against while building. Development only; not indexed.',
  index: ['01 LIGHT', '02 DARK', '03 BRAND'],
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

export const palette = [
  {
    hex: '#FB460D',
    name: 'Orange',
    token: 'orange',
    role: 'The signature. Light accent and the brand field. Large text only on white (3.0:1).',
  },
  {
    hex: '#FD551D',
    name: 'Orange bright',
    token: 'orange-bright',
    role: 'The accent on black (5.7:1, text-capable).',
  },
  {
    hex: '#FD8D68',
    name: 'Orange soft',
    token: 'orange-soft',
    role: 'Marks and bars; the surface on a brand field.',
  },
  {
    hex: '#FD7142',
    name: 'Orange muted',
    token: 'orange-muted',
    role: 'Muted background on a brand field.',
  },
  {
    hex: '#141314',
    name: 'Black',
    token: 'black',
    role: 'Dark structure: dark canvas, light text.',
  },
  {
    hex: '#EEEEEE',
    name: 'White',
    token: 'white',
    role: 'Light structure: light canvas, dark text.',
  },
  { hex: '#F7F7F7', name: 'Paper', token: 'paper', role: 'Muted background in light.' },
  { hex: '#D5D5D5', name: 'Stone', token: 'stone', role: 'Surface in light.' },
  { hex: '#696869', name: 'Grey', token: 'grey', role: 'Secondary text in light (4.8:1).' },
  {
    hex: '#818081',
    name: 'Grey light',
    token: 'grey-light',
    role: 'Secondary text in dark (4.7:1).',
  },
  {
    hex: '#1A1A1A',
    name: 'Charcoal',
    token: 'charcoal',
    role: 'Muted background in dark; muted text on orange.',
  },
  { hex: '#333333', name: 'Graphite', token: 'graphite', role: 'Surface in dark.' },
] as const

export type TokenGroup = 'Text' | 'Surface' | 'Graphic' | 'Interactive'

export type ModeToken = {
  token: string
  hex: string
  role: string
  group: TokenGroup
  /** The token this one is measured against for the contrast figure. */
  on: string
}

export type Mode = {
  id: string
  label: string
  title: string
  theme: 'light' | 'dark' | 'brand'
  note: string
  tokens: readonly ModeToken[]
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
    label: '01 — LIGHT',
    title: 'Light',
    theme: 'light',
    note: 'Off-white is the page and off-black is everything that reads. Grey carries secondary text, translucent black carries rules, and orange is the signature: active states, marks, strong fields.',
    tokens: [
      { group: 'Text', token: 'fg', hex: '#141314', on: 'bg', role: 'Primary text' },
      { group: 'Text', token: 'fg-muted', hex: '#696869', on: 'bg', role: 'Secondary text' },
      { group: 'Text', token: 'fg-subtle', hex: '#696869', on: 'bg', role: 'Labels and metadata' },
      { group: 'Surface', token: 'bg', hex: '#EEEEEE', on: 'fg', role: 'Page canvas' },
      { group: 'Surface', token: 'surface', hex: '#D5D5D5', on: 'fg', role: 'Surfaces, plates' },
      { group: 'Surface', token: 'surface-2', hex: '#F7F7F7', on: 'fg', role: 'Muted background' },
      {
        group: 'Graphic',
        token: 'rule',
        hex: '#0000001A',
        on: 'bg',
        role: 'Hairlines (black 10%)',
      },
      {
        group: 'Graphic',
        token: 'rule-strong',
        hex: '#00000033',
        on: 'bg',
        role: 'Borders (black 20%)',
      },
      {
        group: 'Graphic',
        token: 'accent-secondary',
        hex: '#FD8D68',
        on: 'bg',
        role: 'Marks and bars (decorative)',
      },
      {
        group: 'Interactive',
        token: 'accent',
        hex: '#FB460D',
        on: 'bg',
        role: 'Signature: active states, fields',
      },
      {
        group: 'Interactive',
        token: 'accent-fg',
        hex: '#141314',
        on: 'accent',
        role: 'Text on orange',
      },
      { group: 'Interactive', token: 'focus', hex: '#141314', on: 'bg', role: 'Focus ring' },
      {
        group: 'Interactive',
        token: 'selection',
        hex: '#FB460D',
        on: 'bg',
        role: 'Text selection',
      },
    ],
    cls: { chip: 'bg-accent text-accent-fg', band2: 'bg-surface text-fg', fx: 'bg-accent' },
    limits: [
      'Orange on off-white is 3.0:1: fields, marks and large text only. Small text on light stays black or grey.',
      'Black on orange is 5.3:1, so orange buttons and fields carry black text, as the reference does.',
      'Rules are translucent black (10% and 20%), so they read as structure on any light ground.',
    ],
  },
  {
    id: '02',
    label: '02 — DARK',
    title: 'Dark',
    theme: 'dark',
    note: 'Off-black is the page and off-white reads. The accent brightens to orange bright, which is text-capable on black. Rules are translucent white.',
    tokens: [
      { group: 'Text', token: 'fg', hex: '#EEEEEE', on: 'bg', role: 'Primary text' },
      { group: 'Text', token: 'fg-muted', hex: '#818081', on: 'bg', role: 'Secondary text' },
      { group: 'Text', token: 'fg-subtle', hex: '#818081', on: 'bg', role: 'Labels and metadata' },
      { group: 'Surface', token: 'bg', hex: '#141314', on: 'fg', role: 'Page canvas' },
      { group: 'Surface', token: 'surface', hex: '#333333', on: 'fg', role: 'Surfaces, plates' },
      { group: 'Surface', token: 'surface-2', hex: '#1A1A1A', on: 'fg', role: 'Muted background' },
      { group: 'Graphic', token: 'rule', hex: '#EEEEEE0D', on: 'bg', role: 'Hairlines (white 5%)' },
      {
        group: 'Graphic',
        token: 'rule-strong',
        hex: '#EEEEEE1A',
        on: 'bg',
        role: 'Borders (white 10%)',
      },
      {
        group: 'Graphic',
        token: 'accent-secondary',
        hex: '#FD8D68',
        on: 'bg',
        role: 'Marks and bars',
      },
      {
        group: 'Interactive',
        token: 'accent',
        hex: '#FD551D',
        on: 'bg',
        role: 'Signature: active states, fields',
      },
      {
        group: 'Interactive',
        token: 'accent-fg',
        hex: '#141314',
        on: 'accent',
        role: 'Text on orange',
      },
      { group: 'Interactive', token: 'focus', hex: '#EEEEEE', on: 'bg', role: 'Focus ring' },
      {
        group: 'Interactive',
        token: 'selection',
        hex: '#FD551D',
        on: 'bg',
        role: 'Text selection',
      },
    ],
    cls: { chip: 'bg-accent text-accent-fg', band2: 'bg-surface text-fg', fx: 'bg-accent' },
    limits: [
      'Orange bright on off-black is 5.7:1, so in dark the accent can be small text.',
      'The rules are very quiet (white 5% and 10%), as in the reference; structure leans on space.',
    ],
  },
  {
    id: '03',
    label: '03 — BRAND',
    title: 'Brand field',
    theme: 'brand',
    note: 'The reference’s orange field (its preloader): black on orange. Used for a single surface or moment, never as a page-wide mode.',
    tokens: [
      { group: 'Text', token: 'fg', hex: '#141314', on: 'bg', role: 'Primary text' },
      { group: 'Text', token: 'fg-muted', hex: '#1A1A1A', on: 'bg', role: 'Secondary text' },
      { group: 'Text', token: 'fg-subtle', hex: '#1A1A1A', on: 'bg', role: 'Labels and metadata' },
      { group: 'Surface', token: 'bg', hex: '#FB460D', on: 'fg', role: 'The orange field' },
      {
        group: 'Surface',
        token: 'surface',
        hex: '#FD8D68',
        on: 'fg',
        role: 'Surface on the field',
      },
      { group: 'Surface', token: 'surface-2', hex: '#FD7142', on: 'fg', role: 'Muted background' },
      {
        group: 'Graphic',
        token: 'rule',
        hex: '#00000033',
        on: 'bg',
        role: 'Hairlines (black 20%)',
      },
      {
        group: 'Graphic',
        token: 'rule-strong',
        hex: '#0000004D',
        on: 'bg',
        role: 'Borders (black 30%)',
      },
      { group: 'Graphic', token: 'accent-secondary', hex: '#FD8D68', on: 'bg', role: 'Marks' },
      {
        group: 'Interactive',
        token: 'accent',
        hex: '#FD551D',
        on: 'bg',
        role: 'Accent (near-invisible on the field by design)',
      },
      {
        group: 'Interactive',
        token: 'accent-fg',
        hex: '#141314',
        on: 'accent',
        role: 'Text on orange',
      },
      { group: 'Interactive', token: 'focus', hex: '#141314', on: 'bg', role: 'Focus ring' },
      {
        group: 'Interactive',
        token: 'selection',
        hex: '#EEEEEE',
        on: 'bg',
        role: 'Text selection',
      },
    ],
    cls: { chip: 'bg-fg text-bg', band2: 'bg-surface text-fg', fx: 'bg-fg' },
    limits: [
      'Black on orange is 5.3:1. Anything that must read on the field is black.',
      'The accent is orange on orange here; on a brand field, emphasis comes from black, not from the accent.',
    ],
  },
] as const satisfies readonly Mode[]
