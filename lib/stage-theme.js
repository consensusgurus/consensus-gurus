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
