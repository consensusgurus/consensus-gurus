// Shared Cages engine: the killer-sudoku solvers the generator and the verifier
// BOTH run. Lifting them here rather than retyping them in scripts/verify-cage.mjs
// is deliberate — a verifier that carries its own copy of the solver certifies a
// different game the moment one copy drifts (see the Mate tree-walk miss).
//
// Killer sudoku is ordinary sudoku plus cages: a partition of the 81 cells into
// connected groups, each printed with the sum of its digits, and no digit may
// repeat inside a cage. Boards carry NO printed digits at all — the sums are the
// only clues — so the cage partition alone has to force a single solution.

export const bx = (i) => Math.floor(Math.floor(i / 9) / 3) * 3 + Math.floor((i % 9) / 3);

// Seeded RNG, so `node scripts/gen-cage.mjs` reproduces its bank byte for byte.
export function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const shuffle = (arr, rnd) => {
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr;
};

export const HOUSES = (() => {
  const h = [];
  for (let r = 0; r < 9; r++) h.push(Array.from({ length: 9 }, (_, k) => r * 9 + k));
  for (let c = 0; c < 9; c++) h.push(Array.from({ length: 9 }, (_, k) => k * 9 + c));
  for (let b = 0; b < 9; b++) {
    const br = Math.floor(b / 3) * 3, bc = (b % 3) * 3, box = [];
    for (let a = 0; a < 3; a++) for (let d = 0; d < 3; d++) box.push((br + a) * 9 + bc + d);
    h.push(box);
  }
  return h;
})();

const PEERS = Array.from({ length: 81 }, (_, i) => {
  const r = Math.floor(i / 9), c = i % 9, b = bx(i), s = new Set();
  for (let k = 0; k < 9; k++) { s.add(r * 9 + k); s.add(k * 9 + c); }
  const br = Math.floor(b / 3) * 3, bc = (b % 3) * 3;
  for (let a = 0; a < 3; a++) for (let d = 0; d < 3; d++) s.add((br + a) * 9 + bc + d);
  s.delete(i);
  return [...s];
});

export function fullSolution(rnd) {
  const g = new Array(81).fill(0);
  const ok = (i, v) => {
    const r = Math.floor(i / 9), c = i % 9, b = bx(i);
    for (let k = 0; k < 9; k++) { if (g[r * 9 + k] === v || g[k * 9 + c] === v) return false; }
    const br = Math.floor(b / 3) * 3, bc = (b % 3) * 3;
    for (let a = 0; a < 3; a++) for (let d = 0; d < 3; d++) if (g[(br + a) * 9 + bc + d] === v) return false;
    return true;
  };
  const go = (i) => {
    if (i === 81) return true;
    for (const v of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], rnd)) if (ok(i, v)) { g[i] = v; if (go(i + 1)) return true; g[i] = 0; }
    return false;
  };
  go(0);
  return g;
}

// Grow a connected partition of the grid into cages of 2..maxSize cells, never
// repeating a digit inside a cage. `targetCages` steers the average size: fewer,
// bigger cages is a harder board, and that is the knob the weekday ramp turns.
export function makeCages(sol, maxSize, targetCages, rnd) {
  const owner = new Array(81).fill(-1);
  const cages = [];
  const avg = 81 / targetCages;
  for (const start of shuffle([...Array(81).keys()], rnd)) {
    if (owner[start] !== -1) continue;
    // size drawn around the average needed to land near targetCages
    let want = Math.round(avg + (rnd() - 0.5) * 1.6);
    want = Math.max(2, Math.min(maxSize, want));
    const cells = [start]; owner[start] = cages.length;
    const digits = new Set([sol[start]]);
    while (cells.length < want) {
      const cands = [];
      for (const c of cells) {
        const r = Math.floor(c / 9), col = c % 9;
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nr = r + dr, nc = col + dc;
          if (nr < 0 || nr > 8 || nc < 0 || nc > 8) continue;
          const n = nr * 9 + nc;
          if (owner[n] !== -1 || digits.has(sol[n])) continue;
          cands.push(n);
        }
      }
      if (!cands.length) break;
      const pick = cands[Math.floor(rnd() * cands.length)];
      cells.push(pick); owner[pick] = cages.length; digits.add(sol[pick]);
    }
    cages.push(cells);
  }
  // A one-cell cage would print its own digit, which is a given by another name.
  // Absorb every singleton into a legal neighbour, and reject the layout if one
  // cannot be placed rather than shipping a board with a free answer on it.
  for (let ci = 0; ci < cages.length; ci++) {
    if (cages[ci].length !== 1) continue;
    const c = cages[ci][0], r = Math.floor(c / 9), col = c % 9;
    let moved = false;
    for (const [dr, dc] of shuffle([[1, 0], [-1, 0], [0, 1], [0, -1]], rnd)) {
      const nr = r + dr, nc = col + dc;
      if (nr < 0 || nr > 8 || nc < 0 || nc > 8) continue;
      const t = owner[nr * 9 + nc], tc = cages[t];
      if (tc.length >= maxSize || tc.some((x) => sol[x] === sol[c])) continue;
      tc.push(c); owner[c] = t; cages[ci] = []; moved = true; break;
    }
    if (!moved) return null;
  }
  const kept = cages.filter((c) => c.length);
  const map = new Array(81).fill(-1);
  kept.forEach((cells, i) => cells.forEach((c) => { map[c] = i; }));
  if (map.some((x) => x < 0)) return null;
  return { cells: kept, sums: kept.map((cs) => cs.reduce((a, c) => a + sol[c], 0)), owner: map };
}

// Exhaustive solver. Counts solutions up to `cap`; the generator and the
// verifier both call it with cap 2, so "returns 1" IS the uniqueness proof.
//
// It fills the grid CAGE BY CAGE rather than in reading order. That is worth a
// paragraph because it is the difference between a bank that verifies in seconds
// and one that does not: on a board with no printed digits the cage sum is the
// only early constraint there is, and in reading order a cage's last cell can sit
// thirty cells after its first, so the sum cannot prune until the search is
// already deep. Walking a cage to completion tests the sum immediately. Measured
// on a 29-cage board, reading order took 1,345ms and this takes single digits.
export function countSolutions(cageCells, cageSums, owner, cap = 2) {
  // Cages ordered by their first cell, so the walk also stays spatially local
  // and the row/column masks fill in densely rather than in scattered stripes.
  const order = cageCells.map((cells, k) => k).sort(
    (a, b) => Math.min(...cageCells[a]) - Math.min(...cageCells[b]));
  const seq = [];
  for (const k of order) for (const c of [...cageCells[k]].sort((a, b) => a - b)) seq.push(c);

  const g = new Array(81).fill(0);
  let found = 0;
  const rowM = new Array(9).fill(0), colM = new Array(9).fill(0), boxM = new Array(9).fill(0);
  const cSum = new Array(cageCells.length).fill(0);
  const cLeft = cageCells.map((c) => c.length);
  const cMask = new Array(cageCells.length).fill(0);
  const minRest = (n) => (n * (n + 1)) / 2;
  const maxRest = (n) => (n * (19 - n)) / 2;
  const go = (p) => {
    if (found >= cap) return;
    if (p === 81) { found++; return; }
    const i = seq[p];
    const r = Math.floor(i / 9), c = i % 9, b = bx(i), k = owner[i];
    for (let v = 1; v <= 9; v++) {
      const bit = 1 << v;
      if ((rowM[r] & bit) || (colM[c] & bit) || (boxM[b] & bit) || (cMask[k] & bit)) continue;
      const ns = cSum[k] + v, nl = cLeft[k] - 1;
      if (ns + minRest(nl) > cageSums[k] || ns + maxRest(nl) < cageSums[k]) continue;
      g[i] = v; rowM[r] |= bit; colM[c] |= bit; boxM[b] |= bit; cSum[k] = ns; cLeft[k] = nl; cMask[k] |= bit;
      go(p + 1);
      g[i] = 0; rowM[r] &= ~bit; colM[c] &= ~bit; boxM[b] &= ~bit; cSum[k] -= v; cLeft[k]++; cMask[k] &= ~bit;
      if (found >= cap) return;
    }
  };
  go(0);
  return found;
}

const COMBO_CACHE = new Map();
function combos(n, sum, allowed) {
  const ck = (n << 24) | (sum << 12) | allowed;
  const hit = COMBO_CACHE.get(ck);
  if (hit) return hit;
  const out = [];
  const pick = (start, left, rem, cur) => {
    if (left === 0) { if (rem === 0) out.push(cur.slice()); return; }
    for (let v = start; v <= 9; v++) {
      if (!(allowed & (1 << v))) continue;
      if (v * left > rem) break;
      pick(v + 1, left - 1, rem - v, cur.concat(v));
    }
  };
  pick(1, n, sum, []);
  COMBO_CACHE.set(ck, out);
  return out;
}

// ── the no-guessing proof ────────────────────────────────────────────────────
// Uniqueness alone does not make a board humanly solvable, so every board must
// ALSO fall to this solver, which only ever applies moves a person can justify
// and NEVER guesses. If it stalls, the board is rejected.
//
//   level 1  cage combinations, naked and hidden singles across rows, columns,
//            boxes and cages, and the 45 rule where exactly one cell is left
//            over. This is the toolkit of a player who has just learned killer.
//   level 2  adds locked candidates, naked and hidden pairs and triples,
//            per-cell combination pruning, and the 45 rule generalised to two
//            leftover cells and to innies AND outies over stacked houses.
//
// The 45 rule is the technique that makes killer killer: every house holds 1-9,
// so it totals 45, and the cages sitting wholly inside it therefore pin whatever
// is left over. `REGION_SETS` below is the list of house groupings it runs on.
const REGION_SETS = (() => {
  const sets = [];
  const row = (r) => Array.from({ length: 9 }, (_, k) => r * 9 + k);
  const col = (c) => Array.from({ length: 9 }, (_, k) => k * 9 + c);
  const box = (b) => { const br = Math.floor(b / 3) * 3, bc = (b % 3) * 3, o = [];
    for (let a = 0; a < 3; a++) for (let d = 0; d < 3; d++) o.push((br + a) * 9 + bc + d); return o; };
  for (let r = 0; r < 9; r++) sets.push(row(r));
  for (let c = 0; c < 9; c++) sets.push(col(c));
  for (let b = 0; b < 9; b++) sets.push(box(b));
  // stacked pairs and triples inside one band or stack, where the 45 rule
  // generalises to 90 and 135 and the leftover set stays small
  for (const band of [0, 3, 6]) {
    sets.push(row(band).concat(row(band + 1)));
    sets.push(row(band + 1).concat(row(band + 2)));
    sets.push(row(band).concat(row(band + 2)));
    sets.push(row(band).concat(row(band + 1), row(band + 2)));
    sets.push(col(band).concat(col(band + 1)));
    sets.push(col(band + 1).concat(col(band + 2)));
    sets.push(col(band).concat(col(band + 2)));
    sets.push(col(band).concat(col(band + 1), col(band + 2)));
  }
  return sets;
})();

const bitsOf = (m) => { const o = []; for (let v = 1; v <= 9; v++) if (m & (1 << v)) o.push(v); return o; };
const popcount = (m) => { let n = 0; while (m) { m &= m - 1; n++; } return n; };

export function logicSolve(cageCells, cageSums, owner, level, givens = null) {
  const cand = new Array(81).fill(0x3FE);
  const val = new Array(81).fill(0);
  let dead = false;
  const assign = (i, v) => {
    if (!(cand[i] & (1 << v))) { dead = true; return; }
    val[i] = v; cand[i] = 1 << v;
    for (const p of PEERS[i]) cand[p] &= ~(1 << v);
    for (const p of cageCells[owner[i]]) if (p !== i) cand[p] &= ~(1 << v);
  };
  // A CAGE IS NOT A HOUSE, and conflating the two is the easy way to write a
  // solver that "proves" every board contradictory. A house holds all nine
  // digits, so a digit missing from it is a contradiction and a digit with one
  // remaining spot is a hidden single. A cage holds a SUBSET of the digits, so
  // neither inference is available: the only thing a cage guarantees is that no
  // digit repeats inside it. So cages join the NAKED-subset groups (which need
  // only uniqueness) and stay out of every hidden/locked deduction, except via
  // `required` below, the digits a cage's own arithmetic forces it to contain.
  const nakedGroups = HOUSES.concat(cageCells);
  const required = new Array(cageCells.length).fill(0);
  if (givens) for (let i = 0; i < 81; i++) if (givens[i]) assign(i, givens[i]);
  if (dead) return null;

  // sum of the cells in `cells`, given their candidate masks, restricted so the
  // whole set totals `target`; returns the tightened masks or null
  const sumPrune = (cells, target) => {
    if (!cells.length) return target === 0 ? [] : null;
    const masks = cells.map((c) => cand[c]);
    const allow = cells.map(() => 0);
    // a value is credited to a cell only on a COMPLETED assignment of the whole
    // set, so the pruning stays sound rather than merely plausible
    const ok = (() => {
      const usedRow = new Array(cells.length).fill(0);
      const rec = (idx, rem) => {
        if (idx === cells.length) return rem === 0;
        let good = false;
        for (const v of bitsOf(masks[idx])) {
          if (v > rem) break;
          let clash = false;
          for (let j = 0; j < idx; j++) if (usedRow[j] === v && PEERS[cells[idx]].includes(cells[j])) { clash = true; break; }
          if (clash) continue;
          usedRow[idx] = v;
          if (rec(idx + 1, rem - v)) { allow[idx] |= 1 << v; good = true; }
          usedRow[idx] = 0;
        }
        return good;
      };
      return rec(0, target);
    })();
    return ok ? allow : null;
  };

  for (let guard = 0; guard < 600; guard++) {
    if (dead) return null;
    let moved = false;

    // ── cage combinations ────────────────────────────────────────────────────
    for (let k = 0; k < cageCells.length; k++) {
      const cg = cageCells[k];
      const open = cg.filter((c) => !val[c]);
      if (!open.length) continue;
      let allowed = 0x3FE, used = 0;
      for (const c of cg) if (val[c]) { allowed &= ~(1 << val[c]); used += val[c]; }
      const cs = combos(open.length, cageSums[k] - used, allowed);
      if (!cs.length) return null;
      let union = 0, feasible = 0, reqMask = -1;
      const perCell = open.map(() => 0);
      for (const cb of cs) {
        // can this combination be dealt to the open cells?
        const deal = (idx, mask, fixJ, fixV) => {
          if (idx === cb.length) return true;
          for (let j = 0; j < open.length; j++) {
            if (mask & (1 << j)) continue;
            if (!(cand[open[j]] & (1 << cb[idx]))) continue;
            if (fixJ >= 0 && j === fixJ && cb[idx] !== fixV) continue;
            if (deal(idx + 1, mask | (1 << j), fixJ, fixV)) return true;
          }
          return false;
        };
        if (!deal(0, 0, -1, 0)) continue;
        feasible++;
        let cbMask = 0;
        for (const v of cb) { union |= 1 << v; cbMask |= 1 << v; }
        reqMask = reqMask === -1 ? cbMask : (reqMask & cbMask);
        if (level >= 2) {
          for (let j = 0; j < open.length; j++) {
            for (const v of new Set(cb)) {
              if (!(cand[open[j]] & (1 << v)) || (perCell[j] & (1 << v))) continue;
              if (deal(0, 0, j, v)) perCell[j] |= 1 << v;
            }
          }
        }
      }
      if (!feasible) return null;
      required[k] = reqMask === -1 ? 0 : reqMask;
      for (let j = 0; j < open.length; j++) {
        const lim = level >= 2 ? (union & perCell[j]) : union;
        const nc = cand[open[j]] & lim;
        if (nc !== cand[open[j]]) { cand[open[j]] = nc; moved = true; }
        if (!nc) return null;
      }
    }

    // ── the 45 rule: innies and outies ───────────────────────────────────────
    const innieCap = level >= 2 ? 2 : 1;
    for (const R of REGION_SETS) {
      const set = new Set(R);
      const total = 45 * (R.length / 9);
      const ks = new Set(R.map((c) => owner[c]));
      let inSum = 0, allSum = 0;
      const covered = new Set(); const outies = [];
      for (const k of ks) {
        allSum += cageSums[k];
        if (cageCells[k].every((c) => set.has(c))) { inSum += cageSums[k]; cageCells[k].forEach((c) => covered.add(c)); }
        else for (const c of cageCells[k]) if (!set.has(c)) outies.push(c);
      }
      const innies = R.filter((c) => !covered.has(c));
      for (const [cells, target] of [[innies, total - inSum], [outies, allSum - total]]) {
        const open = cells.filter((c) => !val[c]);
        if (!open.length || open.length > innieCap) continue;
        const fixed = cells.filter((c) => val[c]).reduce((a, c) => a + val[c], 0);
        const rem = target - fixed;
        if (open.length === 1) {
          if (rem < 1 || rem > 9) return null;
          if (!val[open[0]]) {
            if (!(cand[open[0]] & (1 << rem))) return null;
            if (cand[open[0]] !== (1 << rem)) { assign(open[0], rem); moved = true; }
          }
        } else {
          const allow = sumPrune(open, rem);
          if (!allow) return null;
          for (let j = 0; j < open.length; j++) {
            const nc = cand[open[j]] & allow[j];
            if (nc !== cand[open[j]]) { cand[open[j]] = nc; moved = true; }
            if (!nc) return null;
          }
        }
      }
    }

    // ── locked candidates, naked and hidden subsets ──────────────────────────
    if (level >= 2) {
      // pointing / claiming between a box and a line, and between a cage and a house
      const lockSrc = HOUSES.map((h) => [h, 0x3FE])
        .concat(cageCells.map((cg, k) => [cg, required[k]]));
      for (const [src, mustHold] of lockSrc) {
        for (let v = 1; v <= 9; v++) {
          if (!(mustHold & (1 << v))) continue;
          if (src.some((c) => val[c] === v)) continue;
          const spots = src.filter((c) => !val[c] && (cand[c] & (1 << v)));
          if (spots.length < 2 || spots.length > 3) continue;
          for (const h of HOUSES) {
            if (h === src) continue;
            if (!spots.every((c) => h.includes(c))) continue;
            for (const c of h) {
              if (spots.includes(c) || val[c]) continue;
              if (cand[c] & (1 << v)) { cand[c] &= ~(1 << v); moved = true; }
            }
          }
        }
      }
      for (const h of nakedGroups) {
        const open = h.filter((c) => !val[c]);
        // naked pairs and triples
        for (let a = 0; a < open.length; a++) for (let b = a + 1; b < open.length; b++) {
          const m2 = cand[open[a]] | cand[open[b]];
          if (popcount(m2) === 2) {
            for (const c of open) if (c !== open[a] && c !== open[b] && (cand[c] & m2)) { cand[c] &= ~m2; moved = true; }
          }
          for (let d = b + 1; d < open.length; d++) {
            const m3 = m2 | cand[open[d]];
            if (popcount(m3) !== 3) continue;
            for (const c of open) if (c !== open[a] && c !== open[b] && c !== open[d] && (cand[c] & m3)) { cand[c] &= ~m3; moved = true; }
          }
        }
      }
      for (const h of HOUSES) {
        const open = h.filter((c) => !val[c]);
        // hidden pairs — a house holds every digit, so this is sound here only
        for (let v1 = 1; v1 <= 9; v1++) for (let v2 = v1 + 1; v2 <= 9; v2++) {
          if (h.some((c) => val[c] === v1 || val[c] === v2)) continue;
          const s1 = open.filter((c) => cand[c] & (1 << v1));
          const s2 = open.filter((c) => cand[c] & (1 << v2));
          if (s1.length !== 2 || s2.length !== 2) continue;
          if (s1[0] !== s2[0] || s1[1] !== s2[1]) continue;
          const keep = (1 << v1) | (1 << v2);
          for (const c of s1) if (cand[c] !== (cand[c] & keep)) { cand[c] &= keep; moved = true; }
        }
      }
    }

    // ── singles ──────────────────────────────────────────────────────────────
    for (let i = 0; i < 81; i++) {
      if (val[i]) continue;
      const m = cand[i];
      if (m === 0) return null;
      if ((m & (m - 1)) === 0) { assign(i, 31 - Math.clz32(m)); moved = true; }
    }
    const hiddenSrc = HOUSES.map((h) => [h, 0x3FE])
      .concat(cageCells.map((cg, k) => [cg, required[k]]));
    for (const [gset, mustHold] of hiddenSrc) {
      for (let v = 1; v <= 9; v++) {
        if (!(mustHold & (1 << v))) continue;
        if (gset.some((c) => val[c] === v)) continue;
        const spots = gset.filter((c) => !val[c] && (cand[c] & (1 << v)));
        if (spots.length === 1) { assign(spots[0], v); moved = true; }
        else if (spots.length === 0) return null;
      }
    }

    if (dead) return null;
    if (val.every((x) => x)) return val;
    if (!moved) return { stalled: val.filter((x) => x).length };
  }
  return null;
}
