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
// PHASE 1 HOLDS THE CURRENT VALUES. These are the hexes the site ships today, so the
// tokenisation commit is a pure refactor with no visual change: anything that looks
// different after it is a bug, not a restyle. The Mind Loft palette is staged in
// MIND_LOFT below and gets swapped in as its own reviewable commit.

export const T = {
  // --- structure ---
  ink: '#1c1e24',          // primary text
  muted: '#262b35',        // secondary text (aliased as faded / soft / muted)
  slate: '#46506a',        // tertiary text, captions
  accent: '#0e1d40',       // navy brand accent (aliased as ember / navy / accent)
  white: '#ffffff',
  paper: '#eceef1',        // page ground on the daily surfaces
  surface: '#f7f8fa',      // cards and raised surfaces (aliased as cream)
  surfaceAlt: '#eef1f5',   // header surface
  border: '#c3ccda',

  // --- blue ramp ---
  blue: '#2563eb',
  blueDeep: '#1d4ed8',
  blueDark: '#1e3a8a',
  accentSoft: '#eef3ff',
  accentBorder: '#cddffb',

  // --- semantic ---
  success: '#10b981',
  successDeep: '#15803d',
  danger: '#c0392b',       // wrong-answer / destructive. NOT the retired brand red.

  // --- medals ---
  gold: '#e8b43a',
  goldInk: '#a16207',
  silver: '#aeb4bd',
  bronze: '#c88a55',
};

// Staged Mind Loft palette (black plus blues, on white). NOT live. Flipping the rebrand
// means merging these values into T above in one commit, so the visual change is
// reviewable on its own rather than tangled with the tokenisation diff.
export const MIND_LOFT = {
  ink: '#0b0c0e',
  blueDark: '#1e3a8a',
  blue: '#2563eb',
  blue400: '#60a5fa',
  blue200: '#bfdbfe',
  white: '#ffffff',
  surface: '#f7f8fa',
  border: '#e5e7eb',
};

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
  blue: '--blue',
  blueDeep: '--blue-deep',
  blueDark: '--blue-dark',
  accentSoft: '--accent-soft',
  accentBorder: '--accent-border',
  success: '--success',
  successDeep: '--success-deep',
  danger: '--danger',
  gold: '--gold',
  goldInk: '--gold-ink',
  silver: '--silver',
  bronze: '--bronze',
};

export default T;
