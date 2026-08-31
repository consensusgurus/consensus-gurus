#!/usr/bin/env node
// STOP GUESSING AT SPELLINGS; AND STOP LETTING SCOPE BLOCK THE FIX.
//
// A DOM audit of all 80 stage pages (walk every element, resolve its real
// background, compute WCAG contrast) found 151 unreadable text nodes and 25
// light islands across 24 games. The dominant offender was #0b0d12 on the
// #0b0f1a ground: the LIGHT register's ink, on the dark page.
//
// Cause: the converter's text rewrite is SCOPE-BOUND, because INK / SURF are
// declared inside the main component and several clients define helper
// components above it, where those consts do not exist. That guard is correct
// and it left every such element unconverted — dark type on the dark ground.
//
// CSS VARIABLES NEED NO BINDING. `var(--stg-ink, ${COLORS.ink})` resolves to
// the stage token inside .stage-page and to the client's own value everywhere
// else, at ANY scope, with no import and no ternary. So the fix that was
// blocked by scope simply is not blocked any more, and it works in both
// registers for free.
//
// This is also why the source-grep checker kept missing things: it can only
// find spellings someone thought to enumerate. The DOM audit measures the
// rendered result and finds them all.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2];
if (!ROOT) { console.error('usage: patch-stage-vars.mjs <repo-root>'); process.exit(1); }

// Text. Applied file-wide: no scope guard is needed for a CSS variable.
const TEXT = [
  [/color: COLORS\.ink\b/g, 'color: `var(--stg-ink, ${COLORS.ink})`'],
  [/color: COLORS\.faded\b/g, 'color: `var(--stg-mute, ${COLORS.faded})`'],
  [/color: COLORS\.slate\b/g, 'color: `var(--stg-ink2, ${COLORS.slate})`'],
  [/color: THEME\.ink\b/g, 'color: `var(--stg-ink, ${THEME.ink})`'],
  [/color: T\.ink\b/g, 'color: `var(--stg-ink, ${T.ink})`'],
  [/color:\$\{COLORS\.ink\}/g, 'color:var(--stg-ink, ${COLORS.ink})'],
  [/color:\$\{COLORS\.faded\}/g, 'color:var(--stg-mute, ${COLORS.faded})'],
];
// Surfaces and rules, same trick.
const SURFACE = [
  [/background(Color)?: T\.white\b/g, 'background$1: `var(--stg-surf, ${T.white})`'],
  [/background(Color)?: THEME\.white\b/g, 'background$1: `var(--stg-surf, ${THEME.white})`'],
  [/background(Color)?: COLORS\.cream\b/g, 'background$1: `var(--stg-surf, ${COLORS.cream})`'],
  [/background(Color)?: COLORS\.paper\b/g, 'background$1: `var(--stg-surf2, ${COLORS.paper})`'],
  [/background:var\(--white\)/g, 'background:var(--stg-surf, var(--white))'],
  [/background:(#(?:fff|ffffff|[e-f][0-9a-f]{5}))\b/g, 'background:var(--stg-surf2, $1)'],
];
// Near-black rules, invisible on the dark ground. This is what made Alibi's
// detective board render with no cell edges at all.
const BORDER = [
  [/border(-[a-z]+)?:\s*([0-9.]+px) solid rgba\(28,\s*30,\s*36,\s*0\.(1[0-9]|[0-9])\)/g,
    'border$1: $2 solid var(--stg-line, rgba(28,30,36,0.$3))'],
  [/border(-[a-z]+)?:\s*([0-9.]+px) solid rgba\(28,\s*30,\s*36,\s*0\.([2-9][0-9]?)\)/g,
    'border$1: $2 solid var(--stg-line2, rgba(28,30,36,0.$3))'],
  [/border(-[a-z]+)?:([0-9.]+px) solid rgba\(28,30,36,0\.([0-9]+)\)/g,
    'border$1:$2 solid var(--stg-line, rgba(28,30,36,0.$3))'],
];

let files = 0;
let edits = 0;
const rows = [];
for (const d of fs.readdirSync(path.join(ROOT, 'app'), { withFileTypes: true })) {
  if (!d.isDirectory()) continue;
  for (const f of fs.readdirSync(path.join(ROOT, 'app', d.name))) {
    if (!/^[A-Z][A-Za-z]*Client\.jsx$/.test(f)) continue;
    const p = path.join(ROOT, 'app', d.name, f);
    const src = fs.readFileSync(p, 'utf8');
    if (!/const STAGE = isStage\(/.test(src)) continue;

    const lines = src.split('\n');
    let n = 0;
    for (let i = 0; i < lines.length; i++) {
      let l = lines[i];
      const before = l;
      // Never touch a line that already decides for itself.
      if (!/color:\s*(?:STAGE\s*\?|INK|FADED|ACC|`?var\(--stg)/.test(l)) for (const [re, to] of TEXT) l = l.replace(re, to);
      if (!/background(Color)?:\s*(?:STAGE\s*\?|SURF|`?var\(--stg|\$\{STAGE)/.test(l)) for (const [re, to] of SURFACE) l = l.replace(re, to);
      // A rule on a surface that stays LIGHT must stay dark, or it disappears
      // against its own card.
      if (!/var\(--stg-surf2?,\s*(?:#|var)/.test(l) || /var\(--stg-surf/.test(l)) {
        for (const [re, to] of BORDER) l = l.replace(re, to);
      }
      if (l !== before) { lines[i] = l; n++; }
    }
    if (n) { fs.writeFileSync(p, lines.join('\n')); files++; edits += n; rows.push(`  ${d.name.padEnd(10)} ${n}`); }
  }
}
console.log(rows.join('\n'));
console.log(`\npatch-stage-vars: ${edits} lines across ${files} files`);
