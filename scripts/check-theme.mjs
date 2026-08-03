#!/usr/bin/env node
// Guards the colour theme. Run: node scripts/check-theme.mjs
//
// 1. lib/theme.js and the :root block in app/globals.css must declare the same tokens with
//    the same values. They are two spellings of one palette; if they drift, a component
//    styled via var(--x) and one styled via T.x render different colours.
// 2. Directories already converted to tokens must not reintroduce a raw brand hex.
//    Add a glob here as each batch lands, so the guard tightens instead of going stale.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Inverted on purpose: every tree under app/ is guarded EXCEPT those still listed as
// PENDING. Each batch that lands deletes lines from PENDING, so the guard tightens on its
// own rather than going stale when someone forgets to add a directory.
const PENDING = [];   // every tree under app/ is converted and guarded
// Excluded with cause, not silently: this route builds an SVG *string* for Satori, which
// does not resolve CSS custom properties, and it binds its own `T`. Revisit in the brand
// phase when the OG cards become brand-aware.
const EXCLUDE = new Set([
  // Satori (next/og) renders these; it cannot resolve CSS custom properties, so they keep
  // literal hexes until the OG cards are rebranded in the assets phase.
  'app/quizzes/opengraph-image.js',
  'app/list/[id]/poster-image/route.js',
  'app/api/quiz/day-card/route.js',
  'app/api/quiz/share-card/route.js',
  'app/player/[name]/opengraph-image.js',
]);

const theme = readFileSync('lib/theme.js', 'utf8');
const css = readFileSync('app/globals.css', 'utf8');
const fail = [];

const tBlock = theme.slice(theme.indexOf('export const T'), theme.indexOf('export const MIND_LOFT'));
const vBlock = theme.slice(theme.indexOf('export const CSS_VAR'));
const T = Object.fromEntries([...tBlock.matchAll(/^\s*([a-zA-Z]+):\s*'(#[0-9a-f]{3,8})',/gm)].map(m => [m[1], m[2]]));
const V = Object.fromEntries([...vBlock.matchAll(/^\s*([a-zA-Z]+):\s*'(--[a-z-]+)',/gm)].map(m => [m[1], m[2]]));
const rootSrc = css.slice(css.indexOf(':root {'), css.indexOf('}', css.indexOf(':root {')));
const R = Object.fromEntries([...rootSrc.matchAll(/(--[a-z-]+):\s*(#[0-9a-f]{3,8});/g)].map(m => [m[1], m[2]]));

for (const k of Object.keys(T)) {
  if (!V[k]) fail.push(`token "${k}" has no CSS_VAR entry in lib/theme.js`);
  else if (R[V[k]] !== T[k]) fail.push(`token "${k}": T=${T[k]} but ${V[k]}=${R[V[k]] ?? 'missing in :root'}`);
}
for (const v of Object.keys(R)) {
  if (!Object.values(V).includes(v)) fail.push(`:root declares ${v} with no token in CSS_VAR`);
}

const HEXES = new Set(Object.values(T).flatMap(h => h === '#ffffff' ? [h, '#fff'] : [h]));
const walk = (d) => {
  let out = [];
  for (const e of readdirSync(d)) {
    const p = join(d, e).split('\\').join('/');
    if (PENDING.includes(p)) continue;
    if (statSync(p).isDirectory()) out = out.concat(walk(p));
    else if (/\.(js|jsx|css)$/.test(e)) out.push(p);
  }
  return out;
};
for (const f of walk('app')) {
  if (EXCLUDE.has(f) || f === 'app/globals.css') continue;
  readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
    const m = line.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
    for (const h of m) if (HEXES.has(h.toLowerCase())) fail.push(`${f}:${i + 1} raw brand hex ${h} (use T.* or var(--*))`);
  });
}

if (fail.length) { console.error('theme check FAILED:\n' + fail.map(s => '  ' + s).join('\n')); process.exit(1); }
console.log(`theme check OK: ${Object.keys(T).length} tokens; ${PENDING.length} trees still pending conversion`);
