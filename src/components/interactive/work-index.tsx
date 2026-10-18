'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import type { ProjectMeta } from '@/types/content'
import './work-index.css'

const index = (i: number) => String(i + 1).padStart(2, '0')

/*
 * The compact site's work index (work-index.css), DESIGN.md §5's project index:
 * numbered rows (index, title, category, year) between hairlines, and on wide
 * screens a preview of the project's cover in a fixed slot beside the list,
 * shown while a row is hovered or focused and crossfading between them; it never
 * follows the cursor. Where there is no room for the slot, and on touch, each row
 * shows its cover small and statically instead, so nothing is hover-only. A row
 * goes to the project's page when it has one, and until then to its card on the
 * full site.
 */
export function WorkIndex({ projects }: { projects: readonly ProjectMeta[] }) {
  const [active, setActive] = useState<number | null>(null)

  return (
    <div className="work-index">
      <ol className="work-index-list">
        {projects.map((project, i) => (
          <li key={project.slug}>
            <Link
              href={project.href ?? `/#work-${project.slug}`}
              className="work-index-row"
              data-active={active === i || undefined}
              onPointerEnter={(event) => {
                if (event.pointerType === 'mouse') setActive(i)
              }}
              onPointerLeave={(event) => {
                if (event.pointerType === 'mouse') setActive(null)
              }}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
            >
              <span className="work-index-num font-label text-label">{index(i)}</span>
              <span className="work-index-title">{project.title}</span>
              <span className="work-index-meta font-label text-label">
                {project.category} · {project.year}
              </span>
              <span className="work-index-thumb">
                <Image
                  src={project.cover.image}
                  alt=""
                  sizes="6rem"
                  placeholder="blur"
                  className="object-cover object-top"
                  fill
                />
              </span>
            </Link>
          </li>
        ))}
      </ol>
      {/* The slot: every cover stacked, the active one shown. Decorative: each
          row is already named by its title. */}
      <div aria-hidden="true" className="work-index-slot">
        {projects.map((project, i) => (
          <span
            key={project.slug}
            className="work-index-slide"
            data-active={active === i || undefined}
          >
            <Image
              src={project.cover.image}
              alt=""
              sizes="22rem"
              placeholder="blur"
              className="object-cover object-top"
              fill
            />
          </span>
        ))}
      </div>
    </div>
  )
}
