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

// THE LIGHT SWITCH IS EASY TO MISS, so a first-time visitor gets ONE pointer at
// it: a ring that pulses out of the glyph a few times and then never again
// (owner, 2026-08-31). Rules that keep it from becoming a nag:
//
//   - It fires once per BROWSER, not once per surface, so whichever page loads
//     first claims it. The flag is written the moment it fires, not when the
//     animation ends, so a reload mid-pulse cannot replay it.
//   - A reader who already has a stored preference has found the switch, so
//     they are marked as hinted without ever seeing it.
//   - prefers-reduced-motion is honoured by skipping it entirely rather than
//     showing a still frame of it.
const HINT_KEY = 'sot_theme_hinted';

export function useThemeHint() {
  const [hint, setHint] = useState(false);
  useEffect(() => {
    let t;
    try {
      if (window.localStorage.getItem(HINT_KEY)) return undefined;
      const chosen = window.localStorage.getItem(KEY);
      const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.localStorage.setItem(HINT_KEY, '1');
      if (chosen || still) return undefined;
      setHint(true);
      t = setTimeout(() => setHint(false), 6000);
    } catch (e) {}
    return () => { if (t) clearTimeout(t); };
  }, []);
  return hint;
}

// THE FIRST LOAD PLAYS THE SWITCH ONCE (owner, 2026-08-31). The ring above says
// "there is a control here"; it cannot say what the control DOES. So the very
// first page a reader opens demonstrates it: the site comes up dark, goes
// light, and comes back to dark, with the register's name beside the glyph
// while it happens. Three rules keep it from being a stunt:
//
//   - IT NEVER WRITES A PREFERENCE. The flip is pushed to the store's
//     subscribers directly and nothing reaches localStorage, so a reader who
//     arrives with no setting still has none when it ends. The last frame is
//     dark, which is exactly what they would have had anyway.
//   - ONCE PER BROWSER, and the flag is written when it FIRES rather than when
//     it ends, so a reload mid-flip cannot replay it. A reader who already has
//     a stored preference, or a ?theme= review override, has already chosen and
//     sees nothing.
//   - TOUCHING THE SWITCH ENDS IT. A demonstration that flips the page back
//     under the reader's own hand a second after they clicked is worse than no
//     demonstration, so writeStageTheme cancels the remaining steps.
//
// prefers-reduced-motion skips it entirely rather than showing a still frame.
const INTRO_KEY = 'sot_theme_intro';
// The cross-fade lives on the root for the few seconds this plays and comes
// straight back off: a permanent transition on every element of a stage page
// would make every board animate its own state changes.
const FLIP_CLASS = 'stg-flip';
let introLive = false;

// Notify without persisting. This is the whole difference between the
// demonstration and a real toggle.
function pushStageTheme(next) {
  for (const f of subs) f(next);
}

export function useThemeIntro() {
  const [showing, setShowing] = useState(null);
  useEffect(() => {
    const ts = [];
    let root = null;
    const end = () => {
      introLive = false;
      setShowing(null);
      if (root) root.classList.remove(FLIP_CLASS);
    };
    try {
      if (window.localStorage.getItem(INTRO_KEY)) return undefined;
      const q = new URLSearchParams(window.location.search).get('theme');
      const chosen = window.localStorage.getItem(KEY);
      const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.localStorage.setItem(INTRO_KEY, '1');
      if (chosen || q === 'light' || q === 'dark' || still) return undefined;
      root = document.documentElement;
      root.classList.add(FLIP_CLASS);
      introLive = true;
      setShowing('dark');
      const at = (ms, fn) => ts.push(setTimeout(() => { if (!introLive) { end(); return; } fn(); }, ms));
      at(850, () => { pushStageTheme('light'); setShowing('light'); });
      at(2350, () => { pushStageTheme('dark'); setShowing('dark'); });
      at(3700, end);
    } catch (e) {}
    return () => {
      for (const t of ts) clearTimeout(t);
      // A cap that unmounts mid-flip must not leave the reader stranded in a
      // register they never chose, so the cleanup puts the stored value back.
      if (introLive) { introLive = false; pushStageTheme(readStageTheme()); }
      if (root) root.classList.remove(FLIP_CLASS);
    };
  }, []);
  return showing;
}

export function writeStageTheme(next) {
  // A reader who has touched the switch has learned it. The demonstration stops
  // where it is rather than flipping the page back under their hand.
  introLive = false;
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
