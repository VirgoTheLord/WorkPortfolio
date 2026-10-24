/*
 * The compact site's light and dark switch (DESIGN.md §5b). The full site follows
 * the system and nothing overrides it (app/layout.tsx clears the old `theme`
 * key); the compact site, at the owner's request, lets a visitor choose, under
 * its own key. The choice is `data-theme` on <html> (globals.css), set before
 * first paint by `themeScript` (in app/layout.tsx's inline script) and dropped again when the visitor leaves the
 * compact site, so the full site is never forced into it.
 */
export type Theme = 'light' | 'dark'

export const THEME_KEY = 'compact-theme'

/* Part of the root layout's inline script, so on a compact page a stored choice
   is there before first paint; every other route is left to the system. */
export const themeScript = `try{if(location.pathname.indexOf('/compact')===0){var t=localStorage.getItem('${THEME_KEY}');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}}catch(e){}`

const darkQuery = '(prefers-color-scheme: dark)'

export function readTheme(): Theme {
  const set = document.documentElement.dataset.theme
  if (set === 'light' || set === 'dark') return set
  return window.matchMedia(darkQuery).matches ? 'dark' : 'light'
}

export function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributeFilter: ['data-theme'] })
  const query = window.matchMedia(darkQuery)
  query.addEventListener('change', onChange)
  return () => {
    observer.disconnect()
    query.removeEventListener('change', onChange)
  }
}

/* Puts a stored choice back (a client-side arrival skips the inline script). */
export function restoreTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'light' || stored === 'dark') document.documentElement.dataset.theme = stored
  } catch {}
}

/* Leaving the compact site: the full site goes back to following the system. */
export function releaseTheme() {
  delete document.documentElement.dataset.theme
}

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {}
}

/*
 * Flips the mode. Where the browser has view transitions, the new mode opens as
 * a circle from `origin` (the toggle) over the old one; with reduced motion, or
 * without them, it simply changes.
 */
export function switchTheme(origin?: { x: number; y: number }) {
  const next: Theme = readTheme() === 'dark' ? 'light' : 'dark'
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (still || !('startViewTransition' in document)) {
    apply(next)
    return next
  }
  const x = origin?.x ?? window.innerWidth / 2
  const y = origin?.y ?? 0
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
  const transition = document.startViewTransition(() => apply(next))
  void transition.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      {
        duration: 900,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        pseudoElement: '::view-transition-new(root)',
      },
    )
  })
  return next
}
