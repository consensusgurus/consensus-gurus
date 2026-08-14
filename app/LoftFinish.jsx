'use client';

// The back of the board: what to do now that the game is over.
//
// Driven entirely by the `options` a game passes, because the sensible set
// genuinely differs per game. NOT EVERY GAME HAS A REVEAL: a game that hides a
// solution offers one, a game whose board was never hidden offers "See the
// board" or nothing at all, and a game with no archive offers no archive. The
// component states none of that itself; it just renders what it is given.
//
// An option is { label, sub, kind, href } plus either href or onClick:
//   kind 'pri'  the one thing most players want next (filled blue)
//   kind 'gold' share, because gold already means share-and-win on this site
//   omitted     everything else
import React from 'react';

export default function LoftFinish({ title, detail, options = [] }) {
  return (
    <div className="loft-back">
      <div className="loft-res"><b>{title}</b><s>{detail}</s></div>
      {options.filter(Boolean).map((o, i) => {
        const cls = `loft-opt${o.kind ? ` ${o.kind}` : ''}`;
        const inner = <>{o.label}{o.sub ? <span className="sub">{o.sub}</span> : null}</>;
        return o.href
          ? <a key={i} className={cls} href={o.href}>{inner}</a>
          : <button key={i} type="button" className={cls} onClick={o.onClick}>{inner}</button>;
      })}
    </div>
  );
}
