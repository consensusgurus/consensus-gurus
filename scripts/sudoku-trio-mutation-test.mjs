// Break the Towers, Mercury and Polka banks on purpose, and require each
// game's verifier to FAIL on every mutation and PASS on an untouched control.
//
//   node scripts/sudoku-trio-mutation-test.mjs
//
// Per the Sixes lesson (its symmetry mutation was a silent no-op, so the
// symmetry check had never once been exercised): a verifier check that has
// never seen a broken bank is not known to work. Each mutation below is
// applied to an in-memory copy of the real bank, written to a temp module,
// and the real verifier is run against it via its VERIFY_<GAME>_BANK
// override. Deliberately NOT named verify-*, so verify-all does not treat it
// as a bank.
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const HERE = new URL('.', import.meta.url).pathname;
const GAMES = {
  towers: {
    bank: new URL('../app/towers/puzzles.js', import.meta.url).pathname,
    verifier: join(HERE, 'verify-towers.mjs'),
    env: 'VERIFY_TOWERS_BANK',
    mutations: {
      'clue value lies': (P) => { const p = P[0]; const i = p.clues.left.findIndex((v) => v > 0); p.clues.left[i] = p.clues.left[i] === 1 ? 2 : 1; },
      'printed clue dropped (count pin + solvability)': (P) => { const p = P[3]; const i = p.clues.top.findIndex((v) => v > 0); p.clues.top[i] = 0; },
      'sunday flag flipped': (P) => { P[6].sunday = false; },
      'sol breaks the Latin square': (P) => { const p = P[1]; [p.sol[0][0], p.sol[0][1]] = [p.sol[0][1], p.sol[0][0]]; },
      'solution grid repeats': (P) => { P[7].sol = P[0].sol.map((r) => r.slice()); },
    },
  },
  mercury: {
    bank: new URL('../app/mercury/puzzles.js', import.meta.url).pathname,
    verifier: join(HERE, 'verify-mercury.mjs'),
    env: 'VERIFY_MERCURY_BANK',
    mutations: {
      'given disagrees with sol': (P) => {
        const p = P[0];
        outer: for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
          if (p.given[r][c]) { p.given[r][c] = (p.given[r][c] % 9) + 1; break outer; }
        }
      },
      'thermo reversed (not increasing)': (P) => { P[1].thermos[0].reverse(); },
      'given dropped (count pin)': (P) => {
        const p = P[2];
        outer: for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
          if (p.given[r][c]) { p.given[r][c] = 0; break outer; }
        }
      },
      'two thermos share a cell': (P) => { const p = P[3]; p.thermos[1] = p.thermos[0].slice(); },
      'sunday flag flipped': (P) => { P[6].sunday = false; },
    },
  },
  polka: {
    bank: new URL('../app/polka/puzzles.js', import.meta.url).pathname,
    verifier: join(HERE, 'verify-polka.mjs'),
    env: 'VERIFY_POLKA_BANK',
    mutations: {
      'a dot lies (0 -> white)': (P) => { const p = P[0]; const r = p.dots.h.findIndex((row) => row.includes(0)); p.dots.h[r][p.dots.h[r].indexOf(0)] = 1; },
      'a forced dot removed': (P) => { const p = P[1]; const r = p.dots.h.findIndex((row) => row.includes(1)); p.dots.h[r][p.dots.h[r].indexOf(1)] = 0; },
      'stored cost off': (P) => { P[2].cost += 4; },
      'sunday flag flipped': (P) => { P[6].sunday = false; },
      'sol breaks a unit': (P) => { const p = P[4]; [p.sol[0][0], p.sol[0][1]] = [p.sol[0][1], p.sol[0][0]]; },
    },
  },
};

const dir = mkdtempSync(join(tmpdir(), 'trio-mut-'));
let bad = 0;

function run(verifier, env, bankPath) {
  try {
    execFileSync('node', [verifier], { env: { ...process.env, [env]: bankPath }, stdio: 'pipe', timeout: 300000 });
    return 0;
  } catch (e) {
    return e.status == null ? -1 : e.status;
  }
}

for (const [game, cfg] of Object.entries(GAMES)) {
  const { PUZZLES } = await import(`file://${cfg.bank}`);
  // The first 8 boards (which include the first Sunday) are plenty to
  // exercise every check, and keep the 18 verifier runs fast.
  const clone = () => JSON.parse(JSON.stringify(PUZZLES.slice(0, 8)));

  const controlPath = join(dir, `${game}-control.mjs`);
  writeFileSync(controlPath, `export const PUZZLES = ${JSON.stringify(clone())};\n`);
  const ctrl = run(cfg.verifier, cfg.env, controlPath);
  if (ctrl !== 0) { console.log(`FAIL  ${game}: control (untouched bank) did not pass (exit ${ctrl})`); bad++; }
  else console.log(`ok    ${game}: control passes`);

  for (const [name, mutate] of Object.entries(cfg.mutations)) {
    const P = clone();
    mutate(P);
    const path = join(dir, `${game}-${name.replace(/[^a-z0-9]+/gi, '-')}.mjs`);
    writeFileSync(path, `export const PUZZLES = ${JSON.stringify(P)};\n`);
    const code = run(cfg.verifier, cfg.env, path);
    if (code === 0) { console.log(`FAIL  ${game}: mutation "${name}" was NOT caught`); bad++; }
    else console.log(`ok    ${game}: caught "${name}"`);
  }
}

console.log(bad ? `\n${bad} problem(s).` : '\nOK - every mutation caught, every control clean.');
process.exit(bad ? 1 : 0);
