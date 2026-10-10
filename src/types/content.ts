import type { StaticImageData } from 'next/image'

export type HeroContent = {
  /** The headline, one entry per line: the reference breaks it by hand. */
  title: readonly string[]
  /** The line under the headline. */
  intro: string
  /** The primary action, and the text link beside it. */
  action: { label: string; href: string }
  secondary: { label: string; href: string }
  /** The row along the bottom edge: a label and the tools this site is built with. */
  stack: { label: string; items: readonly string[] }
}

export type AboutContent = {
  label: string
  /** The first card's line. */
  statement: string
  /** One card each: the term is the card's label, the detail its line. */
  details: readonly { term: string; detail: string }[]
}

export type SkillsContent = {
  /** The section label beside the headline, and the menu's name for it. */
  label: string
  headline: string
  groups: readonly {
    index: string
    name: string
    description: string
    tools: readonly string[]
  }[]
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
  text: string
  /** The call to action under the thumbnails. */
  action: { label: string; href: string }
  /** The thumbnail strip's accessible name, and the prefix of each link's. */
  thumbsLabel: string
  goTo: string
}

export type ContactContent = {
  label: string
  /** The headline. */
  headline: string
  /** The lead under it, one entry per line. */
  statement: readonly string[]
  emailLabel: string
  email: string
}

export type FooterContent = {
  navLabel: string
  toTop: string
  /** Names the two typefaces the site is actually set in. */
  typeNote: string
}

export type NavItem = { label: string; href: string }

/** The expanded navbar: what it says besides the destinations. */
export type MenuContent = {
  label: string
  closeLabel: string
  home: NavItem
  /** The call to action in the bar, from lg up. */
  action: NavItem
  /** The colour-mode switch: its label and the name of each mode. */
  themeLabel: string
  themeLight: string
  themeDark: string
  /** Short facts: the role and the year (set in the contact section). */
  status: readonly string[]
}

export type SiteConfig = {
  name: string
  role: string
  year: string
  nav: readonly NavItem[]
}
