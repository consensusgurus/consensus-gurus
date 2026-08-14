#!/usr/bin/env node
// gen-barter — extend the Barter puzzle bank.
//
//   node scripts/gen-barter.mjs 2026-09-13 30
//
// Generates <days> boards starting at <startDate> (inclusive), appending to the
// bank in app/barter/puzzles.js: weekdays are 5x5 (three across + three down
// words, par band 11-14), Sundays are 7x7 (four + four, par band 20-25, flagged
// sunday: true). Every board is checked before it is accepted:
//
//   - all words from the common pool (see scripts/barter-core.mjs), no word
//     ever reused across the WHOLE bank, existing entries included
//   - unique up to transposition against the common pool
//   - start is a permutation of the tiles with at most 2 (Sunday 4) accidental
//     greens and no word already solved
//   - par is the exact minimum trade count (recomputed, never assumed)
//
// EYEBALL THE WORD LIST BEFORE SHIPPING. The blocklists in barter-core catch
// known proper nouns and British spellings, but a name or brand the lists have
// not met yet can still slip through (kraft, kirby, tesla and tyler all did in
// the launch build). Print every new board's words and read them; add offenders
// to the NAMES set in barter-core.mjs and regenerate that day. Then run
// scripts/verify-barter.mjs (or verify-all) before pushing — it is the gate.
//
// Output is JSON on stdout: paste the entries into PUZZLES in
// app/barter/puzzles.js (or wire a splice step). num continues from the
// existing bank; quizId is barter-M-D-YY.
import { loadPools, fillLattice, buildGrid, gridWords, latticeCells, minSwaps, uniqueUpToTranspose, makeRng } from './barter-core.mjs';
import { PUZZLES } from '../app/barter/puzzles.js';

const startArg = process.argv[2];
const daysArg = Number(process.argv[3] || 30);
if (!/^\d{4}-\d{2}-\d{2}$/.test(startArg || '')) {
  console.error('usage: node scripts/gen-barter.mjs <YYYY-MM-DD> [days]');
  process.exit(1);
}

const { common5, common7 } = await loadPools();
const banned = new Set();
for (const p of PUZZLES) {
  for (const w of gridWords(p.sol, p.size)) banned.add(w);
}
let nextNum = PUZZLES.length ? Math.max(...PUZZLES.map((p) => p.num)) + 1 : 1;
const lastLive = PUZZLES.length ? PUZZLES[PUZZLES.length - 1].live : null;
if (lastLive && startArg <= lastLive) {
  console.error(`bank already runs to ${lastLive}; start after it`);
  process.exit(1);
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const rng = makeRng(Date.parse(startArg) % 4294967291);
const out = [];
const d = new Date(`${startArg}T12:00:00Z`);
for (let i = 0; i < daysArg; i++) {
  const live = d.toISOString().slice(0, 10);
  const sunday = d.getUTCDay() === 0;
  const S = sunday ? 7 : 5;
  const pool = sunday ? common7 : common5;
  let done = false;
  for (let attempt = 0; attempt < 500 && !done; attempt++) {
    const fill = fillLattice(pool, S, rng, banned);
    if (!fill) continue;
    const sol = buildGrid(fill.rows, fill.cols, S);
    if (!uniqueUpToTranspose(sol, S, pool)) continue;
    const sc = scramble(sol, S, sunday ? [20, 25, 4] : [11, 14, 2]);
    if (!sc) continue;
    const words = gridWords(sol, S);
    for (const w of words) banned.add(w);
    const [Y, M, D] = live.split('-').map(Number);
    out.push({
      num: nextNum++, quizId: `barter-${M}-${D}-${Y % 100}`, live,
      dateLabel: `${MONTHS[M - 1]} ${D}, ${Y}`, sunday, size: S, par: sc.par,
      sol, start: sc.startGrid,
    });
    console.error(`#${out[out.length - 1].num} ${live}${sunday ? ' SUN' : ''} par=${sc.par}  ${words.join(',')}`);
    done = true;
  }
  if (!done) { console.error('FAILED to build a board for', live); process.exit(1); }
  d.setUTCDate(d.getUTCDate() + 1);
}
console.log(JSON.stringify(out, null, 2));

function scramble(sol, S, [parLo, parHi, maxGreens]) {
  const cells = latticeCells(S);
  const target = cells.map(([r, c]) => sol[r][c]);
  for (let t = 0; t < 6000; t++) {
    const perm = target.slice();
    for (let i = perm.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
    let greens = 0;
    for (let i = 0; i < perm.length; i++) if (perm[i] === target[i]) greens++;
    if (greens > maxGreens) continue;
    const g = Array.from({ length: S }, () => Array(S).fill('.'));
    cells.forEach(([r, c], i) => { g[r][c] = perm[i]; });
    const startGrid = g.map((r) => r.join(''));
    const sw = gridWords(startGrid, S), tw = gridWords(sol, S);
    if (sw.some((w, i) => w === tw[i])) continue;
    const r = minSwaps(perm, target);
    if (!r.exact) continue;
    if (r.par >= parLo && r.par <= parHi) return { startGrid, par: r.par, greens };
  }
  return null;
}
