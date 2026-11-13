import type { SkillsContent } from '@/types/content'

/*
 * The home section's rows: the owner's skills and levels, as the previous
 * portfolio listed them, each with its tool's mark (MERN shows its four).
 */
export const skills = {
  headline: ['Stuff I’m', 'good at'],
  swipeHint: 'Flick a card',
  rows: [
    { name: 'React', detail: 'Expert', logos: ['react'] },
    { name: 'TypeScript', detail: 'Intermediate', logos: ['typescript'] },
    { name: 'Next.js', detail: 'Intermediate', logos: ['next'] },
    { name: 'GSAP', detail: 'Intermediate', logos: ['gsap'] },
    { name: 'MERN', detail: 'Expert', logos: ['mongodb', 'express', 'react', 'node'] },
    { name: 'JavaScript', detail: 'Intermediate', logos: ['javascript'] },
    { name: 'Tailwind CSS', detail: 'Expert', logos: ['tailwind'] },
    { name: 'Figma', detail: 'Intermediate', logos: ['figma'] },
  ],
} satisfies SkillsContent
