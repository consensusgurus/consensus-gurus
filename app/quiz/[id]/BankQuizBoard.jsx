'use client';

import React, { useMemo, useState } from 'react';

// Single-bank matching board (`format: 'bank'`). ONE prompt (the clue, e.g. a
// country) shows at a time with a Next button to cycle through the prompts not
// yet matched; below sits ONE bank of answer tiles (e.g. capitals), alphabetical.
// GUESS-BUDGET model (same as the map quiz): you start with one guess per item.
// Every tap, right OR wrong, spends one guess. A correct tile turns green and the
// prompt is done; a wrong tap just costs a guess, NOTHING is removed or revealed,
// and the missed prompt keeps looping so you can try it again later (at the cost
// of another guess). The game ends when you run out of guesses, match everything,
// or the clock runs out. Next skips the current prompt without spending a guess.
// Score = number matched. Reports up to QuizClient like the other boards.

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
  const total = pairs.length;
  const promptOrder = useMemo(() => shuffle(pairs.map((_, i) => i)), [pairs]);
  const bankOrder = useMemo(
    () => pairs.map((_, i) => i).sort((a, b) => pairs[a][0].localeCompare(pairs[b][0])),
    [pairs]
  );
  const [matched, setMatched] = useState(() => new Set()); // pair ids matched (locked green)
  const [errors, setErrors] = useState(0); // wrong taps
  const [cur, setCur] = useState(() => (promptOrder.length ? promptOrder[0] : null));
  const [flash, setFlash] = useState(null); // { key, ok }

  const live = started && !ended;
  const guessesLeft = total - matched.size - errors;
  const remaining = total - matched.size;

  // Next still-UNMATCHED prompt after `fromPair`, wrapping. Returns the same pair
  // if it is the only one left, or null if everything is matched.
  function nextUnmatched(fromPair, matchedSet) {
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

  // The current prompt is a work/clue string (pairs[cur][1]). Several pairs may
  // share that prompt (e.g. three characters from one movie); ANY not-yet-matched
  // tile whose prompt equals the current one counts as correct, in ANY order, and
  // the prompt stays up until all of its tiles are found. For 1-to-1 quizzes each
  // prompt is unique, so this reduces to the old k===cur behavior.
  function nextDifferentPrompt(fromPair, matchedSet) {
    if (!promptOrder.length) return null;
    const fromPrompt = pairs[fromPair][1];
    const start = promptOrder.indexOf(fromPair);
    for (let k = 1; k <= promptOrder.length; k++) {
      const p = promptOrder[(start + k) % promptOrder.length];
      if (!matchedSet.has(p) && pairs[p][1] !== fromPrompt) return p;
    }
    return nextUnmatched(fromPair, matchedSet);
  }

  function clickTile(k) {
    if (!live || cur == null || matched.has(k)) return;
    const curPrompt = pairs[cur][1];
    if (pairs[k][1] === curPrompt) {
      const nm = new Set(matched);
      nm.add(k);
      const used = nm.size + errors;
      setMatched(nm);
      flashTile(k, true);
      if (onMatch) onMatch(k, nm.size, pairs[k][0], pairs[k][1]);
      if (used >= total || nm.size === total) { setCur(null); if (onEnd) onEnd(nm.size === total, nm.size); }
      else {
        // keep the same work up while it still has unmatched tiles
        const sameLeft = promptOrder.find((p) => !nm.has(p) && pairs[p][1] === curPrompt);
        setCur(sameLeft != null ? sameLeft : nextUnmatched(cur, nm));
      }
    } else {
      const ne = errors + 1;
      const used = matched.size + ne;
      setErrors(ne);
      flashTile(k, false);
      if (onWrong) onWrong(ne, curPrompt);
      if (used >= total) { setCur(null); if (onEnd) onEnd(matched.size === total, matched.size); }
      else setCur(nextUnmatched(cur, matched));
    }
  }

  function skip() {
    if (!live || cur == null) return;
    const np = nextDifferentPrompt(cur, matched);
    if (np != null && pairs[np][1] !== pairs[cur][1]) { setCur(np); if (onHint) onHint(`Next up: ${pairs[np][1]}.`, false); }
    else if (onHint) onHint('That is the only one left, take your shot.', false);
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: live ? COLORS.ink : COLORS.paper, color: live ? COLORS.cream : COLORS.faded, border: `1px solid ${COLORS.faded}33`, padding: '14px 16px', marginBottom: 10, minHeight: 30 }}>
        <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.7, flex: 'none' }}>{promptLabel || 'Prompt'}</span>
        <span style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 'clamp(22px, 4vw, 30px)', lineHeight: 1.1 }}>{cur != null ? pairs[cur][1] : (ended ? 'Game over' : 'Press Play to start')}</span>
        {live && cur != null && (
          <button onClick={skip} title="Skip to the next prompt without spending a guess, you can come back." style={{ marginLeft: 'auto', flex: 'none', fontFamily: MONO, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, padding: '9px 16px', background: 'transparent', color: COLORS.cream, border: '1px solid rgba(244,237,224,0.4)', cursor: 'pointer' }}>Next &rarr;</button>
        )}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded, marginBottom: 12 }}>{remaining} still to match &middot; {Math.max(0, guessesLeft)} {Math.max(0, guessesLeft) === 1 ? 'guess' : 'guesses'} left</div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', background: COLORS.paper, border: `1px solid ${COLORS.faded}33`, padding: '16px 14px' }}>
        {bankOrder.map((k) => {
          const isMatched = matched.has(k);
          const isFlash = flash && flash.key === k;
          let bg = '#fffdf8';
          let fg = COLORS.ink;
          if (isMatched) { bg = COLORS.forest; fg = COLORS.cream; }
          else if (isFlash) { bg = flash.ok ? COLORS.forest : COLORS.ember; fg = COLORS.cream; }
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
