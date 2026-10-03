import type { StaticImageData } from 'next/image'

export type HeroContent = {
  eyebrow: string
  year: string
  /** Block-level phrases. Each wraps inside itself at narrow widths. */
  statement: readonly string[]
  index: { current: string; total: string }
  name: string
  role: string
}

export type AboutContent = {
  index: string
  label: string
  /** Sentences set as separate blocks so each can reveal on its own. */
  statement: readonly string[]
  body: string
  details: readonly { term: string; detail: string }[]
}

export type SkillsContent = {
  index: string
  label: string
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
    /** Which side of the image to keep when a frame crops it. Defaults to center. */
    focus?: 'left' | 'center'
  }
  /** Destination, when a case study or live site exists. Omitted until then. */
  href?: string
}

export type WorkContent = { index: string; label: string }

export type ContactContent = {
  index: string
  label: string
  /** Sentences set as separate blocks so each can reveal on its own. */
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

export type SiteConfig = {
  name: string
  role: string
  year: string
  nav: readonly NavItem[]
}
