import type { ChipLink, CompactContent, PaletteCommand } from '@/types/content'
import hood from './profile/hood.svg'
import { projects } from './projects'
import { contact, education, experience, place, site, tagline } from './site'
import { workbench } from './workbench'

const [job] = experience
const [degree] = education

const profile = (label: string) => site.profiles.find((item) => item.label === label)?.href ?? ''
const linkedin = profile('LinkedIn')
const github = profile('GitHub')
const mailto = `mailto:${contact.email}`

const profiles = [
  { label: 'LinkedIn', href: linkedin, icon: 'linkedin' },
  { label: 'GitHub', href: github, icon: 'github' },
] as const satisfies readonly ChipLink[]

const sections: CompactContent['sections'] = [
  { id: 'work', title: 'Work' },
  { id: 'workbench', title: 'Components' },
  { id: 'experience', title: 'Experience' },
  { id: 'stack', title: 'Stack' },
  { id: 'desk', title: 'On my desk' },
]

/*
 * What the search finds (interactive/site-search.tsx): the page's sections, the
 * work (on the full site, and this site's source), every workbench piece, the
 * ways to get in touch, and the site itself. Section links carry the page's
 * path, so they work from a workbench page too. The layout grid is the one
 * small secret: it lays the column's grid over the page, and runs again to take
 * it off.
 */
const commands: readonly PaletteCommand[] = [
  ...sections.map((section) => ({
    id: `section-${section.id}`,
    group: 'Sections',
    label: section.title,
    icon: 'hash' as const,
    action: { kind: 'go' as const, href: `/compact#${section.id}` },
  })),
  ...projects.map((project) => ({
    id: `work-${project.slug}`,
    group: 'Work',
    label: project.title,
    icon: 'arrow' as const,
    keywords: `${project.category} ${project.stack.join(' ')}`,
    action: project.href
      ? { kind: 'go' as const, href: project.href, external: true }
      : { kind: 'go' as const, href: `/#work-${project.slug}` },
  })),
  ...projects.flatMap((project) =>
    project.source
      ? [
          {
            id: `source-${project.slug}`,
            group: 'Work',
            label: `${project.title}: source`,
            icon: 'github' as const,
            keywords: 'code repository github',
            action: { kind: 'go' as const, href: project.source, external: true },
          },
        ]
      : [],
  ),
  ...workbench.items.map((item) => ({
    id: `piece-${item.slug}`,
    group: 'Workbench',
    label: item.name,
    icon: 'box' as const,
    keywords: `component ui ${item.tech.join(' ')}`,
    action: { kind: 'go' as const, href: `/compact/components/${item.slug}` },
  })),
  {
    id: 'copy-email',
    group: 'Contact',
    label: 'Copy email address',
    icon: 'copy',
    keywords: `mail ${contact.email}`,
    action: { kind: 'copy', text: contact.email, done: 'Copied! Talk soon.' },
  },
  {
    id: 'write',
    group: 'Contact',
    label: 'Write an email',
    icon: 'mail',
    keywords: 'mail message',
    action: { kind: 'go', href: mailto },
  },
  ...profiles.map((profile) => ({
    id: `profile-${profile.icon}`,
    group: 'Contact',
    label: profile.label,
    icon: profile.icon,
    keywords: 'profile social',
    action: { kind: 'go' as const, href: profile.href, external: true },
  })),
  {
    id: 'theme',
    group: 'Site',
    label: 'Switch light and dark',
    icon: 'moon',
    keywords: 'theme mode dark light colour',
    action: { kind: 'theme' },
  },
  {
    id: 'full-site',
    group: 'Site',
    label: 'Open the full site',
    icon: 'home',
    keywords: 'home portfolio',
    action: { kind: 'go', href: '/' },
  },
  {
    id: 'top',
    group: 'Site',
    label: 'Back to top',
    icon: 'up',
    action: { kind: 'go', href: '#top' },
  },
  {
    id: 'grid',
    group: 'Site',
    label: 'Toggle the layout grid',
    icon: 'grid',
    keywords: 'columns guides design secret',
    action: { kind: 'grid' },
  },
]

/*
 * The compact site (/compact): the portfolio in short, as a few plain
 * sentences and rows (owner's direction, November 2026). Every fact comes from
 * `site.ts`, `projects` and the workbench; nothing here is invented: the
 * unreleased work is named only as what is next, and the desk holds the site's
 * own things.
 */
export const compact = {
  meta: {
    /* The whole tab title (it replaces the root template). */
    title: `${site.name} · ${site.role}, in short`,
    description: `${site.role} in ${place}. ${tagline} The work, a few live interface pieces, the stack and how to reach me, on one page.`,
  },
  sections,
  intro: {
    /* The profile picture: original art (owner's pick, November 2026), a
       figure in a red hood with long ears, the site's bunny grown up. Drawn as
       an SVG here, printed in two plates by interactive/hood-avatar.tsx. */
    avatar: {
      image: hood,
      alt: 'An illustrated figure in a red hood with long rabbit ears, its face in shadow.',
    },
    place: place.split(',')[0] ?? place,
    time: { zone: 'Asia/Kolkata', fallback: 'IST, UTC+05:30' },
    role: site.role,
    hello: `Hey, I'm ${site.name.split(' ')[0]}.`,
    lede: [
      ' I test software at ',
      { chip: 'job' },
      ' by day, and by night I build ',
      { chip: 'work' },
      ', a library of interface pieces that each do one thing well.',
    ],
    reach: [
      'Find me on ',
      profiles[0],
      ' and ',
      profiles[1],
      ', or ',
      { label: 'write to me', href: mailto },
      '.',
    ],
  },
  work: {
    soon: {
      items: ['What comes next', 'And after that'],
      note: 'Currently cooking',
      state: 'Soon',
    },
  },
  workbench: {
    featured: ['foil-cards', 'chrome-upload', 'flap-segments', 'waveform-slider', 'record-stack'],
    all: {
      label: (count) => `All ${count} in Cairn`,
      href: 'https://w-ui.vercel.app/components',
    },
  },
  experience: [
    { org: job.org, role: job.role, when: job.current ? 'Now' : 'Work' },
    { org: degree.school, role: `${degree.degree}, ${degree.field}`, when: 'Study' },
  ],
  stack: {
    items: [
      'TypeScript',
      'JavaScript',
      'HTML',
      'CSS',
      'React',
      'Next.js',
      'Tailwind CSS',
      'GSAP',
      'Lenis',
      'Node.js',
      'Express',
      'MongoDB',
      'Git',
      'pnpm',
      'ESLint',
      'Prettier',
      'Figma',
    ],
    hint: 'Type a letter',
  },
  desk: {
    hint: 'Move things around',
    label: 'Things on my desk; each can be picked up and moved, or moved with the arrow keys',
    film: { caption: 'cairn, my library', label: 'An instant photo of Cairn, taped down' },
    note: {
      text: "now: cairn's next pieces",
      label: "A yellow sticky note: now, Cairn's next pieces",
    },
    todo: {
      title: 'to do',
      items: [
        { text: 'a hood for the profile', done: true },
        { text: 'the next cairn pieces', done: false },
        { text: 'sleep', done: false },
      ],
      label: 'A to-do card: a hood for the profile (done), the next Cairn pieces, sleep',
    },
    stamp: {
      value: '5',
      country: 'INDIA',
      label: 'A postage stamp from India: a palm, the sea and a red sun',
    },
    ticket: {
      order: 'Order 02',
      title: 'In the oven',
      state: '● cooking',
      label: 'A kitchen ticket: order 02, in the oven',
    },
    key: { text: '⌘K', label: 'A loose key cap, command K: press it to search' },
    card: { mark: 'AW', label: 'My business card' },
    sticker: { text: 'open to work', label: 'A round red sticker: open to work' },
    pencil: { label: 'A pencil' },
  },
  footer: {
    made: `Made in ${place.split(',')[0]}, ${site.year}`,
    back: { label: 'The full site', href: '/' },
  },
  search: {
    label: 'Search the site',
    hint: 'to search',
    touch: 'Search',
    placeholder: 'Search…',
    empty: 'Nothing here. Try “stack”, “email” or “key”.',
    commands,
  },
  theme: { label: 'Dark mode' },
  ui: {
    home: 'Compact home',
  },
} satisfies CompactContent
