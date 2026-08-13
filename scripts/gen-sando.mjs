// Bank generator for Sando, the daily sandwich sudoku.
//
//   node scripts/gen-sando.mjs --days 90 --start 2026-08-13 [--seed 20260813]
//
// The RNG is seeded, so a rerun reproduces app/sando/puzzles.js byte for byte.
// NEVER edit a board by hand, and never regenerate one that has already gone live.
//
// Every board it emits is proved to
//   * have EXACTLY ONE solution, counted by an independent exhaustive solver, and
//   * be solvable with NO GUESSING, by a logical solver that only applies moves a
//     person can justify.
// scripts/verify-sando.mjs re-proves all of it against the shipped file with its
// OWN solvers and trusts none of the stored fields.
//
// THE WEEKDAY RAMP is the printed digits, and nothing else. Every board carries
// all eighteen border sums, because the sums are the game: a board with only a
// handful of them is a sudoku wearing a costume. So the knob is how much of the
// grid is handed to you, exactly as Suds and Quilt ramp their clue counts.
//
//   Mon 20 givens · Tue 18 · Wed 16 · Thu 14 · Fri 12 · Sat 10 · Sun 6
//
// Sunday is the Edition: six printed digits against a weekday floor of ten, so
// nearly the whole grid has to come out of the sandwich clues.
//
// THERE IS NO DIFFICULTY-LEVEL FIELD, unlike Cages, and that is a measured
// finding rather than an omission. The sandwich deduction is a full line-level
// propagation, and across thousands of trial boards it never once needed locked
// candidates or naked and hidden subsets to finish: a board either falls to the
// sandwich rule plus singles, or it does not fall at all. So the bank's claim is
// the simpler one, that every board is solvable with the sandwich rule and
// singles alone, and the verifier asserts exactly that.
import fs from 'node:fs';
import { rng, shuffle, fullSolution, LINES, sandwichOf, countSolutions, logicSolve } from './sando-core.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const DAYS = Number(arg('--days', 90));
const START = arg('--start', '2026-08-13');
const SEED = Number(arg('--seed', 20260813));
const OUT = arg('--out', 'app/sando/puzzles.js');

const GIVENS = { 1: 20, 2: 18, 3: 16, 4: 14, 5: 12, 6: 10, 0: 6 };
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const rnd = rng(SEED);
const chunk9 = (a) => Array.from({ length: 9 }, (_, r) => a.slice(r * 9, r * 9 + 9));

function buildBoard(nGivens) {
  for (let attempt = 0; attempt < 200000; attempt++) {
    const sol = fullSolution(rnd);
    const all = LINES.map((l) => sandwichOf(l, sol));
    const rowSums = all.slice(0, 9), colSums = all.slice(9);
    const given = new Array(81).fill(0);
    for (const i of shuffle([...Array(81).keys()], rnd).slice(0, nGivens)) given[i] = sol[i];
    // logic first: it is milliseconds and rejects most boards, where the
    // exhaustive count is the expensive call
    const line = logicSolve(given, rowSums, colSums, 1);
    if (!line || line.join('') !== sol.join('')) continue;
    if (countSolutions(given, rowSums, colSums, 2) !== 1) continue;
    return { sol, given, rowSums, colSums };
  }
  return null;
}

const boards = [];
const seenGiven = new Set(), seenSol = new Set();
const t0 = Date.now();
const d0 = new Date(`${START}T12:00:00Z`);

for (let i = 0; i < DAYS; i++) {
  const d = new Date(d0.getTime() + i * 86400000);
  const iso = d.toISOString().slice(0, 10);
  const dow = d.getUTCDay();
  const nGivens = GIVENS[dow];
  let got = null;
  for (let retry = 0; retry < 40 && !got; retry++) {
    const b = buildBoard(nGivens);
    if (!b) break;
    const gk = b.given.join(''), sk = b.sol.join('');
    if (seenGiven.has(gk) || seenSol.has(sk)) continue;
    seenGiven.add(gk); seenSol.add(sk);
    got = b;
  }
  if (!got) { console.error(`FAILED to build ${iso} (dow ${dow})`); process.exit(1); }
  const [y, m, day] = iso.split('-').map(Number);
  boards.push({
    num: i + 1,
    quizId: `sando-${m}-${day}-${String(y).slice(2)}`,
    live: iso,
    dateLabel: `${MONTHS[m - 1]} ${day}, ${y}`,
    sunday: dow === 0,
    clues: nGivens,
    rowSums: got.rowSums,
    colSums: got.colSums,
    given: got.given,
    sol: got.sol,
  });
  process.stderr.write(`${iso} dow${dow} givens=${nGivens} (${((Date.now() - t0) / 1000).toFixed(0)}s)\n`);
}

const header = `// Puzzle data for Sando, the daily SANDWICH SUDOKU. Imported ONLY by the server
// page (app/sando/page.js), which filters live<=today before passing puzzles to
// the client, so future boards and their solutions never ship to the browser.
//
// Sandwich sudoku is ordinary sudoku plus border sums. The number printed
// outside a row or column is the total of the digits lying strictly BETWEEN the
// 1 and the 9 in that line. The 1 and the 9 are the crusts and everything
// between them is the filling, so a clue of 0 says the crusts are next to each
// other and a clue of 35 says they sit at the two ends with all of 2-8 between.
// The clue says nothing about WHERE the sandwich is, which is the whole game:
// you work out where two particular digits sit before you can place anything.
//
// FIELDS
//   rowSums  the nine border sums down the left, one per row, 0 to 35.
//   colSums  the nine border sums across the top, one per column.
//            Every board carries all eighteen: the sums ARE the game, and a
//            board with only a handful of them is a sudoku wearing a costume.
//   given    the printed digits (0 = a square the player fills).
//   clues    how many digits are printed, and the whole difficulty ramp. Mon 20,
//            Tue 18, Wed 16, Thu 14, Fri 12, Sat 10, and the Sunday Edition at 6
//            against a weekday floor of ten.
//   sol      the full solution, used for the live check, the single hint, and
//            reveal-and-end. Ships only for live<=today boards, exactly like
//            every other daily's answers.
//
// AUTHORING RULES, all re-proved from scratch by scripts/verify-sando.mjs, which
// never trusts a stored field (per the daily puzzle authoring standard):
//   1. Exactly one solution, counted by an independent exhaustive solver.
//   2. No guessing: every board also falls to a logical solver limited to the
//      sandwich deduction plus naked and hidden singles. Uniqueness alone does
//      not make a board humanly solvable.
//   3. Every printed sum really is the sandwich total of its line in \`sol\`, and
//      every printed digit really is that square's answer.
//   4. Variety across the whole bank: no clue grid and no solution grid repeats.
//   5. Sunday flags land on real Sundays and print fewer digits than any weekday.
//
// Regenerate with: node scripts/gen-sando.mjs --days ${DAYS} --start ${START}
// The RNG is seeded, so a rerun reproduces this file byte for byte. NEVER edit a
// board by hand, and never rewrite a board that has already gone live.
export const PUZZLES = [
`;

const body = boards.map((b) => `  {
    num: ${b.num},
    quizId: '${b.quizId}',
    live: '${b.live}',
    dateLabel: '${b.dateLabel}',
    sunday: ${b.sunday},
    clues: ${b.clues},
    rowSums: ${JSON.stringify(b.rowSums)},
    colSums: ${JSON.stringify(b.colSums)},
    given: ${JSON.stringify(chunk9(b.given))},
    sol: ${JSON.stringify(chunk9(b.sol))},
  },`).join('\n');

fs.mkdirSync('app/sando', { recursive: true });
fs.writeFileSync(OUT, `${header}${body}\n];\n`);
console.error(`\nwrote ${OUT}: ${boards.length} boards in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
