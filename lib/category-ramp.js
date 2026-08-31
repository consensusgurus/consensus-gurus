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
// THREE COLOUR SYSTEMS, DELIBERATELY INDEPENDENT (owner, 2026-08-30). This is
// the note to read before "fixing" any of what follows, because every part of
// it looks like an inconsistency and none of it is:
//
//   * RAMP order is IDENTITY and is CANONICAL. This file. It cannot be per
//     user, because a game page is server-rendered and cannot read a browser's
//     preference, so a user-ordered ramp would paint every stage the wrong
//     colour until hydration and then repaint it.
//   * SHELF order is PRESENTATION and is PER USER. CAT_ORDER in
//     app/today/TodayClient.jsx, hand-draggable, stored under `sot_cat_order`.
//     It MAY disagree with the ramp order, and the owner has ruled that it may.
//     Heat climbing this file's order and the reader's own page running in a
//     different order is an accepted outcome, not a bug to chase.
//   * CAT_BLUE in lib/home-blues.js is the HOME's band colour and it is a
//     separate table with separate rules (4.5:1 on white, neighbours 30 degrees
//     apart), because a filled band on the home is a different problem from a
//     pastel fill on a near-black stage. The ramp is NOT required to reproduce
//     its progression. Measured, the two sit a mean of 70 degrees apart in hue,
//     so most categories read as one colour on the home tile and another on
//     their own page. That was weighed and accepted.
//
// So: reorder your shelves all you like, and do not reach for a reassignment
// that makes these tables rhyme. If that is ever wanted, it is a pure
// permutation of the nine values below, no new colours, and it takes the mean
// gap to 35 degrees. It is a decision, not a cleanup.
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

// THE SAME NINE HUES, ONE STEP DEEP, for a pale ground.
//
// A pastel fill cannot carry on white: it is nearly the ground. So the light
// register keeps the HUES, which are what say which category this is, and
// takes them down to a value that carries WHITE ink instead of dark. That is
// the only difference between the two ramps, and it is why a category is
// recognisably itself in either.
//
// scripts/verify-category-ramp.mjs proves both sets rather than trusting this.
export const CATEGORY_RAMP_LIGHT = [
  '#0369a1', // sky      Word
  '#047857', // mint     Numbers
  '#4d7c0f', // lime     Logic
  '#a16207', // gold     End Game
  '#c2410c', // orange   Trivia
  '#be123c', // rose     Geography
  '#a21caf', // magenta  Cards
  '#6d28d9', // violet   Crowd Psychology
  '#b45309', // amber    Arcade
];

// White, because every light step above is a mid-tone that carries it.
export const RAMP_INK_LIGHT = '#ffffff';

// The pale ground the light register sits on. T.paper.
export const STAGE_GROUND_LIGHT = '#f4f6f9';

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
 * The same CATEGORY in the light register. The home needs this: it colours by
 * category rather than by game, and on the pale ground a category has to wear
 * its dark twin exactly as a game's accent does.
 */
export function categoryColorLight(cat) {
  const i = rampIndexFor(cat);
  return i < 0 ? CATEGORY_RAMP_LIGHT[0] : CATEGORY_RAMP_LIGHT[i];
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

/** The same game's step in the LIGHT register. Same hue, one step deep. */
export function gameColorLight(key) {
  const g = DAILY_GAME_MAP[key];
  const i = rampIndexFor(g && g.cat);
  return i < 0 ? CATEGORY_RAMP_LIGHT[0] : CATEGORY_RAMP_LIGHT[i];
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
