import { typeTestPage, typeTestSpecimen } from '@/content/type-test'

export function TypeSpecimen() {
  const specimen = typeTestSpecimen

  return (
    <section
      id="specimen"
      aria-labelledby="specimen-name"
      className="mt-16 border-t border-rule pt-16"
    >
      <h2 id="specimen-name" className="flex flex-col gap-1 font-label text-label text-fg-subtle">
        {typeTestPage.faces.map((face) => (
          <span key={face.name}>
            <span className="text-fg">{face.name}</span>
            {` · ${face.role}`}
          </span>
        ))}
      </h2>

      <p className="mt-12 font-display text-display-xl text-fg">{specimen.hero}</p>

      <h3 className="mt-16 font-display text-3xl text-fg">{specimen.projectTitle}</h3>
      <p className="mt-4 font-label text-label font-medium text-fg-subtle uppercase tabular-nums">
        {specimen.metadata}
      </p>
      <p className="mt-6 max-w-measure font-text text-lg text-fg-muted">{specimen.description}</p>

      <h4 className="mt-16 font-display text-xl text-fg">{specimen.heading}</h4>
      <p className="mt-4 max-w-measure font-text text-base text-fg">{specimen.paragraph}</p>
      <p className="mt-6 font-label text-label text-fg-subtle tabular-nums">
        {specimen.annotation}
      </p>

      <ul className="mt-16 grid grid-cols-2 gap-x-gutter gap-y-10 md:grid-cols-4">
        {specimen.metrics.map((metric) => (
          <li key={metric.label}>
            <p className="font-display text-2xl text-fg lining-nums tabular-nums">{metric.value}</p>
            <p className="mt-2 font-label text-label text-fg-subtle">{metric.label}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
