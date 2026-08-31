#!/usr/bin/env node
// THE FURNITURE IS SHARED; ONLY THE BOARD IS PER GAME.
//
//   node scripts/patch-stage-furniture.mjs <root> atlas biz flank ...
//
// audit-stage-residue.mjs ranks the unconverted dailies by how many light
// surfaces they paint, and eleven of them share one identical fingerprint:
// var(--white)x1 COLORS.cream/paperx2 T.whitex2. Reading them side by side, all
// five sites are the SAME five objects in every client, because they are the
// Loft furniture rather than anything to do with the game:
//
//   1. the game's own button rule (.xx-btn, background:var(--white))
//   2. the start gate card            (COLORS.cream + a 2px ink border)
//   3. the stat card                  (T.white + ink border + hard shadow)
//   4. the how-to-play modal          (T.white)
//   5. the rules modal                (COLORS.cream)
//
// So this is not 76 pieces of per-game work, it is one patch run 76 times.
// What is genuinely per game is the BOARD, which is what the residue count
// above 5 measures.
//
// Run AFTER patch-stage-chrome.mjs on the same client: this relies on the
// STAGE / INK / SURF / SURF_B names that converter declares.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2];
const GAMES = process.argv.slice(3);
if (!ROOT || !GAMES.length) {
  console.error('usage: patch-stage-furniture.mjs <repo-root> <game>...');
  process.exit(1);
}

// Each rule is [label, find, replace]. `find` may be a string or a RegExp; a
// RegExp must match exactly once, for the same reason every anchor in this
// project must: zero means the client is shaped differently and needs looking
// at, two means the edit would land somewhere it was not meant to.
const RULES = [
  ['start gate card',
    `style={{ background: COLORS.cream, border: \`2px solid \${COLORS.ink}\`, borderRadius: 12, padding: '22px', display: 'flex', flexDirection: 'column' }}`,
    `style={{ background: STAGE ? SURF : COLORS.cream, border: STAGE ? \`1px solid \${SURF_B}\` : \`2px solid \${COLORS.ink}\`, borderRadius: 12, padding: '22px', display: 'flex', flexDirection: 'column' }}`],

  ['stat card',
    `style={{ background: T.white, border: \`2px solid \${COLORS.ink}\`, borderRadius: 10, padding: '13px 15px 15px', boxShadow: '5px 5px 0 rgba(28,30,36,0.16)', marginBottom: 12 }}`,
    `style={{ background: STAGE ? SURF : T.white, border: STAGE ? \`1px solid \${SURF_B}\` : \`2px solid \${COLORS.ink}\`, borderRadius: 10, padding: '13px 15px 15px', boxShadow: STAGE ? 'none' : '5px 5px 0 rgba(28,30,36,0.16)', marginBottom: 12 }}`],

  ['how-to-play modal',
    `style={{ background: T.white, borderRadius: 14, maxWidth: 430, width: '100%', padding: '22px 22px 16px', fontFamily: SANS, border: '1.5px solid rgba(20,22,28,0.12)' }}`,
    `style={{ background: STAGE ? 'var(--stg-raise,#0e131f)' : T.white, borderRadius: 14, maxWidth: 430, width: '100%', padding: '22px 22px 16px', fontFamily: SANS, border: STAGE ? '1px solid var(--stg-line)' : '1.5px solid rgba(20,22,28,0.12)' }}`],

  ['rules modal',
    `style={{ width: '100%', maxWidth: 460, background: COLORS.cream, borderRadius: 12, border: \`2px solid \${COLORS.ink}\`, padding: '20px 22px', fontFamily: SANS, maxHeight: '86vh', overflowY: 'auto' }}`,
    `style={{ width: '100%', maxWidth: 460, background: STAGE ? 'var(--stg-raise,#0e131f)' : COLORS.cream, borderRadius: 12, border: STAGE ? '1px solid var(--stg-line)' : \`2px solid \${COLORS.ink}\`, padding: '20px 22px', fontFamily: SANS, maxHeight: '86vh', overflowY: 'auto' }}`],

  // The button rule lives in the client's own CSS template. Its bound is [^\n]
  // and NOT [^}], because these rules interpolate ${SANS} and a } bound stops
  // at the closing brace of that expression instead of the rule. That exact
  // mistake made an earlier sweep silently match nothing on two clients.
  ['button rule',
    /(\.[a-z]{2,3}-btn\{font-family:\$\{SANS\};[^\n]*?)border:2px solid var\(--blue-deep\);background:var\(--white\);color:var\(--blue-deep\);/,
    `$1border:2px solid \${STAGE ? 'var(--stg-line2)' : 'var(--blue-deep)'};background:\${STAGE ? 'transparent' : 'var(--white)'};color:\${STAGE ? 'var(--stg-ink)' : 'var(--blue-deep)'};`],
];

let files = 0;
let edits = 0;
const skipped = [];

for (const game of GAMES) {
  const dir = path.join(ROOT, 'app', game);
  const name = fs.readdirSync(dir).find((f) => /^[A-Z][A-Za-z]*Client\.jsx$/.test(f));
  if (!name) { skipped.push(`${game}: no client`); continue; }
  const rel = path.join('app', game, name);
  let src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  if (!/const STAGE = isStage\(/.test(src)) { skipped.push(`${game}: chrome not converted yet`); continue; }

  const before = src;
  const misses = [];
  for (const [label, find, repl] of RULES) {
    if (typeof find === 'string') {
      const n = src.split(find).length - 1;
      if (n === 0) { misses.push(label); continue; }
      if (n > 1) throw new Error(`${game} ${label}: matched ${n} times`);
      src = src.replace(find, repl); edits++;
    } else {
      const g = new RegExp(find.source, find.flags + 'g');
      const n = (src.match(g) || []).length;
      if (n === 0) { misses.push(label); continue; }
      if (n > 1) throw new Error(`${game} ${label}: matched ${n} times`);
      src = src.replace(find, repl); edits++;
    }
  }
  if (src !== before) { fs.writeFileSync(path.join(ROOT, rel), src); files++; }
  // A miss is REPORTED, never fatal: a client that shapes one of these five
  // differently still gets the other four, and the report says what to look at.
  console.log(`${misses.length ? '…' : '  '} ${game.padEnd(10)} ${5 - misses.length}/5${misses.length ? '  missing: ' + misses.join(', ') : ''}`);
}

for (const s of skipped) console.log(`✗ ${s}`);
console.log(`\npatch-stage-furniture: ${edits} edits across ${files} files`);
if (skipped.length) process.exitCode = 1;
