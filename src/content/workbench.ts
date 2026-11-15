import type { WorkbenchContent, WorkbenchItem } from '@/types/content'

/*
 * The workbench: five of the best pieces from Cairn, the owner's component
 * library (w-ui.vercel.app), a preview (owner's call, November 2026); the rest
 * are in Cairn's own docs. Each has its own page on the compact site
 * (/compact/components/<slug>) where it runs live on a stage, from the copy in
 * src/components/library/cairn. Every line under "How it behaves" restates
 * Cairn's own catalogue for it; nothing is claimed that the code does not do.
 * `source` is the file in the public repository; `live` is its page in Cairn's
 * docs. In this order everywhere.
 */
const cairn: readonly WorkbenchItem[] = [
  {
    slug: 'foil-cards',
    name: 'Foil cards',
    note: 'Radio cards whose chosen card is struck in holographic foil.',
    kind: 'cairn',
    hint: 'Pick one, then rest the pointer on it.',
    details: [
      'The chosen card is struck in holographic foil: smooth metal, fine diffraction lines, and a sheen with a rainbow running through it.',
      'Picking another card wipes the foil off the old one and onto the new along a bright edge. Resting the pointer turns the sheen toward it.',
      'One WebGL canvas that draws only when something changes and stops off screen, so it costs nothing at rest.',
      'Real radios in a fieldset: arrow keys move the choice and it submits with a form. Reduced motion holds the foil still; without WebGL it is a still CSS foil.',
    ],
    tech: ['WebGL', 'React', 'CSS'],
    source: 'src/components/library/cairn/foil-cards.tsx',
    live: { label: 'Cairn docs', href: 'https://w-ui.vercel.app/components/foil-cards' },
  },
  {
    slug: 'chrome-upload',
    name: 'Chrome upload',
    note: 'An upload button bordered in flowing liquid chrome; the pill grows along its track as the file goes up.',
    kind: 'cairn',
    hint: 'Hover to move the light, then click. Nothing is really sent.',
    details: [
      'A frosted pill in a recessed track. Its thin border reflects a sweep of dark and silver that flows around it, and the light gathers under the pointer.',
      'Click it, or drop a file on the track: the pill grows along the track with the progress, and the chrome flows faster.',
      'When the upload resolves, a band of chrome washes across the face, a light runs once round the border and a check draws in. Then the pill glides home.',
      'A real button with a live region for each state. The chrome is one WebGL canvas, drawn only while on screen. Reduced motion holds it still; without WebGL it is a plain pill.',
    ],
    tech: ['WebGL', 'React', 'CSS'],
    source: 'src/components/library/cairn/chrome-upload.tsx',
    live: { label: 'Cairn docs', href: 'https://w-ui.vercel.app/components/chrome-upload' },
  },
  {
    slug: 'flap-segments',
    name: 'Flap segments',
    note: 'A segmented control as a row of departures-board tiles; the chosen one flips over to its face.',
    kind: 'cairn',
    hint: 'Pick a range.',
    details: [
      'A row of departures-board tiles, each with two faces on one hinge. Choosing one flips it to its face on a spring; the one before flips back.',
      'Dark tiles on a light page and white ones on a dark page, the chosen tile in the accent.',
      'Real radios in a fieldset: arrow keys move the choice. The look is CSS on the checked radio, so nothing runs at rest. Reduced motion swaps faces without the flip.',
    ],
    tech: ['React', 'CSS'],
    source: 'src/components/library/cairn/flap-segments.tsx',
    live: { label: 'Cairn docs', href: 'https://w-ui.vercel.app/components/flap-segments' },
  },
  {
    slug: 'waveform-slider',
    name: 'Waveform slider',
    note: 'A slider drawn as an audio waveform: the bars light up to the value and bounce when you drag fast.',
    kind: 'cairn',
    hint: 'Drag it, fast and slow, or use the arrow keys.',
    details: [
      'A row of audio bars that light up in the accent to the value, a hairline marking the thumb. Drag fast and the bars round the thumb bounce, settling as it slows.',
      'A real range input lies over the bars, so the pointer, arrow keys, Page Up and Down, Home and End all work as on any slider.',
      'One WebGL canvas that draws only while the value moves. Reduced motion keeps the bounce off; without WebGL it is a plain filled bar.',
    ],
    tech: ['WebGL', 'React', 'CSS'],
    source: 'src/components/library/cairn/waveform-slider.tsx',
    live: { label: 'Cairn docs', href: 'https://w-ui.vercel.app/components/waveform-slider' },
  },
  {
    slug: 'record-stack',
    name: 'Record stack',
    note: 'A deck of record covers you flick through: the top one is playing, and a flick tucks it back into the deck.',
    kind: 'cairn',
    hint: 'Press play, then flick the top cover right or left.',
    details: [
      'A pile of square covers, the two under the top one a little turned, so it reads as a deck. A hairline in the accent fills round the top cover’s edge with the song.',
      'Drag it and it hangs from where you grabbed it. Flick right and it swings out and settles at the back; flick left and the back one lands on top. Everything runs on springs.',
      'The pile is focusable: arrow keys change record, Enter plays. Without a song a silent clock runs. Reduced motion changes records without the motion.',
    ],
    tech: ['React', 'CSS'],
    source: 'src/components/library/cairn/record-stack.tsx',
    live: { label: 'Cairn docs', href: 'https://w-ui.vercel.app/components/record-stack' },
  },
]

export const workbench = {
  meta: {
    title: 'Workbench',
    description:
      'Five pieces from Cairn, my React component library, each running live: foil cards, a chrome upload, flap segments, a waveform slider and a record stack.',
  },
  title: 'Workbench',
  note: 'Five pieces from Cairn, my component library, as a preview. Each one runs live on its own page; the rest are in Cairn.',
  items: cairn,
  demo: {
    cairn: {
      segments: { label: 'Range', options: ['Day', 'Week', 'Month', 'Year'], value: 'Week' },
      cards: {
        label: 'How we could work',
        options: [
          {
            value: 'chat',
            title: 'A chat',
            meta: '30 min',
            description: 'An idea, talked through',
          },
          {
            value: 'project',
            title: 'A project',
            meta: 'Weeks',
            description: 'One thing, built well',
          },
          { value: 'team', title: 'A team', meta: 'Long term', description: 'Joining yours' },
        ],
        value: 'project',
      },
      slider: 'Volume',
      /* Cairn's own stage records: illustrated covers, made-up albums, no sound. */
      records: {
        label: 'Albums',
        items: [
          { title: 'After Static', artist: 'Kite Season', duration: 214 },
          { title: 'Night Swim', artist: 'Lumen', duration: 187 },
          { title: 'Paper Moon', artist: 'Ines Roth', duration: 242 },
          { title: 'Glass Houses', artist: 'Mira Vale', duration: 199 },
          { title: 'Northbound', artist: 'The Sundays Club', duration: 226 },
        ],
      },
    },
  },
  labels: {
    crumb: 'Breadcrumb',
    stage: 'Live',
    replay: 'Replay',
    behaviour: 'How it behaves',
    tech: 'Moves with',
    source: 'Source',
    where: 'On the full site',
    docs: 'In the library',
    kept: 'Kept for the library',
    cairn: 'Cairn',
    site: 'On the site',
    library: 'Library',
    prev: 'Previous',
    next: 'Next',
    all: 'All pieces',
    open: 'Open the workbench',
  },
} satisfies WorkbenchContent

/* The repository the sources live in (the site's public origin). */
export const repository = 'https://github.com/VirgoTheLord/WorkPortfolio/blob/main/'
