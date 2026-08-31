#!/usr/bin/env node
// THE ROOT CAUSE OF ~150 UNREADABLE ELEMENTS: app/DailyRules.jsx.
//
// The DOM audit kept reporting the same shape on 24 games — around ten
// unreadable text nodes each, and a light card — and two client-level sweeps
// barely moved it. That is because none of it is in the clients: DailyRules is
// the SHARED gate and rules body every daily renders, and it hardcodes T.ink,
// T.white, T.muted, near-black rules and four pale state chips.
//
// A per-client codemod can never reach a shared component. That is the lesson;
// the audit found it because it measures the rendered page rather than grepping
// for spellings in files I chose to look at.
//
// Fixed with CSS VARIABLES, so DailyRules needs no STAGE prop and no knowledge
// of where it is mounted: `var(--stg-ink, ${T.ink})` is the stage token inside
// .stage-page and T.ink everywhere else.
//
// The four state chips (good / warn / bad / grey) keep their BORDER and their
// INK, because those carry the meaning, and give up only their pale fill. A
// warning still reads as a warning; it just stops being the brightest thing on
// a near-black page.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2];
if (!ROOT) { console.error('usage: patch-dailyrules-stage.mjs <repo-root>'); process.exit(1); }
const P = 'app/DailyRules.jsx';
let TOTAL = 0;
let s = fs.readFileSync(path.join(ROOT, P), 'utf8');
const sub = (find, repl, label, expect = 1) => {
  const n = s.split(find).length - 1;
  if (n !== expect) throw new Error(`${label}: matched ${n}, expected ${expect}`);
  TOTAL += n; s = s.split(find).join(repl);
};

// The state chips: border and ink keep their meaning, the fill gives way.
sub(`  good: { background: '#dcfce7', border: '1.5px solid #15803d', color: '#14532d' },
  warn: { background: '#fef3c7', border: '1.5px solid #b45309', color: '#78350f' },
  bad: { background: '#fee2e2', border: '1.5px solid #b91c1c', color: '#7f1d1d' },
  grey: { background: '#eef2f7', border: '1.5px solid #94a3b8', color: '#3f4757' },`,
  `  // Each chip keeps its BORDER and its INK, which is where the meaning lives,
  // and gives up only the pale fill: on the stage that fill was the brightest
  // thing on a near-black page. --stg-chip is undefined off the stage, so the
  // fallback is the original wash and the Loft is untouched.
  good: { background: 'var(--stg-chip, #dcfce7)', border: '1.5px solid #15803d', color: 'var(--stg-ink, #14532d)' },
  warn: { background: 'var(--stg-chip, #fef3c7)', border: '1.5px solid #b45309', color: 'var(--stg-ink, #78350f)' },
  bad: { background: 'var(--stg-chip, #fee2e2)', border: '1.5px solid #b91c1c', color: 'var(--stg-ink, #7f1d1d)' },
  grey: { background: 'var(--stg-chip, #eef2f7)', border: '1.5px solid #94a3b8', color: 'var(--stg-ink2, #3f4757)' },`,
  'state chips');

// The composite chip object first: it CONTAINS the standalone substrings below,
// so substituting those first would destroy this anchor.
sub('{ background: accentSoft, border: `1.5px solid ${accent}`, color: accentDeep }',
  '{ background: `var(--stg-chip, ${accentSoft})`, border: `1.5px solid ${accent}`, color: `var(--stg-ink, ${accentDeep})` }',
  'accent chip');
sub('color: T.ink,', 'color: `var(--stg-ink, ${T.ink})`,', 'body ink');
sub('color: T.muted', 'color: `var(--stg-mute, ${T.muted})`', 'muted ink', 2);
sub('background: T.white,', 'background: `var(--stg-surf, ${T.white})`,', 'white cards', 2);
sub(`border: '1px solid rgba(28,30,36,0.12)',`,
  `border: '1px solid var(--stg-line, rgba(28,30,36,0.12))',`, 'card rules', 2);
// The accent wash is a pale tint of the GAME's own accent, which is off-palette
// on a page whose only colour is the category step. The accent BORDER stays,
// so the callout still reads as the accent's.
sub('background: accentSoft,', 'background: `var(--stg-chip, ${accentSoft})`,', 'accent wash');
sub('color: accentDeep,', 'color: `var(--stg-ink, ${accentDeep})`,', 'accent ink');

fs.writeFileSync(path.join(ROOT, P), s);
console.log(`patch-dailyrules-stage: ${TOTAL} edits`);
