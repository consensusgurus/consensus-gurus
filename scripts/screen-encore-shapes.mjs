#!/usr/bin/env node
// Harvests grid shapes for Encore and screens them for FILLABILITY, writing
// scripts/encore-shapes.json.
//
// Why a cached file rather than searching at build time: a symmetric, fully
// checked 9x9 is legal far more often than it is fillable from a ten-thousand
// word bank. Measured on this bank, roughly one candidate shape in twelve fills
// quickly and the rest do not fill at all inside a large node budget. Screening
// is therefore the expensive step, and it does not depend on which day a board
// lands on, so it is done once and the answer is kept. build-encore-bank.mjs
// then only has to fill shapes already known to be fillable.
//
// Usage: node scripts/screen-encore-shapes.mjs [want9] [want11] [seconds]
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { makeShapes, fill, shuffle, slotsOf, setSeed } from './build-encore-bank.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const WANT9 = Number(process.argv[2] || 40);
const WANT11 = Number(process.argv[3] || 20);
const BUDGET = Number(process.argv[4] || 300) * 1000;

const CFG = {
  9: { minWords: 22, maxWords: 32, minBlocks: 12, maxBlocks: 26, maxThrees: 10, minLongs: 4, limit: 4000 },
  11: { minWords: 32, maxWords: 50, minBlocks: 20, maxBlocks: 42, maxThrees: 14, minLongs: 10, limit: 900 },
};
// Incremental: a run adds to whatever is already on disk, so the screen can be
// done in several passes rather than one long one.
const OUT = join(here, 'encore-shapes.json');
const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')).shapes : { 9: [], 11: [] };
const out = { 9: prev[9] || [], 11: prev[11] || [] };
const seen = new Set([...out[9], ...out[11]].map((g) => g.join('|')));
setSeed((Date.now() & 0x7fffffff) || 1);
const t0 = Date.now();
for (const N of [9, 11]) {
  const want = N === 9 ? WANT9 : WANT11;
  const cands = shuffle(makeShapes(N, CFG[N]));
  let tried = 0;
  for (const g of cands) {
    if (out[N].length >= want) break;
    if (Date.now() - t0 > BUDGET) break;
    tried++;
    // A cheap screen on purpose: a shape that does not fall out in a couple of
    // thousand nodes is not one we want to be waiting on sixty times over.
    if (seen.has(g.join('|'))) continue;
    const r = fill(g, { restarts: 3, cap: 20000, BRANCH: 12, msCap: 1500 });
    if (r) { out[N].push(g); seen.add(g.join('|')); }
  }
  console.error(`${N}x${N}: kept ${out[N].length} of ${tried} tried (${cands.length} legal candidates)`);
}
const json = { note: 'Screened by scripts/screen-encore-shapes.mjs. Every shape here is symmetric, fully checked, connected, and has been proved fillable from the clue bank.', shapes: out };
writeFileSync(join(here, 'encore-shapes.json'), JSON.stringify(json, null, 1) + '\n');
console.error(`wrote encore-shapes.json in ${Math.round((Date.now() - t0) / 1000)}s`);
