/*
 * The colour mode, which lives on <html> as plain DOM state, so a server-rendered
 * control can show it with CSS alone and nothing flashes. Used by the theme toggle.
 */

type Origin = { x: number; y: number }

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** The mode in effect: the one the visitor chose, else the system's. */
export function currentTheme(): 'light' | 'dark' {
  const chosen = document.documentElement.dataset.theme
  if (chosen === 'light' || chosen === 'dark') return chosen
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.dataset.theme = theme
  try {
    window.localStorage.setItem('theme', theme)
  } catch {
    // Private windows and blocked storage: the choice just lasts for this visit.
  }
}

/*
 * Flips the mode. Where the browser supports view transitions the new mode is
 * revealed as a circle growing from `origin` (the control that was pressed);
 * elsewhere, and under reduced motion, it simply changes.
 */
export function toggleTheme(origin?: Origin) {
  const next = currentTheme() === 'dark' ? 'light' : 'dark'
  if (!document.startViewTransition || prefersReducedMotion()) {
    applyTheme(next)
    return
  }

  const x = origin?.x ?? window.innerWidth / 2
  const y = origin?.y ?? window.innerHeight / 2
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
  const transition = document.startViewTransition(() => applyTheme(next))
  void transition.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      {
        duration: 900,
        easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
        pseudoElement: '::view-transition-new(root)',
      },
    )
  })
}

/** The centre of an element, for a theme change to grow from. */
export function centreOf(element: Element): Origin {
  const rect = element.getBoundingClientRect()
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}
