#!/usr/bin/env node
// Extend a bank whose generator REWRITES app/<game>/puzzles.js itself.
// Regenerates the whole bank for a longer run, then proves every frozen board
// came back identical; restores the backup and aborts if any did not.
//   node scripts/_extself.mjs <game> <gen.mjs> <untilISO> '<argTemplate>'
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const [game, gen, until, tpl = ''] = process.argv.slice(2);
const bankPath = `app/${game}/puzzles.js`;
const before = fs.readFileSync(bankPath, 'utf8');
const dates = [...before.matchAll(/["']?live["']?\s*:\s*["'](\d{4}-\d{2}-\d{2})["']/g)].map(m => m[1]).sort();
const first = dates[0], last = dates.at(-1);
const total = Math.round((new Date(until + 'T12:00:00Z') - new Date(first + 'T12:00:00Z')) / 864e5) + 1;
if (new Date(until) <= new Date(last)) { console.log(`${game}: already runs to ${last}`); process.exit(0); }
fs.writeFileSync(`/tmp/${game}.bak.js`, before);

let src = fs.readFileSync(`scripts/${gen}`, 'utf8');
const hadDays = /const DAYS = \d+;/.test(src);
if (hadDays) src = src.replace(/const DAYS = \d+;[^\n]*/, `const DAYS = ${total};`);
const tmp = `scripts/_s_${game}.mjs`;
fs.writeFileSync(tmp, src);
const args = tpl.split(/\s+/).filter(Boolean).map(a => a.replace('{FROM}', first).replace('{DAYS}', String(total)));
try { execFileSync('node', [tmp, ...args], { maxBuffer: 1 << 30, stdio: ['ignore', 'inherit', 'inherit'] }); }
finally { fs.unlinkSync(tmp); }

const after = fs.readFileSync(bankPath, 'utf8');
const split = t => t.split(/(?=\{\s*\n?\s*(?:num|"num"))/);
const boardsOf = t => {
  const parts = [];
  const re = /live["']?\s*:\s*["'](\d{4}-\d{2}-\d{2})["']/g; let m;
  const marks = []; while ((m = re.exec(t))) marks.push([m.index, m[1]]);
  for (let i = 0; i < marks.length; i++) parts.push([marks[i][1], t.slice(marks[i][0], marks[i + 1] ? marks[i + 1][0] : t.length)]);
  return parts;
};
const b0 = new Map(boardsOf(before)), b1 = new Map(boardsOf(after));
let drift = 0;
const clean = t => t.replace(/\];?\s*$/, '').replace(/\s+/g, '');
for (const [d, txt] of b0) { const n = b1.get(d); const a = clean(txt), b = n ? clean(n) : ''; if (!n || !(b === a || b.startsWith(a))) drift++; }
if (drift) {
  fs.writeFileSync(bankPath, before);
  console.error(`${game}: ${drift} of ${b0.size} frozen boards changed - RESTORED, needs an append-mode generator`);
  process.exit(2);
}
console.log(`${game}: +${b1.size - b0.size} boards -> ${until} (bank now ${b1.size})`);
