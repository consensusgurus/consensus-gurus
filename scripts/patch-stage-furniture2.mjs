#!/usr/bin/env node
// MORE SHARED FURNITURE, found the same way as the first five: by running the
// residue audit after a batch and noticing that eleven games all owed exactly
// ONE light surface, and it was the same one in every case.
//
//   node scripts/patch-stage-furniture2.mjs <root> <game>...
//
//   6. the .xx-tool rule    white fill AND a near-black border, so it is
//                           invisible on the dark stage from both ends. Already
//                           fixed by hand on Mate and Hands before anyone
//                           noticed it was in eleven more.
//   7. the accent button    the .xx-btn variant that uses ${COLORS.accent}
//                           rather than var(--blue-deep). Same rule, different
//                           token, so the first pass matched none of them.
//   8. the compact modals   a shorter modal shape than the two the first pass
//                           knew, used by Turn.
//
// Every rule bounds on [^\n] and NEVER [^}], because these CSS rules interpolate
// ${SANS} and a } bound stops at the closing brace of that expression instead of
// the rule. That mistake silently matched nothing on two clients once already.
//
// Idempotent: a site the first pass already converted no longer matches, and a
// zero count for a rule is reported rather than fatal.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2];
const GAMES = process.argv.slice(3);
if (!ROOT || !GAMES.length) { console.error('usage: patch-stage-furniture2.mjs <root> <game>...'); process.exit(1); }

const RULES = [
  ['tool rule',
   /(\.[a-z]{2,3}-tool\{font-family:\$\{SANS\};[^\n]*?)border:1\.5px solid rgba\(28,30,36,0\.35\);background:var\(--white\);/,
   `$1border:1.5px solid \${STAGE ? 'var(--stg-line2)' : 'rgba(28,30,36,0.35)'};background:\${STAGE ? 'var(--stg-surf2)' : 'var(--white)'};`],

  ['accent button rule',
   /(\.[a-z]{2,3}-btn\{font-family:\$\{SANS\};[^\n]*?)border:2px solid \$\{COLORS\.(accent|accentDeep)\};background:var\(--white\);color:\$\{COLORS\.(?:accent|accentDeep)\};/,
   `$1border:2px solid \${STAGE ? 'var(--stg-line2)' : COLORS.$2};background:\${STAGE ? 'transparent' : 'var(--white)'};color:\${STAGE ? 'var(--stg-ink)' : COLORS.$2};`],

  ['compact modal (small)',
   /style=\{\{ background: COLORS\.cream, border: `2px solid \$\{COLORS\.ink\}`, borderRadius: 12, padding: 20, maxWidth: 380, fontFamily: SANS \}\}/,
   `style={{ background: STAGE ? 'var(--stg-raise,#0e131f)' : COLORS.cream, border: STAGE ? '1px solid var(--stg-line)' : \`2px solid \${COLORS.ink}\`, borderRadius: 12, padding: 20, maxWidth: 380, fontFamily: SANS }}`],

  ['compact modal (rules)',
   /style=\{\{ background: COLORS\.cream, border: `2px solid \$\{COLORS\.ink\}`, borderRadius: 12, padding: 20, maxWidth: 460, maxHeight: '86vh', overflowY: 'auto', fontFamily: SANS \}\}/,
   `style={{ background: STAGE ? 'var(--stg-raise,#0e131f)' : COLORS.cream, border: STAGE ? '1px solid var(--stg-line)' : \`2px solid \${COLORS.ink}\`, borderRadius: 12, padding: 20, maxWidth: 460, maxHeight: '86vh', overflowY: 'auto', fontFamily: SANS }}`],
];

let edits = 0;
for (const game of GAMES) {
  const dir = path.join(ROOT, 'app', game);
  const name = fs.readdirSync(dir).find((f) => /^[A-Z][A-Za-z]*Client\.jsx$/.test(f));
  if (!name) { console.log(`✗ ${game}: no client`); continue; }
  const rel = path.join('app', game, name);
  let s = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  if (!/const STAGE = isStage\(/.test(s)) { console.log(`✗ ${game}: chrome not converted`); continue; }
  let n = 0;
  for (const [label, find, repl] of RULES) {
    const g = new RegExp(find.source, find.flags + 'g');
    const hits = (s.match(g) || []).length;
    if (!hits) continue;
    if (hits > 1) throw new Error(`${game} ${label}: matched ${hits} times`);
    s = s.replace(find, repl); n++; edits++;
  }
  if (n) fs.writeFileSync(path.join(ROOT, rel), s);
  console.log(`  ${game.padEnd(9)} ${n}`);
}
console.log(`\npatch-stage-furniture2: ${edits} edits`);
