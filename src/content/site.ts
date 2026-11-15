import type {
  AboutContent,
  CompactNoticeContent,
  ContactContent,
  EducationItem,
  ExperienceItem,
  FooterContent,
  HeroContent,
  LoaderContent,
  MenuContent,
  SiteConfig,
  WorkContent,
} from '@/types/content'

/*
 * Hero copy. The title is the name, on one line across the hero. The stack row
 * lists tools this site is built with (see `content/skills`).
 */
export const hero = {
  title: ['Alwin'],
  action: { label: 'See What I Build', href: '#work' },
  stack: { label: 'Built with', items: ['Next.js', 'React', 'TypeScript', 'GSAP'] },
  drawHint: 'Drag to draw',
} satisfies HeroContent

/* The owner's one-line pitch, from the previous portfolio's hero. */
export const tagline =
  'Crafting immersive digital experiences with a blend of creativity and technology.'

/*
 * The owner's roles, study and city, from the owner's resume (November 2026),
 * newest first. The one record of them: the full site's About and the compact
 * site both read these.
 */
export const experience = [
  {
    org: 'SOTI',
    role: 'Software Development Engineer in Test',
    current: true,
    when: 'Aug 2026 – Now',
  },
  { org: 'NeSt Digital', role: 'Software Engineer', when: 'Jun – Jul 2026' },
  { org: 'Galen AI', role: 'Freelance Frontend Developer', when: 'Mar – Apr 2026' },
  { org: 'Stealth startup', role: 'Founding Frontend Engineer', when: 'Aug – Oct 2025' },
] as const satisfies readonly ExperienceItem[]

export const education = [
  {
    school: 'MITS',
    degree: 'B.Tech',
    field: 'Computer Science, Honours in Machine Learning',
    when: '2022 – 2026',
  },
] as const satisfies readonly EducationItem[]

export const place = 'Ernakulam, Kerala'

const [job] = experience
const [degree] = education

/*
 * About copy. The statement opens the owner's About from the previous portfolio
 * (the rest of it is the compact site's About); the details are the facts above.
 */
export const about = {
  label: 'About me',
  statement: 'I translate complex problems into elegant and pure digital solutions.',
  details: [
    { term: 'Currently', detail: `${job.role} at ${job.org}` },
    { term: 'Studied', detail: `${degree.degree} in ${degree.field}, ${degree.school}` },
    { term: 'Based in', detail: place },
  ],
} satisfies AboutContent

export const work = {
  headline: ['Selected', 'work'],
  projectLabel: 'Project',
  viewSite: 'View site',
} satisfies WorkContent

/*
 * Contact: the heading, the owner's invitation from the previous portfolio
 * (`lead`, on the compact site) and its address.
 */
export const contact = {
  statement: ["Let's build", 'something together.'],
  lead: "Have a project in mind or just want to say hello? Feel free to reach out. I'm always open to discussing new ideas and opportunities.",
  email: 'alwinabyofficial@gmail.com',
  board: {
    copyLabel: 'Copy email address',
    hint: 'Click to copy',
    touchHint: 'Tap to copy',
    done: 'Copied!',
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
    'Polishing the red',
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
  profiles: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/alwin-aby-mathew/' },
    { label: 'GitHub', href: 'https://github.com/VirgoTheLord' },
  ],
  role: 'Software Engineer',
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
  mode: 'Dark mode',
  compactNote: 'psst, the short version',
} satisfies MenuContent

/*
 * The notice at the top of the home page that offers the compact site (/compact)
 * to a visitor who wants it short (interactive/compact-notice.tsx).
 */
export const compactNotice = {
  text: 'Prefer it short?',
  link: { label: 'Compact version', href: '/compact' },
  dismiss: 'Dismiss',
  label: 'Compact version',
} satisfies CompactNoticeContent
