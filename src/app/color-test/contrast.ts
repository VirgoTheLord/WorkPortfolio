/*
 * WCAG 2.x contrast, computed from the palette hex values at build time so the
 * numbers on /color-test can never drift from the colors they describe.
 */

const channel = (value: number) => {
  const c = value / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function luminance(hex: string) {
  const n = Number.parseInt(hex.slice(1), 16)
  return (
    0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
  )
}

/* Flattens an #rrggbbaa color onto an opaque ground, so translucent rules are
   measured as they render. */
function flatten(hex: string, ground: string) {
  if (hex.length !== 9) return hex
  const alpha = Number.parseInt(hex.slice(7), 16) / 255
  const mix = (i: number) => {
    const fg = Number.parseInt(hex.slice(i, i + 2), 16)
    const bg = Number.parseInt(ground.slice(i, i + 2), 16)
    return Math.round(fg * alpha + bg * (1 - alpha))
      .toString(16)
      .padStart(2, '0')
  }
  return `#${mix(1)}${mix(3)}${mix(5)}`
}

export function contrast(a: string, b: string) {
  const ground = flatten(b, '#ffffff')
  const [hi, lo] = [luminance(flatten(a, ground)), luminance(ground)].sort((x, y) => y - x) as [
    number,
    number,
  ]
  return (hi + 0.05) / (lo + 0.05)
}

export function verdict(ratio: number) {
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA text'
  if (ratio >= 3) return 'Large text / UI only'
  return 'Graphic or field only'
}
