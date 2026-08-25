// Calc — shared engine. The generator, the verifier and the client all read the
// same rules from here, so a rule cannot drift between what is banked and what
// is played.
//
// A board is an n x n checkerboard: (row + col) EVEN is a number cell, ODD is an
// operator cell. A route starts on cell 0 (top-left, always a number) and ends on
// cell n*n-1 (bottom-right, also a number because n*n-1 has even coordinate sum
// for every n). Steps are orthogonal, no cell is used twice, and the expression
// evaluates LEFT TO RIGHT like a calculator. A division that does not come out
// whole is not a legal step at all, which is what keeps every running total an
// integer.
export const MAXABS = 1e7;

export function neighbours(n, i) {
  const r = (i / n) | 0, c = i % n, a = [];
  if (r > 0) a.push(i - n);
  if (r < n - 1) a.push(i + n);
  if (c > 0) a.push(i - 1);
  if (c < n - 1) a.push(i + 1);
  return a;
}
export const isNumCell = (n, i) => ((((i / n) | 0) + (i % n)) % 2) === 0;

// Left-to-right evaluation of a route. Returns null when the route is illegal
// (an inexact division, or a total that has run away past MAXABS).
export function evalRoute(n, cells, route) {
  let acc = +cells[route[0]], op = null;
  for (let k = 1; k < route.length; k++) {
    const i = route[k];
    if (isNumCell(n, i)) {
      const v = +cells[i];
      if (op === '+') acc += v;
      else if (op === '-') acc -= v;
      else if (op === '*') acc *= v;
      else if (op === '/') { if (v === 0 || acc % v !== 0) return null; acc /= v; }
      op = null;
      if (!Number.isSafeInteger(acc) || Math.abs(acc) > MAXABS) return null;
    } else op = cells[i];
  }
  return acc;
}

// Every legal route, folded into total -> { count, minLen }. Throws 'cap' past
// `cap` routes so a hopelessly dense board is rejected in a fraction of a second
// rather than enumerated in full.
export function enumerate(n, cells, cap = Infinity) {
  const N = n * n, end = N - 1;
  const adj = []; for (let i = 0; i < N; i++) adj.push(neighbours(n, i));
  const seen = new Uint8Array(N);
  const totals = new Map();
  let routes = 0;
  function step(pos, acc, op, len) {
    if (pos === end) {
      routes++;
      if (routes > cap) throw new Error('cap');
      const cur = totals.get(acc);
      if (!cur) totals.set(acc, { count: 1, minLen: len });
      else { cur.count++; if (len < cur.minLen) cur.minLen = len; }
    }
    for (const j of adj[pos]) {
      if (seen[j]) continue;
      let na = acc, no = op;
      if (isNumCell(n, j)) {
        const v = +cells[j];
        if (op === '+') na = acc + v; else if (op === '-') na = acc - v;
        else if (op === '*') na = acc * v;
        else if (op === '/') { if (v === 0 || acc % v !== 0) continue; na = acc / v; }
        no = null;
        if (!Number.isSafeInteger(na) || Math.abs(na) > MAXABS) continue;
      } else no = cells[j];
      seen[j] = 1; step(j, na, no, len + 1); seen[j] = 0;
    }
  }
  seen[0] = 1; step(0, +cells[0], null, 1);
  return { routes, totals };
}

// Independent of enumerate: walks the board again and returns the exact number of
// routes hitting `target` plus the SHORTEST one. The verifier uses this to
// re-derive every stored figure rather than trusting the bank.
export function solveFor(n, cells, target) {
  const N = n * n, end = N - 1;
  const adj = []; for (let i = 0; i < N; i++) adj.push(neighbours(n, i));
  const seen = new Uint8Array(N), st = [0];
  let best = null, count = 0;
  function go(pos, acc, op) {
    if (pos === end && acc === target) { count++; if (!best || st.length < best.length) best = st.slice(); }
    for (const j of adj[pos]) {
      if (seen[j]) continue;
      let na = acc, no = op;
      if (isNumCell(n, j)) {
        const v = +cells[j];
        if (op === '+') na = acc + v; else if (op === '-') na = acc - v;
        else if (op === '*') na = acc * v;
        else if (op === '/') { if (v === 0 || acc % v !== 0) continue; na = acc / v; }
        no = null;
        if (!Number.isSafeInteger(na) || Math.abs(na) > MAXABS) continue;
      } else no = cells[j];
      seen[j] = 1; st.push(j); go(j, na, no); st.pop(); seen[j] = 0;
    }
  }
  seen[0] = 1; go(0, +cells[0], null);
  return { count, best };
}
