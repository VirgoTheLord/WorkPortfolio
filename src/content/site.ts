import type {
  AboutContent,
  ContactContent,
  FooterContent,
  HeroContent,
  MenuContent,
  SiteConfig,
  SkillsContent,
  WorkContent,
} from '@/types/content'

/*
 * Hero copy. The title is the name, on one line across the hero. The line under it names the
 * three areas the Skills section is organised around (engineering, interaction,
 * craft), so it claims nothing the page does not already say. The stack row
 * lists tools this site is built with (see `skills`).
 */
export const hero = {
  title: ['Alwin Aby Mathew'],
  intro: 'Code · Motion · Craft',
  action: { label: 'See What I Build', href: '#work' },
  stack: { label: 'Built with', items: ['Next.js', 'React', 'TypeScript', 'GSAP'] },
} satisfies HeroContent

/*
 * About copy. PLACEHOLDER: written from the values stated in the project brief
 * (frontend focus, interaction, visual craft, performance, accessibility, few
 * dependencies). It makes no claims about employers, years, clients or results.
 * Replace with final wording.
 */
export const about = {
  label: 'About',
  statement: 'I make interfaces where engineering and visual craft meet.',
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
  label: 'Skills',
  headline: 'How I build.',
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

export const work = {
  label: 'Selected Work',
  headline: ['Selected', 'work.'],
  text: 'Three pieces of this site, shown as they run.',
  action: { label: "Let's Talk", href: '/#contact' },
  thumbsLabel: 'Projects',
  goTo: 'Go to',
} satisfies WorkContent

/*
 * Contact. PLACEHOLDER: no contact details exist in the project yet, so the
 * address below is deliberately fake (example.com is a reserved domain) and must
 * be replaced before launch. The statement makes no claim about availability.
 */
export const contact = {
  label: 'Contact',
  headline: 'Get in touch.',
  statement: ['If something here caught your eye,', 'write to me.'],
  emailLabel: 'Email',
  email: 'your-email@example.com',
} satisfies ContactContent

/*
 * Footer. Only facts the project already holds: the name, role and year from
 * `site`, the existing navigation, the stack from the hero, and the two typefaces
 * the site is set in. There are no social profiles, no location and no
 * availability in the project, so none are listed (and no live clock stands in
 * for them).
 */
export const footer = {
  navLabel: 'Footer',
  navigationLabel: 'Navigation',
  typefacesLabel: 'Typefaces',
  contactLabel: 'Contact',
  typefaces: ['Bricolage Grotesque', 'Azeret Mono'],
  toTop: 'Back to top',
} satisfies FooterContent

/*
 * Site-wide identity and navigation. The hrefs point at section ids the
 * upcoming sections will own; until each section exists its link only updates
 * the URL hash.
 */
export const site = {
  name: 'Alwin Aby Mathew',
  mark: 'AW',
  role: 'Software engineer',
  year: '2026',
  nav: [
    { label: 'About', href: '/#about' },
    { label: 'Skills', href: '/#skills' },
    { label: 'Selected Work', href: '/#work' },
    { label: 'Contact', href: '/#contact' },
  ],
} satisfies SiteConfig

/*
 * The navbar and its menu: the trigger's two labels, the destinations (Home,
 * then the sections above), the bar's call to action, and the role and year the contact section sets.
 */
export const menu = {
  label: 'Menu',
  closeLabel: 'Close',
  home: { label: 'Home', href: '/' },
  action: { label: "Let's Talk", href: '/#contact' },
  status: [site.role, `Portfolio ${site.year}`],
} satisfies MenuContent
