import type { StaticImageData } from 'next/image'

export type HeroContent = {
  /** The name, one entry per line. */
  title: readonly string[]
  /** The one action, to the work. */
  action: { label: string; href: string }
  /** The tools this site is built with, listed in the footer. */
  stack: { label: string; items: readonly string[] }
}

export type AboutContent = {
  label: string
  /** The first card's line. */
  statement: string
  /** One card each: the term is the card's label, the detail its line. */
  details: readonly { term: string; detail: string }[]
}

/** A real screenshot of this site, standing for one skill. `alt` is required. */
export type SkillVisual = {
  image: StaticImageData
  alt: string
}

export type SkillsContent = {
  /** The section label, and the menu's name for it. */
  label: string
  /** One row each: the name set large, the detail beside it on hover. */
  rows: readonly { name: string; detail: string; visual: SkillVisual }[]
  /** The link to the full page; `tag` is the word the cursor carries over it. */
  more: { label: string; href: string; tag: string }
}

export type SkillsPageContent = {
  /** Page metadata. */
  meta: { title: string; description: string }
  /** The hero headline, one entry per line. */
  title: readonly string[]
  scrollCue: string
  intro: { label: string; text: string }
  /** The four marks that rise under the intro, named for assistive tech. */
  tools: { label: string; items: readonly ('next' | 'react' | 'typescript' | 'gsap')[] }
  /** The headline over the groups, one entry per line; the visual sits at the start of `visualLine`. */
  heading: { lines: readonly string[]; visualLine: number; visual: SkillVisual }
  groupsLabel: string
  groups: readonly {
    index: string
    name: string
    text: string
    skills: readonly string[]
    link?: { label: string; href: string }
    /** A screenshot, or the build's own route table set as text. */
    visual: SkillVisual | { build: readonly string[]; label: string }
  }[]
  closing: {
    label: string
    statement: readonly string[]
    visual: SkillVisual
    link: { label: string; href: string }
  }
  cta: {
    lines: readonly string[]
    visualLine: number
    visual: SkillVisual
    text: readonly string[]
    /** `tag` is the word the cursor carries over the link. */
    link: { label: string; href: string; tag: string }
  }
}

export type ProjectMeta = {
  slug: string
  title: string
  /** One or two sentences. Reused later for the case study's meta description. */
  summary: string
  category: string
  year: string
  stack: readonly string[]
  /** `alt` is required: the cover is the project's primary evidence. */
  cover: {
    image: StaticImageData
    alt: string
  }
  /** Destination, when a case study or live site exists. Omitted until then. */
  href?: string
}

export type WorkContent = {
  label: string
  /** The headline, one entry per line. */
  headline: readonly string[]
  /** The word on each project's tab, before its number ("Project 01"). */
  projectLabel: string
  /** The call to action after the last project. */
  action: { label: string; href: string }
}

export type ContactContent = {
  /** The invitation, the section's heading, one entry per line. */
  statement: readonly string[]
  email: string
  /** The departures board: what clicking it does, how to, and the confirmation. */
  board: { copyLabel: string; hint: string; touchHint: string; done: string }
}

export type FooterContent = {
  navLabel: string
  /** The headings of the four columns; the second is the hero's own "Built with". */
  navigationLabel: string
  typefacesLabel: string
  contactLabel: string
  /** The two typefaces the site is actually set in. */
  typefaces: readonly string[]
  toTop: string
}

export type NavItem = { label: string; href: string }

/** The expanded navbar: what it says besides the destinations. */
export type MenuContent = {
  label: string
  closeLabel: string
  home: NavItem
  /** The call to action in the bar, from lg up. */
  action: NavItem
  /** Short facts: the role and the year (set in the contact section). */
  status: readonly string[]
}

export type LoaderContent = {
  /** What the preloader says while it counts, one line per stretch of the count. */
  status: readonly string[]
  /** The line it lands on when the count reaches 100. */
  done: string
}

export type SiteConfig = {
  name: string
  /** The logo: a short mark set in the mark face (Deutsch Gothic). */
  mark: string
  role: string
  year: string
  nav: readonly NavItem[]
}
