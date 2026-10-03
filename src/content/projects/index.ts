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
export const projects = [
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
      alt: 'The portfolio home page: a large statement in warm ink with its last phrase in racing green, a brass rule, and small monospace labels on an ivory ground.',
    },
  },
  {
    slug: 'design-system',
    title: 'Heritage design system',
    summary:
      'Ivory, ink, racing green and antique brass, set in Bricolage Grotesque and Azeret Mono and documented as tokens with measured contrast.',
    category: 'Design system',
    year: '2026',
    stack: ['Tailwind CSS', 'Design tokens'],
    cover: {
      image: designSystemCover,
      focus: 'left',
      alt: 'A palette specimen listing the rule, racing green and antique brass tokens as labelled swatches on ivory.',
    },
  },
  {
    slug: 'navigation',
    title: 'Full-screen navigation',
    summary:
      'A native dialog menu driven by one reversible GSAP timeline: focus trapped, scroll locked, and a reduced-motion path that keeps every function.',
    category: 'Interaction',
    year: '2026',
    stack: ['GSAP', 'Native dialog'],
    cover: {
      image: navigationCover,
      focus: 'left',
      alt: 'The open full-screen menu: a racing green surface with About, Skills, Selected Work and Contact set large in ivory beside small index numbers.',
    },
  },
] satisfies readonly ProjectMeta[]
