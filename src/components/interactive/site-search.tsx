'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { LensSearch } from '@/components/library/cairn/lens-search'
import { Icon } from '@/components/ui/icon'
import { switchTheme } from '@/lib/compact-theme'
import { copyText } from '@/lib/copy-text'
import type { CompactContent, PaletteCommand } from '@/types/content'

/* How long a result (a copy, the grid) stays in the tag at the foot of the screen (ms). */
const HOLD = 2200

function editable(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
  )
}

type Item = {
  label: string
  group: string
  icon: ReactNode
  hint?: string
  command: PaletteCommand
}

/* Every word typed must match the result's name, group or keywords. */
const matches = (item: Item, query: string) => {
  const text = `${item.label} ${item.group} ${item.command.keywords ?? ''}`.toLowerCase()
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => text.includes(word))
}

/*
 * The compact site's search (DESIGN.md §5b) is Cairn's lens search, in its
 * palette form: a small trigger in the bar, and ⌘K / Ctrl K (or "/") or a
 * click opens the field in the middle of the screen over the page, its results
 * opening as a circle out of the magnifier, grouped, everything the site can
 * take you to or do. Every result does something real; a copy, the theme or
 * the grid reports in a small status tag. Hidden without script (compact.css).
 */
export function SiteSearch({ commands, label, placeholder, empty }: CompactContent['search']) {
  const wrap = useRef<HTMLDivElement>(null)
  const timer = useRef(0)
  const [query, setQuery] = useState('')
  const [result, setResult] = useState('')

  const items: Item[] = commands.map((command) => ({
    label: command.label,
    group: command.group,
    icon: <Icon name={command.icon} className="size-4" />,
    hint: command.action.kind === 'go' && command.action.external ? '↗' : undefined,
    command,
  }))

  // "/" opens it too, from anywhere but another field (⌘K is the lens's own).
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
      if (editable(event.target)) return
      event.preventDefault()
      wrap.current?.querySelector<HTMLButtonElement>('.wui-lens-trigger')?.click()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const say = (text: string) => {
    setResult(text)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setResult(''), HOLD)
  }

  const run = async ({ command: { action } }: Item) => {
    setQuery('')
    if (action.kind === 'copy') {
      if (await copyText(action.text)) say(action.done)
      return
    }
    if (action.kind === 'theme') {
      const box = wrap.current?.getBoundingClientRect()
      const next = switchTheme(box && { x: box.left + box.width / 2, y: box.top + box.height / 2 })
      say(next === 'dark' ? 'Lights off' : 'Lights on')
      return
    }
    if (action.kind === 'grid') {
      const root = document.querySelector('.cp')
      const on = !root?.hasAttribute('data-grid')
      root?.toggleAttribute('data-grid', on)
      say(on ? 'Layout grid on. Run it again to hide it.' : 'Layout grid off')
      return
    }
    if (action.external) {
      window.open(action.href, '_blank', 'noopener,noreferrer')
      return
    }
    const url = new URL(action.href, window.location.href)
    if (url.pathname === window.location.pathname && url.hash) {
      // On this page: scroll there and move focus with it, so the next Tab continues from it.
      const target = document.getElementById(url.hash.slice(1))
      if (!target) return
      const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      history.pushState(null, '', url.hash)
      target.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' })
      target.focus({ preventScroll: true })
      return
    }
    window.location.assign(url)
  }

  return (
    <div ref={wrap} className="cp-search">
      <LensSearch
        expand
        label={label}
        placeholder={placeholder}
        items={items}
        filter={matches}
        limit={items.length}
        emptyText={empty}
        shortcut="k"
        value={query}
        onChange={setQuery}
        onSelect={(item) => void run(item)}
      />
      <p role="status" className="cp-toast font-label" data-on={result ? '' : undefined}>
        {result}
      </p>
    </div>
  )
}
