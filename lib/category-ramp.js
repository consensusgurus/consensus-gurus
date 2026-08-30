// THE CATEGORY RAMP: one colour per daily-game category, and the only place
// a stage, a stage CTA or a stage ladder gets its colour from.
//
// WHY A RAMP AND NOT THE REGISTRY HUES. Every game in lib/daily-games.js
// carries its own `color`, and those were each chosen once, for one game,
// against a navy slate row. As a SET they collide: Atlas #4ade9c and Biz
// #4fbf8b are both mid green and worse in their light values. The Gauntlet run
// hit this first and answered it with a run-local ramp (LADDER_RAMP in
// lib/circuits.js), cool to warm, every step a high-lightness pastel carrying
// dark ink. This is that answer generalised from one run to the whole roster.
//
// WHAT THE ORDER MEANS. Heat climbs RAMP_ORDER, so a category's colour says
// where it sits in the canonical order and nothing else. That order is fixed
// and shared by every surface. It is NOT the home's shelf order (CAT_ORDER in
// app/today/TodayClient.jsx), and the two must not be conflated:
//
//   * SHELF order is presentation and is PER USER. It is hand-draggable and
//     lives in localStorage under `sot_cat_order`.
//   * RAMP order is identity and is CANONICAL. It cannot be per user, because
//     a game page is server-rendered and cannot read a browser's preference,
//     so a user-ordered ramp would paint every stage the wrong colour until
//     hydration and then repaint it.
//
// Reorder your shelves all you like; Word stays sky.
//
// SUDOKU IS NOT A CATEGORY HERE. The home splits a Sudoku shelf out of Numbers
// for browsing, and those grids are `cat: 'Numbers'` in the registry, so they
// take the Numbers step on their own pages. The shelf is a subdivision, not a
// tenth category.

import { DAILY_GAME_MAP } from './daily-games';

// The nine categories in lib/daily-games.js, in ramp order.
export const RAMP_ORDER = [
  'Word',
  'Numbers',
  'Logic',
  'End Game',
  'Trivia',
  'Geography',
  'Cards',
  'Crowd Psychology',
  'Arcade',
];

// Cool to warm. The first eight are LADDER_RAMP verbatim, so a Gauntlet bank
// and its category read as the same colour family rather than as two systems.
// The ninth exists because the roster grew past the eight LADDER_RAMP was
// written for, and it is deliberately at the warm end, past violet, rather
// than squeezed between two existing steps.
export const CATEGORY_RAMP = [
  '#7dd3fc', // sky      Word
  '#6ee7b7', // mint     Numbers
  '#bef264', // lime     Logic
  '#e8b43a', // gold     End Game
  '#fb923c', // orange   Trivia
  '#fb7185', // rose     Geography
  '#e879f9', // magenta  Cards
  '#c084fc', // violet   Crowd Psychology
  '#fbbf24', // amber    Arcade
];

// ONE INK FOR EVERY STEP. Each ramp colour is a high-lightness pastel, so a
// single near-black carries on all nine at 6:1 or better; scripts/verify-
// category-ramp.mjs proves that rather than trusting this comment. Do not dim
// it with opacity: the contrast was measured at full strength.
export const RAMP_INK = '#08222e';

// The stage ground. Same value as T.ground, restated so a file that wants the
// ramp does not have to import the whole theme to know what it sits on.
export const STAGE_GROUND = '#0b0f1a';

const FALLBACK = CATEGORY_RAMP[0];

function norm(cat) {
  return String(cat || '').trim().toLowerCase();
}

const INDEX = new Map(RAMP_ORDER.map((c, i) => [norm(c), i]));
// The spellings that reach this from real data. 'endgame' is how a couple of
// older call sites write it and 'crowd' is the short form the home uses.
INDEX.set('endgame', INDEX.get('end game'));
INDEX.set('crowd', INDEX.get('crowd psychology'));
// Browsing shelf, registry category Numbers. See the note at the top.
INDEX.set('sudoku', INDEX.get('numbers'));

/** Ramp index for a category name, or -1 when it is not one. */
export function rampIndexFor(cat) {
  const i = INDEX.get(norm(cat));
  return i == null ? -1 : i;
}

/** The colour for a category name. Falls back to the first step, never to nothing. */
export function categoryColor(cat) {
  const i = rampIndexFor(cat);
  return i < 0 ? FALLBACK : CATEGORY_RAMP[i];
}

/**
 * The colour for a GAME, by its registry key. This is the call a stage makes:
 * it knows its own key and nothing else. A key the registry does not hold
 * returns the fallback rather than throwing, because a stage with a slightly
 * wrong colour is a bug and a stage that will not render is an outage.
 */
export function gameColor(key) {
  const g = DAILY_GAME_MAP[key];
  return categoryColor(g && g.cat);
}

/** The category a game belongs to, for a stage's own eyebrow. */
export function gameCategory(key) {
  const g = DAILY_GAME_MAP[key];
  return (g && g.cat) || null;
}

/**
 * THE CTA RULE (owner, 2026-08-30). A surface that belongs to a category takes
 * that category's ramp step, with RAMP_INK on it, and that is its primary
 * button. This replaces T.cta on those surfaces, because T.cta was the only
 * mid-tone saturated fill on a stage and the only fill carrying white ink,
 * which made it read as a button borrowed from another design.
 *
 * A surface with NO category (a list, the quiz home, an account page) keeps
 * T.cta unchanged. Returns the pair, so a caller never has to remember which
 * ink goes with it.
 */
export function ctaFor(key) {
  return { bg: gameColor(key), ink: RAMP_INK };
}
