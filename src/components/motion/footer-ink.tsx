'use client'

import { useEffect, useRef } from 'react'
import './footer-ink.css'

/* The reveal is a field of small tiles, as previewed and chosen. Over the bottom of
   the footer a disc of them opens around the pointer, in a ripple from the pointer
   outward, and through it the footer shows its inverse (the brand field's orange
   letters on its black, the hairline and the credits too). It is an SVG mask of
   small squares over a copy of the footer's bottom: no filter, and a frame touches
   only the tiles near the pointer and those still closing. A tile belongs to the disc
   or it does not; the disc has a fixed radius and follows the pointer exactly. */
const RADIUS = 0.85 // of the name's height
// How fast a tile answers (a rate per second): faster the nearer the pointer, so the
// opening is a ripple outward; closing is a little slower the farther out.
const POP = { near: 26, far: 12 }
const FADE = { near: 16, far: 22 }

const NS = 'http://www.w3.org/2000/svg'
const el = <K extends keyof SVGElementTagNameMap>(
  name: K,
  attrs: Record<string, string | number> = {},
) => {
  const node = document.createElementNS(NS, name)
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)))
  return node
}
const soft = (t: number) => t * t * (3 - 2 * t)

type Tile = { rect: SVGRectElement; cx: number; cy: number; v: number }

/*
 * The whole bottom of the footer, answering the pointer. An SVG laid over it, from
 * the hairline under the columns to the page's end and edge to edge, holds an
 * inverse copy of the name, the hairline under it and the credits, shown only
 * through the mask of tiles that opens under the pointer.
 *
 * The copy lines up with the real thing by measuring it, not by being laid out
 * twice: each letter's left edge and baseline are read from the DOM (the baseline
 * with a zero-size probe that is removed at once), the hairline's and the credits'
 * boxes likewise, and each is set where it is, in the same face and size. The real
 * footer is untouched: its entrance (motion/footer-scene.tsx) plays as it did, and
 * this layer does nothing until the last letter and the last credit have stopped
 * rising. It is decorative (aria-hidden); the name keeps its one label.
 *
 * While tiles are open the page is told (html[data-ink-reveal]): the cursor's own
 * square gives way to them (CSS) and the comet trail is not drawn
 * (motion/pointer-fx.tsx), so they never compete. It never takes a pointer event, a
 * wheel or a touch; it is held off while the intro plays and while the full-screen
 * menu is open; only fine pointers, only where motion is allowed. The frame loop
 * runs only while a tile is still opening or closing; a still pointer, or none,
 * costs nothing.
 */
export function FooterInk() {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    const footer = host?.closest('footer') ?? null
    const mark = footer?.querySelector<HTMLElement>('[data-footer-mark]')
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const root = document.documentElement
    if (!host || !footer || !mark) return

    let dispose: (() => void) | undefined
    let cancelled = false

    const build = () => {
      dispose?.()
      dispose = undefined
      if (cancelled || !fine.matches || reduced.matches) return

      const letters = Array.from(mark.querySelectorAll<HTMLElement>('[data-footer-letter]'))
      const masks = letters.map((letter) => letter.parentElement as HTMLElement)
      const credits = Array.from(footer.querySelectorAll<HTMLElement>('[data-footer-credit]'))
      if (!letters.length) return

      // ---- Measure the real footer -----------------------------------------
      const style = getComputedStyle(mark)
      const fontSize = parseFloat(style.fontSize)
      const footerBox = footer.getBoundingClientRect()
      const markBox = mark.getBoundingClientRect()
      const left = footerBox.left
      const top = footer.querySelector('.footer-top')?.getBoundingClientRect().bottom ?? markBox.top
      const width = footerBox.width
      const height = footerBox.bottom - top
      host.style.left = '0px'
      host.style.top = `${top - footerBox.top}px`
      host.style.width = `${width}px`
      host.style.height = `${height}px`

      // The tile size and the disc are sized from the name they mostly play over.
      const cell = Math.max(18, Math.round(markBox.height / 8))
      const radius = markBox.height * RADIUS
      const id = `footer-ink-${Math.random().toString(36).slice(2, 7)}`

      const svg = el('svg', { width, height, viewBox: `0 0 ${width} ${height}` })
      const defs = el('defs')
      const mask = el('mask', {
        id: `${id}-m`,
        maskUnits: 'userSpaceOnUse',
        x: 0,
        y: 0,
        width,
        height,
      })
      // The grid of tiles, each a unit square centred on its own point, scaled from
      // nothing to a full tile (a hair over, so neighbours never leave a seam).
      const cols = Math.ceil(width / cell)
      const rows = Math.ceil(height / cell)
      const tiles: Tile[] = []
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          const rect = el('rect', {
            x: -cell / 2 - 0.4,
            y: -cell / 2 - 0.4,
            width: cell + 0.8,
            height: cell + 0.8,
            fill: 'white',
          })
          const cx = c * cell + cell / 2
          const cy = r * cell + cell / 2
          rect.setAttribute('transform', `translate(${cx} ${cy}) scale(0)`)
          mask.append(rect)
          tiles.push({ rect, cx, cy, v: 0 })
        }
      }
      defs.append(mask)

      // The inverse copy: the field's own ink for the tiles, its own orange for the
      // letters, the hairline and the credits (the colours are the footer's tokens,
      // so a theme change follows).
      const group = el('g', { mask: `url(#${id}-m)` })
      group.append(el('rect', { width, height, class: 'footer-ink-fill' }))
      const text = el('g', { class: 'footer-ink-text', 'font-size': fontSize })
      text.style.fontFamily = style.fontFamily
      text.style.fontWeight = style.fontWeight
      text.style.fontVariationSettings = style.fontVariationSettings
      // The baseline of an element's text: a zero-size inline-block sits on it, read
      // relative to the element's own box (it may be mid-rise, translated).
      const baselineOf = (inner: HTMLElement) => {
        const probe = document.createElement('span')
        probe.style.cssText = 'display:inline-block;width:0;height:0'
        inner.append(probe)
        const offset = probe.getBoundingClientRect().bottom - inner.getBoundingClientRect().top
        probe.remove()
        return offset
      }
      masks.forEach((maskEl, i) => {
        const letter = letters[i]!
        const box = maskEl.getBoundingClientRect()
        const maskStyle = getComputedStyle(maskEl)
        const glyph = el('text', {
          x: box.left + parseFloat(maskStyle.paddingLeft) - left,
          y: box.top + parseFloat(maskStyle.paddingTop) + baselineOf(letter) - top,
        })
        glyph.textContent = letter.textContent
        text.append(glyph)
      })
      const rule = footer.querySelector<HTMLElement>('[data-footer-rule]')
      if (rule) {
        const box = rule.getBoundingClientRect()
        text.append(
          el('rect', { x: box.left - left, y: box.top - top, width: rule.offsetWidth, height: 1 }),
        )
      }
      for (const credit of credits) {
        const box = (credit.parentElement as HTMLElement).getBoundingClientRect()
        const from = getComputedStyle(credit)
        const node = el('text', { x: box.left - left, y: box.top + baselineOf(credit) - top })
        node.textContent = (credit.textContent ?? '').trim()
        Object.assign(node.style, {
          fontFamily: from.fontFamily,
          fontSize: from.fontSize,
          fontWeight: from.fontWeight,
          fontVariationSettings: from.fontVariationSettings,
          letterSpacing: from.letterSpacing,
          fontVariantNumeric: from.fontVariantNumeric,
        })
        text.append(node)
      }
      group.append(text)
      svg.append(defs, group)
      host.replaceChildren(svg)

      // ---- Motion ---------------------------------------------------------------
      let pointer: { x: number; y: number } | null = null
      let inside = false
      let px = 0
      let py = 0
      let raf = 0
      let last = 0
      const live = new Set<number>()

      // Ready once the last letter and the last credit have stopped rising.
      const settled = () =>
        [letters[letters.length - 1]!, credits[credits.length - 1]].every(
          (node) => !node || Math.abs(new DOMMatrix(getComputedStyle(node).transform).m42) < 0.5,
        )
      // Held off while something else owns the screen. This layer reads, and
      // writes nothing outside its own SVG but the one attribute on <html>.
      const held = () =>
        root.classList.contains('is-intro') ||
        document.querySelector('.menu')?.getAttribute('data-open') === 'true'

      const paint = (index: number, tile: Tile) => {
        const s = tile.v < 0.004 ? 0 : soft(Math.min(1, tile.v))
        tile.rect.setAttribute(
          'transform',
          `translate(${tile.cx} ${tile.cy}) scale(${s.toFixed(3)})`,
        )
        if (s === 0) live.delete(index)
        else live.add(index)
      }

      const frame = (now: number) => {
        raf = 0
        // The frame's timestamp can precede the clock it was seeded from: never negative.
        const dt = Math.min(Math.max((now - last) / 1000, 0), 0.05)
        last = now
        if (pointer) {
          const box = host.getBoundingClientRect()
          px = pointer.x - box.left
          py = pointer.y - box.top
          const nowInside = px >= 0 && px <= width && py >= 0 && py <= height
          inside = nowInside && settled() && !held()
        }

        // Tiles near the pointer are asked; the rest that are still open are let go.
        const near = new Set<number>()
        if (inside) {
          const reach = radius + cell
          const c0 = Math.max(0, Math.floor((px - reach) / cell))
          const c1 = Math.min(cols - 1, Math.floor((px + reach) / cell))
          const r0 = Math.max(0, Math.floor((py - reach) / cell))
          const r1 = Math.min(rows - 1, Math.floor((py + reach) / cell))
          for (let r = r0; r <= r1; r += 1) for (let c = c0; c <= c1; c += 1) near.add(r * cols + c)
        }
        let more = false
        const visit = (index: number) => {
          const tile = tiles[index]!
          const d = Math.hypot(tile.cx - px, tile.cy - py)
          const want = inside && d < radius ? 1 : 0
          // The nearer a tile is, the sooner it answers: a ripple out, a ripple in.
          const rate = want
            ? POP.near - (POP.near - POP.far) * (d / radius)
            : FADE.near + (FADE.far - FADE.near) * clamp01(d / (radius + 1))
          const before = tile.v
          tile.v += (want - tile.v) * (1 - Math.exp(-dt * rate))
          if (Math.abs(tile.v - before) > 0.0015 || tile.v < 0.004) paint(index, tile)
          if (Math.abs(want - tile.v) > 0.004) more = true
        }
        near.forEach(visit)
        live.forEach((index) => {
          if (!near.has(index)) visit(index)
        })

        // The page is told while any tile is open.
        if (live.size > 0 || inside) root.dataset.inkReveal = 'true'
        else delete root.dataset.inkReveal

        // The loop sleeps once every tile has settled; a pointer move wakes it.
        if (more) raf = requestAnimationFrame(frame)
      }
      const wake = () => {
        if (raf) return
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }

      // Any pointer movement over the bottom wakes the loop; one listener, no
      // per-letter ones. Leaving the page or the window closes the reveal.
      const onMove = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse') return
        pointer = { x: event.clientX, y: event.clientY }
        const box = host.getBoundingClientRect()
        const over =
          pointer.x >= box.left &&
          pointer.x <= box.right &&
          pointer.y >= box.top &&
          pointer.y <= box.bottom
        if (over || live.size > 0) wake()
      }
      const onLeave = () => {
        inside = false
        pointer = null
        wake()
      }
      // A scroll moves the footer under a still pointer.
      const onScroll = () => {
        if (pointer) wake()
      }
      document.addEventListener('pointermove', onMove, { passive: true })
      root.addEventListener('pointerleave', onLeave)
      window.addEventListener('blur', onLeave)
      window.addEventListener('scroll', onScroll, { passive: true })

      dispose = () => {
        document.removeEventListener('pointermove', onMove)
        root.removeEventListener('pointerleave', onLeave)
        window.removeEventListener('blur', onLeave)
        window.removeEventListener('scroll', onScroll)
        if (raf) cancelAnimationFrame(raf)
        delete root.dataset.inkReveal
        host.replaceChildren()
      }
    }

    // The footer's size is set from the frame's width and the faces load late: build
    // when the fonts are in and again whenever the footer is resized.
    let timer = 0
    const schedule = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(build, 120)
    }
    void document.fonts.ready.then(() => {
      if (!cancelled) build()
    })
    const observer = new ResizeObserver(schedule)
    observer.observe(footer)
    fine.addEventListener('change', schedule)
    reduced.addEventListener('change', schedule)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      observer.disconnect()
      fine.removeEventListener('change', schedule)
      reduced.removeEventListener('change', schedule)
      dispose?.()
    }
  }, [])

  return <div ref={hostRef} aria-hidden="true" className="footer-ink" />
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
