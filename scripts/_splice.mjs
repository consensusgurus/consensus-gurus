#!/usr/bin/env node
// Splice a "new boards only" generator output onto the end of a live bank.
//   node scripts/_splice.mjs <game> <newFile>
import fs from 'node:fs';
const [game, newFile] = process.argv.slice(2);
const bankPath = `app/${game}/puzzles.js`;
const bank = fs.readFileSync(bankPath, 'utf8');
const have = new Set([...bank.matchAll(/["']?live["']?\s*:\s*["'](\d{4}-\d{2}-\d{2})["']/g)].map(m => m[1]));
const g = fs.readFileSync(newFile, 'utf8');
const marker = 'export const PUZZLES = [';
let rows = g.slice(g.indexOf(marker) + marker.length).replace(/\s*\];\s*$/, '').replace(/^\n/, '');
const got = (rows.match(/["']?live["']?\s*:\s*["']\d{4}-\d{2}-\d{2}["']/g) || []).length;
const dups = [...rows.matchAll(/["']?live["']?\s*:\s*["'](\d{4}-\d{2}-\d{2})["']/g)].filter(m => have.has(m[1]));
if (dups.length) { console.error(`${game}: ${dups.length} boards already in the bank - ABORT`); process.exit(1); }
const close = bank.lastIndexOf('];');
const head = bank.slice(0, close).replace(/,?\s*$/, ',\n');
fs.writeFileSync(bankPath, head + rows + '\n' + bank.slice(close));
console.log(`${game}: +${got} boards (bank now ${have.size + got}), last ${[...rows.matchAll(/(\d{4}-\d{2}-\d{2})/g)].at(-1)[1]}`);
