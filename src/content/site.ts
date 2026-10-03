import type { HeroContent, SiteConfig } from '@/types/content'

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
