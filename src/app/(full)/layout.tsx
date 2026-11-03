import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { PointerFx } from '@/components/motion/pointer-fx'
import { SmoothScroll } from '@/components/motion/smooth-scroll'
import '@/components/library/cairn/cairn-tokens.css'

/*
 * The full site's frame: the navbar, the footer, smooth scrolling and the pointer
 * effects, around the home page and /color-test. The compact site,
 * (compact), has none of them; both share the root layout's shell.
 */
export default function FullLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <SiteHeader />
      {/* tabIndex lets the skip link move focus into <main> in every browser; main is
          not interactive, so it gets no focus ring of its own. */}
      <main id="main" tabIndex={-1} className="flex-1 pt-header focus:outline-none">
        {children}
      </main>
      <SiteFooter />
      <SmoothScroll />
      <PointerFx />
    </>
  )
}
