/*
 * The compact site's one shared motif (DESIGN.md §5b): a label that rolls up
 * out of its line on hover or focus of the link or button around it, and a
 * second copy rolls in from below, like an odometer turning over (compact.css).
 * `alt` lets the second copy say something else ("9.98° N" for a place). The
 * copy is hidden from assistive tech, which reads the label once. Pure CSS.
 */
export function RollText({ children, alt }: { children: string; alt?: string }) {
  return (
    <span className="cp-roll">
      <span className="cp-roll-a">{children}</span>
      <span aria-hidden="true" className="cp-roll-b">
        {alt ?? children}
      </span>
    </span>
  )
}
