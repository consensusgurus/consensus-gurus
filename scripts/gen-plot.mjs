// Generator for Plot, the daily rectangle partition (Shikaku).
//
// Boards are CORRECT BY CONSTRUCTION: the grid is tiled with rectangles first,
// then each rectangle writes its own area into one of its own cells. A board
// therefore cannot be malformed; what has to be PROVED is that the clues admit
// exactly one tiling, and that a solver never has to guess to find it.
//
// Usage: node gen-plot.mjs <days> <startISO>
import fs from 'fs';

const DAYS = Number(process.argv[2] || 60);
const START = process.argv[3] || '2026-08-14';

// deterministic RNG so a rerun reproduces the bank
let seed = 20260814;
function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
function ri(n) { return Math.floor(rnd() * n); }

const MAXAREA = 9;

function partition(n, maxOnes) {
  const g = Array.from({ length: n }, () => Array(n).fill(-1));
  const rects = [];
  let ones = 0;
  for (;;) {
    let fr = -1, fc = -1;
    for (let r = 0; r < n && fr < 0; r++) for (let c = 0; c < n; c++) if (g[r][c] < 0) { fr = r; fc = c; break; }
    if (fr < 0) break;
    let wm = 0; while (fc + wm < n && g[fr][fc + wm] < 0) wm++;
    let w = 1 + ri(Math.min(wm, 4));
    let hm = 0;
    for (;;) {
      if (fr + hm >= n) break;
      let ok = true;
      for (let c = fc; c < fc + w; c++) if (g[fr + hm][c] >= 0) { ok = false; break; }
      if (!ok) break;
      hm++;
    }
    let h = 1 + ri(Math.min(hm, 4));
    while (w * h > MAXAREA) h--;
    if (w * h === 1) {
      if (ones >= maxOnes) {
        if (wm >= 2 && w === 1) w = 2;
        else if (hm >= 2 && h === 1) h = 2;
      }
      if (w * h === 1) ones++;
    }
    const id = rects.length;
    for (let r = fr; r < fr + h; r++) for (let c = fc; c < fc + w; c++) g[r][c] = id;
    rects.push({ r: fr, c: fc, w, h });
  }
  return { rects, ones };
}

function anchorSet(rects) {
  return rects.map((R) => ({ r: R.r + ri(R.h), c: R.c + ri(R.w), v: R.w * R.h }));
}

function candidates(A, aset, n) {
  const out = [];
  for (let w = 1; w <= A.v; w++) {
    if (A.v % w) continue;
    const h = A.v / w;
    for (let r0 = A.r - h + 1; r0 <= A.r; r0++) {
      for (let c0 = A.c - w + 1; c0 <= A.c; c0++) {
        if (r0 < 0 || c0 < 0 || r0 + h > n || c0 + w > n) continue;
        let ok = true;
        for (const b of aset) {
          if (b === A) continue;
          if (b.r >= r0 && b.r < r0 + h && b.c >= c0 && b.c < c0 + w) { ok = false; break; }
        }
        if (ok) out.push({ r: r0, c: c0, w, h });
      }
    }
  }
  return out;
}

// exact solution count, capped
function countSolutions(aset, n, cap) {
  const lists = aset.map((A) => candidates(A, aset, n));
  if (lists.some((L) => !L.length)) return 0;
  const used = new Uint8Array(n * n);
  const done = new Uint8Array(aset.length);
  let found = 0;
  const fits = (R) => {
    for (let r = R.r; r < R.r + R.h; r++) for (let c = R.c; c < R.c + R.w; c++) if (used[r * n + c]) return false;
    return true;
  };
  const mark = (R, v) => {
    for (let r = R.r; r < R.r + R.h; r++) for (let c = R.c; c < R.c + R.w; c++) used[r * n + c] = v;
  };
  const go = (depth) => {
    if (found >= cap) return;
    if (depth === aset.length) { found++; return; }
    let best = -1, bl = null;
    for (let k = 0; k < aset.length; k++) {
      if (done[k]) continue;
      const f = lists[k].filter(fits);
      if (!f.length) return;
      if (best < 0 || f.length < bl.length) { best = k; bl = f; }
      if (f.length === 1) break;
    }
    done[best] = 1;
    for (const R of bl) { mark(R, 1); go(depth + 1); mark(R, 0); if (found >= cap) break; }
    done[best] = 0;
  };
  go(0);
  return found;
}

// Can it be solved with NO guessing? Repeatedly place any clue that has exactly
// one placement left. If that ever stalls with clues unplaced, the board needs
// a branch and is rejected.
function noGuessSolve(aset, n) {
  const lists = aset.map((A) => candidates(A, aset, n));
  const used = new Uint8Array(n * n);
  const done = new Uint8Array(aset.length);
  const fits = (R) => {
    for (let r = R.r; r < R.r + R.h; r++) for (let c = R.c; c < R.c + R.w; c++) if (used[r * n + c]) return false;
    return true;
  };
  let placed = 0, rounds = 0, deep = 0;
  for (;;) {
    let moved = false;
    for (let k = 0; k < aset.length; k++) {
      if (done[k]) continue;
      const f = lists[k].filter(fits);
      if (f.length === 0) return { ok: false };
      if (f.length === 1) {
        const R = f[0];
        for (let r = R.r; r < R.r + R.h; r++) for (let c = R.c; c < R.c + R.w; c++) used[r * n + c] = 1;
        done[k] = 1; placed++; moved = true;
      }
    }
    // a cell that only ONE remaining clue can still reach is also forced
    if (!moved) {
      for (let cell = 0; cell < n * n && !moved; cell++) {
        if (used[cell]) continue;
        const cr = Math.floor(cell / n), cc = cell % n;
        let owner = -1, only = null, count = 0;
        for (let k = 0; k < aset.length && count < 2; k++) {
          if (done[k]) continue;
          const f = lists[k].filter((R) => fits(R) && cr >= R.r && cr < R.r + R.h && cc >= R.c && cc < R.c + R.w);
          if (f.length) { count++; owner = k; if (f.length === 1) only = f[0]; else only = null; }
        }
        if (count === 1 && only) {
          for (let r = only.r; r < only.r + only.h; r++) for (let c = only.c; c < only.c + only.w; c++) used[r * n + c] = 1;
          done[owner] = 1; placed++; moved = true; deep++;
        }
      }
    }
    if (!moved) break;
    rounds++;
  }
  return { ok: placed === aset.length, rounds, deep };
}

function openness(aset, n) {
  let open = 0;
  for (const A of aset) if (candidates(A, aset, n).length > 1) open++;
  return open / aset.length;
}

// Weekday difficulty ramp, Monday easiest to Saturday hardest, with the Sunday
// Edition hardest of all on a bigger board. The dial is `open`: the share of
// clues that still have more than one placement before any deduction. A board is
// chosen by gathering valid candidates and keeping the one nearest the day's
// target, so the ramp is real rather than whatever the generator happened to
// produce first.
const TARGET = [0.87, 0.56, 0.62, 0.68, 0.74, 0.80, 0.85];

function build(n, target, maxOnes, budgetMs) {
  const t0 = Date.now();
  let best = null, tried = 0, valid = 0;
  for (let p = 0; p < 500; p++) {
    const { rects, ones } = partition(n, maxOnes);
    if (ones > maxOnes) continue;
    if (rects.length < n * n / 6) continue;
    for (let a = 0; a < 14; a++) {
      tried++;
      const aset = anchorSet(rects);
      if (countSolutions(aset, n, 2) !== 1) continue;
      const ng = noGuessSolve(aset, n);
      if (!ng.ok) continue;
      valid++;
      const op = openness(aset, n);
      const d = Math.abs(op - target);
      if (!best || d < best.d) best = { rects, aset, open: op, ones, deep: ng.deep, d };
      if (d < 0.02) return { ...best, tried, valid };
    }
    if (Date.now() - t0 > budgetMs && best) break;
  }
  return best ? { ...best, tried, valid } : null;
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
function addDays(iso, k) {
  const d = new Date(iso + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + k);
  return d.toISOString().slice(0, 10);
}
function dow(iso) { return new Date(iso + 'T12:00:00Z').getUTCDay(); }
function label(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}
function qid(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `plot-${m}-${d}-${String(y).slice(2)}`;
}

const out = [];
const seen = new Set();
for (let i = 0; i < DAYS; i++) {
  const live = addDays(START, i);
  const wd = dow(live);
  const sunday = wd === 0;
  const n = sunday ? 12 : 10;
  const target = TARGET[wd];
  const maxOnes = sunday ? 3 : 2;
  let got = null;
  for (let t = 0; t < 6; t++) {
    const b = build(n, target, maxOnes, 2500);
    if (!b) continue;
    const key = b.aset.map((a) => `${a.r},${a.c},${a.v}`).sort().join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    got = b;
    break;
  }
  if (!got) { console.error('FAILED to build', live); process.exit(1); }
  const order = got.aset.map((a, k) => ({ a, R: got.rects[k] }));
  out.push({
    num: i + 1,
    quizId: qid(live),
    live,
    dateLabel: label(live),
    sunday,
    n,
    open: Number(got.open.toFixed(3)),
    deep: got.deep,
    clues: order.map(({ a }) => [a.r, a.c, a.v]),
    sol: order.map(({ R }) => [R.r, R.c, R.w, R.h]),
  });
  process.stderr.write(`${live} n=${n} plots=${got.aset.length} open=${got.open.toFixed(2)} deep=${got.deep}\n`);
}

const head = `// Puzzle data for Plot, the daily rectangle partition. Imported ONLY by the
// server page (app/plot/page.js), which filters live<=today before handing the
// bank to the client, so future boards never ship to the browser.
//
// GENERATED by scripts/gen-plot.mjs, proved by scripts/verify-plot.mjs. Do not
// hand-edit: every field is derived from a real tiling.
//
// AUTHORING RULES
//
//   n        board size. Weekdays 10x10, the Sunday Edition 12x12.
//   clues    [row, col, value] per plot. The value is the plot's AREA, and it is
//            printed in one of that plot's own cells, so a board is correct by
//            construction and only its uniqueness has to be proved.
//   sol      [row, col, width, height] per plot, index-aligned with clues.
//   open     the share of clues with more than one placement open to them before
//            any deduction. This is the difficulty dial and it ramps across the
//            week, Monday easiest to Saturday hardest.
//   deep     how many plots were settled by the harder deduction, that a cell can
//            only still be reached by one remaining clue, rather than by a clue
//            simply running out of room. Both are re-derived by the verifier.
//   sunday   true on the 12x12 Edition only, and the client badges off it.
//
// Every board is verified to (a) tile the grid exactly, (b) admit EXACTLY ONE
// tiling, and (c) be reachable with no guessing, by a solver that only ever
// places a plot when one placement remains, so a careful player never gambles.
// At most two 1x1 plots on a weekday, three on a Sunday.
export const PUZZLES = [
`;
const body = out.map((p) => '  ' + JSON.stringify(p)).join(',\n');
fs.writeFileSync('/tmp/plot/out/puzzles.js', head + body + '\n];\n');
console.error(`\nwrote ${out.length} boards`);
