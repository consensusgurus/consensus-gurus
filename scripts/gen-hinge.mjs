#!/usr/bin/env node
// gen-hinge — build the Hinge puzzle bank (app/hinge/puzzles.js) and the
// vocabulary module the client checks against (lib/hinge-pairs.js).
//
//   node scripts/gen-hinge.mjs --from 2026-09-03 --days 78 > app/hinge/puzzles.js
//   node scripts/gen-hinge.mjs --pairs > lib/hinge-pairs.js
//
// THE GAME. A chain of words where every neighbouring pair makes a compound
// word or a common two-word phrase, read downward: FIRE > PLACE > MAT > BOARD >
// GAME > PLAN is fireplace, placemat, mat board, board game, game plan. The
// player is given the first and last word and the letter count of every word
// between, and fills the chain top to bottom. ANY chain the vocabulary accepts
// counts, which is why the bank measures how many there are.
//
// HOW A DAY IS MADE
//   1. The vocabulary is scripts/hinge-pairs.txt, one FIRST SECOND pair a line,
//      read as a directed graph (an edge A -> B for every pair "A B").
//   2. Walk the graph at random for the day's length (6 words on a weekday, 8 on
//      the Sunday Edition), never repeating a word.
//   3. Count EVERY chain between the same two endpoints that matches the letter
//      counts (and, on a Sunday, the one revealed middle word). Keep the day
//      only when that count is 1 to 4: one is the setter's path, a handful is
//      the conversation, and past four the letter counts stop meaning anything.
//   4. Variety, measured against the bank as it is built: no word returns
//      inside 7 days, no hinge (a pair) inside 21, no endpoint inside 21.
//
// The setter's path is stored as `words`; the count as `paths`. On a Sunday,
// `reveal` is the index of the middle word printed for the player.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

export function loadPairs() {
  const src = readFileSync(join(here, 'hinge-pairs.txt'), 'utf8');
  const pairs = [];
  for (const raw of src.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const [a, b, ...rest] = line.split(/\s+/);
    if (!a || !b || rest.length) throw new Error(`bad pair line: ${raw}`);
    pairs.push([a.toUpperCase(), b.toUpperCase()]);
  }
  return pairs;
}

export function buildGraph(pairs) {
  const next = new Map();
  const edge = new Set();
  for (const [a, b] of pairs) {
    if (!next.has(a)) next.set(a, []);
    if (!next.has(b)) next.set(b, []);
    const k = `${a} ${b}`;
    if (edge.has(k)) continue;
    edge.add(k);
    next.get(a).push(b);
  }
  return { next, edge };
}

// every chain from `start` to `end` whose words carry the given letter counts
// (counts[i] for the i-th word, endpoints included), with `fixed` words pinned
// by index; capped so a runaway count stops early
export function countChains(graph, start, end, counts, fixed, cap = 50) {
  const L = counts.length;
  let n = 0;
  const found = [];
  const walk = (word, i, used, path) => {
    if (n >= cap) return;
    if (i === L - 1) { if (word === end) { n++; if (found.length < 8) found.push(path.slice()); } return; }
    for (const nx of graph.next.get(word) || []) {
      if (used.has(nx)) continue;
      if (nx.length !== counts[i + 1]) continue;
      if (fixed[i + 1] && fixed[i + 1] !== nx) continue;
      if (i + 1 === L - 1 && nx !== end) continue;
      used.add(nx); path.push(nx);
      walk(nx, i + 1, used, path);
      used.delete(nx); path.pop();
    }
  };
  walk(start, 0, new Set([start]), [start]);
  return { n, found };
}

function rng(seed) {
  let s = seed >>> 0;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
const pick = (arr, rnd) => arr[Math.floor(rnd() * arr.length)];

function randomWalk(graph, L, rnd, hubs) {
  const start = pick(hubs, rnd);
  const path = [start];
  const used = new Set([start]);
  while (path.length < L) {
    const opts = (graph.next.get(path[path.length - 1]) || []).filter((w) => !used.has(w));
    if (!opts.length) return null;
    // the LAST word need not lead anywhere, every other one must
    const viable = path.length === L - 1 ? opts : opts.filter((w) => (graph.next.get(w) || []).some((x) => !used.has(x)));
    if (!viable.length) return null;
    const w = pick(viable, rnd);
    path.push(w); used.add(w);
  }
  return path;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function dateParts(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return { dow, label: `${MONTHS[m - 1]} ${d}, ${y}`, quizId: `hinge-${m}-${d}-${String(y).slice(2)}` };
}
function addDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

const args = process.argv.slice(2);
const opt = (k, dflt) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : dflt; };
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain && args.includes('--pairs')) {
  const pairs = loadPairs();
  const out = [];
  out.push(`// Hinge's vocabulary, GENERATED from scripts/hinge-pairs.txt by
// scripts/gen-hinge.mjs --pairs. Do not edit here; edit the text file and
// rebuild. Each entry is "FIRST SECOND": a compound word or a common two-word
// phrase, and the direction is the hinge (FIRE > PLACE is fireplace).
export const HINGE_PAIRS = ${JSON.stringify(pairs.map(([a, b]) => `${a} ${b}`))};
const SET = new Set(HINGE_PAIRS);
// does A hinge to B, read downward
export function hinges(a, b) { return SET.has(\`\${String(a).toUpperCase()} \${String(b).toUpperCase()}\`); }
const WORDS = new Set();
for (const p of HINGE_PAIRS) { const [a, b] = p.split(' '); WORDS.add(a); WORDS.add(b); }
// every word that takes part in any pair
export function inVocab(w) { return WORDS.has(String(w).toUpperCase()); }
`);
  process.stdout.write(out.join(''));
  process.exit(0);
}

if (isMain) {
  const pairs = loadPairs();
  const graph = buildGraph(pairs);
  const from = opt('--from', '2026-09-03');
  const days = Number(opt('--days', '78'));
  const seed = Number(opt('--seed', '20260903'));
  const rnd = rng(seed);
  const hubs = [...graph.next.entries()].filter(([, v]) => v.length >= 2).map(([k]) => k);
  const lastWord = new Map();   // word -> last day index it appeared
  const lastEdge = new Map();   // "A B" -> last day index
  const lastEnd = new Map();    // endpoint word -> last day index
  const out = [];
  for (let day = 0; day < days; day++) {
    const live = addDays(from, day);
    const dp = dateParts(live);
    const sunday = dp.dow === 0;
    const L = sunday ? 8 : 6;
    let chosen = null;
    let tries = 0;
    // Day one is the chain from the design study, pinned: fireplace, placemat,
    // mat board, board game, game plan. It still has to pass every check.
    const pinned = day === 0 ? opt('--first', 'FIRE,PLACE,MAT,BOARD,GAME,PLAN').split(',') : null;
    while (!chosen) {
      if (++tries > 400000) throw new Error(`no chain for ${live}`);
      const path = pinned ? pinned.slice() : randomWalk(graph, L, rnd, hubs);
      if (!path) continue;
      if (pinned) for (let i = 0; i + 1 < L; i++) if (!graph.edge.has(`${path[i]} ${path[i + 1]}`)) throw new Error(`pinned chain breaks at ${path[i]} ${path[i + 1]}`);
      if (path.some((w) => lastWord.has(w) && day - lastWord.get(w) < 7)) continue;
      if ([path[0], path[L - 1]].some((w) => lastEnd.has(w) && day - lastEnd.get(w) < 21)) continue;
      let edgeClash = false;
      for (let i = 0; i + 1 < L; i++) { const k = `${path[i]} ${path[i + 1]}`; if (lastEdge.has(k) && day - lastEdge.get(k) < 21) { edgeClash = true; break; } }
      if (edgeClash) continue;
      const counts = path.map((w) => w.length);
      const fixed = {};
      let reveal = null;
      if (sunday) { reveal = 3 + Math.floor(rnd() * 2); fixed[reveal] = path[reveal]; }
      const { n } = countChains(graph, path[0], path[L - 1], counts, fixed, 50);
      if (n < 1 || n > 4) { if (pinned) throw new Error(`pinned chain admits ${n} chains`); continue; }
      chosen = { path, n, reveal };
    }
    for (const w of chosen.path) lastWord.set(w, day);
    lastEnd.set(chosen.path[0], day); lastEnd.set(chosen.path[L - 1], day);
    for (let i = 0; i + 1 < L; i++) lastEdge.set(`${chosen.path[i]} ${chosen.path[i + 1]}`, day);
    out.push({ num: day + 1, quizId: dp.quizId, live, dateLabel: dp.label, sunday, words: chosen.path, reveal: chosen.reveal, paths: chosen.n });
    process.stderr.write(`${live} ${chosen.path.join(' > ')} (${chosen.n} chains, ${tries} tries)\n`);
  }
  const lines = [];
  lines.push(`// Puzzle data for Hinge, the daily compound-word chain. Imported ONLY by the
// server page (app/hinge/page.js), which filters live<=today before handing
// puzzles to the client, so future chains never reach a browser.
//
// \`words\` is the setter's chain, first to last; the player is shown words[0],
// words[last], the letter count of every word between, and on a Sunday the word
// at index \`reveal\`. Every neighbouring pair is a line of scripts/hinge-pairs.txt
// read downward. \`paths\` is the MEASURED number of chains the vocabulary admits
// between the same endpoints under the same letter counts (1 to 4 by rule): the
// player's chain need not be the setter's, any chain the vocabulary accepts
// counts. Weekdays are six words (four to fill); the Sunday Edition is eight
// words (six to fill) with one middle word printed.
//
// Variety, checked by scripts/verify-hinge.mjs: no word returns inside 7 days,
// no hinge inside 21, no endpoint inside 21.
//
// Do NOT hand-edit a chain here. Regenerate with scripts/gen-hinge.mjs and
// re-run scripts/verify-hinge.mjs.
export const PUZZLES = [`);
  for (const p of out) {
    lines.push(`  { num: ${p.num}, quizId: '${p.quizId}', live: '${p.live}', dateLabel: '${p.dateLabel}', sunday: ${p.sunday}, words: ${JSON.stringify(p.words)}, reveal: ${p.reveal === null ? 'null' : p.reveal}, paths: ${p.paths} },`);
  }
  lines.push('];');
  process.stdout.write(lines.join('\n') + '\n');
}
