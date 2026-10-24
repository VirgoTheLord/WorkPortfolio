import type { ChipLink, CompactContent, PaletteCommand } from '@/types/content'
import { projects } from './projects'
import { about, contact, education, experience, place, site } from './site'
import { workbench } from './workbench'

const [job] = experience
const [degree] = education

/*
 * The owner's GitHub: the account that holds this site's public repository (the
 * repo's origin remote). Linked from the compact site only; the full site's
 * profiles are unchanged.
 */
const github = 'https://github.com/VirgoTheLord'
const linkedin = site.profiles.find((profile) => profile.label === 'LinkedIn')?.href ?? ''
const mailto = `mailto:${contact.email}`

const profiles = [
  { label: 'LinkedIn', href: linkedin, icon: 'linkedin' },
  { label: 'GitHub', href: github, icon: 'github' },
] as const satisfies readonly ChipLink[]

const sections: CompactContent['sections'] = (
  [
    { id: 'work', title: 'Selected work', short: 'Work' },
    { id: 'workbench', title: 'Workbench' },
    { id: 'experience', title: 'Experience' },
    { id: 'stack', title: 'Stack' },
    { id: 'about', title: 'About' },
    { id: 'contact', title: 'Contact' },
  ] as const
).map((section, index) => ({ ...section, number: String(index + 1).padStart(2, '0') }))

/* The full site's statement, with the words the hand-drawn line sits under. */
const mark = 'visual craft'
const [before = '', after = ''] = about.statement.split(mark)

/*
 * What the search finds (interactive/site-search.tsx): the page's sections, the
 * work (on the full site, and this site's source), every workbench piece, the
 * ways to get in touch, and the site itself. Section links carry the page's
 * path, so they work from a workbench page too. The layout grid is the one
 * small secret: it lays the sheet's grid over the page, and runs again to take
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
    action: { kind: 'go' as const, href: project.href ?? `/#work-${project.slug}` },
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
 * The compact site (/compact): the portfolio in short (DESIGN.md §5b). Every fact
 * comes from `site.ts` and `projects`; the stack lists only what this site is
 * built with (package.json). No writing, contribution graph, visitor count or
 * availability: the project holds none of them. The About paragraphs are a draft
 * for the owner to rewrite.
 */
export const compact = {
  meta: {
    /* The whole tab title (it replaces the root template). */
    title: `${site.name} · ${site.role}, in short`,
    description: `${site.role} in ${place}. ${about.statement} The work, a workbench of live interface pieces, the stack and how to reach me, on one page.`,
  },
  back: { label: 'Full site', href: '/' },
  sections,
  intro: {
    place,
    coords: '9.98° N, 76.28° E',
    time: { zone: 'Asia/Kolkata', fallback: 'IST, UTC+05:30' },
    role: site.role,
    statement: { before, mark, after },
    note: `Currently at ${job.org}. This site is my workbench: a static Next.js build with its own type, motion and the small states most people never notice.`,
    reach: [
      'Find me on ',
      profiles[0],
      ' and ',
      profiles[1],
      ', ',
      { label: 'write to me', href: mailto, icon: 'mail' },
      ', or take the long way round on the ',
      { label: 'full site', href: '/', icon: 'home' },
      '.',
    ],
  },
  work: {
    note: 'Four things I built for this very site, all live on the full one.',
    view: 'See it on the full site',
    source: 'Source',
  },
  workbench: {
    note: workbench.note,
    open: workbench.labels.open,
  },
  experience: [
    { kind: 'Work', org: job.org, role: job.role, current: job.current },
    { kind: 'Study', org: degree.school, role: `${degree.degree}, ${degree.field}` },
  ],
  stack: [
    { name: 'Language', items: ['TypeScript', 'JavaScript', 'HTML', 'CSS'] },
    { name: 'Frontend', items: ['React', 'Next.js', 'Tailwind CSS', 'GSAP', 'Lenis'] },
    { name: 'Workflow', items: ['Git', 'pnpm', 'ESLint', 'Prettier'] },
  ],
  about: {
    paragraphs: [
      'I care about the parts of an interface people feel before they notice them: how a label sits on its rule, where focus goes when a menu closes, what a page does when motion is turned off.',
      'I would rather get one detail right than ship five rough ones. Every page here is static, reads without JavaScript, and has a path for reduced motion.',
    ],
    signoff: 'Alwin',
  },
  contact: {
    lead: contact.statement.join(' '),
    copy: { label: 'Copy email address', done: 'Email address copied' },
    write: 'Write an email',
    time: `Local time in ${place.split(',')[0]}`,
    profiles,
  },
  footer: {
    note: `Hand-set by ${site.name}, one dashed line at a time.`,
    build: 'Build',
    top: 'Back to top',
    back: { label: 'The full site', href: '/' },
    tip: { before: 'Psst: ', after: ' finds anything.' },
  },
  search: {
    label: 'Search the site',
    placeholder: 'Search…',
    ideas: ['Search…', 'Try “key”', 'Try “email”', 'Try “dark”', 'Try “stack”'],
    empty: 'Nothing here. Try “stack”, “email” or “key”.',
    hints: { move: 'Move', run: 'Open', close: 'Close' },
    commands,
  },
  theme: { label: 'Dark mode' },
  ui: {
    current: 'Current',
    sections: 'Sections',
    index: 'Contents',
    home: 'Compact home',
    bunny: 'Pet the bunny',
  },
} satisfies CompactContent
