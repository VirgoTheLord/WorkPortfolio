import { compact } from '@/content/compact'
import { CompactSection } from './compact-section'

/*
 * The stack as a small technical index: a group's name in the label face, its
 * tools after it as plain, searchable words. No logos, levels or bars.
 */
export function CompactStack() {
  const count = compact.stack.reduce((sum, group) => sum + group.items.length, 0)
  return (
    <CompactSection id="stack" meta={`${count} tools`}>
      <dl className="cp-rows">
        {compact.stack.map((group) => (
          <div key={group.name} className="cp-row">
            <dt className="cp-row-label font-label">{group.name}</dt>
            <dd className="cp-row-body">
              <ul className="cp-stack">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
    </CompactSection>
  )
}
