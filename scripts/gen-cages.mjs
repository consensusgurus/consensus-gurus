// Bank generator for Cages, the daily killer sudoku.
//
//   node scripts/gen-cages.mjs --days 90 --start 2026-08-12 [--seed 20260812]
//
// The RNG is seeded, so a rerun reproduces app/cages/puzzles.js byte for byte.
// NEVER edit a board by hand, and never regenerate a board that has already gone
// live (see the daily puzzle authoring standard in CLAUDE.md).
//
// Every board it emits has been proved, from scratch, to
//   * have EXACTLY ONE solution, counted by an independent exhaustive solver, and
//   * be solvable with NO GUESSING, by a logical solver that only applies moves a
//     person can justify. Uniqueness alone does not make a board humanly
//     solvable, which is why both gates are here rather than just the first.
// scripts/verify-cages.mjs re-proves all of it against the shipped file and
// trusts none of the stored fields.
//
// THE WEEKDAY RAMP. A killer board carries no printed digits at all, so the
// difficulty knob is the cage partition itself: many small cages are generous
// (a 2-cell cage summing to 4 is 1+3 and nothing else), while few large ones
// give the arithmetic room to hide in. Monday therefore runs the most cages and
// caps them at three cells; the week walks that down; and Sunday is the only day
// of the week that prints a five-cell cage or drops under 29 of them.
//
// The toolkit a board NEEDS is pinned per day too, not merely capped. A floor is
// not a target (rule 11 of the authoring standard): left as a ceiling, roughly a
// tenth of the Saturday boards came out solvable with the beginner toolkit, which
// is a Monday wearing Saturday's cage count.
//
//   day  cages  max cage  toolkit
//   Mon   34       3      beginner exactly (cage combinations, singles, 45 rule)
//   Tue   33       3      beginner exactly
//   Wed   32       4      either
//   Thu   31       4      full exactly
//   Fri   30       4      full exactly
//   Sat   29       4      full exactly
//   Sun   27       5      full exactly     <- Sunday Edition
import fs from 'node:fs';
import { rng, fullSolution, makeCages, countSolutions, logicSolve } from './cages-core.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const DAYS = Number(arg('--days', 90));
const START = arg('--start', '2026-08-12');
const SEED = Number(arg('--seed', 20260812));
const OUT = arg('--out', 'app/cages/puzzles.js');

// [target cages, max cage size, lowest toolkit, highest toolkit] by JS day-of-week
const RAMP = {
  1: [34, 3, 1, 1], 2: [33, 3, 1, 1], 3: [32, 4, 1, 2], 4: [31, 4, 2, 2],
  5: [30, 4, 2, 2], 6: [29, 4, 2, 2], 0: [27, 5, 2, 2],
};
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const rnd = rng(SEED);
const chunk9 = (a) => Array.from({ length: 9 }, (_, r) => a.slice(r * 9, r * 9 + 9));

function buildBoard(target, maxSize, minLevel, maxLevel) {
  for (let attempt = 0; attempt < 200000; attempt++) {
    const sol = fullSolution(rnd);
    const mk = makeCages(sol, maxSize, target, rnd);
    if (!mk) continue;
    if (mk.cells.length !== target) continue;
    if (Math.max(...mk.cells.map((c) => c.length)) !== maxSize) continue;
    // logic first: it is milliseconds and rejects most layouts, where the
    // exhaustive count is the expensive call
    let level = 0;
    for (let L = 1; L <= maxLevel; L++) {
      const r = logicSolve(mk.cells, mk.sums, mk.owner, L);
      if (Array.isArray(r) && r.join('') === sol.join('')) { level = L; break; }
    }
    if (!level || level < minLevel) continue;
    if (countSolutions(mk.cells, mk.sums, mk.owner, 2) !== 1) continue;
    return { sol, mk, level, attempt };
  }
  return null;
}

const boards = [];
const seenLayout = new Set();
const seenSolution = new Set();
const t0 = Date.now();
const d0 = new Date(`${START}T12:00:00Z`);

for (let i = 0; i < DAYS; i++) {
  const d = new Date(d0.getTime() + i * 86400000);
  const iso = d.toISOString().slice(0, 10);
  const dow = d.getUTCDay();
  const [target, maxSize, minLevel, maxLevel] = RAMP[dow];
  let got = null;
  for (let retry = 0; retry < 40 && !got; retry++) {
    const b = buildBoard(target, maxSize, minLevel, maxLevel);
    if (!b) break;
    const layoutKey = b.mk.owner.join(',');
    const solKey = b.sol.join('');
    if (seenLayout.has(layoutKey) || seenSolution.has(solKey)) continue;
    seenLayout.add(layoutKey); seenSolution.add(solKey);
    got = b;
  }
  if (!got) { console.error(`FAILED to build ${iso} (dow ${dow})`); process.exit(1); }
  const [y, m, day] = iso.split('-').map(Number);
  boards.push({
    num: i + 1,
    quizId: `cages-${m}-${day}-${String(y).slice(2)}`,
    live: iso,
    dateLabel: `${MONTHS[m - 1]} ${day}, ${y}`,
    sunday: dow === 0,
    cages: got.mk.cells.length,
    big: Math.max(...got.mk.cells.map((c) => c.length)),
    cage: got.mk.owner,
    sums: got.mk.sums,
    sol: got.sol,
    level: got.level,
  });
  process.stderr.write(`${iso} dow${dow} cages=${got.mk.cells.length} big=${boards[i].big} lvl=${got.level} (${((Date.now() - t0) / 1000).toFixed(0)}s)\n`);
}

const header = `// Puzzle data for Cages, the daily KILLER SUDOKU. Imported ONLY by the server
// page (app/cages/page.js), which filters live<=today before passing puzzles to
// the client, so future boards and their solutions never ship to the browser.
//
// Killer sudoku is sudoku with the clues taken away and replaced by arithmetic.
// Rows, columns and 3x3 boxes still hold 1-9 exactly once, but NO digits are
// printed at all. Instead the 81 cells are partitioned into connected "cages",
// each printed with the total of the digits inside it, and no digit may repeat
// within a cage. The sums are the only clues there are.
//
// FIELDS
//   cage    9x9 map of cell -> cage index, the partition itself. Every cage is
//           connected, holds 2 to 5 cells, and never repeats a digit.
//   sums    the printed total for each cage, indexed to match \`cage\`.
//   sol     the full solution, used for the live check, the single hint, and
//           reveal-and-end. Ships only for live<=today boards, exactly like
//           every other daily's answers.
//   cages   how many cages the board has, and \`big\` the largest cage's size.
//           Together they ARE the difficulty ramp: many small cages is generous,
//           few large ones is not. Weekdays run 29-34 cages capped at 4 cells on
//           a Monday-to-Saturday ramp; Sundays are a harder Edition at 27 cages
//           with a 5-cell cage, and Sunday is the ONLY day that gets either.
//   level   the toolkit the board needs: 1 = cage combinations, singles and the
//           45 rule; 2 = also locked candidates, naked and hidden subsets, and
//           the 45 rule over two leftover cells. Monday and Tuesday are always 1,
//           Thursday through Sunday are always 2, and Wednesday is the crossover.
//
// AUTHORING RULES, all re-proved from scratch by scripts/verify-cages.mjs, which
// never trusts a stored field (per the daily puzzle authoring standard):
//   1. Exactly one solution, counted by an independent exhaustive solver.
//   2. No guessing: every board also falls to a logical solver that only applies
//      justifiable moves. Uniqueness alone does not make a board solvable.
//   3. A real killer board: connected cages of 2 to 5 cells partitioning all 81,
//      no repeated digit inside a cage, and every printed sum equal to the sum
//      of its cells in the solution.
//   4. Variety across the whole bank: no cage layout repeats, and no solution
//      grid repeats.
//   5. Sunday flags land on real Sundays and carry the documented scaling.
//
// Regenerate with: node scripts/gen-cages.mjs --days ${DAYS} --start ${START}
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
    cages: ${b.cages},
    big: ${b.big},
    level: ${b.level},
    cage: ${JSON.stringify(chunk9(b.cage))},
    sums: ${JSON.stringify(b.sums)},
    sol: ${JSON.stringify(chunk9(b.sol))},
  },`).join('\n');

fs.mkdirSync('app/cages', { recursive: true });
fs.writeFileSync(OUT, `${header}${body}\n];\n`);
console.error(`\nwrote ${OUT}: ${boards.length} boards in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
