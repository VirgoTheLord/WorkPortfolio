'use client'

import { useRef, type PointerEvent } from 'react'

type Props = { words: readonly string[] }

/*
 * "interface pieces" in the opening sentence (owner's pick): the words as key
 * caps, like the stack's, that can be picked up and dropped anywhere; let go,
 * and each springs back to its place (compact.css). The words read as words.
 */
export function LedeTiles({ words }: Props) {
  const start = useRef({ x: 0, y: 0 })

  const down = (event: PointerEvent<HTMLSpanElement>) => {
    const tile = event.currentTarget
    tile.setPointerCapture(event.pointerId)
    start.current = { x: event.clientX, y: event.clientY }
    tile.dataset.held = ''
  }
  const move = (event: PointerEvent<HTMLSpanElement>) => {
    const tile = event.currentTarget
    if (!('held' in tile.dataset)) return
    tile.style.translate = `${event.clientX - start.current.x}px ${event.clientY - start.current.y}px`
  }
  const drop = (event: PointerEvent<HTMLSpanElement>) => {
    const tile = event.currentTarget
    delete tile.dataset.held
    tile.style.translate = ''
  }

  return words.map((word, i) => (
    <span key={word}>
      {i > 0 ? ' ' : null}
      <span
        className="cp-tile"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={drop}
        onPointerCancel={drop}
      >
        {word}
      </span>
    </span>
  ))
}
