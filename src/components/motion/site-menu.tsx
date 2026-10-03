'use client'

import { useEffect, useRef, useState } from 'react'
import type { MouseEvent, ReactNode, SyntheticEvent } from 'react'
import { loadGsap, motion } from '@/lib/motion/gsap'
import './site-menu.css'

type Gsap = Awaited<ReturnType<typeof loadGsap>>
type Timeline = ReturnType<Gsap['timeline']>
type Context = ReturnType<Gsap['context']>

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/*
 * The trigger and the full-screen menu. A native <dialog> opened with
 * showModal() provides the focus trap, inert background and top layer; GSAP
 * only choreographs. One paused timeline is built on first open and then
 * played to open and reversed to close, so the two directions are the same
 * object and an interrupted open turns around from where it is.
 *
 * The content (brand, links, metadata) arrives as server-rendered props and
 * children; this island owns behavior only.
 */
export function SiteMenu({ brand, children }: { brand: ReactNode; children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<Timeline | null>(null)
  const contextRef = useRef<Context | null>(null)
  const focusIdRef = useRef<string | null>(null)

  useEffect(() => () => contextRef.current?.revert(), [])

  function buildTimeline(gsap: Gsap) {
    const panel = panelRef.current
    if (!panel || timelineRef.current) return

    contextRef.current = gsap.context(() => {
      const tl = gsap.timeline({ paused: true })
      const rise = { yPercent: 0, duration: motion.slow, ease: motion.out }

      // 1. The surface unrolls from the top edge.
      tl.fromTo(
        panel,
        { clipPath: 'inset(0% 0% 100% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: motion.slow, ease: motion.inOut },
        0,
      )
      // 2. The top bar and the hairlines establish the frame.
      tl.fromTo('[data-menu-bar]', { yPercent: 110 }, rise, 0.2)
      tl.fromTo(
        '[data-menu-rule]',
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: motion.slow,
          ease: motion.inOut,
          stagger: motion.stagger,
          transformOrigin: 'left center',
        },
        0.2,
      )
      // 3. Each destination rises into its mask, one row at a time.
      gsap.utils.toArray<HTMLElement>('[data-menu-row]').forEach((row, i) => {
        tl.fromTo(
          row.querySelectorAll('[data-menu-reveal]'),
          { yPercent: 110 },
          rise,
          0.25 + i * motion.stagger,
        )
      })
      // 4. Supporting metadata arrives last.
      tl.fromTo('[data-menu-meta]', { yPercent: 110 }, rise, 0.6)

      tl.eventCallback('onReverseComplete', () => dialogRef.current?.close())
      timelineRef.current = tl
    }, panel)
  }

  async function open() {
    const dialog = dialogRef.current
    if (!dialog) return

    const timeline = timelineRef.current
    if (prefersReducedMotion()) {
      // Reduced motion keeps the function and drops the choreography.
      timeline?.progress(1).pause()
      if (!dialog.open) dialog.showModal()
      setIsOpen(true)
      return
    }

    let gsap: Gsap | null = null
    try {
      gsap = await loadGsap()
    } catch {
      // If the chunk fails to load the menu still opens, without motion.
    }
    if (!gsap) {
      if (!dialog.open) dialog.showModal()
      setIsOpen(true)
      return
    }

    buildTimeline(gsap)
    if (!dialog.open) dialog.showModal()
    setIsOpen(true)
    timelineRef.current?.timeScale(1).play()
  }

  function close() {
    const dialog = dialogRef.current
    if (!dialog?.open) return

    const timeline = timelineRef.current
    if (prefersReducedMotion() || !timeline) {
      dialog.close()
      timeline?.progress(0).pause()
      return
    }
    // Closing is the opening played backwards, a little quicker.
    timeline.timeScale(1.6).reverse()
  }

  function onDialogClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href]')
    if (!link) return
    // Let the navigation proceed; the destination is revealed as the surface retracts.
    focusIdRef.current = link.hash ? link.hash.slice(1) : null
    close()
  }

  function onCancel(event: SyntheticEvent<HTMLDialogElement>) {
    // Escape: run the closing choreography instead of the instant default.
    event.preventDefault()
    close()
  }

  function onClose() {
    setIsOpen(false)
    const target = focusIdRef.current ? document.getElementById(focusIdRef.current) : null
    focusIdRef.current = null
    if (target) {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: true })
    } else {
      triggerRef.current?.focus()
    }
  }

  // Fetch GSAP before it is needed so the first open does not wait on the network.
  const prefetch = () => void loadGsap().catch(() => undefined)

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls="site-menu"
        aria-haspopup="dialog"
        onClick={open}
        onPointerEnter={prefetch}
        onFocus={prefetch}
        onTouchStart={prefetch}
        className="site-menu-trigger group flex h-11 min-w-11 items-center justify-end font-label text-label font-medium text-fg uppercase transition-colors duration-base ease-out hover:text-accent hover:duration-fast focus-visible:text-accent focus-visible:duration-fast active:translate-y-px active:duration-instant"
      >
        <span className="relative">
          Menu
          {/* The brass detail: a short rule that extends on hover and focus. */}
          <span
            aria-hidden="true"
            className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-40 bg-accent-secondary transition-transform duration-base ease-out group-hover:scale-x-100 group-hover:duration-fast group-focus-visible:scale-x-100 group-focus-visible:duration-fast"
          />
        </span>
      </button>

      <dialog
        ref={dialogRef}
        id="site-menu"
        aria-label="Menu"
        onCancel={onCancel}
        onClose={onClose}
        onClick={onDialogClick}
        className="site-menu fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-hidden border-0 bg-transparent p-0"
      >
        <div ref={panelRef} className="flex h-dvh flex-col bg-accent text-accent-fg">
          <div className="mx-auto flex h-11 w-full max-w-content shrink-0 items-center justify-between px-margin">
            {brand}
            <button
              type="button"
              autoFocus
              onClick={close}
              className="group flex h-11 min-w-11 items-center justify-end font-label text-label font-medium uppercase underline decoration-transparent underline-offset-4 transition-colors duration-base ease-out hover:decoration-accent-fg hover:duration-fast focus-visible:decoration-accent-fg focus-visible:duration-fast active:translate-y-px active:duration-instant"
            >
              <span className="block overflow-hidden">
                <span data-menu-bar className="block">
                  Close
                </span>
              </span>
            </button>
          </div>
          <div className="mx-auto flex min-h-0 w-full max-w-content flex-1 flex-col overflow-y-auto px-margin pb-8 md:pb-10">
            {children}
          </div>
        </div>
      </dialog>
    </>
  )
}
