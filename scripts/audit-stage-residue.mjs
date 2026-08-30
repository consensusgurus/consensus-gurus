// How much BOARD work does each daily still owe the stage?
//
//   node scripts/audit-stage-residue.mjs            every client, cheapest first
//   node scripts/audit-stage-residue.mjs suds mate  just these
//
// patch-stage-chrome.mjs converts the chrome of any client in one command. What
// it cannot do is the board, because a board's colours are per game and often
// carry meaning. This counts what is left: every LIGHT SURFACE a client paints,
// which is exactly what shows up as a bright box on a near-black ground.
//
// It counts BACKGROUNDS ONLY, and that is the point of the whole exercise. A
// near-black FILL is a perfectly good object on this ground and a light one is
// not, while TEXT colour is already handled generically. Counting every colour
// literal would report a number nobody can act on.
//
// The number is an ESTIMATE OF EFFORT, not a defect count. Zero means the
// chrome converter alone probably finishes that game; twenty means it has a
// board with a palette of its own, like Suds or Anon.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const only = process.argv.slice(2);

// A light surface, in a background position. Both spellings: the JSX style
// object (background: T.white) and the client's own CSS template
// (background:var(--white)).
const PATTERNS = [
  [/background(?:Color)?:\s*T\.white\b/g, 'T.white'],
  [/background(?:Color)?:\s*COLORS\.(?:cream|paper)\b/g, 'COLORS.cream/paper'],
  [/background:\s*var\(--white\)/g, 'var(--white)'],
  // #fff, #ffffff, and anything from #e00000 up: the pale end of the ramp.
  [/background(?:Color)?:\s*['"`]?#(?:fff(?:fff)?|[e-f][0-9a-f]{5}|[e-f][0-9a-f]{2})\b/gi, 'pale hex'],
];

function clients() {
  const out = [];
  for (const d of readdirSync(join(root, 'app'), { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    for (const f of readdirSync(join(root, 'app', d.name))) {
      if (/^[A-Z][A-Za-z]*Client\.jsx$/.test(f)) out.push(join('app', d.name, f));
    }
  }
  return out;
}

const rows = [];
for (const rel of clients()) {
  const game = basename(dirname(rel));
  if (only.length && !only.includes(game)) continue;
  const src = readFileSync(join(root, rel), 'utf8');
  // Only daily game clients: they all mount the Loft cap.
  if (!/from '\.\.\/LoftCap'/.test(src)) continue;
  const converted = /isStage\(/.test(src);
  // COUNT PER LINE AND SKIP THE CONVERTED ONES. A converted site reads
  // `background: STAGE ? 'transparent' : T.white`, which still contains the
  // literal, so a whole-file match reports work that is already done. Counting
  // that way said crux owed twelve when it owed eight, and a number nobody can
  // trust is worse than no number.
  const hits = {};
  let total = 0;
  const lines = src.split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (/STAGE\s*\?/.test(line)) continue;
    // A ternary written over three lines puts `STAGE ?` on the first and the
    // branches on their own, so the light branch reads as residue unless the
    // continuation is skipped. It is skipped ONLY when the line above it is
    // the STAGE test: a blanket skip of every `? {` and `: {` also hid a real
    // pale-pink error tint in Suds that has nothing to do with the stage, and
    // a filter that conceals defects is worse than one that over-reports.
    if (/^\s*[?:]\s*\{/.test(line)) {
      // Look back up to three non-blank lines, not one: the card wraps as
      // `style={STAGE` / `? {...}` / `: {...}`, so the light branch's nearest
      // neighbour is the DARK branch and the test is two lines up.
      let j = i - 1;
      let back = 0;
      while (j >= 0 && back < 3 && (!lines[j].trim() || !/\bSTAGE\b/.test(lines[j]))) { j -= 1; back += 1; }
      // The test is `\bSTAGE\b` and not `STAGE ?`, because the converted
      // board card wraps as `style={STAGE` with the `?` on the NEXT line.
      if (j >= 0 && /\bSTAGE\b/.test(lines[j])) continue;
    }
    for (const [re, label] of PATTERNS) {
      const n = (line.match(new RegExp(re.source, re.flags)) || []).length;
      if (n) { hits[label] = (hits[label] || 0) + n; total += n; }
    }
  }
  rows.push({ game, rel, total, hits, converted });
}

rows.sort((a, b) => a.total - b.total || a.game.localeCompare(b.game));

const done = rows.filter((r) => r.converted);
const todo = rows.filter((r) => !r.converted);

console.log(`${rows.length} daily clients, ${done.length} converted, ${todo.length} to go\n`);
console.log('CONVERTED (residue should be near zero; anything here is a miss)');
for (const r of done) {
  console.log(`  ${String(r.total).padStart(3)}  ${r.game.padEnd(10)} ${Object.entries(r.hits).map(([k, v]) => `${k}x${v}`).join(' ')}`);
}
console.log('\nTO GO, cheapest board first');
for (const r of todo) {
  console.log(`  ${String(r.total).padStart(3)}  ${r.game.padEnd(10)} ${Object.entries(r.hits).map(([k, v]) => `${k}x${v}`).join(' ')}`);
}
const free = todo.filter((r) => r.total === 0).map((r) => r.game);
console.log(`\n${free.length} game(s) with NO light surface at all: the chrome converter alone should finish them.`);
if (free.length) console.log('  ' + free.join(', '));
