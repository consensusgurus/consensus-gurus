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
// The register the first-load demonstration is FORCING, or null. It is read by
// readStageTheme rather than only pushed to subscribers, because a client root
// mounts AFTER the cap inside it and would otherwise resolve its own stored
// value a beat later and overwrite the demonstration mid-step. See
// useThemeIntro.
let introShow = null;

export function readStageTheme() {
  // While the demonstration is playing it IS the answer, for every reader of
  // the store. Nothing is written, so the moment it ends this falls straight
  // back through to the reader's own stored value.
  if (introShow) return introShow;
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
//   - EVERY reader gets it, including one who already has a stored preference
//     (owner, 2026-08-31). Having toggled the switch once months ago is not the
//     same as knowing it is there, and the ring costs a reader who does know it
//     three pulses.
//   - prefers-reduced-motion is honoured by skipping it entirely rather than
//     showing a still frame of it.
// The KEY IS VERSIONED. Widening who sees this is worthless if the browsers
// that already stamped the old key are excluded by their own stamp, so a change
// to who qualifies takes a new key rather than an edit to the gate.
const HINT_KEY = 'sot_theme_hinted2';

export function useThemeHint() {
  const [hint, setHint] = useState(false);
  useEffect(() => {
    let t;
    try {
      if (window.localStorage.getItem(HINT_KEY)) return undefined;
      const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.localStorage.setItem(HINT_KEY, '1');
      if (still) return undefined;
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
//     subscribers directly and nothing reaches localStorage, and it HANDS THE
//     READER BACK THEIR OWN REGISTER at the end, whatever it is. A reader with
//     no setting still has none and ends dark, which is what they would have
//     had anyway; a reader who chose light months ago is shown dark, then
//     light, and is left in light.
//   - EVERYONE GETS IT, ONCE (owner, 2026-08-31). Having a stored preference no
//     longer disqualifies a reader: most people who have one set it by accident
//     or long ago, and the point is that the control exists. The gate is the
//     flag alone, and the flag is VERSIONED, because widening who qualifies is
//     worthless if the browsers that already stamped the old key are shut out
//     by their own stamp. Bump INTRO_KEY, never loosen the check in place.
//   - The flag is written when it FIRES rather than when it ends, so a reload
//     mid-flip cannot replay it.
//   - TOUCHING THE SWITCH ENDS IT. A demonstration that flips the page back
//     under the reader's own hand a second after they clicked is worse than no
//     demonstration, so writeStageTheme cancels the remaining steps.
//
// Two skips remain. prefers-reduced-motion skips it entirely rather than
// showing a still frame, and a ?theme= review link skips it WITHOUT burning the
// flag, since flipping the page under that link defeats the one thing it is
// for and the reviewer still deserves their turn on an ordinary load.
const INTRO_KEY = 'sot_theme_intro2';
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
      introShow = null;
      setShowing(null);
      if (root) root.classList.remove(FLIP_CLASS);
    };
    // One step of the demonstration: force the register for every reader of the
    // store, push it to the ones already mounted, and name it on the chip.
    const show = (t) => { introShow = t; pushStageTheme(t); setShowing(t); };
    try {
      if (window.localStorage.getItem(INTRO_KEY)) return undefined;
      const q = new URLSearchParams(window.location.search).get('theme');
      if (q === 'light' || q === 'dark') return undefined;   // review link: no flag burned
      const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.localStorage.setItem(INTRO_KEY, '1');
      if (still) return undefined;
      // Read the reader's own register BEFORE the first step forces one, since
      // that is where the demonstration has to leave them.
      const mine = readStageTheme();
      root = document.documentElement;
      root.classList.add(FLIP_CLASS);
      introLive = true;
      show('dark');
      const at = (ms, fn) => ts.push(setTimeout(() => { if (!introLive) { end(); return; } fn(); }, ms));
      at(900, () => show('light'));
      at(2400, () => { introShow = null; pushStageTheme(mine); setShowing(mine); });
      at(3800, end);
    } catch (e) {}
    return () => {
      for (const t of ts) clearTimeout(t);
      // A cap that unmounts mid-flip must not leave the reader stranded in a
      // register they never chose, so the cleanup drops the forced value FIRST
      // and then puts the stored one back. Dropping it first is the whole
      // point: readStageTheme answers with the forced register while it is set.
      if (introLive) { introLive = false; introShow = null; pushStageTheme(readStageTheme()); }
      if (root) root.classList.remove(FLIP_CLASS);
    };
  }, []);
  return showing;
}

export function writeStageTheme(next) {
  // A reader who has touched the switch has learned it. The demonstration stops
  // where it is rather than flipping the page back under their hand, and drops
  // its forced register so this write is what the store reads from here on.
  introLive = false;
  introShow = null;
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
