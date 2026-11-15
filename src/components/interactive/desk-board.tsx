'use client'

import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react'

type Thing = {
  id: string
  /** Where it starts, in percent of the board, and how it lies. */
  x: number
  y: number
  turn: number
  /** Its name for assistive tech. */
  label: string
  node: ReactNode
}

type Props = {
  label: string
  things: readonly Thing[]
  /** The thing that opens the search when pressed rather than moved. */
  searchKey?: string
}

/* How far an arrow key moves a thing, in percent of the board. */
const NUDGE = 3
/* Under this many pixels a press is a press, not a move. */
const SLOP = 4

/* Open the site's search, as its shortcut would (interactive/site-search.tsx). */
const openSearch = () =>
  document.querySelector<HTMLButtonElement>('.cp-search .wui-lens-trigger')?.click()

/*
 * The desk (chloemaillot.fr's board, our things): objects lying on a dotted
 * board, each picked up and moved by hand, the one picked up coming to the
 * top. With the keyboard, Tab to one and move it with the arrow keys. Things
 * stay a little inside the board. One thing (the search's key) searches when
 * pressed rather than moved, by mouse, touch or Enter. Nothing runs at rest.
 */
export function DeskBoard({ label, things, searchKey }: Props) {
  const [order, setOrder] = useState(() => things.map((thing) => thing.id))
  const [place, setPlace] = useState(() =>
    Object.fromEntries(things.map((thing) => [thing.id, { x: thing.x, y: thing.y }])),
  )
  const board = useRef<HTMLDivElement>(null)
  const drag = useRef<{
    id: string
    x0: number
    y0: number
    px: number
    py: number
    w: number
    h: number
    moved: boolean
  } | null>(null)

  const clamp = (x: number, y: number) => ({
    x: Math.min(92, Math.max(-4, x)),
    y: Math.min(88, Math.max(-4, y)),
  })
  const raise = (id: string) => setOrder((list) => [...list.filter((item) => item !== id), id])

  const down = (id: string) => (event: PointerEvent<HTMLDivElement>) => {
    const box = board.current?.getBoundingClientRect()
    const at = place[id]
    if (!box || !at) return
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = {
      id,
      x0: event.clientX,
      y0: event.clientY,
      px: at.x,
      py: at.y,
      w: box.width,
      h: box.height,
      moved: false,
    }
    raise(id)
  }
  const move = (event: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    if (!d.moved && Math.hypot(event.clientX - d.x0, event.clientY - d.y0) < SLOP) return
    d.moved = true
    const next = clamp(
      d.px + ((event.clientX - d.x0) / d.w) * 100,
      d.py + ((event.clientY - d.y0) / d.h) * 100,
    )
    setPlace((all) => ({ ...all, [d.id]: next }))
  }
  const up = () => {
    const d = drag.current
    drag.current = null
    if (d && !d.moved && d.id === searchKey) openSearch()
  }
  const cancel = () => {
    drag.current = null
  }
  const keys = (id: string) => (event: KeyboardEvent<HTMLDivElement>) => {
    const steps: Record<string, [number, number]> = {
      ArrowLeft: [-NUDGE, 0],
      ArrowRight: [NUDGE, 0],
      ArrowUp: [0, -NUDGE],
      ArrowDown: [0, NUDGE],
    }
    if (id === searchKey && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      openSearch()
      return
    }
    const step = steps[event.key]
    const at = place[id]
    if (!step || !at) return
    event.preventDefault()
    raise(id)
    setPlace((all) => ({ ...all, [id]: clamp(at.x + step[0], at.y + step[1]) }))
  }

  return (
    <div ref={board} role="group" aria-label={label} className="cp-desk">
      {things.map((thing) => {
        const at = place[thing.id] ?? { x: thing.x, y: thing.y }
        return (
          <div
            key={thing.id}
            role="img"
            aria-label={thing.label}
            tabIndex={0}
            className="cp-thing"
            onPointerDown={down(thing.id)}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={cancel}
            onKeyDown={keys(thing.id)}
            style={
              {
                left: `${at.x}%`,
                top: `${at.y}%`,
                zIndex: order.indexOf(thing.id) + 1,
                '--r': `${thing.turn}deg`,
              } as CSSProperties
            }
          >
            {thing.node}
          </div>
        )
      })}
    </div>
  )
}
