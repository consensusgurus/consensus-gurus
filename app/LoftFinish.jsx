'use client';

// The back of the board: what to do now that the game is over.
//
// It carries what the old DailyEndCard carried, in the new styling (owner,
// 2026-08-14): the verdict, the IQ you gained, today's board, and the things
// you might do next including the archive. Those first three used to live
// either in a separate modal or in a strip BELOW the stage; the end card is
// where a player looks for them, so they moved onto it.
//
// Driven entirely by the `options` a game passes, because the sensible set
// genuinely differs per game. NOT EVERY GAME HAS A REVEAL: a game that hides a
// solution offers one, a game whose board was never hidden offers "See the
// board" or nothing at all, and a game with no archive offers no archive. The
// component states none of that itself; it just renders what it is given.
//
// THE REVEAL RULE (owner, 2026-08-14). A finish that was not a win must not
// give its answer away on its own: the board holds what the player left until
// they press Reveal here. A WIN has nothing hidden, so its option reads 'See
// the board' instead. Games that never hid anything need neither.
//
// Some games have no answer to reveal but do have a final position worth
// showing, and they offer that instead: Babel, for one, should show the
// computer's final move where it has one.
//
// An option is { label, sub, kind, href } plus either href or onClick:
//   kind 'pri'  the one thing most players want next (filled blue)
//   kind 'gold' share, because gold already means share-and-win on this site
//   omitted     everything else
//
// LAYOUT: the options are a two-across grid. A `pri` option and, when the rest
// would leave a half-width orphan, the LAST option span both columns, so the
// grid never ends ragged. That is computed here rather than in CSS because
// :nth-child parity cannot see which one is the primary.
import React from 'react';

function fmtTime(s) {
  if (s == null) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, '0')}`;
}

export default function LoftFinish({ title, detail, iq = null, board = null, options = [] }) {
  const opts = options.filter(Boolean);
  // Which options span the full width: every primary, plus the last one when
  // the half-width ones would otherwise be odd.
  const wide = new Set();
  opts.forEach((o, i) => { if (o.kind === 'pri') wide.add(i); });
  const narrow = opts.map((_, i) => i).filter((i) => !wide.has(i));
  if (narrow.length % 2 === 1) wide.add(narrow[narrow.length - 1]);

  const rows = board && Array.isArray(board.rows) ? board.rows : [];
  const mine = board ? board.mine : null;
  const isMe = (r) => mine && String(r.username || '').toLowerCase() === mine;
  const top = rows.slice(0, 3);
  // Show the player's own row when they finished outside the top three, so the
  // board answers "where did I come" and not only "who won".
  const myIdx = rows.findIndex(isMe);
  const myRow = myIdx >= 3 ? rows[myIdx] : null;

  return (
    <div className="loft-back">
      <div className="loft-res"><b>{title}</b><s>{detail}</s></div>

      {iq && iq.gained != null ? (
        <div className="loft-fiq">
          <span className="n">+{iq.gained}</span>
          <span className="t">
            <span className="l">IQ points earned</span>
            <span className="m">
              {iq.xp != null ? `${Number(iq.xp).toLocaleString()} total` : 'counting your run'}
              {iq.rank != null
                ? ` · rank #${Number(iq.rank).toLocaleString()}${iq.total != null ? ` of ${Number(iq.total).toLocaleString()}` : ''}`
                : ''}
            </span>
          </span>
        </div>
      ) : null}

      {top.length ? (
        <div className="loft-lb">
          <div className="h">
            <b>Today&rsquo;s board</b>
            {board.plays ? <s>{Number(board.plays).toLocaleString()} played</s> : null}
          </div>
          {top.map((r, i) => (
            <div key={i} className={`loft-lbr${i === 0 ? ' first' : ''}${isMe(r) ? ' me' : ''}`}>
              <span className="r">{i + 1}</span>
              <span className="n">{r.username || 'Anonymous'}</span>
              <span className="s">{r.score}{fmtTime(r.timeElapsed) ? <i>{fmtTime(r.timeElapsed)}</i> : null}</span>
            </div>
          ))}
          {myRow ? (
            <div className="loft-lbr me">
              <span className="r">{myIdx + 1}</span>
              <span className="n">{myRow.username || 'You'}</span>
              <span className="s">{myRow.score}{fmtTime(myRow.timeElapsed) ? <i>{fmtTime(myRow.timeElapsed)}</i> : null}</span>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="loft-opts">
        {opts.map((o, i) => {
          const cls = `loft-opt${o.kind ? ` ${o.kind}` : ''}${wide.has(i) ? ' wide' : ''}`;
          const inner = <>{o.label}{o.sub ? <span className="sub">{o.sub}</span> : null}</>;
          return o.href
            ? <a key={i} className={cls} href={o.href}>{inner}</a>
            : <button key={i} type="button" className={cls} onClick={o.onClick}>{inner}</button>;
        })}
      </div>
    </div>
  );
}
