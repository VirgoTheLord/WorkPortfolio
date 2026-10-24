import type { CompactIcon } from '@/types/content'

/*
 * The compact site's small line icons (ARCHITECTURE.md §9: inline SVG, no icon
 * set), drawn on a 24-unit square in the current colour. Always decorative: the
 * control or line beside it carries the name.
 */
const paths = {
  arrow: 'M7 17L17 7M8.5 7H17v8.5',
  box: 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9',
  copy: 'M9 9h10.5v10.5H9zM15 9V4.5H4.5V15H9',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  close: 'M6.5 6.5l11 11M17.5 6.5l-11 11',
  grid: 'M4 4h16v16H4zM9.33 4v16M14.67 4v16M4 12h16',
  hash: 'M9.5 4l-2 16M16.5 4l-2 16M4.5 9h16M3.5 15h16',
  home: 'M4 10.5L12 4l8 6.5V20h-5.5v-5.5h-5V20H4z',
  mail: 'M3.5 6h17v12h-17zM3.5 7l8.5 6 8.5-6',
  moon: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z',
  replay: 'M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4v4.5H9',
  search: 'M16.5 16.5L20 20M18 11a7 7 0 1 1-14 0 7 7 0 0 1 14 0z',
  up: 'M12 19.5V5M6 11l6-6 6 6',
} as const

/* The two marks, filled rather than stroked. GitHub's from Simple Icons (CC0). */
const filled = {
  linkedin:
    'M5 3.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM3.25 9h3.5v11.5h-3.5zM9 9h3.35v1.6h.05c.47-.88 1.6-1.8 3.3-1.8 3.53 0 4.18 2.32 4.18 5.34v6.36h-3.49v-5.64c0-1.35-.02-3.08-1.88-3.08-1.88 0-2.17 1.47-2.17 2.98v5.74H9z',
  github:
    'M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57l-.02-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.3.76-1.6-2.67-.31-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.62-5.48 5.92.42.36.81 1.1.81 2.22l-.01 3.29c0 .32.21.69.82.57A12 12 0 0 0 12 .3',
} as const

export type IconName = keyof typeof paths | keyof typeof filled | CompactIcon

export function Icon({ name, className = 'size-4' }: { name: IconName; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
      {name in filled ? (
        <path d={filled[name as keyof typeof filled]} fill="currentColor" />
      ) : (
        <path
          d={paths[name as keyof typeof paths]}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}
