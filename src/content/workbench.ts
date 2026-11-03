import type { WorkbenchContent, WorkbenchItem } from '@/types/content'

/*
 * The workbench: Cairn's premium pieces and the ones this site is built from, each with its own page on
 * the compact site (/compact/components/<slug>) where it runs live on a stage.
 * Every line under "How it behaves" restates the component's own comment in its
 * file; nothing is claimed that the code does not do. `source` is the file in
 * the public repository; `live` is where the piece is on the full site.
 */
/*
 * The premium pieces from Cairn, the owner's component library (w-ui.vercel.app),
 * copied into src/components/library/cairn. Each line restates Cairn's own
 * catalogue for it; `live` is its page in Cairn's docs.
 */
const cairn: readonly WorkbenchItem[] = [
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
    slug: 'neo-switch',
    name: 'Neumorph switch',
    note: 'A switch moulded from the surface it sits on; the dome rolls across, hits the end and fills with the accent.',
    kind: 'cairn',
    hint: 'Flip it, press and hold, or drag the dome.',
    details: [
      'A groove pressed into the surface and a dome riding in it, shaped only by a light from the top left.',
      'Pressed, the dome sinks and stretches like a rubber key. Released, it rolls across, squashes against the end and springs back; then its cup fills with the accent.',
      'Hovered, the dome leans toward the side it would go to. It can be dragged, and lands on the nearer side.',
      'A real switch in a label. The look is CSS on aria-checked, so it is right before hydration. Reduced motion moves it without the roll, the squash or the lean.',
    ],
    tech: ['React', 'CSS'],
    source: 'src/components/library/cairn/neo-switch.tsx',
    live: { label: 'Cairn docs', href: 'https://w-ui.vercel.app/components/neo-switch' },
  },
  {
    slug: 'flap-checkbox',
    name: 'Split-flap checkbox',
    note: 'A checkbox as one departures-board cell: the flap falls and lands on a tick.',
    kind: 'cairn',
    hint: 'Check and uncheck it.',
    details: [
      'One departures-board cell, cut at the hinge. Checked, the top half falls away and the bottom swings down onto a tick in the accent, overshooting a little as it lands.',
      'A dark tile on a light page and a white one on a dark page, so the flap always reads.',
      'A real checkbox in a label: it submits with a form, Space toggles it and so does the text. Reduced motion swaps the face without the fall.',
    ],
    tech: ['React', 'CSS'],
    source: 'src/components/library/cairn/flap-checkbox.tsx',
    live: { label: 'Cairn docs', href: 'https://w-ui.vercel.app/components/flap-checkbox' },
  },
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
    slug: 'comet-field',
    name: 'Comet field',
    note: 'A text field whose label climbs out as a prism comet laps its edge, resting as a thin lit border.',
    kind: 'cairn',
    hint: 'Click into it, then click away and back.',
    details: [
      'At rest the label sits in the field. On focus it climbs to the top a letter at a time and takes the accent.',
      'At the same time a comet with a prism head laps the edge once, and comes to rest as a thin border in the accent.',
      'A real input inside its label. CSS on :focus-within, so nothing runs at rest. Reduced motion skips the comet.',
    ],
    tech: ['CSS', 'React'],
    source: 'src/components/library/cairn/comet-field.tsx',
    live: { label: 'Cairn docs', href: 'https://w-ui.vercel.app/components/comet-field' },
  },
  {
    slug: 'lens-search',
    name: 'Lens search',
    note: 'A search field whose results open as a circle growing out of the magnifier.',
    kind: 'cairn',
    hint: 'Click into it, type “co”, then use the arrows.',
    details: [
      'Focused, the results open as a circle growing out of the magnifier; leaving the field closes it back in.',
      'The panel lies over what follows, so opening it never moves the page. The part of each result that matches is set bold.',
      'A combobox over a listbox: arrow keys move the highlight, Enter chooses, Escape clears and then closes. Reduced motion opens it without the circle.',
    ],
    tech: ['React', 'CSS'],
    source: 'src/components/library/cairn/lens-search.tsx',
    live: { label: 'Cairn docs', href: 'https://w-ui.vercel.app/components/lens-search' },
  },
  {
    slug: 'code-input',
    name: 'Code input',
    note: 'A one-time code as a row of raised blank keys: each digit presses its key down and prints the legend.',
    kind: 'cairn',
    hint: 'Click in and type 428913 for the right code, or any other six digits for a wrong one.',
    details: [
      'Six raised blank keys in sockets. A digit presses its key down and prints the legend; the next key stands a little taller, ringed in the accent.',
      'A right code sends a hop through the row and the caps take the accent. A wrong one rattles the row, shows the legends in red, then the keys spring back up.',
      'One native input lies over the keys, so paste and the phone’s one-time-code suggestion work. Reduced motion changes state without the motion.',
    ],
    tech: ['React', 'CSS'],
    source: 'src/components/library/cairn/code-input.tsx',
    live: { label: 'Cairn docs', href: 'https://w-ui.vercel.app/components/code-input' },
  },
  {
    slug: 'ballpoint-button',
    name: 'Ballpoint button',
    note: 'A button drawn in ballpoint on a deep hatched block: it rules itself in, and a press throws the face through the block.',
    kind: 'cairn',
    hint: 'Watch it draw itself in, then hover and press it. Replay draws it again.',
    details: [
      'A face ruled by hand in ballpoint: every edge gone over three times, each pass lighter, overshooting the corners. Behind it a deep block, its sides hatched and cross-hatched.',
      'When it first scrolls into view the pen rules the face, the block springs up off the page and the sides hatch in.',
      'Hover sends a light fourth pass round the face. A press throws the face down through the block; on release it springs back and settles.',
      'A real button, or a link. Before the script runs it is a plain button with a hairline edge. Reduced motion skips the intro and the springs.',
      'The compact site’s chips are this button, small and still.',
    ],
    tech: ['SVG', 'React', 'CSS'],
    source: 'src/components/library/cairn/ballpoint-button.tsx',
    live: { label: 'Cairn docs', href: 'https://w-ui.vercel.app/components/ballpoint-button' },
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

/* This site's own pieces. */
const own: readonly WorkbenchItem[] = [
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
    slug: 'pixel-mark',
    name: 'Pixel mark',
    note: 'A logo that blurs away and rebuilds itself as a word in tiny square cells.',
    kind: 'library',
    hint: 'Hover it, or tab to it.',
    details: [
      'At rest it is the mark in the blackletter. Hovered or focused, the mark blurs away and the word is built from small square cells, column by column, a few of them in the accent.',
      'Like the full site’s hero name in miniature. The cells are laid out on the server from a 5×5 alphabet, so it is pure CSS: no script, nothing to hydrate.',
      'The word is decoration; the label names the link. With reduced motion the swap is instant.',
      'Kept for the library: one of the options for the compact site’s way back to the full site.',
    ],
    tech: ['CSS'],
    source: 'src/components/library/pixel-mark.tsx',
  },
]

export const workbench = {
  meta: {
    title: 'Workbench',
    description:
      'Premium pieces from Cairn, my component library, and the small parts this portfolio is built from, each running live.',
  },
  title: 'Workbench',
  note: 'The premium pieces from Cairn, my component library, then the little parts this site is built from. Each one runs live on its own page: poke it, hover it, break it.',
  /* Cairn's premium pieces first, then this site's own. */
  items: [...cairn, ...own],
  demo: {
    key: 'Creative development',
    pixel: 'Alwin',
    cairn: {
      switches: ['Smooth scroll', 'Sound', 'Reduced motion'],
      checks: ['Design reviewed', 'Tests passing', 'Shipped'],
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
      field: { label: 'Email address', placeholder: 'you@studio.com' },
      search: 'Search the workbench',
      code: { label: 'Verification code', value: '428913' },
      ballpoint: { label: 'Launch project', replay: 'Replay' },
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
