import type {
  AboutContent,
  ContactContent,
  FooterContent,
  HeroContent,
  SiteConfig,
  SkillsContent,
  WorkContent,
} from '@/types/content'

/*
 * Hero copy. The statement and the index total are replaceable placeholders:
 * the total becomes the real project count once projects exist (ARCHITECTURE.md §7).
 */
export const hero = {
  eyebrow: 'Selected work',
  year: '2026',
  statement: ['I build', 'digital work', 'with an eye', 'for detail.'],
  index: { current: '01', total: '05' },
  name: 'Alwin Aby Mathew',
  role: 'Software engineer',
} satisfies HeroContent

/*
 * About copy. PLACEHOLDER: written from the values stated in the project brief
 * (frontend focus, interaction, visual craft, performance, accessibility, few
 * dependencies). It makes no claims about employers, years, clients or results.
 * Replace with final wording.
 */
export const about = {
  index: '01',
  label: 'About',
  statement: [
    'I make interfaces where engineering and visual craft meet.',
    'Fast, accessible, and considered down to the last state.',
  ],
  body: 'Most of my attention goes to the front end: typography, interaction and performance, built with as few moving parts as the work allows.',
  details: [
    { term: 'Focus', detail: 'Frontend engineering' },
    { term: 'Interests', detail: 'Interaction, visual craft' },
    { term: 'Approach', detail: 'Performance and accessibility first' },
  ],
} satisfies AboutContent

/*
 * Skills copy. PLACEHOLDER: every tool and practice listed is one this site is
 * actually built with (package.json and the repo's own implementation), and
 * nothing claims years, proficiency or employers. Extend or replace with real
 * experience before launch.
 */
export const skills = {
  index: '02',
  label: 'Skills',
  groups: [
    {
      index: '01',
      name: 'Engineering',
      description:
        'Typed, static-first interfaces with a small client footprint: server components by default, small islands where behavior needs them.',
      tools: ['Next.js', 'React', 'TypeScript'],
    },
    {
      index: '02',
      name: 'Interaction',
      description:
        'Motion and state designed together: CSS first, GSAP for orchestration, and a considered reduced-motion path for every sequence.',
      tools: ['GSAP', 'CSS motion', 'Focus management'],
    },
    {
      index: '03',
      name: 'Craft',
      description:
        'Type, spacing and color built as one token system, with accessibility and performance treated as part of the finish.',
      tools: ['Tailwind CSS', 'Design tokens', 'Accessibility', 'Performance'],
    },
  ],
} satisfies SkillsContent

export const work = { index: '03', label: 'Selected Work' } satisfies WorkContent

/*
 * Contact. PLACEHOLDER: no contact details exist in the project yet, so the
 * address below is deliberately fake (example.com is a reserved domain) and must
 * be replaced before launch. The statement makes no claim about availability.
 */
export const contact = {
  index: '04',
  label: 'Contact',
  statement: ['If something here caught your eye,', 'write to me.'],
  emailLabel: 'Email',
  email: 'your-email@example.com',
} satisfies ContactContent

/*
 * Footer. Only facts the project already holds: the name and year from `site`,
 * the existing navigation, and the two typefaces the site is set in.
 */
export const footer = {
  navLabel: 'Footer',
  toTop: 'Back to top',
  typeNote: 'Set in Bricolage Grotesque and Azeret Mono',
} satisfies FooterContent

/*
 * Site-wide identity and navigation. The hrefs point at section ids the
 * upcoming sections will own; until each section exists its link only updates
 * the URL hash.
 */
export const site = {
  name: 'Alwin Aby Mathew',
  role: 'Software engineer',
  year: '2026',
  nav: [
    { label: 'About', href: '/#about' },
    { label: 'Skills', href: '/#skills' },
    { label: 'Selected Work', href: '/#work' },
    { label: 'Contact', href: '/#contact' },
  ],
} satisfies SiteConfig
