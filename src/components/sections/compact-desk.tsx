import Image from 'next/image'
import { DeskBoard } from '@/components/interactive/desk-board'
import { compact } from '@/content/compact'
import { projects } from '@/content/projects'
import { contact, site } from '@/content/site'
import { CompactBlock } from './compact-block'

const { desk } = compact
const [project] = projects

/*
 * On my desk: the one odd, colourful thing on the page (owner's call: the
 * desk may go beyond red, black and white). The site's own things lie on a
 * board with a coffee ring on it, to be moved about: the work as a taped-down
 * instant photo, a sticky note and a to-do card in the hand, a stamp from
 * home, the kitchen ticket for what is next, a card, a sticker, a pencil and
 * the search's key, which searches when it is pressed rather than moved.
 */
export function CompactDesk() {
  return (
    <CompactBlock id="desk" aside={desk.hint}>
      <DeskBoard
        label={desk.label}
        searchKey="key"
        things={[
          {
            id: 'film',
            x: 3,
            y: 6,
            turn: -6,
            label: desk.film.label,
            node: (
              <figure className="cp-film">
                <span aria-hidden="true" className="cp-tape" />
                {project ? (
                  <Image src={project.cover.image} alt="" sizes="10rem" draggable={false} />
                ) : null}
                <figcaption>{desk.film.caption}</figcaption>
              </figure>
            ),
          },
          {
            id: 'note',
            x: 31,
            y: 4,
            turn: 3,
            label: desk.note.label,
            node: <div className="cp-sticky">{desk.note.text}</div>,
          },
          {
            id: 'todo',
            x: 50,
            y: 10,
            turn: -2,
            label: desk.todo.label,
            node: (
              <div className="cp-todo">
                <p className="cp-todo-title">{desk.todo.title}</p>
                <ul>
                  {desk.todo.items.map((item) => (
                    <li key={item.text} data-done={item.done || undefined}>
                      <span aria-hidden="true" className="cp-todo-box" />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            ),
          },
          {
            id: 'stamp',
            x: 83,
            y: 5,
            turn: 8,
            label: desk.stamp.label,
            node: (
              <div className="cp-stamp">
                <svg aria-hidden="true" viewBox="0 0 60 70" className="cp-stamp-art">
                  <rect width="60" height="70" className="cp-stamp-sky" />
                  <circle cx="40" cy="26" r="11" className="cp-stamp-sun" />
                  <path d="M0 46c10-4 20-4 30 0s20 4 30 0v24H0Z" className="cp-stamp-sea" />
                  <path d="M0 54c10-3 20-3 30 0s20 3 30 0" className="cp-stamp-wave" />
                  <path d="M16 70c1-14 2-26 6-38" className="cp-stamp-trunk" />
                  <path
                    d="M22 32c-6-6-14-6-18-2 6-1 12 0 18 2Zm0 0c-2-8-8-12-14-12 6 3 10 7 14 12Zm0 0c4-7 11-9 17-7-6 1-12 3-17 7Zm0 0c6-1 12 2 15 7-5-3-10-5-15-7Z"
                    className="cp-stamp-palm"
                  />
                </svg>
                <span className="cp-stamp-text">
                  <span>{desk.stamp.country}</span>
                  <strong>{desk.stamp.value}</strong>
                </span>
              </div>
            ),
          },
          {
            id: 'ticket',
            x: 34,
            y: 50,
            turn: 4,
            label: desk.ticket.label,
            node: (
              <div className="cp-ticket">
                <span>{desk.ticket.order}</span>
                <strong>{desk.ticket.title}</strong>
                <span className="cp-ticket-state">{desk.ticket.state}</span>
              </div>
            ),
          },
          {
            id: 'card',
            x: 56,
            y: 64,
            turn: -4,
            label: desk.card.label,
            node: (
              <div className="cp-card">
                <strong className="cp-card-mark">{desk.card.mark}</strong>
                <span>{site.name}</span>
                <span className="cp-card-mail">{contact.email}</span>
              </div>
            ),
          },
          {
            id: 'sticker',
            x: 82,
            y: 44,
            turn: 12,
            label: desk.sticker.label,
            node: <div className="cp-sticker">{desk.sticker.text}</div>,
          },
          {
            id: 'key',
            x: 21,
            y: 66,
            turn: -10,
            label: desk.key.label,
            node: <kbd className="cp-keycap cp-keycap-big">{desk.key.text}</kbd>,
          },
          {
            id: 'pencil',
            x: 2,
            y: 82,
            turn: -14,
            label: desk.pencil.label,
            node: (
              <svg aria-hidden="true" viewBox="0 0 160 16" className="cp-pencil">
                <path d="M0 8l14-6v12Z" className="cp-pencil-wood" />
                <path d="M0 8l5-2v4Z" className="cp-pencil-lead" />
                <rect x="14" y="2" width="118" height="12" className="cp-pencil-body" />
                <path d="M14 6h118M14 10h118" className="cp-pencil-line" />
                <rect x="132" y="2" width="10" height="12" className="cp-pencil-band" />
                <rect x="142" y="2" width="16" height="12" rx="4" className="cp-pencil-eraser" />
              </svg>
            ),
          },
        ]}
      />
    </CompactBlock>
  )
}
