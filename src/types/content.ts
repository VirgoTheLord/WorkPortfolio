export type HeroContent = {
  eyebrow: string
  year: string
  /** Block-level phrases. Each wraps inside itself at narrow widths. */
  statement: readonly string[]
  index: { current: string; total: string }
  name: string
  role: string
}

export type NavItem = { label: string; href: string }

export type SiteConfig = {
  name: string
  role: string
  year: string
  nav: readonly NavItem[]
}
