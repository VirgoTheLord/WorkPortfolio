'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { Icon } from '@/components/ui/icon'
import { switchTheme } from '@/lib/compact-theme'
import { copyText } from '@/lib/copy-text'
import type { CompactContent, PaletteCommand } from '@/types/content'
import { ShortcutKey } from './shortcut-key'

/* How long a result (a copy, the grid) stays in the tag at the foot of the screen (ms). */
const HOLD = 2200

function editable(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
  )
}

/*
 * The compact site's search (DESIGN.md §5b): a real text field in the bar, so
 * a click puts the caret in it and typing searches at once. Focus opens a list
 * under the bar of everywhere the site can take you and everything it can do;
 * every word typed must match a result's name, group or keywords. It is a
 * combobox over a listbox: ↑↓ move (and wrap), Enter runs, Escape clears and
 * then closes, ⌘K / Ctrl K or "/" focus it from anywhere but another field.
 * Every result does something real; a copy, the theme or the grid reports in a
 * small status tag. Hidden without script (compact.css), never a dead field.
 */
export function SiteSearch({
  commands,
  label,
  placeholder,
  ideas,
  empty,
  hints,
}: CompactContent['search']) {
  const wrap = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const timer = useRef(0)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [result, setResult] = useState('')
  const id = useId()

  const results = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean)
    return commands.filter((command) => {
      const text = `${command.label} ${command.group} ${command.keywords ?? ''}`.toLowerCase()
      return words.every((word) => text.includes(word))
    })
  }, [commands, query])

  // Groups in the order they first appear; each option keeps its place in `results`.
  const groups = useMemo(() => {
    const byName = new Map<string, { command: PaletteCommand; index: number }[]>()
    results.forEach((command, index) => {
      const group = byName.get(command.group) ?? []
      group.push({ command, index })
      byName.set(command.group, group)
    })
    return [...byName]
  }, [results])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const field = input.current
      if (!field) return
      const combo = event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)
      const slash = event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey
      if (combo && document.activeElement === field) {
        event.preventDefault()
        field.blur()
      } else if ((combo || slash) && !editable(event.target)) {
        event.preventDefault()
        // The bar is not pinned: from further down, go back up to it first.
        if (field.getBoundingClientRect().bottom < 0) {
          const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
          window.scrollTo({ top: 0, behavior: still ? 'auto' : 'smooth' })
        }
        field.focus({ preventScroll: true })
        field.select()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  // While the field is idle, its placeholder suggests a search now and then.
  useEffect(() => {
    const field = input.current
    if (!field || ideas.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let turn = 0
    const tick = window.setInterval(() => {
      if (document.hidden || document.activeElement === field || field.value) return
      turn = (turn + 1) % ideas.length
      field.placeholder = ideas[turn] ?? placeholder
    }, 2600)
    return () => window.clearInterval(tick)
  }, [ideas, placeholder])

  // Keep the highlighted option in view as the arrows move through the list.
  useEffect(() => {
    list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [active, results])

  const say = (text: string) => {
    setResult(text)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setResult(''), HOLD)
  }

  const close = () => {
    setOpen(false)
    setQuery('')
    setActive(0)
  }

  const run = async ({ action }: PaletteCommand) => {
    close()
    input.current?.blur()
    if (action.kind === 'copy') {
      if (await copyText(action.text)) say(action.done)
      return
    }
    if (action.kind === 'theme') {
      const box = input.current?.getBoundingClientRect()
      const next = switchTheme(box && { x: box.right, y: box.top + box.height / 2 })
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

  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    const count = results.length
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      if (!count) return
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActive((current) => (current + step + count) % count)
    } else if (event.key === 'Enter' && open && results[active]) {
      event.preventDefault()
      void run(results[active])
    } else if (event.key === 'Escape') {
      event.preventDefault()
      if (query) {
        setQuery('')
        setActive(0)
      } else {
        close()
        event.currentTarget.blur()
      }
    }
  }

  const optionId = (command: PaletteCommand) => `${id}-${command.id}`

  return (
    <div
      ref={wrap}
      className="cp-search"
      data-open={open || undefined}
      onBlur={(event) => {
        if (!wrap.current?.contains(event.relatedTarget)) close()
      }}
    >
      <label htmlFor={`${id}-input`} className="cp-search-field">
        <span className="sr-only">{label}</span>
        <Icon name="search" className="cp-search-glass size-3.5 shrink-0" />
        <input
          ref={input}
          id={`${id}-input`}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={open && results[active] ? optionId(results[active]) : undefined}
          aria-keyshortcuts="Meta+K Control+K /"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="go"
          placeholder={placeholder}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value)
            setActive(0)
            setOpen(true)
          }}
          onKeyDown={onKeyDown}
          className="cp-search-input"
        />
        {query ? null : <ShortcutKey className="cp-keys cp-search-kbd" />}
      </label>

      <div className="cp-search-panel" hidden={!open}>
        <div
          ref={list}
          id={`${id}-list`}
          role="listbox"
          aria-label={label}
          className="cp-search-list"
        >
          {groups.map(([name, items]) => (
            <div key={name} role="group" aria-label={name}>
              <div aria-hidden="true" className="cp-search-group font-label">
                {name}
              </div>
              {items.map(({ command, index }) => (
                <div
                  key={command.id}
                  id={optionId(command)}
                  role="option"
                  tabIndex={-1}
                  aria-selected={index === active}
                  onMouseDown={(event) => event.preventDefault()}
                  onPointerMove={() => {
                    if (index !== active) setActive(index)
                  }}
                  onClick={() => void run(command)}
                  className="cp-search-option"
                >
                  <Icon name={command.icon} className="size-4 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{command.label}</span>
                  {command.action.kind === 'go' && command.action.external ? (
                    <Icon name="arrow" className="cp-search-out size-3.5" />
                  ) : null}
                </div>
              ))}
            </div>
          ))}
        </div>
        {results.length === 0 ? <p className="cp-search-empty">{empty}</p> : null}
        <div aria-hidden="true" className="cp-search-foot font-label">
          <span>
            <kbd className="cp-kbd">↑↓</kbd> {hints.move}
          </span>
          <span>
            <kbd className="cp-kbd">↵</kbd> {hints.run}
          </span>
          <span>
            <kbd className="cp-kbd">Esc</kbd> {hints.close}
          </span>
        </div>
      </div>

      <p role="status" className="cp-toast font-label" data-on={result ? '' : undefined}>
        {result}
      </p>
    </div>
  )
}
