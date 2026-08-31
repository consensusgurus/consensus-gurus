#!/usr/bin/env node
// STOP ENUMERATING NAMES. RESOLVE THE VALUE.
//
// Owner, three reports in: "how are we missing this many". Every miss was a
// token spelling I had not thought of — COLORS.cream, then COLORS.paper, then
// #eef2f7 in a CSS template, then COLORS.accentSoft. A list of names can never
// be finished, because each client names its own palette.
//
// So this resolves each client's palette instead. It reads lib/theme.js, then
// the client's own `const COLORS = { ... }` (whose values are literals or
// references into the theme), computes the LUMINANCE of every key, and converts
// `background: COLORS.<key>` for every key that is actually light — whatever
// that key happens to be called.
//
// Same for `color: COLORS.<key>` where the key is actually dark, which is the
// other half of the same bug.
//
// Uses CSS variables, so there is no scope constraint and no ternary: on the
// stage the token wins, off it the client's own value does.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2];
if (!ROOT) { console.error('usage: patch-stage-bylum.mjs <repo-root>'); process.exit(1); }

const hexLum = (hex) => {
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255);
  const f = (v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

// The theme, which most client palettes point into.
const themeSrc = fs.readFileSync(path.join(ROOT, 'lib/theme.js'), 'utf8');
const THEME = {};
for (const m of themeSrc.matchAll(/^\s*([a-zA-Z][\w]*)\s*:\s*'(#[0-9a-fA-F]{3,8})'/gm)) THEME[m[1]] = m[2];

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

    // The client's own palette: literals, or references into the theme.
    const block = src.match(/const COLORS = \{([\s\S]*?)\n\};/);
    const light = new Set();
    const dark = new Set();
    if (block) {
      for (const m of block[1].matchAll(/^\s*([a-zA-Z][\w]*)\s*:\s*(?:'(#[0-9a-fA-F]{3,8})'|T\.([\w]+)|THEME\.([\w]+))/gm)) {
        const hex = m[2] || THEME[m[3] || m[4]];
        if (!hex || hex.length > 7) continue;          // skip rgba()/8-digit
        (hexLum(hex) > 0.45 ? light : dark).add(m[1]);
      }
    }
    if (!light.size && !dark.size) continue;

    const lines = src.split('\n');
    let n = 0;
    for (let i = 0; i < lines.length; i++) {
      let l = lines[i];
      const before = l;
      // A LIGHT palette key used as a ground.
      if (!/background(Color)?:\s*(?:STAGE\s*\?|SURF|`?var\(--stg|\$\{STAGE)/.test(l)) {
        l = l.replace(/background(Color)?: COLORS\.([\w]+)\b/g,
          (mm, c, k) => (light.has(k) ? `background${c || ''}: \`var(--stg-surf, \${COLORS.${k}})\`` : mm));
      }
      // A DARK palette key used as text.
      if (!/color:\s*(?:STAGE\s*\?|INK|FADED|ACC|`?var\(--stg)/.test(l)) {
        l = l.replace(/(?<!background)(?<!border)color: COLORS\.([\w]+)\b/g,
          (mm, k) => (dark.has(k) ? `color: \`var(--stg-ink, \${COLORS.${k}})\`` : mm));
      }
      // A DARK palette key used as a RULE. On the stage that is a near-black
      // line on a near-black ground: the card loses its edge entirely.
      if (!/border[^:]*:\s*(?:STAGE\s*\?|`?var\(--stg)/.test(l)) {
        l = l.replace(/border(-[a-z]+)?: `([0-9.]+px) solid \$\{COLORS\.([\w]+)\}`/g,
          (mm, side, w, k) => (dark.has(k) ? `border${side || ''}: \`${w} solid var(--stg-line, \${COLORS.${k}})\`` : mm));
      }
      if (l !== before) { lines[i] = l; n++; }
    }
    if (n) { fs.writeFileSync(p, lines.join('\n')); files++; edits += n; rows.push(`  ${d.name.padEnd(10)} ${n}`); }
  }
}
console.log(rows.join('\n'));
console.log(`\npatch-stage-bylum: ${edits} lines across ${files} files`);
