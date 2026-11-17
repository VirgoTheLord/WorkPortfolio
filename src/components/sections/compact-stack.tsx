import { compact } from '@/content/compact'
import { CompactBlock } from './compact-block'

/* The stack as small key caps, a plain list (owner's call: no typing game). */
export function CompactStack() {
  return (
    <CompactBlock id="stack">
      <ul className="cp-keycaps">
        {compact.stack.items.map((item) => (
          <li key={item}>
            <kbd className="cp-keycap">{item}</kbd>
          </li>
        ))}
      </ul>
    </CompactBlock>
  )
}
