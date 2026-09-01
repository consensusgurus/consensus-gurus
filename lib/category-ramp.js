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
// permutation of the ten values below, no new colours, and it takes the mean
// gap to 35 degrees. It is a decision, not a cleanup.
//
// SUDOKU IS A CATEGORY, as of 2026-09-01. It was a browsing shelf the home
// split out of Numbers while the nine grids stayed `cat: 'Numbers'` in the
// registry, so they took the Numbers step on their own pages and the shelf and
// the stage disagreed. They are `cat: 'Sudoku'` now and carry their own step,
// which is what the home's CAT_ORDER had already been listing them as.
//
// THE TENTH STEP COST THE QUIZ ITS ACCENT, and that trade is the thing to know
// before moving either. Periwinkle was the ONE hue no daily category wore,
// which is exactly why lib/quiz-stage.js had taken it: measured, the only two
// gaps on this ramp wider than 60 degrees are the green at ~119 and the
// periwinkle at ~230, and the green one dies on the light register, where Logic
// is already green at 137 and Numbers at 163. So there was one slot, the quiz
// held it, and Sudoku took it. The quiz accent moved to a neutral slate rather
// than to another hue, because after this there is no hue left further than 28
// degrees from a category. An ELEVENTH category means either widening that
// rule or accepting a near-collision; it is not a free step.

import { DAILY_GAME_MAP } from './daily-games';

// The ten categories in lib/daily-games.js, in ramp order.
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
  'Sudoku',
];

// Cool to warm. The first eight are LADDER_RAMP verbatim, so a Gauntlet bank
// and its category read as the same colour family rather than as two systems.
// The ninth exists because the roster grew past the eight LADDER_RAMP was
// written for, and it is deliberately at the warm end, past violet, rather
// than squeezed between two existing steps. The tenth is APPENDED for the same
// reason and not inserted: periwinkle reads cool and belongs beside sky by hue,
// but the array index IS the category's identity, so slotting it at position 1
// would renumber eight categories to buy nothing. Order here is a mapping, not
// a gradient, and the cool-to-warm reading already ends at the eighth step.
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
  '#a5b4fc', // periwinkle Sudoku
];

// ONE INK FOR EVERY STEP OF THE DARK RAMP. Each colour there is a
// high-lightness pastel, so a single near-black carries on all ten at 6:1 or
// better; scripts/verify-category-ramp.mjs proves that rather than trusting
// this comment. Do not dim it with opacity: the contrast was measured at full
// strength. Declared here, above the light ramp, because the light ramp's ink
// table reuses it for the three steps that stay pastel.
export const RAMP_INK = '#08222e';

// THE SAME TEN HUES, ONE STEP DEEP, for a pale ground.
//
// A pastel fill cannot carry on white: it is nearly the ground. So the light
// register keeps the HUES, which are what say which category this is, and
// takes them down to a value that carries WHITE ink instead of dark. That is
// the only difference between the two ramps, and it is why a category is
// recognisably itself in either.
//
// scripts/verify-category-ramp.mjs proves both sets rather than trusting this.
// WHY THE LIGHT TWINS ARE DARK, since the switch is the first thing anyone
// asks: the accent CARRIES WHITE TEXT (RAMP_INK_LIGHT below), so on a pale
// ground each step has to be dark enough to hold it. The dark register is the
// mirror — a pale step on a near-black page. Same hue, opposite end.
//
// That constraint is also the trap: a 700-weight is not automatically a good
// colour. Lime's was #4d7c0f, which is olive rather than lime and was the one
// step on the ramp that looked wrong (owner, 2026-08-31). When replacing one,
// keep white above 4.5:1 and keep it distinct from its NEIGHBOURS on the ramp.
// WHY THE LIGHT TWINS ARE DARK, since the switch is the first thing anyone
// asks: the accent CARRIES WHITE TEXT (RAMP_INK_LIGHT below), so on a pale
// ground each step must be dark enough to hold it. The dark register is the
// mirror — a pale step on a near-black page. Same hue, opposite end.
//
// LOGIC IS THE ONE DELIBERATE EXCEPTION (owner, 2026-08-31). Lime made dark
// enough for white text is OLIVE — that is inherent to a dark yellow-green, not
// a bad pick — and the owner would rather have two different colours than a
// muddy one. So Logic is lime on the dark register and GREEN on the light one,
// 55 degrees apart, and scripts/verify-category-ramp.mjs exempts it by name.
// Do not "fix" the mismatch: it was chosen. Every other step stays same-hue.
// THE WARM STEPS DO NOT DARKEN, THEY FLIP THEIR INK (owner, 2026-08-31). The
// rule above -- take the hue down until it holds WHITE text -- works for seven of
// the ten and produces a BROWN for the other three, because gold, amber and
// orange have nowhere darker to go. #a16207 was End Game's, and on a light page
// the whole curtain, the Share card and every accent chip read brown. Logic had
// already hit the same wall from the green end and was answered by changing the
// colour; the owner's answer here is better and generalises: keep the hue AND
// the value, and change the INK instead. A gold band with near-black text is
// exactly what the dark register renders, and it is gold on either page.
//
// The cost, and it was weighed: a pastel fill on a pale ground is only about
// 1.7:1 against it, so a warm accent chip has a soft EDGE in light mode where a
// cool one has a hard one. The text on it is 8:1 and up, which is the contrast
// that carries meaning, and verify-category-ramp.mjs states this rather than
// silently exempting it.
export const CATEGORY_RAMP_LIGHT = [
  '#0369a1', // sky      Word              white ink
  '#047857', // mint     Numbers           white ink
  '#1a7f37', // green    Logic             white ink  — see the hue note below
  '#e8b43a', // gold     End Game          dark ink
  '#fb923c', // orange   Trivia            dark ink
  '#be123c', // rose     Geography         white ink
  '#a21caf', // magenta  Cards             white ink
  '#6d28d9', // violet   Crowd Psychology  white ink
  '#fbbf24', // amber    Arcade            dark ink
  '#3949ab', // periwinkle Sudoku           white ink
];

// ONE INK PER STEP, not one for the ramp. Seven steps are mid-tones that carry
// white; the three warm ones are pastels that carry the dark ink instead. This
// is the array the light register's --stg-onramp is set from, per game, so a
// stage never has to know which case its own category is.
export const RAMP_INK_LIGHT = [
  '#ffffff', // Word
  '#ffffff', // Numbers
  '#ffffff', // Logic
  RAMP_INK,  // End Game
  RAMP_INK,  // Trivia
  '#ffffff', // Geography
  '#ffffff', // Cards
  '#ffffff', // Crowd Psychology
  RAMP_INK,  // Arcade
  '#ffffff', // Sudoku
];

// The pale ground the light register sits on. T.paper.
export const STAGE_GROUND_LIGHT = '#f4f6f9';

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

/**
 * The ink that carries ON that light step: white for the six mid-tones, the
 * near-black RAMP_INK for the three warm pastels. Every stage client hands this
 * to the page as --stg-onramp-lt, so the light register's --stg-onramp resolves
 * per category and no surface has to know which case it is in.
 */
export function categoryOnrampLight(cat) {
  const i = rampIndexFor(cat);
  return i < 0 ? RAMP_INK_LIGHT[0] : RAMP_INK_LIGHT[i];
}

/** The same, by game key, which is all a stage knows about itself. */
export function gameOnrampLight(key) {
  const g = DAILY_GAME_MAP[key];
  return categoryOnrampLight(g && g.cat);
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

/**
 * THE TWO-STEP FEEDBACK PAIR, for a board that has to say "right" and "nearly"
 * (owner, 2026-09-01).
 *
 * Garble's fed letters were gold #e6b93f and Barter's tiles were Wordle's green
 * and yellow. All three were picked before the category ramp existed and belong
 * to no part of the system: on a Word stage the page is sky and the board was
 * a different colour arguing with it. Worse, Garble had already half-converted
 * — the marked tile's FILL was var(--stg-acc) while every border beside it
 * stayed literal gold, so a sky tile sat inside a gold ring.
 *
 * So both states are the category step, two values deep. STRONG is --stg-acc
 * itself, which means the pair follows a category without an edit here and is
 * correct on both registers by construction: sky #7dd3fc with near-black ink on
 * the dark stage, deep sky #0369a1 with white ink on the light one.
 *
 * SOFT is that same hue mixed back toward the ground, so "spoken for, but not
 * home" reads as the SAME thing one step weaker rather than as a second colour.
 * Its ink is --stg-ink, not --stg-onramp: a mix that is mostly ground is
 * carried by the ground's own ink, and --stg-onramp is only guaranteed against
 * the step at full strength. Measured at 48%: 4.7:1 on the dark register,
 * 8.1:1 on the light one. Moving the percentage moves both, so re-measure.
 *
 * WHY STRINGS AND NOT HEXES. These are the one part of the ramp that must
 * resolve per register at PAINT time rather than per game at render time, and
 * only a var() can do that. The fallbacks are what an off-stage (?stage=0) Loft
 * page resolves to, so a caller needs no STAGE branch. They are exported from
 * here, rather than declared in each client, because two games have to agree
 * about them and two hand-kept copies of a colour is how a pair drifts.
 *
 * A caller wanting the pair as data (a share card, an OG image) should read the
 * ramp functions above instead: these carry no value a script can inspect.
 */
export const FEED_STRONG = 'var(--stg-acc, #0369a1)';
export const FEED_STRONG_INK = 'var(--stg-onramp, #ffffff)';
export const FEED_SOFT = 'color-mix(in srgb, var(--stg-acc, #0369a1) 48%, var(--stg-ground, #eef1f6))';
export const FEED_SOFT_INK = 'var(--stg-ink, #0b1220)';
