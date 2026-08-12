#!/usr/bin/env node
// verify-endgame-board — the End Game attempts-to-solve ranking (owner, 2026-08-12).
//
// The six End Game titles rank on how many RUNS a puzzle took, not on the first
// attempt every other daily keeps. That order lives in one shared function
// (endGamePlan in lib/daily-games) read by both scoring mirrors, and this checks
// the whole path end to end:
//
//   1. the roster is the six titles, and Babel is not one of them
//   2. tiers: any solver beats any drawer beats anyone who never finished
//   3. among solvers, fewer attempts wins, and the SOLVING run's clock breaks ties
//   4. the unsolved rank on depth, never on how few times they tried
//   5. every other game sorts byte-identically to the pre-change engine
//   6. the change is ORDER ONLY: a late solve is worth the same completion, and
//      so the same IQ Points, as a first-try one
//
// It IMPORTS the real modules rather than restating their logic, so it cannot
// drift from what it certifies. That needs the '@/' alias and extensionless
// relative imports resolved, which is what alias-loader.mjs is for, and the
// imports below are dynamic because the hook must be registered first.
import { register } from 'node:module';
register('./alias-loader.mjs', import.meta.url);

const { buildLeaderboard } = await import('../lib/quiz-anon.js');
const { scoreGame } = await import('../lib/daily-combined.js');
const { endGamePlan, isEndGameQuizId, isEndGame } = await import('../lib/daily-games.js');

let BAD = 0;
const fail = (m) => { console.log('  FAIL ' + m); BAD++; };
const ok = (m) => console.log('  ok   ' + m);

// ---- 1. the roster is what we think it is -----------------------------------
const EG = ['mate', 'four', 'check', 'chain', 'turn', 'defend'];
console.log('roster');
for (const k of EG) if (!isEndGame(k)) fail(`${k} is not End Game`);
if (isEndGame('babel')) fail('babel is still End Game'); else ok('babel is out of End Game');
if (!isEndGameQuizId('four-8-12-26')) fail('four quiz id not detected');
if (isEndGameQuizId('babel-8-12-26')) fail('babel quiz id still detected'); else ok('quiz-id predicate matches the roster');
if (isEndGameQuizId('crux-8-12-26')) fail('crux detected as End Game');

// ---- row helpers ------------------------------------------------------------
let ID = 0;
const row = (quiz, user, score, { t = 30, prog = null, ab = false } = {}) =>
  ({ id: ++ID, quiz_id: quiz, user_id: user, username: 'P' + user, anon_id: null,
     score, total: 10, correct_count: score >= 10 ? 1 : 0, time_elapsed: t,
     guesses_used: 0, progress: prog, abandoned: ab, created_at: '2026-08-12T12:00:00Z' });

const orderOf = (rows) => buildLeaderboard(rows, { population: 'all', filter: 'first', limit: Infinity }).map((r) => r.username);
const orderOfScore = (rows) => {
  const { players } = scoreGame(rows);
  return [...players.values()].sort((a, b) => a.rank - b.rank || String(a.username).localeCompare(String(b.username))).map((p) => p.username);
};

// ---- 2/3. tiers and attempts ------------------------------------------------
console.log('\ntiers and attempts');
{
  const Q = 'four-8-12-26';
  const rows = [
    // A: solves on try 1, slow.                       -> tier 0, tries 1
    row(Q, 'A', 10, { t: 300 }),
    // B: loses twice then solves on try 3, fast.      -> tier 0, tries 3
    row(Q, 'B', 0, { t: 5, prog: 2 }), row(Q, 'B', 0, { t: 5, prog: 3 }), row(Q, 'B', 10, { t: 9 }),
    // C: solves on try 2.                             -> tier 0, tries 2
    row(Q, 'C', 0, { t: 5, prog: 1 }), row(Q, 'C', 10, { t: 60 }),
    // D: draws on try 1 and stops.                    -> tier 1, tries 1
    row(Q, 'D', 4, { t: 20 }),
    // E: never solves, got deepest.                   -> tier 2, progress 7
    row(Q, 'E', 0, { t: 8, prog: 7 }),
    // F: never solves, gave up once immediately.      -> tier 2, progress 1
    row(Q, 'F', 0, { t: 2, prog: 1 }),
  ];
  const want = ['PA', 'PC', 'PB', 'PD', 'PE', 'PF'];
  const got = orderOf(rows);
  if (JSON.stringify(got) !== JSON.stringify(want)) fail(`order ${got} != ${want}`);
  else ok('solver(1) < solver(2) < solver(3) < drawer < deep loss < shallow loss');

  const got2 = orderOfScore(rows);
  if (JSON.stringify(got2) !== JSON.stringify(want)) fail(`scoreGame order ${got2} != ${want}`);
  else ok('scoreGame agrees with buildLeaderboard');

  // The representative row is the WINNING run, so the reported clock is its own.
  const lb = buildLeaderboard(rows, { population: 'all', filter: 'first', limit: Infinity });
  const b = lb.find((r) => r.username === 'PB');
  if (b.timeElapsed !== 9) fail(`B reported time ${b.timeElapsed}, want the winning run's 9`);
  else ok("a solver's reported clock is the run they won on, not their first");
  if (b.tries !== 3) fail(`B tries ${b.tries}`); else ok('tries counts every run, wins and losses alike');
  if (b.score !== 10) fail(`B score ${b.score}`); else ok('a late solve still posts the full score');
}

// ---- 3b. equal attempts break on the solving run's clock ---------------------
{
  const Q = 'mate-8-12-26';
  const rows = [
    row(Q, 'S', 0, { t: 1, prog: 1 }), row(Q, 'S', 10, { t: 40 }),  // slow win on try 2
    row(Q, 'F', 0, { t: 90, prog: 1 }), row(Q, 'F', 10, { t: 12 }), // fast win on try 2
  ];
  const got = orderOf(rows);
  if (JSON.stringify(got) !== JSON.stringify(['PF', 'PS'])) fail(`clock tiebreak ${got}`);
  else ok('equal attempts break on the winning run, ignoring failed-run time');
}

// ---- 4. attempts must NOT reorder the unsolved -------------------------------
{
  const Q = 'turn-8-12-26';
  const quitter = [row(Q, 'Q', 0, { t: 3, prog: 2 })];                       // 1 try, shallow
  const fighter = [1,2,3,4,5].map(() => row(Q, 'G', 0, { t: 30, prog: 6 })); // 5 tries, deep
  const got = orderOf([...quitter, ...fighter]);
  if (got[0] !== 'PG') fail(`giving up once outranked fighting through five: ${got}`);
  else ok('the unsolved rank on depth, never on how few times they tried');
}

// ---- 5. no other game moves --------------------------------------------------
console.log('\nno other game moves');
{
  // A pseudo-random field on a NON End Game id, sorted by the new engine, must
  // match the old engine's order exactly. The old order is recomputed here from
  // the pre-change comparator (score, then guesses, then time).
  let seed = 7; const rnd = (n) => (seed = (seed * 1103515245 + 12345) % 2147483648) % n;
  let mismatched = 0;
  for (let trial = 0; trial < 400; trial++) {
    ID = 0;
    const Q = ['crux-8-12-26', 'suds-8-12-26', 'babel-8-12-26', 'listed-8-12-26'][trial % 4];
    const rows = [];
    for (let u = 0; u < 8; u++) {
      const n = 1 + rnd(3);
      for (let a = 0; a < n; a++) rows.push(row(Q, String.fromCharCode(65 + u), rnd(11), { t: 1 + rnd(200) }));
    }
    const got = orderOf(rows);
    // Old engine: first row per player, then score desc, guesses asc, time asc.
    const firstBy = new Map();
    for (const r of rows.slice().sort((a, b) => a.id - b.id)) if (!firstBy.has(r.user_id)) firstBy.set(r.user_id, r);
    const want = [...firstBy.values()]
      .sort((a, b) => b.score - a.score || ((a.guesses_used ?? 1e9) - (b.guesses_used ?? 1e9))
        || ((a.time_elapsed ?? 0) - (b.time_elapsed ?? 0)) || String(a.username).localeCompare(String(b.username)))
      .map((r) => r.username);
    if (JSON.stringify(got) !== JSON.stringify(want)) { mismatched++; if (mismatched === 1) console.log('   first mismatch', got, want); }
  }
  if (mismatched) fail(`${mismatched}/400 non-End-Game fields reordered`);
  else ok('400 random non-End-Game fields sort byte-identically to the old engine');
}

// ---- 6. scoring is order-only -------------------------------------------------
console.log('\nscoring is order only');
{
  const Q = 'check-8-12-26';
  const rows = [row(Q, 'A', 10, { t: 20 }),
                row(Q, 'B', 0, { t: 5, prog: 1 }), row(Q, 'B', 0, { t: 5, prog: 1 }), row(Q, 'B', 10, { t: 20 })];
  const { players } = scoreGame(rows);
  const A = [...players.values()].find((p) => p.username === 'PA');
  const B = [...players.values()].find((p) => p.username === 'PB');
  if (A.completion !== B.completion) fail(`completion differs: ${A.completion} vs ${B.completion}`);
  else ok('a solve on try 3 earns the same completion (and so the same IQ) as try 1');
  if (!(A.placement > B.placement)) fail('placement did not separate them');
  else ok('placement is what the attempt count moves');
  if (A.tries !== 1 || B.tries !== 3) fail(`tries carried through wrong: ${A.tries}/${B.tries}`);
  else ok('tries reaches the board payload');
  // Tie groups must not average two runs the comparator separated.
  if (A.rank === B.rank) fail('different attempt counts shared a rank');
  else ok('different attempt counts do not share an averaged rank');
}

// ---- 7. plan internals --------------------------------------------------------
console.log('\nplan');
{
  const Q = 'four-8-12-26';
  // Draw on try 1, win on try 3: a 3-try SOLVER, not a drawer.
  const rows = [row(Q, 'X', 4, { t: 10 }), row(Q, 'X', 0, { t: 10, prog: 2 }), row(Q, 'X', 10, { t: 10 })];
  const plan = endGamePlan(rows);
  const chosen = rows.filter((r) => plan.chosen.has(r));
  if (chosen.length !== 1) fail(`chosen ${chosen.length} rows for one player`);
  else if (plan.info.get(chosen[0]).tier !== 0 || plan.info.get(chosen[0]).tries !== 3)
    fail(`drew then won read as ${JSON.stringify(plan.info.get(chosen[0]))}`);
  else ok('a player who drew then won is a 3-try solver, not a drawer');
  if (plan.info.size !== rows.length) fail('info does not cover every row');
  else ok('info covers every row, so the all-attempts view still sorts');
}

console.log(BAD ? `\n${BAD} FAILURE(S)` : '\nEnd Game board verified.');
process.exit(BAD ? 1 : 0);
