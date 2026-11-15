'use client'

import { Fragment, useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type ChangeEvent, type KeyboardEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import './lens-search.css'

export type SearchItem = {
  label: string
  /** Shown small at the end of the row: a group, a type, a shortcut. */
  hint?: string
  /** Rows sharing a group are listed under its name, in the order given. */
  group?: string
  /** A small picture at the start of the row: an icon, initials, an avatar. */
  icon?: ReactNode
}

type LensSearchProps<T extends SearchItem> = {
  items: readonly T[]
  /** The field's accessible name. */
  label?: string
  placeholder?: string
  /** Controlled query. Leave it out and the field keeps its own. */
  value?: string
  defaultValue?: string
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void
  /** Called with the chosen item, on Enter or a click. */
  onSelect?: (item: T) => void
  /** Whether an item matches the query. By default, its label contains it. */
  filter?: (item: T, query: string) => boolean
  /** The most rows shown. */
  limit?: number
  /** Shown when nothing matches. */
  emptyText?: string
  name?: string
  /**
   * A key that focuses the field from anywhere with ⌘ (Apple devices) or Ctrl
   * (everywhere else), shown in the field as two keys until it is focused.
   */
  shortcut?: string
  /**
   * The field becomes a compact trigger that opens the search as a palette in
   * the middle of the screen, opening as a circle out of its magnifier as the
   * panel does, over the page blurred and dimmed. For a bar with little room.
   */
  expand?: boolean
  /**
   * With `expand`, shown at the top of the palette while the query is empty:
   * a row of quick links or actions (links or buttons you pass).
   */
  actions?: ReactNode
  className?: string
}

/* Whether this is an Apple device, where the shortcut is ⌘ rather than Ctrl.
   Unknown on the server, so the keys appear once the page has hydrated. */
const noop = () => () => {}
const apple = () => /mac|iphone|ipad|ipod/i.test((navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform || navigator.platform)

const contains = (item: SearchItem, query: string) => item.label.toLowerCase().includes(query.toLowerCase())

/* The label with the part that matches the query marked. */
function Marked({ text, query }: { text: string; query: string }) {
  const at = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1
  if (at < 0) return text
  return (
    <>
      {text.slice(0, at)}
      <mark>{text.slice(at, at + query.length)}</mark>
      {text.slice(at + query.length)}
    </>
  )
}

/*
 * A search field whose results open as a circle growing out of the magnifier,
 * the way a lens opens, and close back into it (lens-search.css). One move
 * each way, in CSS: the panel shows while the field has focus, so it is right
 * before hydration.
 *
 * A combobox over a listbox: arrow keys move the highlight, Enter or a click
 * chooses, Escape clears the query and then closes the panel. It filters the
 * items you give it as you type, marking the part of each that matches.
 * Given a `shortcut`, it shows ⌘ (Apple) or Ctrl (elsewhere) and the key in
 * the field, and that combination focuses it from anywhere.
 */
export function LensSearch<T extends SearchItem>({
  items,
  label = 'Search',
  placeholder = 'Search',
  value,
  defaultValue,
  onChange,
  onSelect,
  filter = contains,
  limit = 6,
  emptyText = 'No results',
  name,
  shortcut,
  expand = false,
  actions,
  className = '',
}: LensSearchProps<T>) {
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  const mac = useSyncExternalStore(noop, apple, () => null)
  const [own, setOwn] = useState(defaultValue ?? '')
  const [active, setActive] = useState(0)
  const [closed, setClosed] = useState(false)
  const [focused, setFocused] = useState(false)
  const query = value ?? own
  const q = query.trim()
  const results = (q ? items.filter((item) => filter(item, q)) : items).slice(0, limit)
  const current = Math.min(active, results.length - 1)
  const panel = useRef<HTMLUListElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const sheet = useRef<HTMLDivElement>(null)
  const [opened, setOpened] = useState(false)
  const client = useSyncExternalStore(noop, () => true, () => false)

  /* With `expand`: the field appears in the middle of the screen and, once
     it has focus, its results open under it exactly as the plain field's do,
     a circle out of the magnifier. The trigger stays where it is. */
  const open = () => {
    setActive(0)
    setOpened(true)
  }
  const close = (refocus = true) => {
    setOpened(false)
    if (refocus) trigger.current?.focus()
  }

  useEffect(() => {
    if (opened) input.current?.focus()
  }, [opened])

  // The shortcut: ⌘ and the key on Apple devices, Ctrl and the key elsewhere.
  useEffect(() => {
    if (!shortcut || mac === null) return
    const onKey = (event: globalThis.KeyboardEvent) => {
      // Another field on the page may have taken this shortcut already.
      if (event.defaultPrevented) return
      if ((mac ? event.metaKey : event.ctrlKey) && event.key.toLowerCase() === shortcut.toLowerCase()) {
        event.preventDefault()
        // Portfolio: pressed again while the field is open, it closes it.
        if (expand) {
          if (opened) close()
          else open()
        } else input.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [shortcut, mac, expand, opened])

  // The highlight is one element that glides to the active row, so hovering
  // or arrowing through the list moves it rather than switching rows.
  useLayoutEffect(() => {
    const list = panel.current
    const row = list?.querySelector<HTMLElement>('[aria-selected="true"]')
    if (!list) return
    if (!row) return list.removeAttribute('data-glide')
    list.style.setProperty('--wui-lens-y', `${row.offsetTop}px`)
    list.style.setProperty('--wui-lens-h', `${row.offsetHeight}px`)
    list.setAttribute('data-glide', '')
    // The palette's list scrolls: keep the active row in view.
    if (expand) row.scrollIntoView({ block: 'nearest' })
  })

  const setQuery = (next: string, event: ChangeEvent<HTMLInputElement>) => {
    if (value === undefined) setOwn(next)
    onChange?.(next, event)
  }

  const choose = (item: T | undefined) => {
    if (!item) return
    onSelect?.(item)
    if (expand) close(false)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const n = results.length
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setClosed(false)
      if (n) setActive((current + (event.key === 'ArrowDown' ? 1 : n - 1)) % n)
    } else if (event.key === 'Enter') {
      if (!closed && n) {
        event.preventDefault()
        choose(results[current])
      }
    } else if (event.key === 'Escape') {
      if (query && value === undefined) setOwn('')
      else if (expand) close()
      else setClosed(true)
    }
  }

  const rows = (
    <>
      <li role="presentation" aria-hidden="true" className="wui-lens-glide" />
      {results.map((item, i) => (
        <Fragment key={`${item.label}-${i}`}>
          {item.group && item.group !== results[i - 1]?.group && (
            <li role="presentation" className="wui-lens-group">
              {item.group}
            </li>
          )}
          <li
            id={`${id}-${i}`}
            role="option"
            aria-selected={i === current}
            onMouseDown={(event) => event.preventDefault()}
            onPointerMove={() => setActive(i)}
            onClick={() => choose(item)}
            className="wui-lens-option"
          >
            <span className="wui-lens-option-label">
              {item.icon && (
                <span className="wui-lens-option-icon" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              <span>
                <Marked text={item.label} query={q} />
              </span>
            </span>
            {item.hint && <small>{item.hint}</small>}
          </li>
        </Fragment>
      ))}
      {!results.length && (
        <li role="presentation" className="wui-lens-empty">
          {emptyText}
        </li>
      )}
    </>
  )
  const list = (
    <ul ref={panel} id={`${id}-list`} role="listbox" aria-label={label} className="wui-lens-panel">
      {rows}
    </ul>
  )

  const icon = (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="wui-lens-icon">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  )
  const keys = shortcut && mac !== null && (
    <span className="wui-lens-keys" aria-hidden="true">
      <kbd>{mac ? '⌘' : 'Ctrl'}</kbd>
      <kbd>{shortcut.toUpperCase()}</kbd>
    </span>
  )

  /* The palette: a trigger shaped like the field, and the palette itself on
     the body (so no transformed ancestor can hold it), always there and
     clipped to nothing while closed, as the panel is. */
  if (expand)
    return (
      <>
        <button
          ref={trigger}
          type="button"
          aria-label={label}
          aria-haspopup="dialog"
          aria-expanded={opened}
          aria-keyshortcuts={shortcut && mac !== null ? `${mac ? 'Meta' : 'Control'}+${shortcut.toUpperCase()}` : undefined}
          onClick={open}
          className={`wui-lens wui-lens-trigger ${className}`}
        >
          <span className="wui-lens-field">
            {icon}
            <span className="wui-lens-placeholder">{placeholder}</span>
            {keys}
          </span>
        </button>
        {client &&
          createPortal(
            <div data-open={opened || undefined} className="wui-lens-palette">
              <div aria-hidden="true" className="wui-lens-scrim" onPointerDown={() => close()} />
              <div ref={sheet} role="dialog" aria-label={label} inert={!opened} className="wui-lens wui-lens-sheet">
                <label className="wui-lens-field">
                  {icon}
                  <input
                    ref={input}
                    type="search"
                    role="combobox"
                    aria-label={label}
                    aria-expanded={opened}
                    aria-controls={`${id}-list`}
                    aria-autocomplete="list"
                    aria-activedescendant={opened && results.length ? `${id}-${current}` : undefined}
                    autoComplete="off"
                    spellCheck={false}
                    name={name}
                    placeholder={placeholder}
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value, event)
                      setActive(0)
                    }}
                    onKeyDown={onKeyDown}
                    onBlur={(event) => {
                      if (opened && !sheet.current?.contains(event.relatedTarget as Node)) close(false)
                    }}
                    className="wui-lens-input"
                  />
                  {keys}
                </label>
                {/* One board under the field: the actions, then the grouped
                    results, opening together as the circle. */}
                <div className="wui-lens-panel wui-lens-board">
                  {actions && !q && <div className="wui-lens-actions">{actions}</div>}
                  <ul ref={panel} id={`${id}-list`} role="listbox" aria-label={label} className="wui-lens-results" data-lenis-prevent="">
                    {rows}
                  </ul>
                </div>
              </div>
            </div>,
            document.body,
          )}
      </>
    )

  return (
    <div data-closed={closed ? '' : undefined} className={`wui-lens ${className}`}>
      <label className="wui-lens-field">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="wui-lens-icon">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4.5 4.5" />
        </svg>
        <input
          ref={input}
          type="search"
          role="combobox"
          aria-label={label}
          aria-expanded={focused && !closed}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={focused && !closed && results.length ? `${id}-${current}` : undefined}
          autoComplete="off"
          spellCheck={false}
          name={name}
          placeholder={placeholder}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value, event)
            setActive(0)
            setClosed(false)
          }}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false)
            setClosed(false)
          }}
          aria-keyshortcuts={shortcut && mac !== null ? `${mac ? 'Meta' : 'Control'}+${shortcut.toUpperCase()}` : undefined}
          className="wui-lens-input"
        />
        {shortcut && mac !== null && !query && (
          <span className="wui-lens-keys" aria-hidden="true">
            <kbd>{mac ? '⌘' : 'Ctrl'}</kbd>
            <kbd>{shortcut.toUpperCase()}</kbd>
          </span>
        )}
      </label>
      {list}
    </div>
  )
}
