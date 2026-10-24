'use client'

import { useSyncExternalStore } from 'react'

type Props = {
  /** The owner's IANA time zone. */
  zone: string
  /** Shown from the server and without script ("IST, UTC+05:30"). */
  fallback: string
  /** Also say how far it is from the visitor's own time. */
  gap?: boolean
}

/* The zone's offset from UTC in minutes, from its "GMT+05:30" name. */
function offsetOf(zone: string, at: Date) {
  const name =
    new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'longOffset' })
      .formatToParts(at)
      .find((part) => part.type === 'timeZoneName')?.value ?? 'GMT'
  const match = /GMT([+-])(\d{2}):(\d{2})/.exec(name)
  if (!match) return 0
  const minutes = Number(match[2]) * 60 + Number(match[3])
  return match[1] === '-' ? -minutes : minutes
}

/* "4h 30m ahead of you", "1h behind you", or "the same as yours". */
function difference(minutes: number) {
  if (minutes === 0) return 'the same as yours'
  const abs = Math.abs(minutes)
  const h = Math.floor(abs / 60)
  const m = abs % 60
  const span = [h ? `${h}h` : '', m ? `${m}m` : ''].filter(Boolean).join(' ')
  return `${span} ${minutes > 0 ? 'ahead of you' : 'behind you'}`
}

/* A store of the current minute: it changes once a minute, aligned to the clock. */
function subscribe(onChange: () => void) {
  let interval = 0
  const timeout = window.setTimeout(
    () => {
      onChange()
      interval = window.setInterval(onChange, 60_000)
    },
    60_000 - (Date.now() % 60_000),
  )
  return () => {
    window.clearTimeout(timeout)
    window.clearInterval(interval)
  }
}
const minute = () => Math.floor(Date.now() / 60_000)
const none = () => null

/*
 * The owner's local time, and with `gap` how far it is from the visitor's
 * (karthikponna.me's clock, said in words). Updated on the minute; nothing runs
 * in between. The server renders the zone's name, which is also what a visitor
 * without script reads.
 */
export function LocalTime({ zone, fallback, gap = false }: Props) {
  const current = useSyncExternalStore(subscribe, minute, none)
  if (current === null) return <>{fallback}</>

  const now = new Date(current * 60_000)
  const time = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    hour: 'numeric',
    minute: '2-digit',
  }).format(now)
  const visitor = -now.getTimezoneOffset()
  // The colon blinks like a desk clock's (compact.css); it is still read as one time.
  const [hours = '', rest = ''] = time.split(':')

  return (
    <>
      <time dateTime={now.toISOString()}>
        {hours}
        <span aria-hidden="true" className="cp-blink">
          :
        </span>
        {rest}
      </time>
      {gap ? (
        <span className="text-fg-muted">, {difference(offsetOf(zone, now) - visitor)}</span>
      ) : null}
    </>
  )
}
