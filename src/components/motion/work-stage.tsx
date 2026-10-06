'use client'

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { playScramble } from '@/lib/motion/scramble'

const WIDE = '(min-width: 64rem)'

/*
 * Selected Work's behaviour (layout and the image drift are CSS, work.css):
 *   - the current project is the one crossing the middle of the screen (the
 *     reference's rule: half visible inside a 20% inset). Its thumbnail takes
 *     data-active and aria-current, and the marker moves beside it, turning a
 *     quarter on every move. Only tracked from lg, where the thumbnails exist.
 *   - clicking a thumbnail scrolls its project to the middle of the screen
 *     (native smooth scrolling, instant under reduced motion).
 *   - a title scrambles once as it enters the screen, and again when the pointer
 *     reaches its image.
 * Observers are the only listeners while scrolling: no scroll handler runs.
 */
export function WorkStage({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const projects = Array.from(root.querySelectorAll<HTMLElement>('[data-work-project]'))
    const thumbs = Array.from(root.querySelectorAll<HTMLElement>('[data-work-thumb]'))
    const marker = root.querySelector<HTMLElement>('[data-work-marker]')
    const wide = window.matchMedia(WIDE)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

    // ---- Current project ------------------------------------------------------
    let current = 0
    let turns = 0
    let locked = false
    let unlock = 0

    const place = (index: number, turn: boolean) => {
      thumbs.forEach((thumb, i) => {
        thumb.toggleAttribute('data-active', i === index)
        if (i === index) thumb.setAttribute('aria-current', 'true')
        else thumb.removeAttribute('aria-current')
      })
      const thumb = thumbs[index]
      if (!marker || !thumb) return
      if (turn) turns += 1
      marker.style.setProperty(
        '--marker-y',
        `${thumb.offsetTop + (thumb.offsetHeight - marker.offsetHeight) / 2}px`,
      )
      marker.style.setProperty('--marker-turn', `${turns * 90}deg`)
    }

    let observers: IntersectionObserver[] = []
    const track = () => {
      observers.forEach((observer) => observer.disconnect())
      observers = []
      if (!wide.matches) return
      place(current, false)
      projects.forEach((project, i) => {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (locked || !entry?.isIntersecting || i === current) return
            current = i
            place(i, true)
          },
          { threshold: 0.5, rootMargin: '-20% 0px -20% 0px' },
        )
        observer.observe(project)
        observers.push(observer)
      })
    }
    track()
    wide.addEventListener('change', track)

    // ---- Thumbnails ---------------------------------------------------------
    const onClick = (event: MouseEvent) => {
      const thumb = (event.target as Element).closest<HTMLElement>('[data-work-thumb]')
      const project = thumb ? projects[thumbs.indexOf(thumb)] : undefined
      if (!thumb || !project || event.button !== 0) return
      event.preventDefault()
      const index = thumbs.indexOf(thumb)
      if (index !== current) {
        current = index
        place(index, true)
      }
      const rect = project.getBoundingClientRect()
      const top = window.scrollY + rect.top - window.innerHeight / 2 + rect.height / 2
      // The scroll passes other projects on the way: hold the choice until it lands.
      locked = true
      window.clearTimeout(unlock)
      unlock = window.setTimeout(() => (locked = false), 1200)
      window.scrollTo({ top, behavior: reduced.matches ? 'auto' : 'smooth' })
    }
    root.addEventListener('click', onClick)

    // ---- Titles -----------------------------------------------------------------
    const cancels = new Map<HTMLElement, () => void>()
    const scramble = (project: HTMLElement) => {
      const node = project.querySelector<HTMLElement>('[data-menu-scramble]')
      if (!node || reduced.matches) return
      cancels.get(node)?.()
      cancels.set(node, playScramble(node, node.dataset.menuScramble ?? '', 500))
    }
    const entering = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          scramble(entry.target as HTMLElement)
          entering.unobserve(entry.target)
        })
      },
      { rootMargin: '0px 0px -5% 0px' },
    )
    projects.forEach((project) => {
      // A title already in view at load has nothing to enter.
      if (project.getBoundingClientRect().top > window.innerHeight) entering.observe(project)
    })

    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const onOver = (event: PointerEvent) => {
      if (!fine.matches || event.pointerType !== 'mouse') return
      const media = (event.target as Element).closest<HTMLElement>('[data-work-media]')
      if (!media || media.contains(event.relatedTarget as Node)) return
      const project = media.closest<HTMLElement>('[data-work-project]')
      if (project) scramble(project)
    }
    root.addEventListener('pointerover', onOver)

    return () => {
      observers.forEach((observer) => observer.disconnect())
      entering.disconnect()
      window.clearTimeout(unlock)
      wide.removeEventListener('change', track)
      root.removeEventListener('click', onClick)
      root.removeEventListener('pointerover', onOver)
      cancels.forEach((cancel) => cancel())
    }
  }, [])

  return (
    <div ref={ref} className="contents">
      {children}
    </div>
  )
}
