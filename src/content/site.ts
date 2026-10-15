import type {
  AboutContent,
  ContactContent,
  FooterContent,
  HeroContent,
  LoaderContent,
  MenuContent,
  SiteConfig,
  WorkContent,
} from '@/types/content'

/*
 * Hero copy. The title is the name, on one line across the hero. The line under it names the
 * three areas the Skills section is organised around (engineering, interaction,
 * craft), so it claims nothing the page does not already say. The stack row
 * lists tools this site is built with (see `content/skills`).
 */
export const hero = {
  title: ['Alwin'],
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

export const work = {
  label: 'Selected Work',
  headline: ['Selected', 'work'],
  projectLabel: 'Project',
  action: { label: "Let's Talk", href: '/#contact' },
} satisfies WorkContent

/*
 * Contact. PLACEHOLDER: no contact details exist in the project yet, so the
 * address below is deliberately fake (example.com is a reserved domain) and must
 * be replaced before launch. The statement makes no claim about availability.
 */
export const contact = {
  statement: ['If something here caught your eye,', 'write to me.'],
  email: 'your-email@example.com',
  board: {
    copyLabel: 'Copy email address',
    hint: 'Click to copy',
    touchHint: 'Tap to copy',
    done: 'Copied',
  },
} satisfies ContactContent

/*
 * Footer. Only facts the project already holds: the name, role and year from
 * `site`, the existing navigation, the stack from the hero, and the two typefaces
 * the site is set in. There are no social profiles, no location and no
 * availability in the project, so none are listed (and no live clock stands in
 * for them).
 */
/*
 * The preloader's voice: a status line under the counter, dry and a little
 * self-aware, about the work that really goes into this site (the grid, the
 * type, the flexbox, the code that was deleted). It claims nothing it is not
 * doing, and says hello when the count reaches 100.
 */
export const loader = {
  status: [
    'Warming up the pixels',
    'Aligning the grid',
    'Kerning the numbers',
    'Negotiating with flexbox',
    'Deleting unused code',
    'Polishing the orange',
    'Almost there. Probably.',
  ],
  done: 'Hello.',
} satisfies LoaderContent

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
