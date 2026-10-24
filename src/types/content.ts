import type { StaticImageData } from 'next/image'

export type HeroContent = {
  /** The name, one entry per line. */
  title: readonly string[]
  /** The one action, to the work. */
  action: { label: string; href: string }
  /** The tools this site is built with, listed in the footer. */
  stack: { label: string; items: readonly string[] }
  /** The prompt to draw on the grid, shown on touch screens only. */
  drawHint: string
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
  /** The public source repository, when there is one. */
  source?: string
}

export type WorkContent = {
  /** The headline, one entry per line. */
  headline: readonly string[]
  /** The word on each project's tab, before its number ("Project 01"). */
  projectLabel: string
}

export type ContactContent = {
  /** The invitation, the section's heading, one entry per line. */
  statement: readonly string[]
  email: string
  /** The departures board: what clicking it does, how to, and the confirmation. */
  board: { copyLabel: string; hint: string; touchHint: string; done: string }
  /** The button under the board that opens the mail app. */
  write: string
}

export type FooterContent = {
  navLabel: string
  /** The headings of the four columns; the second is the hero's own "Built with". */
  navigationLabel: string
  typefacesLabel: string
  contactLabel: string
  /** The two typefaces the site is actually set in. */
  typefaces: readonly string[]
  /** The contact column's mail link. */
  email: string
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
  /** Profiles elsewhere (LinkedIn), each a label and its address. */
  profiles: readonly NavItem[]
  role: string
  year: string
  nav: readonly NavItem[]
}

/** A role held at an organisation. Only verified facts; dates when known. */
export type ExperienceItem = { org: string; role: string; current?: boolean }

/** A course of study. Only verified facts; dates when known. */
export type EducationItem = { school: string; degree: string; field: string }

/**
 * A piece of the interface, with its own page on the compact site's workbench
 * (/compact/components/<slug>), where it runs live.
 */
export type WorkbenchItem = {
  slug: string
  name: string
  /** One line on what it does. */
  note: string
  /** On the full site today, or kept for the UI library. */
  kind: 'site' | 'library'
  /** What to do with it on the stage ("Hover it, or tab to it."). */
  hint: string
  /** How it behaves, from the component's own comment; nothing it does not do. */
  details: readonly string[]
  /** What makes it move: CSS, React, GSAP… */
  tech: readonly string[]
  /** Its file, from the repository's root. */
  source: string
  /** Where it is live on the full site. */
  live?: NavItem
}

/** The workbench pages' own words. */
export type WorkbenchContent = {
  meta: { title: string; description: string }
  title: string
  note: string
  items: readonly WorkbenchItem[]
  /** The words the pieces are given on their stages. */
  demo: { arrow: string; key: string; lens: string; tagged: string; tag: string; section: string }
  labels: {
    crumb: string
    stage: string
    replay: string
    behaviour: string
    tech: string
    source: string
    where: string
    kept: string
    site: string
    library: string
    prev: string
    next: string
    all: string
    open: string
  }
}

/** The compact site's line icons (components/ui/icon.tsx). */
export type CompactIcon =
  | 'arrow'
  | 'copy'
  | 'github'
  | 'grid'
  | 'hash'
  | 'home'
  | 'linkedin'
  | 'mail'
  | 'up'
  | 'box'
  | 'moon'

/** A link set as a small chip inside a sentence (the intro's "find me on …"). */
export type ChipLink = NavItem & { icon: CompactIcon }

/** The compact site's sections, in page order; the order numbers them. */
export type CompactSectionId = 'work' | 'workbench' | 'experience' | 'stack' | 'about' | 'contact'

/** What a search result does when chosen. */
export type PaletteAction =
  | { kind: 'go'; href: string; external?: boolean }
  | { kind: 'copy'; text: string; done: string }
  | { kind: 'grid' }
  | { kind: 'theme' }

/** One search result. Every one does something real. */
export type PaletteCommand = {
  id: string
  group: string
  label: string
  icon: CompactIcon
  /** Other words the filter matches ("mail" for the email). */
  keywords?: string
  action: PaletteAction
}

/** The compact site (/compact): the portfolio in short, for a visitor in a hurry. */
export type CompactContent = {
  meta: { title: string; description: string }
  back: NavItem
  /** In page order; `number` is the order, written "01"; `short` names it in the bar. */
  sections: readonly { id: CompactSectionId; title: string; short?: string; number: string }[]
  intro: {
    /** The line above the name: where, and the time there. */
    place: string
    /** The place's coordinates, which the place rolls over to on hover. */
    coords: string
    time: { zone: string; fallback: string }
    role: string
    /** The statement; `mark` is the words the hand-drawn line underlines. */
    statement: { before: string; mark: string; after: string }
    note: string
    /** The way-out sentence: plain text with chips between. */
    reach: readonly (string | ChipLink)[]
  }
  work: { note: string; view: string; source: string }
  workbench: { note: string; open: string }
  experience: readonly { kind: string; org: string; role: string; current?: boolean }[]
  stack: readonly { name: string; items: readonly string[] }[]
  about: { paragraphs: readonly string[]; signoff: string }
  contact: {
    lead: string
    copy: { label: string; done: string }
    write: string
    /** The label before the owner's local time. */
    time: string
    profiles: readonly ChipLink[]
  }
  footer: {
    note: string
    build: string
    top: string
    back: NavItem
    tip: { before: string; after: string }
  }
  search: {
    label: string
    placeholder: string
    /** What the idle field suggests, in turn. */
    ideas: readonly string[]
    empty: string
    hints: { move: string; run: string; close: string }
    commands: readonly PaletteCommand[]
  }
  /** The switch's name ("Dark mode"); it is on in dark. */
  theme: { label: string }
  ui: {
    current: string
    sections: string
    index: string
    home: string
    /** The bunny's name as a button ("Pet the bunny"). */
    bunny: string
  }
}

/** The notice on the full site's home page that offers the compact site. */
export type CompactNoticeContent = {
  text: string
  link: NavItem
  dismiss: string
  /** Its accessible name, for the landmark. */
  label: string
}
