#!/usr/bin/env node
// A GAME'S OWN BRAND COLOUR, USED AS A FILL, IS OFF-PALETTE ON THE STAGE.
//
// The stage gives every game ONE accent: its category's step on the ramp. A
// client that fills tiles with its own brand colour therefore paints a second
// accent onto a page that has already chosen one — Garble's gold letter tiles
// against a sky-blue Solved curtain (owner, 2026-08-31: "they should be the
// same solved blue"), and the same shape in every client that marks a cell by
// filling it.
//
// This is the FILL counterpart to scripts/patch-stage-accent-text.mjs, which
// did the same for accent-as-TEXT. The pattern is identical:
//
//     background: COLORS.gold      ->  background: var(--stg-acc, COLORS.gold)
//     color: COLORS.goldInk        ->  color: var(--stg-onramp, COLORS.goldInk)
//
// The fallback is the original literal and --stg-acc is published only on a
// stage root, so the Loft render is byte-identical and no client needs a STAGE
// ternary for this.
//
// ⚠️ WHAT IT MUST NOT TOUCH: a MEANING PALETTE. Crux's four category bars,
// Links's four groups and Venn's three sets are several colours that mean
// several different things, and collapsing them all to one accent would delete
// the information. So this only ever rewrites the accent FAMILY — the keys a
// client uses for "this is my colour" — and never a key that is one of a
// numbered or lettered set.
//
// Usage: node scripts/patch-stage-accent-fill.mjs [--write] [game ...]

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const WRITE = process.argv.includes('--write');
const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));

// The accent family: a client's own single brand colour and the ink that goes
// on top of it. Anything with a digit or a letter suffix (cA, c1, g2) is a
// palette member and is deliberately absent.
const FILL = ['gold', 'ember', 'accent', 'accentDeep', 'amber', 'brand'];
const INK = ['goldInk', 'accentInk', 'emberInk', 'onAccent', 'inkOnAccent'];

const clients = [];
for (const d of readdirSync('app')) {
  const dir = join('app', d);
  let st; try { st = statSync(dir); } catch { continue; }
  if (!st.isDirectory()) continue;
  if (only.length && !only.includes(d)) continue;
  const f = readdirSync(dir).find((x) => /Client\.jsx$/.test(x));
  if (f) clients.push([d, join(dir, f)]);
}

let changed = 0;
const report = [];
for (const [game, path] of clients) {
  let s = readFileSync(path, 'utf8');
  if (!s.includes('STAGE')) continue;          // not a converted client
  const before = s;
  let n = 0;

  for (const k of FILL) {
    // background: COLORS.gold  /  bg = COLORS.gold  /  background: `${COLORS.gold}`
    const re = new RegExp(`(background:\\s*|bg\\s*=\\s*)COLORS\\.${k}\\b(?!\\s*[,}]?\\s*\`)`, 'g');
    // The emitted value is a TEMPLATE LITERAL. Writing a bare var(--stg-acc,
    // ${COLORS.gold}) into a plain object is a syntax error: the interpolation
    // only means anything inside backticks.
    s = s.replace(re, (m, lead) => { n += 1; return lead + '`var(--stg-acc, ${COLORS.' + k + '})`'; });
  }
  for (const k of INK) {
    const re = new RegExp(`(color:\\s*|fg\\s*=\\s*)COLORS\\.${k}\\b`, 'g');
    s = s.replace(re, (m, lead) => { n += 1; return lead + '`var(--stg-onramp, ${COLORS.' + k + '})`'; });
  }

  // THE INK MUST TRAVEL WITH THE FILL. The stage accent is a PALE step, so a
  // rule that kept its Loft ink (usually white, because the Loft accent is
  // dark) becomes white-on-pastel the moment the fill moves. Any LINE where a
  // fill was just rewritten gets its light ink rewritten too. Line scope is
  // enough because every one of these is a single-line style object, and
  // anything it misses is reported rather than silently left.
  if (s !== before) {
    s = s.split('\n').map((line) => {
      if (!line.includes('var(--stg-acc, ${COLORS.')) return line;
      return line
        .replace(/color: T\.white\b/g, 'color: `var(--stg-onramp, ${T.white})`')
        .replace(/color: '#fff(?:fff)?'/g, "color: `var(--stg-onramp, #fff)`")
        .replace(/color: COLORS\.(paper|cream)\b/g, 'color: `var(--stg-onramp, ${COLORS.$1})`');
    }).join('\n');
  }

  if (s !== before) {
    changed += 1;
    report.push(`${game}: ${n} site(s)`);
    if (WRITE) writeFileSync(path, s);
  }
}

console.log(`${WRITE ? 'patched' : 'would patch'} ${changed} client(s)`);
for (const r of report) console.log('  ' + r);
if (!WRITE) console.log('\n(dry run — pass --write to apply)');
