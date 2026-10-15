import { HeroCells } from '@/components/motion/hero-cells'
import { HeroGrid } from '@/components/motion/hero-grid'
import { FrameButton } from '@/components/library/frame-button'
import { hero } from '@/content/site'
import './hero.css'

/*
 * The opening composition, on one centre line: the name on one line, as wide
 * as the hero, a line under it and the action, centred in the screen. Spacing, type and the entrance follow the good-fella.com
 * hero. The navbar (components/layout/site-header.tsx) floats over the top edge.
 *
 * Every element carries the hooks the intro animates (components/motion/
 * hero-intro.tsx). Without the intro they are inert and this is the final state.
 */
export function Hero() {
  return (
    <section
      data-hero
      aria-labelledby="hero-heading"
      className="hero relative isolate overflow-hidden bg-canvas text-fg"
    >
      <HeroGrid />
      <div className="hero-push">
        <div className="hero-frame">
          <div className="hero-copy">
            <div className="hero-main">
              <h1 id="hero-heading" className="hero-title font-hero">
                {hero.title.map((line, i) => (
                  <span key={line}>
                    {i > 0 ? <br /> : null}
                    <span className="hero-line">
                      <span data-hero-text className="hero-line-text">
                        {line}
                      </span>
                      <HeroCells />
                      <span
                        aria-hidden="true"
                        data-hero-block="lead"
                        className="hero-block bg-accent"
                      />
                      <span
                        aria-hidden="true"
                        data-hero-block="trail"
                        className="hero-block bg-fg"
                      />
                    </span>
                  </span>
                ))}
              </h1>

              <div data-hero-actions className="flex flex-wrap items-center justify-center gap-4">
                <FrameButton label={hero.action.label} href={hero.action.href} />
              </div>
            </div>
            <span
              aria-hidden="true"
              data-hero-cue
              className="hero-cue font-label text-label uppercase"
            >
              <span>Scroll</span>
              <span className="hero-cue-line" />
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
