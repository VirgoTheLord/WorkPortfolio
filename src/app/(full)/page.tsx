import { CompactNotice } from '@/components/interactive/compact-notice'
import { HeroIntro } from '@/components/motion/hero-intro'
import { About } from '@/components/sections/about'
import { Contact } from '@/components/sections/contact'
import { Hero } from '@/components/sections/hero'
import { SelectedWork } from '@/components/sections/selected-work'
import { Skills } from '@/components/sections/skills'
import { compactNotice } from '@/content/site'

export default function HomePage() {
  return (
    <>
      <HeroIntro />
      <CompactNotice {...compactNotice} />
      <Hero />
      <About />
      <Skills />
      <SelectedWork />
      <Contact />
    </>
  )
}
