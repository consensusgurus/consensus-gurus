#!/usr/bin/env node
// Does verify-sixes actually catch anything? Prove it.
//
//   node scripts/sixes-mutation-test.mjs
//
// A checker nobody has tried to fool is a checker nobody has tested. This
// breaks the shipped bank fifteen different ways, one at a time, and requires
// verify-sixes.mjs to fail on every one of them and to pass on the untouched
// bank. It caught a real gap the first time it ran: a "symmetry broken"
// mutation that silently did nothing, which had made the symmetry check look
// like it was passing when it had never been exercised.
//
// Deliberately NOT named verify-*.mjs, so scripts/verify-all.mjs does not pick
// it up as a bank checker. Run it by hand after any change to verify-sixes.mjs.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const bankPath = join(root, 'app/sixes/puzzles.js');
const src = readFileSync(bankPath, 'utf8');
const vsrc = readFileSync(join(here, 'verify-sixes.mjs'), 'utf8');
const { PUZZLES } = await import(`file://${bankPath}`);
const base = JSON.parse(JSON.stringify(PUZZLES));
const dir = join(tmpdir(), 'sixes-mutation-test');
mkdirSync(dir, { recursive: true });

const at = (g, i) => g[(i / 6) | 0][i % 6];
const set = (g, i, v) => { g[(i / 6) | 0][i % 6] = v; };

const MUTATIONS = {
  'clue contradicts the solution': (P) => {
    for (let i = 0; i < 36; i++) if (at(P[3].given, i)) { set(P[3].given, i, (at(P[3].given, i) % 6) + 1); return; }
  },
  'a symmetric clue pair removed (2+ solutions)': (P) => {
    const p = P[5];
    for (let i = 0; i < 18; i++) if (at(p.given, i)) { set(p.given, i, 0); set(p.given, 35 - i, 0); p.clues -= 2; return; }
  },
  'a redundant clue pair added': (P) => {
    const p = P[7];
    for (let i = 0; i < 36; i++) {
      const j = 35 - i;
      if (!at(p.given, i) && !at(p.given, j)) { set(p.given, i, at(p.sol, i)); set(p.given, j, at(p.sol, j)); p.clues += 2; return; }
    }
  },
  'symmetry broken (one lone clue added)': (P) => {
    const p = P[9];
    for (let i = 0; i < 36; i++) {
      if (!at(p.given, i) && !at(p.given, 35 - i)) { set(p.given, i, at(p.sol, i)); p.clues += 1; return; }
    }
  },
  'stored cost wrong': (P) => { P[11].cost += 1; },
  'stored level wrong': (P) => { P[13].level = 1; },
  'stored clue count wrong': (P) => { P[15].clues += 1; },
  'sunday flag on a weekday': (P) => { P[17].sunday = true; },
  'sunday flag missing': (P) => { P.find((x) => x.sunday).sunday = false; },
  'a board in the wrong weekday band': (P) => {
    const a = P.findIndex((p) => p.live === '2026-08-17');
    const b = P.findIndex((p) => p.live === '2026-08-22');
    for (const k of ['given', 'sol', 'cost', 'level', 'clues']) { const t = P[a][k]; P[a][k] = P[b][k]; P[b][k] = t; }
  },
  'duplicate solution grid': (P) => {
    for (const k of ['given', 'sol', 'cost', 'level', 'clues']) P[20][k] = JSON.parse(JSON.stringify(P[19][k]));
  },
  'a day missing from the run': (P) => { P.splice(30, 1); P.forEach((p, i) => { p.num = i + 1; }); },
  'wrong dateLabel': (P) => { P[33].dateLabel = 'August 1, 2026'; },
  'wrong quizId': (P) => { P[35].quizId = 'sixes-1-1-26'; },
  'solution repeats a digit in a row': (P) => { P[37].sol[0][0] = P[37].sol[0][1]; },
};

function run(bankSource) {
  writeFileSync(join(dir, 'puzzles.js'), bankSource);
  writeFileSync(join(dir, 'verify.mjs'), vsrc.replace("'../app/sixes/puzzles.js'", `'${join(dir, 'puzzles.js').replace(/\\/g, '/')}'`));
  const r = spawnSync(process.execPath, [join(dir, 'verify.mjs')], { encoding: 'utf8' });
  return { ok: r.status === 0, why: (r.stderr || '').split('\n').find((l) => l.startsWith('✗')) || '' };
}

let missed = 0;
for (const [name, fn] of Object.entries(MUTATIONS)) {
  const P = JSON.parse(JSON.stringify(base));
  fn(P);
  const r = run(`export const PUZZLES = ${JSON.stringify(P, null, 1)};\n`);
  if (r.ok) { missed++; console.log(`MISSED  ${name}`); }
  else console.log(`caught  ${name.padEnd(46)} ${r.why.slice(0, 96)}`);
}

const control = run(src);
console.log(`\ncontrol, the untouched bank: ${control.ok ? 'passes' : `FAILS — ${control.why}`}`);
if (missed || !control.ok) {
  console.error(`\n${missed} mutation(s) slipped through${control.ok ? '' : ' and the control failed'}`);
  process.exit(1);
}
console.log(`all ${Object.keys(MUTATIONS).length} mutations caught`);
