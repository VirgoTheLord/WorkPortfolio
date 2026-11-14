import Link from 'next/link'
import type { Metadata } from 'next'
import { LegalRail } from '@/components/interactive/legal-rail'
import { TextLink } from '@/components/ui/text-link'
import { legal } from '@/content/legal'
import { contact, site } from '@/content/site'
import type { LegalBlock } from '@/types/content'
import '@/components/sections/legal.css'

export const metadata: Metadata = {
  title: legal.title,
  description: legal.description,
}

/* A paragraph, with the address in it made a link to write to. */
function Text({ text }: { text: string }) {
  const [before, ...rest] = text.split(contact.email)
  if (!rest.length) return text
  return (
    <>
      {before}
      <TextLink href={`mailto:${contact.email}`} className="text-fg">
        {contact.email}
      </TextLink>
      {rest.join(contact.email)}
    </>
  )
}

function Block({ block }: { block: LegalBlock }) {
  if (typeof block === 'string')
    return (
      <p>
        <Text text={block} />
      </p>
    )
  return (
    <ul>
      {block.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

/*
 * Terms & privacy (/legal), the index-rail layout (owner's pick from four): a
 * plain page outside both sites' frames. A slim line across the top (the name,
 * the way home), then, from lg, every clause listed in a rail on the left that
 * marks the one being read (interactive/legal-rail.tsx) beside one reading
 * column: the title, the date and place, the introduction, the three points in
 * short, then each part and its clauses. On a phone the rail gives way to the
 * parts listed under the introduction.
 */
export default function LegalPage() {
  return (
    <div className="legal">
      <header className="legal-top">
        <Link href={legal.home.href} className="legal-name font-display">
          {site.name}
        </Link>
        <TextLink href={legal.home.href} className="font-label text-label uppercase">
          {legal.home.label}
        </TextLink>
      </header>

      <div className="legal-frame">
        <aside className="legal-aside">
          <LegalRail label={legal.contentsLabel} parts={legal.parts} />
        </aside>

        <main id="main" tabIndex={-1} className="legal-main focus:outline-none">
          <h1 className="legal-title font-display">{legal.title}</h1>
          <p className="legal-meta font-label text-label text-fg-muted uppercase">
            <span>
              {legal.updatedLabel} <time dateTime="2026-11-14">{legal.updated}</time>
            </span>
            <span>{legal.place}</span>
          </p>
          <p className="legal-intro">{legal.intro}</p>

          <section aria-labelledby="legal-summary" className="legal-summary">
            <h2 id="legal-summary" className="font-label text-label text-fg-muted uppercase">
              {legal.summary.label}
            </h2>
            <ul>
              {legal.summary.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </section>

          {/* On a phone, in the rail's place: the parts. */}
          <nav aria-label={legal.partsLabel} className="legal-parts">
            <ol>
              {legal.parts.map((part) => (
                <li key={part.id}>
                  <TextLink href={`#${part.id}`}>{part.title}</TextLink>
                </li>
              ))}
            </ol>
          </nav>

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
              {part.sections.map((section) => {
                const id = `${part.id}-${section.id}`
                return (
                  <section
                    key={id}
                    id={id}
                    aria-labelledby={`${id}-title`}
                    className="legal-clause"
                  >
                    <h3 id={`${id}-title`} className="legal-clause-title">
                      {section.heading}
                    </h3>
                    {section.body.map((block, i) => (
                      <Block key={i} block={block} />
                    ))}
                  </section>
                )
              })}
            </section>
          ))}

          <footer className="legal-end font-label text-label text-fg-muted uppercase">
            <span>
              © {site.year} {site.name}
            </span>
            <TextLink href="#main">{legal.toTop}</TextLink>
          </footer>
        </main>
      </div>
    </div>
  )
}
