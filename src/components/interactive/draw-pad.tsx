'use client'

import { useEffect, useRef } from 'react'
import { cellTrail } from '@/lib/motion/cell-trail'
import './draw-pad.css'

/*
 * A patch of the hero's grid to draw on, for the compact site's shelf
 * (draw-pad.css): the same fading trail of cells as the hero's drag-to-draw
 * (lib/motion/cell-trail.ts), here for a mouse as well as a finger, since the
 * patch is small and there is nothing to scroll inside it (touch-action: none, so
 * a finger draws rather than scrolling while it is on the patch). A tap leaves no
 * mark. Decorative: the patch is aria-hidden, and reduced motion gets the grid
 * with nothing drawn.
 */
export function DrawPad({ label }: { label: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const pad = canvas?.parentElement
    if (!canvas || !pad) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const trail = cellTrail(canvas, pad)
    if (!trail) return

    const at = (event: PointerEvent) => {
      const box = pad.getBoundingClientRect()
      return { x: event.clientX - box.left, y: event.clientY - box.top }
    }
    let drawing = false
    const onDown = (event: PointerEvent) => {
      drawing = true
      pad.setPointerCapture(event.pointerId)
      trail.begin(at(event))
    }
    // A mouse draws while it is over the patch, pressed or not (its stroke starts
    // as it enters); a finger or pen while it is down.
    const onEnter = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') trail.begin(at(event))
    }
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' && !drawing) return
      trail.move(at(event))
    }
    const onUp = (event: PointerEvent) => {
      drawing = false
      // A mouse keeps drawing while it stays over the patch.
      if (event.pointerType === 'mouse') trail.begin(at(event))
      else trail.end()
    }
    const onLeave = () => {
      if (!drawing) trail.end()
    }
    pad.addEventListener('pointerenter', onEnter)

    const resize = new ResizeObserver(trail.resize)
    resize.observe(pad)
    pad.addEventListener('pointerdown', onDown)
    pad.addEventListener('pointermove', onMove)
    pad.addEventListener('pointerup', onUp)
    pad.addEventListener('pointercancel', onUp)
    pad.addEventListener('pointerleave', onLeave)
    return () => {
      resize.disconnect()
      pad.removeEventListener('pointerdown', onDown)
      pad.removeEventListener('pointermove', onMove)
      pad.removeEventListener('pointerup', onUp)
      pad.removeEventListener('pointercancel', onUp)
      pad.removeEventListener('pointerleave', onLeave)
      pad.removeEventListener('pointerenter', onEnter)
      trail.destroy()
    }
  }, [])

  return (
    <span aria-hidden="true" className="draw-pad" title={label}>
      <canvas ref={ref} className="draw-pad-canvas" />
    </span>
  )
}
