import Image from 'next/image'
import { projects } from '@/content/projects'
import { brand, specimen, type Mode } from '@/content/color-test'
import { contrast, verdict } from './contrast'

const label = 'font-label text-label uppercase'
const chip = `${label} inline-flex items-center border px-3 py-1`
const project = projects[0]

/* Real token classes for the swatches, so the map shows the production values. */
const swatchClass: Record<string, string> = {
  bg: 'bg-bg',
  fg: 'bg-fg',
  'fg-muted': 'bg-fg-muted',
  'fg-subtle': 'bg-fg-subtle',
  surface: 'bg-surface',
  'surface-2': 'bg-surface-2',
  rule: 'bg-rule',
  'rule-strong': 'bg-rule-strong',
  accent: 'bg-accent',
  'accent-secondary': 'bg-accent-secondary',
  'accent-fg': 'bg-accent-fg',
  focus: 'bg-focus',
}

const brandClass: Record<string, string> = {
  'green-deep': 'bg-green-deep',
  'green-mid': 'bg-green-mid',
  'green-soft': 'bg-green-soft',
  'green-light': 'bg-green-light',
}

const typeScale = [
  ['display-xl', 'text-display-xl', 'Detail'],
  ['display', 'text-display', 'Detail'],
  ['3xl', 'text-3xl', 'Selected work'],
  ['2xl', 'text-2xl', 'Selected work'],
  ['xl', 'text-xl', 'Selected work'],
  ['lg', 'text-lg', 'A project, in one sentence'],
  ['base', 'text-base', 'Body text sits here, at a comfortable size.'],
  ['sm', 'text-sm', 'Small text for captions and notes.'],
] as const

type Props = { mode: Mode }

export function PaletteSample({ mode }: Props) {
  const id = `direction-${mode.id}`
  const hex = Object.fromEntries(mode.tokens.map((t) => [t.token, t.hex])) as Record<string, string>
  const get = (token: string) => hex[token] as string

  const rows = [
    { pair: 'fg on bg', use: 'Headings and body', fg: get('fg'), bg: get('bg') },
    { pair: 'fg-muted on bg', use: 'Secondary text', fg: get('fg-muted'), bg: get('bg') },
    { pair: 'fg-subtle on bg', use: 'Metadata and labels', fg: get('fg-subtle'), bg: get('bg') },
    { pair: 'accent on bg', use: 'Links, numerals, accent text', fg: get('accent'), bg: get('bg') },
    {
      pair: 'accent-fg on accent',
      use: 'Strong field, primary button',
      fg: get('accent-fg'),
      bg: get('accent'),
    },
    { pair: 'fg on surface', use: 'Text on mats and plates', fg: get('fg'), bg: get('surface') },
    {
      pair: 'accent-secondary on bg',
      use: 'Marks, bars, oversized numerals',
      fg: get('accent-secondary'),
      bg: get('bg'),
    },
    { pair: 'focus on bg', use: 'Focus ring (needs 3:1)', fg: get('focus'), bg: get('bg') },
    { pair: 'rule on bg', use: 'Hairlines (decorative)', fg: get('rule'), bg: get('bg') },
    { pair: 'rule-strong on bg', use: 'Emphasized rules', fg: get('rule-strong'), bg: get('bg') },
  ]
    .filter((row, i, all) => all.findIndex((o) => o.fg === row.fg && o.bg === row.bg) === i)
    .map((row) => ({ ...row, ratio: contrast(row.fg, row.bg) }))

  const primaryBtn = `${label} inline-flex min-h-11 items-center border border-accent bg-accent px-5 text-accent-fg transition-colors duration-base hover:bg-bg hover:text-accent hover:duration-fast focus-visible:bg-bg focus-visible:text-accent`
  const secondaryBtn = `${label} inline-flex min-h-11 items-center border border-fg px-5 text-fg transition-colors duration-base hover:bg-fg hover:text-bg hover:duration-fast focus-visible:bg-fg focus-visible:text-bg`
  const link =
    'text-fg underline decoration-accent-secondary decoration-2 underline-offset-4 transition-colors duration-base hover:decoration-accent hover:decoration-4 hover:duration-fast focus-visible:decoration-accent focus-visible:decoration-4'
  const tab = `${label} inline-flex min-h-11 items-center gap-2 border-b-2 border-transparent px-4 transition-colors duration-base hover:border-fg aria-[current=true]:border-accent-secondary aria-[current=true]:bg-accent aria-[current=true]:text-accent-fg`

  return (
    <section
      id={id}
      data-theme={mode.theme}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-header border-t border-rule bg-bg pt-16 pb-section-y text-fg"
    >
      <div className="mx-auto max-w-content px-margin">
        {/* Palette header */}
        <p className={`${label} text-fg-subtle`}>{mode.label}</p>
        <h2 id={`${id}-title`} className="mt-3 font-display text-2xl">
          {mode.title}
        </h2>
        <p className="mt-4 max-w-measure font-text text-base text-fg-muted">{mode.note}</p>
        <ul className="mt-8 grid grid-cols-2 border border-rule md:grid-cols-4">
          {brand.map((b) => (
            <li key={b.hex}>
              <div className={`h-24 md:h-32 ${brandClass[b.token]}`} />
              <div className="px-3 py-3">
                <p className={`${label} font-medium`}>{b.name}</p>
                <p className={`${label} text-fg-subtle tabular-nums`}>{b.hex}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className={`${label} mt-6 text-fg-subtle`}>
          {mode.theme === 'dark' ? 'Mode colors, not brand colors' : 'Canvas'}
        </p>
        <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
          {mode.modeColors.map((m) => (
            <li key={m.name} className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="size-6 border border-rule"
                style={{ backgroundColor: m.hex }}
              />
              <span className={`${label} tabular-nums`}>
                {m.name} <span className="text-fg-subtle">{m.hex}</span>
              </span>
            </li>
          ))}
        </ul>

        {/* Token map */}
        <h3 className="mt-12 font-display text-xl">Semantic tokens</h3>
        <ul className="mt-4 grid gap-gutter sm:grid-cols-2 lg:grid-cols-4">
          {mode.tokens.map((t) => (
            <li key={t.token} className="flex items-center gap-3 border-t border-rule pt-3">
              <span
                aria-hidden="true"
                className={`size-10 shrink-0 border border-rule ${swatchClass[t.token]}`}
              />
              <span>
                <span className={`${label} block font-medium`}>{t.token}</span>
                <span className={`${label} block text-fg-subtle tabular-nums`}>{t.hex}</span>
                <span className="block font-text text-sm text-fg-muted">{t.role}</span>
              </span>
            </li>
          ))}
        </ul>

        {/* Hero specimen */}
        <div className="mt-12 border border-rule">
          <div className="flex items-center justify-between gap-6 border-b border-rule px-5 py-4 md:px-8">
            <p className={`${label} font-medium`}>{specimen.name}</p>
            <nav aria-label={`${mode.title} sample navigation`} className="hidden gap-6 md:flex">
              {specimen.nav.map((item) => (
                <a key={item} href={`#${id}`} className={`${label} ${link}`}>
                  {item}
                </a>
              ))}
            </nav>
            <p className={`${label} flex items-center gap-3 text-fg-subtle tabular-nums`}>
              <span aria-hidden="true" className="size-2 bg-accent-secondary" />
              {specimen.year}
            </p>
          </div>
          <div className="grid gap-8 px-5 py-10 md:grid-cols-12 md:gap-gutter md:px-8 md:py-14">
            <div className="md:col-span-8">
              <p className={`${label} text-fg-subtle`}>{specimen.eyebrow}</p>
              <p className="mt-6 font-display text-display text-balance text-accent">
                <span className="text-fg">{specimen.statement[0]}</span>{' '}
                <span className="relative inline-block">
                  {specimen.statement[1]}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-1 h-1.5 bg-accent-secondary"
                  />
                </span>
              </p>
              <div aria-hidden="true" className="mt-10 flex items-center gap-3">
                <span className="h-1.5 w-16 bg-accent-secondary" />
                <span className="h-px flex-1 bg-rule-strong" />
              </div>
              <p
                className={`${label} mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-fg-subtle`}
              >
                <span>{specimen.name}</span>
                <span>{specimen.role}</span>
                <span className="tabular-nums">{specimen.index}</span>
              </p>
            </div>
            <div className="flex min-h-56 flex-col justify-between bg-accent p-5 text-accent-fg md:col-span-4 md:min-h-0 md:p-6">
              <p className={label}>{specimen.eyebrow}</p>
              <p className="font-display text-display-xl tabular-nums">01</p>
              <p className={`${label} flex items-center justify-between`}>
                <span>{project?.category}</span>
                <span aria-hidden="true" className="size-3 rounded-full bg-accent-secondary" />
              </p>
            </div>
          </div>
        </div>

        {/* Editorial specimen */}
        <div className="mt-10 grid gap-8 border border-rule px-5 py-10 md:grid-cols-12 md:gap-gutter md:px-8 md:py-14">
          <div className="md:col-span-3">
            <p className="font-display text-3xl text-accent tabular-nums">02</p>
            <p className={`${label} mt-2 text-fg-subtle`}>About</p>
          </div>
          <div className="md:col-span-9">
            <h3 className="max-w-3xl font-display text-2xl">{specimen.heading}</h3>
            <p className="mt-5 max-w-measure font-text text-base text-fg-muted">
              {specimen.body}{' '}
              <a href={`#${id}`} className={link}>
                A text link
              </a>
            </p>
            <dl className="mt-8 grid gap-x-gutter gap-y-6 sm:grid-cols-3">
              {specimen.details.map(([term, detail]) => (
                <div key={term} className="border-t-2 border-fg pt-3">
                  <dt className={`${label} text-fg-subtle`}>{term}</dt>
                  <dd className="mt-1 font-text text-base">{detail}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 flex flex-wrap gap-2">
              <span className={`${chip} border-fg`}>{specimen.year}</span>
              <span className={`${chip} border-transparent ${mode.cls.chip}`}>Label</span>
              <span className={`${chip} border-rule`}>Catalogue</span>
            </div>
          </div>
        </div>

        {/* Selected Work specimen */}
        {project ? (
          <div className="mt-10 grid gap-8 border border-rule px-5 py-10 md:grid-cols-12 md:gap-gutter md:px-8 md:py-14">
            <a href={`#${id}`} className="group block md:col-span-7">
              <span className="flex">
                <span aria-hidden="true" className={`w-3 shrink-0 md:w-5 ${mode.cls.fx}`} />
                <span className="block flex-1 border border-rule bg-surface p-3 transition-colors duration-base group-hover:border-fg group-hover:duration-fast group-focus-visible:border-fg md:p-5">
                  <span className="relative block aspect-wide overflow-hidden">
                    <Image
                      src={project.cover.image}
                      alt={project.cover.alt}
                      fill
                      sizes="(min-width: 768px) 56vw, 92vw"
                      className="object-cover"
                    />
                  </span>
                </span>
              </span>
              <span className={`${label} mt-3 flex items-center gap-3 text-fg-subtle`}>
                <span aria-hidden="true" className="h-1 w-6 bg-accent-secondary" />
                Fig. 01
              </span>
            </a>
            <div className="flex flex-col justify-between gap-8 md:col-span-5">
              <div>
                <p className="font-display text-display text-accent tabular-nums">01</p>
                <h3 className="mt-4 font-display text-2xl">{project.title}</h3>
                <p className="mt-3 font-text text-base text-fg-muted">{project.summary}</p>
                <p className={`${label} mt-6 flex flex-wrap gap-x-4 gap-y-1 text-fg-subtle`}>
                  <span>{project.category}</span>
                  <span className="tabular-nums">{project.year}</span>
                </p>
                <p className={`${label} mt-1 text-fg-subtle`}>{project.stack.join(', ')}</p>
              </div>
              <a href={`#${id}`} className={`${label} ${link} self-start`}>
                View project →
              </a>
            </div>
          </div>
        ) : null}

        {/* Interactive states */}
        <div className="mt-10 border border-rule px-5 py-8 md:px-8">
          <p className={`${label} text-fg-subtle`}>Controls: rest, hover, focus, selected</p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <a href={`#${id}`} className={primaryBtn}>
              Primary
            </a>
            <a href={`#${id}`} className={secondaryBtn}>
              Secondary
            </a>
            <span
              className={`${label} inline-flex min-h-11 items-center border border-accent bg-bg px-5 text-accent`}
            >
              Primary · hover
            </span>
            <span
              className={`${label} inline-flex min-h-11 items-center border border-fg bg-fg px-5 text-bg`}
            >
              Secondary · hover
            </span>
            <span
              className={`${label} inline-flex min-h-11 items-center border border-accent bg-accent px-5 text-accent-fg outline-2 outline-offset-3 outline-focus`}
            >
              Focus ring
            </span>
            <a href={`#${id}`} className={`font-text text-base ${link}`}>
              A text link
            </a>
            <span className="font-text text-base text-fg underline decoration-accent decoration-4 underline-offset-4">
              Link · hover
            </span>
          </div>
          <nav aria-label={`${mode.title} selected state`} className="mt-6 flex flex-wrap">
            <a href={`#${id}`} aria-current="true" className={tab}>
              <span aria-hidden="true" className="size-2 bg-current" />
              Selected
            </a>
            <a href={`#${id}`} className={tab}>
              Rest
            </a>
            <span className={`${tab} border-fg`}>Hover</span>
          </nav>
        </div>

        {/* Large color fields */}
        <div className="mt-10 border border-rule">
          <div className="bg-accent px-5 py-12 text-accent-fg md:px-8 md:py-20">
            <p className={label}>01 — {specimen.eyebrow}</p>
            <p className="mt-4 font-display text-display-xl">{specimen.band}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className={`${chip} border-current`}>Currently building</span>
              <span className={`${chip} border-current`}>{specimen.year}</span>
            </div>
          </div>
          <div
            className={`flex flex-wrap items-end justify-between gap-6 px-5 py-10 md:px-8 md:py-14 ${mode.cls.band2}`}
          >
            <p className="font-display text-display">Fig. 01 — 03</p>
            <p className="font-display text-2xl">{specimen.statement.join(' ')}</p>
          </div>
          <div className="overflow-hidden px-5 py-8 md:px-8">
            <p
              aria-hidden="true"
              className="font-display text-display-xl leading-none text-accent-secondary tabular-nums"
            >
              01 02 03
            </p>
            <p className={`${label} mt-4 text-fg-subtle`}>
              Oversized numerals, secondary green, decorative
            </p>
          </div>
        </div>

        {/* Typography hierarchy */}
        <h3 className="mt-12 font-display text-xl">Typography hierarchy</h3>
        <ul className="mt-4 border-t border-rule">
          {typeScale.map(([name, cls, sample]) => (
            <li
              key={name}
              className="grid items-baseline gap-2 border-b border-rule py-4 md:grid-cols-12 md:gap-gutter"
            >
              <span className={`${label} text-fg-subtle md:col-span-2`}>{name}</span>
              <span className={`font-display ${cls} md:col-span-10`}>{sample}</span>
            </li>
          ))}
          <li className="grid items-baseline gap-2 border-b border-rule py-4 md:grid-cols-12 md:gap-gutter">
            <span className={`${label} text-fg-subtle md:col-span-2`}>label</span>
            <span className={`${label} font-medium md:col-span-10`}>
              Index 01 / 03 · Catalogue · 2026
            </span>
          </li>
        </ul>

        {/* Contrast */}
        <h3 className="mt-12 font-display text-xl">Contrast, as applied</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-xl border-collapse text-left font-text text-sm">
            <thead>
              <tr className={`border-b border-fg ${label} text-fg-subtle`}>
                <th scope="col" className="py-2 pr-4 font-medium">
                  Pair
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  Used for
                </th>
                <th scope="col" className="py-2 pr-4 font-medium tabular-nums">
                  Ratio
                </th>
                <th scope="col" className="py-2 font-medium">
                  Result
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.fg}${row.bg}`} className="border-b border-rule">
                  <th scope="row" className="py-2 pr-4 font-normal">
                    <span
                      aria-hidden="true"
                      className="mr-2 inline-flex h-4 w-8 items-center justify-center border border-rule align-middle"
                      style={{ backgroundColor: row.bg, color: row.fg }}
                    >
                      <span className="font-label text-xs leading-none">Aa</span>
                    </span>
                    {row.pair}
                  </th>
                  <td className="py-2 pr-4 text-fg-muted">{row.use}</td>
                  <td className="py-2 pr-4 tabular-nums">{row.ratio.toFixed(2)}:1</td>
                  <td className="py-2">{verdict(row.ratio)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-4 max-w-measure list-disc pl-5 font-text text-sm text-fg-muted">
          {mode.limits.map((limit) => (
            <li key={limit}>{limit}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
