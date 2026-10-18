import { FrameButton } from '@/components/library/frame-button'
import { KeyLink } from '@/components/library/key-link'
import { ScrambleButton } from '@/components/library/scramble-button'
import { DrawPad } from '@/components/interactive/draw-pad'
import { ContactBoard } from '@/components/motion/contact-board'
import { compact } from '@/content/compact'
import { contact } from '@/content/site'
import type { CompactPiece } from '@/types/content'

function Piece({ piece }: { piece: CompactPiece }) {
  switch (piece.kind) {
    case 'frame':
      return <FrameButton label={piece.label} href={piece.href} size="compact" />
    case 'key':
      return <KeyLink label={piece.label} href={piece.href} />
    case 'scramble':
      return <ScrambleButton label={piece.label} href={piece.href} tone="ink" />
    case 'board':
      return (
        <ContactBoard
          email={contact.email}
          copyLabel={contact.board.copyLabel}
          hint={contact.board.hint}
          touchHint={contact.board.touchHint}
          done={contact.board.done}
          size="compact"
        />
      )
    case 'pad':
      return <DrawPad label={piece.label} />
  }
}

/*
 * The shelf (compact.css): this site's interface pieces as a specimen sheet, one
 * per row between hairlines, not a grid of cards (DESIGN.md §3). Each row: the
 * index and name in the label face, the piece itself, live, and one line on what
 * it does. The pieces go somewhere real (the full site, mail, LinkedIn, the
 * clipboard), so the shelf is also how to reach the owner.
 */
export function CompactShelf() {
  return (
    <section aria-labelledby="compact-shelf" className="compact-section">
      <h2 id="compact-shelf" className="compact-section-label font-label text-label uppercase">
        {compact.shelf.label}
      </h2>
      <ol className="compact-shelf-list">
        {compact.shelf.items.map((item) => (
          <li key={item.index} className="compact-shelf-item">
            <p className="compact-shelf-name font-label text-label uppercase">
              <span className="compact-shelf-index">{item.index}</span>
              {item.name}
            </p>
            <div className="compact-shelf-piece">
              <Piece piece={item.piece} />
            </div>
            <p className="compact-shelf-note">{item.note}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
