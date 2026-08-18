// patch-circuits.mjs — the CIRCUITS wiring, as anchored edits.
//
// Three files have to change and one of them must never be rewritten whole:
// app/DailyStrip.jsx is 4,806 lines (see the stale-base rule in CLAUDE.md), and
// app/DailyFiveBand.jsx is a small file whose value is almost entirely in its
// comments. So this does what scripts/patch-daily-five.mjs did: anchor and
// replace, against copies taken from a fetch in the SAME deploy step, never
// from the working tree.
//
// EVERY ANCHOR MUST MATCH EXACTLY ONCE. Zero means origin moved under us and the
// patch would silently no-op; two means the anchor is not specific enough and
// the edit would land twice. Both throw.
//
// THE EDITS LIVE IN scripts/circuits.patch.txt, NOT IN THIS FILE, and that is
// deliberate rather than tidy. Several of them insert JSX containing backticks
// and ${...}, which cannot sit inside a JS template literal without escaping
// every one of them by hand — and a missed escape does not fail here, it
// silently changes the code being written into the repo. A plain text file with
// unambiguous line-start delimiters has no escaping at all.
//
// APPLIED 2026-08-18 in commit daa9d770b. This is a RECORD of how the circuits
// wiring landed, not a live tool: its anchors are the pre-circuits text and no
// longer exist on origin, so re-running it throws rather than doing anything.
// Later edits to these files are ordinary anchored edits at deploy time.
//
// Usage: node scripts/patch-circuits.mjs <dir-of-extracted-files>
// where the dir holds files named by their repo path with / replaced by _.

import fs from 'node:fs';
import path from 'node:path';

const dir = process.argv[2];
if (!dir) { console.error('usage: patch-circuits.mjs <dir>'); process.exit(1); }

const patchFile = path.join(path.dirname(new URL(import.meta.url).pathname), 'circuits.patch.txt');
const raw = fs.readFileSync(patchFile, 'utf8');

// ── parse ───────────────────────────────────────────────────────────────────
// Blocks are delimited by lines that are exactly the markers below, so no
// payload line can be mistaken for one unless it is itself exactly that marker.
const edits = [];
{
  const lines = raw.split('\n');
  let cur = null;
  let mode = null;
  const push = (arr, l) => arr.push(l);
  for (const line of lines) {
    if (line.startsWith('@@FILE ')) {
      if (cur) edits.push(cur);
      cur = { file: line.slice(7).trim(), label: '', find: [], replace: [] };
      mode = null;
      continue;
    }
    if (line.startsWith('@@LABEL ')) { cur.label = line.slice(8).trim(); continue; }
    if (line === '@@FIND') { mode = 'find'; continue; }
    if (line === '@@REPLACE') { mode = 'replace'; continue; }
    if (line === '@@END') { mode = null; continue; }
    if (cur && mode) push(cur[mode], line);
  }
  if (cur) edits.push(cur);
}
if (!edits.length) throw new Error('no edits parsed out of circuits.patch.txt');

// ── apply ───────────────────────────────────────────────────────────────────
const files = new Map();
const pathOf = (repoPath) => path.join(dir, repoPath.split('/').join('_'));

for (const e of edits) {
  const find = e.find.join('\n');
  const replace = e.replace.join('\n');
  if (!find.trim()) throw new Error(`empty anchor: ${e.label}`);
  if (!files.has(e.file)) {
    const p = pathOf(e.file);
    if (!fs.existsSync(p)) throw new Error(`missing extracted file: ${p}`);
    files.set(e.file, fs.readFileSync(p, 'utf8'));
  }
  const src = files.get(e.file);
  const parts = src.split(find);
  if (parts.length !== 2) {
    throw new Error(
      `anchor matched ${parts.length - 1} times (need exactly 1): ${e.label}\n` +
      `--- first 400 chars of anchor ---\n${find.slice(0, 400)}`,
    );
  }
  files.set(e.file, parts[0] + replace + parts[1]);
  console.log(`ok   ${e.label}`);
}

for (const [repoPath, out] of files) {
  fs.writeFileSync(pathOf(repoPath), out);
  console.log(`wrote ${repoPath}  (${out.split('\n').length} lines)`);
}
console.log(`\n${edits.length} edits applied across ${files.size} files.`);
