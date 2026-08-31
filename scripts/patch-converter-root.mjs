#!/usr/bin/env node
// THE ROOT REWRITE WAS A FIXED STRING, so it only fitted clients whose root was
// written exactly like the first one's. Carve uses THEME.surface and Sweep uses
// COLORS.cream, and the guard refused both rather than rewriting the wrong
// element, which was the right call and also a dead end for 2 of 80 games.
//
// Rewritten to TRANSFORM the root line instead of replacing it: keep whatever
// background expression the client already had for its non-stage branch, and
// wrap it. The guard stays, but now asks only for what the transform actually
// needs (a loft-page root, a minHeight, and a background it can find).
//
// The comma scanner matters: a background can be `rgba(28,30,36,0.5)` or
// `THEME.surface`, so the end of the property is the next comma at PAREN DEPTH
// ZERO, not the next comma.
import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.argv[2];
if (!ROOT_DIR) { console.error('usage: patch-converter-root.mjs <repo-root>'); process.exit(1); }
const P = 'scripts/patch-stage-chrome.mjs';
let s = fs.readFileSync(path.join(ROOT_DIR, P), 'utf8');

const FIND_START = `  const ROOT = /^ *<div className=\\{LOFT \\? 'loft-page' : undefined\\} style=\\{\\{[^\\n]*\\}\\}>$/m;`;
const startIdx = s.indexOf(FIND_START);
if (startIdx < 0) throw new Error('root block start not found');
const endMark = `    + "      style={{ ...(STAGE ? STAGE_ACC : null), minHeight: '100vh', background: STAGE ? 'var(--stg-ground)' : T.surface, color: STAGE ? 'var(--stg-ink,#e9edf4)' : undefined, position: 'relative', overflowX: (STAGE || LOFT) ? 'hidden' : undefined }}>");`;
const endIdx = s.indexOf(endMark);
if (endIdx < 0) throw new Error('root block end not found');

const NEW = `  const ROOT = /^ *<div className=\\{LOFT \\? 'loft-page' : undefined\\} style=\\{\\{[^\\n]*\\}\\}>$/m;
  const hit = (s.match(ROOT) || [])[0];
  if (!hit) throw new Error('no loft-page root element in this client');
  // Only what the transform needs. It used to demand T.surface, which is one
  // client's spelling of "the page background" and made the converter refuse
  // Carve (THEME.surface) and Sweep (COLORS.cream) outright.
  for (const must of ['minHeight', 'background:']) {
    if (!hit.includes(must)) {
      throw new Error(\`the root line is missing \${must}, so it is not the element this patch expects: \${hit.trim()}\`);
    }
  }
  // The client's OWN background expression, kept for the non-stage branch. Ends
  // at the next comma at paren depth zero, because rgba(28,30,36,0.5) has three
  // commas of its own.
  const bgAt = hit.indexOf('background:') + 'background:'.length;
  let depth = 0;
  let bgEnd = hit.length;
  for (let i = bgAt; i < hit.length; i++) {
    const c = hit[i];
    if (c === '(' || c === '[' || c === '{') depth++;
    else if (c === ')' || c === ']' || c === '}') { if (depth === 0) { bgEnd = i; break; } depth--; }
    else if (c === ',' && depth === 0) { bgEnd = i; break; }
  }
  const bg = hit.slice(bgAt, bgEnd).trim();
  // Everything else in the style object, minus the background and any overflowX
  // (which is re-emitted so the stage gets it too).
  const inner = hit.slice(hit.indexOf('style={{') + 'style={{'.length, hit.lastIndexOf('}}'));
  const kept = [];
  {
    let d = 0, start = 0;
    const parts = [];
    for (let i = 0; i <= inner.length; i++) {
      const c = inner[i];
      if (i === inner.length || (c === ',' && d === 0)) { parts.push(inner.slice(start, i)); start = i + 1; }
      else if (c === '(' || c === '[' || c === '{') d++;
      else if (c === ')' || c === ']' || c === '}') d--;
    }
    for (const p of parts) {
      const t = p.trim();
      if (!t) continue;
      if (/^background\\s*:/.test(t)) continue;
      if (/^overflowX\\s*:/.test(t)) continue;
      if (/^color\\s*:/.test(t)) continue;
      kept.push(t);
    }
  }
  const style = ["...(STAGE ? STAGE_ACC : null)", ...kept,
    \`background: STAGE ? 'var(--stg-ground)' : \${bg}\`,
    "color: STAGE ? 'var(--stg-ink,#e9edf4)' : undefined",
    "overflowX: (STAGE || LOFT) ? 'hidden' : undefined"].join(', ');
  edit('root', ROOT,
    "    <div className={STAGE ? 'stage-page' : (LOFT ? 'loft-page' : undefined)}\\n"
    + "      data-stage-theme={STAGE ? stageTheme : undefined}\\n"
    + \`      style={{ \${style} }}>\`);`;

// Splice out the old block (from ROOT through the fixed emission) and put the
// transform in its place.
s = s.slice(0, startIdx) + NEW + s.slice(endIdx + endMark.length);
fs.writeFileSync(path.join(ROOT_DIR, P), s);
console.log('patch-converter-root: root rewrite is now a transform');
