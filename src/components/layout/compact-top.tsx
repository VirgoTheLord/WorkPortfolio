import Link from 'next/link'
import { ContourSwitch } from '@/components/interactive/contour-switch'
import { HoodAvatar } from '@/components/interactive/hood-avatar'
import { LocalTime } from '@/components/interactive/local-time'
import { SearchHint } from '@/components/interactive/search-hint'
import { SiteSearch } from '@/components/interactive/site-search'
import { compact } from '@/content/compact'
import { site } from '@/content/site'

const { intro } = compact

/*
 * The compact site's top line (chloemaillot.fr's): the picture and the name,
 * which leads home, and the role, and the light/dark switch; under them a quiet line with the place and its time, and
 * how to search (⌘K).
 */
export function CompactTop() {
  return (
    <header className="cp-top">
      <Link href="/compact" className="cp-who">
        <HoodAvatar {...intro.avatar} />
        <span>
          <span className="cp-name block">{site.name}</span>
          <span className="block">{intro.role}</span>
        </span>
      </Link>
      <ContourSwitch {...compact.theme} />
      <div className="cp-top-meta cp-meta">
        <p>
          {intro.place} · <LocalTime zone={intro.time.zone} fallback={intro.time.fallback} />
        </p>
        <SearchHint label={compact.search.hint} touch={compact.search.touch} />
        {/* The palette itself: its trigger out of sight and out of the tab
            order; the hint and the shortcut open it. */}
        <div inert className="cp-search-hidden">
          <SiteSearch {...compact.search} />
        </div>
      </div>
    </header>
  )
}
