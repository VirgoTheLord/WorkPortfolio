'use client'

import { useEffect, useRef } from 'react'

/* Cells per grid square: at least thirds of the hero's grid, so every cell sits
   exactly inside the grid behind it (16px at the 48px desktop cell), and finer
   where the name is small, so its capitals are always at least ROWS cells tall
   (a phone's name would otherwise be too coarse to read). */
const PER_SQUARE = 3
const ROWS = 16
/* The gap between neighbouring cells, in px: a hairline, so the name reads as
   solid with the grid's grain in it (half that for the finest cells). */
const GAP = 1
/* A cell is drawn, whole, when the letter covers at least this share of it:
   no partial squares, so every edge is a clean step on the grid. */
const MIN_COVER = 0.45
/* The hover: within REACH grid squares of the pointer the cells shrink, by up to
   OPEN of their size at the centre, on a smooth bell ((1 − r²/R²)²), opening the
   letters into a halftone. Ink only: the site's own pointer mark is the accent.
   The field follows the pointer, rises and settles with these per-frame easings
   (60fps), without overshoot. */
const REACH = 2.2
const OPEN = 0.82
const FOLLOW = 0.2
const RISE = 0.16
const SETTLE = 0.08
/* The entrance: cells print left to right behind the intro's wipe, each growing
   from nothing over GROW ms, the sweep crossing the name in SWEEP ms. */
const SWEEP = 650
const GROW = 320

type Cell = { x: number; y: number; size: number; delay: number }

/*
 * The hero name, set in cells (hero.css). The heading stays real text (its
 * colour goes transparent once this has drawn, so it is still read, selected
 * and found), and this canvas over the line draws the name as squares: one per
 * third of the hero's grid square, aligned to the grid behind it, a hairline
 * apart. A cell is drawn whole where the letter covers at least MIN_COVER of
 * it, so every edge is a clean step on the grid.
 *
 * The entrance is the intro's own: the wipe blocks leave the line left to right,
 * and the cells print in behind them in the same direction (started when the
 * intro turns the line on). Without the intro the cells simply print in once.
 *
 * With a fine pointer over the name, the cells near it shrink on a smooth bell,
 * opening the letters into a fine halftone, and settle back when it leaves. Ink
 * only: the site's pointer mark is the accent. While it is active the grid's own
 * bend stands down (data-cells-hover on the hero, read by hero-grid.tsx), so the
 * two never fight.
 *
 * The canvas draws only when something changes: the frame loop runs during the
 * entrance and while the field moves, and stops when both are done. Reduced
 * motion: the cells, drawn once, no entrance and no hover. No script: the
 * plain name.
 */
export function HeroCells() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const line = canvas?.closest<HTMLElement>('.hero-line')
    const text = line?.querySelector<HTMLElement>('[data-hero-text]')
    const hero = canvas?.closest<HTMLElement>('[data-hero]')
    const title = canvas?.closest<HTMLElement>('h1')
    const ctx = canvas?.getContext('2d')
    if (!canvas || !line || !text || !hero || !title || !ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')

    let width = 0
    let height = 0
    let ratio = 1
    let cell = 0
    let square = 0
    let ink = ''
    let cells: Cell[] = []
    // Entrance: when it started (0: not yet, -1: done or skipped).
    let started = 0
    // The field: pointer (target) and eased centre, strength and its aim.
    let tx = 0
    let ty = 0
    let fx = 0
    let fy = 0
    let strength = 0
    let aim = 0
    let frame = 0
    let last = 0

    /* Lay the cells: sample the name once, cell by cell. */
    const build = () => {
      const box = text.getBoundingClientRect()
      const heroBox = hero.getBoundingClientRect()
      const style = getComputedStyle(text)
      const root = getComputedStyle(document.documentElement)
      const grid = parseFloat(root.getPropertyValue('--spacing-grid')) * parseFloat(root.fontSize)
      width = box.width
      height = box.height
      // The capitals' height in this face (a share of the size), for the ROWS floor.
      const cap = parseFloat(style.fontSize) * 0.7
      square = grid
      cell = grid / Math.max(PER_SQUARE, Math.ceil(grid / (cap / ROWS)))
      const gap = cell >= 10 ? GAP : GAP / 2
      ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      ink = getComputedStyle(title).color

      // The name, drawn as the heading sets it, at twice the cell resolution's need.
      const scale = 2
      const probe = document.createElement('canvas')
      probe.width = Math.ceil(width * scale)
      probe.height = Math.ceil(height * scale)
      const p = probe.getContext('2d', { willReadFrequently: true })
      if (!p || cell <= 0) return
      const size = parseFloat(style.fontSize)
      p.scale(scale, scale)
      p.font = `${style.fontWeight} ${size}px ${style.fontFamily}`
      p.textBaseline = 'alphabetic'
      const m = p.measureText(text.textContent ?? '')
      const lineHeight = parseFloat(style.lineHeight) || size
      const baseline =
        (lineHeight - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2 +
        m.fontBoundingBoxAscent
      p.fillText(text.textContent ?? '', 0, baseline)
      const data = p.getImageData(0, 0, probe.width, probe.height).data

      // Cells sit on the hero's grid: columns from its centre line, rows from its top.
      const ox = ((((heroBox.left + heroBox.width / 2 - box.left) % cell) + cell) % cell) - cell
      const oy = ((((heroBox.top - box.top) % cell) + cell) % cell) - cell
      const coverage = (x0: number, y0: number) => {
        const ax = Math.max(0, Math.floor(x0 * scale))
        const ay = Math.max(0, Math.floor(y0 * scale))
        const bx = Math.min(probe.width, Math.ceil((x0 + cell) * scale))
        const by = Math.min(probe.height, Math.ceil((y0 + cell) * scale))
        let sum = 0
        for (let y = ay; y < by; y++) {
          for (let x = ax; x < bx; x++) sum += data[(y * probe.width + x) * 4 + 3]!
        }
        return sum / (255 * cell * scale * cell * scale)
      }
      cells = []
      for (let y = oy; y < height; y += cell) {
        for (let x = ox; x < width; x += cell) {
          const cover = coverage(x, y)
          if (cover < MIN_COVER) continue
          cells.push({
            x: x + cell / 2,
            y: y + cell / 2,
            size: cell - gap,
            delay: (Math.max(0, x) / width) * SWEEP + ((y - oy) / height) * 60,
          })
        }
      }
      // Centre what is drawn, not the text box: the face's advance leaves room
      // after the last letter, and the cells snap to the grid, so the ink sits
      // left of the centre line. Move it by whole cells (so it stays on the grid)
      // to the step nearest the hero's centre, within the line's own box.
      if (cells.length) {
        let left = Infinity
        let right = -Infinity
        for (const c of cells) {
          left = Math.min(left, c.x - c.size / 2)
          right = Math.max(right, c.x + c.size / 2)
        }
        const centre = heroBox.left + heroBox.width / 2 - box.left
        const shift = Math.round((centre - (left + right) / 2) / cell) * cell
        const fit = Math.min(Math.max(shift, -left), width - right)
        const step = Math.trunc(fit / cell) * cell
        for (const c of cells) c.x += step
      }
      line.dataset.cells = 'on'
    }

    const draw = (now: number) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = ink
      const elapsed = started > 0 ? now - started : 0
      const reach = REACH * square
      let printing = false
      for (const c of cells) {
        let grow = 1
        if (started > 0) {
          const t = Math.min(1, Math.max(0, (elapsed - c.delay) / GROW))
          grow = 1 - (1 - t) ** 3
          if (t < 1) printing = true
        } else if (started === 0) {
          grow = 0
        }
        if (grow <= 0) continue
        let f = 0
        if (strength > 0) {
          const dx = c.x - fx
          const dy = c.y - fy
          const d2 = dx * dx + dy * dy
          if (d2 < reach * reach) {
            const q = 1 - d2 / (reach * reach)
            f = q * q * strength
          }
        }
        const side = c.size * grow * (1 - OPEN * f)
        if (side < 0.5) continue
        // Whole device pixels, so every square edge is crisp.
        const x = Math.round((c.x - side / 2) * ratio)
        const y = Math.round((c.y - side / 2) * ratio)
        const s = Math.max(1, Math.round(side * ratio))
        ctx.fillRect(x, y, s, s)
      }
      if (started > 0 && !printing) started = -1
      return printing
    }

    const tick = (now: number) => {
      const steps = last ? Math.min((now - last) / (1000 / 60), 4) : 1
      last = now
      const ease = (rate: number) => 1 - Math.pow(1 - rate, steps)
      fx += (tx - fx) * ease(FOLLOW)
      fy += (ty - fy) * ease(FOLLOW)
      strength += (aim - strength) * ease(aim > strength ? RISE : SETTLE)
      const settled =
        Math.abs(tx - fx) < 0.1 && Math.abs(ty - fy) < 0.1 && Math.abs(aim - strength) < 0.002
      if (settled) {
        fx = tx
        fy = ty
        strength = aim
      }
      const printing = draw(now)
      frame = printing || !settled ? requestAnimationFrame(tick) : 0
    }
    const run = () => {
      if (frame) return
      last = 0
      frame = requestAnimationFrame(tick)
    }
    const print = () => {
      if (started !== 0) return
      started = performance.now()
      run()
    }

    // ---- The entrance --------------------------------------------------------
    // During the intro the line is turned on (opacity 1) under the wipe blocks;
    // that is the moment the cells start printing behind the blocks as they leave.
    const watch = new MutationObserver(() => {
      if (getComputedStyle(text).opacity === '1') {
        watch.disconnect()
        print()
      }
    })

    // ---- The hover -------------------------------------------------------------
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || started > 0) return
      const box = canvas.getBoundingClientRect()
      tx = event.clientX - box.left
      ty = event.clientY - box.top
      const margin = square
      const over =
        tx > -margin && tx < box.width + margin && ty > -margin && ty < box.height + margin
      if (over) {
        if (strength < 0.01) {
          fx = tx
          fy = ty
        }
        aim = 1
        hero.dataset.cellsHover = 'on'
      } else {
        aim = 0
        delete hero.dataset.cellsHover
      }
      run()
    }
    const onLeave = () => {
      aim = 0
      delete hero.dataset.cellsHover
      run()
    }

    const setup = () => {
      build()
      if (reduced.matches) {
        started = -1
        draw(0)
        return
      }
      if (document.documentElement.classList.contains('is-intro')) {
        // Wait for the intro to turn the line on.
        draw(0)
        watch.observe(text, { attributes: true, attributeFilter: ['style'] })
      } else {
        print()
      }
    }

    const resize = new ResizeObserver(() => {
      if (!cells.length) return
      build()
      draw(performance.now())
    })

    let cancelled = false
    void document.fonts.ready.then(() => {
      if (cancelled) return
      setup()
      resize.observe(text)
      if (fine.matches && !reduced.matches) {
        hero.addEventListener('pointermove', onMove, { passive: true })
        hero.addEventListener('pointerleave', onLeave)
      }
    })
    // The theme changes the ink: redraw in the new colours.
    const scheme = window.matchMedia('(prefers-color-scheme: dark)')
    const recolour = () => {
      if (!cells.length) return
      build()
      draw(performance.now())
    }
    scheme.addEventListener('change', recolour)

    return () => {
      cancelled = true
      watch.disconnect()
      resize.disconnect()
      scheme.removeEventListener('change', recolour)
      hero.removeEventListener('pointermove', onMove)
      hero.removeEventListener('pointerleave', onLeave)
      if (frame) cancelAnimationFrame(frame)
      delete line.dataset.cells
      delete hero.dataset.cellsHover
    }
  }, [])

  return <canvas ref={ref} aria-hidden="true" className="hero-cells" />
}
