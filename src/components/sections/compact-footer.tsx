import { Fragment } from 'react'
import Link from 'next/link'
import { ShortcutKey } from '@/components/interactive/shortcut-key'
import { Icon } from '@/components/ui/icon'
import { compact } from '@/content/compact'
import { footer as fullFooter } from '@/content/site'
import { RollText } from '@/components/ui/roll-text'

const { footer } = compact
const build = [process.env.BUILD_COMMIT, process.env.BUILD_DATE].filter(Boolean).join(', ')

/*
 * The sheet's last lines, on every compact page: who made it and in what type,
 * the build it is (the commit and day, next.config.ts), the way to the full
 * site, a hint for the search for a visitor with a keyboard, and the way back
 * up, whose arrow takes off on hover and lands again from below (compact.css).
 */
export function CompactFooter() {
  return (
    <footer className="cp-foot font-label">
      <div className="cp-foot-row">
        <p>{footer.note}</p>
        <a href="#top" className="cp-foot-top">
          <RollText>{footer.top}</RollText>
          <span aria-hidden="true" className="cp-rocket">
            <Icon name="up" className="size-3.5" />
          </span>
        </a>
      </div>
      <div className="cp-foot-row text-fg-muted">
        <p>
          {fullFooter.typefaces.map((face, index) => (
            <Fragment key={face}>
              {index > 0 ? ' & ' : null}
              {/* Each name set in its own face. */}
              <span className={index === 0 ? 'font-display' : 'font-label'}>{face}</span>
            </Fragment>
          ))}
        </p>
        {build ? (
          <p>
            {footer.build} {build}
          </p>
        ) : null}
      </div>
      <div className="cp-foot-row">
        <Link href={footer.back.href} className="cp-foot-back">
          <RollText>{footer.back.label}</RollText>
          <Icon name="arrow" className="cp-nudge size-3" />
        </Link>
        <p className="cp-foot-tip text-fg-muted">
          {footer.tip.before}
          <ShortcutKey className="cp-keys" />
          {footer.tip.after}
        </p>
      </div>
    </footer>
  )
}
