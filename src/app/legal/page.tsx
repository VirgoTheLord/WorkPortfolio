import type { Metadata } from 'next'
import { TextLink } from '@/components/ui/text-link'
import { legal } from '@/content/legal'
import type { LegalBlock } from '@/types/content'
import '@/components/sections/legal.css'

export const metadata: Metadata = {
  title: legal.title,
  description: legal.description,
}

function Block({ block }: { block: LegalBlock }) {
  if (typeof block === 'string') return <p>{block}</p>
  return (
    <ul>
      {block.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

/*
 * Terms & privacy (/legal): a plain page to read (owner's call), outside both
 * sites' frames, so no navbar, footer or effects; one link leads home. The
 * title and date, a short introduction, the contents, then each part (terms,
 * privacy, credits) under its own heading. From lg the contents stand in a
 * narrow column on the left and stay in view.
 */
export default function LegalPage() {
  return (
    <main id="main" tabIndex={-1} className="legal focus:outline-none">
      <TextLink href={legal.home.href} className="legal-home font-label text-label uppercase">
        {legal.home.label}
      </TextLink>
      <article>
        <header className="legal-head">
          <h1 className="legal-title font-display">{legal.title}</h1>
          <p className="legal-updated font-label text-label text-fg-muted uppercase">
            {legal.updatedLabel} <time dateTime="2026-11-14">{legal.updated}</time>
          </p>
          <p className="legal-intro">{legal.intro}</p>
        </header>

        <div className="legal-grid">
          <nav aria-labelledby="legal-contents" className="legal-contents">
            <h2 id="legal-contents" className="font-label text-label text-fg-muted uppercase">
              {legal.contentsLabel}
            </h2>
            <ol>
              {legal.parts.map((part) => (
                <li key={part.id}>
                  <TextLink href={`#${part.id}`}>{part.title}</TextLink>
                </li>
              ))}
            </ol>
          </nav>

          <div className="legal-body">
            {legal.parts.map((part) => (
              <section
                key={part.id}
                id={part.id}
                aria-labelledby={`${part.id}-title`}
                className="legal-part"
              >
                <h2 id={`${part.id}-title`} className="legal-part-title font-display">
                  {part.title}
                </h2>
                {part.sections.map((section) => (
                  <section
                    key={section.id}
                    aria-labelledby={`${part.id}-${section.id}`}
                    className="legal-section"
                  >
                    <h3 id={`${part.id}-${section.id}`} className="legal-section-title">
                      {section.heading}
                    </h3>
                    {section.body.map((block, i) => (
                      <Block key={i} block={block} />
                    ))}
                  </section>
                ))}
              </section>
            ))}
          </div>
        </div>
      </article>
    </main>
  )
}
