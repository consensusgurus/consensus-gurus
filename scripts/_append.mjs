#!/usr/bin/env node
// Extend a bank with a generator in the house extension shape
// (--from/--days/--startnum/--avoid/--out): generate ONLY new boards, then
// splice them on. Frozen boards are never rewritten.
//   node scripts/_append.mjs <game> <gen.mjs> <untilISO> [extraArgs...]
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const [game, gen, until, ...extra] = process.argv.slice(2);
const bankPath = `app/${game}/puzzles.js`;
const bank = fs.readFileSync(bankPath, 'utf8');
const dates = [...bank.matchAll(/["']?live["']?\s*:\s*["'](\d{4}-\d{2}-\d{2})["']/g)].map(m => m[1]).sort();
const nums = [...bank.matchAll(/["']?num["']?\s*:\s*(\d+)/g)].map(m => Number(m[1]));
const last = dates.at(-1), maxNum = Math.max(...nums);
const from = new Date(last + 'T12:00:00Z'); from.setUTCDate(from.getUTCDate() + 1);
const fromISO = from.toISOString().slice(0, 10);
const days = Math.round((new Date(until + 'T12:00:00Z') - from) / 864e5) + 1;
if (days <= 0) { console.log(`${game}: already runs to ${last}`); process.exit(0); }
const out = `/tmp/${game}-new.js`;
const args = ['--from', fromISO, '--days', String(days), '--startnum', String(maxNum + 1),
              '--avoid', bankPath, '--out', out, '--seed', String(Number(fromISO.replace(/-/g, ''))), ...extra];
execFileSync('node', [`scripts/${gen}`, ...args], { maxBuffer: 1 << 30, stdio: ['ignore', 'inherit', 'inherit'] });
const gtxt = fs.readFileSync(out, 'utf8');
const marker = 'export const PUZZLES = [';
const rows = gtxt.slice(gtxt.indexOf(marker) + marker.length).replace(/\s*\];\s*$/, '').replace(/^\n/, '');
const got = (rows.match(/["']?live["']?\s*:\s*["']\d{4}-\d{2}-\d{2}["']/g) || []).length;
if (got !== days) { console.error(`${game}: generated ${got}, expected ${days}`); process.exit(1); }
const close = bank.lastIndexOf('];');
let head = bank.slice(0, close).replace(/,?\s*$/, ',\n');
fs.writeFileSync(bankPath, head + rows + '\n' + bank.slice(close));
console.log(`${game}: +${got} boards, ${fromISO} -> ${until} (bank now ${dates.length + got})`);
