#!/usr/bin/env node
// Regenerates the Emcee puzzle bank from scripts/emcee-wordbank.txt.
//
// WHY THIS EXISTS. The bank covering 2026-08-11 → 2026-09-29 was bulk-generated
// by filling grids from a raw dictionary and then printing the dictionary's own
// gloss as the clue. Because a gloss defines a whole synonym set rather than one
// word, it repeatedly clued the WRONG word: CUE got the definition of CLUE,
// ACRES the definition of DEMESNE, PAR the definition of PARITY. To a player it
// read as letters missing from the words. This script inverts the dependency:
// the CLUE comes first, and a word can only enter a grid if a hand-written clue
// for it already exists in the bank file. There is no code path that invents a
// clue, so that failure cannot recur.
//
// Usage:  node scripts/build-emcee-bank.mjs [firstPuzzleNum]
// Prints puzzles.js entries on stdout for every puzzle from firstPuzzleNum on;
// splice them into app/emcee/puzzles.js, keeping everything before it FROZEN
// (never rewrite a board that has already gone live). Then:
//   node scripts/verify-daily-banks.mjs emcee
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { PUZZLES } from '../app/emcee/puzzles.js';

const here = dirname(fileURLToPath(import.meta.url));
const START = Number(process.argv[2] || 0) || null;

// ── the clue bank: WORD|clue, one per line ─────────────────────────────────
const CLUE = new Map();
for (const line of readFileSync(join(here, 'emcee-wordbank.txt'), 'utf8').trim().split('\n')) {
  if (!line.trim() || line.startsWith('#')) continue;
  const i = line.indexOf('|');
  CLUE.set(line.slice(0, i).trim(), line.slice(i + 1).trim());
}
const WORDS = [...CLUE.keys()];
const IDX = new Map(), BYLEN = new Map();
WORDS.forEach((w, id) => {
  if (!BYLEN.has(w.length)) BYLEN.set(w.length, []);
  BYLEN.get(w.length).push(id);
  for (let i = 0; i < w.length; i++) {
    const k = `${w.length}|${i}|${w[i]}`;
    if (!IDX.has(k)) IDX.set(k, []);
    IDX.get(k).push(id);
  }
});

let seed = 8122026;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const shuffle = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

// ── geometry ───────────────────────────────────────────────────────────────
export function slotsOf(p) {
  const N = p.length, out = [];
  for (let r = 0; r < N; r++) { let c = 0; while (c < N) { if (p[r][c] === '#') { c++; continue; } const s = c; while (c < N && p[r][c] !== '#') c++; if (c - s > 1) out.push({ dir: 'A', r, c: s, len: c - s }); } }
  for (let c = 0; c < N; c++) { let r = 0; while (r < N) { if (p[r][c] === '#') { r++; continue; } const s = r; while (r < N && p[r][c] !== '#') r++; if (r - s > 1) out.push({ dir: 'D', r: s, c, len: r - s }); } }
  for (const s of out) s.cells = Array.from({ length: s.len }, (_, i) => (s.dir === 'A' ? [s.r, s.c + i] : [s.r + i, s.c]));
  return out;
}
function numbering(p) {
  const N = p.length, m = {}; let n = 1;
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    if (p[r][c] === '#') continue;
    const a = (c === 0 || p[r][c - 1] === '#') && c + 1 < N && p[r][c + 1] !== '#';
    const d = (r === 0 || p[r - 1][c] === '#') && r + 1 < N && p[r + 1][c] !== '#';
    if (a || d) m[`${r},${c}`] = n++;
  }
  return m;
}

// Every legal weekday shape: 5x5, exactly 10 words, FULLY CHECKED (each row and
// each column holds exactly one run, length >= 2, so no white square is left
// out of a word in either direction), at least 17 white squares. Enumerated
// rather than hand-listed so the shape pool can't quietly narrow the way the
// old batch did (24 of its 50 boards used the same two sparse 17-white corners).
function weekdayShapes() {
  const N = 5, runs = [], out = [];
  for (let a = 0; a < N; a++) for (let b = a + 1; b < N; b++) runs.push([a, b]);
  const okCols = (g) => { for (let c = 0; c < N; c++) { let s = ''; for (let r = 0; r < N; r++) s += g[r][c]; const p = s.split('#').filter((x) => x.length); if (p.length !== 1 || p[0].length < 2) return false; } return true; };
  const rec = (i, cur) => {
    if (i === N) {
      const g = [];
      for (let r = 0; r < N; r++) { let s = ''; for (let c = 0; c < N; c++) s += c >= cur[r][0] && c <= cur[r][1] ? '.' : '#'; g.push(s); }
      if (okCols(g) && slotsOf(g).length === 10 && g.join('').split('').filter((c) => c === '.').length >= 17) out.push(g);
      return;
    }
    for (const r of runs) rec(i + 1, [...cur, r]);
  };
  rec(0, []);
  // Widen the pool: every 180-symmetric, fully-checked, connected 5x5 with 17+
  // open cells and 10 to 12 slots. The row-run family above yields only 19
  // shapes, and the bank-wide cap of 4 uses per shape caps the bank at 76
  // weekday boards, which is exactly where the bank stalled.
  const seenPat = new Set(out.map((g) => g.join('|')));
  const fullyChecked = (g) => {
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      if (g[r][c] === '#') continue;
      let a = 1, b = 1, cc = c - 1;
      while (cc >= 0 && g[r][cc] !== '#') { a++; cc--; }
      cc = c + 1; while (cc < N && g[r][cc] !== '#') { a++; cc++; }
      let rr = r - 1; while (rr >= 0 && g[rr][c] !== '#') { b++; rr--; }
      rr = r + 1; while (rr < N && g[rr][c] !== '#') { b++; rr++; }
      if (a < 2 || b < 2) return false;
    }
    return true;
  };
  const connected = (g) => {
    const cells = [];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (g[r][c] === '.') cells.push(r * N + c);
    if (!cells.length) return false;
    const seen = new Set([cells[0]]), st = [cells[0]];
    while (st.length) {
      const x = st.pop(), r = (x / N) | 0, c = x % N;
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= N || nc >= N || g[nr][nc] !== '.') continue;
        const k = nr * N + nc;
        if (!seen.has(k)) { seen.add(k); st.push(k); }
      }
    }
    return seen.size === cells.length;
  };
  for (let m = 0; m < (1 << 25); m++) {
    let bits = 0, x = m;
    while (x) { bits += x & 1; x >>= 1; }
    if (25 - bits < 17) continue;
    const g = [];
    for (let r = 0; r < N; r++) { let s = ''; for (let c = 0; c < N; c++) s += (m >> (r * N + c)) & 1 ? '#' : '.'; g.push(s); }
    let sym = true;
    for (let r = 0; r < N && sym; r++) for (let c = 0; c < N; c++) if (g[r][c] !== g[N - 1 - r][N - 1 - c]) { sym = false; break; }
    if (!sym || !fullyChecked(g) || !connected(g)) continue;
    const n = slotsOf(g).length;
    if (n < 10 || n > 12) continue;
    const k = g.join('|');
    if (!seenPat.has(k)) { seenPat.add(k); out.push(g); }
  }
  return out;
}
const SUNDAY = ['...#...', '...#...', '.......', '##...##', '.......', '...#...', '...#...'];
// One fixed Sunday shape put the whole 7x7 load on the same slots every week,
// which is what exhausted the 3-use answer cap and stalled the bank. These are
// hand-picked 180-symmetric 7x7s, each fully checked and connected, so the
// Sunday boards vary their word lengths as well as their words.
const SUNDAYS = [
  SUNDAY,
  ['####...', '...#...', '.......', '.......', '.......', '...#...', '...####'],
  ['#######', '...#...', '.......', '.......', '.......', '...#...', '#######'],
  ['###...#', '#.....#', '.......', '.......', '.......', '#.....#', '#...###'],
  ['##...##', '#.....#', '.......', '.......', '.......', '#.....#', '##...##'],
  ['###...#', '##....#', '.......', '.......', '.......', '#....##', '#...###'],
  ['##...##', '##....#', '.......', '.......', '.......', '#....##', '##...##'],
  ['###...#', '###...#', '.......', '.......', '.......', '#...###', '#...###'],
  ['##...##', '##...##', '.......', '.......', '.......', '##...##', '##...##'],
  ['###...#', '#......', '#......', '.......', '......#', '......#', '#...###'],
  ['###...#', '##.....', '#......', '.......', '......#', '.....##', '#...###'],
  ['###...#', '###....', '#......', '.......', '......#', '....###', '#...###'],
  ['####...', '####...', '#......', '.......', '......#', '...####', '...####'],
  ['###...#', '###....', '##.....', '.......', '.....##', '....###', '#...###'],
  ['####...', '#......', '#......', '#.....#', '......#', '......#', '...####'],
];
const okSunday = (g) => {
  const N = 7;
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    if (g[r][c] === '#') continue;
    let a = 1, b = 1, cc = c - 1;
    while (cc >= 0 && g[r][cc] !== '#') { a++; cc--; }
    cc = c + 1; while (cc < N && g[r][cc] !== '#') { a++; cc++; }
    let rr = r - 1; while (rr >= 0 && g[rr][c] !== '#') { b++; rr--; }
    rr = r + 1; while (rr < N && g[rr][c] !== '#') { b++; rr++; }
    if (a < 2 || b < 2) return false;
  }
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (g[r][c] !== g[N - 1 - r][N - 1 - c]) return false;
  return true;
};
// Every slot length must be one the clue bank actually stocks (3 to 7); a
// shape carrying a 2-letter slot can never be filled.
const STOCKED = new Set([...CLUE.keys()].map((w) => w.length));
const SUNDAY_POOL = SUNDAYS.filter((g) => okSunday(g) && slotsOf(g).every((sl) => STOCKED.has(sl.len)));
if (!SUNDAY_POOL.length) throw new Error('no usable Sunday shape');
console.error(`Sunday shapes usable: ${SUNDAY_POOL.length} of ${SUNDAYS.length}`);

// ── fill ───────────────────────────────────────────────────────────────────
function fill(pat, { banned = new Set(), score = new Map(), budget = 400000 } = {}) {
  const N = pat.length, slots = slotsOf(pat), S = slots.length, A = 65;
  slots.forEach((s) => { s.idx = s.cells.map(([r, c]) => r * N + c); });
  const cells = new Int8Array(N * N).fill(-1);
  const chosen = new Array(S).fill(-1);
  const used = new Set(), no = new Set();
  WORDS.forEach((w, id) => { if (banned.has(w)) no.add(id); });
  let nodes = 0, dead = false;
  const cands = (si) => {
    const s = slots[si];
    let best = null;
    for (let i = 0; i < s.len; i++) {
      const ch = cells[s.idx[i]];
      if (ch < 0) continue;
      const arr = IDX.get(`${s.len}|${i}|${String.fromCharCode(A + ch)}`);
      if (!arr) return [];
      if (!best || arr.length < best.length) best = arr;
    }
    const pool = best || BYLEN.get(s.len) || [], out = [];
    outer: for (const id of pool) {
      if (used.has(id) || no.has(id)) continue;
      const w = WORDS[id];
      for (let i = 0; i < s.len; i++) { const ch = cells[s.idx[i]]; if (ch >= 0 && w.charCodeAt(i) - A !== ch) continue outer; }
      out.push(id);
    }
    return out;
  };
  const dfs = (depth) => {
    if (++nodes > budget) { dead = true; return false; }
    if (depth === S) return true;
    let bi = -1, bc = null;
    for (let i = 0; i < S; i++) {
      if (chosen[i] >= 0) continue;
      const c = cands(i);
      if (!c.length) return false;
      if (bi < 0 || c.length < bc.length) { bi = i; bc = c; }
      if (bc.length === 1) break;
    }
    bc.sort((a, b) => ((score.get(WORDS[a]) || 0) - (score.get(WORDS[b]) || 0)) || (rnd() < 0.5 ? -1 : 1));
    const s = slots[bi];
    for (const id of bc) {
      const w = WORDS[id], set = [];
      for (let i = 0; i < s.len; i++) { const k = s.idx[i]; if (cells[k] < 0) { cells[k] = w.charCodeAt(i) - A; set.push(k); } }
      chosen[bi] = id; used.add(id);
      if (dfs(depth + 1)) return true;
      for (const k of set) cells[k] = -1;
      chosen[bi] = -1; used.delete(id);
      if (dead) return false;
    }
    return false;
  };
  if (!dfs(0)) return null;
  const grid = [];
  for (let r = 0; r < N; r++) { let row = ''; for (let c = 0; c < N; c++) row += pat[r][c] === '#' ? '#' : String.fromCharCode(A + cells[r * N + c]); grid.push(row); }
  const nums = numbering(pat), across = [], down = [];
  slots.forEach((s, i) => {
    const w = WORDS[chosen[i]];
    (s.dir === 'A' ? across : down).push({ n: nums[`${s.r},${s.c}`], r: s.r, c: s.c, len: s.len, clue: CLUE.get(w) });
  });
  across.sort((a, b) => a.n - b.n); down.sort((a, b) => a.n - b.n);
  return { grid, across, down, words: chosen.map((i) => WORDS[i]) };
}

// ── build ──────────────────────────────────────────────────────────────────
const first = START || (PUZZLES.find((p) => p.live >= new Date().toISOString().slice(0, 10)) || PUZZLES[0]).num;
const targets = PUZZLES.filter((p) => p.num >= first);
const WEEK = weekdayShapes();
const answerOf = (p, w, d) => { let s = ''; for (let i = 0; i < w.len; i++) { const r = d === 'A' ? w.r : w.r + i, c = d === 'A' ? w.c + i : w.c; s += p.grid[r][c]; } return s; };

const score = new Map();
for (const p of PUZZLES) {                       // soft-avoid answers the frozen boards already used
  if (p.num >= first) continue;
  for (const w of [...p.across.map((x) => ({ ...x, d: 'A' })), ...p.down.map((x) => ({ ...x, d: 'D' }))]) {
    const a = answerOf(p, w, w.d);
    score.set(a, (score.get(a) || 0) + 4);
  }
}
const CAP = 3;

const uses = new Map(), banned = new Set(), results = [], recent = [];
// The verifier's pairwise-overlap rule spans the WHOLE live bank, so the frozen
// boards have to be in the overlap check too, not just the ones we build here.
for (const p of PUZZLES) {
  if (p.num >= first || !p.grid || !p.grid.length) continue;
  const words = [...p.across.map((x) => ({ ...x, d: 'A' })), ...p.down.map((x) => ({ ...x, d: 'D' }))]
    .map((w) => answerOf(p, w, w.d));
  results.push({ p, made: { words }, frozen: true });
  // and the 3-use answer cap is bank-wide too, so seed it from them as well
  for (const w of words) {
    const n = (uses.get(w) || 0) + 1;
    uses.set(w, n);
    if (n >= CAP) banned.add(w);
  }
}
// The verifier caps any weekday grid shape at 4 uses across the whole live
// bank, so the frozen boards' shapes have to be counted before we start.
const SHAPE_CAP = 4;
const shapeUse = new Map();
for (const p of PUZZLES) {
  if (p.num >= first || p.sunday || !p.grid || !p.grid.length) continue;
  const pat = p.grid.map((row) => row.split('').map((ch) => (ch === '#' ? '#' : '.')).join(''));
  const k = JSON.stringify(pat);
  shapeUse.set(k, (shapeUse.get(k) || 0) + 1);
}
for (const p of targets) {
  const okOverlap = (words) => {
    const s = new Set(words);
    for (const r of results) {
      let n = 0; for (const x of r.made.words) if (s.has(x)) n++;
      if (n > (p.sunday && r.p.sunday ? 3 : 2)) return false;
    }
    return true;
  };
  let made = null, shape = null;
  const pool = p.sunday ? shuffle(SUNDAY_POOL) : shuffle(WEEK)
    .filter((x) => (shapeUse.get(JSON.stringify(x)) || 0) < SHAPE_CAP)
    .filter((x) => !recent.includes(JSON.stringify(x)));
  outer: for (const pat of pool) {
    for (let k = 0; k < (p.sunday ? 24 : 8); k++) {
      const cand = fill(pat, { banned, score, budget: p.sunday ? 1600000 : 400000 });
      if (!cand) break;
      if (okOverlap(cand.words)) { made = cand; shape = pat; break outer; }
    }
  }
  if (!made) { console.error(`FAILED to fill ${p.quizId} — widen scripts/emcee-wordbank.txt`); process.exit(1); }
  if (!p.sunday) {
    const k = JSON.stringify(shape);
    shapeUse.set(k, (shapeUse.get(k) || 0) + 1);
    recent.push(k); if (recent.length > 6) recent.shift();
  }
  for (const w of made.words) {
    const n = (uses.get(w) || 0) + 1;
    uses.set(w, n);
    score.set(w, (score.get(w) || 0) + 10);
    if (n >= CAP) banned.add(w);
  }
  results.push({ p, made });
}
const fresh = results.filter((r) => !r.frozen);
console.error(`built ${fresh.length} boards from #${first}, ${uses.size} distinct answers`);

const esc = (s) => "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
console.log(fresh.map(({ p, made }) => {
  const L = (w) => `      { n: ${w.n}, r: ${w.r}, c: ${w.c}, len: ${w.len}, clue: ${esc(w.clue)} },`;
  return `  {
    num: ${p.num},
    quizId: '${p.quizId}',
    live: '${p.live}',
    dateLabel: '${p.dateLabel}',
    sunday: ${p.sunday},
    size: ${p.size},
    grid: [${made.grid.map((g) => `'${g}'`).join(', ')}],
    across: [
${made.across.map(L).join('\n')}
    ],
    down: [
${made.down.map(L).join('\n')}
    ],
  },`;
}).join('\n'));
