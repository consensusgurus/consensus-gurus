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
  // WARM SLATE & CORAL (2026-08-21). Every neutral moved warm and the brand hue moved off
  // blue. The prior Mind Loft values are recorded at the foot of this file.
  ink: '#14141a',            // primary text (near-black, warmed)
  muted: '#4d4a52',          // secondary text (aliased as faded / soft / muted)
  slate: '#716d79',          // tertiary text, captions
  accent: '#3a4152',         // brand accent, the header card (aliased as ember / navy)
  white: '#ffffff',
  paper: '#f7f5f4',          // page ground on the daily surfaces
  surface: '#fbfaf9',        // cards and raised surfaces (aliased as cream)
  surfaceAlt: '#f0eeec',     // header surface
  border: '#e4e0dd',
  // The Loft ground. Still a GROUND, not a surface: cards stay light on top of it, and it
  // stays several steps darker than `accent` so the header reads as an object against it.
  // The white cards land at 14.0:1 against it, which is where the navy version sat.
  ground: '#23283a',

  // --- coral ramp ---
  // Named `blue` for the same reason `ember` held navy through the last change: the token
  // NAMES are the site's vocabulary and renaming 107 call sites to chase a hue is how a
  // rename codemod eats something it should not. The name is the role, the value is coral.
  blue: '#c04a34',
  blueDeep: '#a83f28',
  blueDark: '#3a4152',     // same value as `accent`, exactly as before: accent is the role
  blue400: '#e9917c',
  blue200: '#f6d8d0',
  accentSoft: '#fdf2ef',
  accentBorder: '#f2cfc4',

  // --- call to action ---
  // Kept split from `gold` so recolouring one never moves the podium.
  //
  // CORAL IS #c04a34 AND NOT A LIGHTER ONE, and that is a contrast constraint rather than a
  // taste call. `T.cta` is paired with `T.white` at roughly 80 call sites and with
  // `T.ctaInk` at 22, so the CTA has to hold white text: a prettier #e2674f lands at 3.34:1
  // and would fail every one of those buttons. #c04a34 is 4.92:1.
  cta: '#c04a34',
  ctaInk: '#ffffff',
  ctaHover: '#a83f28',

  // --- semantic ---
  // success / successDeep are untouched, as in every previous palette change: they encode
  // meaning, not brand.
  success: '#10b981',
  successDeep: '#15803d',
  // DANGER MOVED, and only because it collided. The old #c0392b sits 29 units from the new
  // CTA #c04a34, so the wrong-answer red and the primary button would have been the same
  // colour on every game page. #8f1d24 is a deeper crimson: still unmistakably an error,
  // 80 units clear of the CTA, and 8.5:1 on surface.
  danger: '#8f1d24',

  // --- medals (podium only, never a button) ---
  gold: '#e0ae4a',
  goldInk: '#8a6410',
  silver: '#aeb4bd',
  bronze: '#c88a55',
};
// Warm Slate & Coral is LIVE as of this commit. What it changed, for the record:
//   ink #0b0c0e -> #14141a       muted #3f4757 -> #4d4a52     slate #646c7a -> #716d79
//   accent #1e3a8a -> #3a4152    paper #f4f6f9 -> #f7f5f4     surface #f7f8fa -> #fbfaf9
//   surfaceAlt #eef2f7 -> #f0eeec  border #e5e7eb -> #e4e0dd  ground #14264f -> #23283a
//   blue #2563eb -> #c04a34      blueDeep #1d4ed8 -> #a83f28  blueDark #1e3a8a -> #3a4152
//   blue400 #60a5fa -> #e9917c   blue200 #bfdbfe -> #f6d8d0
//   accentSoft #eef3ff -> #fdf2ef  accentBorder #cddffb -> #f2cfc4
//   cta #2563eb -> #c04a34       ctaHover #1d4ed8 -> #a83f28
//   danger #c0392b -> #8f1d24    gold #e8b43a -> #e0ae4a      goldInk #a16207 -> #8a6410
// success, successDeep, silver and bronze were left alone.

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
