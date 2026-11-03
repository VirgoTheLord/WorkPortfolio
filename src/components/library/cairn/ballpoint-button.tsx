'use client'

import { useEffect, useId, useLayoutEffect, useRef, type ComponentProps } from 'react'
import { createEngine, type Engine } from './ballpoint-engine'
import './ballpoint-button.css'

type Common = {
  label: string
  /** The pen. `ink` is the text colour; `accent` follows --wui-accent. */
  ink?: 'ink' | 'blue' | 'red' | 'accent'
  /** Draw itself in, once, when it first scrolls into view. Off, it is simply there. */
  intro?: boolean
  /** Change it (a counter, say) to play the intro again: the drawing sinks and undraws, then draws itself in. */
  replay?: number
}

type AsButton = Common & Omit<ComponentProps<'button'>, 'children'> & { href?: undefined }
type AsLink = Common & Omit<ComponentProps<'a'>, 'children'> & { href: string }

export type BallpointButtonProps = AsButton | AsLink

/*
 * A button drawn in ballpoint (ballpoint-button.css, ballpoint-engine.ts): a
 * face ruled by hand, each edge gone over three times and overshooting the
 * corners, sitting on a deep block whose sides are hatched and cross-hatched.
 * When it first scrolls into view the pen rules the face, the block springs up
 * off the page and the sides hatch in. Hover sends a light
 * fourth pass round the face; a press throws the face down through the block's
 * full depth, and on release it springs back with a bounce. Changing `replay`
 * plays the intro again in place: the block sinks flat and the lines undraw
 * first, so the reset is as smooth as the drawing.
 *
 * A real <button>, or an <a> when given href, with the label as its accessible
 * name; the drawing is an aria-hidden SVG. Before the script runs it is a plain
 * button with a hairline edge in the same place. Reduced motion skips the
 * intro and the springs: the states change without the motion.
 */
export function BallpointButton({ label, ink = 'ink', intro = true, replay, className = '', ...props }: BallpointButtonProps) {
  const root = useRef<HTMLButtonElement & HTMLAnchorElement>(null)
  const art = useRef<SVGSVGElement>(null)
  const id = useId().replace(/:/g, '')

  // Mount once: the engine reads intro at start and owns the drawing from then on.
  // A layout effect, so the drawing exists before the first paint and the plain
  // fallback edge never flashes when it remounts.
  const introAtMount = useRef(intro)
  const engine = useRef<Engine | null>(null)
  useLayoutEffect(() => {
    if (!root.current || !art.current) return
    const created = createEngine(root.current, art.current, `wui-bp${id}`, { intro: introAtMount.current })
    engine.current = created
    return () => {
      created.destroy()
      engine.current = null
    }
  }, [id])

  // A new replay value plays the intro again on the same drawing; the first value does nothing.
  const replayed = useRef(replay)
  useEffect(() => {
    if (replay === replayed.current) return
    replayed.current = replay
    engine.current?.replay()
  }, [replay])

  const inner = (
    <>
      <svg ref={art} aria-hidden="true" className="wui-ballpoint-art" />
      <span className="wui-ballpoint-label">{label}</span>
    </>
  )
  const shared = { ref: root, 'data-ink': ink, className: `wui-ballpoint ${className}` }

  if (props.href !== undefined) {
    return (
      <a {...(props as AsLink)} {...shared}>
        {inner}
      </a>
    )
  }
  const { type = 'button', ...rest } = props as AsButton
  return (
    <button {...rest} type={type} {...shared}>
      {inner}
    </button>
  )
}
