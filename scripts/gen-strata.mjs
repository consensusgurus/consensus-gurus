// Bank generator for Strata, the daily collapsing word search.
//
// There was no gen-strata.mjs. scripts/strata-gen.mjs held the board search
// (and still does, it is imported below rather than reimplemented, so the
// backwards-insertion engine has exactly one copy), but it was a fixed-argument
// driver: a start date, a day count, and a hardcoded strata-bank.json. It could
// not be pointed at a live bank, it knew nothing about the whole-bank ceilings
// verify-strata.mjs enforces, and it could not be resumed at a board boundary.
// This file is the driver in the house shape (--from/--days/--startnum/--avoid/
// --out), and it adds the three things an EXTENSION needs that a from-scratch
// run does not:
//
//   1. THE WHOLE-BANK THEME CEILING. verify-strata.mjs fails any theme used more
//      than THEME_CEILING (3) times across the ENTIRE file. strata-gen.mjs only
//      tracked the 14-day repeat window, so an extension built with it happily
//      spent a fourth Chess board and failed the bank on a rule the generator
//      had never heard of. --avoid seeds the used-counts from the live bank and
//      a theme at the ceiling is simply not eligible.
//   2. THE WEEK'S RARITY CURVE, which is a BANK-WIDE check, not a per-board one.
//      The verifier fails the pool when the Mon/Tue rarest-word average is less
//      than 0.5 Zipf above the Sat/Sun average. Per-board floors alone cannot
//      produce that: a Saturday whose floor is 3.0 is perfectly legal with a
//      rarest word of 4.3, and a bank of those flattens the curve while every
//      individual board passes. So late-week days here also carry a rarest-word
//      CEILING (RARITY_TARGET below), which is a generator preference rather
//      than a rule, relaxed rather than failed when a theme cannot meet it.
//   3. RESUMABILITY AT A BOARD BOUNDARY. A Sunday can take a minute of search on
//      an awkward pair of pools. --budget-ms works to a wall clock and --state
//      persists finished boards, so a long extension can be built over several
//      short invocations. Rerun the same command until it prints "complete".
//
// WHAT MAKES A BOARD LEGAL is not decided here. Every candidate is proved by
// lib/strata-core.js, the same module the browser runs and the same one
// verify-strata.mjs asserts against, and then re-proved from scratch in
// selfCheck() below before it is written out. The claims are, in full:
//
//   - EXACT COVER: every cell belongs to exactly one answer, and the cells a
//     word owns spell it along a path at that word's turn in the banked order.
//   - NO DEAD END ANYWHERE REACHABLE: from every state a player can reach, by
//     any trace in any order, the board can still be emptied.
//   - ONE PLACEMENT PER WORD PER STATE: a word never reads in two places at
//     once, so a correct-looking trace is never refused.
//   - AND THAT PLACEMENT IS THE OWNED ONE. This is the assumption the other
//     three rest on and it is ASSERTED, never reasoned to. Uniqueness is not
//     identity: a word can have exactly one readable trace and have that trace
//     run through a letter belonging to a word still on the board. Finding it
//     deletes the cells the player TRACED, so the board diverges from the
//     `owners` map and every state past that point is one the proof never
//     visited. #5 (2026-08-10) shipped that way and stranded half its
//     play-throughs. `analyse().offOwner` reports the divergence and any
//     candidate with one is thrown away here, not in review.
//   - THE GATE IS REAL: at most a couple of words readable on the untouched
//     grid, and the last word waits on several finds.
//   - NO CRUEL DECOY: no other member of the day's own category can be traced at
//     any reachable state.
//
// Usage:
//   node scripts/gen-strata.mjs --from 2026-09-17 --days 64 --startnum 43 \
//        --avoid app/strata/puzzles.js --out /tmp/strata-new.js \
//        --state /tmp/strata-new.json --budget-ms 90000
//
//   --from YYYY-MM-DD  live date of the first new board.
//   --days N           how many consecutive days to fill.
//   --startnum N       number the first new board N. `num` is what the 14-day
//                      theme repeat window is measured in, and verify-strata
//                      checks num against the board's index in the FINAL file,
//                      so a spliced range must carry the numbers it will ship
//                      with or every recency check is computed against the
//                      wrong distances.
//   --avoid PATH       read a live bank and seed the theme use-counts, the theme
//                      recency map and the grid signatures from it. The theme
//                      ceiling and the duplicate-grid check in verify-strata.mjs
//                      both run over the WHOLE file, so an extension built
//                      without this fails them.
//   --out PATH         write a complete PUZZLES file holding ONLY the new
//                      boards. The live entries are frozen; splice, never
//                      regenerate.
//   --state PATH       resume file (defaults to <out>.json).
//   --budget-ms N      wall clock for this invocation. Rerun to continue.
//   --salt N           reshuffle the theme deck on a rerun that got stuck.
//
// Everything it emits still has to pass `node scripts/verify-strata.mjs`, which
// recomputes every stored figure rather than printing it back.
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { analyse, decoys, replayIntendedLine, ownedCells } from '../lib/strata-core.js';
import { findBoard, pack, rng, dayRule, subsets } from './strata-gen.mjs';
import { loadThemes } from './strata-themes.mjs';

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };

// Mirrors of the ceilings verify-strata.mjs enforces. Kept in step by hand and
// asserted below, because the verifier is the authority and a generator that
// disagreed with it would simply produce banks that fail.
const THEME_CEILING = 3;         // times one theme may appear in the whole bank
const THEME_WINDOW = 14;         // board numbers before a theme may come round again
const WEEKDAY = { rows: 5, cols: 5, maxOpening: 3, minDepth: 2, minWords: 5, letters: 25 };
const SUNDAY  = { rows: 7, cols: 6, maxOpening: 3, minDepth: 4, minWords: 7, letters: 42 };

// The rarest word a board of this weekday SHOULD contain, so the bank-wide
// curve check has something to measure. Not a rule: no board is rejected for
// missing it, the target is dropped after the theme deck has been walked once.
// Keyed by getUTCDay, 0 = Sunday. Infinity means "as common as the floor allows",
// which is what Monday and Tuesday want.
const RARITY_TARGET = { 1: Infinity, 2: Infinity, 3: Infinity, 4: 4.10, 5: 3.90, 6: 3.55, 0: 3.45 };

const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (startISO, n) => { const d = new Date(startISO + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
const dowOf = (live) => new Date(live + 'T12:00:00Z').getUTCDay();
const isSunday = (live) => dowOf(live) === 0;
const labelOf = (live) => new Date(live + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const quizIdOf = (live) => `strata-${Number(live.slice(5, 7))}-${Number(live.slice(8, 10))}-${live.slice(2, 4)}`;
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ── the proof, re-run on the finished object ────────────────────────────────
// findBoard already rejects on all of this, but it checks an intermediate. This
// runs on the exact object that gets written, and it throws rather than warns:
// a board that cannot pass here must never reach the file, because the next
// thing that reads it is a player.
function selfCheck(p, freq) {
  const spec = p.sunday ? SUNDAY : WEEKDAY;
  const bad = [];
  if (p.rows !== spec.rows || p.cols !== spec.cols) bad.push('wrong board size');
  if (p.words.length < spec.minWords || p.words.length > 9) bad.push(`${p.words.length} words`);
  if (new Set(p.words).size !== p.words.length) bad.push('a word appears twice');

  // exact cover, both directions: each word owns exactly its own letters, and
  // the owner digits cover every cell exactly once.
  for (let wi = 0; wi < p.words.length; wi++) {
    if (ownedCells(p, wi).length !== p.words[wi].length) bad.push(`${p.words[wi]} owns the wrong number of cells`);
  }
  if (p.owners.join('').length !== p.rows * p.cols) bad.push('owners does not cover the board');
  const line = replayIntendedLine(p);
  if (line.problems.length) bad.push(`does not read along its own cells: ${line.problems.join(', ')}`);
  if (!line.cleared) bad.push('the banked order does not empty the board');

  const a = analyse(p);
  if (!a.exhausted) bad.push('a placement search hit the node budget, so this board was never fully proved');
  if (!a.cleared) bad.push('the board cannot be cleared');
  if (a.deadEnds.length) bad.push(`${a.deadEnds.length} reachable dead end(s)`);
  if (a.ambiguous.length) bad.push(`${a.ambiguous[0].word} reads in ${a.ambiguous[0].count} places at once`);
  if (a.unreachable.length) bad.push(`never traceable: ${a.unreachable.join(', ')}`);
  // THE ASSUMPTION, ASSERTED. Not "uniqueness implies the trace is the owned
  // cells" in a comment; the two sets are compared at every reachable state.
  if (a.offOwner.length) bad.push(`${[...new Set(a.offOwner.map((o) => o.word))].join(', ')} can be traced off its own cells`);
  if (a.openingCount > spec.maxOpening) bad.push(`${a.openingCount} words readable on the untouched grid`);
  if (a.openingCount >= p.words.length) bad.push('every word is readable at the start, so the collapse gates nothing');
  if (a.deepest < spec.minDepth) bad.push(`deepest word unlocks after only ${a.deepest} find(s)`);
  if (p.opening !== a.openingCount || p.deepest !== a.deepest) bad.push('stored opening/deepest disagree with the walk');

  const dec = decoys(p);
  if (dec.exhausted === false) bad.push('the decoy sweep hit the node budget');
  if (dec.length) bad.push(`category decoy(s) traceable: ${[...new Set(dec.map((d) => d.word))].slice(0, 4).join(', ')}`);

  const rule = dayRule(p.live);
  let rarest = Infinity;
  for (const w of p.words) {
    if (!/^[A-Z]{4,8}$/.test(w)) bad.push(`${w} is not 4 to 8 letters A-Z`);
    if (!p.pool.includes(w)) bad.push(`${w} is not in its own theme pool`);
    const z = freq[w.toLowerCase()];
    if (z === undefined) bad.push(`${w} has no frequency score, so its difficulty cannot be graded`);
    else if (z < rarest) rarest = z;
  }
  if (rarest < rule.minZipf) bad.push(`rarest word is Zipf ${rarest.toFixed(2)}, ${DOW[dowOf(p.live)]} floor is ${rule.minZipf}`);
  if (Math.abs(p.minZipf - rarest) > 0.005) bad.push('stored minZipf disagrees with the words');
  if (p.tier > rule.maxTier) bad.push(`tier ${p.tier} on a day capped at ${rule.maxTier}`);
  if (p.sunday ? p.themes.length !== 2 : p.themes.length !== 1) bad.push('wrong number of themes for the day');
  if (p.quizId !== quizIdOf(p.live)) bad.push('quizId does not match live');
  if (p.dateLabel !== labelOf(p.live)) bad.push('dateLabel does not match live');
  if (!!p.sunday !== isSunday(p.live)) bad.push('sunday flag does not match the weekday');

  if (bad.length) throw new Error(`board ${p.num} (${p.live}) failed its own check: ${bad.join('; ')}`);
  return { rarest, states: a.states };
}

// ── driver ──────────────────────────────────────────────────────────────────
const FROM = arg('--from');
const DAYS = Number(arg('--days', 0));
const START_NUM = Number(arg('--startnum', 1));
const OUT = arg('--out');
const AVOID = arg('--avoid');
const BUDGET_MS = Number(arg('--budget-ms', 90000));
const SALT = Number(arg('--salt', 0));
if (!FROM || !/^\d{4}-\d{2}-\d{2}$/.test(FROM)) { console.error('need --from YYYY-MM-DD'); process.exit(1); }
if (!Number.isInteger(DAYS) || DAYS < 1) { console.error('need --days N'); process.exit(1); }
if (!Number.isInteger(START_NUM) || START_NUM < 1) { console.error('--startnum must be a positive integer'); process.exit(1); }
if (!OUT) { console.error('need --out PATH'); process.exit(1); }
const STATE = arg('--state', OUT + '.json');

const FREQ = JSON.parse(readFileSync(new URL('./.lode-freq.json', import.meta.url), 'utf8'));
const THEMES = loadThemes(FREQ);

// Seed the whole-bank state from the live file. Without this the ceiling and
// the grid-duplicate check are computed over the new range only, which is not
// the range the verifier looks at.
const themeUses = new Map();       // theme -> times used across the WHOLE bank
const themeLastNum = new Map();    // theme -> the highest board number it ran on
const seenGrids = new Set();       // columns.join('|') for every board in the bank
if (AVOID) {
  const { PUZZLES: prior } = await import(pathToFileURL(resolve(AVOID)).href);
  for (const p of prior) {
    seenGrids.add(p.columns.join('|'));
    for (const t of (p.themes || [])) { themeUses.set(t, (themeUses.get(t) || 0) + 1); themeLastNum.set(t, p.num); }
  }
  const spent = [...themeUses.values()].filter((n) => n >= THEME_CEILING).length;
  console.error(`avoiding ${prior.length} boards from ${AVOID}: ${themeUses.size} themes in use, ${spent} already at the ceiling of ${THEME_CEILING}`);
  const capacity = THEMES.reduce((s, t) => s + (THEME_CEILING - (themeUses.get(t.name) || 0)), 0);
  const sundays = Array.from({ length: DAYS }, (_, d) => isSunday(addDays(FROM, d))).filter(Boolean).length;
  const need = (DAYS - sundays) + sundays * 2;
  console.error(`theme slots: ${need} needed for ${DAYS} days (${sundays} Sunday), ${capacity} left in the pool`);
  if (capacity < need) console.error('WARNING: the theme pool cannot cover this range at the ceiling; add themes to scripts/strata-themes.mjs');
}

// Resume. Boards already generated are replayed into the bank state so the
// ceilings stay correct across invocations.
const done = existsSync(STATE) ? JSON.parse(readFileSync(STATE, 'utf8')) : [];
for (const p of done) {
  seenGrids.add(p.columns.join('|'));
  for (const t of p.themes) { themeUses.set(t, (themeUses.get(t) || 0) + 1); themeLastNum.set(t, p.num); }
}
if (done.length) console.error(`resuming: ${done.length} of ${DAYS} boards already in ${STATE}`);

const r = rng(0x57241A + START_NUM * 7919 + done.length * 104729 + SALT * 31337);
const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// Themes that may legally run on this board, best first.
//
// "Best" conserves the scarce end of the pool. The tier caps mean Monday and
// Tuesday can ONLY draw tier 1, so a late-week board that spends a tier 1 theme
// it did not need is taking a slot Monday cannot replace. So a day that allows
// tier 2 or 3 prefers the highest tier that still has capacity, and within a
// tier the theme with the most ceiling left goes first. That is also why the
// original driver's "prefer the hardest tier allowed" is kept rather than
// replaced: it is a supply argument, not a difficulty one.
function eligibleThemes(num, live, minLetters, rarestMax) {
  const rule = dayRule(live);
  const out = [];
  for (const t of THEMES) {
    if (t.tier > rule.maxTier) continue;
    const uses = themeUses.get(t.name) || 0;
    if (uses >= THEME_CEILING) continue;
    const last = themeLastNum.get(t.name);
    if (last !== undefined && num - last < THEME_WINDOW) continue;
    const usable = t.pool.filter((w) => t.zipf(w) >= rule.minZipf);
    if (usable.reduce((s, w) => s + w.length, 0) < minLetters) continue;
    // A rarest-word target the theme cannot meet is not a reason to reject the
    // theme outright, it is a reason to sort it last: the caller drops the
    // target on its second pass.
    const canHitTarget = usable.some((w) => t.zipf(w) <= rarestMax);
    out.push({ ...t, usable, left: THEME_CEILING - uses, canHitTarget });
  }
  return shuffle(out).sort((a, b) =>
    (b.canHitTarget - a.canHitTarget) || (b.tier - a.tier) || (b.left - a.left));
}

// Word sets for a single thread: exact letter total, count in range, and (when a
// target is set) at least one word at or below it so the day lands where the
// week's curve needs it.
const SUBSET_CACHE = new Map();
function wordSets(theme, total, minW, maxW, rarestMax) {
  const key = `${theme.name}|${total}|${minW}|${maxW}|${theme.usable.length}`;
  if (!SUBSET_CACHE.has(key)) SUBSET_CACHE.set(key, subsets(r, theme.usable, total, minW, maxW, 500));
  const all = SUBSET_CACHE.get(key);
  if (!Number.isFinite(rarestMax)) return all;
  const hit = all.filter((set) => Math.min(...set.map((w) => theme.zipf(w))) <= rarestMax);
  return hit.length ? hit : [];
}

const until = Date.now() + BUDGET_MS;
let stop = false;
for (let d = done.length; d < DAYS && !stop; d++) {
  const live = addDays(FROM, d);
  const num = START_NUM + d;
  const sunday = isSunday(live);
  const spec = sunday ? SUNDAY : WEEKDAY;
  const rule = dayRule(live);

  let found = null, used = null;
  // Four passes over two independent relaxations, and the ORDER matters. A
  // TIGHT board (at most two words readable on the untouched grid, the last one
  // buried a find deeper than the floor) is what the bank-wide "at least 40% of
  // boards bury a word deeper than the floor" check is fed by, so tight is tried
  // across EVERY eligible theme before the gate is softened for any of them.
  // Trying tight-then-soft per theme instead takes the first soft board the
  // first theme offers and never asks the other forty.
  //
  // Both relaxations are of PREFERENCES. The rules are never touched by any
  // pass: the Zipf floor, the tier cap, the maxOpening/minDepth floors, the
  // theme ceiling and window, the decoy sweep and the off-owner assertion hold
  // identically on pass 0 and pass 3.
  const PASSES = [[true, true], [false, true], [true, false], [false, false]];
  for (let pass = 0; pass < PASSES.length && !found; pass++) {
    const [tightOnly, wantTarget] = PASSES[pass];
    const rarestMax = wantTarget ? RARITY_TARGET[dowOf(live)] : Infinity;
    const deck = eligibleThemes(num, live, sunday ? 22 : 32, rarestMax);
    for (let i = 0; i < deck.length && !found; i++) {
      if (Date.now() > until) { stop = true; break; }
      const th = deck[i];
      if (sunday) {
        // Two threads, each drawn to its own exact letter budget so neither half
        // of the grid can be picked out just by having most of the letters.
        for (let j = i + 1; j < deck.length && !found; j++) {
          if (Date.now() > until) { stop = true; break; }
          const other = deck[j];
          const sets = [];
          for (let leftLetters = 17; leftLetters <= 25 && sets.length < 24; leftLetters++) {
            const L = wordSets(th, leftLetters, 3, 5, Infinity);
            const R = wordSets(other, spec.letters - leftLetters, 3, 5, Infinity);
            if (!L.length || !R.length) continue;
            for (let k = 0; k < 5 && sets.length < 24; k++) {
              const combo = L[Math.floor(r() * L.length)].concat(R[Math.floor(r() * R.length)]);
              if (combo.length < spec.minWords || combo.length > 9) continue;
              if (Number.isFinite(rarestMax) && Math.min(...combo.map((w) => FREQ[w.toLowerCase()])) > rarestMax) continue;
              sets.push(combo);
            }
          }
          if (!sets.length) continue;
          const deadline = Math.min(Date.now() + 26000, until);
          const base = { rows: spec.rows, cols: spec.cols, wordSets: sets, pool: th.pool.concat(other.pool), maxOpening: 3, minDepth: 5, budget: 260, until: deadline };
          found = findBoard(num * 7919 + pass * 13 + j, base);
          if (!found && !tightOnly) found = findBoard(num * 104729 + pass * 17 + j, { ...base, minDepth: spec.minDepth, until: Math.min(deadline + 12000, until) });
          if (found && seenGrids.has(found.p.columns.join('|'))) found = null;
          if (found) used = { themes: [th.name, other.name], pool: th.pool.concat(other.pool), tier: Math.max(th.tier, other.tier) };
        }
      } else {
        const sets = wordSets(th, spec.letters, 5, 7, rarestMax);
        if (!sets.length) continue;
        const deadline = Math.min(Date.now() + 9000, until);
        // Ask for a properly gated board first: at most two words readable on
        // the untouched grid, one buried three finds deep. The bank-wide check
        // that at least 40% of boards bury a word deeper than the floor is only
        // satisfiable if this is what is asked for by default.
        const tight = { rows: spec.rows, cols: spec.cols, wordSets: sets, pool: th.pool, maxOpening: 2, minDepth: 3, budget: 700, until: deadline };
        found = findBoard(num * 104729 + pass * 7 + i, tight);
        if (!found && !tightOnly) found = findBoard(num * 15485863 + pass * 11 + i, { ...tight, maxOpening: spec.maxOpening, minDepth: spec.minDepth, budget: 500, until: Math.min(deadline + 6000, until) });
        if (found && seenGrids.has(found.p.columns.join('|'))) found = null;
        if (found) used = { themes: [th.name], pool: th.pool, tier: th.tier };
      }
    }
  }
  if (stop && !found) { console.error(`… out of time at ${live}, ${done.length} of ${DAYS} done, rerun to continue`); break; }
  if (!found) { console.error(`✗ no board for ${live}${sunday ? ' (SUNDAY)' : ''}: every eligible theme exhausted`); break; }

  const rarest = Math.min(...found.p.words.map((w) => FREQ[w.toLowerCase()]));
  const board = pack(found, {
    num, quizId: quizIdOf(live), live, dateLabel: labelOf(live), sunday,
    themes: used.themes, pool: used.pool, tier: used.tier, minZipf: Number(rarest.toFixed(2)),
  });
  const { states } = selfCheck(board, FREQ);

  seenGrids.add(board.columns.join('|'));
  for (const t of used.themes) { themeUses.set(t, (themeUses.get(t) || 0) + 1); themeLastNum.set(t, num); }
  done.push(board);
  writeFileSync(STATE, JSON.stringify(done, null, 1));
  console.error(`${live} ${DOW[dowOf(live)]}${sunday ? '*' : ' '} #${num} t${board.tier} ${used.themes.join(' + ').padEnd(30)} w=${board.words.length} open=${board.opening} depth=${board.deepest} rarest=${rarest.toFixed(2)} (floor ${rule.minZipf}) states=${states}`);
}

// ── write ───────────────────────────────────────────────────────────────────
// A COMPLETE PUZZLES file holding only the NEW boards. The live entries are
// frozen history and are never regenerated; the entries below are spliced onto
// the end of app/strata/puzzles.js.
const body = done.map((p) => `  {
    num: ${p.num},
    quizId: '${p.quizId}',
    live: '${p.live}',
    dateLabel: '${p.dateLabel}',${p.sunday ? "\n    sunday: true," : ''}
    rows: ${p.rows},
    cols: ${p.cols},
    themes: [${p.themes.map((t) => `'${t.replace(/'/g, "\\'")}'`).join(', ')}],
    columns: [${p.columns.map((c) => `'${c}'`).join(', ')}],
    owners: [${p.owners.map((c) => `'${c}'`).join(', ')}],
    words: [${p.words.map((w) => `'${w}'`).join(', ')}],
    tier: ${p.tier},
    minZipf: ${p.minZipf},
    pool: [${p.pool.map((w) => `'${w}'`).join(', ')}],
    opening: ${p.opening},
    deepest: ${p.deepest},
  },`).join('\n');
writeFileSync(OUT, `// Generated by scripts/gen-strata.mjs. New boards only; splice onto the end of\n// app/strata/puzzles.js, whose existing entries are frozen.\nexport const PUZZLES = [\n${body}\n];\n`);
console.error(done.length >= DAYS ? `\ncomplete: ${done.length} boards written to ${OUT}` : `\npartial: ${done.length} of ${DAYS} boards in ${OUT}, rerun to continue`);
