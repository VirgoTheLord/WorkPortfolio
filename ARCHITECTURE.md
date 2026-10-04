# ARCHITECTURE.md

Technical decisions for the portfolio. If code and this file disagree, either fix the code or update this file in the same change. Don't let them drift.

---

## 1. Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js, latest stable, App Router** | RSC lets us ship near-zero component JS; first-class metadata, image, font and OG tooling. |
| Language | **TypeScript, `strict: true`** + `noUncheckedIndexedAccess` | Content schemas are types. A type error fails the build. |
| Styling | **Tailwind CSS v4** (CSS-first `@theme`, no JS config) | Tokens live in CSS. No runtime cost. |
| Motion | **CSS first. GSAP core** (+ ScrollTrigger only if needed) for orchestrated sequences | GSAP is lazy-loaded inside client islands and never sits on the critical path. |
| Content | **Local MDX** via `@next/mdx` + typed TS modules | No CMS, no frontmatter parser. Metadata is exported from MDX as typed JS. |
| Fonts | `next/font/local` with self-hosted variable woff2 | No layout shift, no third-party requests. |
| Images | `next/image` (AVIF/WebP) | Explicit dimensions, responsive `sizes`. |
| OG images | `next/og` (`ImageResponse`, built in) | Generated at build time. No extra dependency. |
| Package manager | **pnpm** (via corepack) | Strict `node_modules` prevents phantom deps, which supports the minimal-dependency rule. |
| Lint/format | ESLint (flat config, `eslint-config-next`) + Prettier + `prettier-plugin-tailwindcss` | Standard and boring on purpose. |
| Testing | Playwright + `@axe-core/playwright` (smoke + a11y), Lighthouse CI budgets | Added in Phase 5. Add unit tests (Vitest) only when real logic exists. |
| Hosting | **Vercel**, every route statically prerendered | Zero-config image optimization. No servers, no database, no API routes. |

**Recorded trade-off:** Astro would ship less JS by default. We chose Next.js because of preference and ecosystem, and we keep JS low through discipline: server components by default and small client islands.

Pin exact versions at scaffold time and record them in `package.json`. Don't use `^` ranges for `next`, `react`, `react-dom` or `gsap`.
TypeScript and ESLint follow the majors that `create-next-app` targets for our Next version (currently TS 5, ESLint 9), not npm `latest`.

---

## 2. Information architecture

```
/                     Home: positioning, selected work, short about, experience, contact
/work/[slug]          Case study (3–5 total, statically generated, dynamicParams = false)
/about                Longer bio, principles, how I work, résumé link
/colophon             How this site is built: stack, perf budget, decisions. It proves the engineering claims.
/404                  Designed not-found page
/resume.pdf           Static file in /public
/sitemap.xml, /robots.txt, OG images   Generated
```

**Home section order:** Hero (name + one-sentence positioning) → Selected Work (3–4) → About (short) → Experience (compact timeline) → Contact (email + links).

**Case study shape:** Summary/meta (role, timeline, stack, links) → Problem → Constraints → Key decisions → Outcome (with numbers when possible) → Reflection → Next project link.

**Deferred:** `/writing` and RSS. Add them only once at least 3 real posts exist. Never ship an empty section.

---

## 3. Directory structure

```
src/
  app/
    layout.tsx                 root shell: fonts, <html lang>, skip link, header/footer
    page.tsx                   home
    about/page.tsx
    colophon/page.tsx
    work/[slug]/page.tsx
    work/[slug]/opengraph-image.tsx
    opengraph-image.tsx
    not-found.tsx
    sitemap.ts
    robots.ts
    icon.svg
    globals.css                Tailwind import + @theme tokens + base layer
  components/
    ui/                        primitives: Text, Heading, Link, Tag, Divider, Icon (server)
    layout/                    SiteHeader, SiteFooter, Container, Grid, Section (server)
    sections/                  Hero, SelectedWork, Experience, ContactBlock… (server)
    mdx/                       MDX element → component mapping (server)
    motion/                    'use client' islands ONLY (Reveal, HeroIntro…)
    interactive/               other 'use client' islands (CopyEmail…)
  content/
    site.ts                    name, role, bio lines, links, email (typed)
    experience.ts              typed array
    projects/*.mdx             one file per case study, exports `meta`
  lib/
    content.ts                 getProjects(), getProject(slug): server-only, sorted, typed
    metadata.ts                buildMetadata() helper for consistent <head>
    jsonld.ts                  Person / CreativeWork schema builders
    cn.ts                      ~5-line class joiner (no clsx/tailwind-merge)
    fonts.ts                   next/font/local registry; sets --font-<role>-face vars
    motion/gsap.ts             single place GSAP + plugins are imported/registered
    motion/use-gsap.ts         scoped gsap.context + matchMedia hook with cleanup
  fonts/                       local woff2 files
  types/content.ts             ProjectMeta, Experience, SiteConfig
mdx-components.tsx             required by @next/mdx
public/                        resume.pdf, static images that bypass next/image (rare)
```

Rules:

- Use the `@/` alias for `src/`. No barrel `index.ts` files, because they break tree-shaking clarity.
- One component per file, named export, file name in kebab-case (`site-header.tsx`).
- `components/ui` must not import from `sections`. Dependencies flow `sections → layout/ui → lib`.

---

## 4. Server / client strategy

- **Everything is a Server Component by default.** `'use client'` is allowed only in `components/motion/` and `components/interactive/`.
- Client islands are **leaves**. They wrap server-rendered children (`children` prop) and never own content or fetch data.
- **No root-level providers.** No context, theme provider or animation provider wrapping the app.
- No client-side data fetching. No `useEffect` for anything except DOM side effects (animation, clipboard).
- Pass minimal serializable props across the boundary. Never pass whole content objects to a client component.
- Mark content loaders `import 'server-only'`.
- Every route must show as static (○ / ●) in `next build` output. A dynamic route is a bug.
- The color palette is the locked green system (DESIGN.md §9.2). Light and dark are CSS tokens: dark follows `prefers-color-scheme` and `data-theme` can force a mode. There is no theme library and no toggle yet.

---

## 5. Performance strategy

**Budgets (mobile, simulated slow 4G, enforced in CI from Phase 5):**

| Metric | Target |
|---|---|
| LCP | < 1.8 s |
| CLS | ≤ 0.02 |
| INP | < 100 ms |
| Lighthouse Perf / A11y / SEO / Best Practices | ≥ 98 / 100 / 100 / 100 |
| Route JS above the framework baseline | ≤ 25 KB gz (GSAP excluded: it's lazy) |
| Fonts | ≤ 2 families, ≤ 3 woff2 files, ≤ 120 KB total |
| Home page total transfer | ≤ 400 KB |

Tactics:

- The LCP element is **text** (hero headline), not an image. Only the LCP image (if any) gets `priority`.
- Preload only the primary font. Subset to Latin. `font-display: swap` with metric-matched fallback (`adjustFontFallback`).
- All images use explicit `width`/`height` or `fill` + aspect-ratio container, plus an accurate `sizes`.
- GSAP is `import()`-ed inside effects. It never loads in the initial bundle and never blocks hydration.
- No third-party scripts in v1: no analytics, no embeds, no chat widgets. If analytics is added later, it must be cookie-less and load after interaction/idle.
- Video (if any) must be muted, `preload="none"` with a poster, and AV1/H.264 sources. Never autoplay above the fold on mobile.
- Check bundles with `@next/bundle-analyzer` as a one-off devDependency, run on demand.

---

## 6. Animation strategy (technical)

The visual motion language lives in DESIGN.md §6. Implementation rules:

1. **CSS first.** Hover, focus, color and small transitions are pure CSS using motion tokens.
2. **GSAP only for orchestration:** the hero intro sequence, staggered section reveals, case-study page choreography. Import from `lib/motion/gsap.ts` only.
3. **Scoped and cleaned up:** every GSAP usage goes through `useGsap` (gsap.context + `revert()` on unmount).
4. **Reduced motion:** use `gsap.matchMedia()` with `(prefers-reduced-motion: no-preference)`. Reduced-motion users get the final state instantly. CSS mirrors this with a global `@media (prefers-reduced-motion: reduce)` reset.
5. **No-JS safe.** Content is never hidden by default in server HTML:
   - an inline `<script>` in `<head>` adds `class="js"` to `<html>`
   - CSS `.js [data-reveal] { opacity: 0 }` only under `no-preference`
   - a CSS failsafe animation reveals `[data-reveal]` after ~2.5 s if GSAP never runs.
6. Animate only `transform`, `opacity` and (sparingly) `clip-path`. Never animate layout properties.
7. **Banned:** scroll-jacking, smooth-scroll libraries, scroll-locked pinning of the whole page, cursor followers, infinite decorative loops.
8. Route transitions: none in v1. Revisit React `<ViewTransition>` once it's stable.

---

## 7. Content / data architecture

- **Source of truth:** files in `src/content/`. No CMS, no database, no API.
- `site.ts`, `experience.ts`: plain typed objects (`satisfies SiteConfig`).
- `projects/<slug>.mdx`: exports `meta` typed as `ProjectMeta`:

```ts
export const meta = {
  title: '…',
  summary: '…',            // ≤ 160 chars, reused for meta description
  role: '…',
  year: 2025,
  stack: ['…'],
  links: { live?: '…', repo?: '…' },
  cover: { src, alt },     // alt is required by type
  order: 1,                // manual curation, not date
  featured: true,
} satisfies ProjectMeta
```

- `lib/content.ts` reads the projects directory at build time, imports each module, validates through TS, and sorts by `order`. Slugs come from file names.
- No runtime validation library (zod etc.). Types plus build failure are enough for author-controlled content.
- Code highlighting, if case studies need it, happens at build time via rehype (Shiki). Add it only when the first code block appears.
- Images for case studies live next to the content (`src/content/projects/<slug>/`) and use static imports, so dimensions and blur placeholders come for free.

---

## 8. SEO & accessibility (technical)

**SEO**

- `metadataBase` set in root layout. Use the title template `%s — <Name>`. Each page gets a unique description.
- `generateMetadata` per case study from `meta`. Canonical URLs on every page.
- `sitemap.ts` and `robots.ts` generated from content.
- JSON-LD: `Person` (+ `sameAs` links) on home, `CreativeWork` on case studies. Built in `lib/jsonld.ts`.
- OG images generated per route with `next/og`, using the site typefaces loaded from local files.
- Semantic HTML only. Real `<a href>` for navigation, real headings, no text baked into images.

**Accessibility (WCAG 2.2 AA minimum)**

- `<html lang>`, a skip link to `<main id="main">`, landmarks (`header`/`nav`/`main`/`footer`).
- Exactly one `<h1>` per page. No skipped heading levels.
- Visible `:focus-visible` style on every interactive element. Never `outline: none` without a replacement.
- Contrast: body text ≥ 7:1 target (AAA), UI/large text ≥ 4.5:1.
- Target size ≥ 24×24 px, preferably 44×44 on touch.
- All motion respects `prefers-reduced-motion`. Nothing flashes more than 3 times a second.
- External links are indicated visually and get `rel="noreferrer"` (not forced `target=_blank`).
- Automated axe checks in Playwright, plus a manual keyboard and VoiceOver pass before launch.

---

## 9. Dependency policy

**Allowed runtime deps (the complete list):** `next`, `react`, `react-dom`, `gsap`, `@next/mdx`, `@mdx-js/loader`, `@mdx-js/react`.
**Allowed dev deps:** `typescript`, `@types/*`, `tailwindcss`, `@tailwindcss/postcss`, `eslint`, `eslint-config-next`, `prettier`, `prettier-plugin-tailwindcss`, `@playwright/test`, `@axe-core/playwright`, `@next/bundle-analyzer`, and `shiki`/rehype plugins only when needed.

Adding anything else requires a one-line justification in this section first.

**Do NOT add:**

| Don't | Use instead |
|---|---|
| framer-motion / motion, react-spring, AOS | CSS + GSAP |
| Lenis / locomotive-scroll / any smooth scroll | Native scrolling |
| three.js / R3F / WebGL hero | Typography and layout |
| clsx, classnames, tailwind-merge, cva | `lib/cn.ts` + explicit variant maps |
| shadcn/ui, Radix, Headless UI, MUI, Chakra | Hand-built primitives (we have almost no complex widgets) |
| lucide-react, react-icons, any icon set | Inline SVG components (a handful) |
| next-themes | The green system is plain CSS tokens; modes need no library |
| contentlayer, velite, gray-matter, Sanity/Contentful | Local MDX + exported `meta` |
| zod (for content) | TypeScript types |
| Redux, Zustand, Jotai, React Query, SWR | No client state needed |
| date-fns, moment, dayjs, lodash | `Intl` and native JS |
| Google Fonts runtime, Font Awesome | `next/font/local` |
| Analytics/tracking scripts, GTM | None in v1 |
| Contact-form backends, Resend, DB, auth | `mailto:` + copy-email button |
| Storybook | The site itself is the showcase. Revisit if primitives exceed ~15. |

---

## 10. Overengineering risks (watch list)

- Building a design-system package or a component library before 3 real usages exist.
- Making a CMS "for later". Editing MDX is the CMS.
- A theme toggle, i18n or a blog engine with no content to justify it.
- Generic `<Motion>` abstraction layers over GSAP. Write direct, scoped timelines.
- Monorepo/turborepo, Docker, custom servers, edge middleware: none are needed.
- Excessive `@theme` tokens. If a token is used once, it's a value, not a token.
- WebGL/canvas effects that cost performance budget to look like every other portfolio.
- Perfect test coverage of presentational components. Test behavior and accessibility, not markup.
- Premature abstraction of sections into "configurable" blocks driven by JSON.

---

## 11. Roadmap

| Phase | Deliverable | Exit criteria |
|---|---|---|
| **0. Foundation** | This doc set + resolved open design decisions (DESIGN.md §9) | Approved |
| **1. Scaffold** | pnpm + Next + TS strict + Tailwind v4 + ESLint/Prettier, git init, empty token layer, one static page | `pnpm build` passes, all routes static, Lighthouse 100s on a blank page |
| **2. Design system** | Tokens, fonts, type scale, grid, primitives, header/footer, `/colophon` stub as live style reference | Green palette locked, contrast checked, no arbitrary values |
| **3. Content model** | Types, `lib/content.ts`, MDX pipeline, one real case study, `site.ts` | `/work/[slug]` statically generated from MDX |
| **4. Pages** | Home sections, case study template, about, 404 | Real content everywhere, no lorem ipsum |
| **5. Quality gates** | Metadata, OG, JSON-LD, sitemap; Playwright + axe; Lighthouse CI budgets | All budgets in §5 met in CI |
| **6. Motion** | Hero intro, reveals, micro-interactions | Budgets still met, reduced-motion and no-JS verified |
| **7. Launch** | Domain, Vercel, final manual a11y/perf pass | Production URL live |

Motion comes after the static site is complete and fast on purpose: animation decorates a finished page and must never prop up an unfinished one.
