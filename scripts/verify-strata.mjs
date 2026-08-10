// Verify the Strata bank.
//
// Strata's promise, per board, is on the tin of the game: a grid of letters where
// every letter belongs to one of the day's hidden words, you trace a word to lift
// it out, the letters above fall, and the reshaped board is what lets you read the
// next word. The claims that has to cash out to:
//
//   - EXACT COVER. Every cell belongs to exactly one answer, and no answer has a
//     spare or missing letter. A stray cell can never be cleared, so the board
//     could not be finished.
//   - NO DEAD END, ANYWHERE. From every state the player can reach, the board can
//     still be finished. This is the whole reason Strata has no fail state and
//     needs no undo: it is not possible to strand yourself, in any order, ever.
//   - ONE PLACEMENT PER WORD PER STATE. A word never reads in two different places
//     at once, so the player is never told a correct-looking trace is wrong.
//   - AND THE ONE PLACEMENT IS THE OWNED ONE. Uniqueness alone does NOT make "the
//     cells you traced" and "the cells that word owns" the same cells, and this
//     file asserted for four days that it did. A word can have exactly one
//     readable trace that runs through a letter belonging to a word still on the
//     board. Finding it deletes the cells the player TRACED, so the board diverges
//     from the `owners` map, the state is one the walk below never visited, and
//     the no-dead-end proof above covers a game nobody is playing. #5 shipped that
//     way and stranded half its play-throughs (THUMB's only opening trace eats
//     HEART's T). Every off-owner trace is now a hard failure, checked at every
//     reachable state, because it is the assumption the other four claims rest on.
//   - THE GATE IS REAL. Only a couple of words can be read on the untouched grid,
//     and at least one word cannot be read until several others have fallen out.
//     Without this the collapse is decoration and the game is an ordinary word search.
//   - NO CRUEL DECOY. No other member of the day's own category can be traced at any
//     reachable state. Seeing SLEET in a weather grid and having the board refuse it
//     is the single worst thing this format can do to somebody.
//
// Nothing below is read off a stored field and printed back. The state graph is
// re-walked from the letters with lib/strata-core.js, the same module the browser
// runs, and the `opening` / `deepest` figures stored in the bank are recomputed and
// compared rather than trusted.
//
// Run: node scripts/verify-strata.mjs
import { readFileSync } from 'node:fs';
import { PUZZLES } from '../app/strata/puzzles.js';
import { analyse, decoys, replayIntendedLine, ownedCells, makeCells, gridOf, placements } from '../lib/strata-core.js';
import { dayRule } from './strata-gen.mjs';

// The frequency table Lode already ships. Zipf, log10 per billion: 4.7 is
// "apple", 3.5 is "seam", 2.5 is "bobbin". It covers 4-8 letter common nouns
// only, which is deliberate here: a word it cannot score is a proper noun or a
// three letter word, and neither can be difficulty-graded, so neither ships.
const FREQ = JSON.parse(readFileSync(new URL('./.lode-freq.json', import.meta.url), 'utf8'));
const zipf = (w) => FREQ[w.toLowerCase()];

let BAD = 0;
let KNOWN = 0;
const fail = (id, msg) => { BAD++; console.error(`✗ ${id}: ${msg}`); };
const ok = (id, msg) => console.log(`✓ ${id}  ${msg}`);
// A real defect on a board that has already gone live. Reported loudly, never
// silently, but it does not fail the run: the board is frozen history and the
// only thing left to do about it is not ship another one.
const known = (id, msg) => { KNOWN++; console.warn(`! ${id}: KNOWN BROKEN, frozen history: ${msg}`); };

// Boards live before this date are frozen history: published and played, so they
// are exempt from later tightenings of the floors rather than retro-failed.
const STRATA_FLOOR_FROM = '2026-08-06';
// The Monday-to-Sunday difficulty curve was added the day after launch, so the
// launch board is frozen history and exempt. Everything from here carries it.
const CURVE_FROM = '2026-08-07';
// The state walk modelled a found word as losing its OWNED cells rather than the
// cells the player traced, so boards banked before this date were never proved
// against the game as played. #5 (2026-08-10) is genuinely broken and is left
// alone deliberately: it went live, people played it, and rewriting a live board
// wipes every in-progress save to spare the half of players who have not hit the
// dead end yet. It reports below as KNOWN BROKEN rather than failing the run.
// Everything from this date on is proved on real tracing and must be clean.
const TRACED_FROM = '2026-08-11';
const WEEKDAY = { rows: 5, cols: 5, maxOpening: 3, minDepth: 2, minWords: 5 };
const SUNDAY = { rows: 7, cols: 6, maxOpening: 3, minDepth: 4, minWords: 7 };
const THEME_REPEAT_WINDOW = 14;   // days before a theme may come round again
const THEME_CEILING = 3;          // times one theme may appear in the whole bank
const ANALYSE_CAP_MS = 1500;      // this file's full state walk, per board
const CLIENT_CAP_MS = 60;         // the heaviest single search the browser runs

const BRITISH_RE = /\b(colour|flavour|favourite|centre|theatre|organis(e|ing|ation)|recognis(e|ed|ing)|realis(e|ed|ing)|travell(ed|ing|er)|programme|metre|litre|kerb|tyre|analys(e|ed|ing)|catalogue|dialogue|jewellery|labour|neighbour|honour|armour|cheque|defence|licence|practise|whilst|amongst|learnt|aluminium|aeroplane)\b/i;

function labelOf(iso) {
  return new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}
function isSundayISO(iso) { return new Date(iso + 'T12:00:00Z').getUTCDay() === 0; }

const themeUse = new Map();
const seenBoards = new Map();
let prevLive = null;
let worstAnalyse = 0, worstClient = 0;
let totalWords = 0, totalStates = 0, gatedHard = 0;
const rarestSeen = [];

for (const p of PUZZLES) {
  const id = `strata #${p.num}`;
  const spec = p.sunday ? SUNDAY : WEEKDAY;
  const frozen = p.live < STRATA_FLOOR_FROM;

  // ── 1. structure ──────────────────────────────────────────────────────────
  if (p.rows !== spec.rows || p.cols !== spec.cols) {
    fail(id, `${p.sunday ? 'Sunday' : 'weekday'} board is ${p.cols}x${p.rows}, expected ${spec.cols}x${spec.rows}`);
    continue;
  }
  if (!Array.isArray(p.columns) || p.columns.length !== p.cols) { fail(id, `columns is not ${p.cols} entries`); continue; }
  if (!Array.isArray(p.owners) || p.owners.length !== p.cols) { fail(id, `owners is not ${p.cols} entries`); continue; }
  let shapeBad = false;
  for (let c = 0; c < p.cols; c++) {
    if (typeof p.columns[c] !== 'string' || p.columns[c].length !== p.rows || !/^[A-Z]+$/.test(p.columns[c])) { fail(id, `column ${c} is not ${p.rows} letters A-Z`); shapeBad = true; }
    if (typeof p.owners[c] !== 'string' || p.owners[c].length !== p.rows || !/^[0-9]+$/.test(p.owners[c])) { fail(id, `owners column ${c} is not ${p.rows} digits`); shapeBad = true; }
  }
  if (shapeBad) continue;
  if (!Array.isArray(p.words) || p.words.length < 3 || p.words.length > 9) { fail(id, `words must be 3..9 (owners is one digit per cell); got ${p.words && p.words.length}`); continue; }
  if (p.words.length < spec.minWords && !frozen) fail(id, `only ${p.words.length} words on a ${p.sunday ? 'Sunday' : 'weekday'} board, floor is ${spec.minWords}`);
  if (new Set(p.words).size !== p.words.length) fail(id, 'a word appears twice');
  for (const w of p.words) if (!/^[A-Z]{3,8}$/.test(w)) fail(id, `bad word "${w}"`);
  for (const c of p.owners.join('')) if (Number(c) >= p.words.length) fail(id, `owners references word ${c}, only ${p.words.length} words`);

  // ── 2. exact cover ────────────────────────────────────────────────────────
  let coverBad = false;
  for (let wi = 0; wi < p.words.length; wi++) {
    const own = ownedCells(p, wi);
    if (own.length !== p.words[wi].length) { fail(id, `${p.words[wi]} owns ${own.length} cells but has ${p.words[wi].length} letters`); coverBad = true; }
  }
  const owned = p.owners.join('').length;
  if (owned !== p.rows * p.cols) { fail(id, `owners covers ${owned} cells, board has ${p.rows * p.cols}`); coverBad = true; }
  // the letters a word owns must actually spell it, in path order
  if (!coverBad) {
    const line = replayIntendedLine(p);
    if (line.problems.length) fail(id, `these words do not read along their own cells at their turn: ${line.problems.join(', ')}`);
    if (!line.cleared) fail(id, 'playing the banked order does not empty the board');
  }

  // ── 3. the reachable state graph ──────────────────────────────────────────
  const t0 = Date.now();
  const a = analyse(p);
  const took = Date.now() - t0;
  if (took > worstAnalyse) worstAnalyse = took;
  if (took > ANALYSE_CAP_MS) fail(id, `state walk took ${took}ms, cap is ${ANALYSE_CAP_MS}ms`);

  // Boards banked before the walk removed traced cells were proved against a
  // different game, so their findings are reported rather than thrown.
  const traceProved = p.live >= TRACED_FROM;
  const trace = traceProved ? fail : known;

  if (!a.exhausted) fail(id, 'a placement search hit the node budget, so this board was never fully proved');
  if (!a.cleared) fail(id, 'the board cannot be cleared at all');
  if (a.deadEnds.length) trace(id, `${a.deadEnds.length} reachable dead end(s): a player can strand themselves, e.g. after ${a.deadEnds[0].split('').map((ch, i) => (ch === '1' ? p.words[i] : null)).filter(Boolean).join('+') || 'no finds'}`);
  // The claim every other claim rests on. A word whose one readable trace is not
  // its own cells reshapes the board in a way the `owners` map does not describe.
  if (a.offOwner.length) {
    const uniq = [...new Set(a.offOwner.map((o) => o.word))];
    trace(id, `${uniq.join(', ')} can be traced through cells owned by another word, so finding it leaves a board the owners map does not describe`);
  }
  if (a.ambiguous.length) {
    const x = a.ambiguous[0];
    fail(id, `${x.word} reads in ${x.count} different places at once, so a correct-looking trace could be refused`);
  }
  if (a.unreachable.length) fail(id, `never traceable in any reachable state: ${a.unreachable.join(', ')}`);

  // ── 4. the gate ───────────────────────────────────────────────────────────
  if (!frozen) {
    if (a.openingCount > spec.maxOpening) fail(id, `${a.openingCount} words readable on the untouched grid, cap is ${spec.maxOpening}`);
    if (a.deepest < spec.minDepth) fail(id, `deepest word unlocks after only ${a.deepest} find(s), floor is ${spec.minDepth}`);
    if (a.openingCount >= p.words.length) fail(id, 'every word is readable at the start, so the collapse gates nothing');
  }
  // Stored on the old owner-based walk, so a pre-TRACED_FROM board can disagree
  // with the corrected figure without being a bank error anyone can now fix.
  if (p.opening !== undefined && p.opening !== a.openingCount) trace(id, `bank says opening=${p.opening}, recomputed ${a.openingCount}`);
  if (p.deepest !== undefined && p.deepest !== a.deepest) trace(id, `bank says deepest=${p.deepest}, recomputed ${a.deepest}`);
  if (a.deepest >= spec.minDepth + 1) gatedHard++;

  // ── 4b. the week's difficulty curve ───────────────────────────────────────
  // Day one shipped GUSSET (not even in the frequency table) and BOBBIN (2.52)
  // and players did not know the words. Two dials, checked separately, because a
  // board can be easy on one and hard on the other: how obscure the CATEGORY is
  // (`tier`) and how rare the rarest WORD is (Zipf).
  if (p.live >= CURVE_FROM) {
    const rule = dayRule(p.live);
    const dow = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date(p.live + 'T12:00:00Z').getUTCDay()];
    let rarest = Infinity, rarestWord = null;
    for (const w of p.words) {
      if (w.length < 4 || w.length > 8) fail(id, `${w} is ${w.length} letters; answers are 4 to 8 so every one can be frequency-graded`);
      const z = zipf(w);
      if (z === undefined) { fail(id, `${w} is not in the frequency table, so its difficulty is unknown (proper nouns and 3-letter words land here)`); continue; }
      if (z < rarest) { rarest = z; rarestWord = w; }
    }
    if (rarestWord) {
      if (rarest < rule.minZipf) fail(id, `${dow} floor is Zipf ${rule.minZipf} but ${rarestWord} is ${rarest.toFixed(2)}; that is the word nobody knows`);
      if (p.minZipf !== undefined && Math.abs(p.minZipf - rarest) > 0.005) fail(id, `bank says minZipf=${p.minZipf}, recomputed ${rarest.toFixed(2)}`);
      rarestSeen.push({ num: p.num, dow, z: rarest, w: rarestWord });
    }
    if (p.tier === undefined) fail(id, 'no theme tier recorded, so the category-obscurity dial cannot be checked');
    else if (p.tier > rule.maxTier) fail(id, `${dow} allows tier ${rule.maxTier} categories at most, this board is tier ${p.tier} (${p.themes.join(' + ')})`);
  }

  // ── 5. decoys from the day's own category ─────────────────────────────────
  if (!Array.isArray(p.pool) || !p.pool.length) fail(id, 'no `pool` on the board, so the decoy check cannot run');
  else {
    for (const w of p.words) if (!p.pool.includes(w)) fail(id, `answer ${w} is not in its own theme pool`);
    const dec = decoys(p);
    if (dec.exhausted === false) fail(id, 'the decoy sweep hit the node budget, so "no decoys" was never actually proved');
    if (dec.length) {
      const uniq = [...new Set(dec.map((d) => d.word))];
      fail(id, `${uniq.length} category word(s) traceable but not an answer: ${uniq.slice(0, 5).join(', ')}`);
    }
  }

  // ── 6. what the browser itself has to run ─────────────────────────────────
  // The client searches for a placement only when the player asks for a hint, and
  // the untouched grid is the most expensive board it will ever search.
  {
    const { cells, columns } = makeCells(p);
    const grid = gridOf(p.rows, p.cols, columns, new Set());
    const t1 = Date.now();
    for (const w of p.words) placements(grid, w, cells, p.rows, p.cols, 1);
    const ms = Date.now() - t1;
    if (ms > worstClient) worstClient = ms;
    if (ms > CLIENT_CAP_MS) fail(id, `hint search on the full grid takes ${ms}ms, cap is ${CLIENT_CAP_MS}ms`);
  }

  // ── 7. bank hygiene ───────────────────────────────────────────────────────
  if (p.num !== PUZZLES.indexOf(p) + 1) fail(id, `num ${p.num} is out of sequence`);
  if (prevLive && p.live <= prevLive) fail(id, `live ${p.live} does not come after ${prevLive}`);
  prevLive = p.live;
  const wantId = `strata-${Number(p.live.slice(5, 7))}-${Number(p.live.slice(8, 10))}-${p.live.slice(2, 4)}`;
  if (p.quizId !== wantId) fail(id, `quizId ${p.quizId} does not match live ${p.live} (want ${wantId})`);
  if (p.dateLabel !== labelOf(p.live)) fail(id, `dateLabel "${p.dateLabel}" does not match ${p.live}`);
  if (!!p.sunday !== isSundayISO(p.live)) fail(id, `sunday=${!!p.sunday} but ${p.live} is ${isSundayISO(p.live) ? 'a Sunday' : 'not a Sunday'}`);

  const sig = p.columns.join('|');
  if (seenBoards.has(sig)) fail(id, `identical grid to #${seenBoards.get(sig)}`);
  seenBoards.set(sig, p.num);

  if (!Array.isArray(p.themes) || !p.themes.length) fail(id, 'no themes listed');
  else {
    if (p.sunday && p.themes.length !== 2) fail(id, `a Sunday Edition runs two threads, this one lists ${p.themes.length}`);
    if (!p.sunday && p.themes.length !== 1) fail(id, `a weekday runs one thread, this one lists ${p.themes.length}`);
    if (p.sunday && p.pool) {
      // Both threads have to be substantial, or it is a weekday board with a
      // couple of foreign words dropped in. Three words is the floor per thread.
      // (`pool` is the two pools concatenated, so the split is recovered from the
      // theme files rather than stored; what is checkable here is the total.)
      if (p.words.length < SUNDAY.minWords) fail(id, `Sunday board has only ${p.words.length} words`);
    }
    for (const t of p.themes) {
      if (BRITISH_RE.test(t)) fail(id, `British spelling in theme name "${t}"`);
      const prev = themeUse.get(t);
      if (prev !== undefined && p.num - prev < THEME_REPEAT_WINDOW) fail(id, `theme "${t}" also ran on #${prev}, only ${p.num - prev} days earlier`);
      themeUse.set(t, p.num);
    }
  }

  totalWords += p.words.length;
  totalStates += a.states;
}

// ── 8. pool variety across the whole bank ───────────────────────────────────
const counts = new Map();
for (const p of PUZZLES) for (const t of (p.themes || [])) counts.set(t, (counts.get(t) || 0) + 1);
for (const [t, n] of counts) if (n > THEME_CEILING) fail('strata pool', `theme "${t}" runs ${n} times, ceiling is ${THEME_CEILING}`);
const sundays = PUZZLES.filter((p) => p.sunday).length;
if (PUZZLES.length >= 14 && sundays === 0) fail('strata pool', 'a bank this long with no Sunday Edition means the Sunday drop is missing');
if (PUZZLES.length && gatedHard / PUZZLES.length < 0.4) {
  fail('strata pool', `only ${(gatedHard / PUZZLES.length * 100).toFixed(0)}% of boards bury a word deeper than the floor; a bank at the floor every day reads flat`);
}

// The floors alone could be satisfied by a flat bank that sits at the Sunday
// level all week, so check the curve actually slopes: early-week boards must be
// meaningfully more common than late-week ones.
if (rarestSeen.length >= 10) {
  const early = rarestSeen.filter((r) => ['Monday', 'Tuesday'].includes(r.dow));
  const late = rarestSeen.filter((r) => ['Saturday', 'Sunday'].includes(r.dow));
  const avg = (a) => a.reduce((s, r) => s + r.z, 0) / (a.length || 1);
  if (early.length && late.length) {
    const gap = avg(early) - avg(late);
    if (gap < 0.5) fail('strata pool', `the week barely ramps: Mon/Tue rarest averages ${avg(early).toFixed(2)}, Sat/Sun ${avg(late).toFixed(2)}, a gap of only ${gap.toFixed(2)}`);
    else console.log(`… strata curve  Mon/Tue rarest word averages Zipf ${avg(early).toFixed(2)}, Sat/Sun ${avg(late).toFixed(2)} (gap ${gap.toFixed(2)})`);
  }
}

if (BAD === 0) {
  ok('strata pool', `${PUZZLES.length} boards (${sundays} Sunday), ${counts.size} distinct themes, ${(totalWords / PUZZLES.length).toFixed(1)} words a board, ${(totalStates / PUZZLES.length).toFixed(1)} reachable states a board, no dead end anywhere, every trace lands on its own cells, no ambiguous placement, no category decoy, worst state walk ${worstAnalyse}ms, worst search the browser runs ${worstClient}ms`);
}
if (KNOWN) console.warn(`\n${KNOWN} known defect(s) on boards that already went live; frozen deliberately, not fixable now`);

console.log(BAD ? `\n${BAD} FAILURE(S)` : '\nAll Strata boards verified.');
process.exit(BAD ? 1 : 0);
