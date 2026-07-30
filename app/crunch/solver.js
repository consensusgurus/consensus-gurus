// Arithmetic rules and the exhaustive solver behind Crunch.
//
// Shared by the browser client (app/crunch/CrunchClient.jsx) and the offline
// bank generator, so the target a player is chasing is one that was proved
// reachable by this exact code.
//
// RULES, the Countdown numbers-round set:
//   - Six numbers. Combine two at a time with + - x /, and the result replaces
//     both. Each number can be used once, and any result you make can be used
//     again as a number.
//   - Every intermediate value must be a POSITIVE INTEGER. No negatives, no
//     fractions. So 3 - 7 is not allowed, and 7 / 2 is not allowed.
//   - You do not have to use all six numbers.
//   - Reaching the target exactly is the win; otherwise you are scored on how
//     close you got.

export const OPS = ['+', '-', 'x', '/'];

export function applyOp(a, b, op) {
  if (op === '+') return a + b;
  if (op === 'x') return a * b;
  if (op === '-') return a > b ? a - b : null;          // no negatives
  if (op === '/') return b !== 0 && a % b === 0 ? a / b : null;   // no fractions
  return null;
}

// Best reachable value and how it is made. Returns { best, diff, exact,
// steps, used } where `steps` is the list of [a, op, b, result] that gets there.
//
// Exhaustive: at each stage pick an unordered pair from the current pool, apply
// every legal operation, and recurse on the pool with that pair replaced. Six
// numbers is a few hundred thousand states, which is milliseconds, so there is
// no need for cleverness and no risk of the solver being wrong about "no exact
// solution exists".
export function solve(numbers, target, opts = {}) {
  const wantAll = !!opts.mustUseAll;
  let best = null, bestDiff = Infinity, bestSteps = null, bestUsed = 99;
  let exactCount = 0;
  const capCount = opts.countCap || 0;

  const seen = new Set();
  function walk(pool, steps, used) {
    // score every value currently on the table
    for (let i = 0; i < pool.length; i++) {
      const v = pool[i];
      const d = Math.abs(v - target);
      const isExact = d === 0;
      if (isExact && capCount) exactCount++;
      if (wantAll && used < numbers.length - 1 && isExact) continue;
      if (d < bestDiff || (d === bestDiff && used < bestUsed)) {
        best = v; bestDiff = d; bestUsed = used;
        bestSteps = steps.slice(0, stepsNeededFor(steps, v));
      }
    }
    if (pool.length < 2) return;
    if (capCount && exactCount > capCount) return;
    const key = pool.slice().sort((a, b) => a - b).join(',');
    if (seen.has(key) && !capCount) return;
    seen.add(key);
    for (let i = 0; i < pool.length; i++) {
      for (let j = i + 1; j < pool.length; j++) {
        const a = pool[i], b = pool[j];
        const rest = [];
        for (let k = 0; k < pool.length; k++) if (k !== i && k !== j) rest.push(pool[k]);
        for (const op of OPS) {
          // + and x are commutative, and - and / are handled by ordering the
          // operands, so each pair is only ever tried one way round
          const hi = Math.max(a, b), lo = Math.min(a, b);
          const r = applyOp(hi, lo, op);
          if (r === null || r === 0) continue;
          steps.push([hi, op, lo, r]);
          walk([...rest, r], steps, used + 1);
          steps.pop();
        }
      }
    }
  }
  // how many of the recorded steps are needed to have produced `v`
  function stepsNeededFor(steps, v) {
    for (let i = 0; i < steps.length; i++) if (steps[i][3] === v) return i + 1;
    return steps.length;
  }

  walk(numbers.slice(), [], 0);
  // The recorded path is everything the search did on the way, which can include
  // a step that had nothing to do with the answer. Keep only the steps the final
  // value actually depends on, so what is shown is a clean solution.
  bestSteps = pruneSteps(bestSteps || [], best);
  return {
    best, diff: bestDiff, exact: bestDiff === 0,
    steps: bestSteps || [], used: bestUsed,
    exactCount: capCount ? exactCount : undefined,
  };
}

// Drop steps the answer does not depend on. Walks back from the step that
// produced `value`, keeping any earlier step whose result it consumed.
export function pruneSteps(steps, value) {
  if (!steps.length) return steps;
  let idx = -1;
  for (let i = steps.length - 1; i >= 0; i--) if (steps[i][3] === value) { idx = i; break; }
  if (idx < 0) return steps;
  const keep = new Set([idx]);
  const need = [steps[idx][0], steps[idx][2]];
  for (let i = idx - 1; i >= 0; i--) {
    const pos = need.indexOf(steps[i][3]);
    if (pos < 0) continue;
    keep.add(i);
    need.splice(pos, 1);
    need.push(steps[i][0], steps[i][2]);
  }
  return steps.filter((_, i) => keep.has(i));
}

// Countdown's own scale, which is the one people already know: spot on is the
// full ten, within five is most of it, within ten is half.
export function scoreFor(diff) {
  if (diff === 0) return 10;
  if (diff <= 5) return 7;
  if (diff <= 10) return 5;
  return 1;
}

// The fewest of the six numbers any exact solution needs. This is the honest
// difficulty dial: a target you can hit with three numbers is a glance, one that
// needs all six is a real hunt.
export function minNumbersForExact(numbers, target) {
  for (let n = 2; n <= numbers.length; n++) {
    const combos = choose(numbers.map((v, i) => i), n);
    for (const idx of combos) {
      const sub = idx.map((i) => numbers[i]);
      if (solve(sub, target).exact) return n;
    }
  }
  return -1;
}

function choose(arr, k) {
  const out = [];
  (function rec(start, cur) {
    if (cur.length === k) { out.push(cur.slice()); return; }
    for (let i = start; i < arr.length; i++) { cur.push(arr[i]); rec(i + 1, cur); cur.pop(); }
  })(0, []);
  return out;
}
