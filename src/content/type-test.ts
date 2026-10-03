/**
 * One specimen for /type-test, set in the production faces.
 * The passage and figures are not a case study.
 */

export const typeTestPage = {
  eyebrow: 'Production type',
  title: 'Typography',
  lede: 'Bricolage Grotesque for display and text. Azeret Mono for labels. This page uses the same tokens as the rest of the site.',
  home: 'Home',
  faces: [
    { name: 'Bricolage Grotesque', role: 'Display & text' },
    { name: 'Azeret Mono', role: 'Label' },
  ],
} as const

export const typeTestSpecimen = {
  hero: 'Shown with editorial care.',
  projectTitle: 'A catalog for the North Room',
  metadata: '01\u00a0·\u00a02025\u00a0·\u00a0Design & engineering',
  description:
    'A reading interface for a collection that had outgrown its shelves. The catalog is the product: precise entries, quiet pages, and room for the work.',
  heading: 'The plate is larger than the caption',
  paragraph:
    'The collection had no public search worth trusting, so the catalog became the product. Each entry keeps a short title, a year, and one line of context — enough to scan a wall of work without turning the page into a database. We held the reading measure near 68\u00a0characters and let photographs run wider than the text, the way a plate sits larger than its caption. “Show the object first” was the rule we kept repeating. When a description needs a turn, it takes a dash or a true quotation mark.',
  annotation: 'Fig. 03\u00a0·\u00a0Plate and caption, aligned to the same column',
  metrics: [
    { value: '01 / 05', label: 'Sequence' },
    { value: '16 × 10', label: 'Plate' },
    { value: '68', label: 'Character measure' },
    { value: '1,284', label: 'Entries' },
  ],
} as const
