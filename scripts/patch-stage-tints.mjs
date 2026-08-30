#!/usr/bin/env node
// The token sweep bucketed by ALPHA, which meant two whole classes slipped past it:
//
//   1. Literals that were never in the rgba(var(--stg-lift),a) channel form at all.
//      Crux's SPAL is the whole board palette and is written as plain white rgba,
//      so on the light register every empty cell was white on near-white. That is
//      the "doesn't render" screenshot.
//   2. ACCENT tints, written as rgba of the DARK ramp hue. On light the accent
//      moves to its dark twin, but a literal cannot move with it, so a selected
//      cell stayed a pale wash nobody could see.
//
// Alpha is not a role. A border at 0.08 is a hairline; a fill at 0.08 is a raised
// surface; and the same number means opposite things in the two registers.
// Accent tints derive from var(--stg-acc) via color-mix so they follow the accent
// into whichever register is showing.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2];
if (!ROOT) { console.error('usage: patch-stage-tints.mjs <repo-root>'); process.exit(1); }

let TOTAL = 0;
// Writes are BUFFERED and flushed only once every anchor has matched. A patch
// that throws half way through leaves a tree that is neither the old file nor
// the new one, and the next run then fails on an anchor it already applied,
// which reads exactly like origin having moved.
const PENDING = new Map();
const rd = (p) => (PENDING.has(p) ? PENDING.get(p) : fs.readFileSync(path.join(ROOT, p), 'utf8'));
const wr = (p, s) => { PENDING.set(p, s); };
const flush = () => { for (const [p, s] of PENDING) fs.writeFileSync(path.join(ROOT, p), s); };

// one() asserts the anchor is unique. A zero means origin moved under us; a two
// means the anchor is not specific enough and the edit would land twice.
function one(src, find, repl, label) {
  const n = src.split(find).length - 1;
  if (n !== 1) throw new Error(`${label}: anchor matched ${n} times, expected 1`);
  TOTAL++;
  return src.replace(find, repl);
}
function many(src, re, repl, expect, label) {
  const hits = src.match(new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g'));
  const n = hits ? hits.length : 0;
  if (n !== expect) throw new Error(`${label}: matched ${n}, expected ${expect}`);
  TOTAL += n;
  return src.replace(new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g'), repl);
}
const mix = (a) => `color-mix(in srgb, var(--stg-acc) ${Math.round(a * 100)}%, transparent)`;

// ---------------------------------------------------------------- 1. Crux SPAL
{
  const p = 'app/crux/CruxClient.jsx';
  let s = rd(p);
  s = one(s, `  const SPAL = STAGE ? {
    tile: 'rgba(255,255,255,0.045)',
    tileB: 'rgba(255,255,255,0.13)',
    sel: 'rgba(125,211,252,0.14)',
    selCur: 'rgba(125,211,252,0.26)',
    selB: 'rgba(125,211,252,0.5)',
    key: 'rgba(255,255,255,0.09)',
    keyB: '1.5px solid rgba(255,255,255,0.14)',
    spent: 'rgba(255,255,255,0.05)',
    spentInk: 'var(--stg-dim,#5a657d)',
  } : null;`,
  `  // Every value here is a ROLE, never a fixed alpha. An empty cell is a raised
  // surface, a spent one is inert, and the selection is a wash of whatever the
  // accent currently is, so all three follow the register instead of assuming
  // the ground is dark.
  const SPAL = STAGE ? {
    tile: 'var(--stg-surf)',
    tileB: 'var(--stg-line)',
    sel: '${mix(0.14)}',
    selCur: '${mix(0.26)}',
    selB: '${mix(0.5)}',
    key: 'var(--stg-surf2)',
    keyB: '1.5px solid var(--stg-line)',
    spent: 'var(--stg-panel)',
    spentInk: 'var(--stg-dim,#5a657d)',
  } : null;`, 'crux SPAL');
  wr(p, s);
}

// ------------------------------------------- 2. raw stage borders, all 4 clients
// STAGE ? '1px solid rgba(255,255,255,0.10|0.12)' : ... -> the hairline token.
for (const [p, expect] of [
  ['app/crux/CruxClient.jsx', 3],
  ['app/suds/SudsClient.jsx', 3],
  ['app/mate/MateClient.jsx', 3],
  ['app/anon/AnonClient.jsx', 3],
]) {
  let s = rd(p);
  s = many(s, /'1(?:\.5)?px solid rgba\(255,255,255,0\.1[02]\)'/g, `'1px solid var(--stg-line)'`, expect, `${p} raw stage border`);
  wr(p, s);
}

// ------------------------------------------------------- 3. Suds accent tints
{
  const p = 'app/suds/SudsClient.jsx';
  let s = rd(p);
  s = one(s, `'rgba(110,231,183,0.16)'`, `'${mix(0.16)}'`, 'suds sameVal tint');
  s = one(s, `'rgba(110,231,183,0.28)'`, `'${mix(0.28)}'`, 'suds sel tint');
  wr(p, s);
}

// ------------------------------------------------------- 4. Anon accent tints
{
  const p = 'app/anon/AnonClient.jsx';
  let s = rd(p);
  s = one(s, `STAGE ? 'rgba(125,211,252,0.16)' : COLORS.accentSoft`, `STAGE ? '${mix(0.16)}' : COLORS.accentSoft`, 'anon ACC_SOFT');
  s = one(s, `STAGE ? 'rgba(125,211,252,0.45)' : '#e3b9be'`, `STAGE ? '${mix(0.45)}' : '#e3b9be'`, 'anon spine border');
  wr(p, s);
}

// ------------------------- 5. Mate: last-move tint follows the accent, tool border
{
  const p = 'app/mate/MateClient.jsx';
  let s = rd(p);
  // LAST_SQ is a module const and STAGE is per-render, so the stage variant has
  // to be declared in the component, beside the other stage tokens.
  s = one(s, `  const SURF_B = STAGE ? 'var(--stg-line,rgba(255,255,255,0.11))' : 'rgba(28,30,36,0.42)';`,
    `  const SURF_B = STAGE ? 'var(--stg-line,rgba(255,255,255,0.11))' : 'rgba(28,30,36,0.42)';
  // The last-move wash is the accent, so on the light register it has to become
  // the accent's dark twin rather than staying the pale gold of the dark one.
  const LAST_TINT = STAGE ? '${mix(0.55)}' : LAST_SQ;`, 'mate LAST_TINT decl');
  s = one(s, 'if (isLast) bg = `linear-gradient(${LAST_SQ},${LAST_SQ}), ${bg}`;',
    'if (isLast) bg = `linear-gradient(${LAST_TINT},${LAST_TINT}), ${bg}`;', 'mate LAST_SQ use');
  // .mt-tool kept a near-black border on the dark stage: invisible in BOTH
  // registers for opposite reasons. It was missed because the earlier sweep
  // bounded its match on } and this rule contains ${SANS}.
  s = one(s, `.mt-tool{font-family:\${SANS};font-weight:800;font-size:12.5px;border:1.5px solid rgba(28,30,36,0.35);`,
    `.mt-tool{font-family:\${SANS};font-weight:800;font-size:12.5px;border:1.5px solid \${STAGE ? 'var(--stg-line2,rgba(255,255,255,0.17))' : 'rgba(28,30,36,0.35)'};`, 'mate tool border');
  wr(p, s);
}

// ---------------------------------------- 6. StageChrome: surf2 used as a border
// A raised-surface token standing in for a rule is the same alpha-not-role
// mistake one level up: on light, --stg-surf2 is a pale fill and vanishes as a line.
{
  const p = 'app/StageChrome.jsx';
  let s = rd(p);
  s = many(s, /(border(?:-bottom|-color)?:(?:\s*1px solid\s*)?)var\(--stg-surf2,rgba\(255,255,255,0\.08\)\)/g,
    '$1var(--stg-line)', 4, 'stagechrome border tokens');
  wr(p, s);
}

flush();
console.log(`patch-stage-tints: ${TOTAL} edits applied across ${PENDING.size} files`);
