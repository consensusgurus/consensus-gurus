#!/usr/bin/env node
// whittle-mutation-test — prove scripts/verify-whittle.mjs actually bites.
//
//   node scripts/whittle-mutation-test.mjs
//
// A checker that has never been shown to FAIL has not been tested. This breaks
// the Whittle bank ten ways, one at a time, and requires the real verifier to
// reject every one of them, through its VERIFY_WHITTLE_BANK override.
//
// It runs against a MINI BANK, the last few boards of the real one renumbered
// from 1, for a reason worth keeping: the verifier enumerates every position a
// board can reach, so the full bank takes about two minutes and ten mutations
// of it would take twenty. The mini bank is cut from the END so it keeps real
// runway, because a bank the verifier rejects for running out would report
// every mutation as "caught" while proving nothing. The baseline run below is
// what checks that: if the unmutated mini bank does not PASS, the whole test is
// meaningless and it says so and stops.
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const verifier = join(here, 'verify-whittle.mjs');
const dir = mkdtempSync(join(tmpdir(), 'whittle-mut-'));

const src = readFileSync(join(root, 'app/whittle/puzzles.js'), 'utf8');
const head = `${src.slice(0, src.indexOf('export const PUZZLES = ['))}export const PUZZLES = [\n`;
const blocks = src.split('\n  {\n').slice(1).map((b) => `  {\n${b.split('\n  },')[0]}\n  },`);

const KEEP = 5;
const mini = blocks.slice(-KEEP).map((b, i) => b.replace(/num: \d+,/, `num: ${i + 1},`));
const bankText = (arr) => `${head}${arr.join('\n')}\n];\n`;

let n = 0;
function run(label, arr, wantPass) {
  const p = join(dir, `bank-${n++}.js`);
  writeFileSync(p, bankText(arr));
  let passed = true;
  try {
    execFileSync('node', [verifier], { env: { ...process.env, VERIFY_WHITTLE_BANK: p }, stdio: 'pipe', timeout: 600000 });
  } catch (e) { passed = false; }
  const ok = passed === wantPass;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${label}${ok ? '' : `  (expected ${wantPass ? 'pass' : 'failure'}, got ${passed ? 'pass' : 'failure'})`}`);
  return ok;
}

// A mutation helper that edits ONE board of the mini bank.
const bend = (idx, fn) => mini.map((b, i) => (i === idx ? fn(b) : b));
const bump = (b, field, by) => b.replace(new RegExp(`(${field}: )(\\d+)`), (_, p, v) => p + (Number(v) + by));
// Edit the `given` (or `sol`) row array in place. Addressing a cell by regex is
// what made the first draft of the lift-a-clue case a NO-OP: the square it
// zeroed was already empty, the bank came back byte-identical, and the verifier
// was reported as having missed a mutation nobody had actually made. Any
// mutation that can silently equal the original is not a test.
const onArray = (b, field, fn) => {
  const m = b.match(new RegExp(`${field}: (\\[\\[[^\\n]*\\]\\])`));
  return b.replace(m[1], fn(m[1]));
};
const firstClue = (arr) => arr.replace(/[1-6]/, '0');            // lift the first printed clue
const firstBlank = (arr, digit) => arr.replace(/(?<=[[,])0/, String(digit)); // print into the first empty square

console.log('whittle-mutation-test');
let all = run('baseline: the unmutated mini bank passes', mini, true);
if (!all) {
  console.error('\nThe baseline FAILED, so every "caught" below would be meaningless. Stopping.');
  process.exit(1);
}

const cases = [
  // The two measured fields, which are the whole claim of the bank.
  ['perfect claims one clue fewer than the search reaches', bend(1, (b) => bump(b, 'perfect', -1))],
  ['perfect claims one clue more', bend(2, (b) => bump(b, 'perfect', 1))],
  ['forgive is off by 40 per mille', bend(1, (b) => bump(b, 'forgive', 40))],
  // The board itself.
  ['a clue is lifted out of the opening board', bend(0, (b) => onArray(b, 'given', firstClue))],
  ['a nineteenth digit is printed into an empty square', bend(3, (b) => onArray(b, 'given', (a) => firstBlank(a, 3)))],
  ['the solution repeats a digit in a row', bend(2, (b) => onArray(b, 'sol', (a) => a.replace(/^\[\[(\d),(\d)/, (m, x) => `[[${x},${x}`)))],
  // The calendar and the ramp.
  ['a board is dated a day late, so it lands on the wrong weekday band', bend(4, (b) => b.replace(/live: '(\d{4})-(\d{2})-(\d{2})'/, (m, y, mo, d) => `live: '${y}-${mo}-${String(Number(d) + 1).padStart(2, '0')}'`))],
  ['sunday is flagged on a weekday', bend(1, (b) => b.replace('sunday: false', 'sunday: true'))],
  ['a quizId does not match its own date', bend(0, (b) => b.replace(/quizId: 'whittle-(\d+)-/, 'quizId: \'whittle-1-'))],
  // Variety.
  ['two boards share a solution grid', (() => {
    const solOf = (b) => b.match(/sol: \[[^\n]*\]/)[0];
    return mini.map((b, i) => (i === 3 ? b.replace(/sol: \[[^\n]*\]/, solOf(mini[0])) : b));
  })()],
];

for (const [label, arr] of cases) all = run(label, arr, false) && all;

console.log(all ? '\nwhittle-mutation-test: every mutation caught' : '\nwhittle-mutation-test: FAILURES above');
process.exit(all ? 0 : 1);
