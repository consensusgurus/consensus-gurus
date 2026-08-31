// INK ON THE ACCENT HAS TO FOLLOW THE REGISTER TOO.
//
// Owner: Outwit's Start button, near-black on near-black, in LIGHT mode.
//
// RAMP_INK is #08222e, and it is correct for the DARK register, where every
// accent is a PALE ramp step and needs dark ink on it. On the light register
// the accent flips to its dark twin, so the same ink is dark on dark. The token
// for this already exists and was not being used: --stg-onramp, #08222e dark
// and #ffffff light.
//
// 230 sites across 81 files, so it is the rule and not an exception.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.argv[2];
if (!ROOT) { console.error('usage: patch-stage-onramp.mjs <repo-root>'); process.exit(1); }

const files = [];
for (const d of readdirSync(join(ROOT, 'app'), { withFileTypes: true })) {
  if (d.isFile() && /\.jsx$/.test(d.name)) files.push(join('app', d.name));
  if (!d.isDirectory()) continue;
  for (const f of readdirSync(join(ROOT, 'app', d.name))) {
    if (/\.jsx$/.test(f)) files.push(join('app', d.name, f));
  }
}

let edits = 0;
let touched = 0;
for (const rel of files) {
  const p = join(ROOT, rel);
  const src = readFileSync(p, 'utf8');
  if (!/RAMP_INK/.test(src)) continue;
  const lines = src.split('\n');
  let n = 0;
  for (let i = 0; i < lines.length; i++) {
    // Never the import line: the name still has to resolve for any use this
    // sweep does not reach.
    if (/^\s*import\b/.test(lines[i])) continue;
    const before = lines[i];
    lines[i] = lines[i]
      .replace(/\$\{RAMP_INK\}/g, 'var(--stg-onramp, #08222e)')
      .replace(/(?<![\w$.'"])RAMP_INK(?![\w$])/g, "'var(--stg-onramp, #08222e)'");
    if (lines[i] !== before) n++;
  }
  if (n) { writeFileSync(p, lines.join('\n')); edits += n; touched++; }
}
console.log(`patch-stage-onramp: ${edits} lines across ${touched} files`);
