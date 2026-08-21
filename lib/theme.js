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
  // WARM SLATE & CORAL (2026-08-21). The NEUTRALS are warm and the GROUND is a warm slate.
  // The signal colours are stock: blue acts, red fails, green confirms.
  ink: '#14141a',            // primary text (near-black, warmed)
  muted: '#4d4a52',          // secondary text (aliased as faded / soft / muted)
  slate: '#716d79',          // tertiary text, captions
  accent: '#1e3a8a',         // brand accent, the header card (aliased as ember / navy)
  white: '#ffffff',
  paper: '#f7f5f4',          // page ground on the daily surfaces
  surface: '#fbfaf9',        // cards and raised surfaces (aliased as cream)
  surfaceAlt: '#f0eeec',     // header surface
  border: '#e4e0dd',
  // The Loft ground, warmed and desaturated out of navy. Cards stay light on top of it and
  // it stays well clear of `accent`, so the header still reads as an object against it.
  ground: '#23283a',

  // --- blue ramp ---
  blue: '#2563eb',
  blueDeep: '#1d4ed8',
  blueDark: '#1e3a8a',     // same value as `accent`: accent is the role, blueDark the ramp step
  blue400: '#60a5fa',
  blue200: '#bfdbfe',
  accentSoft: '#eef3ff',
  accentBorder: '#cddffb',

  // --- call to action ---
  // Kept split from `gold` so recolouring one never moves the podium.
  cta: '#2563eb',
  ctaInk: '#ffffff',
  ctaHover: '#1d4ed8',

  // --- semantic ---
  // ACT AND FAIL MUST NOT SHARE A HUE FAMILY. A coral CTA shipped briefly against this red
  // and the pair was unreadable: both said "warm", so the only thing separating a primary
  // button from a wrong answer was how dark it was. Widening the red to #8f1d24 was tried
  // and did not fix it, because the problem is the category, not the distance. Blue acts,
  // red fails, and the two are never confusable at a glance.
  success: '#10b981',
  successDeep: '#15803d',
  danger: '#c0392b',

  // --- medals (podium only, never a button) ---
  gold: '#e0ae4a',
  goldInk: '#8a6410',
  silver: '#aeb4bd',
  bronze: '#c88a55',

  // --- coral: the spot colour, and it NEVER carries meaning ---
  // Identity only: the wordmark, section eyebrows, decorative rules. Never a button, never
  // a status, never a chart series. That restriction is the whole reason it can coexist
  // with `danger`. If it ever lands on something a reader must ACT on or READ A STATE from,
  // this palette is back to the bug above.
  //
  // Two values because the wordmark sits on light headers and dark ones: `coral` is 4.9:1
  // on white but only 2.9:1 on the navy bar, so dark grounds take `coralLight`.
  coral: '#c04a34',
  coralLight: '#f0a996',
};
// Warm Slate & Coral is LIVE as of this commit. What it changed from Mind Loft navy:
//   ink #0b0c0e -> #14141a      muted #3f4757 -> #4d4a52     slate #646c7a -> #716d79
//   paper #f4f6f9 -> #f7f5f4    surface #f7f8fa -> #fbfaf9   surfaceAlt #eef2f7 -> #f0eeec
//   border #e5e7eb -> #e4e0dd   ground #14264f -> #23283a
//   gold #e8b43a -> #e0ae4a     goldInk #a16207 -> #8a6410
//   NEW: coral #c04a34 / coralLight #f0a996
// accent, the blue ramp, cta, success, successDeep, danger, silver and bronze are all
// UNCHANGED from the navy palette. Only the neutrals warmed.

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
  coral: '--coral',
  coralLight: '--coral-light',
};

export default T;
