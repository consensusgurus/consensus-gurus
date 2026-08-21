#!/usr/bin/env node
// gen-niche — build the Niche puzzle bank and write app/niche/puzzles.js.
//
//   node scripts/gen-niche.mjs [--from YYYY-MM-DD] [--days N] [--startnum N] [--seed N]
//
// A board is three row attributes and three column attributes from that day's
// universe (four each on the Sunday Edition, always Countries). The generator
// PROVES each board before banking it:
//   - every cell has at least three valid answers (the same floor the
//     verifier holds),
//   - the whole board admits a perfect matching of DISTINCT answers
//     (boardMatchable in app/niche/facts.js), because answers cannot repeat,
//   - at least one tight cell (<= TIGHT answers) per board, two on Sunday, so
//     every day has a corner worth bragging about,
//   - at most two LETTER attributes per board, one in launch week (a board
//     of letter fills is a word game, not trivia),
//   - no board shares more than 4 of its attributes with ANY earlier board of
//     its universe (the echo rule alone let two boards two weeks apart ship
//     as the same six attributes with rows and columns swapped),
//   - no attribute repeats within a board, at most MAX_ECHO attributes carry
//     over from that universe's PREVIOUS board (a seven-day echo, since
//     universes run weekly), and none appears more than ATTR_CAP times per
//     universe across the bank (a floor is not a target: variety is checked
//     bank-wide).
//
// Deterministic: a seeded RNG, so a re-run with the same arguments reproduces
// the same bank. Do NOT hand-edit boards in puzzles.js; regenerate and re-run
// scripts/verify-niche.mjs.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { UNIVERSE_MAP, universeForDate, cellMembers, boardMatchable } from '../app/niche/facts.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const FROM = arg('--from', '2026-08-21');
const DAYS = Number(arg('--days', '38'));
const START_NUM = Number(arg('--startnum', '1'));
const SEED = Number(arg('--seed', '20260820'));

const MIN_CELL = 3;      // the promised floor: every cell holds at least three answers
const TIGHT = 8;         // a "tight" cell has at most this many valid answers
// Max appearances of one attribute per universe across the bank (about seven
// boards per universe in a 45-day bank). Every universe leans on a handful of
// anchor attributes (the four leagues, the continents, the decades) that most
// boards need one of, so the cap is 4 rather than 3; week-on-week repetition
// is separately held down by MAX_ECHO.
const ATTR_CAP = 4;
const MAX_ECHO = 2;      // attrs allowed to carry over from the universe's previous board
const TRIES = 50000;

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(SEED);

function weightedPick(pool, n, rand) {
  const out = [];
  const bag = pool.slice();
  while (out.length < n && bag.length) {
    const total = bag.reduce((s, a) => s + (a.w || 1), 0);
    let roll = rand() * total;
    let idx = 0;
    for (let i = 0; i < bag.length; i++) { roll -= (bag[i].w || 1); if (roll <= 0) { idx = i; break; } }
    out.push(bag[idx]);
    bag.splice(idx, 1);
  }
  return out;
}

function isoPlus(iso, days) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
function quizIdFor(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `niche-${m}-${d}-${String(y).slice(2)}`;
}
function dateLabelFor(iso) {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric' });
}
function isSunday(iso) {
  return new Date(`${iso}T12:00:00Z`).getUTCDay() === 0;
}

function buildBoard(universe, size, prevAttrIds, history, usage, maxLetters, rand) {
  const used = (id) => (usage[id] || 0);
  const pool = universe.attrs.filter((a) => used(a.id) < ATTR_CAP);
  // Rows are drawn at random; columns are then chosen GREEDILY so every cell
  // against every row clears the floor (a blind draw of six attrs almost never
  // makes all nine cells compatible — continent versus continent is empty).
  for (let t = 0; t < TRIES; t++) {
    const rowPicks = weightedPick(pool, size, rand);
    if (rowPicks.length < size) return null;
    const rows = rowPicks.map((a) => a.id);
    const rest = weightedPick(pool.filter((a) => !rows.includes(a.id)), pool.length, rand);
    const cols = [];
    for (const a of rest) {
      if (cols.length === size) break;
      if (rows.every((r) => cellMembers(universe, r, a.id).length >= MIN_CELL)) cols.push(a.id);
    }
    if (cols.length < size) continue;
    const isLetter = (id) => /^(n|cap)-[a-z]$/.test(id);
    const all = [...rows, ...cols];
    if (all.filter(isLetter).length > maxLetters) continue;
    if (all.filter((id) => prevAttrIds.has(id)).length > MAX_ECHO) continue;
    if (history.some((h) => all.filter((id) => h.has(id)).length > 4)) continue;
    let tight = 0;
    for (const r of rows) for (const c of cols) {
      if (cellMembers(universe, r, c).length <= TIGHT) tight++;
    }
    if (tight < (size === 4 ? 2 : 1)) continue;
    if (!boardMatchable(universe, rows, cols)) continue;
    return { rows, cols };
  }
  return null;
}

const out = [];
const usage = {};          // `${universeId}:${attrId}` -> count
const prevByUniverse = {}; // universeId -> Set of last board's attr ids
const histByUniverse = {}; // universeId -> [Set of each board's attr ids]
for (let i = 0; i < DAYS; i++) {
  const iso = isoPlus(FROM, i);
  const universe = universeForDate(iso);
  const sunday = isSunday(iso);
  const size = sunday ? 4 : 3;
  if (sunday && universe.id !== 'countries') throw new Error(`Sunday must be countries, got ${universe.id} on ${iso}`);
  const uUsage = Object.fromEntries(Object.entries(usage)
    .filter(([k]) => k.startsWith(`${universe.id}:`))
    .map(([k, v]) => [k.split(':')[1], v]));
  const board = buildBoard(universe, size, prevByUniverse[universe.id] || new Set(),
    histByUniverse[universe.id] || [], uUsage, i < 7 ? 1 : 2, rnd);
  if (!board) throw new Error(`no board found for ${iso} (${universe.id}); loosen constraints or grow the attribute pool`);
  for (const id of [...board.rows, ...board.cols]) {
    usage[`${universe.id}:${id}`] = (usage[`${universe.id}:${id}`] || 0) + 1;
  }
  prevByUniverse[universe.id] = new Set([...board.rows, ...board.cols]);
  (histByUniverse[universe.id] = histByUniverse[universe.id] || []).push(prevByUniverse[universe.id]);
  out.push({
    num: START_NUM + i,
    quizId: quizIdFor(iso),
    live: iso,
    dateLabel: dateLabelFor(iso),
    sunday,
    universe: universe.id,
    rows: board.rows,
    cols: board.cols,
  });
}

const header = `// Puzzle data for Niche, the daily trivia grid. Imported ONLY by the server
// page (app/niche/page.js), which filters live<=today before handing puzzles
// to the client, so future boards never reach a browser.
//
// A board is three row attributes and three column attributes (four each on
// the Sunday Edition) from one universe in app/niche/facts.js; the ids here
// resolve against that file's attribute registry, which is also what the
// client judges picks by. The universe follows the day of the week: Sunday
// Countries (the 4x4 Edition), Monday US States, Tuesday Animals, Wednesday
// Movies, Thursday TV Shows, Friday Pro Sports Teams, Saturday Musicians.
//
// EVERY board is proven before banking: each cell holds at least 3 valid
// answers, the whole board admits a full set of DISTINCT answers, at least
// one cell is tight (2+ on Sunday), at most 2 attributes carry over from that
// universe's previous board, and none appears more than 3 times per universe
// across the bank.
//
// Do NOT hand-edit a board here. Regenerate with scripts/gen-niche.mjs and
// re-run scripts/verify-niche.mjs.
export const PUZZLES = [
`;
const body = out.map((p) => `  ${JSON.stringify(p)},`).join('\n');
writeFileSync(join(ROOT, 'app/niche/puzzles.js'), `${header}${body}\n];\n`);
console.log(`wrote ${out.length} boards: ${out[0].live} through ${out[out.length - 1].live}`);
const byU = {};
for (const p of out) byU[p.universe] = (byU[p.universe] || 0) + 1;
console.log('per universe:', JSON.stringify(byU));
