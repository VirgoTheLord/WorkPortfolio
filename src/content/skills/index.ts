import type { SkillsContent, SkillsPageContent, SkillVisual } from '@/types/content'
import designSystemCover from '../projects/design-system/cover.png'
import navigationCover from '../projects/navigation/cover.png'
import portfolioCover from '../projects/portfolio/cover.png'
import accessibilityShot from './accessibility.png'
import motionShot from './motion.png'
import scrollShot from './scroll.png'
import typographyShot from './typography.png'

/*
 * Skills, for the home section and the full page (/skills). Every skill listed is
 * one this site is actually built with (package.json and the repo's own
 * implementation), and every visual is a real screenshot of this site, so nothing
 * here claims years, proficiency, clients or results. Extend with real experience
 * as it exists.
 */

const visuals = {
  site: {
    image: portfolioCover,
    alt: 'The portfolio home page: the name set large on an off-white ground, an orange call to action and small monospace labels.',
  },
  motion: {
    image: motionShot,
    alt: 'The preloader mid-count: a black disc on an orange field, the digits rising inside it, a status line reading "Warming up the pixels".',
  },
  scroll: {
    image: scrollShot,
    alt: 'The pinned Selected Work stage: the headline and project tabs on the left, a project cover sweeping in on the right.',
  },
  interaction: {
    image: navigationCover,
    alt: 'The open navbar: a panel with the destinations set large beside contact details and two project cards, over a dimmed page.',
  },
  system: {
    image: designSystemCover,
    alt: 'The color reference page: twelve labelled palette swatches, orange first, above a list of semantic tokens.',
  },
  type: {
    image: typographyShot,
    alt: 'The About cards: four light panels, each with a short statement set large in Bricolage Grotesque and a monospace label beneath.',
  },
  access: {
    image: accessibilityShot,
    alt: 'The footer navigation with a visible focus ring drawn around the first link, Home.',
  },
} satisfies Record<string, SkillVisual>

export const skills = {
  label: 'Skills',
  rows: [
    { name: 'Frontend', detail: 'React · Next.js', visual: visuals.site },
    { name: 'Motion', detail: 'GSAP', visual: visuals.motion },
    { name: 'Scroll', detail: 'ScrollTrigger · Lenis', visual: visuals.scroll },
    { name: 'Interaction', detail: 'States · Focus', visual: visuals.interaction },
    { name: 'Design systems', detail: 'Tokens', visual: visuals.system },
    { name: 'Typography', detail: 'Type scales', visual: visuals.type },
    { name: 'Accessibility', detail: 'Keyboard · Contrast', visual: visuals.access },
  ],
  more: { label: 'See all', href: '/skills', tag: 'Skills' },
} satisfies SkillsContent

export const skillsPage = {
  meta: {
    title: 'Skills',
    description:
      'Frontend engineering, interaction and motion, design engineering, and the tools behind them.',
  },
  title: ['Serious', 'about the', 'details.'],
  scrollCue: 'Scroll',
  intro: {
    label: 'Design. Code. Motion.',
    text: 'Design, engineering and motion come together here, so the result feels as considered as it looks. I care about the parts most people never consciously notice: the curve of an easing, the rhythm of a type scale, the way a page answers a key press, and what it still does when motion is turned off.',
  },
  tools: {
    label: 'Built with Next.js, React, TypeScript and GSAP',
    items: ['next', 'react', 'typescript', 'gsap'],
  },
  heading: { lines: ['Design', 'meets', 'engineering.'], visualLine: 1, visual: visuals.motion },
  groupsLabel: 'Disciplines',
  groups: [
    {
      index: '01',
      name: 'Frontend engineering',
      text: 'Interfaces built with React and Next.js on strict TypeScript: server components by default, small client islands only where behaviour needs them, and every route rendered ahead of time so the page arrives finished.',
      skills: [
        'React',
        'Next.js',
        'TypeScript',
        'Server components',
        'Responsive layout',
        'Static rendering',
        'Accessibility',
        'Performance',
      ],
      link: { label: 'See the work', href: '/#work' },
      visual: visuals.site,
    },
    {
      index: '02',
      name: 'Interaction & motion',
      text: 'Motion designed with the interface, not laid on top of it: CSS for the small moments, GSAP and ScrollTrigger for choreography, smooth scrolling where it earns its place, and a reduced-motion path for every sequence.',
      skills: [
        'GSAP',
        'ScrollTrigger',
        'Lenis',
        'Scroll-driven motion',
        'Micro-interactions',
        'Pointer effects',
        'Focus management',
        'Reduced motion',
      ],
      link: { label: 'See it in motion', href: '/#work' },
      visual: visuals.scroll,
    },
    {
      index: '03',
      name: 'Design engineering',
      text: 'Design intent carried into code: one token system for type, spacing and colour, contrast measured rather than guessed, and details tuned in the browser until they hold at every width.',
      skills: [
        'Design systems',
        'Design tokens',
        'Tailwind CSS',
        'Typography',
        'Layout systems',
        'Interaction states',
        'Colour contrast',
        'Visual refinement',
      ],
      link: { label: 'See the palette', href: '/color-test' },
      visual: visuals.system,
    },
    {
      index: '04',
      name: 'Tools & systems',
      text: 'The work behind the work: version control, strict types and linting, a static build checked on every change, and performance budgets kept as requirements rather than wishes.',
      skills: [
        'Git',
        'pnpm',
        'ESLint',
        'Prettier',
        'Static builds',
        'Vercel',
        'Performance budgets',
        'Maintainability',
      ],
      visual: {
        label: 'The route table from this site’s production build: every route static.',
        build: [
          'Route (app)     Type',
          '/               Static',
          '/_not-found     Static',
          '/color-test     Static',
          '/skills         Static',
        ],
      },
    },
  ],
  closing: {
    label: 'In practice',
    statement: [
      'Everything listed here',
      'is in use on this site,',
      'from the first frame of',
      'the preloader to the',
      'last line of the footer.',
    ],
    visual: visuals.type,
    link: { label: 'See selected work', href: '/#work' },
  },
  cta: {
    lines: ["Let's work", 'together'],
    visualLine: 1,
    visual: visuals.interaction,
    text: ['If something here caught your eye,', 'write to me.'],
    link: { label: 'Say hello', href: '/#contact', tag: "Let's talk" },
  },
} satisfies SkillsPageContent
