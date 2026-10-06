/*
 * One frame of a character-scramble reveal: the text resolves from the left while
 * a short tail of noise runs ahead of it. Pure, so the caller owns the clock.
 */
export const NOISE = '{}%$;~#<>+=|\\^&*0123456789ABCDEFGHJKLMNPQRSTUVWXYZ'
const TAIL = 6

export function scrambleFrame(text: string, progress: number) {
  if (progress <= 0) return ''
  if (progress >= 1) return text
  const resolved = Math.floor(progress * text.length)
  const tail = Math.min(text.length - resolved, TAIL, 1 + Math.floor(progress * 10))
  let out = text.slice(0, resolved)
  for (let i = 0; i < tail; i++) {
    out += text[resolved + i] === ' ' ? ' ' : NOISE[Math.floor(Math.random() * NOISE.length)]
  }
  return out
}

/*
 * Plays one scramble into `node` over `ms`: the text resolves from the left with
 * the noise running ahead of it in the accent colour. The frame loop exists only
 * for the length of the scramble. Returns a cancel that restores the plain text.
 */
export function playScramble(node: HTMLElement, text: string, ms = 500) {
  const start = performance.now()
  let frame = 0
  const tick = (now: number) => {
    const progress = Math.min((now - start) / ms, 1)
    if (progress === 1) {
      node.textContent = text
      return
    }
    const shown = scrambleFrame(text, progress)
    const resolved = Math.min(Math.floor(progress * text.length), shown.length)
    const noise = document.createElement('span')
    noise.style.color = 'var(--color-accent)'
    noise.textContent = shown.slice(resolved)
    node.replaceChildren(shown.slice(0, resolved), noise)
    frame = window.requestAnimationFrame(tick)
  }
  frame = window.requestAnimationFrame(tick)
  return () => {
    window.cancelAnimationFrame(frame)
    node.textContent = text
  }
}
