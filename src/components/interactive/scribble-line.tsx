'use client'

import { useEffect, useRef } from 'react'

/*
 * The hand-drawn line under the compact intro's key words. It draws itself in
 * once, but only after the page has settled: once the fonts are in (so the
 * words have their final width) and the browser is idle (so hydration is
 * done). A draw that started on arrival ran while a reload was still loading
 * and stuttered, then jumped. The draw itself is one clip on one element
 * (compact.css), so nothing can fall out of step. Without script, or with
 * reduced motion, the line is simply there.
 */
export function ScribbleLine() {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    let cancelled = false
    let idle = 0
    let timer = 0
    const draw = () => ref.current?.setAttribute('data-draw', '')
    void document.fonts.ready.then(() => {
      if (cancelled) return
      // Safari has no requestIdleCallback: a short wait stands in for idle.
      if (typeof window.requestIdleCallback === 'function')
        idle = window.requestIdleCallback(draw, { timeout: 1500 })
      else timer = window.setTimeout(draw, 300)
    })
    return () => {
      cancelled = true
      if (idle) window.cancelIdleCallback(idle)
      window.clearTimeout(timer)
    }
  }, [])

  return (
    <svg
      ref={ref}
      aria-hidden="true"
      viewBox="0 0 200 14"
      preserveAspectRatio="none"
      className="cp-scribble"
    >
      <path d="M3 8.5C48 4.2 112 3.1 197 5.6M22 11.6c42-2.4 96-2.9 158-1.4" />
    </svg>
  )
}
