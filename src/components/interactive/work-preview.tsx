'use client'

import Image, { type StaticImageData } from 'next/image'
import { useEffect, useRef, useState, type ReactNode } from 'react'

type Props = {
  items: readonly { slug: string; image: StaticImageData }[]
  children: ReactNode
}

/* Where the preview shows: room in the right margin and a pointer that hovers. */
const WIDE = '(min-width: 80rem) and (hover: hover) and (pointer: fine)'
/* How much of the remaining distance the frame covers each frame: a soft follow. */
const FOLLOW = 0.12

/*
 * The selected work's margin preview (DESIGN.md §5b): on a wide screen with a
 * mouse, the project under the pointer (or holding keyboard focus) shows its
 * cover in the right margin, level with the pointer, the frame following it
 * with a little lag and the covers crossfading. It sits beside the column, so
 * it never covers the text or a link.
 * Without room, a hovering pointer or
 * script, each row shows its own thumbnail instead (compact.css), so nothing
 * depends on it. Reduced motion: the frame jumps instead of gliding.
 */
export function WorkPreview({ items, children }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<string | null>(null)
  const motion = useRef({ target: 0, y: 0, raf: 0, wide: false, still: false })

  useEffect(() => {
    const state = motion.current
    const wide = window.matchMedia(WIDE)
    const still = window.matchMedia('(prefers-reduced-motion: reduce)')
    const read = () => {
      state.wide = wide.matches
      state.still = still.matches
    }
    read()
    wide.addEventListener('change', read)
    still.addEventListener('change', read)
    return () => {
      wide.removeEventListener('change', read)
      still.removeEventListener('change', read)
      window.cancelAnimationFrame(state.raf)
    }
  }, [])

  const place = (y: number) => {
    const state = motion.current
    const box = root.current
    const el = frame.current
    if (!box || !el) return
    const max = box.offsetHeight - el.offsetHeight
    state.target = Math.min(Math.max(y - el.offsetHeight / 2, 0), Math.max(max, 0))
    if (state.still || !active) {
      // Jump: reduced motion, or the first row entered (no glide in from the top).
      state.y = state.target
      el.style.transform = `translate3d(0, ${state.y}px, 0)`
      return
    }
    if (state.raf) return
    const step = () => {
      state.y += (state.target - state.y) * FOLLOW
      if (Math.abs(state.target - state.y) < 0.5) state.y = state.target
      el.style.transform = `translate3d(0, ${state.y}px, 0)`
      state.raf = state.y === state.target ? 0 : window.requestAnimationFrame(step)
    }
    state.raf = window.requestAnimationFrame(step)
  }

  const show = (target: EventTarget, y: number) => {
    if (!motion.current.wide || !(target instanceof Element)) return
    const row = target.closest<HTMLElement>('[data-slug]')
    if (!row) return
    const slug = row.dataset.slug ?? null
    if (slug !== active) setActive(slug)
    place(y)
  }

  return (
    <div
      ref={root}
      className="cp-work"
      onPointerMove={(event) => {
        const top = root.current?.getBoundingClientRect().top ?? 0
        show(event.target, event.clientY - top)
      }}
      onPointerLeave={() => setActive(null)}
      onFocus={(event) => {
        const row = event.target.closest<HTMLElement>('[data-slug]')
        if (row) show(event.target, row.offsetTop + row.offsetHeight / 2)
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setActive(null)
      }}
    >
      {children}
      <div aria-hidden="true" className="cp-preview" data-on={active ? '' : undefined}>
        <div ref={frame} className="cp-preview-frame">
          {items.map((item) => (
            <Image
              key={item.slug}
              src={item.image}
              alt=""
              sizes="20rem"
              data-on={item.slug === active ? '' : undefined}
              className="cp-preview-image"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
