import { WorkTogetherButton } from '@/components/interactive/work-together-button'
import { TextLink } from '@/components/ui/text-link'
import { hero } from '@/content/site'
import './hero.css'

/*
 * The opening composition, on one centre line: the name on two hand-broken
 * lines, a line under it and the actions, centred in the screen; the stack row
 * along the bottom edge. Spacing, type and the entrance follow the good-fella.com
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
      <div className="hero-push">
        <div className="hero-frame">
          <div className="hero-copy">
            <div className="hero-main">
              <h1 id="hero-heading" className="font-display text-hero font-normal">
                {hero.title.map((line, i) => (
                  <span key={line}>
                    {i > 0 ? <br /> : null}
                    <span className="hero-line">
                      <span data-hero-text className="hero-line-text">
                        {line}
                      </span>
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

              <p className="hero-mask text-sm text-fg lg:text-base lg:text-fg-muted">
                <span data-hero-intro className="block">
                  {hero.intro}
                </span>
              </p>

              <div data-hero-actions className="flex flex-wrap items-center justify-center gap-4">
                <WorkTogetherButton
                  label={hero.action.label}
                  href={hero.action.href}
                  tone="accent"
                />
                <TextLink href={hero.secondary.href} className="text-base text-fg">
                  {hero.secondary.label}
                </TextLink>
              </div>
            </div>

            {/* Bottom edge: what this site is built with, in the reference's client row. */}
            <ul
              aria-label={hero.stack.label}
              className="hero-stack font-label text-label text-fg-muted uppercase"
            >
              {hero.stack.items.map((item) => (
                <li key={item} data-hero-stack>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
