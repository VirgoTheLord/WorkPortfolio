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
  drawHint: 'Drag to draw',
} satisfies HeroContent

/*
 * About copy. The statement is the owner's; the details are facts from the owner's
 * LinkedIn profile (October 2026): the current role, the degree, the city.
 */
export const about = {
  label: 'About',
  statement: 'I make interfaces where engineering and visual craft meet.',
  details: [
    { term: 'Currently', detail: 'Software Engineer in Test at SOTI' },
    { term: 'Studied', detail: 'B.Tech in Computer Science, MITS' },
    { term: 'Based in', detail: 'Ernakulam, Kerala' },
  ],
} satisfies AboutContent

export const work = {
  headline: ['Selected', 'work'],
  projectLabel: 'Project',
} satisfies WorkContent

/*
 * Contact: the owner's public address (from the owner's LinkedIn profile's contact
 * details). The statement makes no claim about availability. The phone number
 * on that profile is deliberately not published here.
 */
export const contact = {
  statement: ['If something here caught your eye,', 'write to me.'],
  email: 'alwinabymathew@gmail.com',
  board: {
    copyLabel: 'Copy email address',
    hint: 'Click to copy',
    touchHint: 'Tap to copy',
    done: 'Copied',
  },
  write: 'Write an email',
} satisfies ContactContent

/*
 * Footer. Only facts the project holds: the name, role and year from `site`, the
 * existing navigation, the stack from the hero, the two typefaces the site is set
 * in, and the owner's profiles (`site.profiles`). No live clock or availability.
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
  email: 'Email',
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
  /** Profiles elsewhere, linked from the footer. */
  profiles: [{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/alwin-aby-mathew/' }],
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
