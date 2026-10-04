# DESIGN.md

Visual and interaction rules. The goal is a site that feels authored, not generated. Every visual choice should look deliberate and specific to this person.

---

## 1. Identity

> **A digital exhibition of exceptionally crafted work, presented with editorial typography and engineering-level precision.**

**5-second objective.** Within about 5 seconds a visitor should feel: _"This person has taste, builds polished interactions, and pays obsessive attention to detail."_ Every design decision is judged against that sentence.

**Composition of the identity**

| Source | Weight | What we take |
|---|---|---|
| **C: Exhibition** (primary) | dominant | The work is the visual hero. Large, confident compositions, room to breathe, one project per viewport, wall-label metadata. |
| **A: Editorial** | supporting | Sophisticated typography, excellent spacing, editorial composition, deliberate asymmetry, strong written case studies, restraint. |
| **B: Precision** | accent | Precise technical metadata, numbers and indices as visual language, grid logic made visible where it helps, meticulous interaction states. |

**How engineering quality is communicated:** through _execution_ (interaction quality, speed, typographic precision, flawless states at every breakpoint), **not** by looking like technical documentation. B contributes detail, never costume.

**Interaction is a primary differentiator.** The first hover, the first focus ring and the first transition are part of the 5-second impression. Treat them with the same care as the hero.

### Drift guardrails

| The site must not become… | Symptom | Counter |
|---|---|---|
| A generic minimalist agency site | Huge type + empty space + nothing specific | Real work fills the frame. Metadata is precise and personal. Details reward a second look. |
| An editorial blog | Text-first pages, prose before work | Media leads every project. Prose lives in case studies, not on the home page. |
| A hacker terminal | Mono everywhere, green/black, fake CLI | Mono only for labels and numbers. No prompts, cursors or glitch effects. |
| A design gallery template | Uniform masonry/grid of thumbnails | Varied, composed layouts per project. Numbered sequence. Written context. |
| An AI-generated portfolio | Anything in §3 | Check §3 before every visual proposal. |
| An effects showcase | Motion you notice before content | Motion answers an interaction or reveals content. Otherwise it's cut. |

## 2. Principles

1. **The work is the hero; the interface is the frame.** UI recedes so the projects can lead.
2. **Content is the interface.** Words and work carry the page. Decoration has to earn its place.
3. **One idea per viewport.** Don't stack competing focal points.
4. **Systematic, then intentional breaks.** Follow the grid 95% of the time so the 5% that breaks it reads as a choice.
5. **Interaction is the proof.** Every interactive element has designed rest, hover, focus, pressed and (where relevant) loading/complete states.
6. **Details reward attention.** Optical alignment, typographic finesse and state polish should show up on second look.
7. **Fast is a feature of the design.** If an effect costs the performance budget, the effect loses.

## 3. Anti-patterns (never ship these)

These are the tells of a template or AI-generated portfolio:

- Gradient blobs, mesh/aurora backgrounds, glassmorphism, neon glow, purple-to-blue gradients, decorative gradients of any kind
- Card-heavy layouts: bento grids, identical rounded cards, hover-lift, drop shadows
- "Hi, I'm X 👋", typing/typewriter hero effects, rotating job-title text
- Emoji as icons, tech-logo walls, skill percentage bars, "years of experience" counters
- Particle/starfield/3D-blob backgrounds, custom cursors, cursor-follow spotlights, magnetic buttons
- WebGL or 3D used for spectacle, parallax everywhere, scroll-jacking
- Testimonial carousels, marquee logo strips, "Let's build something amazing together"
- Centered-everything layouts, uniform `rounded-2xl` everywhere, gray-on-gray low-contrast text
- Stock illustrations, AI-generated imagery, generic laptop/phone mockups
- Section titles like "My Skills", "Tech Stack", "What I Do"
- Terminal cosplay (fake prompts, blinking cursors, glitch text) and spec-sheet cosplay (dimension lines and crosshairs on everything)
- Uniform masonry or thumbnail grids of projects

## 4. Tokens

All tokens live in `src/app/globals.css` under Tailwind v4 `@theme`. Components use Tailwind classes that map to tokens. **Never use raw hex, px font sizes or arbitrary values (`[...]`) in components.** If you need one, add a token or justify it in a comment. Exact values are set in §9 decisions; the roles below are fixed.

### Color: pure white, bold green, a layered tonal system

A pure white foundation with a bold green identity, built from four exact greens that form a tonal system, in light and dark modes. Strong visual personality comes from color fields, type and composition, never from gradients or decoration.

White is space. Green is identity. The deepest green reads; the lighter greens are volume.

The four brand greens are exact and are never altered, tinted or "fixed" for contrast. When a green cannot do a job, its role changes instead of its value.

| Brand green | Value | Role |
|---|---|---|
| `green-deep` (primary) | `#5C7057` | Identity. The only green that reads as text on white (5.4:1). Strong fields. |
| `green-mid` (secondary) | `#89A482` | Marks, rules and graphics in light; the strong field and small text in dark. |
| `green-soft` | `#ACC5A6` | Hairlines and a second surface in light; secondary text in dark. |
| `green-light` | `#D1EDD3` | Surfaces and mats in light; primary text in dark. |

Components use the semantic tokens, not the brand greens directly.

| Token | Role | Light | Dark |
|---|---|---|---|
| `bg` | the page | `#FFFFFF` | mode surface `#0D130E` |
| `surface` | the plate/mat behind project media | `green-light` | raised mode surface `#161E17` |
| `surface-2` | a second surface | `green-soft` | raised mode surface |
| `fg` | primary text | `green-deep` | `green-light` |
| `fg-muted` | secondary text | `green-deep` | `green-soft` |
| `fg-subtle` | wall labels, metadata, indices | `green-deep` | `green-mid` |
| `rule` | hairlines (1px). Low contrast, structural | `green-soft` | `green-deep` |
| `rule-strong` | emphasized rules: active row, section boundaries | `green-mid` | `green-mid` |
| `accent` | identity, active state, strong fields, links, text that must be readable | `green-deep` | `green-mid` |
| `accent-secondary` | marks, bars, borders, oversized numerals. Never small text | `green-mid` | `green-soft` |
| `accent-fg` | text on `accent` | `#FFFFFF` | mode surface |
| `focus` | the focus ring | `green-deep` | `green-light` |

- **Modes.** Light is the default. Dark follows `prefers-color-scheme`, and `data-theme="light"` or `"dark"` forces a mode on any subtree. There is no toggle yet. Dark is its own composition, not an inversion: the lightest greens carry text, the mid green is the field, the deepest green drops to hairlines and panels.
- **Mode surfaces** (`#0D130E`, `#161E17`) are neutral rooms for dark mode, not brand colors. Do not add more neutrals.
- **One text color in light.** `fg`, `fg-muted` and `fg-subtle` are the same green, so hierarchy comes from size, weight and the label face, and link state from underline weight rather than color.
- **Limits that follow from the values:** `green-mid` and `green-soft` are graphics, fields and borders on white, never text. Light text on `green-deep` is 4.3:1 (`green-light`, large text only) or 5.4:1 (white). `green-deep` is 3.5:1 on the dark surface, so it is hairlines and panels there, never small text.
- Project imagery stays the color of the work. The interface does not tint it.
- Flat color only: no gradients except functional image-loading placeholders, and no glows, blur, texture or shadows.
- Colors are defined once, in `src/app/globals.css`. `/color-test` renders the real tokens in both modes and is the permanent reference.

### Typography: three roles, two families max

| Role | Use | Character |
|---|---|---|
| **Display** | Hero, project titles, large numbers | Large, confident, tight leading, used sparingly. May be an optical size or weight range of the text family. |
| **Text** | Body, case-study prose | Highly readable editorial face, comfortable at 17–19px. |
| **Label** | Wall labels, indices, metadata, figures, code | Mono or a grotesk with excellent tabular figures. Small and precise. |

- **Two families max** (e.g. one variable family for display + text, plus one label/mono family).
- **Fluid type scale** with `clamp()`, about a 1.25 ratio on mobile and 1.333 on desktop. Steps: `label, xs, sm, base, lg, xl, 2xl, 3xl, display, display-xl`. `display-xl` is reserved for the hero and exhibit titles.
- Body: line-height 1.5–1.6, measure **60–72ch**.
- Display: leading 0.95–1.1, negative tracking scaled to size, `text-wrap: balance`. Prose uses `text-wrap: pretty`.
- Labels: `tabular-nums`, lining figures, slight positive tracking (+0.02–0.06em). Uppercase only if the face supports it well at small sizes.
- **Optical alignment:** large display text gets a token-based negative inline offset so glyph stems, not side bearings, align to the grid. Use hanging punctuation for pull quotes.
- Real typographic characters: curly quotes, en/em dashes, `×`, `→`, non-breaking spaces before units and between index and title.

### Space & layout: the exhibition grid

- 4px base unit. Use the Tailwind spacing scale and don't invent off-scale values.
- **12-column grid** on desktop, 4 on mobile. Fluid gutters and margins (`clamp`).
- Rhythm tokens: `section-y` (between sections) and `exhibit-y` (between projects, noticeably larger, about 60–100% of the viewport height, clamped).
- Max content width about 1440px. Media may go full-bleed. Prose is constrained by measure.
- **Deliberate asymmetry:** labels and metadata sit in narrow columns (e.g. 1–3), and work and prose sit offset (e.g. 4–12 or 2–10). Never center a whole composition by default.
- **Visible grid logic, where appropriate:** hairline `rule`s at section boundaries, column-aligned label rows and index markers. The grid should be _felt_ everywhere and _seen_ only in a few places.

### Media

- Aspect-ratio tokens: `media-wide` (16:10), `media-cinema` (21:9), `media-tall` (4:5), `media-square` (1:1). Every project picks from these.
- Plate padding token: media can sit on a `surface` mat with consistent inset, like a mounted print.
- No device mockups. Show real UI cropped with intent, at real pixel density.

### Shape & elevation

- Radius: `none` by default. `sm` (2–4px) only where it mirrors the radius inside the work being shown.
- **No drop shadows.** Separate with space, hairline rules and surface tone.

### Motion tokens (roles fixed; values tuned by feel in Phase 6)

| Token | Starting value | Use |
|---|---|---|
| `duration-instant` | 90ms | pressed/active feedback |
| `duration-fast` | 160ms | hover in, color, focus |
| `duration-base` | 240ms | hover out, small state changes |
| `duration-slow` | 600ms | text/section reveals |
| `duration-media` | 900ms | media reveals |
| `duration-intro` | ≤ 1200ms total | hero sequence |
| `stagger` | 50ms | sequential elements |
| `ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | entrances, hover in (default) |
| `ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | movement between states |
| `ease-press` | `cubic-bezier(0.3, 0, 0.5, 1)` | press/release |

GSAP uses the same values, exported from `lib/motion/gsap.ts`.

## 5. Components (visual rules)

The final pattern for presenting projects is decided in §9.3 (decision 4). The rules below hold whatever pattern is chosen.

### Interaction states (applies to everything interactive)

- Define **rest, hover, focus-visible and pressed** for every element. Add **loading/complete** where an action exists (e.g. copy email).
- **Hover and focus-visible look identical** apart from the focus ring. Keyboard users get the full experience.
- **Asymmetric timing:** states enter at `duration-fast` and leave at `duration-base`. That asymmetry is what makes them feel physical.
- **Pressed** gives tactile feedback with a tiny transform (≤ 1–2px translate or 0.98 scale) at `duration-instant`.
- **No layout shift on any state change.** Animate transform/opacity/color only. Reserve space for revealed content.
- Touch devices get pressed states and statically visible previews, never hover-only information.

### Exhibit (a project on the home page)

- One project per viewport, large media composition, generous `exhibit-y` spacing.
- **Wall label:** index (`01`), title, year, role and "medium" (the stack), set in Label style and column-aligned. Optionally add one hard number (a metric with units).
- Each exhibit uses one of a **small fixed set of compositions** (e.g. full-bleed, offset-wide, label-left/media-right). Vary them deliberately. Never repeat the same composition for consecutive projects.
- The whole exhibit is one link with a clear accessible name. Hover/focus responses are restrained: media scales ≤ 1.02 inside a fixed clip, or crossfades to a short muted loop; the index/arrow advances a few px; a `rule` strengthens. Nothing lifts or casts a shadow.

### Project index (compact list, e.g. on /about or the footer of a case study)

- Numbered rows: `01 · Title · Role · Year`, tabular, rule-separated.
- On fine pointers, hovering or focusing a row shows a preview in a **fixed, anchored slot**. It never follows the cursor.

### Case study page

- Opens with a large media plate and a precise meta block (role, timeline, team, stack, links, key numbers).
- Editorial body: prose at measure in an offset column. Sidenotes, figures and metrics sit in the margin column on desktop and go inline on mobile.
- Media breaks out of the measure to wide or full-bleed. Figures are numbered (`Fig. 03`) with Label-style captions.
- Ends with the next project presented as an exhibit preview, not a "Next →" button.

### Links, labels, buttons

- **Links:** underline with offset. On hover, thickness and color shift. External links get a `↗` that nudges 1–2px diagonally on hover.
- **Tags/stack:** Label style, separated by `·`. No pills or backgrounds.
- **Buttons:** rare. Most actions are links. If needed, use a hairline border, no fill and no shadow, with a pressed state.

### Chrome

- **Header:** minimal (name + 2–3 links), recedes visually. It may hide on scroll down and show on scroll up with zero layout shift. It may show the current exhibit index (`03 / 05`).
- **Footer:** copyable email (with a designed "copied" state), links, colophon, and a build stamp (date · short commit hash).

## 6. Motion language

Motion should feel **tactile, restrained and physical**: things settle into place, respond to touch, and never perform.

- **Signature moment:** a single hero intro, under 1.2s total, playing once per session. The concept is decided in §9.3 (decision 3).
- **Media reveals:** clip-path inset opening plus a slight scale settle (≈1.04 → 1) at `duration-media`, plays once. This is the main "exhibition" gesture.
- **Text reveals:** subtle 8–16px translate plus opacity on headings and labels, with short stagger. Never on body paragraphs.
- **Micro-interactions:** link underlines, exhibit hover, index-row previews, copy confirmation, focus transitions. This is where most of the craft budget goes.
- **One thing moves at a time.** Don't run competing animations in the same viewport.
- **Never:** bounce/elastic easing, parallax on text, parallax as a default, scroll-jacking, looping decorative animation, cursor-driven effects, anything that delays reading content.
- **Reduced motion:** everything appears in its final state instantly. Color/opacity fades of ≤ 150ms are acceptable. Video loops show their poster frame.

## 7. Responsive

- Mobile-first. Design at 360px, 768px, 1024px, 1440px and 1920px+.
- Layouts reflow; they don't just shrink. Asymmetric desktop compositions become a single strong column, and media stays large.
- Touch targets ≥ 44px. No hover-only information: anything shown on hover is also reachable by focus or tap.
- Use `dvh`/`svh` for full-height sections and never rely on `100vh` on mobile.
- At 1920px+, add space and scale media. Don't stretch line lengths.

## 8. Accessibility (visual)

- Focus ring: 2px `focus` outline with offset, visible on the page in both modes and on top of media.
- Never convey meaning with color alone.
- Respect user font-size settings: type uses `rem`, not px.
- Text must stay readable at 200% zoom and 320px width without horizontal scroll.
- Video loops are muted, captioned when they carry meaning, and pausable.

## 9. Open decisions

**Settled:** visual direction (§1). Typography (§9.1). Color (§9.2).

### 9.1 Typography

Two families, both SIL Open Font License 1.1, self-hosted from `src/fonts/`.

| Role | Face | Weight | Optical size |
|---|---|---|---|
| Display | Bricolage Grotesque | 500 | 96 for the hero and large figures (`display-xl`, `display`, `2xl`); 48 for project titles and case-study headings (`3xl`, `xl`) |
| Text | Bricolage Grotesque | 400 | 16 |
| Label | Azeret Mono | 500 for metadata and indexes; 400 for captions | none |

The Bricolage file is width 100 with weight limited to 400–600. The Azeret file is weight 400–500. There is no italic cut.

### 9.2 Color

The green system in §4: pure white foundation, four exact greens, light and dark modes. Canonical reference: `/color-test`, which renders the production tokens in both modes and keeps the contrast numbers. Do not add another color exploration page.

### 9.3 Remaining decisions

| # | Decision | Constraints | How to decide |
|---|---|---|---|
| 3 | **Hero concept** | Delivers the 5-second objective; LCP is text or one optimized media element; ≤ 1.2s intro; no §3 patterns | Sketch 2–3 concepts. Judge on first impression and the first interaction. |
| 4 | **Project presentation pattern** | Exhibit rules in §5; small fixed composition set; works with 3–5 projects; strong on mobile | Prototype with real assets for at least 2 projects |

## 10. Details that reward exploration

Candidates. Ship **3–5**, chosen after decisions 1–4. Each must be CSS-only or ≤ 1 KB of island JS, accessible, and invisible to anyone not looking for it.

- `::selection` and the text caret in `accent`
- A grid-overlay toggle (`G` key) that reveals the 12-column layout system, documented on `/colophon`
- A header exhibit counter (`03 / 05`) that updates as you scroll
- Footer build stamp (date · commit hash) linking to the colophon
- A copy-email interaction with a precise, designed confirmation state
- A print stylesheet for case studies (clean, paginated, URLs printed)
- Numbered figures and sidenotes in case studies that cross-reference on hover/focus
- Fine-tuned `text-underline-offset` and optical kerning on the name/wordmark
