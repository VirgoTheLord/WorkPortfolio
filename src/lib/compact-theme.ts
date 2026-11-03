/*
 * Light and dark, chosen by the visitor (DESIGN.md §9). The choice is
 * `data-theme` on <html> (globals.css), set before first paint by `themeScript`
 * (in app/layout.tsx's inline script). Each site keeps its own: the compact
 * site's switch (DESIGN.md §5b) remembers across visits (localStorage); the full
 * site's, in its menu, only for the tab (sessionStorage), so a new visit follows
 * the system again and nobody stays locked to a mode. Crossing from one site to
 * the other puts that site's own choice back, or none.
 */
export type Theme = 'light' | 'dark'

export const THEME_KEY = 'compact-theme'
export const SITE_THEME_KEY = 'site-theme'

/* Part of the root layout's inline script, so the site's stored choice is there
   before first paint. */
export const themeScript = `try{var c=location.pathname.indexOf('/compact')===0;var t=c?localStorage.getItem('${THEME_KEY}'):sessionStorage.getItem('${SITE_THEME_KEY}');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}`

/* Where each site keeps its choice. */
const stores = {
  compact: () => localStorage,
  site: () => sessionStorage,
} as const
type Site = keyof typeof stores
const keys: Record<Site, string> = { compact: THEME_KEY, site: SITE_THEME_KEY }

function stored(site: Site): Theme | null {
  try {
    const value = stores[site]().getItem(keys[site])
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

/* Sets one site's choice on <html>, or clears it to follow the system. */
function put(site: Site) {
  const theme = stored(site)
  if (theme) document.documentElement.dataset.theme = theme
  else delete document.documentElement.dataset.theme
}

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

/* Puts the compact site's choice back (a client-side arrival skips the inline script). */
export function restoreTheme() {
  put('compact')
}

/* Leaving the compact site: the full site's own choice, or the system. */
export function releaseTheme() {
  put('site')
}

function apply(theme: Theme, site: Site) {
  document.documentElement.dataset.theme = theme
  try {
    stores[site]().setItem(keys[site], theme)
  } catch {}
}

/*
 * Flips the mode. Where the browser has view transitions, the new mode opens as
 * a circle from `origin` (the toggle) over the old one; with reduced motion, or
 * without them, it simply changes.
 */
export function switchTheme(origin?: { x: number; y: number }, site: Site = 'compact') {
  const next: Theme = readTheme() === 'dark' ? 'light' : 'dark'
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (still || !('startViewTransition' in document)) {
    apply(next, site)
    return next
  }
  const x = origin?.x ?? window.innerWidth / 2
  const y = origin?.y ?? 0
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
  const transition = document.startViewTransition(() => apply(next, site))
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
