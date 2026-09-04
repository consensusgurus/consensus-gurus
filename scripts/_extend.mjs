#!/usr/bin/env node
// Extend a generator-backed daily bank: regenerate ONLY the days after the
// bank's current last board and splice them in. Existing boards are FROZEN.
//   node scripts/_extend.mjs <game> <genScript> <untilISO>
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const [game, gen, until] = process.argv.slice(2);
const bankPath = `app/${game}/puzzles.js`;
const bank = fs.readFileSync(bankPath, 'utf8');
const dates = [...bank.matchAll(/["']?live["']?\s*:\s*["'](\d{4}-\d{2}-\d{2})["']/g)].map(m => m[1]);
const nums = [...bank.matchAll(/\bnum:\s*(\d+)/g)].map(m => Number(m[1]));
const last = dates.slice().sort().at(-1);
const maxNum = Math.max(...nums);
const from = new Date(last + 'T12:00:00Z'); from.setUTCDate(from.getUTCDate() + 1);
const fromISO = from.toISOString().slice(0, 10);
const days = Math.round((new Date(until + 'T12:00:00Z') - from) / 864e5) + 1;
if (days <= 0) { console.log(`${game}: already runs to ${last}`); process.exit(0); }

const src = fs.readFileSync(`scripts/${gen}`, 'utf8');
let patched = src.replace(/const START = '[\d-]+';[^\n]*/, `const START = '${fromISO}';`)
                 .replace(/const DAYS = \d+;[^\n]*/, `const DAYS = ${days};`);
patched = patched.replace(/makeRng\(([^)]*)\)/g, (m, inner) => /\bi\b/.test(inner) ? `makeRng(${inner.replace(/\bi\b/g, `(i + ${maxNum})`)})` : m);
if (!patched.includes(`const START = '${fromISO}'`) || !patched.includes(`const DAYS = ${days};`)) {
  console.error(`${game}: could not patch START/DAYS in ${gen}`); process.exit(1);
}
const tmp = `scripts/_ext_${game}.mjs`;
fs.writeFileSync(tmp, patched);
fs.mkdirSync('/tmp/build', { recursive: true });
for (const f of fs.readdirSync('/tmp/build')) if (f.startsWith(game)) fs.unlinkSync(`/tmp/build/${f}`);
// keep the generator's stderr: it is where 'no candidate for <date>' is said
const out = execFileSync('node', [tmp], { maxBuffer: 1 << 30, stdio: ['ignore', 'pipe', 'inherit'] }).toString();
fs.unlinkSync(tmp);

const marker = 'export const PUZZLES = [';
let rows = out.slice(out.indexOf(marker) + marker.length).replace(/\s*\];\s*$/, '').replace(/^\n/, '');
rows = rows.replace(/\bnum:\s*(\d+)/g, (_, n) => `num: ${Number(n) + maxNum}`);
const got = (rows.match(/\bnum:\s*\d+/g) || []).length;
if (got !== days) { console.error(`${game}: generated ${got}, expected ${days}`); process.exit(1); }
const close = bank.lastIndexOf('];');
fs.writeFileSync(bankPath, bank.slice(0, close) + rows + '\n' + bank.slice(close));
console.log(`${game}: +${got} boards, ${fromISO} -> ${until} (bank now ${dates.length + got})`);
