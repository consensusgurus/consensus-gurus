// verify-circuits.mjs — the checker for lib/circuits.js.
//
// Per the daily-puzzle authoring standard in CLAUDE.md: a rule that is not
// written down is not a rule, and a rule with no checker is not enforced. Every
// claim lib/circuits.js makes about its rosters is re-derived here from the
// registry rather than read back off the data it is checking.
//
// It RECOMPUTES, it does not trust. The coverage set comes from DAILY_KEYS and
// the retirement dates, not from a count written into this file, so adding a
// 66th daily fails this check the moment it lands rather than the moment
// somebody notices a game is in no circuit.
//
// Usage: node scripts/verify-circuits.mjs

import { DAILY_KEYS, DAILY_GAME_MAP, RETIRED_DAILY } from '../lib/daily-games.js';
import {
  CIRCUITS, ALL_CIRCUITS, MARQUEE, MARQUEE_ID, CIRCUIT_NAME_LISTS,
  circuitById, circuitKeysFor, isMarquee,
} from '../lib/circuits.js';

const fails = [];
const warns = [];

// ── the measured clock ──────────────────────────────────────────────────────
// The SAME dated snapshot scripts/verify-daily-five.mjs carries, and it is
// copied rather than imported for the same reason it lives there: it is a
// measurement with a date on it, not a fact about the games, and a library that
// exported it would invite a client to render it as one. Re-measure both
// together. Median top-10 `timeElapsed` in seconds, MEASURED 2026-08-17.
const MEASURED = '2026-08-17';
const MED = {
  check: 21, dating: 22, turn: 23, defend: 28, four: 30, chain: 30, chomp: 34, emcee: 35,
  deep: 37, mate: 41, links: 43, extra: 44, garble: 51, bracket: 51, span: 53, sworn: 54,
  stet: 57, etch: 58, park: 61, blitz: 62, crunch: 63, streak: 66, ping: 69, listed: 75,
  taire: 78, jester: 89, hedge: 93, plot: 93, carve: 111, paths: 111, hands: 112, axiom: 114,
  venn: 128, sixes: 144, hearsay: 156, suffice: 172, blocks: 180, stands: 180, strata: 189,
  tuck: 201, babel: 201, barter: 202, docket: 221, alibi: 232, sweep: 257, cages: 270,
  redact: 276, shards: 304, tally: 337, rung: 360, glyph: 370, fib: 451, cipher: 455,
  suds: 482, warmer: 518, lode: 614, quilt: 699, crux: 1031, anon: 1106, sando: 1171,
  // The three crowd games post no comparable clock: you submit picks against a
  // pool, so the row's time is how long you deliberated. Estimated, flagged.
  outwit: 90, outrank: 90, feud: 90,
};
// The ascent tolerance, same reasoning as the Five's: the medians drift, and a
// re-measure must not fail a roster that was correctly ordered when it shipped.
const ASCENT_SLACK = 0.25;

// Games that cannot be in a circuit, and why.
const EXCLUDED = {
  pricer: 'pulled from the server slate (GAME_PUZZLES), so it has no board, no field and no points',
};

// ── 1. shape ────────────────────────────────────────────────────────────────
const MAX = 5;
if (ALL_CIRCUITS.length !== CIRCUITS.length + 1) {
  fails.push(`ALL_CIRCUITS should be the marquee plus every skill circuit (got ${ALL_CIRCUITS.length} for ${CIRCUITS.length} skill circuits)`);
}
if (!ALL_CIRCUITS[0] || ALL_CIRCUITS[0].id !== MARQUEE_ID) {
  fails.push('the marquee must be FIRST in ALL_CIRCUITS — it is the head of the cycle, and stepping left from it wraps to the last circuit');
}
if (MARQUEE.keys !== null) {
  fails.push('MARQUEE.keys must be null: its roster is a daily read out of lib/daily-five, and a caller reaching for .keys would silently get nothing');
}

const ids = new Set();
for (const c of CIRCUITS) {
  if (!c.id || !/^[a-z0-9-]+$/.test(c.id)) fails.push(`bad circuit id: ${JSON.stringify(c.id)}`);
  if (ids.has(c.id)) fails.push(`duplicate circuit id: ${c.id}`);
  ids.add(c.id);
  if (isMarquee(c.id)) fails.push(`a skill circuit may not use the marquee id (${MARQUEE_ID})`);
  if (!c.name || !c.blurb) fails.push(`${c.id}: needs both a name and a blurb (both are reader-facing on the band)`);
  if (!Array.isArray(c.keys) || c.keys.length < 2) fails.push(`${c.id}: needs at least 2 games to be a run`);
  else if (c.keys.length > MAX) fails.push(`${c.id}: ${c.keys.length} games, cap is ${MAX}`);
  if (circuitById(c.id) !== c) fails.push(`${c.id}: circuitById does not resolve to it`);
}

// ── 2. every key is a real, non-excluded game ───────────────────────────────
for (const c of CIRCUITS) {
  for (const k of c.keys || []) {
    if (!DAILY_GAME_MAP[k]) fails.push(`${c.id}: "${k}" is not a key in the daily registry`);
    if (EXCLUDED[k]) fails.push(`${c.id}: "${k}" is excluded from runs — ${EXCLUDED[k]}`);
  }
}

// ── 3. exclusive ────────────────────────────────────────────────────────────
// Every eligible daily sits in EXACTLY ONE skill circuit. That is what makes
// "finish all thirteen" mean "play everything", and what stops one play paying
// into two skill boards.
const owner = new Map();
for (const c of CIRCUITS) {
  for (const k of c.keys || []) {
    if (owner.has(k)) fails.push(`"${k}" is in two circuits: ${owner.get(k)} and ${c.id}`);
    else owner.set(k, c.id);
  }
}

// ── 4. exhaustive ───────────────────────────────────────────────────────────
// Derived from the registry, never from a number written down here. A game that
// retired in the PAST is out of scope (it has no live puzzle to run); a game
// with a FUTURE retirement date stays in and drops out of its circuit on its
// own at read time, which is why circuitKeysFor filters rather than the data.
const todayIso = new Date().toISOString().slice(0, 10);
const retiredAlready = (k) => {
  const d = RETIRED_DAILY[k];
  return !!d && d < todayIso;
};
const eligible = DAILY_KEYS.filter((k) => !EXCLUDED[k] && !retiredAlready(k));
const missing = eligible.filter((k) => !owner.has(k));
if (missing.length) {
  fails.push(`${missing.length} eligible daily game(s) are in NO circuit: ${missing.join(', ')}`);
}
const strays = [...owner.keys()].filter((k) => retiredAlready(k));
if (strays.length) warns.push(`retired game(s) still named in a circuit (harmless, filtered at read time): ${strays.join(', ')}`);

// ── 5. run order is shortest-median-first ───────────────────────────────────
// The marquee's own rule, applied to a fixed roster. A circuit opens with
// something you finish in half a minute and closes with the one that takes real
// time, so a player who has banked four games has a reason to start the fifth.
for (const c of CIRCUITS) {
  const keys = c.keys || [];
  const unknown = keys.filter((k) => !(k in MED));
  if (unknown.length) {
    warns.push(`${c.id}: no measured median for ${unknown.join(', ')} — order not checked for those`);
  }
  for (let i = 1; i < keys.length; i += 1) {
    const a = MED[keys[i - 1]];
    const b = MED[keys[i]];
    if (a == null || b == null) continue;
    if (b < a * (1 - ASCENT_SLACK)) {
      fails.push(`${c.id}: out of order — ${keys[i]} (${b}s) follows ${keys[i - 1]} (${a}s); rosters run shortest first`);
    }
  }
}

// ── 6. the derived name list cannot drop a game silently ────────────────────
// CIRCUIT_NAME_LISTS is what app/DailyStrip.jsx filters by. It maps keys to
// display names and drops anything unresolved, so a typo would quietly shrink a
// filter group rather than fail anywhere.
if (CIRCUIT_NAME_LISTS.length !== CIRCUITS.length) {
  fails.push('CIRCUIT_NAME_LISTS has a different length from CIRCUITS');
}
CIRCUIT_NAME_LISTS.forEach(([name, names], i) => {
  const c = CIRCUITS[i];
  if (!c) return;
  if (name !== c.name) fails.push(`CIRCUIT_NAME_LISTS[${i}] is named ${name}, expected ${c.name}`);
  if (names.length !== c.keys.length) {
    fails.push(`${c.id}: ${c.keys.length} keys but only ${names.length} resolved to a game name — a key is wrong`);
  }
});

// ── 7. the read accessors agree with the data ───────────────────────────────
for (const c of CIRCUITS) {
  const live = circuitKeysFor(c.id, todayIso);
  const expected = c.keys.filter((k) => DAILY_GAME_MAP[k] && !retiredAlready(k));
  if (live.join(',') !== expected.join(',')) {
    fails.push(`${c.id}: circuitKeysFor returned [${live.join(',')}], expected [${expected.join(',')}]`);
  }
  if (live.length < 2) {
    fails.push(`${c.id}: only ${live.length} live game(s) today — the band needs at least 2 to render a run`);
  }
  if (live.length < c.keys.length) {
    warns.push(`${c.id}: down to ${live.length} live games (retirement), was ${c.keys.length}`);
  }
}
if (!circuitKeysFor(MARQUEE_ID, todayIso).length) {
  warns.push(`the marquee has no run today (${todayIso}) — lib/daily-five's bank may need extending`);
}

// ── report ──────────────────────────────────────────────────────────────────
const cover = eligible.length;
console.log(`circuits: ${CIRCUITS.length} skill + 1 marquee`);
console.log(`coverage: ${owner.size} of ${cover} eligible dailies (excluded: ${Object.keys(EXCLUDED).join(', ')})`);
console.log(`medians measured ${MEASURED}`);
for (const w of warns) console.log(`WARN  ${w}`);
for (const f of fails) console.log(`FAIL  ${f}`);
console.log(fails.length ? `\n${fails.length} failure(s).` : `\nOK — ${warns.length} warning(s).`);
process.exit(fails.length ? 1 : 0);
