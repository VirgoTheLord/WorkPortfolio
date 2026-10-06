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
