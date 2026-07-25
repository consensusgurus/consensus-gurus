// Verify the Tables bank (app/tables/puzzles.js) from scratch:
//   - structural: nums sequential, quizId/live/dateLabel agree, sunday flag
//     matches the real weekday, five teams on weekdays and six on Sundays,
//     team names distinct, every clue well-tablesed and about real teams
//   - EXACTLY ONE set of results satisfies the clues, proved by an independent
//     search (matches a clue names outright are fixed, the rest are walked with
//     running per-team totals and bounded pruning)
//   - the clue set is MINIMAL: dropping any single clue leaves more than one
//     table standing, so no board ships with a redundant line
//   - at least three kinds of clue, so a board is never eight "x beat y" lines
// The board carries no answer: the client derives the unique table the same way.
// Run: node scripts/verify-tables.mjs
import { PUZZLES } from '../app/tables/puzzles.js';

let fails = 0;
const fail = (m) => { console.error('FAIL:', m); fails++; };
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const TYPES = new Set(['beat','drew','points','wins','draws','unbeaten','winless','above','totalDraws']);
const pairsOf = (n) => { const p = []; for (let i = 0; i < n; i++) for (let j = i+1; j < n; j++) p.push([i,j]); return p; };

// kept byte-identical to the solver in app/tables/TablesClient.jsx
export function countSolutions(n, pairs, clues, cap) {
  const m = pairs.length;
  const fixed = Array(m).fill(-1);
  const idx = (x, y) => pairs.findIndex(([a,b]) => (a === x && b === y) || (a === y && b === x));
  for (const c of clues) {
    if (c.type === 'beat') { const k = idx(c.x,c.y); const v = pairs[k][0] === c.x ? 0 : 2; if (fixed[k] >= 0 && fixed[k] !== v) return 0; fixed[k] = v; }
    if (c.type === 'drew') { const k = idx(c.x,c.y); if (fixed[k] >= 0 && fixed[k] !== 1) return 0; fixed[k] = 1; }
  }
  const want = { pts: Array(n).fill(-1), wins: Array(n).fill(-1), draws: Array(n).fill(-1) };
  const unbeaten = [], winless = [], rest = [];
  let totalDraws = -1;
  for (const c of clues) {
    if (c.type === 'points') want.pts[c.x] = c.p;
    else if (c.type === 'wins') want.wins[c.x] = c.n;
    else if (c.type === 'draws') want.draws[c.x] = c.n;
    else if (c.type === 'unbeaten') unbeaten.push(c.x);
    else if (c.type === 'winless') winless.push(c.x);
    else if (c.type === 'totalDraws') totalDraws = c.n;
    else if (c.type === 'above') rest.push(c);
  }
  const left = Array(n).fill(0);
  pairs.forEach(([i,j],k) => { if (fixed[k] < 0) { left[i]++; left[j]++; } });
  const pts = Array(n).fill(0), wins = Array(n).fill(0), draws = Array(n).fill(0), losses = Array(n).fill(0);
  const bump = (i,j,r,s) => {
    if (r === 0) { pts[i] += 3*s; wins[i] += s; losses[j] += s; }
    else if (r === 2) { pts[j] += 3*s; wins[j] += s; losses[i] += s; }
    else { pts[i] += s; pts[j] += s; draws[i] += s; draws[j] += s; }
  };
  pairs.forEach(([i,j],k) => { if (fixed[k] >= 0) bump(i,j,fixed[k],1); });
  const free = []; pairs.forEach((p,k) => { if (fixed[k] < 0) free.push(k); });
  let found = 0, drawsUsed = fixed.filter((f) => f === 1).length;
  const alive = (i) => {
    if (want.pts[i] >= 0 && (pts[i] > want.pts[i] || pts[i] + 3*left[i] < want.pts[i])) return false;
    if (want.wins[i] >= 0 && (wins[i] > want.wins[i] || wins[i] + left[i] < want.wins[i])) return false;
    if (want.draws[i] >= 0 && (draws[i] > want.draws[i] || draws[i] + left[i] < want.draws[i])) return false;
    if (unbeaten.includes(i) && losses[i] > 0) return false;
    if (winless.includes(i) && wins[i] > 0) return false;
    return true;
  };
  (function rec(t) {
    if (found >= cap) return;
    if (t === free.length) {
      if (totalDraws >= 0 && drawsUsed !== totalDraws) return;
      for (const c of rest) if (!(pts[c.x] > pts[c.y])) return;
      found++; return;
    }
    const k = free[t], [i,j] = pairs[k];
    for (let r = 0; r < 3; r++) {
      bump(i,j,r,1); left[i]--; left[j]--; if (r === 1) drawsUsed++;
      if (alive(i) && alive(j) && (totalDraws < 0 || drawsUsed <= totalDraws)) rec(t+1);
      if (r === 1) drawsUsed--; left[i]++; left[j]++; bump(i,j,r,-1);
      if (found >= cap) return;
    }
  })(0);
  return found;
}

const seen = new Set();
PUZZLES.forEach((p, i) => {
  const tag = `#${p.num} (${p.live})`;
  if (p.num !== i + 1) fail(`${tag}: num out of sequence`);
  if (seen.has(p.quizId)) fail(`${tag}: duplicate quizId`);
  seen.add(p.quizId);
  const [y, m, d] = p.live.split('-').map(Number);
  if (p.quizId !== `tables-${m}-${d}-${String(y).slice(2)}`) fail(`${tag}: quizId does not match live date`);
  if (p.dateLabel !== `${MONTHS[m-1]} ${d}, ${y}`) fail(`${tag}: dateLabel does not match live date`);
  if (!!p.sunday !== (new Date(Date.UTC(y, m-1, d)).getUTCDay() === 0)) fail(`${tag}: sunday flag wrong`);

  const n = p.teams.length;
  if (n !== (p.sunday ? 6 : 5)) fail(`${tag}: ${n} teams`);
  if (new Set(p.teams).size !== n) fail(`${tag}: duplicate team name`);
  const pairs = pairsOf(n);

  p.clues.forEach((c, k) => {
    if (!TYPES.has(c.type)) fail(`${tag}: clue ${k} has unknown type ${c.type}`);
    ['x','y'].forEach((f) => { if (c[f] !== undefined && (!Number.isInteger(c[f]) || c[f] < 0 || c[f] >= n)) fail(`${tag}: clue ${k} names a team that does not exist`); });
    if ((c.type === 'beat' || c.type === 'drew' || c.type === 'above') && c.x === c.y) fail(`${tag}: clue ${k} pairs a team with itself`);
    if (c.type === 'points' && (c.p < 0 || c.p > 3 * (n - 1))) fail(`${tag}: clue ${k} has an impossible points total`);
  });
  if (new Set(p.clues.map((c) => JSON.stringify(c))).size !== p.clues.length) fail(`${tag}: duplicate clue`);
  if (new Set(p.clues.map((c) => c.type)).size < 3) fail(`${tag}: fewer than three kinds of clue`);

  const sols = countSolutions(n, pairs, p.clues, 2);
  if (sols !== 1) { fail(`${tag}: ${sols} tables satisfy the clues (need exactly 1)`); return; }
  p.clues.forEach((c, k) => {
    const without = p.clues.filter((_, j) => j !== k);
    if (countSolutions(n, pairs, without, 2) === 1) fail(`${tag}: clue ${k} (${c.type}) is redundant`);
  });
});

if (fails) { console.error(`\nverify-tables: ${fails} FAILURE(S)`); process.exit(1); }
console.log(`verify-tables: all ${PUZZLES.length} boards pass (unique table, minimal clue set, structure OK)`);
