#!/usr/bin/env node
// verify-barter — the shipping gate for the Barter bank (app/barter/puzzles.js).
//
// Recomputes everything, trusts no stored field (daily authoring standard,
// CLAUDE.md). Shares its engine with the generator via scripts/barter-core.mjs
// so the two cannot drift. Checks, per board:
//
//   1. roster: nums sequential from 1, live dates consecutive (no gaps), quizId
//      is barter-M-D-YY of live, dateLabel matches live
//   2. Sunday scaling: sunday === (live is a real Sunday), size 7 iff sunday,
//      else size 5 — the flag is the source of truth and must be backed
//   3. shape: sol/start are S strings of length S, holes '.' exactly at
//      odd-odd cells, letters a-z everywhere else
//   4. words: every row/column word is in the common pool (vocab top 20,000 ∩
//      crux-words minus the blocklists) — this also re-rejects British
//      spellings and known proper nouns if the pool rules ever change
//   5. start: same tile multiset as sol, at most 2 (Sunday 4) accidental
//      greens, no word already solved at the start
//   6. par: recomputed EXACT minimum trade count === stored par, inside the
//      band (weekday 11-14, Sunday 20-25)
//   7. uniqueness: unique up to transposition against the common pool
//
// Bank-wide: no word reused anywhere across the bank, and at least 3 distinct
// weekday pars (a bank where every day plays the same is a defect even when
// each board is legal). Sundays dominate runtime (the 7x7 uniqueness proof can
// take a minute or two on a stubborn board); the weekday sweep is seconds.
import { loadPools, gridWords, latticeCells, minSwaps, uniqueUpToTranspose } from './barter-core.mjs';
import { PUZZLES } from '../app/barter/puzzles.js';

let fails = 0;
const bad = (msg) => { console.log(`✗ ${msg}`); fails++; };
const { common5, common7 } = await loadPools();
const common5Set = new Set(common5), common7Set = new Set(common7);

if (!PUZZLES.length) bad('empty bank');

const seenWords = new Map(); // word -> first quizId
const parsByKind = { weekday: new Set(), sunday: new Set() };

for (let i = 0; i < PUZZLES.length; i++) {
  const p = PUZZLES[i];
  const id = p.quizId || `index ${i}`;

  // 1. roster coherence
  if (p.num !== i + 1) bad(`${id}: num ${p.num}, expected ${i + 1}`);
  const d = new Date(`${p.live}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) { bad(`${id}: bad live date ${p.live}`); continue; }
  if (i > 0) {
    const prev = new Date(`${PUZZLES[i - 1].live}T12:00:00Z`);
    if ((d - prev) !== 86400000) bad(`${id}: live ${p.live} does not follow ${PUZZLES[i - 1].live} by one day`);
  }
  const [Y, M, D] = p.live.split('-').map(Number);
  if (p.quizId !== `barter-${M}-${D}-${Y % 100}`) bad(`${id}: quizId does not match live ${p.live}`);
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  if (p.dateLabel !== `${MONTHS[M - 1]} ${D}, ${Y}`) bad(`${id}: dateLabel "${p.dateLabel}" does not match live`);

  // 2. Sunday scaling
  const isSun = d.getUTCDay() === 0;
  if (!!p.sunday !== isSun) bad(`${id}: sunday flag ${!!p.sunday} but ${p.live} ${isSun ? 'IS' : 'is not'} a Sunday`);
  const S = p.sunday ? 7 : 5;
  if (p.size !== S) bad(`${id}: size ${p.size}, expected ${S}`);

  // 3. shape
  const shapeOk = (grid, name) => {
    if (!Array.isArray(grid) || grid.length !== S) { bad(`${id}: ${name} is not ${S} rows`); return false; }
    for (let r = 0; r < S; r++) {
      if (typeof grid[r] !== 'string' || grid[r].length !== S) { bad(`${id}: ${name} row ${r} wrong length`); return false; }
      for (let c = 0; c < S; c++) {
        const hole = r % 2 === 1 && c % 2 === 1;
        const ch = grid[r][c];
        if (hole && ch !== '.') { bad(`${id}: ${name} (${r},${c}) should be a hole`); return false; }
        if (!hole && !/[a-z]/.test(ch)) { bad(`${id}: ${name} (${r},${c}) is "${ch}"`); return false; }
      }
    }
    return true;
  };
  if (!shapeOk(p.sol, 'sol') || !shapeOk(p.start, 'start')) continue;

  // 4. words in the common pool; bank-wide reuse
  const pool = p.sunday ? common7Set : common5Set;
  const words = gridWords(p.sol, S);
  for (const w of words) {
    if (!pool.has(w)) bad(`${id}: word "${w}" is not in the common pool`);
    if (seenWords.has(w)) bad(`${id}: word "${w}" already used by ${seenWords.get(w)}`);
    else seenWords.set(w, p.quizId);
  }

  // 5. start arrangement
  const cells = latticeCells(S);
  const target = cells.map(([r, c]) => p.sol[r][c]);
  const startF = cells.map(([r, c]) => p.start[r][c]);
  const ms = (a) => a.slice().sort().join('');
  if (ms(target) !== ms(startF)) bad(`${id}: start is not a permutation of sol's tiles`);
  let greens = 0;
  for (let k = 0; k < target.length; k++) if (startF[k] === target[k]) greens++;
  const maxGreens = p.sunday ? 4 : 2;
  if (greens > maxGreens) bad(`${id}: ${greens} tiles start home (max ${maxGreens})`);
  const startWords = gridWords(p.start, S);
  startWords.forEach((w, k) => { if (w === words[k]) bad(`${id}: word "${words[k]}" starts already solved`); });

  // 6. par, recomputed exactly
  const r = minSwaps(startF, target);
  if (!r.exact) bad(`${id}: par search blew its budget — regenerate this scramble`);
  else if (r.par !== p.par) bad(`${id}: stored par ${p.par}, recomputed ${r.par}`);
  const [lo, hi] = p.sunday ? [20, 25] : [11, 14];
  if (p.par < lo || p.par > hi) bad(`${id}: par ${p.par} outside band ${lo}-${hi}`);
  parsByKind[p.sunday ? 'sunday' : 'weekday'].add(p.par);

  // 7. uniqueness up to transposition (the slow one on Sundays)
  const poolArr = p.sunday ? common7 : common5;
  if (!uniqueUpToTranspose(p.sol, S, poolArr)) bad(`${id}: lattice admits another common-word filling beyond the transpose`);
}

if (parsByKind.weekday.size < 3 && PUZZLES.filter((p) => !p.sunday).length >= 6) {
  bad(`weekday par has only ${parsByKind.weekday.size} distinct values across the bank — vary the scrambles`);
}

console.log(fails ? `\n${fails} failure${fails === 1 ? '' : 's'}.` : `\nAll ${PUZZLES.length} Barter boards verified.`);
process.exit(fails ? 1 : 0);
