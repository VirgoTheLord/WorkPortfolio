'use client'

import { useEffect, useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import './hover-deck.css'

type Card = {
  /** The card's name, shown beneath it when it is pointed at, and its accessible name. */
  title: string
  /** Where the card leads. Without it the card is a button that calls onSelect. */
  href?: string
  /** The card's face: a screenshot, an image, anything that fills a 3:2 card. */
  art: ReactNode
}

type Layout = 'fold' | 'hand'
type Orientation = 'horizontal' | 'vertical'

type HoverDeckProps = {
  items: readonly Card[]
  /** The list's accessible name. */
  label: string
  layout?: Layout
  /** How far the resting fan turns, in degrees. */
  fan?: number
  /** How far the outer cards fall back in the fold, in px at the default size. */
  depth?: number
  /** How far the neighbours step aside from the pointed-at card, in px at the default size. */
  spread?: number
  /** How far each card in the fold leans, in degrees. */
  tilt?: number
  feel?: 'soft' | 'snappy'
  /** Called when the pointed-at card changes; -1 when the deck is back at rest. */
  onActiveChange?: (index: number) => void
  /** Called when a card without an href is chosen. */
  onSelect?: (index: number) => void
  /** Portfolio: `vertical` stands the deck up, its fan opening from the left. */
  orientation?: Orientation
  /** Portfolio: the cards are decoration (spans, the list hidden from assistive tech); they still answer the pointer. */
  decorative?: boolean
  /** Portfolio: the cards wait in a pile and are dealt into the fan, one by one, once the deck is on screen. */
  deal?: boolean
  className?: string
}

type Place = { x: number; y: number; z: number; ry: number; rz: number; s: number }
type Settings = { fan: number; depth: number; spread: number; tilt: number }

/* The settings are given in px at the default card width, 13rem. */
const BASE = 208
/* In the hand the cards turn about a point 2.3 card heights below their middle. */
const PIVOT = 2.3 / 1.5
/* The fold's perspective, in card widths (hover-deck.css). */
const PERSPECTIVE = 5.3
const KEYS = ['x', 'y', 'z', 'ry', 'rz', 's'] as const

/*
 * Where each card goes, in card widths, with `k` the pointed-at card (-1 at
 * rest). The fold spreads the cards in a shallow arc and folds them into
 * stacks either side of the chosen one; the hand fans them from a pivot below
 * and lifts the chosen one out of it, its neighbours leaning away. In the hand
 * no card ever changes layer: the lifted card stays behind the ones to its
 * right, as a card drawn up out of a real hand does, so nothing pops through
 * another on the way back.
 */
function place(layout: Layout, k: number, n: number, S: Settings): Place[] {
  const out: Place[] = []
  for (let i = 0; i < n; i++) {
    const t = i - (n - 1) / 2
    const d = k < 0 ? 0 : i - k
    if (layout === 'fold') {
      const ax = (k - (n - 1) / 2) * 0.58
      if (k < 0) out.push({ x: t * 0.58, y: 0, z: (-Math.abs(t) * S.depth) / BASE, ry: -t * S.fan, rz: t * S.tilt, s: 1 })
      else if (d === 0) out.push({ x: ax, y: 0, z: 60 / BASE, ry: 0, rz: 0, s: 1.06 })
      else out.push({ x: ax + Math.sign(d) * (0.6 + ((Math.abs(d) - 1) * S.spread) / BASE), y: 0, z: -(30 + Math.abs(d) * 26) / BASE, ry: -Math.sign(d) * 38, rz: 0, s: 0.94 })
      continue
    }
    const step = 4 + S.fan * 0.3
    let a = t * step
    let x = t * 0.16
    let lift = 0
    if (k >= 0 && d === 0) {
      a *= 0.35
      lift = -0.24
    } else if (k >= 0) {
      a += Math.sign(d) * (4 + S.spread * 0.4)
      x += (Math.sign(d) * S.spread * 0.8) / BASE
    }
    const r = (a * Math.PI) / 180
    out.push({ x: x + PIVOT * Math.sin(r), y: lift + PIVOT * (1 - Math.cos(r)), z: 0, ry: 0, rz: a, s: d === 0 && k >= 0 ? 1.04 : 1 })
  }
  return out
}

/* The room every arrangement needs, in card widths, so the deck can size its
   cards to fit its container and never spill out of it. */
function bounds(layout: Layout, n: number, S: Settings) {
  let w = 0
  let top = 0
  let bottom = 0
  for (let k = -1; k < n; k++) {
    for (const p of place(layout, k, n, S)) {
      // a card brought nearer looks larger under the fold's perspective (5.3 cards)
      const f = layout === 'fold' ? PERSPECTIVE / (PERSPECTIVE - p.z) : 1
      const r = (Math.abs(p.rz) * Math.PI) / 180
      const hw = (0.5 * Math.cos(r) + (1 / 3) * Math.sin(r)) * p.s * f
      const hh = ((1 / 3) * Math.cos(r) + 0.5 * Math.sin(r)) * p.s * f
      w = Math.max(w, Math.abs(p.x) * f + hw)
      top = Math.min(top, p.y - hh)
      bottom = Math.max(bottom, p.y + hh)
    }
  }
  return { span: w * 2 + 0.1, top: -top + 0.04, height: bottom - top + 0.08 }
}

/* Portfolio: where an undealt card waits, at the hand's pivot, small and square. */
const PILE: Place = { x: 0, y: PIVOT * 0.55, z: 0, ry: 0, rz: -8, s: 0.55 }
/* Portfolio: the time between two cards being dealt, in ms. */
const DEAL_MS = 120

/* Portfolio: standing the deck up turns its plane a quarter turn clockwise, so
   the pivot below the hand moves to its left: (x, y) on screen is (-y, x). */
const transform = (p: Place, unit: (v: number) => string, vertical = false) =>
  vertical
    ? `translate3d(${unit(-p.y)}, ${unit(p.x)}, ${unit(p.z)}) rotateY(${p.ry}deg) rotateZ(${p.rz + 90}deg) scale(${p.s})`
    : `translate3d(${unit(p.x)}, ${unit(p.y)}, ${unit(p.z)}) rotateY(${p.ry}deg) rotateZ(${p.rz}deg) scale(${p.s})`

/*
 * A deck of cards, for a row of sites, projects or people. At rest they fan
 * out; point at one and it comes forward while the rest make room, and its
 * name rises beneath it out of a blur. Two layouts: the fold, where the cards
 * fold into tight stacks either side of the chosen one, and the hand, where
 * they are held in a fan and the chosen one is drawn up out of it.
 *
 * Every card rides its own spring, so moving across the deck ripples through
 * it; the springs run only while something moves. The chosen card stays where
 * it rested, so the deck never chases the pointer. The cards size themselves
 * to the container, rendered in their resting fan before any script runs.
 *
 * A list of links (or buttons). Tab or ← → move through them and open each in
 * turn; on a touch screen the first tap opens a card and the second follows
 * it. Reduced motion changes places without the movement.
 */
export function HoverDeck({
  items,
  label,
  layout = 'fold',
  fan = 18,
  depth = 70,
  spread = 16,
  tilt = 1.5,
  feel = 'soft',
  onActiveChange,
  onSelect,
  orientation = 'horizontal',
  decorative = false,
  deal = false,
  className = '',
}: HoverDeckProps) {
  const vertical = orientation === 'vertical'
  const listRef = useRef<HTMLUListElement>(null)
  const captionRef = useRef<HTMLParagraphElement>(null)
  // Kept between layouts and settings, so a change animates from where the cards are.
  const state = useRef<(Place & { v: Place })[] | null>(null)
  const active = useRef(-1)
  const callbacks = useRef({ onActiveChange, onSelect, items })
  const n = items.length
  const S: Settings = { fan, depth, spread, tilt }
  const box = bounds(layout, n, S)
  const rest = place(layout, -1, n, S)

  useEffect(() => {
    callbacks.current = { onActiveChange, onSelect, items }
  }, [onActiveChange, onSelect, items])

  // Before paint: a new layout re-renders the resting fan inline, and the cards
  // must be put back where they are before the browser can show that.
  useLayoutEffect(() => {
    const list = listRef.current
    const caption = captionRef.current
    if (!list || !caption) return
    const settings: Settings = { fan, depth, spread, tilt }
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const cards = [...list.querySelectorAll<HTMLElement>(':scope > .wui-deck-item')]
    const shades = cards.map((c) => c.querySelector<HTMLElement>('.wui-deck-shade'))
    const [stiff, damp] = feel === 'snappy' ? [320, 30] : [170, 22]
    let cw = cards[0]?.offsetWidth || BASE
    let raf = 0
    let last = 0
    let owed = 0
    let label: HTMLElement | null = null
    let touch = false
    // Portfolio: how many cards have been dealt (all of them unless dealing).
    let dealt = n
    let dealTimer = 0
    let dealWatch: IntersectionObserver | undefined

    if (!state.current || state.current.length !== n) {
      state.current = place(layout, -1, n, settings).map((p) => ({ ...p, v: { x: 0, y: 0, z: 0, ry: 0, rz: 0, s: 0 } }))
    }
    const st = state.current
    const targets = () => {
      const all = place(layout, active.current, n, settings)
      return dealt >= n ? all : all.map((p, i) => (i < dealt ? p : PILE))
    }
    const restX = place(layout, -1, n, settings).map((p) => p.x)

    // The name sits under the chosen card in the fold, and in the middle under the hand.
    const labelX = (k: number) => (layout === 'fold' ? st[k]!.x * cw : 0)

    const paint = () => {
      const px = (v: number) => `${v * cw}px`
      cards.forEach((card, i) => {
        const p = st[i]!
        card.style.transform = transform(p, px, vertical)
        // Nearer cards on top; the order changes only as two pass the same depth.
        card.style.zIndex = String(Math.round(p.z * 1000) + 1000)
        const shade = shades[i]
        if (shade) {
          shade.style.opacity = String(Math.min(1, Math.abs(p.ry) / 38))
          shade.style.transform = `scaleX(${p.ry > 0 ? -1 : 1})`
        }
      })
      if (label && active.current >= 0) label.style.transform = `translateX(calc(${labelX(active.current)}px - 50%))`
    }

    const frame = (now: number) => {
      raf = 0
      const tg = targets()
      if (motion.matches) {
        st.forEach((p, i) => Object.assign(p, tg[i]))
        return paint()
      }
      // Whole 120 Hz steps, so the springs run at the same speed on any screen.
      owed += Math.min(1 / 15, last ? (now - last) / 1000 : 1 / 60)
      last = now
      const steps = Math.floor(owed * 120)
      owed -= steps / 120
      let moving = false
      st.forEach((p, i) => {
        const t = tg[i]!
        for (const key of KEYS) {
          for (let s = 0; s < steps; s++) {
            p.v[key] += ((-stiff * (p[key] - t[key]) - damp * p.v[key]) / 120)
            p[key] += p.v[key] / 120
          }
          if (Math.abs(p.v[key]) > 0.002 || Math.abs(p[key] - t[key]) > 0.0005) moving = true
          else {
            p[key] = t[key]
            p.v[key] = 0
          }
        }
      })
      paint()
      if (moving) raf = requestAnimationFrame(frame)
      else last = 0
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }

    // The name: the old one blurs away, the new one comes up out of a blur.
    const setActive = (k: number) => {
      if (k === active.current) return
      active.current = k
      callbacks.current.onActiveChange?.(k)
      kick()
      if (label) {
        const old = label
        label = null
        if (motion.matches) old.remove()
        else old.animate([{ opacity: 1, filter: 'blur(0)' }, { opacity: 0, filter: 'blur(6px)' }], { duration: 220, fill: 'forwards' }).onfinish = () => old.remove()
      }
      if (k < 0) return
      const el = document.createElement('span')
      el.textContent = callbacks.current.items[k]?.title ?? ''
      el.style.transform = `translateX(calc(${labelX(k)}px - 50%))`
      caption.append(el)
      label = el
      if (!motion.matches) el.animate([{ opacity: 0, filter: 'blur(6px)', translate: '0 4px' }, { opacity: 1, filter: 'blur(0)', translate: '0 0' }], { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)' })
    }

    const mouse = (e: PointerEvent) => e.pointerType === 'mouse' || e.pointerType === 'pen'
    // The fold: the card under the pointer, checked on every move as well as on
    // entering it, so a card that slid under a resting pointer is still found;
    // over a gap the last one holds.
    const over = (e: PointerEvent) => {
      if (layout !== 'fold' || !mouse(e)) return
      const card = (e.target as Element).closest('.wui-deck-item')
      if (card) setActive(cards.indexOf(card as HTMLElement))
    }
    // The hand: a zone across its resting width, as its cards overlap so much
    // that only slivers of some show; the moving cards never steer it.
    const move = (e: PointerEvent) => {
      if (layout === 'fold') return over(e)
      if (!mouse(e)) return
      const r = list.getBoundingClientRect()
      // Portfolio: standing up, the hand runs down the screen.
      const x = vertical ? (e.clientY - (r.top + r.height / 2)) / cw : (e.clientX - (r.left + r.width / 2)) / cw
      const lo = Math.min(...restX) - 0.5
      const hi = Math.max(...restX) + 0.5
      if (x < lo || x > hi) return setActive(-1)
      setActive(Math.min(n - 1, Math.floor(((x - lo) / (hi - lo)) * n)))
    }
    const leave = (e: PointerEvent) => mouse(e) && setActive(-1)
    const down = (e: PointerEvent) => {
      touch = e.pointerType === 'touch'
    }
    // On a touch screen the first tap opens a card, the second follows it.
    const click = (e: MouseEvent) => {
      const i = cards.indexOf((e.target as Element).closest('.wui-deck-item') as HTMLElement)
      if (i < 0) return
      if (touch && i !== active.current) {
        e.preventDefault()
        return setActive(i)
      }
      if (!callbacks.current.items[i]?.href) callbacks.current.onSelect?.(i)
    }
    const outside = (e: PointerEvent) => {
      if (e.pointerType === 'touch' && !list.contains(e.target as Node)) setActive(-1)
    }
    const focusin = (e: FocusEvent) => setActive(cards.indexOf((e.target as Element).closest('.wui-deck-item') as HTMLElement))
    const focusout = (e: FocusEvent) => {
      if (!list.contains(e.relatedTarget as Node)) setActive(-1)
    }
    const key = (e: KeyboardEvent) => {
      const at = active.current
      const next = { ArrowRight: at + 1, ArrowLeft: at - 1, Home: 0, End: n - 1 }[e.key]
      if (next === undefined || at < 0) return
      e.preventDefault()
      cards[Math.max(0, Math.min(n - 1, next))]?.querySelector<HTMLElement>('.wui-deck-card')?.focus()
    }

    // The cards size to the container; their places are in card widths.
    const resize = new ResizeObserver(() => {
      cw = cards[0]?.offsetWidth || cw
      paint()
    })
    resize.observe(list)
    list.addEventListener('pointerover', over)
    list.addEventListener('pointermove', move)
    list.addEventListener('pointerleave', leave)
    list.addEventListener('pointerdown', down)
    list.addEventListener('click', click)
    list.addEventListener('focusin', focusin)
    list.addEventListener('focusout', focusout)
    list.addEventListener('keydown', key)
    document.addEventListener('pointerdown', outside)
    // Portfolio: dealing. The cards (hidden until now, hover-deck.css) gather in
    // the pile, and once the deck is on screen they are dealt into the fan one
    // after another, each on its own spring. Not for reduced motion, and only
    // once: a deck already dealt stays dealt.
    const root = list.parentElement
    if (deal && root && !root.dataset.dealt && !motion.matches && 'IntersectionObserver' in window) {
      dealt = 0
      st.forEach((p) => Object.assign(p, PILE, { v: { x: 0, y: 0, z: 0, ry: 0, rz: 0, s: 0 } }))
      root.dataset.dealt = 'pile'
      dealWatch = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return
          dealWatch?.disconnect()
          const next = () => {
            dealt += 1
            kick()
            if (dealt < n) dealTimer = window.setTimeout(next, DEAL_MS)
            else root.dataset.dealt = 'done'
          }
          dealTimer = window.setTimeout(next, DEAL_MS * 2)
        },
        { rootMargin: '0px 0px -20% 0px' },
      )
      dealWatch.observe(list)
    } else if (root) root.dataset.dealt = 'done'

    // A new layout or setting springs from wherever the cards are now.
    paint()
    kick()
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(dealTimer)
      dealWatch?.disconnect()
      // An unfinished deal is dealt out, so a remount finds the fan.
      if (root && root.dataset.dealt === 'pile') delete root.dataset.dealt
      resize.disconnect()
      list.removeEventListener('pointerover', over)
      list.removeEventListener('pointermove', move)
      list.removeEventListener('pointerleave', leave)
      list.removeEventListener('pointerdown', down)
      list.removeEventListener('click', click)
      list.removeEventListener('focusin', focusin)
      list.removeEventListener('focusout', focusout)
      list.removeEventListener('keydown', key)
      document.removeEventListener('pointerdown', outside)
      label?.remove()
      if (active.current >= 0) callbacks.current.onActiveChange?.(-1)
      active.current = -1
    }
  }, [layout, n, fan, depth, spread, tilt, feel, vertical, deal])

  const card = (v: number) => `calc(var(--deck-card) * ${v.toFixed(4)})`
  // Portfolio: standing up, the deck's width is the fan's depth and its height
  // the fan's span; the cards' origin sits at the fan's middle, its pivot side
  // to the left (--deck-left, in card widths from the left edge).
  const frame = vertical
    ? { '--deck-span': box.height.toFixed(3), '--deck-height': box.span.toFixed(3), '--deck-top': (box.span / 2).toFixed(3), '--deck-left': (box.height - box.top).toFixed(3) }
    : { '--deck-span': box.span.toFixed(3), '--deck-top': box.top.toFixed(3), '--deck-height': box.height.toFixed(3) }
  return (
    <div
      className={`wui-deck ${className}`}
      data-layout={layout}
      data-orientation={orientation}
      data-deal={deal || undefined}
      style={frame as CSSProperties}
    >
      <ul ref={listRef} aria-label={decorative ? undefined : label} aria-hidden={decorative || undefined} className="wui-deck-cards">
        {items.map((item, i) => (
          // Rendered in the resting fan, so the deck is right before hydration.
          <li key={item.title} className="wui-deck-item" style={{ transform: transform(rest[i]!, card, vertical), zIndex: Math.round(rest[i]!.z * 1000) + 1000 }}>
            {decorative ? (
              <span className="wui-deck-card">
                {item.art}
                <span aria-hidden="true" className="wui-deck-shade" />
              </span>
            ) : item.href ? (
              <a href={item.href} className="wui-deck-card" aria-label={item.title}>
                {item.art}
                <span aria-hidden="true" className="wui-deck-shade" />
              </a>
            ) : (
              <button type="button" className="wui-deck-card" aria-label={item.title}>
                {item.art}
                <span aria-hidden="true" className="wui-deck-shade" />
              </button>
            )}
          </li>
        ))}
      </ul>
      <p ref={captionRef} aria-hidden="true" className="wui-deck-caption" />
    </div>
  )
}
