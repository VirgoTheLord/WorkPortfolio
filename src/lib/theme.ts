/*
 * Light and dark, chosen by the visitor (DESIGN.md §9), one choice for the
 * whole site: the full site's switch (interactive/mode-switch.tsx) and the
 * compact site's (interactive/contour-switch.tsx) read and write the same
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

/* One switch at a time: the change in flight, the mode it is going to, and
   the mode asked for while it runs. */
let running: { to: Theme } | null = null
let queued: { to: Theme } | null = null

/* Set while the mode changes. globals.css stops every colour transition under
   it, so the new mode is drawn in its final colours at once under the veil. */
const SWITCHING = 'theme-switching'

/*
 * Flips the mode: the screen dips through the new page colour (`dip`); with
 * reduced motion it simply changes. Presses while a change is running never
 * cut it short; they are queued, and only the last answer counts: when the dip
 * has finished, if the mode asked for is not the one on screen, it runs again.
 * An even number of presses therefore ends where it started.
 *
 * Returns the mode the page is going to.
 */
export function switchTheme(): Theme {
  const from = queued?.to ?? running?.to ?? readTheme()
  const next: Theme = from === 'dark' ? 'light' : 'dark'
  if (running) {
    queued = { to: next }
    return next
  }
  run(next)
  return next
}

/* The change itself, everywhere (owner's call, November 2026): a dip. The
   screen fades to the new mode's page colour, the mode changes under it, and
   it fades away. It replaced a circle opening from the switch (a view
   transition), whose snapshot of the page misbehaved on phones. Timings in ms. */
const DIP_IN = 180
const DIP_OUT = 340

function dip(next: Theme) {
  const root = document.documentElement
  const veil = document.createElement('div')
  veil.className = 'theme-veil'
  veil.dataset.to = next
  veil.setAttribute('aria-hidden', 'true')
  document.body.append(veil)
  running = { to: next }
  const settle = () => {
    running = null
    root.classList.remove(SWITCHING)
    const wanted = queued
    queued = null
    if (wanted && wanted.to !== readTheme()) run(wanted.to)
  }
  const show = veil.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: DIP_IN,
    easing: 'cubic-bezier(0.4, 0, 1, 1)',
    fill: 'forwards',
  })
  show.onfinish = () => {
    apply(next)
    // Two frames: the new mode is painted under the veil before it lifts.
    window.requestAnimationFrame(() =>
      window.requestAnimationFrame(() => {
        const hide = veil.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: DIP_OUT,
          easing: 'cubic-bezier(0, 0, 0.2, 1)',
          fill: 'forwards',
        })
        hide.onfinish = () => {
          veil.remove()
          settle()
        }
      }),
    )
  }
}

function run(next: Theme) {
  const root = document.documentElement
  root.classList.add(SWITCHING)
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    apply(next)
    // Two frames: the new colours are painted before transitions come back.
    window.requestAnimationFrame(() =>
      window.requestAnimationFrame(() => root.classList.remove(SWITCHING)),
    )
    return
  }
  dip(next)
}
