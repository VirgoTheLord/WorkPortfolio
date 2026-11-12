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

/* One switch at a time: the transition in flight, the mode it is going to, and
   the mode asked for while it runs (with where it was asked from). */
let running: { to: Theme } | null = null
let queued: { to: Theme; origin?: { x: number; y: number } } | null = null

/* Set while the mode changes. globals.css stops every colour transition under
   it, so the new mode is drawn in its final colours at once (otherwise each
   element fades from the old colours inside the opening circle: the flicker),
   and gives the reveal its keyframes from the very first frame. */
const SWITCHING = 'theme-switching'

/*
 * Flips the mode. Where the browser has view transitions, the new mode opens as
 * a circle from `origin` (the switch) over the old one; with reduced motion, or
 * without them, it simply changes.
 *
 * The circle is a CSS animation on ::view-transition-new(root), keyed by the
 * class above and the --vt-* variables, so it is in place on the first frame the
 * transition paints. Started from script once the transition was ready, the new
 * mode showed whole for a frame first: the flash.
 *
 * Presses while a switch is running never cut it short (cutting it snaps the
 * half-open circle to the end: another flash). They are queued, and only the
 * last answer counts: when the circle has finished, if the mode asked for is not
 * the one on screen, it opens from where it was asked. An even number of presses
 * therefore ends where it started, with nothing further to play.
 *
 * Returns the mode the page is going to.
 */
export function switchTheme(origin?: { x: number; y: number }): Theme {
  const from = queued?.to ?? running?.to ?? readTheme()
  const next: Theme = from === 'dark' ? 'light' : 'dark'
  if (running) {
    queued = { to: next, origin }
    return next
  }
  run(next, origin)
  return next
}

function run(next: Theme, origin?: { x: number; y: number }) {
  const root = document.documentElement
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  root.classList.add(SWITCHING)

  if (still || !('startViewTransition' in document)) {
    apply(next)
    // Two frames: the new colours are painted before transitions come back.
    window.requestAnimationFrame(() =>
      window.requestAnimationFrame(() => root.classList.remove(SWITCHING)),
    )
    return
  }

  const x = origin?.x ?? window.innerWidth / 2
  const y = origin?.y ?? 0
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
  root.style.setProperty('--vt-x', `${x}px`)
  root.style.setProperty('--vt-y', `${y}px`)
  root.style.setProperty('--vt-r', `${Math.ceil(radius)}px`)

  running = { to: next }
  const transition = document.startViewTransition(() => apply(next))
  // `finished` settles however the transition ends (played, or skipped by the
  // browser in a hidden tab); the mode has changed either way.
  transition.finished
    .catch(() => {})
    .finally(() => {
      running = null
      root.classList.remove(SWITCHING)
      const wanted = queued
      queued = null
      if (wanted && wanted.to !== readTheme()) run(wanted.to, wanted.origin)
    })
}
