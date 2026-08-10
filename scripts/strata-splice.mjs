// One-off companion to strata-repair.mjs: drop the rebuilt boards into
// app/strata/puzzles.js in place, matching the file's existing key order and
// formatting so the diff is only the boards that changed.
//
// Run: node scripts/strata-repair.mjs > /tmp/repaired.json
//      node scripts/strata-splice.mjs /tmp/repaired.json <src> <dest>
import { readFileSync, writeFileSync } from 'node:fs';

const [, , jsonPath, srcPath, destPath] = process.argv;
const boards = JSON.parse(readFileSync(jsonPath, 'utf8'));
let src = readFileSync(srcPath, 'utf8');

const q = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const arr = (a) => `[${a.map(q).join(', ')}]`;

for (const p of boards) {
  const lines = [
    `    num: ${p.num},`,
    `    quizId: ${q(p.quizId)},`,
    `    live: ${q(p.live)},`,
    `    dateLabel: ${q(p.dateLabel)},`,
    ...(p.sunday ? ['    sunday: true,'] : []),
    `    rows: ${p.rows},`,
    `    cols: ${p.cols},`,
    `    themes: ${arr(p.themes)},`,
    `    columns: ${arr(p.columns)},`,
    `    owners: ${arr(p.owners)},`,
    `    words: ${arr(p.words)},`,
    `    tier: ${p.tier},`,
    `    minZipf: ${p.minZipf},`,
    `    pool: ${arr(p.pool)},`,
    `    opening: ${p.opening},`,
    `    deepest: ${p.deepest},`,
  ].join('\n');

  // Match from this board's `num:` line to the end of its object literal. Anchored
  // on the exact indentation the file uses, so it cannot run past into the next.
  const re = new RegExp(`^ {4}num: ${p.num},\\n(?: {4}.*\\n)*?  \\},$`, 'm');
  if (!re.test(src)) throw new Error(`could not locate board #${p.num} in ${srcPath}`);
  src = src.replace(re, `${lines}\n  },`);
}
writeFileSync(destPath, src);
console.error(`spliced ${boards.length} board(s): ${boards.map((b) => '#' + b.num).join(', ')}`);
