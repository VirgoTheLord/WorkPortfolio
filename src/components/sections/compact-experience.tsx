import { compact } from '@/content/compact'
import { CompactSection } from './compact-section'

/*
 * Experience as plain rows: what kind (work, study), the organisation and the
 * role or degree, and "Current" with the red square where it is. No dates
 * and no descriptions: the project holds none, and none are made up.
 */
export function CompactExperience() {
  return (
    <CompactSection id="experience">
      <ol className="cp-rows">
        {compact.experience.map((entry) => (
          <li key={entry.org} className="cp-row">
            <p className="cp-row-label font-label">{entry.kind}</p>
            <div className="cp-row-body">
              <h3 className="cp-row-title">{entry.org}</h3>
              <p className="cp-row-text">{entry.role}</p>
            </div>
            {entry.current ? (
              <p className="cp-row-status font-label">
                <span aria-hidden="true" className="cp-square" />
                {compact.ui.current}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </CompactSection>
  )
}
