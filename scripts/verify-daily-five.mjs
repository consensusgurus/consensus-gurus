#!/usr/bin/env node
// verify-daily-five.mjs — checks the Daily Five bank in lib/daily-five.js
// against the four authoring rules stated in that file's header, plus the one
// thing a bank cannot self-check: that every game it names actually PUBLISHED a
// puzzle on the date it is banked for.
//
// That last check is the whole reason this exists. A game with no puzzle that
// day is not an error anywhere: gamesForSuffix simply skips it, so the run
// quietly becomes a four and the board's max quietly drops to 60, with nothing
// on any surface saying so. It is exactly the class of defect the daily puzzle
// authoring standard in CLAUDE.md was written for, so it is checked here rather
// than trusted.
//
// Run:  node scripts/verify-daily-five.mjs
// Exits non-zero on any failure. Warnings do not fail the run.

import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// The bank and the registry are read as SOURCE and parsed here rather than
// imported, because lib/daily-games.js pulls '@/lib/theme' through the Next
// path alias, which plain node cannot resolve. scripts/alias-loader.mjs exists
// for exactly this, but the two things needed here (the bank object and each
// game's cat) are a regex away and this keeps the checker dependency-free.
const fiveSrc = readFileSync(join(ROOT, 'lib/daily-five.js'), 'utf8');
const gamesSrc = readFileSync(join(ROOT, 'lib/daily-games.js'), 'utf8');

// ── the bank ────────────────────────────────────────────────────────────────
const BANK = {};
for (const m of fiveSrc.matchAll(/'(\d{4}-\d{2}-\d{2})':\s*\[([^\]]*)\]/g)) {
  BANK[m[1]] = [...m[2].matchAll(/'([a-z]+)'/g)].map((x) => x[1]);
}

// ── the registry: key -> { cat, name } ──────────────────────────────────────
const CAT = {}, NAME = {}, HREF = {};
for (const m of gamesSrc.matchAll(/\{ key: '([a-z]+)',([^\n]*)\}/g)) {
  const key = m[1], rest = m[2];
  const c = /cat: '([A-Za-z ]+)'/.exec(rest);
  const n = /name: '([^']+)'/.exec(rest);
  const h = /href: '([^']+)'/.exec(rest);
  if (c) CAT[key] = c[1];
  if (n) NAME[key] = n[1];
  HREF[key] = h ? h[1] : `/${key}`;
}
const RETIRED = {};
for (const m of gamesSrc.matchAll(/RETIRED_DAILY = \{([^}]*)\}/g)) {
  for (const r of m[1].matchAll(/(\w+):\s*'([\d-]+)'/g)) RETIRED[r[1]] = r[2];
}

// ── which dates each game published, read off its own puzzle bank ───────────
// The puzzle files are large and server-only, so they are grepped for quizIds
// rather than imported. A quizId is `<key>-M-D-YY`, which is the same shape
// lib/daily-slate reconstructs.
const puzzleDirs = new Set(readdirSync(join(ROOT, 'app'), { withFileTypes: true })
  .filter((d) => d.isDirectory()).map((d) => d.name));

const publishedCache = new Map();
function publishedDates(key) {
  if (publishedCache.has(key)) return publishedCache.get(key);
  // The directory is not always the key (jester -> jesters, park -> parker), so
  // take it from the registry href, which is the same correction the app makes.
  const dir = (HREF[key] || `/${key}`).replace(/^\//, '');
  let set = null;
  if (puzzleDirs.has(dir)) {
    try {
      const src = readFileSync(join(ROOT, 'app', dir, 'puzzles.js'), 'utf8');
      set = new Set();
      // The banks are not written in one style: hand-authored ones read
      // `quizId: 'lode-8-2-26'` while every GENERATED one is JSON-stringified
      // and reads `"quizId":"lode-8-2-26"`. A regex that assumed the first form
      // silently found ZERO puzzles in the generated banks, which reports as
      // "published no puzzle" on every date rather than as a parse failure, so
      // the checker's most useful test was also its most confidently wrong one.
      // Match both, and treat an empty set as unreadable rather than as empty.
      for (const m of src.matchAll(new RegExp(`["']?quizId["']?\\s*:\\s*['"]${key}-(\\d{1,2}-\\d{1,2}-\\d{2})['"]`, 'g'))) set.add(m[1]);
      if (!set.size) set = null;
    } catch (e) { set = null; }
  }
  publishedCache.set(key, set);
  return set;
}

const suffixOfIso = (iso) => {
  const [Y, M, D] = iso.split('-').map(Number);
  return `${M}-${D}-${Y % 100}`;
};

// ── how long each game takes, measured ───────────────────────────────────────
// MEASURED 2026-08-17 over the previous 14 days: the median `timeElapsed` of
// every top-10 leaderboard row per game, pooled across those days
// (/api/quiz/daily-combined?date=<suffix>, ~70 to 140 rows per game). These are
// the FAST end of the field by construction, so treat them as a relative
// ordering rather than as what an ordinary player will spend. The absolute
// numbers are used only for the budget, and generously.
//
// A SNAPSHOT, not a source of truth. It is here rather than in lib/daily-five
// because it is a measurement with a date on it, not a fact about the games,
// and shipping it in the library would invite a client to render it as one.
// Re-measure when a game's difficulty ramp changes, and expect small drift; the
// checks below carry slack so drift does not fail a good bank.
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
  // pool, so the row's time is how long you deliberated, not how long the
  // puzzle took. Estimated, and flagged as such.
  outwit: 90, outrank: 90, feud: 90,
};
// Budget, in the same top-10 seconds. Monday runs shorter, the same ramp every
// other daily follows. Slack on both ends so a re-measure does not fail a bank
// that was good when it was banked.
const BUDGET = { lo: 540, hi: 1080, monLo: 360, monHi: 900 };

// ── checks ──────────────────────────────────────────────────────────────────
const fails = [];
const warns = [];
const dates = Object.keys(BANK).sort();

if (!dates.length) fails.push('bank is empty — no dated entries parsed out of lib/daily-five.js');

const lastSeen = new Map(); // key -> iso of its previous appearance
for (const iso of dates) {
  const keys = BANK[iso];
  const at = (msg) => fails.push(`${iso}: ${msg}`);

  // 1. exactly five, all real, none duplicated
  if (keys.length !== 5) at(`has ${keys.length} games, expected 5`);
  const dupes = keys.filter((k, i) => keys.indexOf(k) !== i);
  if (dupes.length) at(`repeats a game within the day: ${[...new Set(dupes)].join(', ')}`);
  for (const k of keys) if (!CAT[k]) at(`unknown game key "${k}" (not in lib/daily-games)`);

  // 2. five DIFFERENT categories — rule 1 in the bank's header
  const cats = keys.map((k) => CAT[k]).filter(Boolean);
  const catDupes = cats.filter((c, i) => cats.indexOf(c) !== i);
  if (catDupes.length) at(`repeats a category: ${[...new Set(catDupes)].join(', ')} (five different categories is rule 1)`);

  // 3. every game actually published a puzzle that day
  const suffix = suffixOfIso(iso);
  for (const k of keys) {
    const pub = publishedDates(k);
    if (pub === null) { warns.push(`${iso}: could not read ${k}'s puzzle bank, publication unchecked`); continue; }
    if (!pub.has(suffix)) at(`${k} published no puzzle for ${suffix} — the run would silently become a four`);
  }

  // 4. a game must not have retired by the date it is banked for
  for (const k of keys) if (RETIRED[k] && iso > RETIRED[k]) at(`${k} retired on ${RETIRED[k]} and cannot run on ${iso}`);

  // 5. the day ascends, shortest first and longest last — rule 2. Checked with
  //    a 25% tolerance on each step, because the medians are a dated snapshot
  //    and two games a few seconds apart are not meaningfully ordered. What
  //    this catches is a genuinely long game placed early, which is the thing
  //    that loses a player before they have anything invested.
  const timed = keys.filter((k) => MED[k]);
  if (timed.length === keys.length) {
    for (let i = 1; i < keys.length; i++) {
      const prev = MED[keys[i - 1]], cur = MED[keys[i]];
      if (cur < prev * 0.75) at(`${keys[i]} (${cur}s) sits after ${keys[i - 1]} (${prev}s) — the run must ascend, shortest first`);
    }
    const total = keys.reduce((s, k) => s + MED[k], 0);
    const mon = new Date(Date.parse(iso)).getUTCDay() === 1;
    const lo = mon ? BUDGET.monLo : BUDGET.lo, hi = mon ? BUDGET.monHi : BUDGET.hi;
    // The launch day is deliberately under budget and is the one exception.
    if (iso !== '2026-08-17' && (total < lo || total > hi)) {
      warns.push(`${iso}: run is ${Math.floor(total / 60)}m${String(total % 60).padStart(2, '0')} of top-10 clock, outside the ${lo}-${hi}s budget`);
    }
  } else {
    warns.push(`${iso}: no timing for ${keys.filter((k) => !MED[k]).join(', ')} — order and budget unchecked (re-measure, see MED)`);
  }

  // 6. at least seven days between repeats — rule 3
  for (const k of keys) {
    const prev = lastSeen.get(k);
    if (prev) {
      const gap = Math.round((Date.parse(iso) - Date.parse(prev)) / 86400000);
      if (gap < 7) at(`${k} last ran ${prev}, only ${gap} day${gap === 1 ? '' : 's'} ago (seven is the floor)`);
    }
    lastSeen.set(k, iso);
  }
}

// 7. the bank must be a contiguous run of dates — a gap is a day with no run,
//    which is legal but is almost always a typo rather than a decision.
for (let i = 1; i < dates.length; i++) {
  const gap = Math.round((Date.parse(dates[i]) - Date.parse(dates[i - 1])) / 86400000);
  if (gap !== 1) warns.push(`gap in the bank: ${dates[i - 1]} -> ${dates[i]} (${gap} days), so those dates have no run`);
}

// 8. runway
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
const left = dates.filter((d) => d >= today).length;
if (left === 0) fails.push(`bank is exhausted: last day is ${dates[dates.length - 1]}, today is ${today}`);
else if (left < 14) warns.push(`only ${left} day${left === 1 ? '' : 's'} of runway left (through ${dates[dates.length - 1]}) — extend the bank`);

// ── report ──────────────────────────────────────────────────────────────────
console.log(`daily-five: ${dates.length} days banked, ${dates[0]} to ${dates[dates.length - 1]}, ${left} still ahead`);
const games = new Set(dates.flatMap((d) => BANK[d]));
console.log(`            ${games.size} distinct games used across the bank`);
for (const w of warns) console.log(`  WARN  ${w}`);
for (const f of fails) console.log(`  FAIL  ${f}`);
console.log(fails.length ? `\n${fails.length} failure(s)` : '\nOK');
process.exit(fails.length ? 1 : 0);
