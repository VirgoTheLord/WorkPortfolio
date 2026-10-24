/*
 * A fading trail of cells on the site's grid, drawn on a canvas that covers
 * `host`: the hero's drag-to-draw (motion/hero-draw.tsx). Cells are a third of a grid square
 * (--spacing-grid), on the grid's own lines (columns from the host's centre line,
 * rows from its top), in the host's text colour. A stroke lights a BRUSH × BRUSH
 * square at every half cell along the path, each cell growing in over GROW and
 * fading out over LIFE. Nothing is drawn until the pointer has travelled half a
 * cell, so a tap leaves no mark. The canvas draws only while a trail is fading.
 */

/* The brush, in cells, and how long a drawn cell lasts before it has gone. */
const BRUSH = 2
const LIFE = 600
/* The most cells alive at once: past this the oldest go first. */
const CAP = 1500
/* The hairline between neighbouring cells, as the hero name's. */
const GAP = 1
/* Every cell grows in from the centre of its square over GROW ms (an ease-out,
   as the name's cells print), so nothing pops. */
const GROW = 70

type Point = { x: number; y: number }

export type CellTrail = {
  /** Re-measure after the host has changed size. */
  resize: () => void
  /** A pointer went down at `point` (host coordinates). */
  begin: (point: Point) => void
  /** It moved; returns true once it has become a stroke (and so drawn). */
  move: (point: Point) => boolean
  /** It lifted. */
  end: () => void
  destroy: () => void
}

export function cellTrail(canvas: HTMLCanvasElement, host: HTMLElement): CellTrail | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  let width = 0
  let height = 0
  let ratio = 1
  let cell = 0
  let ox = 0
  let ink = ''
  let frame = 0
  // Where the pointer went down, and the last point drawn once it is a stroke.
  let down: Point | null = null
  let last: Point | null = null
  // Each lit cell, keyed "column,row", and when it was drawn.
  const alive = new Map<string, number>()

  const resize = () => {
    const box = host.getBoundingClientRect()
    const root = getComputedStyle(document.documentElement)
    const grid = parseFloat(root.getPropertyValue('--spacing-grid')) * parseFloat(root.fontSize)
    width = box.width
    height = box.height
    cell = grid / 3
    ox = (width / 2) % cell
    ratio = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(width * ratio)
    canvas.height = Math.round(height * ratio)
  }

  const light = (col: number, row: number, now: number) => {
    const key = `${col},${row}`
    // A cell still growing in keeps its start, so a slow stroke does not restart it.
    const was = alive.get(key)
    const born = was !== undefined && now - was < GROW ? was : now
    // Re-inserted, so the map stays in age order for the cap.
    alive.delete(key)
    alive.set(key, born)
  }
  const stamp = (x: number, y: number, now: number) => {
    const col = Math.floor((x - ox) / cell - (BRUSH - 1) / 2)
    const row = Math.floor(y / cell - (BRUSH - 1) / 2)
    for (let dy = 0; dy < BRUSH; dy++) {
      for (let dx = 0; dx < BRUSH; dx++) light(col + dx, row + dy, now)
    }
    while (alive.size > CAP) alive.delete(alive.keys().next().value!)
  }
  // Pointer events arrive as sparse points; fill the path between them.
  const stroke = (from: Point, to: Point, now: number) => {
    const steps = Math.max(1, Math.ceil(Math.hypot(to.x - from.x, to.y - from.y) / (cell / 2)))
    for (let i = 1; i <= steps; i++) {
      stamp(from.x + ((to.x - from.x) * i) / steps, from.y + ((to.y - from.y) * i) / steps, now)
    }
  }

  const draw = (now: number) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = ink
    const full = (cell - GAP) * ratio
    for (const [key, born] of alive) {
      const age = now - born
      const t = age / LIFE
      if (t >= 1) {
        alive.delete(key)
        continue
      }
      const [col, row] = key.split(',').map(Number) as [number, number]
      // In: grows from the square's centre on an ease-out. Out: holds, then
      // eases away, most of the fade in the second half.
      const grow = 1 - (1 - Math.min(1, age / GROW)) ** 3
      ctx.globalAlpha = grow * (1 - t * t)
      const side = full * (0.35 + 0.65 * grow)
      const cx = (ox + col * cell + cell / 2) * ratio
      const cy = (row * cell + cell / 2) * ratio
      // Whole device pixels, so every square edge is crisp.
      const px = Math.max(1, Math.round(side))
      ctx.fillRect(Math.round(cx - px / 2), Math.round(cy - px / 2), px, px)
    }
    ctx.globalAlpha = 1
  }
  const tick = (now: number) => {
    draw(now)
    frame = alive.size ? requestAnimationFrame(tick) : 0
  }
  const run = () => {
    if (!frame) frame = requestAnimationFrame(tick)
  }

  resize()
  return {
    resize,
    begin: (point) => {
      down = point
      last = null
    },
    move: (point) => {
      if (!down) return false
      const now = performance.now()
      if (!last) {
        // Not a stroke until the pointer has travelled half a cell; then the
        // trail starts where it went down.
        if (Math.hypot(point.x - down.x, point.y - down.y) <= cell / 2) return false
        ink = getComputedStyle(host).color
        stamp(down.x, down.y, now)
        last = down
      }
      stroke(last, point, now)
      last = point
      run()
      return true
    },
    end: () => {
      down = null
      last = null
    },
    destroy: () => {
      if (frame) cancelAnimationFrame(frame)
      frame = 0
      alive.clear()
    },
  }
}
