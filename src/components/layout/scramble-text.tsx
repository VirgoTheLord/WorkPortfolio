/*
 * Text the menu reveals by scrambling it into place. The real text stays in the
 * flow (invisible, so it sizes the line and is what assistive tech reads); a
 * decorative copy sits over it and is the one the island animates. Without the
 * island the copy simply shows the final text.
 */
export function ScrambleText({ text }: { text: string }) {
  return (
    <span className="relative block">
      <span className="block opacity-0">{text}</span>
      <span aria-hidden="true" data-menu-scramble={text} className="absolute inset-0 block">
        {text}
      </span>
    </span>
  )
}
