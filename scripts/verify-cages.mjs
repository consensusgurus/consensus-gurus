// Verify the Cages bank (the daily killer sudoku).
//
//   node scripts/verify-cages.mjs
//
// THIS FILE RECOMPUTES, IT DOES NOT TRUST. Per the daily puzzle authoring
// standard in CLAUDE.md, a checker that reads a stored field and prints it has
// verified nothing. The solvers below are therefore written out AGAIN here
// rather than imported from scripts/cages-core.mjs: sharing them would mean a
// bug in the generator's solver certifies its own output as correct, which is
// not a hypothetical. The generator's first logical solver treated a cage as a
// house, called every legal board contradictory, and a shared copy would have
// agreed with it. Every claim the bank makes is re-derived from `cage` and
// `sums` alone, and `sol` is used only to CHECK answers, never to reach them.
//
// The counting solver here is also a different algorithm from the generator's on
// purpose: this one propagates candidates and branches on the most constrained
// cell, where the generator walks cage by cage. Two searches that agree on the
// count are worth more than one search run twice.
//
// WHAT IS CHECKED
//   Shape      nums sequential from 1, dates contiguous and ISO, dateLabel
//              agreeing with `live`, quizId of the form cages-M-D-YY derived
//              from `live`, no duplicate ids.
//   No givens  a killer board prints no digits, so a board carrying any is
//              rejected, and so is a one-cell cage, which is a printed digit
//              wearing a total.
//   Cages      the partition covers all 81 cells exactly once, every cage holds
//              2 to 5 cells and is connected through shared edges, no digit
//              repeats inside a cage, and every printed sum equals the sum of
//              its own cells in the solution.
//   Solution   `sol` is a legal filling: every row, column and 3x3 box holds
//              1-9 exactly once.
//   Uniqueness EXACTLY one solution, from an independent counting solver. On a
//              board with no printed digits the cage partition is the ONLY thing
//              forcing the answer, so this is the whole of the answer key.
//   No guessing the board also falls to a logical solver that only applies moves
//              a person can justify, AND every move that solver makes is checked
//              against the known solution, so an unsound rule cannot certify
//              itself. Uniqueness alone does not make a board humanly solvable.
//   Level      the stored `level` is honest: the board really does fall to that
//              toolkit, and a board stored as 2 really does NOT fall to 1.
//   Ramp       cages, largest cage and level all match the documented weekday
//              table. A floor is not a target, so the day pins the value.
//   Sunday     the flag lands on real Sundays and nowhere else, every Sunday
//              board has fewer cages than every weekday board, and Sunday is the
//              only day that prints a five-cell cage. A Sunday Edition that does
//              not actually scale is not one.
//   Variety    no cage layout and no solution grid repeats anywhere in the bank.
//              Per-board legality passes happily on a bank that ships the same
//              board ninety times.
import { PUZZLES } from '../app/cages/puzzles.js';

const IDX = [...Array(81).keys()];
const rowOf = (i) => (i / 9) | 0;
const colOf = (i) => i % 9;
const boxOf = (i) => ((rowOf(i) / 3) | 0) * 3 + ((colOf(i) / 3) | 0);
const flat = (g) => g.flat();
const nbrs = (i) => {
  const r = rowOf(i), c = colOf(i), o = [];
  if (r > 0) o.push(i - 9);
  if (r < 8) o.push(i + 9);
  if (c > 0) o.push(i - 1);
  if (c < 8) o.push(i + 1);
  return o;
};
const HOUSES = (() => {
  const h = [];
  for (let r = 0; r < 9; r++) h.push(IDX.filter((i) => rowOf(i) === r));
  for (let c = 0; c < 9; c++) h.push(IDX.filter((i) => colOf(i) === c));
  for (let b = 0; b < 9; b++) h.push(IDX.filter((i) => boxOf(i) === b));
  return h;
})();
const SEES = IDX.map((i) => new Set(IDX.filter((j) => j !== i
  && (rowOf(j) === rowOf(i) || colOf(j) === colOf(i) || boxOf(j) === boxOf(i)))));

// every multiset of `n` distinct digits from `pool` totalling `sum`
function sets(n, sum, pool) {
  const out = [];
  const walk = (from, left, rem, acc) => {
    if (left === 0) { if (rem === 0) out.push(acc); return; }
    for (let v = from; v <= 9; v++) {
      if (!pool.has(v)) continue;
      if (v * left > rem) break;
      walk(v + 1, left - 1, rem - v, acc.concat(v));
    }
  };
  walk(1, n, sum, []);
  return out;
}

// ── independent counting solver: propagate, then branch on the tightest cell ──
function countSolutions(cageOf, cageCells, sums, cap) {
  const start = IDX.map(() => new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]));
  let found = 0;
  const propagate = (cand) => {
    for (let pass = 0; pass < 200; pass++) {
      let moved = false;
      for (let k = 0; k < cageCells.length; k++) {
        const cells = cageCells[k];
        const feasible = cells.map(() => new Set());
        const deal = (idx, used, rem) => {
          if (idx === cells.length) return rem === 0;
          let any = false;
          for (const v of cand[cells[idx]]) {
            if (used.has(v) || v > rem) continue;
            used.add(v);
            if (deal(idx + 1, used, rem - v)) { feasible[idx].add(v); any = true; }
            used.delete(v);
          }
          return any;
        };
        if (!deal(0, new Set(), sums[k])) return null;
        for (let j = 0; j < cells.length; j++) {
          if (feasible[j].size < cand[cells[j]].size) { cand[cells[j]] = feasible[j]; moved = true; }
          if (!cand[cells[j]].size) return null;
        }
      }
      for (const i of IDX) {
        if (cand[i].size !== 1) continue;
        const v = [...cand[i]][0];
        for (const j of SEES[i]) if (cand[j].delete(v)) { moved = true; if (!cand[j].size) return null; }
        for (const j of cageCells[cageOf[i]]) if (j !== i && cand[j].delete(v)) { moved = true; if (!cand[j].size) return null; }
      }
      for (const h of HOUSES) {
        for (let v = 1; v <= 9; v++) {
          const spots = h.filter((i) => cand[i].has(v));
          if (!spots.length) return null;
          if (spots.length === 1 && cand[spots[0]].size > 1) { cand[spots[0]] = new Set([v]); moved = true; }
        }
      }
      if (!moved) return cand;
    }
    return cand;
  };
  const search = (cand) => {
    if (found >= cap) return;
    const c = propagate(cand.map((s) => new Set(s)));
    if (!c) return;
    let pick = -1;
    for (const i of IDX) if (c[i].size > 1 && (pick < 0 || c[i].size < c[pick].size)) pick = i;
    if (pick < 0) { found++; return; }
    for (const v of [...c[pick]]) {
      const next = c.map((s) => new Set(s));
      next[pick] = new Set([v]);
      search(next);
      if (found >= cap) return;
    }
  };
  search(start);
  return found;
}

// ── independent logical solver ────────────────────────────────────────────────
// Only justifiable moves, never a guess. `truth` is the known solution and is
// used ONLY to police the solver: any move that removes a true digit or writes a
// false one is an unsound rule, and is reported rather than quietly trusted.
function logicSolve(cageOf, cageCells, sums, level, truth) {
  const cand = IDX.map(() => new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]));
  const unsound = [];
  const drop = (i, v, why) => {
    if (!cand[i].has(v)) return false;
    if (truth[i] === v) unsound.push(`${why} removed the true digit ${v} from r${rowOf(i) + 1}c${colOf(i) + 1}`);
    cand[i].delete(v);
    return true;
  };
  const keepOnly = (i, allow, why) => {
    let moved = false;
    for (const v of [...cand[i]]) if (!allow.has(v)) moved = drop(i, v, why) || moved;
    return moved;
  };
  const solved = (i) => cand[i].size === 1;
  const only = (i) => [...cand[i]][0];
  const groupsNaked = HOUSES.concat(cageCells);

  // the 45 rule runs on these: single houses, and stacked pairs and triples
  // inside one band or stack, where the total generalises to 90 and 135
  const REGIONS = (() => {
    const rs = HOUSES.slice();
    const row = (r) => IDX.filter((i) => rowOf(i) === r);
    const col = (c) => IDX.filter((i) => colOf(i) === c);
    for (const b of [0, 3, 6]) {
      rs.push(row(b).concat(row(b + 1)), row(b + 1).concat(row(b + 2)), row(b).concat(row(b + 2)));
      rs.push(row(b).concat(row(b + 1), row(b + 2)));
      rs.push(col(b).concat(col(b + 1)), col(b + 1).concat(col(b + 2)), col(b).concat(col(b + 2)));
      rs.push(col(b).concat(col(b + 1), col(b + 2)));
    }
    return rs;
  })();

  for (let pass = 0; pass < 600; pass++) {
    let moved = false;

    // cage combinations, and the digits every feasible combination contains
    const required = cageCells.map(() => new Set());
    for (let k = 0; k < cageCells.length; k++) {
      const cells = cageCells[k];
      const feasible = cells.map(() => new Set());
      let combos = 0, always = null;
      const deal = (idx, used, rem, acc) => {
        if (idx === cells.length) {
          if (rem !== 0) return false;
          combos++;
          const seen = new Set(acc);
          always = always === null ? seen : new Set([...always].filter((v) => seen.has(v)));
          return true;
        }
        let any = false;
        for (const v of cand[cells[idx]]) {
          if (used.has(v) || v > rem) continue;
          used.add(v);
          if (deal(idx + 1, used, rem - v, acc.concat(v))) { feasible[idx].add(v); any = true; }
          used.delete(v);
        }
        return any;
      };
      deal(0, new Set(), sums[k], []);
      if (!combos) return { stuck: true, unsound };
      required[k] = always || new Set();
      if (level >= 2) {
        for (let j = 0; j < cells.length; j++) moved = keepOnly(cells[j], feasible[j], 'cage combination') || moved;
      } else {
        const union = new Set(feasible.flatMap((s) => [...s]));
        for (const c of cells) moved = keepOnly(c, union, 'cage combination') || moved;
      }
    }

    // the 45 rule: innies (cells a region's whole cages leave over) and, at the
    // full toolkit, outies (cells its overhanging cages reach outside)
    const cap = level >= 2 ? 2 : 1;
    for (const R of REGIONS) {
      const inR = new Set(R);
      const total = 45 * (R.length / 9);
      const ks = new Set(R.map((i) => cageOf[i]));
      let inside = 0, all = 0;
      const covered = new Set(), outies = [];
      for (const k of ks) {
        all += sums[k];
        if (cageCells[k].every((c) => inR.has(c))) { inside += sums[k]; cageCells[k].forEach((c) => covered.add(c)); }
        else for (const c of cageCells[k]) if (!inR.has(c)) outies.push(c);
      }
      const innies = R.filter((c) => !covered.has(c));
      for (const [cells, target] of [[innies, total - inside], [outies, all - total]]) {
        // count only the cells still OPEN, and take what is already settled off
        // the target. Measuring the leftover set before the solved cells come
        // out of it makes the rule fire far less often than a person would.
        const open = cells.filter((c) => !solved(c));
        if (!open.length || open.length > cap) continue;
        const rem0 = target - cells.filter(solved).reduce((a, c) => a + only(c), 0);
        if (open.length === 1) {
          if (rem0 < 1 || rem0 > 9) return { stuck: true, unsound };
          moved = keepOnly(open[0], new Set([rem0]), '45 rule') || moved;
        } else {
          const allow = open.map(() => new Set());
          const walk = (idx, rem, taken) => {
            if (idx === open.length) return rem === 0;
            let any = false;
            for (const v of cand[open[idx]]) {
              if (v > rem) continue;
              if (taken.some(([c, w]) => w === v && SEES[c].has(open[idx]))) continue;
              taken.push([open[idx], v]);
              if (walk(idx + 1, rem - v, taken)) { allow[idx].add(v); any = true; }
              taken.pop();
            }
            return any;
          };
          if (!walk(0, rem0, [])) return { stuck: true, unsound };
          for (let j = 0; j < open.length; j++) moved = keepOnly(open[j], allow[j], '45 rule') || moved;
        }
      }
    }

    if (level >= 2) {
      // locked candidates, from a house always and from a cage only for a digit
      // the cage's own arithmetic forces it to contain
      const srcs = HOUSES.map((h) => [h, null]).concat(cageCells.map((cg, k) => [cg, required[k]]));
      for (const [src, must] of srcs) {
        for (let v = 1; v <= 9; v++) {
          if (must && !must.has(v)) continue;
          if (src.some((i) => solved(i) && only(i) === v)) continue;
          const spots = src.filter((i) => cand[i].has(v));
          if (spots.length < 2 || spots.length > 3) continue;
          for (const h of HOUSES) {
            if (h === src || !spots.every((i) => h.includes(i))) continue;
            for (const i of h) if (!spots.includes(i)) moved = drop(i, v, 'locked candidate') || moved;
          }
        }
      }
      // naked pairs and triples, valid in a cage too since a cage never repeats
      for (const g of groupsNaked) {
        const open = g.filter((i) => !solved(i));
        for (let a = 0; a < open.length; a++) for (let b = a + 1; b < open.length; b++) {
          const pair = new Set([...cand[open[a]], ...cand[open[b]]]);
          if (pair.size === 2) for (const i of open) {
            if (i === open[a] || i === open[b]) continue;
            for (const v of pair) moved = drop(i, v, 'naked pair') || moved;
          }
          for (let c = b + 1; c < open.length; c++) {
            const tri = new Set([...pair, ...cand[open[c]]]);
            if (tri.size !== 3) continue;
            for (const i of open) {
              if (i === open[a] || i === open[b] || i === open[c]) continue;
              for (const v of tri) moved = drop(i, v, 'naked triple') || moved;
            }
          }
        }
      }
      // hidden pairs, valid only in a house, which holds every digit
      for (const h of HOUSES) {
        const open = h.filter((i) => !solved(i));
        for (let v1 = 1; v1 <= 9; v1++) for (let v2 = v1 + 1; v2 <= 9; v2++) {
          // a digit already placed in this house is not looking for a home, and
          // treating it as though it were is how a hidden pair turns unsound
          if (h.some((i) => solved(i) && (only(i) === v1 || only(i) === v2))) continue;
          const s1 = open.filter((i) => cand[i].has(v1));
          const s2 = open.filter((i) => cand[i].has(v2));
          if (s1.length !== 2 || s2.length !== 2) continue;
          if (s1[0] !== s2[0] || s1[1] !== s2[1]) continue;
          for (const i of s1) moved = keepOnly(i, new Set([v1, v2]), 'hidden pair') || moved;
        }
      }
    }

    // singles: hidden ones need a group that holds every digit it is asked
    // about, so a cage qualifies only for the digits it is forced to contain
    const hidden = HOUSES.map((h) => [h, null]).concat(cageCells.map((cg, k) => [cg, required[k]]));
    for (const [g, must] of hidden) {
      for (let v = 1; v <= 9; v++) {
        if (must && !must.has(v)) continue;
        if (g.some((i) => solved(i) && only(i) === v)) continue;
        const spots = g.filter((i) => cand[i].has(v));
        if (!spots.length) return { stuck: true, unsound };
        if (spots.length === 1 && !solved(spots[0])) moved = keepOnly(spots[0], new Set([v]), 'hidden single') || moved;
      }
    }
    for (const i of IDX) {
      if (!solved(i)) continue;
      const v = only(i);
      for (const j of SEES[i]) moved = drop(j, v, 'naked single') || moved;
      for (const j of cageCells[cageOf[i]]) if (j !== i) moved = drop(j, v, 'cage repeat') || moved;
    }

    if (IDX.every(solved)) return { grid: IDX.map(only), unsound };
    if (!moved) return { stuck: true, unsound };
  }
  return { stuck: true, unsound };
}

// ── the sweep ─────────────────────────────────────────────────────────────────
// [cages, largest cage, level] pinned per day, matching gen-cages.mjs
const RAMP = { 1: [34, 3, 1], 2: [33, 3, 1], 3: [32, 4, null], 4: [31, 4, 2], 5: [30, 4, 2], 6: [29, 4, 2], 0: [27, 5, 2] };
const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];

let bad = 0;
const seenCage = new Set(), seenSol = new Set(), seenId = new Set();
const sundayCages = [], weekdayCages = [];

PUZZLES.forEach((p, n) => {
  const id = p.quizId || `#${p.num}`;
  const errs = [];
  const push = (m) => errs.push(m);

  // ── shape ──
  if (p.num !== n + 1) push(`num is ${p.num}, expected ${n + 1}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.live || '')) push('live is not an ISO date');
  if (seenId.has(id)) push('duplicate quizId'); else seenId.add(id);
  const d = new Date(`${p.live}T12:00:00Z`);
  const [y, m, dd] = p.live.split('-').map(Number);
  if (p.quizId !== `cages-${m}-${dd}-${String(y).slice(2)}`) push(`quizId does not match live (${p.quizId})`);
  if (p.dateLabel !== `${MONTHS[m - 1]} ${dd}, ${y}`) push(`dateLabel does not match live (${p.dateLabel})`);
  if (n > 0) {
    const prev = new Date(`${PUZZLES[n - 1].live}T12:00:00Z`);
    if (d - prev !== 86400000) push(`date is not the day after ${PUZZLES[n - 1].live}`);
  }

  // ── no printed digits anywhere ──
  for (const k of ['given', 'givens', 'clues']) if (p[k] !== undefined) push(`carries \`${k}\`: a killer board prints no digits`);

  const cageOf = flat(p.cage);
  const sol = flat(p.sol);
  const sums = p.sums;

  // ── the partition ──
  if (cageOf.length !== 81 || cageOf.some((k) => !Number.isInteger(k) || k < 0 || k >= sums.length)) {
    push('cage map is not 81 indices into sums');
    bad++; console.error(`✗ ${id}: ${errs.join('; ')}`); return;
  }
  const cageCells = sums.map(() => []);
  cageOf.forEach((k, i) => cageCells[k].push(i));
  cageCells.forEach((cells, k) => {
    if (cells.length < 2) push(`cage ${k} has ${cells.length} cell(s): a one-cell cage is a printed digit`);
    if (cells.length > 5) push(`cage ${k} has ${cells.length} cells, over the cap of 5`);
    // connected through shared edges
    const seen = new Set([cells[0]]), stack = [cells[0]];
    while (stack.length) for (const nb of nbrs(stack.pop())) {
      if (cageOf[nb] === k && !seen.has(nb)) { seen.add(nb); stack.push(nb); }
    }
    if (seen.size !== cells.length) push(`cage ${k} is not connected`);
    const digits = cells.map((c) => sol[c]);
    if (new Set(digits).size !== digits.length) push(`cage ${k} repeats a digit`);
    const real = digits.reduce((a, b) => a + b, 0);
    if (sums[k] !== real) push(`cage ${k} prints ${sums[k]} but its cells total ${real}`);
  });
  if (p.cages !== cageCells.length) push(`cages says ${p.cages}, partition has ${cageCells.length}`);
  const big = Math.max(...cageCells.map((c) => c.length));
  if (p.big !== big) push(`big says ${p.big}, largest cage is ${big}`);

  // ── the solution is legal sudoku ──
  for (const h of HOUSES) {
    const seen = new Set(h.map((i) => sol[i]));
    if (seen.size !== 9) push('sol is not a legal sudoku grid');
  }

  if (errs.length) { bad++; console.error(`✗ ${id}: ${errs.join('; ')}`); return; }

  // ── uniqueness, from an independent counting solver ──
  const count = countSolutions(cageOf, cageCells, sums, 2);
  if (count !== 1) push(count === 0 ? 'has NO solution' : 'has more than one solution');

  // ── no guessing, and the stored level is honest ──
  const at = (lv) => logicSolve(cageOf, cageCells, sums, lv, sol);
  const here = at(p.level);
  if (here.unsound.length) push(`UNSOUND deduction: ${here.unsound[0]}`);
  if (here.stuck) push(`does not solve at level ${p.level}: it would need a guess`);
  else if (here.grid.join('') !== sol.join('')) push('the logical line reaches a different grid than sol');
  if (p.level === 2) {
    const easy = at(1);
    if (easy.grid) push('stored level 2 but the beginner toolkit already solves it');
  }

  // ── the weekday ramp ──
  const dow = d.getUTCDay();
  const [wantCages, wantBig, wantLevel] = RAMP[dow];
  if (p.cages !== wantCages) push(`${DOW[dow]} should run ${wantCages} cages, has ${p.cages}`);
  if (big !== wantBig) push(`${DOW[dow]} should cap cages at ${wantBig}, largest is ${big}`);
  if (wantLevel !== null && p.level !== wantLevel) push(`${DOW[dow]} should be level ${wantLevel}, is ${p.level}`);
  if (p.sunday !== (dow === 0)) push(p.sunday ? `flagged Sunday but falls on ${DOW[dow]}` : 'falls on a Sunday but is not flagged');
  (dow === 0 ? sundayCages : weekdayCages).push(p.cages);

  // ── bank-wide variety ──
  const ck = cageOf.join(',') + '|' + sums.join(',');
  const sk = sol.join('');
  if (seenCage.has(ck)) push('cage layout already used earlier in the bank');
  if (seenSol.has(sk)) push('solution grid already used earlier in the bank');
  seenCage.add(ck); seenSol.add(sk);

  if (errs.length) { bad++; console.error(`✗ ${id}: ${errs.join('; ')}`); }
});

// A Sunday Edition has to actually be one. Cages scales its Sunday by taking
// cages AWAY, so the roomiest Sunday must still be tighter than the tightest
// weekday, and the five-cell cage must belong to Sunday alone.
if (sundayCages.length && weekdayCages.length) {
  const roomiestSunday = Math.max(...sundayCages);
  const tightestWeekday = Math.min(...weekdayCages);
  if (roomiestSunday >= tightestWeekday) {
    bad++;
    console.error(`✗ Sunday Edition does not scale: roomiest Sunday has ${roomiestSunday} cages, tightest weekday has ${tightestWeekday}`);
  }
}
if (!sundayCages.length) { bad++; console.error('✗ bank contains no Sunday Edition'); }
const weekdayBig = PUZZLES.filter((p) => !p.sunday).map((p) => p.big);
if (weekdayBig.some((b) => b >= 5)) { bad++; console.error('✗ a weekday board prints a five-cell cage, which is Sunday\'s alone'); }

if (bad) { console.error(`\n${bad} problem(s)`); process.exit(1); }
const last = PUZZLES[PUZZLES.length - 1];
console.log(`✓ ${PUZZLES.length} Cages boards verified: ${PUZZLES[0].live} to ${last.live}`);
console.log(`  one solution and a guess-free logical line on every board, with no printed digits at all`);
console.log(`  weekday ${Math.min(...weekdayCages)}-${Math.max(...weekdayCages)} cages, Sunday ${Math.min(...sundayCages)}-${Math.max(...sundayCages)} (${sundayCages.length} Editions)`);
console.log(`  ${seenCage.size} distinct cage layouts, ${seenSol.size} distinct solutions`);
