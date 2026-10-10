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

> **Reference-replication phase.** While the site is rebuilt stage by stage from good-fella.com, the §3 anti-patterns and the §6 motion limits are suspended where the reference genuinely needs them (marquees, parallax, scroll pinning, durations of 1–3s for major transitions). Every exception is flagged in that stage's report, and the originality pass that follows decides which survive. Native scrolling stays the default, and typography stays locked. Color is the reference's own palette (§4).

## 4. Tokens

All tokens live in `src/app/globals.css` under Tailwind v4 `@theme`. Components use Tailwind classes that map to tokens. **Never use raw hex, px font sizes or arbitrary values (`[...]`) in components.** If you need one, add a token or justify it in a comment. Exact values are set in §9 decisions; the roles below are fixed.

### Color: black, white and signature orange

The exact palette of the good-fella.com reference, taken from its production CSS. Off-white and off-black are the structure: `#EEEEEE` canvas with `#141314` text in light, and the reverse in dark. Grey carries secondary text, translucent black or white carries rules, and orange is the signature accent: active states, marks, strong fields, selection and the brand field. Orange is never the default text color and never a page-wide canvas.

Values are exact and never altered for contrast. When a value cannot do a job in a mode, its role changes instead.

| Raw token | Value | What it can do |
|---|---|---|
| `orange` | `#FB460D` | The signature: the light accent and the brand field. 3.0:1 on `white`, so large text, fields and marks only there. Carries `black` text (5.3:1). |
| `orange-bright` | `#FD551D` | The accent on dark. 5.7:1 on `black`, so text-capable there. |
| `orange-soft` | `#FD8D68` | Marks and bars; the surface on a brand field. 2.0:1 on `white`: decorative only. |
| `orange-muted` | `#FD7142` | Muted background on a brand field. |
| `black` | `#141314` | Dark structure: the dark canvas and light-mode text. |
| `white` | `#EEEEEE` | Light structure: the light canvas and dark-mode text. |
| `paper` / `stone` | `#F7F7F7` / `#D5D5D5` | Muted background / surface in light. |
| `charcoal` / `graphite` | `#1A1A1A` / `#333333` | Muted background / surface in dark. `charcoal` is also muted text on orange (5.0:1). |
| `grey` / `grey-light` | `#696869` / `#818081` | Secondary text in light / dark (4.8:1 / 4.7:1). |

Components use the semantic tokens, not the raw ones.

| Token | Role | Light | Dark | Brand field |
|---|---|---|---|---|
| `bg` | the page | `white` | `black` | `orange` |
| `surface` | surfaces, plates | `stone` | `graphite` | `orange-soft` |
| `surface-2` | muted background | `paper` | `charcoal` | `orange-muted` |
| `fg` | primary text | `black` | `white` | `black` |
| `fg-muted`, `fg-subtle` | secondary text, labels, metadata | `grey` | `grey-light` | `charcoal` |
| `rule` | hairlines | black 10% | white 5% | black 20% |
| `rule-strong` | borders, section rules | black 20% | white 10% | black 30% |
| `accent` | signature: active states, fields, accent text | `orange` | `orange-bright` | `orange-bright` |
| `accent-secondary` | marks, bars. Never text | `orange-soft` | `orange-soft` | `orange-soft` |
| `accent-fg` | text on `accent` | `black` | `black` | `black` |
| `focus` | the focus ring | `black` | `white` | `black` |
| `selection`, `selection-fg` | `::selection` | `orange` / `white` | `orange-bright` / `black` | `white` / `black` |
| `ink`, `canvas` | aliases of `fg` and `bg` for the hero and the menu | | | |

- **Modes.** Light is the default. Dark follows `prefers-color-scheme`, and `data-theme="light"` or `"dark"` forces a mode on any subtree. `data-theme="brand"` is the reference's orange field (its preloader). It is applied to one surface or moment, never to the whole site.
- **Hierarchy:** primary text is `fg`, and secondary text and labels are grey. Orange marks what is active or important; most of the page stays black and white.
- **Limits that follow from the values:** in light, `orange` (3.0:1) is not small text, so small accent text belongs in dark mode or at large sizes. `orange-soft` is never text. On a brand field, emphasis comes from black, because the accent is orange on orange.
- Project imagery stays the color of the work. The interface does not tint it.
- Flat color only: no gradients except functional image-loading placeholders, and no glows, blur, texture or shadows.
- Colors are defined once, in `src/app/globals.css`. `/color-test` renders the real tokens in all three themes with roles and contrast ratios, and is the permanent reference.

### Typography: three roles, two families max

| Role | Use | Character |
|---|---|---|
| **Display** | Hero, project titles, large numbers | Large, confident, tight leading, used sparingly. May be an optical size or weight range of the text family. |
| **Text** | Body, case-study prose | Highly readable editorial face, comfortable at 17–19px. |
| **Label** | Wall labels, indices, metadata, figures, code | Mono or a grotesk with excellent tabular figures. Small and precise. |

- **Two families max** (e.g. one variable family for display + text, plus one label/mono family).
- **Fluid type scale** with `clamp()`, about a 1.25 ratio on mobile and 1.333 on desktop. Steps: `label, xs, sm, base, lg, xl, 2xl, 3xl, display, display-xl`. `display-xl` is reserved for exhibit titles. One extra step, `hero`, sits outside the ratio for the reference-replication phase: the hero headline on the reference's own fluid curve (32px at 375px to 96px at 1600px), in our face and tracking.
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
| `duration-intro` | 1200ms | the theme switch's roll; the page entrance runs on its own timeline (§6) |
| `duration-deliberate` | 700ms | one object changing form: the work-together button, both directions |
| `stagger` | 50ms | sequential elements |
| `ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | entrances, hover in (default) |
| `ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | movement between states |
| `ease-emphasis` | `cubic-bezier(0.83, 0, 0.17, 1)` | a long, symmetric move that rests at both ends (power4.inOut) |

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

- **Links:** inline links use one motif, `TextLink` (the reference's own): a line under the text runs out to the right on hover and focus while a new one runs in from the left behind it, and the reverse on leaving (0.7s, `cubic-bezier(0.625, 0.05, 0, 1)`). Navigation rows keep their quieter hover and buttons keep theirs. External links get a `↗` that nudges 1–2px diagonally on hover.
- **Tags/stack:** Label style, separated by `·`. No pills or backgrounds.
- **Buttons:** rare. Most actions are links. If needed, use a hairline border, no fill and no shadow, with a pressed state.

### Chrome

- **Header (navbar):** one fixed bar, recreated from good-fella.com with its own values as a deliberate study pass: the initials left, `MENU ≡` centred, the orange call to action right (hidden below lg). Closed, the bar is transparent with its contents on the frame edge at the top of the page, and past 50px of scroll a `surface` card with its contents 16px in. **The open menu is rebuilt from wearecasey.tv's menu** (its timeline and interaction, studied from its source; not its identity). Nothing slides over the page: a frost fades in over it (1.2s, `power2.out`), translucent black (62%) over a 40px backdrop blur (plain black where backdrop blur is unsupported), so the page goes soft and dark in place. The bar stays sharp on top: its card dissolves, its contents return to the frame edge, it takes the dark theme, the trigger's MENU and the wordmark's initials go out of focus as CLOSE and the first name come into it (0.8s), and the call to action blurs away (Contact is in the list). The destinations are one centred run of display type (`display-xl` from lg, `display` from md, a centred stacked `3xl` list below md), weights alternating 600 and 400 (the font file's range), each with its mono index on the top-left corner of its capitals (both trimmed to cap height with `text-box`) and a hairline slash one cap tall after it (from lg). The whole menu is one GSAP timeline, the reference's: all 1.2s `expo.inOut`, destination *i* at i×0.08s (spread over at most 0.4s whatever their number), the index and word rising from their masks, the slash opening from its middle; from 0.8s after its rise each word unfolds out of its first letter, a letter every 0.02s, its slash and the rest of its row riding along (the reference animates width; here each letter is placed at its kerned position in the real word and the unfold is transform and clip-path, so nothing reflows). Close plays the same timeline backwards at double speed, so any interruption simply turns around. Hover and keyboard focus share the reference's response: the other destinations recede to 30% and go out of focus (blur 8px, 12px from lg; 1s on the reference's curve, `cubic-bezier(0.76, 0, 0.24, 1)`, both ways). The page you are on has an accent square after its index, gone the moment the menu starts to close. Deliberate exceptions, by explicit request: `filter` and `backdrop-filter` blur, beyond the transform/opacity rule (measured at a steady 60fps with GPU rendering at 360–1440px). Reduced motion is a 0.2s fade of the frost, with nothing moving or unfolding.
- **Selected Work (reference-replication stage 6):** recreated from good-fella.com on a dark band (`data-theme="dark"`, even on a light page). From lg a left column is pinned under the header for the height of the screen (headline wiped in line by line, one line of copy, one 128×72 thumbnail per project, the action); the others dim to 40%, and one orange square sits beside the current project's thumbnail, turning a quarter on each move (0.8s, `cubic-bezier(0.68, -0.3, 0.32, 1.1)`). The current project is the one crossing the middle of the screen (half visible inside a 20% inset); a thumbnail scrolls its project there. The projects fill columns 5-12: a 16:10 image, 64px apart, whose picture is 30% larger and drifts ±15% as the frame crosses the screen (a CSS scroll timeline), zooms to 1.075 on a fine pointer (0.6s, `power3.out`), and a caption row under it (title in the label face from lg, tags as `[CATEGORY] — [YEAR]`). A title scrambles with accent noise as it enters and when the pointer reaches its image. Below lg it is one column with a sans title and the tags beneath. A project links out only when it has an `href`; then a "View project" label follows the pointer above it (trailing 0.7s, tilting with speed, popping in 0.35s). Deliberate departures from §3, flagged for the originality pass: parallax, a pointer-following label, and a pinned column. Our differences from the reference: no "View all" (there is no index page), so the action is "Write to me"; the header stays light over the dark band.
- **Contact (reference-replication stage 7):** recreated from good-fella.com's final section, a light band straight after the dark work band (the hard edge is the reference's), 128px above and below. Two columns from lg on the hero's frame: on the left the headline (wiped in) over a 16:9 panel 80px below it; on the right five columns (the reference spans four; our face sets the lead wider) a two-line lead (wiped in 0.3s after the headline), the role and year, the action and the name, spread over the left column's height. The reference's photograph is a brand-field panel (`data-theme="brand"`) carrying the address, whose rule runs out on hover and focus; it fades in (0.7s) as the lines rise from masks (0.8s, `power3.out`, 0.1s apart, after the wipes have started). The action is the shared `WorkTogetherButton` in its `ink` tone, now with a 44px touch area on coarse pointers. Everything stacks below lg. Flagged for the originality pass: the orange panel (a large flat brand field), and that the contact address is still the placeholder in `site.ts`.
- **Footer (reference-replication stage 8):** recreated from good-fella.com's footer on a dark band (`data-theme="dark"`) a screen tall, on the hero's frame edge, 48px of space above. Three columns across the top: the colophon (the typefaces and what the site is built with, each line led by an orange dot pulsing 1 to 0.5 every 2s), the destinations centred in mono capitals (each scrambles into place on hover or keyboard focus, 0.5s), and the address and "Back to top" as text links. The small print (year, name, role) sits centred 12.5% of the width below; the name is set huge and faint (10%) across the bottom edge. As the footer scrolls in its contents rise from 20% below into place, tied to the scroll (a CSS scroll timeline); once a fifth of it is on screen the small lines rise (0.8s) and the watermark's letters slide up one by one (1.4s, 0.05s apart). The navbar slides away (0.4s) once the footer reaches the top of the screen, as the reference's does, and returns on keyboard focus. Everything stacks below lg. Left out: the reference's newsletter form, availability claims, legal links and ASCII painting (nothing real to put there). Flagged for the originality pass: the scroll uncover (parallax, §3) and the perpetual dot pulse (§3 forbids looping decoration).

## 6. Motion language

Motion should feel **tactile, restrained and physical**: things settle into place, respond to touch, and never perform.

- **Signature moment:** a single preloader and hero entrance, one timeline. The preloader is recreated from good-fella.com with its own values: on the brand field, four squares roll out one by one (0.5s each, `expo.inOut`, 25% overlap) while the label scrambles in; at 1.625s a line pivoting on the bottom-left corner sweeps the field away (clip-path, 1.05s, `expo.inOut`), and at 90% of the sweep the page is cued to enter. The hero entrance that follows is in §9.3 (decision 3). It plays on every full load of the home page (as the reference does), runs about 4.6s to the last settle, over the 1.2s budget by explicit request, and any wheel, touch or key input fast-forwards it.
- **Media:** project images are not revealed; they drift inside their frame as the frame crosses the screen and zoom to 1.075 on a fine pointer (Selected Work, §5 Chrome).
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

**Settled:** visual direction (§1). Typography (§9.1). Color (§9.2), the exact good-fella.com palette for the reference-replication phase.

### 9.1 Typography

Two families, both SIL Open Font License 1.1, self-hosted from `src/fonts/`.

| Role | Face | Weight | Optical size |
|---|---|---|---|
| Display | Bricolage Grotesque | 500 | 96 for the hero and large figures (`display-xl`, `display`, `2xl`); 48 for project titles and case-study headings (`3xl`, `xl`) |
| Text | Bricolage Grotesque | 400 | 16 |
| Label | Azeret Mono | 500 for metadata and indexes; 400 for captions | none |

The Bricolage file is width 100 with weight limited to 400–600. The Azeret file is weight 400–500. There is no italic cut.

### 9.2 Color

The good-fella.com orange system in §4: light, dark and the brand field. Canonical reference: `/color-test`, which renders the production tokens in all three with roles and contrast numbers. Do not add another color exploration page.

### 9.3 Remaining decisions

| # | Decision | Constraints | How to decide |
|---|---|---|---|
| 3 | **Hero concept** | Delivers the 5-second objective; LCP is text or one optimized media element; ≤ 1.2s intro; no §3 patterns | Sketch 2–3 concepts. Judge on first impression and the first interaction. |

**Decision 3, in review.** The hero follows the good-fella.com hero's spacing, type and entrance (reference-replication Stage 3) on one centre line: on the navbar's edge (16px, 32px from lg) and 52px down, the name on two hand-broken lines (`text-hero`), the line under it and the actions (the orange primary action and an underlined text link) centred in the screen, and the stack row centred along the bottom edge. Entrance (one timeline with the preloader, `hero-intro.tsx`): as the page enters, from 768px the navbar slides down and fades in as one piece 0.35s later (0.9s, at once below) and the copy 0.3s after that, each headline line wiped by an accent block and a text-coloured block (0.45s each, `power3.inOut`, lines 0.15s apart), then the line rising from its mask (0.8s), the actions and the stack row lifting 20px into place. Scrolling away, the hero's contents drift down by 35% of its height (a CSS scroll-driven animation). The reference's ASCII-art image was left out by choice. Deliberate departures from this file, flagged for the originality pass: the intro length, the centred composition (§3) and parallax on scroll (§3).
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

Shipped beyond this list: a light/dark switch in the navbar panel, a pill whose sun knob rolls across and is eclipsed into a moon while the new mode grows over the page as a circle from the knob. The choice is stored and applied before first paint. Hero text is black in light mode and white in dark.
