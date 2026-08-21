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
  ink: '#0b0c0e',          // primary text (near-black)
  muted: '#3f4757',        // secondary text (aliased as faded / soft / muted)
  slate: '#646c7a',        // tertiary text, captions
  accent: '#1e3a8a',       // brand accent, the header card (aliased as ember / navy)
  white: '#ffffff',
  paper: '#f4f6f9',        // page ground on the daily surfaces
  surface: '#f7f8fa',      // cards and raised surfaces (aliased as cream)
  surfaceAlt: '#eef2f7',   // header surface
  border: '#e5e7eb',
  // The Loft ground: the navy the daily puzzle pages sit on, and the quiz home
  // ground since 2026-08-12. It is a GROUND, not a surface: cards stay white on
  // top of it. Distinct from `accent` (#1e3a8a), which is the header card, and
  // several steps darker so the header still reads as an object against it.
  //
  // LIFTED FROM #0d1830 TO #14264f (owner, 2026-08-13). Same hue, but the old
  // value sat at 12% lightness under a header running #1e3a8a (33%) into
  // #16307a (28%), and a 16-point drop in one edge stops reading as a step down
  // the same ramp: the ground read as black rather than as brand navy, and the
  // header ended at a cliff. 19% keeps the header an object against it while
  // putting all three values on one ramp. The white cards also stop punching a
  // 15.6:1 hole in it (now ~11.9:1), so they read as lit surfaces rather than
  // cut-outs, which is what the ground was chosen for in the first place.
  //
  // The token is used in exactly one place, `.qzloft` in QuizHomeClient, so
  // this moves the quiz home and nothing else. The daily puzzle pages carry
  // their own literals and were deliberately left alone.
  ground: '#14264f',

  // --- blue ramp ---
  blue: '#2563eb',
  blueDeep: '#1d4ed8',
  blueDark: '#1e3a8a',     // same value as `accent`: accent is the role, blueDark the ramp step
  blue400: '#60a5fa',
  blue200: '#bfdbfe',
  accentSoft: '#eef3ff',
  accentBorder: '#cddffb',

  // --- call to action ---
  // Split out of `gold` deliberately. One token was serving BOTH the primary button and the
  // first-place medal, so recolouring gold for the rebrand would have turned the podium blue.
  // `gold` below is now the medal colour only.
  cta: '#2563eb',
  ctaInk: '#ffffff',
  ctaHover: '#1d4ed8',

  // --- semantic (deliberately unchanged by the rebrand) ---
  success: '#10b981',
  successDeep: '#15803d',
  danger: '#c0392b',       // wrong-answer / destructive. NOT the retired brand red.

  // --- medals (podium only, never a button) ---
  gold: '#e8b43a',
  goldInk: '#a16207',
  silver: '#aeb4bd',
  bronze: '#c88a55',
};
// The Mind Loft palette is LIVE as of this commit. The previous values are kept below purely
// as a record of what the flip changed, since every one of them is now unreachable from code:
//   ink #1c1e24 -> #0b0c0e      muted #262b35 -> #3f4757    slate #46506a -> #6b7280
//   accent #0e1d40 -> #1e3a8a   paper #eceef1 -> #f4f6f9    surfaceAlt #eef1f5 -> #eef2f7
//   border #c3ccda -> #e5e7eb   (blue400 / blue200 are new)
// Semantic and medal colours were deliberately left alone: they encode meaning, not brand.

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
