import type { SkillsContent } from '@/types/content'

/*
 * The home section's rows: the owner's skills, each with what he uses it for
 * (owner's call, November 2026: a self-rated level read as a grade) and its
 * tool's mark (MERN shows its four).
 * JavaScript and Tailwind CSS are left out, too common to say anything, and Go
 * is in (owner's call, November 2026).
 */
export const skills = {
  headline: ['Stuff I’m', 'good at'],
  swipeHint: 'Flick a card',
  rows: [
    { name: 'React', detail: 'Interfaces', logos: ['react'] },
    { name: 'TypeScript', detail: 'Everything, typed', logos: ['typescript'] },
    { name: 'Next.js', detail: 'Sites and apps', logos: ['next'] },
    { name: 'Go', detail: 'Services and tools', logos: ['go'] },
    { name: 'GSAP', detail: 'Motion', logos: ['gsap'] },
    { name: 'MERN', detail: 'Full-stack apps', logos: ['mongodb', 'express', 'react', 'node'] },
    { name: 'Figma', detail: 'Design before code', logos: ['figma'] },
  ],
} satisfies SkillsContent
