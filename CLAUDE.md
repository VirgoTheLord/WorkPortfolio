# CLAUDE.md

Personal developer portfolio. It must show both engineering rigor and strong design taste. Performance, accessibility and restraint are product requirements, not polish.
The primary impression should be: taste, polished interactions, and obsessive attention to detail. Engineering quality should be demonstrated through execution rather than presented as documentation.

**Read before working:**

- `ARCHITECTURE.md`: stack, structure, server/client rules, performance budgets, dependency policy, roadmap
- `DESIGN.md`: visual direction, tokens, anti-patterns, motion language
- `AGENTS.md`: managed by Next.js. Version-specific Next docs live in `node_modules/next/dist/docs/`; check them before using a Next API.

## Current phase

**Phase 1: Scaffold** complete. Next: Phase 2, after DESIGN.md §9 decisions 1–2. Update this line when a phase completes (see ARCHITECTURE.md §11).

## Stack (summary)

Next.js App Router · TypeScript strict · Tailwind CSS v4 · GSAP (lazy, islands only) · local MDX · pnpm · Vercel (fully static).

## Commands

```
pnpm dev            # dev server (Turbopack)
pnpm build          # production build; every route must be ○/● static
pnpm typecheck      # next typegen && tsc --noEmit
pnpm lint           # eslint .
pnpm format         # prettier --write . (Markdown is excluded on purpose)
```

`pnpm test:e2e` arrives in Phase 5.

## Non-negotiable rules

1. **Server Components by default.** `'use client'` is allowed only in `src/components/motion/` and `src/components/interactive/`, and only for leaf islands.
2. **No new dependencies** unless they are listed in ARCHITECTURE.md §9. To add one, update §9 with a justification first and ask the user.
3. **No raw values in components:** no hex colors, px font sizes or Tailwind arbitrary values. Use tokens from `globals.css` `@theme`.
4. **Every route is static.** `next build` must show no dynamic routes. No API routes, middleware/proxy, or runtime data fetching.
5. **Motion:** CSS for micro-interactions. GSAP only via `lib/motion/` (`useGsap`), dynamically imported, `transform`/`opacity` only, and it must respect `prefers-reduced-motion`. Content must be readable without JS.
6. **Accessibility:** semantic HTML, one `<h1>` per page, visible focus, AA contrast minimum, keyboard-complete. `alt` is required by the content types.
7. **Content lives in `src/content/`.** Never hard-code copy inside components, except UI microcopy.
8. **Check DESIGN.md §3 anti-patterns** before proposing any visual idea. If an idea looks like a template portfolio, don't propose it.
9. **No placeholder content in shipped pages.** No lorem ipsum, fake metrics or fake testimonials.
10. **Taste over feature count.** Do not add visual effects, interactions, sections or technologies merely because they are technically possible. Every addition must improve the experience or communicate something meaningful.

## Code conventions

- Files kebab-case, named exports, one component per file, no barrel files, `@/` alias → `src/`.
- Prefer explicit props over configurable "variant soup". Use simple object maps for variants and `lib/cn.ts` for joining classes.
- Avoid `useEffect` except for DOM side effects. No client state libraries.
- Types for content live in `src/types/content.ts`. Use `satisfies` for content objects.
- Comments explain _why_, not _what_.

## Working style

- Make small, reviewable changes. Run `pnpm typecheck && pnpm lint && pnpm build` before calling work done.
- If a request conflicts with these docs, point out the conflict and ask. Don't silently deviate.
- When a decision changes, update the relevant doc in the same change.
- Prefer deleting code over adding abstractions. Abstract only after three real usages.
