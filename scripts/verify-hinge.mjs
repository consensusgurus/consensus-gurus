#!/usr/bin/env node
// Verify the Hinge bank (app/hinge/puzzles.js) against its vocabulary
// (scripts/hinge-pairs.txt) and the client's copy of it (lib/hinge-pairs.js).
//
//   node scripts/verify-hinge.mjs
//
// THIS FILE RECOMPUTES, IT DOES NOT TRUST. It imports nothing from
// scripts/gen-hinge.mjs: the pair file is parsed again here, the graph is
// rebuilt, and the chain count is re-derived with its own search.
//
// WHAT IS CHECKED
//   Shape       nums sequential from 1, dates contiguous and ISO, dateLabel
//               agreeing with `live`, quizId hinge-M-D-YY from `live`, no
//               duplicate ids.
//   Chain       six words on a weekday, eight on a Sunday; every word upper
//               case letters only; no word twice in a chain; EVERY neighbouring
//               pair is a line of the vocabulary read downward.
//   Sunday      `sunday` lands on real Sundays only; a Sunday carries `reveal`
//               at index 3 or 4 and a weekday carries null.
//   Paths       the number of chains between the endpoints under the same
//               letter counts (and the revealed word) recomputed and required
//               to match `paths`, and to sit in 1..4.
//   Variety     no word returns inside 7 days, no hinge inside 21 days, no
//               endpoint inside 21 days.
//   Vocabulary  every pair is two words of letters only, no pair twice, and
//               lib/hinge-pairs.js carries exactly the text file's pairs.
//   Runway      a note under 30 days of bank left.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { PUZZLES } from '../app/hinge/puzzles.js';
import { HINGE_PAIRS } from '../lib/hinge-pairs.js';

const here = dirname(fileURLToPath(import.meta.url));
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WORD_GAP = 7, EDGE_GAP = 21, END_GAP = 21;

let bad = 0;
const fail = (m) => { bad++; console.error(`✗ ${m}`); };

// ─── vocabulary ────────────────────────────────────────────────────────────
const text = readFileSync(join(here, 'hinge-pairs.txt'), 'utf8');
const pairs = [];
const seenPair = new Set();
for (const raw of text.split('\n')) {
  const line = raw.trim();
  if (!line || line.startsWith('#')) continue;
  const parts = line.split(/\s+/);
  if (parts.length !== 2) { fail(`vocabulary line is not two words: "${raw}"`); continue; }
  const [a, b] = parts.map((w) => w.toUpperCase());
  if (!/^[A-Z]+$/.test(a) || !/^[A-Z]+$/.test(b)) { fail(`vocabulary pair has a non-letter: "${raw}"`); continue; }
  const k = `${a} ${b}`;
  if (seenPair.has(k)) { fail(`vocabulary pair listed twice: ${k}`); continue; }
  seenPair.add(k);
  pairs.push([a, b]);
}
const libSet = new Set(HINGE_PAIRS);
if (libSet.size !== seenPair.size || [...seenPair].some((k) => !libSet.has(k)) || [...libSet].some((k) => !seenPair.has(k))) {
  fail('lib/hinge-pairs.js does not match scripts/hinge-pairs.txt (run: node scripts/gen-hinge.mjs --pairs > lib/hinge-pairs.js)');
}
const next = new Map();
for (const [a, b] of pairs) { if (!next.has(a)) next.set(a, []); next.get(a).push(b); }

function chainCount(words, reveal) {
  const L = words.length;
  const end = words[L - 1];
  let n = 0;
  const walk = (w, i, used) => {
    if (n > 60) return;
    if (i === L - 1) { if (w === end) n++; return; }
    for (const nx of next.get(w) || []) {
      if (used.has(nx) || nx.length !== words[i + 1].length) continue;
      if (reveal != null && i + 1 === reveal && nx !== words[reveal]) continue;
      if (i + 1 === L - 1 && nx !== end) continue;
      used.add(nx); walk(nx, i + 1, used); used.delete(nx);
    }
  };
  walk(words[0], 0, new Set([words[0]]));
  return n;
}

// ─── the bank ──────────────────────────────────────────────────────────────
const seenId = new Set();
const lastWord = new Map(), lastEdge = new Map(), lastEnd = new Map();
let prevLive = null;
PUZZLES.forEach((p, idx) => {
  const id = `#${p.num} ${p.live}`;
  const errs = [];
  const push = (m) => errs.push(m);
  if (p.num !== idx + 1) push(`num is ${p.num}, expected ${idx + 1}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.live || '')) push('live is not an ISO date');
  const d = new Date(`${p.live}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) { fail(`${id}: unparseable live date`); return; }
  if (prevLive) {
    const gap = Math.round((d - new Date(`${prevLive}T00:00:00Z`)) / 86400000);
    if (gap !== 1) push(`${gap} days after the previous chain, expected 1`);
  }
  prevLive = p.live;
  const wantId = `hinge-${d.getUTCMonth() + 1}-${d.getUTCDate()}-${String(d.getUTCFullYear()).slice(2)}`;
  if (p.quizId !== wantId) push(`quizId is ${p.quizId}, expected ${wantId}`);
  if (seenId.has(p.quizId)) push('duplicate quizId'); seenId.add(p.quizId);
  const wantLabel = `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
  if (p.dateLabel !== wantLabel) push(`dateLabel is "${p.dateLabel}", expected "${wantLabel}"`);
  const dow = d.getUTCDay();
  const sunday = dow === 0;
  if (!!p.sunday !== sunday) push(`sunday flag is ${!!p.sunday} on a ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dow]}`);
  const words = p.words;
  const L = sunday ? 8 : 6;
  if (!Array.isArray(words) || words.length !== L) push(`chain has ${words && words.length} words, expected ${L}`);
  else {
    if (words.some((w) => !/^[A-Z]+$/.test(w))) push('a word is not upper-case letters');
    if (new Set(words).size !== words.length) push('a word repeats inside the chain');
    for (let i = 0; i + 1 < L; i++) if (!seenPair.has(`${words[i]} ${words[i + 1]}`)) push(`${words[i]} > ${words[i + 1]} is not in the vocabulary`);
    if (sunday) { if (!(p.reveal === 3 || p.reveal === 4)) push(`Sunday reveal is ${p.reveal}, expected 3 or 4`); }
    else if (p.reveal !== null) push(`weekday reveal is ${p.reveal}, expected null`);
    if (errs.length === 0) {
      const n = chainCount(words, sunday ? p.reveal : null);
      if (n !== p.paths) push(`paths is ${p.paths}, recomputed ${n}`);
      if (n < 1 || n > 4) push(`${n} chains fit the letter counts, allowed 1 to 4`);
    }
    for (const w of words) if (lastWord.has(w) && idx - lastWord.get(w) < WORD_GAP) push(`${w} returns ${idx - lastWord.get(w)} days after #${lastWord.get(w) + 1}`);
    for (const w of [words[0], words[L - 1]]) if (lastEnd.has(w) && idx - lastEnd.get(w) < END_GAP) push(`endpoint ${w} returns ${idx - lastEnd.get(w)} days after #${lastEnd.get(w) + 1}`);
    for (let i = 0; i + 1 < L; i++) { const k = `${words[i]} ${words[i + 1]}`; if (lastEdge.has(k) && idx - lastEdge.get(k) < EDGE_GAP) push(`hinge ${k} returns ${idx - lastEdge.get(k)} days after #${lastEdge.get(k) + 1}`); }
    for (const w of words) lastWord.set(w, idx);
    lastEnd.set(words[0], idx); lastEnd.set(words[L - 1], idx);
    for (let i = 0; i + 1 < L; i++) lastEdge.set(`${words[i]} ${words[i + 1]}`, idx);
  }
  if (errs.length) { bad++; for (const e of errs) console.error(`✗ ${id}: ${e}`); }
});

const last = PUZZLES[PUZZLES.length - 1];
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
const runway = Math.round((new Date(`${last.live}T00:00:00Z`) - new Date(`${today}T00:00:00Z`)) / 86400000);
if (runway < 30) console.log(`… only ${runway} days of bank left (through ${last.live}); rebuild before it runs dry`);
if (bad) { console.error(`✗ ${bad} problems in the Hinge bank`); process.exit(1); }
console.log(`✓ ${PUZZLES.length} Hinge chains verified over ${pairs.length} pairs: ${PUZZLES[0].live} to ${last.live} (${runway} days of runway)`);
