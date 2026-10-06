import type { ProjectMeta } from '@/types/content'
import designSystemCover from './design-system/cover.png'
import navigationCover from './navigation/cover.png'
import portfolioCover from './portfolio/cover.png'

/*
 * Selected work. The repo holds no client or personal projects yet, so these are
 * three real, shipped pieces of this portfolio, each shown with a genuine
 * screenshot of the running site (src/content/projects/<slug>/cover.png).
 * Everything stated is checkable in the repository; no outcomes, metrics or
 * employers are claimed. Replace or extend with real projects as they exist:
 * the section renders however many are listed, in this order.
 */
export const projects: readonly ProjectMeta[] = [
  {
    slug: 'portfolio',
    title: 'This portfolio',
    summary:
      'A static Next.js build with a token-based design system, a CSS-first motion language, and GSAP where it earns its place.',
    category: 'Design & engineering',
    year: '2026',
    stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'GSAP'],
    cover: {
      image: portfolioCover,
      alt: 'The portfolio home page: the name set large in black on an off-white ground, an orange call to action and small monospace labels.',
    },
  },
  {
    slug: 'design-system',
    title: 'Design system',
    summary:
      'Off-white, off-black and signature orange, set in Bricolage Grotesque and Azeret Mono and documented as tokens with measured contrast.',
    category: 'Design system',
    year: '2026',
    stack: ['Tailwind CSS', 'Design tokens'],
    cover: {
      image: designSystemCover,
      alt: 'The color reference page: twelve labelled palette swatches, orange first, above a list of semantic tokens.',
    },
  },
  {
    slug: 'navigation',
    title: 'Navigation',
    summary:
      'An expanding navbar panel with separate open and close sequences in GSAP: the page behind goes inert, focus returns to the trigger, and a reduced-motion path keeps every function.',
    category: 'Interaction',
    year: '2026',
    stack: ['GSAP', 'CSS'],
    cover: {
      image: navigationCover,
      alt: 'The open navbar: a panel with Home, About, Skills, Selected Work and Contact set large beside contact details and two project cards, over a dimmed page.',
    },
  },
]
