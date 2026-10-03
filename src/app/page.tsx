import { About } from '@/components/sections/about'
import { Contact } from '@/components/sections/contact'
import { Hero } from '@/components/sections/hero'
import { SelectedWork } from '@/components/sections/selected-work'
import { Skills } from '@/components/sections/skills'

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Skills />
      <SelectedWork />
      <Contact />
    </>
  )
}
