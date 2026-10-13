/*
 * Where the page has a pinned stretch, in scroll pixels, shared between the island
 * that pins (motion/work-stage.tsx writes it) and the smooth scroller
 * (motion/smooth-scroll.tsx reads it on every scroll). Plain state in a module, not
 * React state: nothing renders from it, it only lets the scroller ease its own
 * feel in and out of the stretch instead of changing gear at its edge, and settle
 * on a project instead of between two.
 */
export const scrollZone = {
  active: false,
  start: 0,
  end: 0,
  /* The scroll positions the pinned stretch rests at (one per project, in order):
     the scroller eases to the nearest when the scroll comes to rest between two. */
  snaps: [] as number[],
}
