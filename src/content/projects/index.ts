import type { ProjectMeta } from '@/types/content'
import cairnCover from './cairn/cover.png'
import galenCover from './galen/cover.png'

/*
 * Selected work (owner's choice, November 2026): Cairn, the owner's library
 * (live at w-ui.vercel.app; the repository is private, so no source link), and
 * Galen AI's landing page, freelance work from the resume (live at
 * galenai.io, a Next.js site; the compact site only). No placeholder projects.
 * The sections render however many they list, in this order; the full site
 * reads `fullSiteProjects`.
 */
export const projects: readonly ProjectMeta[] = [
  {
    slug: 'cairn',
    title: 'Cairn',
    summary:
      'A library of 30 React components, each built around a single interaction. Install it as a package, or copy the files and own them.',
    category: 'Component library',
    year: '2026',
    stack: ['React', 'TypeScript', 'CSS'],
    href: 'https://w-ui.vercel.app',
    cover: {
      image: cairnCover,
      alt: 'The Cairn home page: "Interface details, stacked with care." set large in white over a red, scan-lined backdrop, above a Browse components button and an npm install command.',
    },
  },
  {
    slug: 'galen-ai',
    title: 'Galen AI',
    /* Freelance work: in the compact site's list, not the full site's
       selected work (owner's call, November 2026). */
    compactOnly: true,
    summary:
      'The landing page for GalenAI, an AI mentor for medical exams: built freelance for clean UI and conversion, with an interactive product demo for onboarding.',
    category: 'Landing page',
    year: '2026',
    stack: ['Next.js', 'React'],
    href: 'https://galenai.io',
    cover: {
      image: galenCover,
      alt: 'The GalenAI home page: "Your personal AI companion for daily medical learning." in black and orange, above Try GalenAI and Download Now For Free buttons and a row of medical college logos.',
    },
  },
]

/* The full site's selected work: everything not kept for the compact site. */
export const fullSiteProjects = projects.filter((project) => !project.compactOnly)
