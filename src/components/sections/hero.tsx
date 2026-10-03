import type { CSSProperties } from 'react'
import { hero } from '@/content/site'
import './hero.css'

const index = (i: number) => ({ '--i': i }) as CSSProperties

export function Hero() {
  const last = hero.statement.length - 1

  return (
    <section
      aria-labelledby="hero-heading"
      className="mx-auto flex min-h-svh w-full max-w-content flex-col justify-between gap-8 px-margin pt-11 pb-8 md:gap-10 md:pb-10"
    >
      <div className="relative">
        <div
          aria-hidden="true"
          className="hero-rule absolute inset-x-0 top-0 h-px bg-rule-strong"
        />
        <div className="flex items-center justify-between pt-4 font-label text-label text-fg-subtle uppercase">
          <p className="hero-meta flex items-center gap-3" style={index(0)}>
            <span aria-hidden="true" className="hero-green size-2 bg-accent" />
            {hero.eyebrow}
          </p>
          <p className="hero-meta tabular-nums" style={index(1)}>
            {hero.year}
          </p>
        </div>
      </div>

      <h1 id="hero-heading" className="font-display text-display-xl text-fg">
        {hero.statement.map((phrase, i) => (
          <span
            key={phrase}
            className={`hero-line block ${i === last ? 'text-accent' : ''}`}
            style={index(i)}
          >
            {phrase}{' '}
          </span>
        ))}
      </h1>

      <div className="grid grid-cols-4 items-end gap-x-gutter md:grid-cols-12">
        <div className="col-span-2 md:col-span-3">
          <div aria-hidden="true" className="hero-brass h-px w-16 bg-accent-secondary" />
          <p
            className="hero-support mt-4 font-label text-label font-medium text-fg tabular-nums"
            style={index(0)}
          >
            {hero.index.current}
            <span className="text-fg-subtle">{` / ${hero.index.total}`}</span>
          </p>
        </div>
        <div className="col-span-2 md:col-span-4 md:col-start-9">
          <p className="hero-support font-text text-base text-fg md:text-lg" style={index(1)}>
            {hero.name}
          </p>
          <p
            className="hero-support mt-1 font-label text-label text-fg-subtle uppercase"
            style={index(2)}
          >
            {hero.role}
          </p>
        </div>
      </div>
    </section>
  )
}
