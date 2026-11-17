import type { ChipLink, CompactContent, PaletteCommand } from '@/types/content'
import anime from './alive/anime.jpg'
import dance from './alive/dance.jpg'
import drift from './alive/drift.jpg'
import game from './alive/game.jpg'
import sing from './alive/sing.jpg'
import sketch from './alive/sketch.jpg'
import hood from './profile/hood.svg'
import { projects } from './projects'
import { contact, education, experience, place, site } from './site'
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
  { id: 'alive', title: 'Stuff that brings me alive' },
]

/*
 * What the search finds (interactive/site-search.tsx): the page's sections, the
 * work (on the full site, and this site's source), every workbench piece, the
 * ways to get in touch, and the site itself. Section links carry the page's
 * path, so they work from a workbench page too.
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
]

/*
 * The compact site (/compact): the portfolio in short, as a few plain
 * sentences and rows (owner's direction, November 2026). Every fact comes from
 * `site.ts`, `projects` and the workbench; nothing here is invented: the
 * unreleased work is named only as what is next, and the last section holds
 * what the owner loves doing.
 */
export const compact = {
  meta: {
    /* The whole tab title (it replaces the root template). */
    title: `${site.name} — ${site.role}`,
    description: `${site.name}, ${site.role.toLowerCase()} in ${place}, India. Software Development Engineer in Test at ${job.org}; frontend work in Next.js, React and TypeScript; and Cairn, a React component library.`,
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
      ' ',
      { light: 'day', text: 'by day' },
      ', and ',
      { light: 'night', text: 'by night' },
      ' I build ',
      { chip: 'work' },
      ', a library of ',
      { tiles: ['interface', 'pieces'] },
      ' that each do ',
      { select: 'one thing well' },
      '.',
    ],
    /* Each face's button is set in that face, from a cut holding only these
       names' letters and the phrase's (src/fonts/restyle). */
    restyle: {
      label: 'Restyle these words',
      faces: [
        { id: 'bricolage', label: 'Bricolage' },
        { id: 'syne', label: 'Syne' },
        { id: 'raleway', label: 'Raleway' },
        { id: 'funnel', label: 'Funnel' },
        { id: 'azeret', label: 'Azeret' },
        { id: 'space', label: 'Space' },
      ],
      styles: [
        { id: 'bold', label: 'Bold', glyph: 'B' },
        { id: 'italic', label: 'Italic', glyph: 'I' },
        { id: 'underline', label: 'Underline', glyph: 'U' },
        { id: 'strike', label: 'Strike through', glyph: 'S' },
      ],
      size: { smaller: 'Smaller', larger: 'Larger' },
      inks: [
        { id: 'ink', label: 'Ink' },
        { id: 'red', label: 'Red' },
      ],
      marks: [
        { id: 'yellow', label: 'Yellow highlighter' },
        { id: 'pink', label: 'Pink highlighter' },
        { id: 'blue', label: 'Blue highlighter' },
      ],
      reset: 'Reset',
    },
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
      items: ['What comes next'],
      note: 'Currently cooking',
      state: 'Soon',
    },
  },
  workbench: {
    all: { label: 'Browse all in Cairn', href: 'https://w-ui.vercel.app/components' },
  },
  experience: [
    ...experience.map((item) => ({ org: item.org, role: item.role, when: item.when })),
    { org: degree.school, role: `${degree.degree}, ${degree.field}`, when: degree.when },
  ],
  stack: {
    items: [
      'TypeScript',
      'JavaScript',
      'Python',
      'Go',
      'HTML',
      'CSS',
      'React',
      'Next.js',
      'Tailwind CSS',
      'GSAP',
      'Framer Motion',
      'Lenis',
      'Node.js',
      'Express',
      'MongoDB',
      'PostgreSQL',
      'Prisma',
      'Git',
      'pnpm',
      'ESLint',
      'Prettier',
      'Figma',
    ],
  },
  /* The owner's own stage photo; the other five were made for the site with
     Figma AI from original prompts (credited on /legal). The notes are the
     owner's interests in his words, drafted November 2026. */
  alive: {
    hint: 'Tap one to turn it over',
    label: 'Stuff that brings me alive, as instant photos',
    prev: 'Previous photo',
    next: 'Next photo',
    turn: 'turn it over',
    items: [
      {
        title: 'one more run',
        note: 'Gaming. Right now that means Phantom Blade Zero.',
        stamp: ['PLAYING', 'NIGHTS'],
        image: game,
        alt: 'An ink painting of a swordsman in a straw hat on a cliff under a huge red moon, in the rain.',
      },
      {
        title: 'singing',
        note: 'I sing. That’s me, mid-song.',
        stamp: ['SINGING', 'LIVE'],
        image: sing,
        alt: 'Alwin singing into a microphone on a dark stage.',
      },
      {
        title: 'dancing',
        note: 'I dance when the song is right.',
        stamp: ['DANCING', 'OFTEN'],
        image: dance,
        alt: 'A breakdancer frozen upside down on one hand in a cobbled street at sunset.',
      },
      {
        title: 'sketching',
        note: 'I draw, mostly sketches.',
        stamp: ['DRAWING', 'PENCIL'],
        image: sketch,
        alt: 'A pencil sketch of a teddy bear on a pad, a pencil beside it.',
      },
      {
        title: 'one day: drift',
        note: 'One day: a mountain pass and a proper drift, Initial D style.',
        stamp: ['SOMEDAY', 'TOUGE'],
        image: drift,
        alt: 'A black-and-white ink drawing of a car drifting through a mountain hairpin at night, smoke behind it.',
      },
      {
        title: 'anime, always',
        note: 'Anime, always. Ask me for one to watch.',
        stamp: ['WATCHING', 'ALWAYS'],
        image: anime,
        alt: 'An anime swordsman in a black kimono, red energy around him, under a full moon.',
      },
    ],
  },
  footer: {
    label: 'Footer',
    made: 'Fun, all the way.',
    top: 'Back to top',
    push: 'go on, knock them over',
    back: { label: 'The full site', href: '/' },
  },
  search: {
    label: 'Search the site',
    hint: 'to search',
    touch: 'Search',
    placeholder: 'Search…',
    empty: 'Nothing here. Try “stack”, “email” or “work”.',
    commands,
  },
  theme: { label: 'Dark mode' },
  ui: {
    home: 'Compact home',
  },
} satisfies CompactContent
