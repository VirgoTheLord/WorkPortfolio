import type { CompactContent } from '@/types/content'
import { about, contact, site } from './site'

const [role, studied, place] = about.details.map((item) => item.detail)
const linkedin = site.profiles.find((profile) => profile.label === 'LinkedIn')

/*
 * The compact site (/compact): one quiet screen of the same person, for a visitor
 * who wants it short (DESIGN.md §5b). The intro is built from the facts in
 * `site.ts` (the owner's LinkedIn profile): the role, the degree and the city.
 * The one addition is the city's coordinates, Ernakulam's (9.98° N, 76.28° E),
 * a precise, checkable detail in place of a live clock. Draft copy: the owner
 * rewrites it.
 */
export const compact = {
  meta: {
    title: 'Compact',
    description: 'Alwin Aby Mathew, the short version: who, what, and the pieces to play with.',
  },
  back: { label: 'Full site', href: '/' },
  intro: [
    'Software engineer in ',
    { text: place ?? 'Ernakulam, Kerala', detail: '9.98° N · 76.28° E', kind: 'place' },
    '. Currently at ',
    { text: 'SOTI', detail: role?.replace(/ at SOTI$/, '') ?? 'Software Engineer in Test' },
    '; studied at ',
    { text: 'MITS', detail: studied?.replace(/, MITS$/, '') ?? 'B.Tech in Computer Science' },
    '. I make ',
    { text: 'interfaces', detail: 'Drawn in the hero’s cells', kind: 'cells' },
    ' where engineering and visual craft meet.',
  ],
  readoutHint: { pointer: 'Hover the underlined words', touch: 'Tap the underlined words' },
  /*
   * The shelf: the interface pieces this site is built from, each live and each
   * going somewhere real, so the shelf is also the way to reach the owner.
   */
  shelf: {
    label: 'Pieces',
    items: [
      {
        index: '01',
        name: 'Frame button',
        note: 'On hover or focus the plate turns into a selected frame and its letters flip like a departures board.',
        piece: { kind: 'frame', label: 'Full site', href: '/' },
      },
      {
        index: '02',
        name: 'Key',
        note: 'Hover lifts the key off its block; pressing drives it down and fills it with orange.',
        piece: { kind: 'key', label: 'Write to me', href: `mailto:${contact.email}` },
      },
      {
        index: '03',
        name: 'Scramble button',
        note: 'On hover or focus the label scrambles back into place while the plus changes sides.',
        piece: { kind: 'scramble', label: 'LinkedIn', href: linkedin?.href ?? '/' },
      },
      {
        index: '04',
        name: 'Departures board',
        note: 'Click or tap to copy the address; it flips to “copied” and back.',
        piece: { kind: 'board' },
      },
      {
        index: '05',
        name: 'Pixel pad',
        note: 'Draw on the hero’s grid with a mouse or a finger; the trail fades on its own.',
        piece: { kind: 'pad', label: 'Draw here' },
      },
    ],
  },
  work: { label: 'Work' },
} satisfies CompactContent
