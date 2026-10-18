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
   no partial squares, so every edge is a clean step on the grid. Half, so a left
   and a right edge round the same way and twin stems come out the same width. */
const MIN_COVER = 0.5
/* The fewest empty cells between two letters, in any row both have ink. */
const MIN_GAP = 2
/* How far a letter's cells may differ from their mirror image (or half turn), as
   a share of its ink, and still count as symmetric. */
const SYMMETRY = 0.15
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
/* The entrance: each cell prints in as the wipe's last block (the accent) clears
   it. The blocks leave left to right on one curve (hero-intro.tsx: the accent
   starts LEAVE_AT after the line turns on and takes LEAVE, power2.out), so a
   cell's start is that curve solved for its position, LEAD early, and it grows
   in GROW. Cells printing on their own clock (0.65s across, 0.32s each) trailed
   the blocks by about half a second: the name was still fading in after the
   wipe had gone. */
const LEAVE_AT = 80
const LEAVE = 420
const LEAD = 60
const GROW = 160
/* When power2.out first reaches `f` (0–1): its inverse. */
const leaveTime = (f: number) => 1 - Math.sqrt(1 - f)

type Cell = { x: number; y: number; size: number; delay: number }

/*
 * A counter (a hole closed inside a letter, the A's) is redrawn as a tiered
 * pixel tree: from the top 1, 3, 5 cells wide, then a second tier of 3, 5, and so
 * on, centred on the hole and ending on its own bottom width, so the crossbar
 * and the legs below it do not move. Traced from the font, the A's inner edges
 * climb two rows a column, so its hole came out 1, 1, 3, 3, 5 cells wide: a
 * narrow shaft over a wider base, which read as something else entirely.
 */
function shapeCounters(on: Uint8Array, cols: number, rows: number) {
  // Background cells that reach the edge of the bitmap are outside; the rest are holes.
  const outside = new Uint8Array(on.length)
  const stack: number[] = []
  for (let i = 0; i < on.length; i++) {
    const r = Math.floor(i / cols)
    const c = i % cols
    if (!on[i] && (r === 0 || r === rows - 1 || c === 0 || c === cols - 1)) {
      outside[i] = 1
      stack.push(i)
    }
  }
  while (stack.length) {
    const i = stack.pop()!
    const r = Math.floor(i / cols)
    const c = i % cols
    const next = [
      r > 0 ? i - cols : -1,
      r < rows - 1 ? i + cols : -1,
      c > 0 ? i - 1 : -1,
      c < cols - 1 ? i + 1 : -1,
    ]
    for (const j of next) {
      if (j < 0 || on[j] || outside[j]) continue
      outside[j] = 1
      stack.push(j)
    }
  }
  const seen = new Uint8Array(on.length)
  for (let i = 0; i < on.length; i++) {
    if (on[i] || outside[i] || seen[i]) continue
    // One hole: gather it.
    const hole: number[] = []
    stack.push(i)
    seen[i] = 1
    while (stack.length) {
      const k = stack.pop()!
      hole.push(k)
      const c = k % cols
      const next = [k - cols, k + cols, c > 0 ? k - 1 : -1, c < cols - 1 ? k + 1 : -1]
      for (const j of next) {
        if (j < 0 || j >= on.length || on[j] || outside[j] || seen[j]) continue
        seen[j] = 1
        stack.push(j)
      }
    }
    let top = rows
    let bottom = -1
    for (const k of hole) {
      const r = Math.floor(k / cols)
      top = Math.min(top, r)
      bottom = Math.max(bottom, r)
    }
    let lo = cols
    let hi = -1
    for (const k of hole) {
      if (Math.floor(k / cols) !== bottom) continue
      lo = Math.min(lo, k % cols)
      hi = Math.max(hi, k % cols)
    }
    const base = hi - lo + 1
    const height = bottom - top + 1
    if (base < 3 || height < 3) continue
    // The widths, top to bottom: tiers of a tree, the last one the hole's own base.
    const start = base % 2 ? 1 : 2
    const widths: number[] = []
    let w = start
    while (widths.length < height) {
      widths.push(w)
      w += 2
      if (w > base) w = Math.max(start + 2, base - 2)
    }
    widths[height - 1] = base
    const centre = (lo + hi) / 2
    for (const k of hole) on[k] = 1
    widths.forEach((width, n) => {
      const r = top + n
      const from = Math.round(centre - (width - 1) / 2)
      for (let c = from; c < from + width; c++) on[r * cols + c] = 0
    })
  }
}

/*
 * The hero name, set in cells (hero.css). The heading stays real text (its
 * colour goes transparent once this has drawn, so it is still read, selected
 * and found), and this canvas over the line draws the name as squares: one per
 * third of the hero's grid square, aligned to the grid behind it, a hairline
 * apart. A cell is drawn whole where the letter covers at least MIN_COVER of
 * it, so every edge is a clean step on the grid.
 *
 * The entrance is the intro's own: the wipe blocks leave the line left to right,
 * and each cell prints in as the accent block's trailing edge passes it (started when the
 * intro, or a reload's entrance, turns the line on). With neither (a deep link) the
 * cells simply print in once.
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
/*
 * On a reload (`html.is-enter`) the cells are set up as soon as this module runs,
 * on the canvas the server already rendered, rather than when React has finished
 * hydrating the page: in development, or on a slow machine, that came after the
 * entrance's wipe had left (measured: about 1.9s at a 4x slower CPU), so the
 * name was missing for a moment and then popped in. React adopts the same canvas
 * when it hydrates; a canvas set up early is not set up again.
 */
const early = new WeakSet<HTMLCanvasElement>()

if (typeof window !== 'undefined') {
  const start = () => {
    if (!document.documentElement.classList.contains('is-enter')) return
    document.querySelectorAll<HTMLCanvasElement>('canvas.hero-cells').forEach((canvas) => {
      if (early.has(canvas)) return
      early.add(canvas)
      mountCells(canvas)
    })
  }
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', start, { once: true })
  else start()
}

export function HeroCells() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || early.has(canvas)) return
    return mountCells(canvas)
  }, [])

  // suppressHydrationWarning: on a reload this canvas (and its line's
  // data-cells) may already be drawn before React hydrates.
  return <canvas ref={ref} aria-hidden="true" className="hero-cells" suppressHydrationWarning />
}

function mountCells(canvas: HTMLCanvasElement): (() => void) | undefined {
  const line = canvas.closest<HTMLElement>('.hero-line')
  const text = line?.querySelector<HTMLElement>('[data-hero-text]')
  const hero = canvas.closest<HTMLElement>('[data-hero]')
  const title = canvas.closest<HTMLElement>('h1')
  const ctx = canvas.getContext('2d')
  if (!line || !text || !hero || !title || !ctx) return

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
    const hairline = cell >= 10 ? GAP : GAP / 2
    ratio = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(width * ratio)
    canvas.height = Math.round(height * ratio)
    ink = getComputedStyle(title).color

    // The name is hinted onto the grid, the way a pixel face is drawn. Each
    // letter becomes its own bitmap of cells: measured from its outline and
    // scaled a hair (a few percent at most) so its width and the capital height
    // are whole numbers of cells, with the baseline on a cell row. A letter
    // whose outline is symmetric (A, W, I mirrored; N turned) is made exactly
    // symmetric in cells. The letters are then spaced by their contours, row
    // by row, as a type designer kerns: each sits as close as it can with
    // MIN_GAP empty cells to its neighbour in every row both have ink. Sampled
    // as the font falls, twin stems came out 6 and 7 cells wide, the A's
    // counter was lopsided, and box-to-box spacing left a hole between L and W.
    const scale = 2
    const probe = document.createElement('canvas').getContext('2d')
    if (!probe || cell <= 0) return
    const size = parseFloat(style.fontSize)
    const font = `${style.fontWeight} ${size}px ${style.fontFamily}`
    probe.font = font
    // A canvas ignores CSS text-transform: draw the name as the heading shows it.
    const raw = text.textContent ?? ''
    const name = style.textTransform === 'uppercase' ? raw.toUpperCase() : raw
    const letters = Array.from(name).filter((ch) => ch.trim())
    if (!letters.length) return

    // Vertical: the capital height is a whole number of rows, the baseline on a
    // row of the hero's grid (rows from its top).
    const oy = ((((heroBox.top - box.top) % cell) + cell) % cell) - cell
    const capInk = probe.measureText('H').actualBoundingBoxAscent || size * 0.7
    const rows = Math.max(1, Math.round(capInk / cell))
    const sy = (rows * cell) / capInk
    const metrics = probe.measureText(name)
    const lineHeight = parseFloat(style.lineHeight) || size
    const natural =
      (lineHeight - (metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent)) / 2 +
      metrics.fontBoundingBoxAscent
    const baseline = oy + Math.round((natural - oy) / cell) * cell
    // One spare row above and below the capitals, for any overshoot.
    const pad = 1
    const span = rows + pad * 2

    const glyphs = letters.map((ch) => {
      const g = probe.measureText(ch)
      const ink = g.actualBoundingBoxLeft + g.actualBoundingBoxRight
      const cols = Math.max(1, Math.round((ink * sy) / cell))
      const sheet = document.createElement('canvas')
      sheet.width = Math.ceil(cols * cell * scale)
      sheet.height = Math.ceil(span * cell * scale)
      const q = sheet.getContext('2d', { willReadFrequently: true })
      const cov = new Float32Array(span * cols)
      if (q) {
        q.scale(scale, scale)
        q.font = font
        q.textBaseline = 'alphabetic'
        q.translate(0, (pad + rows) * cell)
        q.scale((cols * cell) / ink, sy)
        q.fillText(ch, g.actualBoundingBoxLeft, 0)
        const data = q.getImageData(0, 0, sheet.width, sheet.height).data
        const px = cell * scale
        for (let r = 0; r < span; r++) {
          const ay = Math.floor(r * px)
          const by = Math.min(sheet.height, Math.floor((r + 1) * px))
          for (let c = 0; c < cols; c++) {
            const ax = Math.floor(c * px)
            const bx = Math.min(sheet.width, Math.floor((c + 1) * px))
            let sum = 0
            for (let y = ay; y < by; y++) {
              for (let x = ax; x < bx; x++) sum += data[(y * sheet.width + x) * 4 + 3]!
            }
            const area = (by - ay) * (bx - ax)
            cov[r * cols + c] = area ? sum / (255 * area) : 0
          }
        }
      }
      // Symmetry: a mirror (left to right) or a half turn, if the outline has one.
      const mirror = (i: number) => {
        const r = Math.floor(i / cols)
        return r * cols + (cols - 1 - (i % cols))
      }
      const turn = (i: number) => cov.length - 1 - i
      const differs = (map: (i: number) => number) => {
        let d = 0
        let t = 0
        for (let i = 0; i < cov.length; i++) {
          d += Math.abs(cov[i]! - cov[map(i)]!)
          t += cov[i]!
        }
        return t ? d / t : 1
      }
      const map = differs(mirror) < SYMMETRY ? mirror : differs(turn) < SYMMETRY ? turn : null
      const on = new Uint8Array(cov.length)
      for (let i = 0; i < cov.length; i++) {
        const v = map ? (cov[i]! + cov[map(i)]!) / 2 : cov[i]!
        on[i] = v >= MIN_COVER ? 1 : 0
      }
      shapeCounters(on, cols, span)
      // Each row's first and last filled column (-1: none), for the spacing.
      const first = new Int32Array(span).fill(-1)
      const last = new Int32Array(span).fill(-1)
      for (let r = 0; r < span; r++) {
        for (let c = 0; c < cols; c++) {
          if (!on[r * cols + c]) continue
          if (first[r] === -1) first[r] = c
          last[r] = c
        }
      }
      return { cols, on, first, last }
    })

    // Spacing by contour: each letter as close as MIN_GAP empty cells allow.
    const offsets = [0]
    for (let i = 1; i < glyphs.length; i++) {
      const prev = glyphs[i - 1]!
      const cur = glyphs[i]!
      const base = offsets[i - 1]!
      let at = -Infinity
      for (let r = 0; r < span; r++) {
        if (prev.last[r]! < 0 || cur.first[r]! < 0) continue
        at = Math.max(at, base + prev.last[r]! + 1 + MIN_GAP - cur.first[r]!)
      }
      offsets.push(Number.isFinite(at) ? at : base + prev.cols + MIN_GAP)
    }
    const total = Math.max(...glyphs.map((g, i) => offsets[i]! + g.cols))

    // Centred on the hero's centre line (a column edge), kept inside the line's box.
    const centre = heroBox.left + heroBox.width / 2 - box.left
    let left = centre - Math.floor(total / 2) * cell
    while (left < 0) left += cell
    while (left + total * cell > width && left - cell >= 0) left -= cell
    const top = baseline - (rows + pad) * cell

    cells = []
    glyphs.forEach((g, i) => {
      for (let r = 0; r < span; r++) {
        for (let c = 0; c < g.cols; c++) {
          if (!g.on[r * g.cols + c]) continue
          const x = left + (offsets[i]! + c) * cell
          const y = top + r * cell
          cells.push({
            x: x + cell / 2,
            y: y + cell / 2,
            size: cell - hairline,
            delay: Math.max(
              0,
              LEAVE_AT + LEAVE * leaveTime(Math.min(1, Math.max(0, x + cell / 2) / width)) - LEAD,
            ),
          })
        }
      }
    })
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
    // Printing starts when the line turned on: if this island mounted late (the
    // entrance runs before hydration), it catches up rather than starting over.
    started = Number(line.dataset.onAt) || performance.now()
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
    const over = tx > -margin && tx < box.width + margin && ty > -margin && ty < box.height + margin
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
    const html = document.documentElement
    if (html.classList.contains('is-enter')) {
      // A reload's entrance is CSS on the compositor (hero.css), running while
      // the page is still starting up and the main thread is busy. The cells
      // are drawn once, whole, under the blocks, and the accent block's exit
      // reveals them: printing them a frame at a time here dropped to a few
      // frames a second (owner's note: smooth after the preloader, 2fps on a
      // reload).
      started = -1
      draw(0)
    } else if (html.classList.contains('is-intro')) {
      // Wait for the intro to turn the line on, unless it already has.
      if (line.dataset.onAt) print()
      else {
        draw(0)
        watch.observe(text, { attributes: true, attributeFilter: ['style'] })
      }
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
}
