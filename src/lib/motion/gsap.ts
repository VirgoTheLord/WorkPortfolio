/*
 * The single place GSAP is imported (ARCHITECTURE.md §6). It is loaded with a
 * dynamic import so it never sits in the initial bundle, and the promise is
 * cached so a prefetch on hover and the real call share one request.
 *
 * Values mirror the motion tokens in globals.css (DESIGN.md §4), in seconds.
 * GSAP's power eases are the closest core equivalents: power4.out is
 * cubic-bezier(0.22, 1, 0.36, 1) and power2.inOut is cubic-bezier(0.65, 0, 0.35, 1).
 */
export const motion = {
  slow: 0.6,
  stagger: 0.05,
  out: 'power4.out',
  inOut: 'power2.inOut',
} as const

let gsapPromise: Promise<typeof import('gsap').gsap> | undefined

export function loadGsap() {
  gsapPromise ??= import('gsap').then((module) => module.gsap)
  return gsapPromise
}

let scrollTriggerPromise:
  | Promise<{
      gsap: typeof import('gsap').gsap
      ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger
    }>
  | undefined

/* GSAP plus the ScrollTrigger plugin, registered once. Only the Selected Work
   island calls this, and only as the section nears the viewport. */
export function loadScrollTrigger() {
  scrollTriggerPromise ??= Promise.all([loadGsap(), import('gsap/ScrollTrigger')]).then(
    ([gsap, { ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger)
      return { gsap, ScrollTrigger }
    },
  )
  return scrollTriggerPromise
}
