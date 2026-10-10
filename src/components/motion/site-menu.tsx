'use client'

import { useEffect, useRef, useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import { loadGsap } from '@/lib/motion/gsap'
import { menu } from '@/content/site'
import './site-menu.css'

type Gsap = Awaited<ReturnType<typeof loadGsap>>
type Timeline = ReturnType<Gsap['timeline']>

/* One destination: its row, its slash, and its split word: the letters, where
   the browser set each in the real word (x), how far each advances to the next
   (advance), and how far each has unfolded (0 to 1; the first is always out). */
type Word = {
  item: HTMLElement
  slash: HTMLElement | null
  chars: HTMLElement[]
  x: number[]
  advance: number[]
  unfold: { value: number }[]
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* The page behind the header: made inert while the menu is open, so keyboard and
   assistive tech stay inside it. */
const PAGE = ':scope > main, :scope > footer, :scope > a'

/* The theme the bar takes while the menu is open: the field's own. */
const OPEN_THEME = 'dark'

/* Measures where each letter sits in the real, kerned word. */
function measure(word: Word, text: Node) {
  const range = document.createRange()
  range.selectNodeContents(text)
  const origin = range.getBoundingClientRect()
  word.x = word.chars.map((_, i) => {
    range.setStart(text, i)
    range.setEnd(text, i + 1)
    return range.getBoundingClientRect().left - origin.left
  })
  word.advance = word.x.map((x, i) => (word.x[i + 1] ?? origin.width) - x)
}

/* Lays the letters out for how far each has unfolded: a letter sits after the
   unfolded width of those before it and shows only its own unfolded part, so
   the word grows out of its first letter. Returns how much of the word is
   still folded away. */
function layout(word: Word) {
  let at = 0
  let full = 0
  word.chars.forEach((char, i) => {
    const amount = word.unfold[i]?.value ?? 1
    char.style.transform = `translate3d(${at}px, 0, 0)`
    char.style.clipPath = amount >= 1 ? '' : `inset(-0.3em ${(1 - amount) * 100}% -0.3em 0)`
    at += amount * (word.advance[i] ?? 0)
    full += word.advance[i] ?? 0
  })
  return full - at
}

/* The reference grows each word's real width, so its slash and the rest of its
   row ride along as it unfolds. Here the words keep their full width in the
   flow (nothing reflows, and the rows stay as they will end up) and the same
   ride is a transform: each slash moves back by what its word still has
   folded, and each destination by what the ones before it on its row have.
   The rows are centred, so a row's whole run also shifts by half of what it
   still has folded, keeping it centred as it grows. */
function arrange(words: Word[]) {
  const rows = new Map<number, { word: Word; folded: number }[]>()
  words.forEach((word) => {
    const row = rows.get(word.item.offsetTop) ?? []
    row.push({ word, folded: layout(word) })
    rows.set(word.item.offsetTop, row)
  })
  rows.forEach((row) => {
    let shift = row.reduce((sum, { folded }) => sum + folded, 0) / 2
    row.forEach(({ word, folded }) => {
      word.item.style.transform = shift ? `translate3d(${shift}px, 0, 0)` : ''
      if (word.slash) word.slash.style.transform = folded ? `translate3d(${-folded}px, 0, 0)` : ''
      shift -= folded
    })
  })
}

/*
 * The navbar island: the bar, and the full-screen menu behind it.
 *
 * Attributes on the root carry the state, and the CSS (site-menu.css) gives each
 * its look:
 *   data-open   the logical state. Set the moment the user asks. The bar's own
 *               pieces (surface, insets, the label and wordmark crossfades, the
 *               action) are CSS transitions off it; it also drives the scroll
 *               lock, the page's inertness and whether the field takes the pointer.
 *   data-scrolled  the page has left its top (50px): the closed bar becomes a
 *               card with its contents inset.
 *   data-shown  the field is there to be seen: on from the open until the
 *               closing sequence has run all the way back.
 *
 * The menu is one GSAP timeline, built as the reference builds its own: opening
 * plays it, closing plays it backwards at double speed, so an interruption
 * simply turns around from wherever it is. It is rebuilt on each open from rest,
 * so it always measures the current layout.
 *   0      the frost fades in over the page (1.2s, power2.out): translucent black
 *          with a 20px backdrop blur, so the page goes soft and dark in place
 *   i×0.08 for each destination i (spread over at most 0.4s whatever their
 *          number), all 1.2s expo.inOut: the index rises from its mask, the word
 *          rises (showing only its first letter), the slash opens from its middle
 *   +0.8   the word unfolds out of that first letter, a letter every 0.02s
 * Reduced motion: the frost fades in 0.2s; nothing moves, nothing unfolds.
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
  const fieldRef = useRef<HTMLDivElement>(null)
  const actionRef = useRef<HTMLDivElement>(null)
  const gsapRef = useRef<Gsap | null>(null)
  const timelineRef = useRef<Timeline | null>(null)
  const wordsRef = useRef<Word[]>([])
  const openRef = useRef(false)
  const focusIdRef = useRef<string | null>(null)
  // The theme of the section under the bar, kept while the menu overrides it.
  const sectionThemeRef = useRef<string | undefined>(undefined)
  const swapRef = useRef(0)

  const root = () => rootRef.current
  const isShown = () => root()?.dataset.shown === 'true'

  function setShown(shown: boolean) {
    const el = root()
    if (!el) return
    el.dataset.shown = String(shown)
    if (fieldRef.current) fieldRef.current.inert = !shown
  }

  function setPageInert(inert: boolean) {
    document.body.querySelectorAll<HTMLElement>(PAGE).forEach((el) => {
      el.inert = inert
    })
    // The call to action fades out over the menu; it is out of reach at once.
    if (actionRef.current) actionRef.current.inert = inert
  }

  /* The bar's theme: the field's while open, else the section's under it. The
     colours fade over the swap (site-menu.css) rather than snap. */
  function applyTheme() {
    const el = root()
    if (!el) return
    const theme = openRef.current ? OPEN_THEME : sectionThemeRef.current
    if ((theme ?? '') === (el.dataset.theme ?? '')) return
    el.dataset.swap = 'true'
    window.clearTimeout(swapRef.current)
    swapRef.current = window.setTimeout(() => (el.dataset.swap = 'false'), 450)
    if (theme) el.dataset.theme = theme
    else el.removeAttribute('data-theme')
  }

  /* Marks the destination that matches where the page is: the last one whose
     section has reached the upper part of the viewport, else Home. Read on open. */
  function markActive() {
    const links = Array.from(
      fieldRef.current?.querySelectorAll<HTMLAnchorElement>('nav a[href]') ?? [],
    )
    let active: HTMLAnchorElement | null = null
    if (window.location.pathname === '/') {
      active = links[0] ?? null
      links.forEach((link) => {
        const section = link.hash ? document.getElementById(link.hash.slice(1)) : null
        if (section && section.getBoundingClientRect().top <= window.innerHeight * 0.4) {
          active = link
        }
      })
    }
    links.forEach((link) => {
      if (link === active) link.setAttribute('aria-current', 'location')
      else link.removeAttribute('aria-current')
    })
  }

  /* Builds the timeline from the menu's current layout, parked at its start. */
  function build(gsap: Gsap) {
    const field = fieldRef.current
    if (!field) return null
    const q = (selector: string, scope: Element = field) =>
      Array.from(scope.querySelectorAll<HTMLElement>(selector))
    const frost = q('[data-menu-frost]')

    const words: Word[] = []
    const tl = gsap.timeline({
      paused: true,
      defaults: { ease: 'expo.inOut', duration: 1.2 },
      // The letters' tweens only move numbers; the layout is written once a frame.
      onUpdate: () => arrange(words),
      onReverseComplete: finish,
    })

    if (prefersReducedMotion()) {
      wordsRef.current = []
      field.removeAttribute('data-split')
      tl.fromTo(frost, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: 'none' }, 0)
      return tl
    }

    tl.fromTo(frost, { autoAlpha: 0 }, { autoAlpha: 1, ease: 'power2.out' }, 0)
    // The bar's theme follows the frost: on the way back, it returns here.
    tl.call(applyTheme, [], 0.3)

    const items = q('[data-menu-item]')
    const each = Math.min(0.08, 0.4 / Math.max(items.length - 1, 1))
    items.forEach((item, i) => {
      const at = i * each
      // Index and word are trimmed to their capitals and their masks reach a
      // quarter em past them, so they start a little further down than the
      // reference's 110% and 130% to begin fully hidden.
      tl.fromTo(q('[data-menu-index]', item), { yPercent: 160 }, { yPercent: 0 }, at)
      tl.fromTo(q('[data-menu-word]', item), { yPercent: 160 }, { yPercent: 0 }, at)
      tl.fromTo(
        q('[data-menu-slash]', item),
        { clipPath: 'inset(50% 0%)' },
        { clipPath: 'inset(0% 0%)' },
        at,
      )

      const text = item.querySelector('[data-menu-text]')?.firstChild
      if (!text) return
      const chars = q('[data-menu-char]', item)
      const word: Word = {
        item,
        slash: item.querySelector<HTMLElement>('[data-menu-slash]'),
        chars,
        x: [],
        advance: [],
        unfold: chars.map((_, c) => ({ value: c === 0 ? 1 : 0 })),
      }
      measure(word, text)
      words.push(word)
      word.unfold.forEach((amount, c) => {
        if (c > 0) tl.to(amount, { value: 1 }, at + c * 0.02 + 0.8)
      })
    })
    wordsRef.current = words
    field.setAttribute('data-split', '')
    arrange(words)
    return tl
  }

  async function open() {
    const el = root()
    if (!el || openRef.current) return
    openRef.current = true
    setIsOpen(true)
    el.dataset.open = 'true'
    setPageInert(true)
    applyTheme()

    // Mid-close: turn the same timeline around.
    if (timelineRef.current && isShown()) {
      timelineRef.current.timeScale(1).play()
      return
    }

    markActive()
    let gsap: Gsap | null = null
    try {
      gsap = gsapRef.current ?? (await loadGsap())
      await document.fonts.ready
    } catch {
      // If the chunk fails to load the menu still opens, without motion.
    }
    if (!openRef.current) return // closed again while GSAP was loading
    gsapRef.current = gsap ?? gsapRef.current

    timelineRef.current?.kill()
    timelineRef.current = gsap ? build(gsap) : null
    setShown(true)
    timelineRef.current?.play()
  }

  function close() {
    const el = root()
    if (!el || !openRef.current) return
    openRef.current = false
    setIsOpen(false)
    el.dataset.open = 'false'
    setPageInert(false)

    // Focus inside the field would be lost when it goes inert; hand it back now,
    // unless a link was followed (it goes to the destination once the menu is gone).
    if (!focusIdRef.current && fieldRef.current?.contains(document.activeElement)) {
      triggerRef.current?.focus({ preventScroll: true })
    }

    const tl = timelineRef.current
    if (!tl || !isShown() || tl.progress() === 0) {
      applyTheme()
      finish()
      return
    }
    if (prefersReducedMotion()) applyTheme()
    tl.timeScale(prefersReducedMotion() ? 1 : 2).reverse()
  }

  function finish() {
    if (openRef.current) return // reopened before the close ran out
    setShown(false)
    applyTheme()
    fieldRef.current
      ?.querySelectorAll('[aria-current]')
      .forEach((link) => link.removeAttribute('aria-current'))
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

  // The bar takes the theme of the section under it: while a section carrying
  // data-theme covers the bar's band at the top of the screen, the bar carries
  // the same theme, and its tokens follow. While the menu is open the field's
  // theme wins, and the section's is applied once it closes.
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('main [data-theme]'))
    if (sections.length === 0) return
    const under = new Set<HTMLElement>()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) under.add(entry.target as HTMLElement)
          else under.delete(entry.target as HTMLElement)
        })
        sectionThemeRef.current = [...under].at(-1)?.dataset.theme
        if (!isShown()) applyTheme()
      },
      // The top tenth of the screen, where the bar sits.
      { rootMargin: '0px 0px -90% 0px' },
    )
    sections.forEach((section) => observer.observe(section))
    return () => {
      observer.disconnect()
      window.clearTimeout(swapRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- applyTheme only touches refs and the DOM
  }, [])

  // The bar slides away once the footer reaches the top of the screen (it would
  // sit over the footer's first row) and comes back as the footer leaves.
  // Keyboard focus inside the bar brings it back at once.
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

  // The type scales with the viewport, so the letters' places are measured again
  // on resize while the menu is up (at most once a frame).
  useEffect(() => {
    let frame = 0
    const onResize = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        if (!isShown()) return
        wordsRef.current.forEach((word) => {
          const text = word.item.querySelector('[data-menu-text]')?.firstChild
          if (text) measure(word, text)
        })
        arrange(wordsRef.current)
      })
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.cancelAnimationFrame(frame)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- isShown only reads the DOM
  }, [])

  useEffect(
    () => () => {
      timelineRef.current?.kill()
      setPageInert(false)
    },
    [],
  )

  // Following any link inside the menu closes it; the page moves to the
  // destination behind the frost, and is uncovered as the menu folds away.
  function onClick(event: MouseEvent<HTMLDivElement>) {
    if (!openRef.current || event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href]')
    if (!link || link.target === '_blank' || link.protocol === 'mailto:') return
    focusIdRef.current = link.hash ? link.hash.slice(1) : null
    close()
  }

  // Fetch GSAP before it is needed so the first open does not wait on the network.
  const prefetch = () => {
    void loadGsap().catch(() => undefined)
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
            <div ref={actionRef} className="menu-action hidden justify-self-end lg:block">
              {action}
            </div>
          </div>
        </div>
      </div>

      {/* The full-screen menu: after the bar in the tab order, so the links come
          straight after the trigger, and behind it on screen (site-menu.css).
          The frost softens and darkens the page in place; the destinations sit
          on it, in the dark theme in either mode. */}
      <div
        ref={fieldRef}
        id="site-menu"
        inert
        data-theme={OPEN_THEME}
        className="menu-field fixed inset-0"
      >
        <div aria-hidden="true" data-menu-frost className="menu-frost absolute inset-0" />
        <div data-lenis-prevent className="menu-field-inner relative size-full text-ink">
          <div className="menu-field-frame mx-auto h-full w-full max-w-content">{children}</div>
        </div>
      </div>
    </div>
  )
}
