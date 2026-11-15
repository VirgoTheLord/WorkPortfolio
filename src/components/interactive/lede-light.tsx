'use client'

type Props = { light: 'day' | 'night'; children: string }

/*
 * "by day" and "by night" in the opening sentence (owner's pick, November
 * 2026): pointing at either puts the whole sentence in that light, a warm
 * page for day and a deep blue one for night (compact.css, `data-light` on
 * the sentence); the little sun turns, the moon tips. Leaving puts it back.
 * Decoration on words that read the same without it.
 */
export function LedeLight({ light, children }: Props) {
  const set = (value: string | null) => (event: React.PointerEvent<HTMLSpanElement>) => {
    const lede = event.currentTarget.closest<HTMLElement>('.cp-lede')
    if (!lede) return
    if (value) lede.dataset.light = value
    else delete lede.dataset.light
  }
  return (
    <span className="cp-light" onPointerEnter={set(light)} onPointerLeave={set(null)}>
      {children}
      {light === 'day' ? (
        <svg aria-hidden="true" viewBox="0 0 16 16" className="cp-light-icon">
          <circle cx="8" cy="8" r="3.4" className="cp-light-fill" />
          <path
            d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6L13 13M3 13l1.4-1.4M11.6 4.4L13 3"
            className="cp-light-ray"
          />
        </svg>
      ) : (
        <svg aria-hidden="true" viewBox="0 0 16 16" className="cp-light-icon">
          <path d="M12.5 10.5A5.5 5.5 0 0 1 5.5 3.5a5.5 5.5 0 1 0 7 7Z" className="cp-light-fill" />
        </svg>
      )}
    </span>
  )
}
