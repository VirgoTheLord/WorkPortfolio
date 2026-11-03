/*
 * Light and dark, chosen by the visitor (DESIGN.md §9), one choice for the
 * whole site: the full site's switch (interactive/mode-switch.tsx) and the
 * compact site's (interactive/theme-toggle.tsx) read and write the same
 * value, so a change on one is the mode on the other.
 *
 * Where it lives:
 * - `data-theme` on <html> is the mode now. Every colour is a token that
 *   globals.css redefines under it, so setting it is all a switch does.
 * - localStorage `theme-choice` remembers it across pages and visits. With
 *   nothing stored the site follows the system (prefers-color-scheme).
 * - `themeScript`, in the root layout's inline <head> script, copies the stored
 *   choice onto <html> before first paint, on every route of both sites.
 * - Another tab's change arrives as a `storage` event and is applied here too.
 */
export type Theme = 'light' | 'dark'

export const THEME_KEY = 'theme-choice'

export const themeScript = `try{var t=localStorage.getItem('${THEME_KEY}');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}`

const darkQuery = '(prefers-color-scheme: dark)'

export function readTheme(): Theme {
  const set = document.documentElement.dataset.theme
  if (set === 'light' || set === 'dark') return set
  return window.matchMedia(darkQuery).matches ? 'dark' : 'light'
}

/*
 * Calls `onChange` whenever the mode changes: a switch on this page (the
 * attribute), the system's setting, or a switch in another tab.
 */
export function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributeFilter: ['data-theme'] })
  const query = window.matchMedia(darkQuery)
  query.addEventListener('change', onChange)
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_KEY) return
    const value = event.newValue
    if (value === 'light' || value === 'dark') document.documentElement.dataset.theme = value
    else delete document.documentElement.dataset.theme
  }
  window.addEventListener('storage', onStorage)
  return () => {
    observer.disconnect()
    query.removeEventListener('change', onChange)
    window.removeEventListener('storage', onStorage)
  }
}

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {}
}

/*
 * Flips the mode. Where the browser has view transitions, the new mode opens as
 * a circle from `origin` (the switch) over the old one; with reduced motion, or
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
  // A transition the browser skips (a hidden tab, say) rejects; the mode has
  // still changed, so there is nothing to do.
  transition.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        {
          duration: 900,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          pseudoElement: '::view-transition-new(root)',
        },
      )
    })
    .catch(() => {})
  return next
}
