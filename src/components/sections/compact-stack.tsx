import { StackKeys } from '@/components/interactive/stack-keys'
import { compact } from '@/content/compact'
import { CompactBlock } from './compact-block'

/* The stack as small key caps; typing a tool's first letter presses its key. */
export function CompactStack() {
  return (
    <CompactBlock id="stack" aside={compact.stack.hint}>
      <StackKeys items={compact.stack.items} />
    </CompactBlock>
  )
}
