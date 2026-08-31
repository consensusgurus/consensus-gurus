#!/usr/bin/env node
// Strata was the one client in the residue-5 batch whose five light surfaces
// are not the shared furniture, so the generic patch matched none of them. Its
// board is a field of absolutely positioned tiles rather than a grid, and its
// button and cards are shaped a little differently. Four sites, by hand.
//
// The tile STATES keep their own colours. .on is the accent, .lift is green
// and .bad is red, and all three carry meaning about what the tile is doing;
// re-grounding them would make a resting tile and a selected one read the
// same. Only the RESTING tile becomes a stage surface.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2];
if (!ROOT) { console.error('usage: patch-strata-board.mjs <repo-root>'); process.exit(1); }
const P = 'app/strata/StrataClient.jsx';
let TOTAL = 0;
let s = fs.readFileSync(path.join(ROOT, P), 'utf8');
function one(find, repl, label) {
  const n = s.split(find).length - 1;
  if (n !== 1) throw new Error(`${label}: matched ${n}, expected 1`);
  TOTAL++; s = s.replace(find, repl);
}

// The button. Bound on [^\n], never [^}]: the rule interpolates ${SANS}.
one(`border:2px solid \${COLORS.accentDeep};background:var(--white);color:\${COLORS.accentDeep};`,
  `border:2px solid \${STAGE ? 'var(--stg-line2)' : COLORS.accentDeep};background:\${STAGE ? 'transparent' : 'var(--white)'};color:\${STAGE ? 'var(--stg-ink)' : COLORS.accentDeep};`,
  'strata button');

// The resting tile.
one(`            background:var(--white);border:1px solid rgba(28,30,36,0.15);color:\${INK};`,
  `            background:\${STAGE ? 'var(--stg-surf)' : 'var(--white)'};border:1px solid \${STAGE ? 'var(--stg-line)' : 'rgba(28,30,36,0.15)'};color:\${INK};`,
  'strata tile');

// The clue card above the board.
one(`<div style={{ background: T.white, border: '1px solid rgba(28,30,36,0.14)', borderRadius: 12, padding: '20px 22px', margin: '4px 0 14px' }}>`,
  `<div style={{ background: STAGE ? SURF : T.white, border: STAGE ? \`1px solid \${SURF_B}\` : '1px solid rgba(28,30,36,0.14)', borderRadius: 12, padding: '20px 22px', margin: '4px 0 14px' }}>`,
  'strata clue card');

// The modal.
one(`style={{ background: T.white, borderRadius: 13, padding: '20px 22px', maxWidth: 470, fontFamily: SANS }}`,
  `style={{ background: STAGE ? 'var(--stg-raise,#0e131f)' : T.white, borderRadius: 13, padding: '20px 22px', maxWidth: 470, fontFamily: SANS, border: STAGE ? '1px solid var(--stg-line)' : undefined }}`,
  'strata modal');

fs.writeFileSync(path.join(ROOT, P), s);
console.log(`patch-strata-board: ${TOTAL} edits`);
