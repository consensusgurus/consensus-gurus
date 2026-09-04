#!/usr/bin/env node
// Extend a DETERMINISTIC generator's bank by regenerating the WHOLE bank for a
// longer run and appending only the tail. The frozen prefix must come back
// byte-identical (per board) or the run aborts, so live boards never change.
//   node scripts/_extfull.mjs <game> <gen.mjs> <untilISO> '<argTemplate>'
// Template placeholders: {FROM} (first live date of the bank) {DAYS} (total)
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const [game, gen, until, tpl] = process.argv.slice(2);
const bankPath = `app/${game}/puzzles.js`;
const bank = fs.readFileSync(bankPath, 'utf8');
const dates = [...bank.matchAll(/["']?live["']?\s*:\s*["'](\d{4}-\d{2}-\d{2})["']/g)].map(m => m[1]).sort();
const first = dates[0], last = dates.at(-1);
const total = Math.round((new Date(until + 'T12:00:00Z') - new Date(first + 'T12:00:00Z')) / 864e5) + 1;
if (new Date(until) <= new Date(last)) { console.log(`${game}: already runs to ${last}`); process.exit(0); }

const args = tpl.split(/\s+/).filter(Boolean).map(a => a.replace('{FROM}', first).replace('{DAYS}', String(total)));
fs.mkdirSync('/tmp/build', { recursive: true });
for (const f of fs.readdirSync('/tmp/build')) if (f.startsWith(game)) fs.unlinkSync(`/tmp/build/${f}`);
const OUTFILE = process.env.EXT_OUTFILE || '';
let out = execFileSync('node', [`scripts/${gen}`, ...args], { maxBuffer: 1 << 30, stdio: ['ignore', OUTFILE ? 'inherit' : 'pipe', 'inherit'] });
out = OUTFILE ? fs.readFileSync(OUTFILE, 'utf8') : out.toString();

const marker = 'export const PUZZLES = [';
const body = out.slice(out.indexOf(marker) + marker.length).replace(/\s*\];\s*$/, '');
// split the generated body into per-board chunks keyed by live date
const chunks = [];
let cur = [];
for (const line of body.split('\n')) {
  if (/live: '\d{4}-\d{2}-\d{2}'/.test(line) && cur.some(l => /^\s*\{|^\s*\{$/.test(l)) && cur.length && chunks.length === 0) { /* noop */ }
  cur.push(line);
}
// simpler: cut on the date markers
const idx = [];
const lines = body.split('\n');
lines.forEach((l, i) => { const m = l.match(/live: '(\d{4}-\d{2}-\d{2})'/); if (m) idx.push([i, m[1]]); });
if (idx.length !== total) { console.error(`${game}: generated ${idx.length} boards, expected ${total}`); process.exit(1); }
const cutAt = idx.findIndex(([, d]) => d === last);
if (cutAt < 0) { console.error(`${game}: generated bank does not contain ${last}`); process.exit(1); }
// find the start line of the board AFTER `last`
const nextStart = idx[cutAt + 1][0];
let s = nextStart;
while (s > 0 && !/^\s*\{/.test(lines[s])) s--;
const tail = lines.slice(s).join('\n');
const tailCount = (tail.match(/live: '\d{4}-\d{2}-\d{2}'/g) || []).length;

// prefix check: every frozen board's generated text must already be in the bank
const norm = t => t.replace(/\s+/g, ' ').trim();
const prefix = lines.slice(0, s).join('\n');
const bankNorm = norm(bank);
let drift = 0;
for (const b of prefix.split(/\n(?=\s*\{)/)) { if (norm(b).length > 40 && !bankNorm.includes(norm(b).replace(/,$/, ''))) drift++; }
if (drift) { console.error(`${game}: ${drift} frozen boards would change - ABORT`); process.exit(2); }

const close = bank.lastIndexOf('];');
fs.writeFileSync(bankPath, bank.slice(0, close) + tail + '\n' + bank.slice(close));
console.log(`${game}: +${tailCount} boards -> ${until} (bank now ${dates.length + tailCount})`);
