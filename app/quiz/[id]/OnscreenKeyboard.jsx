'use client';

import React, { useEffect, useState } from 'react';
import { isMobileDevice } from '../../../lib/is-mobile';

// Shared mobile ONSCREEN KEYBOARD for the single-prompt typed boards (type-it /
// careers, word-scramble, photo, grid-fill) — the Crux pattern generalized.
// WHY: the OS keyboard is the root of a whole mobile bug class here — it
// resizes the visual viewport (hence the kbInset/vv.height plumbing in every
// board), dismisses on stray taps mid-run, and steals ~40px for its predictive
// bar. This keyboard is plain DOM: static layout, no focus juggling, known
// height. Desktop (>760px viewport) is untouched.
//
// GATING (useOsk): the board's `mobile` prop (viewport <=760) AND
// isMobileDevice() (real touch hardware) AND live play AND not opted out. A
// narrow DESKTOP window therefore keeps the physical-keyboard path. While the
// OSK is on, give the paired <input> inputMode="none" so the OS virtual
// keyboard never opens — hardware keyboards still type into it, so nothing is
// lost on keyboard-equipped devices. Keep all existing visualViewport plumbing
// in the callers: it is the fallback when the user opts back to the system
// keyboard ("Use system keyboard" toggle, persisted in localStorage).
//
// DIGITS row is opt-in via keysNeedDigits(items): answer matching norm()s to
// [a-z0-9 ] only, so letters + digits + space is the complete alphabet — no
// punctuation keys ever needed. ?osk=1 forces the touch gate (testing).

export const OSK_PREF_KEY = 'sot_osk_off';

function prefOff() {
  try { return typeof localStorage !== 'undefined' && localStorage.getItem(OSK_PREF_KEY) === '1'; } catch (e) { return false; }
}

export function keysNeedDigits(items) {
  try {
    return (items || []).some((it) => (((it && it.keys) || []).concat(it && it.t != null ? [it.t] : [])).some((k) => /[0-9]/.test(String(k))));
  } catch (e) { return false; }
}

// One hook per board. `on` = render the OSK + set inputMode="none" now.
// `showRestore` = mobile touch device that opted out — offer the way back.
export function useOsk(mobile, live) {
  const [off, setOff] = useState(false);
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    setOff(prefOff());
    let t = isMobileDevice();
    try { if (new URLSearchParams(window.location.search).get('osk') === '1') t = true; } catch (e) { /* noop */ }
    setTouch(t);
  }, []);
  const toggle = () => setOff((o) => {
    const n = !o;
    try { localStorage.setItem(OSK_PREF_KEY, n ? '1' : '0'); } catch (e) { /* noop */ }
    return n;
  });
  return {
    on: !!(mobile && touch && live && !off),
    showRestore: !!(mobile && touch && live && off),
    toggle,
  };
}

const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
const INK = '#1c1e24';
const PAPER = '#eceef1';
const EMBER = '#2563eb';
const FADED = '#6b7280';
const SANS = "'Manrope', system-ui, -apple-system, sans-serif";

// Height the OSK adds to a bottom dock (used by callers to size spacers /
// cap photo height). Keys 44px + 5px gaps + toggle line + padding.
export function oskHeight(withDigits) { return (withDigits ? 5 : 4) * 49 + 24; }

export default function OnscreenKeyboard({ onKey, withDigits = false, onToggle, style }) {
  const key = (label, val, flex, extra) => (
    <button
      key={val}
      type="button"
      className="sot-oskkey"
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => onKey(val)}
      aria-label={val === 'BACK' ? 'Delete' : val === 'ENTER' ? 'Submit guess' : (val === ' ' ? 'Space' : label)}
      style={{ flex: `${flex} 0 0`, height: 44, ...extra }}
    >{label}</button>
  );
  return (
    <div style={{ width: '100%', maxWidth: 470, margin: '0 auto', ...style }}>
      <style>{`
        .sot-oskkey{border:1.5px solid rgba(20,22,28,0.15);background:#fff;color:${INK};font-family:${SANS};font-weight:800;font-size:15px;cursor:pointer;border-radius:6px;padding:0;touch-action:manipulation;user-select:none;-webkit-user-select:none;}
        .sot-oskkey:active{transform:scale(0.94);background:${PAPER};}
      `}</style>
      {withDigits && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
          {'1234567890'.split('').map((ch) => key(ch, ch, 1))}
        </div>
      )}
      {ROWS.map((row) => (
        <div key={row} style={{ display: 'flex', gap: 4, marginBottom: 5, justifyContent: 'center' }}>
          {row.split('').map((ch) => key(ch, ch, 1))}
        </div>
      ))}
      <div style={{ display: 'flex', gap: 4 }}>
        {key('ENTER', 'ENTER', 1.7, { background: EMBER, color: '#fff', fontSize: 11.5, border: 'none' })}
        {key('space', ' ', 4.6, { color: FADED, fontSize: 12 })}
        {key('⌫', 'BACK', 1.7, { background: PAPER, fontSize: 16 })}
      </div>
      {onToggle && (
        <div style={{ textAlign: 'center', marginTop: 5 }}>
          <button type="button" onClick={onToggle} style={{ background: 'none', border: 'none', color: FADED, fontFamily: SANS, fontWeight: 700, fontSize: 11, textDecoration: 'underline', cursor: 'pointer', padding: 2 }}>Use system keyboard</button>
        </div>
      )}
    </div>
  );
}
