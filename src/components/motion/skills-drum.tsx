'use client'

import { useEffect, useRef } from 'react'
import type { CSSProperties, ReactNode } from 'react'

/*
 * The Skills drum (sections/skills.css). The server's list is stood up as the
 * faces of a cylinder: each face is turned to its place round the axis and
 * pushed out to the radius, and the scroll through the section turns the whole
 * drum, first face to last, so one face is square to the reader at a time. The
 * accent follows the turn rather than switching: each face's --heat is how
 * squarely it faces the reader (1 square on, 0 a face's turn away, eased), and
 * its colours are mixed from it in CSS, so the red flows round the drum with
 * the scroll. The faces are placed from the drum's own height, so the cylinder
 * closes exactly however tall a face is.
 *
 * The scroll listener exists only while the section is on screen and paints at
 * most once a frame; transforms only. Not armed for reduced motion, so the list
 * simply stays a list.
 */
export function SkillsDrum({ count, children }: { count: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    const ring = root?.querySelector<HTMLElement>('[data-skills-ring]')
    if (!root || !ring) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const faces = Array.from(ring.querySelectorAll<HTMLElement>('[data-skills-face]'))
    const counter = root.querySelector<HTMLElement>('[data-skills-count]')
    const pad = (n: number) => String(n).padStart(2, '0')
    let front = -1
    const step = 360 / faces.length
    let radius = 0
    let frame = 0

    const measure = () => {
      // The apothem of a regular polygon with one side per face. The drum is
      // set back by it, so the face in front sits at true size, not enlarged by
      // the perspective (and clipped at the sides).
      radius = ring.offsetHeight / 2 / Math.tan(Math.PI / faces.length)
      ring.style.transform = `translateZ(${-radius}px)`
    }

    const paint = () => {
      frame = 0
      const box = root.getBoundingClientRect()
      const travel = box.height - window.innerHeight
      const progress = travel > 0 ? Math.min(1, Math.max(0, -box.top / travel)) : 0
      const turn = progress * (faces.length - 1) * step
      const nearest = Math.round(turn / step)
      if (counter && nearest !== front) {
        counter.textContent = `${pad(nearest + 1)}/${pad(faces.length)}`
        front = nearest
      }
      faces.forEach((face, i) => {
        const angle = i * step - turn
        face.style.transform = `rotateX(${-angle}deg) translateZ(${radius}px)`
        // Smoothstep over one face's turn either side of square on.
        const t = Math.max(0, 1 - Math.abs(angle) / step)
        const heat = t * t * (3 - 2 * t)
        face.style.setProperty('--heat', heat.toFixed(3))
        // The ink changes sides at half: mixed, light and dark text pass through
        // a grey that is hard to read on a half-red face.
        face.toggleAttribute('data-hot', heat > 0.5)
      })
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(paint)
    }
    const onResize = () => {
      measure()
      onScroll()
    }

    root.dataset.drum = 'on'
    measure()
    paint()

    const watch = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        window.addEventListener('scroll', onScroll, { passive: true })
        onScroll()
      } else window.removeEventListener('scroll', onScroll)
    })
    watch.observe(root)
    window.addEventListener('resize', onResize)

    return () => {
      watch.disconnect()
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      delete root.dataset.drum
      ring.style.transform = ''
      faces.forEach((face) => {
        face.style.transform = ''
        face.style.removeProperty('--heat')
        face.removeAttribute('data-hot')
      })
    }
  }, [])

  return (
    <div ref={ref} className="skills-drum" style={{ '--count': count } as CSSProperties}>
      <div className="skills-pin">{children}</div>
    </div>
  )
}
