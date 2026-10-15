import type { Metadata } from 'next'
import { SkillsClosing } from '@/components/sections/skills-closing'
import { SkillsGroups } from '@/components/sections/skills-groups'
import { SkillsHero } from '@/components/sections/skills-hero'
import { SkillsIntro } from '@/components/sections/skills-intro'
import { skillsPage } from '@/content/skills'

export const metadata: Metadata = {
  title: skillsPage.meta.title,
  description: skillsPage.meta.description,
}

export default function SkillsPage() {
  return (
    <>
      <SkillsHero />
      <SkillsIntro />
      <SkillsGroups />
      <SkillsClosing />
    </>
  )
}
