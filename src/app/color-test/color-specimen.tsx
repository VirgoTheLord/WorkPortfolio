import { colorGroups, colorInUse } from '@/content/color-test'

const swatchClass = {
  bg: 'bg-bg',
  surface: 'bg-surface',
  'surface-2': 'bg-surface-2',
  fg: 'bg-fg',
  'fg-muted': 'bg-fg-muted',
  'fg-subtle': 'bg-fg-subtle',
  rule: 'bg-rule',
  'rule-strong': 'bg-rule-strong',
  accent: 'bg-accent',
  'accent-fg': 'bg-accent-fg',
  'accent-secondary': 'bg-accent-secondary',
} as const

export function ColorSpecimen() {
  const specimen = colorInUse

  return (
    <div className="mt-16 border-t border-rule pt-16">
      {colorGroups.map((group) => (
        <section key={group.id} aria-labelledby={`${group.id}-title`} className="mt-16 first:mt-0">
          <h2
            id={`${group.id}-title`}
            className="font-label text-label font-medium text-fg uppercase"
          >
            {group.name}
          </h2>
          <p className="mt-3 max-w-measure font-text text-base text-fg-muted">{group.note}</p>
          <ul className="mt-8 grid grid-cols-2 gap-x-gutter gap-y-8 sm:grid-cols-3">
            {group.swatches.map((swatch) => (
              <li key={swatch.token}>
                <div
                  aria-hidden="true"
                  className={`h-16 border border-rule-strong ${swatchClass[swatch.token]}`}
                />
                <p className="mt-3 font-label text-label text-fg">{swatch.name}</p>
                <p className="mt-1 font-label text-label text-fg-subtle">{swatch.token}</p>
                <p className="mt-1 font-text text-sm text-fg-muted">{swatch.role}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section aria-labelledby="in-use-title" className="mt-16 border-t border-rule pt-16">
        <h2 id="in-use-title" className="font-label text-label font-medium text-fg uppercase">
          {specimen.label}
        </h2>
        <div className="mt-12 grid gap-y-8 md:grid-cols-12 md:gap-x-gutter">
          <div className="md:col-span-3">
            <p className="font-display text-3xl text-accent-secondary lining-nums tabular-nums">
              {specimen.index}
            </p>
            <div aria-hidden="true" className="mt-4 h-px w-16 bg-accent-secondary" />
            <p className="mt-3 flex items-center gap-3 font-label text-label text-fg-subtle tabular-nums">
              <span aria-hidden="true" className="size-2 bg-accent-secondary" />
              {specimen.count}
            </p>
          </div>
          <div className="min-w-0 md:col-span-9">
            <h3 className="font-display text-3xl text-fg">{specimen.title}</h3>
            <p className="mt-3 font-label text-label font-medium text-fg-subtle uppercase tabular-nums">
              {specimen.metadata}
            </p>
            <p className="mt-4 max-w-measure font-text text-lg text-fg-muted">
              {specimen.description}
            </p>
            <p className="mt-6">
              <a
                href="#in-use-title"
                className="font-text text-base text-fg underline decoration-accent underline-offset-4 hover:text-accent"
              >
                {specimen.link}
              </a>
            </p>
          </div>
        </div>

        <div className="mt-16 bg-accent px-6 py-12 text-accent-fg md:px-12 md:py-16">
          <p className="font-label text-label font-medium uppercase">{specimen.roomLabel}</p>
          <p className="mt-6 font-display text-3xl">{specimen.title}</p>
          <p className="mt-4 max-w-measure font-text text-base">{specimen.description}</p>
        </div>
      </section>
    </div>
  )
}
