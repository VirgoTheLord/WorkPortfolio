import { useId } from 'react'

type Props = { className?: string }

/*
 * Cairn's mark (from the library's own icon, UI Library/wui/app/icon.svg):
 * three stones stacked, the top one red, each cut away a little where the one
 * above sits on it. The two lower stones take the text colour, so the mark
 * reads on the black chip and on the page alike.
 */
export function CairnMark({ className }: Props) {
  const id = useId()
  const low = `${id}-low`
  const mid = `${id}-mid`
  return (
    <svg
      viewBox="5 -1 14 24"
      aria-hidden="true"
      className={className ? `cp-cairn ${className}` : 'cp-cairn'}
    >
      <mask id={low}>
        <rect x="0" y="-2" width="24" height="26" fill="white" />
        <circle cx="11" cy="8.2" r="5.1" fill="black" />
        <circle cx="12.6" cy="3.1" r="3.5" fill="black" />
      </mask>
      <mask id={mid}>
        <rect x="0" y="-2" width="24" height="26" fill="white" />
        <circle cx="12.6" cy="3.1" r="3.5" fill="black" />
      </mask>
      <circle cx="12" cy="16.5" r="6" fill="currentColor" mask={`url(#${low})`} />
      <circle cx="11" cy="8.2" r="3.9" fill="currentColor" mask={`url(#${mid})`} />
      <circle cx="12.6" cy="3.1" r="2.3" className="cp-cairn-top" />
    </svg>
  )
}
