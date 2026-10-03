/**
 * One specimen for /color-test, set in the production palette.
 * The passage is not a case study.
 */

export const colorTestPage = {
  eyebrow: 'Production color',
  title: 'Color',
  lede: 'Warm ivory for the wall, warm ink for reading, racing green for identity, and antique brass for the detail. This page uses the same tokens as the rest of the site.',
  home: 'Home',
} as const

export const colorGroups = [
  {
    id: 'space',
    name: 'Space',
    note: 'Ivory is the wall. The page stays light.',
    swatches: [
      { token: 'bg', name: 'Ivory', role: 'Gallery wall' },
      { token: 'surface', name: 'Surface', role: 'Mat behind the work' },
      { token: 'surface-2', name: 'Surface 2', role: 'A second quiet step' },
    ],
  },
  {
    id: 'information',
    name: 'Information',
    note: 'Ink carries the reading.',
    swatches: [
      { token: 'fg', name: 'Ink', role: 'Primary text' },
      { token: 'fg-muted', name: 'Muted ink', role: 'Secondary text' },
      { token: 'fg-subtle', name: 'Subtle ink', role: 'Labels and metadata' },
    ],
  },
  {
    id: 'structure',
    name: 'Structure',
    note: 'Rules hold the grid. They are not an accent.',
    swatches: [
      { token: 'rule', name: 'Rule', role: 'Hairline' },
      { token: 'rule-strong', name: 'Strong rule', role: 'Emphasized edge' },
    ],
  },
  {
    id: 'identity',
    name: 'Identity',
    note: 'Racing green may be bold. It does not become the page.',
    swatches: [
      { token: 'accent', name: 'Racing green', role: 'Identity and interaction' },
      { token: 'accent-fg', name: 'Ivory on green', role: 'Text on the identity color' },
    ],
  },
  {
    id: 'craft',
    name: 'Craftsmanship',
    note: 'Antique brass is a rule, a marker, or a large figure. It is not small text.',
    swatches: [{ token: 'accent-secondary', name: 'Antique brass', role: 'Secondary signal' }],
  },
] as const

export const colorInUse = {
  label: 'In use',
  index: '01',
  count: '01 / 03',
  title: 'North Room',
  metadata: '2025\u00a0·\u00a0Design & engineering\u00a0·\u00a0Catalog',
  description:
    'A reading interface for a collection that had outgrown its shelves. The catalog is the product: precise entries, quiet pages, and room for the work.',
  link: 'Read the case study',
  roomLabel: 'Exhibition',
} as const
