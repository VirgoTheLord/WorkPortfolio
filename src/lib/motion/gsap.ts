/*
 * The single place GSAP is imported (ARCHITECTURE.md §6). It is loaded with a
 * dynamic import so it never sits in the initial bundle, and the promise is
 * cached so a prefetch on hover and the real call share one request. Eases are
 * GSAP's own named curves (power3.out, expo.inOut, ...); each sequence says which
 * it uses, taken from the reference.
 */
let gsapPromise: Promise<typeof import('gsap').gsap> | undefined

export function loadGsap() {
  gsapPromise ??= import('gsap').then((module) => module.gsap)
  return gsapPromise
}

/*
 * GSAP with ScrollTrigger registered, for scroll-linked sequences. ScrollTrigger
 * ships inside the gsap package, so it is not a new dependency; it is only
 * fetched by the islands that need it, and registered once. It reads the
 * window's scroll, so a smooth-scroll layer (Lenis, if it is ever approved) only
 * has to call ScrollTrigger.update on its scroll event; nothing here changes.
 */
let scrollTriggerPromise:
  | Promise<{
      gsap: typeof import('gsap').gsap
      ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger
    }>
  | undefined

export function loadScrollTrigger() {
  scrollTriggerPromise ??= Promise.all([loadGsap(), import('gsap/ScrollTrigger')]).then(
    ([gsap, module]) => {
      gsap.registerPlugin(module.ScrollTrigger)
      return { gsap, ScrollTrigger: module.ScrollTrigger }
    },
  )
  return scrollTriggerPromise
}
