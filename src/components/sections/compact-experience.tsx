import { compact } from '@/content/compact'
import { CompactBlock } from './compact-block'

/* Experience as two plain rows: where, what, and when. Only verified facts. */
export function CompactExperience() {
  return (
    <CompactBlock id="experience">
      <ul className="cp-list">
        {compact.experience.map((entry) => (
          <li key={entry.org} className="cp-line cp-line-plain">
            <span>{entry.org}</span>
            {/* An empty note keeps the row's columns where they are. */}
            <span className="cp-line-note">{entry.role}</span>
            <span className="cp-meta">{entry.when}</span>
          </li>
        ))}
      </ul>
    </CompactBlock>
  )
}
