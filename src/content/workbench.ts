import type { WorkbenchContent, WorkbenchItem } from '@/types/content'

/*
 * The workbench: the pieces this site is built from, each with its own page on
 * the compact site (/compact/components/<slug>) where it runs live on a stage.
 * Every line under "How it behaves" restates the component's own comment in its
 * file; nothing is claimed that the code does not do. `source` is the file in
 * the public repository; `live` is where the piece is on the full site.
 */
const items: readonly WorkbenchItem[] = [
  {
    slug: 'frame-button',
    name: 'Frame button',
    note: 'A plate that turns into a selected frame; its letters flip like a departures board.',
    kind: 'site',
    hint: 'Hover it, or tab to it.',
    details: [
      'An ink plate with an accent square, two chevrons and a monospace label.',
      'On hover or focus it becomes a selected frame, as in a design tool: the plate turns to the page’s tone, grows a touch and puts out a handle at each corner.',
      'The chevrons light up in turn, and the label’s letters flip over one after another.',
      'Pure CSS, no script. A real link, and the label is its name.',
    ],
    tech: ['CSS'],
    source: 'src/components/library/frame-button.tsx',
    live: { label: 'The hero', href: '/' },
  },
  {
    slug: 'departures-board',
    name: 'Departures board',
    note: 'An email address in flip cells that copies itself on click or tap.',
    kind: 'site',
    hint: 'Click or tap the address.',
    details: [
      'An email address set in flip cells that size themselves to the width they are given.',
      'A click or tap copies it: each cell runs through a few characters before it lands, one after another, and the board says so before it flips back.',
      'A real button with a plain-text name; the cells are decoration.',
    ],
    tech: ['React', 'CSS'],
    source: 'src/components/motion/contact-board.tsx',
    live: { label: 'Contact', href: '/#contact' },
  },
  {
    slug: 'headline-wipe',
    name: 'Headline wipe',
    note: 'Accent and ink blocks wipe a heading in as it reaches the screen.',
    kind: 'site',
    hint: 'Press Replay to run it again.',
    details: [
      'A headline set one line per entry, wiped in once as it reaches the screen.',
      'An accent block runs across each line with a text-coloured block 0.1s behind; the line switches on under them and they leave to the right.',
      'Lines start 0.15s apart. Without script, or with reduced motion, the headline is simply there.',
    ],
    tech: ['CSS', 'IntersectionObserver'],
    source: 'src/components/motion/headline-wipe.tsx',
    live: { label: 'Contact', href: '/#contact' },
  },
  {
    slug: 'arrow-link',
    name: 'Arrow link',
    note: 'A monospace link whose pixel arrow steps right on hover.',
    kind: 'site',
    hint: 'Hover it, or tab to it.',
    details: [
      'A small monospace link with a pixel-stepped arrow after it.',
      'On hover or focus the arrow steps 4px to the right.',
      'The Skills section and the Skills page use it for every link that leads on.',
    ],
    tech: ['CSS'],
    source: 'src/components/ui/arrow-link.tsx',
    live: { label: 'Skills', href: '/skills' },
  },
  {
    slug: 'text-link',
    name: 'Text link',
    note: 'An underline that runs out to the right while a new one runs in.',
    kind: 'site',
    hint: 'Hover the link in the sentence.',
    details: [
      'The site’s inline link: a line under the text.',
      'On hover and focus the line runs out to the right while a new one runs in from the left behind it, and the reverse on leaving.',
      'A real anchor, so mail and in-page links work as they do anywhere.',
    ],
    tech: ['CSS'],
    source: 'src/components/ui/text-link.tsx',
    live: { label: 'Contact', href: '/#contact' },
  },
  {
    slug: 'pointer-effects',
    name: 'Pointer effects',
    note: 'A comet-tail square, a lens over links and a tilted tag.',
    kind: 'site',
    hint: 'Move a mouse around the stage, over the link and over the tag.',
    details: [
      'A square at the pointer with a comet’s tail of its recent path, drawn on one fixed canvas that only repaints while a square is alive.',
      'Over a link or a button a lens grows under the pointer and takes the colour out of what is beneath it.',
      'Over anything marked with a tag the head becomes a small orange label, tilted 7°.',
      'Fine pointers only, never with reduced motion. Nothing here takes an event or focus.',
    ],
    tech: ['Canvas', 'React'],
    source: 'src/components/motion/pointer-fx.tsx',
    live: { label: 'Everywhere on the full site', href: '/' },
  },
  {
    slug: 'key',
    name: 'Key',
    note: 'A key that lifts off its block on hover and presses down in orange.',
    kind: 'library',
    hint: 'Hover it, then press it.',
    details: [
      'A key seen from above: a face with a heavy outline on a solid block that runs down and to the left at 45°.',
      'It lifts off the block when hovered and presses into it when pressed.',
      'Kept for the library: the site settled on one button, the frame button.',
    ],
    tech: ['CSS'],
    source: 'src/components/library/key-link.tsx',
  },
  {
    slug: 'scramble-button',
    name: 'Scramble button',
    note: 'A label that scrambles back into place while its plus changes sides.',
    kind: 'library',
    hint: 'Hover it with a mouse.',
    details: [
      'A link whose label scrambles into place letter by letter from the left while the plus changes sides.',
      'The scramble is only a visual layer: the name read out is the plain label.',
      'Nothing runs on touch or with reduced motion. It was the hero’s call to action before the frame button.',
    ],
    tech: ['React', 'CSS'],
    source: 'src/components/library/scramble-button.tsx',
  },
  {
    slug: 'section-label',
    name: 'Section label',
    note: 'An accent square and a name over a short double rule.',
    kind: 'library',
    hint: 'It just sits there, being tidy.',
    details: [
      'A small accent square and a name in the label face, centred over a short double rule.',
      'The square is decoration; the name is what is read.',
      'Retired from above Selected Work, where the headline said the same words larger.',
    ],
    tech: ['CSS'],
    source: 'src/components/library/section-label.tsx',
  },
]

export const workbench = {
  meta: {
    title: 'Workbench',
    description: 'The small pieces this portfolio is built from, each running live.',
  },
  title: 'Workbench',
  note: 'The little parts I keep reaching for. Each one runs live on its own page: poke it, hover it, break it.',
  items,
  demo: {
    arrow: 'See all skills',
    key: 'Creative development',
    lens: 'A link, for the lens',
    tagged: 'A tagged spot',
    tag: 'Hello!',
    section: 'Selected work',
  },
  labels: {
    crumb: 'Breadcrumb',
    stage: 'Live',
    replay: 'Replay',
    behaviour: 'How it behaves',
    tech: 'Moves with',
    source: 'Source',
    where: 'On the full site',
    kept: 'Kept for the library',
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
