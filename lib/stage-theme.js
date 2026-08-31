'use client';
// THE STAGE'S LIGHT SWITCH.
//
// The stage draws its own one-line cap and nothing else, so there is no site
// header on a game page to hang a theme control from. The control has to live
// in the cap, and the cap has exactly one line, so it is a GLYPH beside Home
// rather than a labelled button. That is also why the preference is stored
// rather than passed: the cap and the page root are two different components,
// and threading a prop between them would mean editing every client's call
// site for a control that has nothing to do with the game.
//
// TWO READERS, ONE VALUE. The page root writes data-stage-theme on the root
// element; the cap draws the switch. Both read this store, so they cannot
// disagree, and a toggle repaints both without a round trip.
//
// FIRST PAINT IS ALWAYS DARK. The server cannot know what is in localStorage,
// so resolving the real value during render makes the client's first paint
// disagree with the server's and React throws. The value arrives in an effect,
// exactly as isSundayET and every other clock- or storage-dependent read on
// this site does.
import { useEffect, useState } from 'react';

const KEY = 'sot_theme';
const subs = new Set();

export function readStageTheme() {
  try {
    // ?theme= is a REVIEW override and deliberately does not persist: a link
    // shared to look at one register should not silently change the reader's
    // own setting for every other game.
    const q = new URLSearchParams(window.location.search).get('theme');
    if (q === 'light' || q === 'dark') return q;
    const s = window.localStorage.getItem(KEY);
    if (s === 'light' || s === 'dark') return s;
  } catch (e) {}
  return 'dark';
}

// A ?theme= override is a REVIEW STATE, not a preference, and it has to TRAVEL
// or it is worse than useless: the page you are looking at honours it, the
// first link you follow does not, and the register flips underneath you
// (owner, 2026-08-31: "when i click from dark background home page to
// individual game page, it swaps to light background" — a dark ?theme=dark
// home handing off to a game that read the stored 'light'). Appending it to
// in-app stage links keeps a review session in one register while still never
// touching what is stored, which is the whole point of the override.
//
// Returns '' during SSR and on first paint, then the real value, because a
// link whose href differs between the server and the client is a hydration
// mismatch. Use the hook, not this, inside a component.
export function themeQs() {
  try {
    const q = new URLSearchParams(window.location.search).get('theme');
    if (q === 'light' || q === 'dark') return '&theme=' + q;
  } catch (e) {}
  return '';
}

export function useThemeQs() {
  const [qs, set] = useState('');
  useEffect(() => { set(themeQs()); }, []);
  return qs;
}

export function writeStageTheme(next) {
  try { window.localStorage.setItem(KEY, next); } catch (e) {}
  for (const f of subs) f(next);
}

export function useStageTheme() {
  const [theme, set] = useState('dark');
  useEffect(() => {
    set(readStageTheme());
    const f = (t) => set(t);
    subs.add(f);
    return () => { subs.delete(f); };
  }, []);
  return [theme, writeStageTheme];
}
