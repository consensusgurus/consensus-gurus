#!/usr/bin/env node
// THE CONVERTER'S TEXT REPLACEMENTS WERE NOT SCOPE-AWARE.
//
// Step 9 rewrites `color: COLORS.faded` to `color: FADED` across the whole
// file. INK / FADED / ACC / ACC_DEEP are declared INSIDE the main client
// component, so any occurrence ABOVE that declaration is either a temporal dead
// zone or, worse, a plain ReferenceError: several clients define helper
// components higher up the file, and from inside one of those the main
// component's const is not an ancestor scope at all, it simply does not exist.
//
// Etch has a gallery component around line 215 that ended up reading FADED and
// ACC. That is `ReferenceError: FADED is not defined` the moment the gallery
// renders. esbuild parses it happily, which is the same shape as the TDZ trap
// already recorded for the Loft rollout: the name is fine on paper and only
// wrong when it runs.
//
// Two things here:
//   1. revert every such occurrence in the already-converted clients, and
//   2. add the positional guard to the converter, so its replacements only
//      apply BELOW the line that declares the name.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2];
const GAMES = process.argv.slice(3);
if (!ROOT) { console.error('usage: patch-stage-scope-guard.mjs <root> [game...]'); process.exit(1); }

const NAMES = { INK: 'COLORS.ink', FADED: 'COLORS.faded', ACC: 'COLORS.accent', ACC_DEEP: 'COLORS.accentDeep' };

let reverted = 0;
for (const game of GAMES) {
  const dir = path.join(ROOT, 'app', game);
  const name = fs.readdirSync(dir).find((f) => /^[A-Z][A-Za-z]*Client\.jsx$/.test(f));
  if (!name) continue;
  const rel = path.join('app', game, name);
  const lines = fs.readFileSync(path.join(ROOT, rel), 'utf8').split('\n');

  const declAt = {};
  lines.forEach((l, i) => {
    const m = l.match(/^\s*const\s+(INK|FADED|ACC|ACC_DEEP)\s*=/);
    if (m && declAt[m[1]] === undefined) declAt[m[1]] = i;
  });

  let n = 0;
  for (const [id, original] of Object.entries(NAMES)) {
    const d = declAt[id];
    if (d === undefined) continue;
    const word = new RegExp(String.raw`(?<![\w$.])${id}(?![\w$])`, 'g');
    for (let i = 0; i < d; i++) {
      if (!word.test(lines[i])) { word.lastIndex = 0; continue; }
      word.lastIndex = 0;
      lines[i] = lines[i].replace(word, original);
      n++;
    }
  }
  if (n) {
    fs.writeFileSync(path.join(ROOT, rel), lines.join('\n'));
    reverted += n;
    console.log(`  ${game}: ${n} line(s) reverted to COLORS.* (used above their declaration)`);
  }
}

// -------------------------------------------------------------- the converter
{
  const p = path.join(ROOT, 'scripts/patch-stage-chrome.mjs');
  let s = fs.readFileSync(p, 'utf8');
  const FIND = `countedReplace('inline ink text', /(?<![-\\w])color: COLORS\\.ink\\b/g, 'color: INK');`;
  if (s.split(FIND).length - 1 !== 1) throw new Error('converter: step 9 anchor not found exactly once');
  s = s.replace(FIND,
`// THESE REPLACEMENTS ARE SCOPE-BOUND. INK / FADED / ACC are declared inside the
// main component, and several clients define helper components ABOVE it, where
// that const is not an ancestor scope at all. Rewriting a colour up there is not
// a dead zone, it is ReferenceError: FADED is not defined, and esbuild parses it
// happily. Etch had a gallery component reading two of them.
//
// So everything below only applies after the line that declares the name.
const belowDecl = (id, re, to) => {
  const at = s.split('\\n').findIndex((l) => new RegExp('^\\\\s*const\\\\s+' + id + '\\\\s*=').test(l));
  if (at < 0) return;
  const lines = s.split('\\n');
  let hits = 0;
  for (let i = at + 1; i < lines.length; i++) {
    const next = lines[i].replace(re, to);
    if (next !== lines[i]) { hits += 1; lines[i] = next; }
  }
  s = lines.join('\\n');
  n += hits;
  console.log(\`  · \${id} text (below decl): \${hits}\`);
};
belowDecl('INK', /(?<![-\\w])color: COLORS\\.ink\\b/g, 'color: INK');`);

  for (const [id, from, to] of [
    ['FADED', `countedReplace('inline faded text', /(?<![-\\w])color: COLORS\\.faded\\b/g, 'color: FADED');`, `belowDecl('FADED', /(?<![-\\w])color: COLORS\\.faded\\b/g, 'color: FADED');`],
    ['INK_CSS', `countedReplace('css ink text', /(?<![-\\w])color:\\$\\{COLORS\\.ink\\}/g, 'color:\${INK}');`, `belowDecl('INK', /(?<![-\\w])color:\\$\\{COLORS\\.ink\\}/g, 'color:\${INK}');`],
    ['FADED_CSS', `countedReplace('css faded text', /(?<![-\\w])color:\\$\\{COLORS\\.faded\\}/g, 'color:\${FADED}');`, `belowDecl('FADED', /(?<![-\\w])color:\\$\\{COLORS\\.faded\\}/g, 'color:\${FADED}');`],
  ]) {
    if (s.split(from).length - 1 !== 1) throw new Error(`converter: ${id} anchor not found exactly once`);
    s = s.replace(from, to);
  }
  // The accent pair sits in its own conditional block.
  for (const [from, to] of [
    [`  countedReplace('inline accent text', /(?<![-\\w])color: COLORS\\.accent\\b/g, 'color: ACC');`,
     `  belowDecl('ACC', /(?<![-\\w])color: COLORS\\.accent\\b/g, 'color: ACC');`],
    [`  countedReplace('inline accentDeep text', /(?<![-\\w])color: COLORS\\.accentDeep\\b/g, 'color: ACC_DEEP');`,
     `  belowDecl('ACC_DEEP', /(?<![-\\w])color: COLORS\\.accentDeep\\b/g, 'color: ACC_DEEP');`],
  ]) {
    if (s.split(from).length - 1 !== 1) throw new Error('converter: accent anchor not found exactly once');
    s = s.replace(from, to);
  }
  fs.writeFileSync(p, s);
  console.log('  converter: step 9 is now scope-bound');
}

console.log(`\npatch-stage-scope-guard: ${reverted} occurrence(s) reverted`);
