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

/** A tool's mark, drawn in sections/skill-logo.tsx. */
export type SkillLogo =
  | 'react'
  | 'typescript'
  | 'next'
  | 'gsap'
  | 'mongodb'
  | 'express'
  | 'node'
  | 'javascript'
  | 'tailwind'
  | 'figma'

export type SkillsContent = {
  /** The title, one entry per line (the drum's rail sets it on one line). */
  headline: readonly string[]
  /** The phone deck's hint under the title. */
  swipeHint: string
  /**
   * One face of the drum each: the name, its level (detail) and the tool's mark
   * (several for a stack, such as MERN).
   */
  rows: readonly { name: string; detail: string; logos: readonly SkillLogo[] }[]
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
  /** Listed on the compact site only, not in the full site's selected work. */
  compactOnly?: boolean
}

export type WorkContent = {
  /** The headline, one entry per line. */
  headline: readonly string[]
  /** The word on each project's tab, before its number ("Project 01"). */
  projectLabel: string
  /** The pointer's tag over a live project's screenshot. */
  viewSite: string
}

export type ContactContent = {
  /** The invitation, the section's heading, one entry per line. */
  statement: readonly string[]
  /** The invitation under the heading, a sentence or two. */
  lead: string
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
  /** The light/dark switch's name (it sits in the open menu's corner). */
  mode: string
  /** The handwritten note pointing to the compact site (lowercase: its face is cut to it). */
  compactNote: string
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
export type ExperienceItem = { org: string; role: string; current?: boolean; when?: string }

/** A course of study. Only verified facts; dates when known. */
export type EducationItem = { school: string; degree: string; field: string; when?: string }

/**
 * A piece of the interface, with its own page on the compact site's workbench
 * (/compact/components/<slug>), where it runs live.
 */
export type WorkbenchItem = {
  slug: string
  name: string
  /** One line on what it does. */
  note: string
  /** The same, short enough to sit whole on one line of the compact home's list. */
  line: string
  /** From Cairn (the owner's component library), on the full site, or kept for the library. */
  kind: 'cairn' | 'site' | 'library'
  /** What to do with it on the stage ("Hover it, or tab to it."). */
  hint: string
  /** How it behaves, from the component's own comment; nothing it does not do. */
  details: readonly string[]
  /** What makes it move: CSS, React, GSAP… */
  tech: readonly string[]
  /** Its file, from the repository's root. */
  source: string
  /** Where it is live: on the full site, or (for Cairn pieces) its page in Cairn's docs. */
  live?: NavItem
}

/** The workbench pages' own words. */
export type WorkbenchContent = {
  meta: { title: string; description: string }
  title: string
  note: string
  items: readonly WorkbenchItem[]
  /** The words the pieces are given on their stages. */
  demo: {
    /** The Cairn pieces' words on their stages. */
    cairn: {
      segments: { label: string; options: readonly string[]; value: string }
      cards: {
        label: string
        options: readonly { value: string; title: string; meta: string; description: string }[]
        value: string
      }
      slider: string
      records: {
        label: string
        items: readonly { title: string; artist: string; duration: number }[]
      }
    }
  }
  labels: {
    crumb: string
    stage: string
    replay: string
    behaviour: string
    tech: string
    source: string
    where: string
    docs: string
    kept: string
    cairn: string
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
  'arrow' | 'copy' | 'github' | 'hash' | 'home' | 'linkedin' | 'mail' | 'up' | 'box' | 'moon'

/** A profile link with its icon (the search's commands). */
export type ChipLink = NavItem & { icon: CompactIcon }

/** The compact site's sections, in page order. */
/** One instant photo: its caption, the note on its back and the two words stamped there. */
export type AlivePhoto = {
  title: string
  note: string
  stamp: readonly [string, string]
  image: StaticImageData
  alt: string
}

export type CompactSectionId = 'work' | 'workbench' | 'experience' | 'stack' | 'alive'

/** What a search result does when chosen. */
export type PaletteAction =
  | { kind: 'go'; href: string; external?: boolean }
  | { kind: 'copy'; text: string; done: string }
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

/** A part of the opening sentence: words, or one of the chips riding in it. */
export type LedePart =
  | string
  | { chip: 'job' | 'work' }
  /** Words shown selected, as in an editor, with a toolbar to restyle them. */
  | { select: string }

/**
 * The compact site (/compact): the portfolio in short, as a few plain sentences
 * and rows (owner's direction, November 2026).
 */
export type CompactContent = {
  meta: { title: string; description: string }
  /** In page order; `title` is the section's small heading. */
  sections: readonly { id: CompactSectionId; title: string }[]
  intro: {
    /** The profile picture: original art, not a photo. */
    avatar: { image: StaticImageData; alt: string }
    /** The place, short, beside its time. */
    place: string
    time: { zone: string; fallback: string }
    role: string
    /** The greeting, set in the text colour; the rest of the sentence after it. */
    hello: string
    lede: readonly LedePart[]
    /** The toolbar on the selected words: a small editor for three words. */
    restyle: {
      label: string
      /** Each face's name, set in that face (so only in glyphs its cut has). */
      faces: readonly {
        id: 'bricolage' | 'syne' | 'raleway' | 'funnel' | 'azeret' | 'space'
        label: string
      }[]
      /** What each style toggle is called, and the letter it shows. */
      styles: readonly {
        id: 'bold' | 'italic' | 'underline' | 'strike'
        label: string
        glyph: string
      }[]
      size: { smaller: string; larger: string }
      inks: readonly { id: 'ink' | 'red'; label: string }[]
      /** The desk's highlighters, behind the words. */
      marks: readonly { id: 'yellow' | 'pink' | 'blue'; label: string }[]
      reset: string
    }
    /** The way-out sentence: plain text with ballpoint chips between. */
    reach: readonly (string | NavItem)[]
  }
  work: {
    /** The rows for what is not out yet: a name, and what it says instead of a year. */
    soon: { items: readonly string[]; note: string; state: string }
  }
  /** The pieces are the workbench's (content/workbench.ts); the rest are a link away in Cairn. */
  workbench: { all: NavItem }
  experience: readonly { org: string; role: string; when: string }[]
  stack: { items: readonly string[] }
  /** What brings me alive: a strip of instant photos, each turned over for a note. */
  alive: {
    hint: string
    label: string
    /** The strip's buttons, and what turning a photo over is called. */
    prev: string
    next: string
    turn: string
    items: readonly AlivePhoto[]
  }
  footer: {
    /** The foot's links, named for assistive tech. */
    label: string
    made: string
    back: NavItem
    top: string
    /** The little note above the dominoes, asking for a push. */
    push: string
  }
  search: {
    label: string
    /** After the shortcut's keys in the top line ("⌘ K to search"). */
    hint: string
    /** The same, on a touch screen, where there are no keys. */
    touch: string
    placeholder: string
    /** What the idle field suggests, in turn. */
    empty: string
    commands: readonly PaletteCommand[]
  }
  /** The switch's name ("Dark mode"); it is on in dark. */
  theme: { label: string }
  ui: {
    /** The workbench pages' way back to the compact home. */
    home: string
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

/* The legal page (/legal): sections of paragraphs and lists. In a section's
   body a string is a paragraph and an array of strings is a list. */
export type LegalBlock = string | readonly string[]

export type LegalSection = {
  id: string
  heading: string
  body: readonly LegalBlock[]
}

export type LegalPart = {
  id: string
  title: string
  sections: readonly LegalSection[]
}

export type LegalContent = {
  title: string
  description: string
  updatedLabel: string
  updated: string
  intro: string
  contentsLabel: string
  partsLabel: string
  place: string
  summary: { label: string; points: readonly string[] }
  toTop: string
  parts: readonly LegalPart[]
  footerLink: NavItem
  home: NavItem
}

/* The not-found page (app/not-found.tsx). */
export type NotFoundContent = {
  title: string
  heading: string
  body: string
  cards: readonly string[]
  home: NavItem
  compact: NavItem
}
