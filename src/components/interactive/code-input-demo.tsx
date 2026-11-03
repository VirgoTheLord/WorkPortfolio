'use client'

import { CodeInput } from '@/components/library/cairn/code-input'

/* The workbench stage's code input: 428913 is right, anything else is wrong. */
export function CodeInputDemo({ label, code }: { label: string; code: string }) {
  return <CodeInput label={label} onComplete={(value) => value === code} />
}
