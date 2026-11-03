import type { ChipLink, CompactContent, PaletteCommand } from '@/types/content'
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

/* The owner's tagline, with the words the hand-drawn line sits under. */
const mark = 'creativity and technology'
const [before = '', after = ''] = tagline.split(mark)

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
 * The compact site (/compact): the portfolio in short (DESIGN.md §5b). Every fact
 * comes from `site.ts` and `projects`; the stack is this site's own tools plus
 * the ones the owner's previous portfolio listed and the projects use. No
 * writing, contribution graph, visitor count or availability: the project holds
 * none of them. The About paragraphs are the owner's, from the previous
 * portfolio.
 */
export const compact = {
  meta: {
    /* The whole tab title (it replaces the root template). */
    title: `${site.name} · ${site.role}, in short`,
    description: `${site.role} in ${place}. ${tagline} The work, a workbench of live interface pieces, the stack and how to reach me, on one page.`,
  },
  back: { label: 'Full site', href: '/' },
  terminal: { prompt: '~/compact $', command: 'cd ../full-site' },
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
      { label: 'write to me', href: mailto },
      ', or take the long way round on the ',
      { label: 'full site', href: '/' },
      '.',
    ],
  },
  work: {
    note: 'Cairn, my component library, for now. More is on the way.',
    view: 'Open the live site',
    source: 'Source',
  },
  workbench: {
    note: 'The premium pieces from Cairn, my component library. Each one runs live on its own page: poke it, hover it, break it.',
    open: workbench.labels.open,
  },
  experience: [
    { kind: 'Work', org: job.org, role: job.role, current: job.current },
    { kind: 'Study', org: degree.school, role: `${degree.degree}, ${degree.field}` },
  ],
  stack: [
    { name: 'Language', items: ['TypeScript', 'JavaScript', 'HTML', 'CSS'] },
    { name: 'Frontend', items: ['React', 'Next.js', 'Tailwind CSS', 'GSAP', 'Lenis'] },
    { name: 'Backend', items: ['Node.js', 'Express', 'MongoDB'] },
    { name: 'Workflow', items: ['Git', 'pnpm', 'ESLint', 'Prettier', 'Figma'] },
  ],
  about: {
    paragraphs: [
      'I translate complex problems into elegant and pure digital solutions, with a strong focus on quality and user experience.',
      'I believe in the power of simplicity and clarity, and I strive to create products that are not only functional but also beautiful and intuitive.',
    ],
    signoff: 'Alwin',
  },
  contact: {
    lead: contact.lead,
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
    empty: 'Nothing here. Try “stack”, “email” or “key”.',
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
