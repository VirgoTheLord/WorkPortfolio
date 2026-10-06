'use client'

import { useEffect, useRef, useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import { loadGsap } from '@/lib/motion/gsap'
import { scrambleFrame } from '@/lib/motion/scramble'
import { menu } from '@/content/site'
import './site-menu.css'

type Gsap = Awaited<ReturnType<typeof loadGsap>>
type Timeline = ReturnType<Gsap['timeline']>

/* Writes one scramble frame: the resolved text as it is, the noise running ahead
   of it in the accent colour. */
function writeScramble(node: HTMLElement, text: string, progress: number) {
  const frame = scrambleFrame(text, progress)
  const resolved = Math.min(Math.floor(progress * text.length), frame.length)
  const noise = document.createElement('span')
  noise.style.color = 'var(--color-accent)'
  noise.textContent = frame.slice(resolved)
  node.replaceChildren(frame.slice(0, resolved), noise)
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* The page behind the header: made inert while the menu is open, so keyboard and
   assistive tech stay inside it. */
const PAGE = ':scope > main, :scope > footer, :scope > a'

/*
 * The navbar island: the bar, the page scrim and the expanded panel.
 *
 * Two attributes on the root carry all state, and the CSS (site-menu.css) gives
 * each its complete look, so reduced motion and a failed GSAP load only flip them:
 *   data-open   the logical state. Set the moment the user asks. The bar's own
 *               pieces (scrim, surface, insets, rolls, the shifted row) are CSS
 *               transitions off this attribute; it also drives the scroll lock
 *               and the page's inertness.
 *   data-scrolled  the page has left its top (50px, as in the reference): the
 *               closed bar becomes a card with its contents inset.
 *   data-shown  the panel's visible state. On while open and while closing;
 *               off only once the closing choreography has finished.
 *
 * GSAP owns the panel and what is in it. It tweens from the current values to
 * the other state's, then clears its inline styles so the CSS look takes over;
 * nothing is a fixed `from`, so any interruption continues from where the
 * elements are.
 *
 * Open (seconds from the click; the reference's own timeline):
 *   0      the bar's CSS transitions begin together (0.5s)
 *   0      the panel unfolds from the bar (1s, expo.inOut)
 *   0.5    the destinations rise from their masks (1.4s, expo.out, 0.1s apart)
 *   0.95   the details rise, a line at a time (0.5s, power2.out, 0.04s apart)
 *   1.155  status lines and captions scramble into place (0.5s), dots fade in
 *          (0.5s, power2.out), the cards fade in (1s, power1.out)
 *   1.405  the marker slides in and the current row makes room for it (0.6s)
 * Close is its own sequence, not a reverse: the panel is wiped away upward at
 * once (0.6s, expo.inOut) while its content stays where it was; the scrambled
 * text and the marker go within a frame; the bar's transitions and the shifted
 * row start back at the same moment.
 */
export function SiteMenu({
  brand,
  action,
  children,
}: {
  brand: ReactNode
  action: ReactNode
  children: ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const gsapRef = useRef<Gsap | null>(null)
  const timelineRef = useRef<Timeline | null>(null)
  const openRef = useRef(false)
  const activeRef = useRef<HTMLElement | null>(null)
  const hoverRef = useRef<HTMLElement | null>(null)
  const focusIdRef = useRef<string | null>(null)
  // The marker rolls a quarter turn each time it moves after its first move.
  const markerRef = useRef({ moves: 0, turns: 0 })

  const root = () => rootRef.current
  const items = () => Array.from(root()?.querySelectorAll<HTMLElement>('[data-menu-item]') ?? [])
  const isShown = () => root()?.dataset.shown === 'true'

  function setShown(shown: boolean) {
    const el = root()
    if (!el) return
    el.dataset.shown = String(shown)
    if (panelRef.current) panelRef.current.inert = !shown
  }

  function setPageInert(inert: boolean) {
    document.body.querySelectorAll<HTMLElement>(PAGE).forEach((el) => {
      el.inert = inert
    })
  }

  /* The elements the timeline moves, grouped by what they do. */
  function groups(gsap: Gsap) {
    const q = (selector: string) => gsap.utils.toArray<HTMLElement>(selector, root())
    return {
      curtain: q('[data-menu-curtain]'),
      inner: q('[data-menu-inner]'),
      reveal: q('[data-menu-reveal]'),
      lines: q('[data-menu-line]'),
      fades: q('[data-menu-fade]'),
      cards: q('[data-menu-card]'),
      scrambles: q('[data-menu-scramble]'),
    }
  }

  function clearInline(gsap: Gsap) {
    const g = groups(gsap)
    gsap.set(Object.values(g).flat(), { clearProps: 'transform,opacity' })
    // Scrambled copies go back to their final text for the next open.
    g.scrambles.forEach((node) => {
      node.textContent = node.dataset.menuScramble ?? ''
    })
  }

  /* The row that matches where the page is: the last destination whose section
     has reached the upper part of the viewport, else Home. Read once, on open. */
  function findActive() {
    if (window.location.pathname !== '/') return null
    let active = items()[0] ?? null
    items().forEach((item) => {
      const hash = item.querySelector<HTMLAnchorElement>('a')?.hash
      const section = hash ? document.getElementById(hash.slice(1)) : null
      if (section && section.getBoundingClientRect().top <= window.innerHeight * 0.4) active = item
    })
    return active
  }

  /* Marks one row current: it takes the marker and slides over to make room. */
  function setCurrent(item: HTMLElement | null) {
    items().forEach((el) => el.toggleAttribute('data-current', el === item))
    const marker = root()?.querySelector<HTMLElement>('[data-menu-marker]')
    if (!marker) return
    if (!item) {
      marker.dataset.on = 'false'
      return
    }
    const y = item.offsetTop + (item.offsetHeight - marker.offsetHeight) / 2
    // Appearing from nothing is placed on its row; only a move after that rolls.
    if (marker.dataset.on !== 'true') {
      markerRef.current = { moves: 0, turns: 0 }
      marker.style.transition = 'none'
      marker.style.transform = `translateY(${y}px)`
      void marker.offsetWidth
      marker.style.transition = ''
    } else if (marker.dataset.row !== String(items().indexOf(item))) {
      const state = markerRef.current
      if (state.moves > 0) state.turns += 1
      state.moves += 1
      marker.style.transform = `translateY(${y}px) rotate(${state.turns * 90}deg)`
    }
    marker.dataset.row = String(items().indexOf(item))
    marker.dataset.on = 'true'
  }

  function markActive() {
    const active = findActive()
    activeRef.current = active
    items().forEach((item) => {
      const link = item.querySelector('a')
      if (item === active) link?.setAttribute('aria-current', 'location')
      else link?.removeAttribute('aria-current')
    })
  }

  async function open() {
    const el = root()
    if (!el || openRef.current) return
    openRef.current = true
    hoverRef.current = null
    setIsOpen(true)
    el.dataset.open = 'true'
    setPageInert(true)
    markActive()

    let gsap: Gsap | null = null
    if (!prefersReducedMotion()) {
      try {
        gsap = gsapRef.current ?? (await loadGsap())
      } catch {
        // If the chunk fails to load the menu still opens, without motion.
      }
    }
    if (!openRef.current) return // closed again while GSAP was loading
    gsapRef.current = gsap ?? gsapRef.current

    timelineRef.current?.kill()
    timelineRef.current = null
    if (!gsap) {
      setShown(true)
      setCurrent(activeRef.current)
      return
    }
    play(gsap)
  }

  function play(gsap: Gsap) {
    const g = groups(gsap)
    /* The small things start a quarter into the details' rise (its staggered
       length), as in the reference. */
    const DETAILS = 0.95 + 0.25 * (0.5 + 0.04 * Math.max(g.lines.length - 1, 0))

    // Starting from rest: park the content at its closed look, then let the CSS
    // open look sit underneath. Mid-close, it is already part-way.
    if (!isShown()) {
      gsap.set(g.curtain, { yPercent: -100 })
      gsap.set(g.inner, { yPercent: 100 })
      gsap.set([...g.reveal, ...g.lines], { yPercent: 110 })
      gsap.set([...g.fades, ...g.cards], { opacity: 0 })
      setShown(true)
    }
    gsap.set(g.scrambles, { opacity: 1 })
    g.scrambles.forEach((node) => {
      node.textContent = ''
    })

    const tl = gsap.timeline({
      onComplete: () => {
        clearInline(gsap)
        timelineRef.current = null
      },
    })
    // The panel unfolds from the bar. Curtain and content move opposite ways by
    // the same amount, so the content stays still and is uncovered.
    const unfold = { yPercent: 0, duration: 1, ease: 'expo.inOut' }
    tl.to(g.curtain, unfold, 0)
    tl.to(g.inner, unfold, 0)

    // Halfway through the unfold the destinations rise, a row every tenth of a
    // second; a quarter into theirs, the details follow a line at a time.
    tl.to(g.reveal, { yPercent: 0, duration: 1.4, ease: 'expo.out', stagger: 0.1 }, 0.5)
    tl.to(g.lines, { yPercent: 0, duration: 0.5, ease: 'power2.out', stagger: 0.04 }, 0.95)

    // Then the small things: text scrambles into place, dots and cards fade in.
    g.scrambles.forEach((node) => {
      const text = node.dataset.menuScramble ?? ''
      const progress = { value: 0 }
      tl.to(
        progress,
        {
          value: 1,
          duration: 0.5,
          ease: 'none',
          onUpdate: () => {
            writeScramble(node, text, progress.value)
          },
        },
        DETAILS,
      )
    })
    tl.to(g.fades, { opacity: 1, duration: 0.5, ease: 'power2.out' }, DETAILS)
    tl.to(g.cards, { opacity: 1, duration: 1, ease: 'power1.out' }, DETAILS)

    // Last, the marker slides in and the current row makes room for it.
    tl.call(() => setCurrent(hoverRef.current ?? activeRef.current), [], DETAILS + 0.25)
    timelineRef.current = tl
  }

  function close() {
    const el = root()
    if (!el || !openRef.current) return
    openRef.current = false
    setIsOpen(false)
    el.dataset.open = 'false'
    setPageInert(false)
    setCurrent(null)

    // Focus inside the panel would be lost when it goes inert; hand it back now,
    // unless a link was followed (it goes to the destination once the menu is gone).
    if (!focusIdRef.current && panelRef.current?.contains(document.activeElement)) {
      triggerRef.current?.focus({ preventScroll: true })
    }

    timelineRef.current?.kill()
    timelineRef.current = null
    const gsap = gsapRef.current
    if (!isShown() || !gsap || prefersReducedMotion()) {
      if (gsap) clearInline(gsap)
      finish()
      return
    }

    const g = groups(gsap)
    // Scrambled text is removed within a frame; whatever was part-way through
    // rising simply stays where it is while the panel is wiped away.
    gsap.set(g.scrambles, { opacity: 0 })
    const tl = gsap.timeline({
      onComplete: () => {
        clearInline(gsap)
        timelineRef.current = null
        finish()
      },
    })
    const wipe = { duration: 0.6, ease: 'expo.inOut' }
    tl.to(g.curtain, { ...wipe, yPercent: -100 }, 0)
    tl.to(g.inner, { ...wipe, yPercent: 100 }, 0)
    timelineRef.current = tl
  }

  function finish() {
    setShown(false)
    const id = focusIdRef.current
    focusIdRef.current = null
    const target = id ? document.getElementById(id) : null
    if (target) {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: true })
    } else if (document.activeElement === document.body || !document.activeElement) {
      triggerRef.current?.focus({ preventScroll: true })
    }
  }

  // The bar's scrolled state: a 50px sentinel at the top of the document (rendered
  // by the header) leaves the viewport once the page has scrolled past it.
  useEffect(() => {
    const sentinel = document.querySelector('[data-menu-sentinel]')
    const el = root()
    if (!sentinel || !el) return
    const observer = new IntersectionObserver(([entry]) => {
      el.dataset.scrolled = String(!entry?.isIntersecting)
    })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  // The bar takes the theme of the section under it (the reference's header does):
  // while a section carrying data-theme covers the bar's band at the top of the
  // screen, the bar carries the same theme, and its tokens follow.
  useEffect(() => {
    const el = root()
    const sections = Array.from(document.querySelectorAll<HTMLElement>('main [data-theme]'))
    if (!el || sections.length === 0) return
    const under = new Set<HTMLElement>()
    let swap = 0
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) under.add(entry.target as HTMLElement)
          else under.delete(entry.target as HTMLElement)
        })
        const theme = [...under].at(-1)?.dataset.theme
        if ((theme ?? '') === (el.dataset.theme ?? '')) return
        el.dataset.swap = 'true'
        window.clearTimeout(swap)
        swap = window.setTimeout(() => (el.dataset.swap = 'false'), 450)
        if (theme) el.dataset.theme = theme
        else el.removeAttribute('data-theme')
      },
      // The top tenth of the screen, where the bar sits.
      { rootMargin: '0px 0px -90% 0px' },
    )
    sections.forEach((section) => observer.observe(section))
    return () => {
      observer.disconnect()
      window.clearTimeout(swap)
    }
  }, [])

  // The bar slides away once the footer reaches the top of the screen (it would
  // sit over the footer's first row), as the reference's does, and comes back as
  // the footer leaves. Keyboard focus inside the bar brings it back at once.
  useEffect(() => {
    const footer = document.querySelector('footer')
    const el = root()
    if (!footer || !el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        el.dataset.hidden = String(Boolean(entry?.isIntersecting))
      },
      // The top tenth of the screen: the footer is there once its top has passed it.
      { rootMargin: '0px 0px -90% 0px' },
    )
    observer.observe(footer)
    const reveal = () => {
      el.dataset.hidden = 'false'
    }
    el.addEventListener('focusin', reveal)
    return () => {
      observer.disconnect()
      el.removeEventListener('focusin', reveal)
    }
  }, [])

  // Escape closes. One listener for the island's lifetime; it reads the ref.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && openRef.current) close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- close only touches refs
  }, [])

  // The marker follows a hovered or keyboard-focused row, and returns to the
  // current page's row when the pointer or focus leaves.
  useEffect(() => {
    const nav = panelRef.current?.querySelector<HTMLElement>('[data-menu-nav]')
    if (!nav) return
    const rowOf = (target: EventTarget | null) =>
      (target as Element | null)?.closest<HTMLElement>('[data-menu-item]') ?? null
    const rest = () => {
      hoverRef.current = null
      if (openRef.current && !timelineRef.current) setCurrent(activeRef.current)
    }
    const onOver = (event: PointerEvent) => {
      const row = event.pointerType === 'mouse' ? rowOf(event.target) : null
      if (!row || !openRef.current) return
      hoverRef.current = row
      setCurrent(row)
    }
    const onFocusIn = (event: FocusEvent) => {
      const row = rowOf(event.target)
      if (!row || !openRef.current || !(event.target as Element).matches(':focus-visible')) return
      hoverRef.current = row
      setCurrent(row)
    }
    nav.addEventListener('pointerover', onOver)
    nav.addEventListener('pointerleave', rest)
    nav.addEventListener('focusin', onFocusIn)
    nav.addEventListener('focusout', rest)
    return () => {
      nav.removeEventListener('pointerover', onOver)
      nav.removeEventListener('pointerleave', rest)
      nav.removeEventListener('focusin', onFocusIn)
      nav.removeEventListener('focusout', rest)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setCurrent only touches refs and the DOM
  }, [])

  // Hovering or keyboard-focusing a project card scrambles its caption again, the
  // way the reference does. It never runs over the opening sequence.
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    const frames = new WeakMap<HTMLElement, number>()
    const run = (card: HTMLElement) => {
      const node = card.querySelector<HTMLElement>('[data-menu-scramble]')
      if (!node || timelineRef.current || !openRef.current || prefersReducedMotion()) return
      const text = node.dataset.menuScramble ?? ''
      window.cancelAnimationFrame(frames.get(node) ?? 0)
      const start = performance.now()
      const tick = (now: number) => {
        const progress = Math.min((now - start) / 450, 1)
        if (progress === 1) node.textContent = text
        else {
          writeScramble(node, text, progress)
          frames.set(node, window.requestAnimationFrame(tick))
        }
      }
      frames.set(node, window.requestAnimationFrame(tick))
    }
    const cardOf = (target: EventTarget | null) =>
      (target as Element | null)?.closest<HTMLElement>('[data-menu-card]') ?? null
    const onOver = (event: PointerEvent) => {
      const card = cardOf(event.target)
      if (card && event.pointerType === 'mouse' && !card.contains(event.relatedTarget as Node)) {
        run(card)
      }
    }
    const onFocusIn = (event: FocusEvent) => {
      const card = cardOf(event.target)
      if (card && (event.target as Element).matches(':focus-visible')) run(card)
    }
    panel.addEventListener('pointerover', onOver)
    panel.addEventListener('focusin', onFocusIn)
    return () => {
      panel.removeEventListener('pointerover', onOver)
      panel.removeEventListener('focusin', onFocusIn)
    }
  }, [])

  useEffect(
    () => () => {
      timelineRef.current?.kill()
      setPageInert(false)
    },
    [],
  )

  // Following any link inside the navbar closes it; the page navigates as usual
  // and the destination is revealed as the surface retracts.
  function onClick(event: MouseEvent<HTMLDivElement>) {
    if (!openRef.current || event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href]')
    if (!link || link.target === '_blank' || link.protocol === 'mailto:') return
    focusIdRef.current = link.hash ? link.hash.slice(1) : null
    close()
  }

  // Fetch GSAP, and the cards' images, before they are needed so the first open
  // does not wait on the network.
  const prefetch = () => {
    void loadGsap().catch(() => undefined)
    panelRef.current?.querySelectorAll('img').forEach((img) => {
      img.loading = 'eager'
    })
  }

  return (
    <div
      ref={rootRef}
      data-open="false"
      data-shown="false"
      data-scrolled="false"
      data-hidden="false"
      onClick={onClick}
      className="menu relative"
    >
      {/* Behind everything: the scrim that dims and softens the page while open. */}
      <div aria-hidden="true" onClick={close} className="menu-scrim bg-black/30 backdrop-blur-sm" />

      <div className="menu-frame mx-auto w-full max-w-content pt-4">
        <div className="menu-bar pointer-events-auto relative">
          <div aria-hidden="true" className="menu-surface absolute inset-0 bg-surface" />
          <div className="menu-bar-row relative grid h-full grid-cols-2 items-center lg:grid-cols-3">
            <div className="menu-brand justify-self-start">{brand}</div>
            <div className="menu-cell justify-self-end lg:justify-self-center">
              <button
                ref={triggerRef}
                type="button"
                aria-label={menu.label}
                aria-expanded={isOpen}
                aria-controls="site-menu"
                onClick={() => (openRef.current ? close() : void open())}
                onPointerEnter={prefetch}
                onFocus={prefetch}
                onTouchStart={prefetch}
                className="menu-trigger group flex min-h-11 min-w-11 items-center gap-2 font-label text-label font-medium text-ink uppercase transition-opacity duration-base ease-out hover:opacity-70 active:translate-y-px active:duration-instant"
              >
                <span aria-hidden="true" className="menu-roll menu-roll-label">
                  <span className="menu-roll-track">
                    <span>{menu.label}</span>
                    <span>{menu.closeLabel}</span>
                  </span>
                </span>
                <span aria-hidden="true" className="menu-icon">
                  <span />
                  <span />
                </span>
              </button>
            </div>
            <div className="menu-action hidden justify-self-end lg:block">{action}</div>
          </div>
        </div>

        <div
          ref={panelRef}
          id="site-menu"
          inert
          className="menu-panel pointer-events-auto mt-2 overflow-hidden"
        >
          <div data-menu-curtain className="overflow-hidden bg-surface">
            <div data-menu-inner className="menu-panel-inner p-menu text-ink">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
