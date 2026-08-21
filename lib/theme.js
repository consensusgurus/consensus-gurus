// Single source of truth for brand colour.
//
// Before this file existed, every client component declared its own `const COLORS = {...}`
// with raw hex literals, and the token NAMES had drifted from their values (the `ember`
// token, once red, has held navy since the 2026 palette change). That made a brand change
// a 170-file find-and-replace. It is now a one-file change here.
//
// Two ways to consume a token, and the choice is NOT stylistic:
//
//   * JS / JSX values                     -> import { T } from '@/lib/theme';  color: T.ink
//   * CSS text inside a <style> template  -> var(--ink)
//
// Use the CSS variable ONLY in real CSS text. Anything consumed by Satori (next/og
// ImageResponse: the OG, share and poster image routes) MUST use the JS value, because
// Satori does not resolve CSS custom properties and silently drops the colour.
//
// These are the live Mind Loft values. Changing brand colour means editing THIS table and the
// matching :root block in app/globals.css together; scripts/check-theme.mjs fails if they drift.

export const T = {
  // --- structure ---
  // MIDNIGHT (2026-08-21). Same blue, much darker ground. Every LIGHT neutral below is
  // byte-identical to the palette this replaced; only the dark chrome and the CTA moved.
  ink: '#0b0d12',            // primary text (near-black)
  muted: '#3f4757',          // secondary text (aliased as faded / soft / muted)
  slate: '#646c7a',          // tertiary text, captions
  accent: '#233a63',         // brand accent, the header card (aliased as ember / navy)
  white: '#ffffff',
  paper: '#f4f6f9',          // page ground on the daily surfaces
  surface: '#f7f8fa',        // cards and raised surfaces (aliased as cream)
  surfaceAlt: '#eef2f7',     // header surface
  border: '#e5e7eb',
  // The Loft ground, taken from a mid navy down to near-black. This is the change: the
  // white cards now read as lit surfaces against it instead of as cut-outs, and the game
  // state colours (green, red, gold) have far more room than they did on #14264f.
  //
  // The header still reads as an OBJECT against it, and by a wider margin than before:
  // accent-on-ground is 1.69:1 here against 1.43:1 for the old #1e3a8a on #14264f.
  ground: '#0b0f1a',

  // --- blue ramp ---
  blue: '#2f6fe4',
  blueDeep: '#2563eb',
  blueDark: '#233a63',     // same value as `accent`: accent is the role, blueDark the ramp step
  blue400: '#60a5fa',
  blue200: '#bfdbfe',
  accentSoft: '#eef3ff',
  accentBorder: '#cddffb',

  // --- call to action ---
  // Brightened ONE step so it still carries against a near-black page. It cannot go
  // brighter: #3b82f6 was tried and is 3.68:1 on white, which fails every one of the ~80
  // call sites that pair `T.cta` with `T.white` rather than `T.ctaInk`. This is 4.65:1.
  cta: '#2f6fe4',
  ctaInk: '#ffffff',
  ctaHover: '#2563eb',

  // --- semantic (untouched, as in every palette change) ---
  // Midnight was chosen partly BECAUSE it leaves these alone. Blue acts, red fails, green
  // confirms, gold marks partial, and none of them is anywhere near the brand hue.
  success: '#10b981',
  successDeep: '#15803d',
  danger: '#c0392b',

  // --- medals (podium only, never a button) ---
  gold: '#e8b43a',
  goldInk: '#a16207',
  silver: '#aeb4bd',
  bronze: '#c88a55',
};
// Midnight is LIVE as of this commit. The whole diff from the Mind Loft navy palette:
//   ground  #14264f -> #0b0f1a      accent / blueDark #1e3a8a -> #233a63
//   blue / cta #2563eb -> #2f6fe4   blueDeep / ctaHover #1d4ed8 -> #2563eb
//   ink     #0b0c0e -> #0b0d12
// muted, slate, paper, surface, surfaceAlt, border, blue400, blue200, accentSoft,
// accentBorder, success, successDeep, danger, gold, goldInk, silver and bronze are all
// UNCHANGED. Sixteen of the twenty-seven tokens did not move.

// Token name -> CSS custom property. Kept here so the :root block in globals.css and the
// JS tokens cannot drift apart; scripts/check-theme.mjs asserts the two agree.
export const CSS_VAR = {
  ink: '--ink',
  muted: '--muted',
  slate: '--slate',
  accent: '--accent',
  white: '--white',
  paper: '--paper',
  surface: '--surface',
  surfaceAlt: '--surface-alt',
  border: '--border',
  ground: '--ground',
  blue: '--blue',
  blueDeep: '--blue-deep',
  blueDark: '--blue-dark',
  blue400: '--blue-400',
  blue200: '--blue-200',
  accentSoft: '--accent-soft',
  accentBorder: '--accent-border',
  cta: '--cta',
  ctaInk: '--cta-ink',
  ctaHover: '--cta-hover',
  success: '--success',
  successDeep: '--success-deep',
  danger: '--danger',
  gold: '--gold',
  goldInk: '--gold-ink',
  silver: '--silver',
  bronze: '--bronze',
};

export default T;
