'use client';

import React, { useMemo, useState } from 'react';

// Single-bank matching board (`format: 'bank'`). ONE prompt (the clue, e.g. a
// country) shows at a time with a Next button to cycle through the prompts not
// yet matched; below sits ONE bank of answer tiles (e.g. capitals), alphabetical.
// Click the tile that matches the current prompt: a correct tile turns green and
// locks, and the prompt leaves the rotation. A WRONG tap just costs an error and
// flashes red, it does NOT lock the prompt, so you keep cycling and can try again
// (or press Next to skip). The game runs until every prompt is matched or the
// clock runs out. Score = number matched; the board reports up to QuizClient like
// the other matching boards (onMatch / onWrong / onEnd / onHint).

const COLORS = {
  cream: '#f4ede0',
  paper: '#ebe2d0',
  ink: '#1a1611',
  ember: '#c0392b',
  rust: '#a44a26',
  forest: '#3d4f2b',
  faded: '#7a6f5e',
};
const MONO = 'DM Mono, monospace';
const SERIF = 'Fraunces, serif';
const SANS = 'DM Sans, sans-serif';

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function BankQuizBoard({ pairs, started, ended, onMatch, onWrong, onEnd, onHint, promptLabel, bankLabel }) {
  // pairs[i] === [answer, prompt]: answer = the tile (e.g. capital), prompt =
  // the clue shown one at a time (e.g. country).
  const promptOrder = useMemo(() => shuffle(pairs.map((_, i) => i)), [pairs]);
  const bankOrder = useMemo(
    () => pairs.map((_, i) => i).sort((a, b) => pairs[a][0].localeCompare(pairs[b][0])),
    [pairs]
  );
  const [matched, setMatched] = useState(() => new Set()); // pair ids correctly matched
  const [errors, setErrors] = useState(0);
  const [cur, setCur] = useState(() => (promptOrder.length ? promptOrder[0] : null));
  const [flash, setFlash] = useState(null); // { key, ok }

  const live = started && !ended;
  const remaining = pairs.length - matched.size;

  // Next still-unmatched prompt after `fromPair`, wrapping. Returns the same
  // pair if it is the only one left, or null if none remain.
  function nextOpen(fromPair, matchedSet) {
    if (!promptOrder.length) return null;
    const start = promptOrder.indexOf(fromPair);
    for (let k = 1; k <= promptOrder.length; k++) {
      const p = promptOrder[(start + k) % promptOrder.length];
      if (!matchedSet.has(p)) return p;
    }
    return null;
  }

  function flashTile(key, ok) {
    setFlash({ key, ok });
    setTimeout(() => setFlash((f) => (f && f.key === key ? null : f)), 480);
  }

  function clickTile(k) {
    if (!live || cur == null || matched.has(k)) return;
    if (k === cur) {
      const nm = new Set(matched);
      nm.add(cur);
      const np = nextOpen(cur, nm);
      setMatched(nm);
      flashTile(k, true);
      if (onMatch) onMatch(cur, nm.size, pairs[cur][0], pairs[cur][1]);
      if (!np) { setCur(null); if (onEnd) onEnd(nm.size === pairs.length, nm.size); }
      else setCur(np);
    } else {
      // Wrong: tally an error and flash, but DO NOT lock the prompt or advance.
      // The player keeps cycling and can retry, or press Next to skip.
      const ne = errors + 1;
      setErrors(ne);
      flashTile(k, false);
      if (onWrong) onWrong(ne, pairs[cur][1]);
    }
  }

  function skip() {
    if (!live || cur == null) return;
    const np = nextOpen(cur, matched);
    if (np != null && np !== cur) { setCur(np); if (onHint) onHint(`Next up: ${pairs[np][1]}.`, false); }
    else if (onHint) onHint('That is the only one left, keep trying.', false);
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: live ? COLORS.ink : COLORS.paper, color: live ? COLORS.cream : COLORS.faded, border: `1px solid ${COLORS.faded}33`, padding: '14px 16px', marginBottom: 10, minHeight: 30 }}>
        <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.7, flex: 'none' }}>{promptLabel || 'Prompt'}</span>
        <span style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 'clamp(22px, 4vw, 30px)', lineHeight: 1.1 }}>{cur != null ? pairs[cur][1] : (ended ? 'Game over' : 'Press Play to start')}</span>
        {live && cur != null && (
          <button onClick={skip} title="Skip to the next prompt, you can come back to this one." style={{ marginLeft: 'auto', flex: 'none', fontFamily: MONO, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, padding: '9px 16px', background: 'transparent', color: COLORS.cream, border: '1px solid rgba(244,237,224,0.4)', cursor: 'pointer' }}>Next &rarr;</button>
        )}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded, marginBottom: 12 }}>{remaining} left to match</div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', background: COLORS.paper, border: `1px solid ${COLORS.faded}33`, padding: '16px 14px' }}>
        {bankOrder.map((k) => {
          const isMatched = matched.has(k);
          const isFlash = flash && flash.key === k;
          const bg = isMatched ? COLORS.forest : isFlash ? (flash.ok ? COLORS.forest : COLORS.ember) : '#fffdf8';
          const fg = isMatched || isFlash ? COLORS.cream : COLORS.ink;
          return (
            <button
              key={k}
              type="button"
              disabled={!live || isMatched}
              onClick={() => clickTile(k)}
              style={{ fontFamily: SANS, fontSize: 13.5, padding: '9px 13px', background: bg, color: fg, border: `1px solid ${isMatched ? COLORS.forest : COLORS.faded + '66'}`, borderRadius: 0, cursor: live && !isMatched ? 'pointer' : 'default', transition: 'all .12s', fontWeight: 500 }}
            >
              {pairs[k][0]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
