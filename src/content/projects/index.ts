import type { ProjectMeta } from '@/types/content'
import cairnCover from './cairn/cover.png'

/*
 * Selected work. Only Cairn for now (owner's choice, November 2026): its live
 * site is w-ui.vercel.app; the repository is private, so no source link. No
 * placeholder projects: the compact site says more is on the way in one line.
 * The section renders however many are listed, in this order.
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
]
