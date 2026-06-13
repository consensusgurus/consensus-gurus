'use client';

import React, { useMemo, useState, useRef } from 'react';

// Typed-recall board (`format: 'type-it'`). ONE clue (e.g. an airport) shows at a
// time in the clue bar with a Next button to cycle through clues not yet solved;
// below sits a single text input where you TYPE the answer (e.g. the IATA code).
// Same guess-budget model as the bank/map boards: one guess per item, a wrong
// submitted answer spends a guess, Next skips for free. A correct answer is
// auto-accepted as you type (or on Enter) and advances to the next clue. Reports
// up to QuizClient via onMatch/onWrong/onEnd/onHint exactly like BankQuizBoard.

const COLORS = {
  cream: '#f4ede0', paper: '#ebe2d0', ink: '#1a1611', ember: '#c0392b',
  rust: '#a44a26', forest: '#3d4f2b', faded: '#7a6f5e',
};
const MONO = 'DM Mono, monospace';
const SERIF = 'Fraunces, serif';
const SANS = 'DM Sans, sans-serif';

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function norm(s) { return (s || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim(); }
function keyHit(g, key) {
  const k = norm(key); if (!k) return false;
  if (g.includes(k)) return true;
  const kt = k.split(' '); if (kt.length < 2) return false;
  const gt = g.split(' '); return kt.every((w) => gt.includes(w));
}
function anyKey(g, keys) { return (keys || []).some((k) => keyHit(g, k)); }
function accepts(raw, item) {
  const g = norm(raw); if (!g) return false;
  if (anyKey(g, item.keys)) return true;
  if (item.anti && anyKey(g, item.anti)) return false;
  return g === norm(item.t);
}

export default function TypeItBoard({ items, started, ended, onMatch, onWrong, onEnd, onHint, promptLabel, answerNoun }) {
  const list = items || [];
  const total = list.length;
  const order = useMemo(() => shuffle(list.map((_, i) => i)), [list]);
  const [matched, setMatched] = useState(() => new Set());
  const [errors, setErrors] = useState(0);
  const [cur, setCur] = useState(() => (order.length ? order[0] : null));
  const [val, setVal] = useState('');
  const [flash, setFlash] = useState(null); // { ok, key }
  const inputRef = useRef(null);

  const live = started && !ended;
  const guessesLeft = Math.max(0, total - matched.size - errors);
  const remaining = total - matched.size;
  const noun = answerNoun || 'answer';

  function nextIdx(fromCur, doneSet) {
    if (!order.length) return null;
    const start = order.indexOf(fromCur);
    for (let s = 1; s <= order.length; s++) {
      const p = order[(start + s) % order.length];
      if (!doneSet.has(p)) return p;
    }
    return null;
  }
  function flashIt(ok) {
    const key = Date.now(); setFlash({ ok, key });
    setTimeout(() => setFlash((f) => (f && f.key === key ? null : f)), 480);
  }
  function submit(raw, viaEnter) {
    if (!live || cur == null) return false;
    if (accepts(raw, list[cur])) {
      const nm = new Set(matched); nm.add(cur);
      const used = nm.size + errors;
      setMatched(nm); setVal(''); flashIt(true);
      if (onMatch) onMatch(cur, nm.size, list[cur].t, list[cur].label);
      const np = nextIdx(cur, nm);
      if (used >= total || np == null) { setCur(null); if (onEnd) onEnd(np == null, nm.size); }
      else setCur(np);
      return true;
    }
    if (viaEnter && norm(raw)) {
      const ne = errors + 1; const used = matched.size + ne;
      setErrors(ne); flashIt(false); setVal('');
      if (onWrong) onWrong(ne, list[cur].label);
      if (used >= total) { setCur(null); if (onEnd) onEnd(false, matched.size); }
    }
    return false;
  }
  function onChange(e) {
    const v = e.target.value;
    if (live && cur != null && accepts(v, list[cur])) submit(v, false);
    else setVal(v);
  }
  function onKey(e) {
    if (e.key !== 'Enter' || !live) return;
    submit(val, true);
  }
  function skip() {
    if (!live || cur == null) return;
    const np = nextIdx(cur, matched);
    if (np != null && np !== cur) { setCur(np); setVal(''); if (onHint) onHint(`Next: ${list[np].label}`, false); }
    else if (onHint) onHint('That is the last one — take your shot.', false);
  }

  const promptText = !started ? 'Press Play to start' : ended ? 'Game over' : (cur != null ? list[cur].label : 'All done');
  const borderColor = flash ? (flash.ok ? COLORS.forest : COLORS.ember) : COLORS.ink;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: live ? COLORS.ink : COLORS.paper, color: live ? COLORS.cream : COLORS.faded, border: `1px solid ${COLORS.faded}33`, padding: '14px 16px', marginBottom: 10, minHeight: 30 }}>
        <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.7, flex: 'none' }}>{promptLabel || 'Clue'}</span>
        <span style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 'clamp(20px, 3.4vw, 28px)', lineHeight: 1.15, flex: '1 1 auto', minWidth: 0, overflowWrap: 'anywhere' }}>{promptText}</span>
        {live && cur != null && (
          <button onClick={skip} title="Skip to the next clue without spending a guess, you can come back." style={{ marginLeft: 'auto', flex: 'none', fontFamily: MONO, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, padding: '9px 16px', background: 'transparent', color: COLORS.cream, border: '1px solid rgba(244,237,224,0.4)', cursor: 'pointer' }}>Next &rarr;</button>
        )}
      </div>
      {!ended && (
        <input
          ref={inputRef}
          value={val}
          disabled={!live}
          onChange={onChange}
          onKeyDown={onKey}
          placeholder={live ? `Type the ${noun}…` : ''}
          autoComplete="off"
          autoCapitalize="characters"
          style={{ width: '100%', boxSizing: 'border-box', fontFamily: SANS, fontSize: 18, padding: '14px 16px', border: `2px solid ${borderColor}`, background: live ? '#fff' : COLORS.paper, color: COLORS.ink, opacity: live ? 1 : 0.6, transition: 'border-color .15s', marginBottom: 12 }}
        />
      )}
      {!ended && (
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded }}>{remaining} still to name &middot; {guessesLeft} {guessesLeft === 1 ? 'guess' : 'guesses'} left</div>
      )}
      {ended && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 8 }}>
          {list.map((it, i) => {
            const got = matched.has(i);
            return (
              <div key={i} style={{ border: `1px solid ${got ? COLORS.forest : COLORS.faded + '55'}`, background: got ? '#e8efdd' : '#fbf7ef', padding: '8px 11px', borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: COLORS.faded, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.label}</span>
                <span style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 17, lineHeight: 1.1, color: got ? COLORS.forest : COLORS.rust }}>{got ? '✓ ' : ''}{it.t}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
