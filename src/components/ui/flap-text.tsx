/*
 * A label for the split-flap link (compact.css, "Links"): the words read whole
 * by assistive tech, and drawn as letters that each flip over in turn, like a
 * departures board, when the link round it is hovered or focused. Spaces stay
 * spaces. Pure CSS: nothing to hydrate.
 */
export function FlapText({ children }: { children: string }) {
  return (
    <>
      <span className="sr-only">{children}</span>
      <span aria-hidden="true" className="cp-flap">
        {[...children].map((char, i) =>
          char === ' ' ? (
            ' '
          ) : (
            <span key={i} className="cp-flap-ch" style={{ '--i': i } as React.CSSProperties}>
              {char}
            </span>
          ),
        )}
      </span>
    </>
  )
}
