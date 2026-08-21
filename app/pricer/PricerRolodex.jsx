'use client';

// The reveal rolodex: every item on the board as a card you can step through,
// with its real price, where it landed on your sheet, and a link to buy it.
//
// This replaced a three-item "Shop these on Amazon" strip. The strip named only
// the top three by price, which on a `min` board recommended the three most
// EXPENSIVE items on a board about cheapness, and it rendered on no board at
// all because the launch bank shipped zero ASINs. The rolodex links every item,
// reads the board's own direction, and works whether the links are Amazon
// (`shop: 'amazon'`, per-item `asin`) or the brand's own store
// (`shop: 'brand'`, per-item `url`). A board with neither still renders; the
// cards just carry no buy button.
//
// Affiliate links carry rel="sponsored" and open in a new tab.

import React, { useMemo, useState } from 'react';

const AMZ_TAG = 'cgurus-20';
const buyUrl = (puzzle, it) =>
  puzzle.shop === 'amazon' && it.asin ? `https://www.amazon.com/dp/${it.asin}?tag=${AMZ_TAG}`
  : puzzle.shop === 'brand' && it.url ? it.url
  : null;
const buyLabel = (puzzle) => (puzzle.shop === 'amazon' ? 'Shop on Amazon' : 'View at the brand');

// Where each item ended up on the player's sheet: a pick that was right, a pick
// that busted, or an item they never advanced at all.
function statusOf(idx, picks, TRUE) {
  let advanced = false, correct = false;
  for (let id = 0; id < picks.length; id++) {
    if (picks[id] !== idx) continue;
    advanced = true;
    if (TRUE[id] === idx) correct = true;
  }
  if (!advanced) return 'none';
  return correct ? 'hit' : 'bust';
}
const TONE = {
  hit:  { bg: '#dcfce7', fg: '#14532d', rail: '#a7d8b9', label: 'You had it' },
  bust: { bg: '#fee2e2', fg: '#b91c1c', rail: '#fca5a5', label: 'Your bust' },
  none: { bg: '#eef1f5', fg: '#4b5563', rail: '#d7dde5', label: 'Not on your sheet' },
};

export default function PricerRolodex({ puzzle, picks, TRUE, fmt, colors, mono, sans }) {
  const [i, setI] = useState(0);
  const [grid, setGrid] = useState(false);

  // Ranked best-to-worst under the day's own direction, so a `min` board leads
  // with the cheapest rather than the dearest.
  const cards = useMemo(() => {
    const dir = puzzle.dir === 'min' ? 1 : -1;
    return puzzle.items
      .map((it, idx) => ({ ...it, idx, status: statusOf(idx, picks, TRUE) }))
      .sort((a, b) => (a.value - b.value) * dir);
  }, [puzzle, picks, TRUE]);

  const n = cards.length;
  const cur = cards[Math.min(i, n - 1)];
  const go = (d) => setI((v) => (v + d + n) % n);
  const tone = TONE[cur.status];
  const href = buyUrl(puzzle, cur);

  return (
    <div className="pr-rlx">
      <div className="pr-rlx-hd">
        <div>
          <div className="eyebrow">{puzzle.category} &middot; the full field, priced</div>
          <div className="stamp">Prices checked {puzzle.gathered}</div>
        </div>
        <div className="pr-rlx-nav">
          <button type="button" onClick={() => go(-1)} aria-label="Previous item">&larr;</button>
          <button type="button" onClick={() => go(1)} aria-label="Next item">&rarr;</button>
          <button type="button" onClick={() => setGrid((g) => !g)}>{grid ? 'Deck' : 'List'}</button>
        </div>
      </div>

      {!grid && (
        <>
          <div className="pr-rlx-deck">
            {cards.slice(i + 1, i + 4).reverse().map((c, k) => (
              <div key={c.idx} className="pr-rlx-card behind" style={{ left: (3 - k) * 7, right: (3 - k) * 7, top: (3 - k) * 8, zIndex: k + 1 }}>
                <span className="nm">{c.name}</span>
              </div>
            ))}
            <div className="pr-rlx-card front" style={{ zIndex: 20 }}>
              <div className="row">
                <div className="left">
                  <div className="pos">{String(i + 1).padStart(2, '0')} of {n}</div>
                  <div className="name">{cur.name}</div>
                </div>
                <div className="val">{fmt(cur.value, puzzle.unit)}</div>
              </div>
              <div className="tags"><span className="tag" style={{ background: tone.bg, color: tone.fg }}>{tone.label}</span></div>
              {href && (
                <a className="buy" href={href} target="_blank" rel="noopener sponsored">{buyLabel(puzzle)} &#8599;</a>
              )}
            </div>
          </div>

          <div className="pr-rlx-rail">
            {cards.map((c, k) => (
              <button key={c.idx} type="button" onClick={() => setI(k)} aria-label={`Item ${k + 1}, ${c.name}`}
                style={{ height: k === i ? 24 : 15, background: k === i ? colors.accent : TONE[c.status].rail }} />
            ))}
          </div>
          <div className="pr-rlx-legend">Tap a spine to jump &middot; green you had it, red your bust</div>
        </>
      )}

      {grid && (
        <div className="pr-rlx-grid">
          {cards.map((c) => {
            const h = buyUrl(puzzle, c), t = TONE[c.status];
            const inner = (
              <>
                <div className="gn">{c.name}</div>
                <div className="gr"><span className="gv">{fmt(c.value, puzzle.unit)}</span>{h && <span className="gl">Buy &#8599;</span>}</div>
              </>
            );
            return h
              ? <a key={c.idx} className="pr-rlx-gcell" style={{ borderLeftColor: t.fg }} href={h} target="_blank" rel="noopener sponsored">{inner}</a>
              : <div key={c.idx} className="pr-rlx-gcell" style={{ borderLeftColor: t.fg }}>{inner}</div>;
          })}
        </div>
      )}

      <style jsx>{`
        .pr-rlx{margin:14px 0 4px;max-width:560px;}
        .pr-rlx-hd{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:10px;}
        .eyebrow{font-family:${mono};font-size:9.5px;letter-spacing:.13em;text-transform:uppercase;color:${colors.faded};}
        .stamp{font-family:${mono};font-size:9.5px;letter-spacing:.07em;text-transform:uppercase;color:#9ca3af;margin-top:2px;}
        .pr-rlx-nav{display:flex;gap:5px;}
        .pr-rlx-nav button{font-family:${sans};font-size:12px;font-weight:800;min-width:32px;height:30px;padding:0 9px;
          border:1.5px solid ${colors.line};border-radius:7px;background:var(--white);color:${colors.ink};cursor:pointer;}
        .pr-rlx-nav button:hover{border-color:${colors.accent};color:${colors.accentDeep};}
        .pr-rlx-deck{position:relative;height:180px;margin-bottom:10px;}
        .pr-rlx-card{position:absolute;background:var(--white);border:1.5px solid ${colors.line};border-radius:10px;
          padding:11px 15px;box-sizing:border-box;overflow:hidden;}
        .pr-rlx-card.behind{height:150px;}
        .pr-rlx-card.behind .nm{font-size:12.5px;font-weight:700;color:#9ca3af;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;}
        .pr-rlx-card.front{left:0;right:0;top:0;height:172px;border-color:${colors.accent};border-top:3px solid ${colors.accent};padding:13px 15px;}
        .row{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;}
        .left{min-width:0;}
        .pos{font-family:${mono};font-size:9.5px;letter-spacing:.1em;color:#9ca3af;}
        .name{font-size:18px;font-weight:900;color:${colors.ink};margin-top:3px;line-height:1.2;letter-spacing:-.015em;}
        .val{font-family:${mono};font-size:22px;font-weight:500;color:${colors.accent};white-space:nowrap;font-variant-numeric:tabular-nums;}
        .tags{margin-top:9px;}
        .tag{font-family:${sans};font-size:11px;font-weight:800;padding:3px 9px;border-radius:20px;}
        .buy{display:inline-flex;align-items:center;gap:6px;margin-top:12px;background:${colors.ink};color:var(--white);
          text-decoration:none;font-family:${sans};font-size:12.5px;font-weight:800;padding:8px 14px;border-radius:7px;}
        .buy:hover{background:${colors.accentDeep};}
        .pr-rlx-rail{display:flex;gap:3px;align-items:flex-end;height:24px;margin-bottom:5px;}
        .pr-rlx-rail button{flex:1;min-width:0;padding:0;border:none;border-radius:3px;cursor:pointer;}
        .pr-rlx-legend{font-family:${mono};font-size:9.5px;letter-spacing:.07em;text-transform:uppercase;color:#9ca3af;}
        .pr-rlx-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(156px,1fr));gap:6px;}
        .pr-rlx-gcell{display:block;text-decoration:none;background:var(--white);border:1px solid ${colors.line};
          border-left:3px solid ${colors.line};border-radius:0;padding:8px 10px;}
        .gn{font-family:${sans};font-size:12px;font-weight:700;color:${colors.ink};line-height:1.3;}
        .gr{display:flex;justify-content:space-between;align-items:center;margin-top:5px;}
        .gv{font-family:${mono};font-size:12.5px;color:${colors.accent};font-variant-numeric:tabular-nums;}
        .gl{font-family:${sans};font-size:10.5px;font-weight:800;color:${colors.faded};}
        @media(max-width:560px){ .pr-rlx-deck{height:196px;} .pr-rlx-card.front{height:188px;} .name{font-size:16px;} .val{font-size:19px;} }
      `}</style>
    </div>
  );
}
