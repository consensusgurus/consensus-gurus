'use client';

import React, { useMemo, useState } from 'react';

// Ordered answer-bank, sudden-death board (`format: 'order-bank'`).
//
// The player is shown ONE shuffled bank of answer tiles (e.g. every MCU film)
// and must tap them in the correct sequence (release order). Each correct tap
// fills the next numbered slot, turns the tile green, and removes it from the
// bank. The FIRST wrong tap ends the run on the spot (sudden death — the quiz
// carries `strike: true`). The clock (owned by QuizClient) ending also ends the
// run. Score = how many slots were filled before the miss or the buzzer.
//
// Reports up to QuizClient through the same pair-handler props the other tile
// boards use (onMatch / onWrong / onEnd / onHint), so the shared scoreboard,
// leaderboard, stats, share and reveal all work unchanged. `items` is the quiz's
// `answers` array in correct order; only each item's `t` (display title) is used.

const COLORS = {
  cream: '#f7f8fa',
  paper: '#eceef1',
  ink: '#1c1e24',
  ember: '#2563eb',
  rust: '#c0392b',
  forest: '#10b981',
  faded: '#6b7280',
};
const MONO = "'Manrope', system-ui, -apple-system, sans-serif";
const SERIF = "'Manrope', system-ui, -apple-system, sans-serif";
const SANS = "'Manrope', system-ui, -apple-system, sans-serif";

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function OrderBankBoard({
  items,
  started,
  ended,
  revealed,
  onMatch,
  onWrong,
  onEnd,
  onHint,
  answerNoun,
  stickyTop = 150,
  mobile = false,
}) {
  const total = items.length;
  const noun = answerNoun || 'film';
  const bankOrder = useMemo(() => shuffle(items.map((_, i) => i)), [items]);

  const [placed, setPlaced] = useState(0); // count correctly placed so far (= index of next slot)
  const [struck, setStruck] = useState(false); // a wrong tap happened
  const [wrongPick, setWrongPick] = useState(null); // index of the tile wrongly tapped
  const [flash, setFlash] = useState(null); // { key, ok }

  const live = started && !ended;

  function flashTile(key, ok) {
    setFlash({ key, ok });
    setTimeout(() => setFlash((f) => (f && f.key === key ? null : f)), 480);
  }

  function clickTile(k) {
    if (!live) return;
    if (k === placed) {
      // correct next pick
      const np = placed + 1;
      setPlaced(np);
      flashTile(k, true);
      if (onMatch) onMatch(k, np, items[k].t, '');
      if (np >= total) {
        if (onEnd) onEnd(true, np);
      } else if (onHint) {
        onHint(`#${np} — ${items[k].t}. Next ${noun}?`, false);
      }
    } else {
      // wrong pick: sudden death
      setStruck(true);
      setWrongPick(k);
      flashTile(k, false);
      if (onWrong) onWrong(placed + 1, items[k].t);
      if (onEnd) onEnd(false, placed);
    }
  }

  const barStyle = {
    position: 'sticky',
    top: stickyTop,
    zIndex: 4,
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
    background: live ? COLORS.ink : COLORS.paper,
    color: live ? COLORS.cream : COLORS.faded,
    borderRadius: 10,
    border: `1px solid ${COLORS.faded}33`,
    padding: '14px 16px',
    marginBottom: 10,
    minHeight: 30,
  };

  const barText = !started
    ? 'Press Play to start'
    : ended
    ? 'Game over'
    : placed >= total
    ? 'All in order — perfect!'
    : `Next: #${placed + 1} of ${total}`;

  // Ended view: reveal the full correct order. Reached = green, the missed slot
  // (if struck) = rust, everything after = neutral reveal.
  if (ended) {
    return (
      <div>
        <div style={{ ...barStyle, position: 'static' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.7, flex: 'none' }}>Release order</span>
          <span style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 'clamp(18px, 3vw, 24px)', flex: '1 1 auto' }}>
            You placed {placed} of {total} in order.
          </span>
        </div>
        <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: 6 }}>
          {items.map((it, i) => {
            const reached = i < placed;
            const missedSlot = struck && i === placed;
            const bd = reached ? COLORS.forest : missedSlot ? COLORS.rust : COLORS.faded + '44';
            const bg = reached ? '#e7f5ef' : missedSlot ? '#fbecea' : '#fbfcfd';
            const numColor = reached ? COLORS.forest : missedSlot ? COLORS.rust : COLORS.faded;
            return (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, border: `1px solid ${bd}`, background: bg, borderRadius: 2, padding: '7px 11px' }}>
                <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: numColor, minWidth: 24, textAlign: 'right' }}>{i + 1}</span>
                <span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: reached ? 700 : 600, color: COLORS.ink, lineHeight: 1.2 }}>
                  {reached ? `✓ ${it.t}` : revealed ? `${missedSlot ? '✗ ' : ''}${it.t}` : '• • •'}
                </span>
              </li>
            );
          })}
        </ol>
        {struck && wrongPick != null && (
          <p style={{ fontFamily: MONO, fontSize: 12, color: COLORS.rust, marginTop: 12 }}>
            You tapped <strong>{items[wrongPick].t}</strong> for slot #{placed + 1}.{revealed ? <> The next {noun} was <strong>{items[placed] ? items[placed].t : ''}</strong>.</> : ' Reveal the answers to see the rest of the order.'}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={barStyle}>
        <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.7, flex: 'none' }}>Release order</span>
        <span key={barText} style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 'clamp(20px, 3.4vw, 28px)', lineHeight: 1.15, flex: '1 1 220px', minWidth: 0 }}>{barText}</span>
        {live && (
          <span style={{ marginLeft: 'auto', flex: 'none', fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.8 }}>
            {placed}/{total} placed
          </span>
        )}
      </div>

      {placed > 0 && (
        <ol style={{ listStyle: 'none', margin: '0 0 14px', padding: 0, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {items.slice(0, placed).map((it, i) => (
            <li key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#e7f5ef', border: `1px solid ${COLORS.forest}`, borderRadius: 2, padding: '5px 9px' }}>
              <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: COLORS.forest }}>{i + 1}</span>
              <span style={{ fontFamily: SANS, fontSize: 13, color: COLORS.ink }}>{it.t}</span>
            </li>
          ))}
        </ol>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', background: COLORS.paper, borderRadius: 10, border: `1px solid ${COLORS.faded}33`, padding: '16px 14px' }}>
        {!started && (
          <span style={{ fontFamily: MONO, fontSize: 12, color: COLORS.faded }}>Press Play to reveal the bank.</span>
        )}
        {started && bankOrder.map((k) => {
          if (k < placed) return null; // already placed -> removed from the bank
          const isFlash = flash && flash.key === k;
          let bg = '#fffdf8';
          let fg = COLORS.ink;
          if (isFlash) { bg = flash.ok ? COLORS.forest : COLORS.ember; fg = COLORS.cream; }
          return (
            <button
              key={k}
              type="button"
              disabled={!live}
              onClick={() => clickTile(k)}
              style={{ fontFamily: SANS, fontSize: 13.5, padding: '9px 13px', background: bg, color: fg, border: `1px solid ${COLORS.faded}66`, borderRadius: 0, cursor: live ? 'pointer' : 'default', transition: 'all .12s', fontWeight: 500 }}
            >
              {items[k].t}
            </button>
          );
        })}
      </div>
    </div>
  );
}
