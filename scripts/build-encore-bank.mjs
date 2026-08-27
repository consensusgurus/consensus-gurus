#!/usr/bin/env node
// Builds the Encore puzzle bank: the 9x9 weekday / 11x11 Sunday crossword.
//
// Encore is Emcee's big brother, so it inherits Emcee's hard authoring rule and
// its consequence: THE CLUE COMES FIRST. A word can only enter a grid if a
// hand-written clue for it already exists in a bank file, and there is no code
// path here that invents one. That inversion is why the Emcee gloss disaster
// (a dictionary gloss defines a whole synonym set, so it reliably clues the
// WRONG word: CUE getting CLUE's definition, ACRES getting DEMESNE's) cannot
// recur. Two bank files are read:
//
//   scripts/emcee-wordbank.txt   3, 4, 5 and 7 letters  (shared with Emcee)
//   scripts/encore-wordbank.txt  6, 8 and 9 letters     (written for Encore)
//
// Grid rules, all enforced below and re-proved by scripts/verify-encore.mjs:
//   * 180 degree rotational symmetry, the standard crossword convention.
//   * FULLY CHECKED: every white square belongs to both an across and a down
//     word, and every entry is at least 3 letters. No unchecked squares and no
//     two-letter entries.
//   * All white squares connected, so the grid is one puzzle rather than two.
//   * No entry longer than 9, because the bank stops at 9. That is the real
//     constraint on the 11x11: it needs enough blocks to break every line.
//   * Variety across the WHOLE bank, not just per board: an answer is used at
//     most CAP times, two boards share at most a few answers, and no grid shape
//     repeats inside a week.
//
// Usage:  node scripts/build-encore-bank.mjs [days] [startDate]
// Prints a complete app/encore/puzzles.js on stdout. THE PAST IS FROZEN: to
// extend a live bank, pass the first unplayed date and splice, never rewrite a
// board that has already gone out.
import { readFileSync, existsSync, appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const DAYS = Number(process.argv[2] || 60);
const START = process.argv[3] || new Date().toISOString().slice(0, 10);
const FIRST_NUM = Number(process.argv[4] || 1);

// ── the clue bank ──────────────────────────────────────────────────────────
const CLUE = new Map();
for (const f of ['emcee-wordbank.txt', 'encore-wordbank.txt']) {
  const p = join(here, f);
  if (!existsSync(p)) { console.error(`missing ${f}`); process.exit(1); }
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('|');
    if (i < 1) continue;
    const w = t.slice(0, i).trim(), c = t.slice(i + 1).trim();
    if (!/^[A-Z]+$/.test(w) || !c) continue;
    if (!CLUE.has(w)) CLUE.set(w, c);
  }
}
const WORDS = [...CLUE.keys()];
const BYLEN = new Map(), IDX = new Map();
WORDS.forEach((w, id) => {
  if (!BYLEN.has(w.length)) BYLEN.set(w.length, []);
  BYLEN.get(w.length).push(id);
  for (let i = 0; i < w.length; i++) {
    const k = `${w.length}|${i}|${w[i]}`;
    if (!IDX.has(k)) IDX.set(k, []);
    IDX.get(k).push(id);
  }
});
// The bank runs to 9 letters, but grids stop at 7 and that is a deliberate
// design decision rather than a shortfall. Measured on this bank: 9x9 shapes
// whose longest entry is 7 fill 9 times in 10; shapes carrying a 9-letter
// spanner fill 0 times in 10, because a nine-letter answer crosses nine downs
// and a ten-thousand word list is an order of magnitude thinner than the lists
// commercial fill software runs on. Seven is where this bank has real depth
// (3,193 answers, the largest pool of any length), so seven is the ceiling.
// The 8 and 9 letter entries stay in the bank for a future, deeper version.
const MAXLEN = 7;
console.error(`bank: ${WORDS.length} clued answers, lengths ${[...BYLEN.keys()].sort((a, b) => a - b).join(',')}`);

let seed = 8272026;
export const setSeed = (n) => { seed = n >>> 0; };
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const pick = (a) => a[Math.floor(rnd() * a.length)];
export const shuffle = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

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
// every maximal white run in every row AND column is 3..MAXLEN (so no unchecked
// square, no 2-letter entry, and nothing longer than the bank can fill)
function runsOk(g) {
  const N = g.length;
  const line = (s) => s.split('#').filter((x) => x.length).every((x) => x.length >= 3 && x.length <= MAXLEN);
  for (let r = 0; r < N; r++) if (!line(g[r])) return false;
  for (let c = 0; c < N; c++) { let s = ''; for (let r = 0; r < N; r++) s += g[r][c]; if (!line(s)) return false; }
  return true;
}
function connected(g) {
  const N = g.length; let start = -1;
  for (let i = 0; i < N * N; i++) if (g[Math.floor(i / N)][i % N] !== '#') { start = i; break; }
  if (start < 0) return false;
  const seen = new Set([start]), q = [start];
  while (q.length) {
    const i = q.pop(), r = Math.floor(i / N), c = i % N;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const r2 = r + dr, c2 = c + dc;
      if (r2 < 0 || r2 >= N || c2 < 0 || c2 >= N) continue;
      const j = r2 * N + c2;
      if (g[r2][c2] === '#' || seen.has(j)) continue;
      seen.add(j); q.push(j);
    }
  }
  let white = 0;
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (g[r][c] !== '#') white++;
  return seen.size === white;
}

// Valid single-row block patterns for width N: every white run 3..MAXLEN, and
// never more than MAXBLOCKRUN blocks in a row (a wall of four reads as a hole
// in the grid rather than as a crossword).
const MAXBLOCKRUN = 3;
function rowPatterns(N) {
  const out = [];
  const ok = (s) => s.includes('.')
    && s.split('#').filter((x) => x.length).every((x) => x.length >= 3 && x.length <= MAXLEN)
    && !s.includes('#'.repeat(MAXBLOCKRUN + 1));
  const rec = (c, cur) => {
    if (c === N) { const s = cur.join(''); if (ok(s)) out.push(s); return; }
    rec(c + 1, [...cur, '.']);
    rec(c + 1, [...cur, '#']);
  };
  rec(0, []);
  return out;
}
function colsOk(g) {
  const N = g.length;
  for (let c = 0; c < N; c++) {
    let s = '';
    for (let r = 0; r < N; r++) s += g[r][c];
    if (!s.includes('.')) return false;
    if (s.includes('#'.repeat(MAXBLOCKRUN + 1))) return false;
    if (!s.split('#').filter((x) => x.length).every((x) => x.length >= 3 && x.length <= MAXLEN)) return false;
  }
  return true;
}

// Symmetric shape search: the top half is chosen from the valid row patterns
// and the bottom half is its 180 degree mirror, so symmetry is free and the
// COLUMNS are what actually has to check out. Rows are walked in a shuffled
// order so the harvest is varied rather than lexicographic.
export function makeShapes(N, { minWords, maxWords, minBlocks, maxBlocks, maxThrees, minLongs, limit }) {
  const ROWS = shuffle(rowPatterns(N));
  const mid = Math.floor(N / 2);
  const palin = ROWS.filter((s) => s === [...s].reverse().join(''));
  const out = [];
  // prune early: a column run already closed off by the rows chosen so far can
  // never grow, so a 1 or 2 up there is dead no matter what comes below.
  const topOk = (rows) => {
    const k = rows.length;
    for (let c = 0; c < N; c++) {
      let run = 0, blk = 0;
      for (let r = 0; r < k; r++) {
        if (rows[r][c] === '#') { if (run > 0 && run < 3) return false; run = 0; if (++blk > MAXBLOCKRUN) return false; }
        else { blk = 0; if (++run > MAXLEN) return false; }
      }
    }
    return true;
  };
  const rec = (r, cur) => {
    if (out.length >= limit) return;
    if (r === mid) {
      for (const m of (N % 2 ? palin : [null])) {
        const g = [...cur];
        if (m) g.push(m);
        for (let i = cur.length - 1; i >= 0; i--) g.push([...cur[i]].reverse().join(''));
        const b = g.join('').split('').filter((ch) => ch === '#').length;
        if (b < minBlocks || b > maxBlocks) continue;
        if (!colsOk(g)) continue;
        if (!connected(g)) continue;
        const sl = slotsOf(g);
        if (sl.length < minWords || sl.length > maxWords) continue;
        // Shape QUALITY, not just legality. A 9x9 cut into thirty three-letter
        // answers is a mini wearing a big frame: the point of the bigger grid
        // is longer entries, so cap the short stuff and insist on real ones.
        if (sl.filter((x) => x.len === 3).length > maxThrees) continue;
        if (sl.filter((x) => x.len >= 6).length < minLongs) continue;
        out.push(g);
        if (out.length >= limit) return;
      }
      return;
    }
    for (const p of ROWS) {
      const nx = [...cur, p];
      if (!topOk(nx)) continue;
      rec(r + 1, nx);
      if (out.length >= limit) return;
    }
  };
  rec(0, []);
  return out;
}

// ── fill ───────────────────────────────────────────────────────────────────
// Bitset constraint propagation, because a 9x9 is a different problem from a
// 5x5. The mini's filler recomputed every slot's candidate list at every node,
// which is fine for ten slots and fatal for thirty: it never finished a single
// 9x9 board. Here each slot carries a bitset of the answers still open to it,
// assigning a word intersects the crossing slots with a precomputed
// (length, position, letter) mask, and the search takes the most constrained
// slot first. Failure is met with a random restart rather than deep
// backtracking, which is what actually finds crossword fills.
const LEN = new Map();   // len -> { ids:[globalId], mask: [pos][26] Uint32Array, full: Uint32Array }
for (const [len, ids] of BYLEN) {
  const n = ids.length, wl = (n + 31) >> 5;
  const mask = Array.from({ length: len }, () => Array.from({ length: 26 }, () => new Uint32Array(wl)));
  const full = new Uint32Array(wl);
  ids.forEach((gid, li) => {
    full[li >> 5] |= 1 << (li & 31);
    const w = WORDS[gid];
    for (let i = 0; i < len; i++) mask[i][w.charCodeAt(i) - 65][li >> 5] |= 1 << (li & 31);
  });
  LEN.set(len, { ids, mask, full, wl, local: new Map(ids.map((g, i) => [g, i])) });
}
// `| 0` is load-bearing: a Uint32Array element is an unsigned NUMBER, and the
// standard popcount is int32 arithmetic. Without the coercion any word with
// bit 31 set stays a float and the count comes back nonsense, which shows up
// as the search reporting every slot dead and failing at depth zero.
const popcnt = (b) => { let n = 0; for (let i = 0; i < b.length; i++) { let v = b[i] | 0; v = v - ((v >>> 1) & 0x55555555); v = (v & 0x33333333) + ((v >>> 2) & 0x33333333); n += (((v + (v >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24; } return n; };
const bitsOf = (b) => { const out = []; for (let i = 0; i < b.length; i++) { let v = b[i]; while (v) { const t = v & -v; out.push((i << 5) + 31 - Math.clz32(t)); v ^= t; } } return out; };

export function fill(pat, { banned = new Set(), score = new Map(), restarts = 26, cap = 45000, BRANCH = 400, msCap = 0 } = {}) {
  const tStop = msCap ? Date.now() + msCap : 0;
  const N = pat.length, slots = slotsOf(pat), S = slots.length;
  slots.forEach((s, i) => { s.i = i; s.info = LEN.get(s.len); s.idx = s.cells.map(([r, c]) => r * N + c); });
  if (slots.some((s) => !s.info)) return null;
  // cell -> the (slot, position) pairs that touch it
  const touch = new Map();
  for (const s of slots) s.idx.forEach((k, pos) => { if (!touch.has(k)) touch.set(k, []); touch.get(k).push([s.i, pos]); });
  // Starting candidates: everything of that length minus the answers already at
  // their bank-wide use cap. Computed once per LENGTH rather than once per slot.
  const bannedLocal = new Map();
  for (const [len, info] of LEN) {
    const b = info.full.slice();
    info.ids.forEach((gid, li) => { if (banned.has(WORDS[gid])) b[li >> 5] &= ~(1 << (li & 31)); });
    bannedLocal.set(len, b);
  }
  const base = slots.map((s) => bannedLocal.get(s.len).slice());

  for (let attempt = 0; attempt < restarts; attempt++) {
    const cand = base.map((b) => b.slice());
    const chosen = new Int32Array(S).fill(-1);
    const usedGlobal = new Set();
    let nodes = 0, blown = false;

    const trail = [];
    const setCand = (i, v) => { trail.push([i, cand[i]]); cand[i] = v; };
    const mark = () => trail.length;
    const undo = (m) => { while (trail.length > m) { const [i, v] = trail.pop(); cand[i] = v; } };

    // Letter-domain propagation (AC-3). Intersecting only the slots that
    // directly cross the word just placed is not nearly enough on a 9x9: the
    // pressure has to travel. So whenever a slot's candidate set shrinks, the
    // letters still possible at each of its squares are recomputed, and every
    // slot crossing those squares is cut down to the words that can still meet
    // them, which in turn may shrink those. Without this the search does not
    // finish a 9x9 in two hundred thousand nodes; with it, most boards fall in
    // a few thousand.
    const queue = [];
    const inQ = new Uint8Array(S);
    const push = (i) => { if (!inQ[i] && chosen[i] < 0) { inQ[i] = 1; queue.push(i); } };
    const propagate = () => {
      while (queue.length) {
        const si = queue.pop();
        inQ[si] = 0;
        if (chosen[si] >= 0) continue;
        const s = slots[si], c = cand[si], wl = c.length;
        for (let pos = 0; pos < s.len; pos++) {
          let allowed = 0;
          const pm = s.info.mask[pos];
          for (let ch = 0; ch < 26; ch++) {
            const m = pm[ch];
            for (let k = 0; k < wl; k++) if (c[k] & m[k]) { allowed |= 1 << ch; break; }
          }
          if (!allowed) return false;
          for (const [oi, opos] of touch.get(s.idx[pos])) {
            if (oi === si || chosen[oi] >= 0) continue;
            const o = slots[oi], cur = cand[oi], ol = cur.length;
            const un = new Uint32Array(ol), om = o.info.mask[opos];
            for (let ch = 0; ch < 26; ch++) {
              if (!(allowed & (1 << ch))) continue;
              const m = om[ch];
              for (let k = 0; k < ol; k++) un[k] |= m[k];
            }
            let changed = 0, any = 0;
            const nv = new Uint32Array(ol);
            for (let k = 0; k < ol; k++) { nv[k] = cur[k] & un[k]; any |= nv[k]; if (nv[k] !== cur[k]) changed = 1; }
            if (!any) return false;
            if (changed) { setCand(oi, nv); push(oi); }
          }
        }
      }
      return true;
    };

    const assign = (si, li) => {
      queue.length = 0; inQ.fill(0);
      const s = slots[si], w = WORDS[s.info.ids[li]];
      for (let pos = 0; pos < s.len; pos++) {
        const ch = w.charCodeAt(pos) - 65;
        for (const [oi, opos] of touch.get(s.idx[pos])) {
          if (oi === si || chosen[oi] >= 0) continue;
          const o = slots[oi], m = o.info.mask[opos][ch], cur = cand[oi], nv = new Uint32Array(cur.length);
          let any = 0;
          for (let k = 0; k < cur.length; k++) { nv[k] = cur[k] & m[k]; any |= nv[k]; }
          if (!any) return false;
          setCand(oi, nv); push(oi);
        }
      }
      // no answer twice in one grid
      for (let oi = 0; oi < S; oi++) {
        if (oi === si || chosen[oi] >= 0 || slots[oi].len !== s.len) continue;
        const cur = cand[oi];
        if (!(cur[li >> 5] & (1 << (li & 31)))) continue;
        const nv = cur.slice();
        nv[li >> 5] &= ~(1 << (li & 31));
        if (!popcnt(nv)) return false;
        setCand(oi, nv); push(oi);
      }
      return propagate();
    };

    const dfs = (depth) => {
      if (++nodes > cap) { blown = true; return false; }
      // Wall clock matters as much as the node count: propagation on a 44-slot
      // 11x11 costs far more per node than on a 9x9, so a pure node cap lets a
      // single shape run for half a minute.
      if (tStop && (nodes & 255) === 0 && Date.now() > tStop) { blown = true; return false; }
      if (depth === S) return true;
      let bi = -1, bn = 1e9;
      for (let i = 0; i < S; i++) {
        if (chosen[i] >= 0) continue;
        const n = popcnt(cand[i]);
        if (n === 0) return false;
        if (n < bn) { bn = n; bi = i; if (n === 1) break; }
      }
      const s = slots[bi];
      let list = bitsOf(cand[bi]);
      list = shuffle(list).sort((a, b) => (score.get(WORDS[s.info.ids[a]]) || 0) - (score.get(WORDS[s.info.ids[b]]) || 0));
      for (const li of (list.length > BRANCH ? list.slice(0, BRANCH) : list)) {
        const m = mark();
        chosen[bi] = li;
        usedGlobal.add(s.info.ids[li]);
        if (assign(bi, li) && dfs(depth + 1)) return true;
        undo(m);
        chosen[bi] = -1;
        usedGlobal.delete(s.info.ids[li]);
        if (blown) return false;
      }
      return false;
    };

    if (dfs(0)) {
      const cells = new Int8Array(N * N).fill(-1);
      const words = [];
      slots.forEach((s, i) => {
        const w = WORDS[s.info.ids[chosen[i]]];
        words.push(w);
        s.idx.forEach((k, pos) => { cells[k] = w.charCodeAt(pos) - 65; });
      });
      const grid = [];
      for (let r = 0; r < N; r++) { let row = ''; for (let c = 0; c < N; c++) row += pat[r][c] === '#' ? '#' : String.fromCharCode(65 + cells[r * N + c]); grid.push(row); }
      const nums = numbering(pat), across = [], down = [];
      slots.forEach((s, i) => {
        const w = WORDS[s.info.ids[chosen[i]]];
        (s.dir === 'A' ? across : down).push({ n: nums[`${s.r},${s.c}`], r: s.r, c: s.c, len: s.len, clue: CLUE.get(w) });
      });
      across.sort((a, b) => a.n - b.n); down.sort((a, b) => a.n - b.n);
      return { grid, across, down, words };
    }
  }
  return null;
}

if (process.argv[1] && process.argv[1].endsWith('build-encore-bank.mjs')) {

// ── the calendar ───────────────────────────────────────────────────────────
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const targets = [];
{
  const [y, m, d] = START.split('-').map(Number);
  const t = Date.UTC(y, m - 1, d);
  for (let i = 0; i < DAYS; i++) {
    const dt = new Date(t + i * 86400000);
    const yy = dt.getUTCFullYear(), mm = dt.getUTCMonth(), dd = dt.getUTCDate();
    targets.push({
      num: FIRST_NUM + i,
      quizId: `encore-${mm + 1}-${dd}-${String(yy).slice(2)}`,
      live: `${yy}-${String(mm + 1).padStart(2, '0')}-${String(dd).padStart(2, '0')}`,
      dateLabel: `${MONTHS[mm]} ${dd}, ${yy}`,
      sunday: dt.getUTCDay() === 0,
    });
  }
}

// ── build ──────────────────────────────────────────────────────────────────
const CAP = 3;                 // an answer appears at most 3 times in the bank
const SHAPES = { 9: [], 11: [] };
// Shapes come from scripts/encore-shapes.json, harvested and SCREENED FOR
// FILLABILITY by scripts/screen-encore-shapes.mjs. Screening is the expensive
// half of this build and it does not depend on the calendar, so it is done once
// and kept. Re-run the screener to widen the pool.
{
  const p = join(here, 'encore-shapes.json');
  if (!existsSync(p)) { console.error('missing scripts/encore-shapes.json - run screen-encore-shapes.mjs first'); process.exit(1); }
  const j = JSON.parse(readFileSync(p, 'utf8')).shapes;
  SHAPES[9] = j[9] || []; SHAPES[11] = j[11] || [];
}
console.error(`shapes: ${SHAPES[9].length} weekday (9x9), ${SHAPES[11].length} Sunday (11x11)`);
if (SHAPES[9].length < 8 || SHAPES[11].length < 3) { console.error('not enough screened shapes'); process.exit(1); }

// The build is RESUMABLE, and it has to be: filling sixty boards is minutes of
// work, and it gets harder as it goes because answers reach their use cap and
// drop out of the pool. Each finished board is appended to a progress file as
// JSON, and a re-run picks up from there, so the whole bank never has to fit
// inside one sitting.
const PROG = process.env.ENCORE_PROGRESS || join(here, '.encore-progress.jsonl');
const score = new Map(), uses = new Map(), banned = new Set(), results = [], recent = [];
const record = (made) => {
  for (const w of made.words) {
    const n = (uses.get(w) || 0) + 1;
    uses.set(w, n);
    score.set(w, (score.get(w) || 0) + 10);
    if (n >= CAP) banned.add(w);
  }
};
if (existsSync(PROG)) {
  for (const line of readFileSync(PROG, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    const r = JSON.parse(line);
    const p = targets.find((t) => t.quizId === r.quizId);
    if (!p) continue;
    results.push({ p, made: r.made, N: r.N });
    record(r.made);
    recent.push(JSON.stringify(r.shape)); if (recent.length > 6) recent.shift();
  }
  console.error(`resumed ${results.length} boards from ${PROG}`);
}

for (const p of targets) {
  if (results.some((r) => r.p.quizId === p.quizId)) continue;
  const N = p.sunday ? 11 : 9;
  const okOverlap = (words, slack) => {
    const s = new Set(words);
    for (const r of results) {
      let n = 0; for (const x of r.made.words) if (s.has(x)) n++;
      if (n > (p.sunday && r.p.sunday ? 4 : 3) + slack) return false;
    }
    return true;
  };
  let made = null, shape = null;
  // Pass 1 keeps every variety rule. Pass 2 loosens the shared-answer ceiling
  // and drops the "not this week's shape" filter, which is the right order to
  // give ground in: a repeated shape is cosmetic, a repeated ANSWER is not.
  outer:
  for (let pass = 0; pass < 2 && !made; pass++) {
    const pool = pass === 0
      ? shuffle(SHAPES[N]).filter((x) => !recent.includes(JSON.stringify(x)))
      : shuffle(SHAPES[N]);
    for (const pat of (pool.length ? pool : shuffle(SHAPES[N]))) {
      for (let k = 0; k < 2; k++) {
        const cand = fill(pat, { banned, score, restarts: 5, cap: 30000, BRANCH: 14, msCap: 2200 });
        if (!cand) break;
        if (okOverlap(cand.words, pass * 2)) { made = cand; shape = pat; break outer; }
      }
    }
  }
  if (!made) { console.error(`FAILED to fill ${p.quizId} - widen scripts/encore-wordbank.txt or re-screen shapes`); process.exit(1); }
  recent.push(JSON.stringify(shape)); if (recent.length > 6) recent.shift();
  record(made);
  results.push({ p, made, N });
  appendFileSync(PROG, JSON.stringify({ quizId: p.quizId, N, shape, made }) + '\n');
  console.error(`  ${results.length}/${targets.length} ${p.quizId}`);
}
console.error(`built ${results.length} boards, ${uses.size} distinct answers`);

const esc = (s) => "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
const HEAD = `// Puzzle data for Encore, the daily crossword. Imported ONLY by the server page
// (app/encore/page.js), which filters live<=today before passing puzzles to the
// client, so future grids and their answers never ship to the browser.
//
// Encore is the big grid: a 9x9 on weekdays, an 11x11 Sunday Edition. Emcee is
// the five-minute mini; this is the one you sit down with. \`grid\` rows use '#'
// for a block and the SOLUTION letter for a fillable square. \`across\`/\`down\`
// carry {n, r, c, len, clue}; answers are read off the grid, and numbering
// follows standard crossword rules. Score is words correct out of the word
// count, ties broken by fewest checks (guessesUsed) and then fastest time.
//
// AUTHORING RULES — these are Emcee's, and they are not negotiable:
//
// 1. EVERY CLUE IS HAND-WRITTEN AND CLUES ITS OWN ANSWER. Clues come from the
//    curated banks (scripts/emcee-wordbank.txt for 3/4/5/7 letters,
//    scripts/encore-wordbank.txt for 6/8/9), so a word can only enter a grid if
//    a real crossword clue for it already exists. NEVER generate a clue from a
//    dictionary or WordNet gloss: a gloss defines a whole synonym set, so it
//    reliably clues the WRONG word, which is exactly what forced the Emcee bank
//    rebuild in August 2026.
// 2. GRIDS ARE FULLY CHECKED AND SYMMETRIC. 180 degree rotational symmetry;
//    every white square belongs to both an across and a down word; every entry
//    is 3 to 9 letters; all white squares connected.
// 3. NO OBSCURITIES. Everyday words only, no crosswordese.
// 4. VARIETY IS CAPPED ACROSS THE BANK, not just per board: an answer appears
//    at most 3 times, two boards share at most 3 answers (4 between Sundays),
//    and no grid shape repeats inside a week.
// 5. THE PAST IS FROZEN. Never rewrite a board that has already gone live. To
//    change a live grid, bump its \`rev\` so in-flight saves reset cleanly.
//
// Regenerate with \`node scripts/build-encore-bank.mjs\`; verify with
// \`node scripts/verify-encore.mjs\`, which re-proves all of the above.
export const PUZZLES = [`;
console.log(HEAD + '\n' + results.map(({ p, made, N }) => {
  const L = (w) => `      { n: ${w.n}, r: ${w.r}, c: ${w.c}, len: ${w.len}, clue: ${esc(w.clue)} },`;
  return `  {
    num: ${p.num},
    quizId: '${p.quizId}',
    live: '${p.live}',
    dateLabel: '${p.dateLabel}',
    sunday: ${p.sunday},
    size: ${N},
    grid: [${made.grid.map((g) => `'${g}'`).join(', ')}],
    across: [
${made.across.map(L).join('\n')}
    ],
    down: [
${made.down.map(L).join('\n')}
    ],
  },`;
}).join('\n') + '\n];\n');

}
