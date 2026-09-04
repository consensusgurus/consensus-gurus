#!/usr/bin/env node
// Extend a generator-backed bank whose generator takes CLI args and prints a
// whole bank to stdout. Existing boards are FROZEN; only new dates are spliced.
//   node scripts/_extcli.mjs <game> <gen.mjs> <untilISO> '<argTemplate>'
// Template placeholders: {FROM} {DAYS} {NUM}
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const [game, gen, until, tpl] = process.argv.slice(2);
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

// reseed so the new segment cannot repeat the frozen one
let src = fs.readFileSync(`scripts/${gen}`, 'utf8');
src = src.replace(/\b(mulberry32|makeRng|xmur3|sfc32)\((\d{4,})\)/g, (m, fn, n) => `${fn}(${Number(n) + maxNum * 7919})`);
src = src.replace(/makeRng\(([^)]*)\)/g, (m, inner) => /\bi\b/.test(inner) ? `makeRng(${inner.replace(/\bi\b/g, `(i + ${maxNum})`)})` : m);
const tmp = `scripts/_x_${game}.mjs`;
fs.writeFileSync(tmp, src);
const args = tpl.split(/\s+/).filter(Boolean)
  .map(a => a.replace('{FROM}', fromISO).replace('{DAYS}', String(days)).replace('{NUM}', String(maxNum + 1)));
fs.mkdirSync('/tmp/build', { recursive: true });
for (const f of fs.readdirSync('/tmp/build')) if (f.startsWith(game)) fs.unlinkSync(`/tmp/build/${f}`);
let out;
try { out = execFileSync('node', [tmp, ...args], { maxBuffer: 1 << 30, stdio: ['ignore', 'pipe', 'inherit'] }).toString(); }
finally { fs.unlinkSync(tmp); }

const marker = 'export const PUZZLES = [';
let rows = out.slice(out.indexOf(marker) + marker.length).replace(/\s*\];\s*$/, '').replace(/^\n/, '');
const seen = new Set(dates);
rows = rows.split('\n').filter(l => { const m = l.match(/["']?live["']?\s*:\s*["'](\d{4}-\d{2}-\d{2})["']/); return !m || !seen.has(m[1]); }).join('\n');
rows = rows.replace(/\bnum:\s*(\d+)/g, (_, n) => `num: ${Number(n) + maxNum}`);
const got = (rows.match(/\bnum:\s*\d+/g) || []).length;
if (got !== days) { console.error(`${game}: generated ${got}, expected ${days}`); process.exit(1); }
const close = bank.lastIndexOf('];');
fs.writeFileSync(bankPath, bank.slice(0, close) + rows + '\n' + bank.slice(close));
console.log(`${game}: +${got} boards, ${fromISO} -> ${until} (bank now ${dates.length + got})`);
