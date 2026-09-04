// scripts/blast-radius.mjs — which checkers does a change actually reach?
//
// WHY THIS EXISTS. On 2026-09-04 a bank restock added 3,807 entries to
// scripts/emcee-wordbank.txt to unblock Emcee's 7x7 Sunday fills. Nothing about
// Emcee broke. `verify-encore` went red on 226 boards, because it builds its
// clue map from emcee-wordbank.txt FIRST and encore-wordbank.txt second, so the
// new entries silently took ownership of every word both files had. Encore's
// own puzzles.js never changed, so every per-game check on every game that DID
// change came back green, and it shipped.
//
// The lesson is not "be careful with shared files", it is that blast radius is
// a LOOKUP, not a judgement. This is the lookup.
//
//   node scripts/blast-radius.mjs                      # vs origin/main
//   node scripts/blast-radius.mjs <ref>                # vs any ref
//   node scripts/blast-radius.mjs --files a.js b.txt   # an explicit list
//   node scripts/blast-radius.mjs --quiet              # just the checker names
//
// HOW IT MATCHES. A reference is found by the PATH-QUALIFIED name a file is
// reached by: `emcee/puzzles`, `lib/circuits`, `emcee-wordbank.txt`. A bare
// basename is not enough, because `puzzles` appears in nearly every file in the
// tree and turns the closure into "run everything". A needle that hits more
// than NOISE files is a common word rather than a reference, and is dropped.
//
// It errs toward running MORE checkers than strictly necessary. That is the
// safe direction: an extra checker costs seconds, a missed one costs a red gate
// on origin. Never narrow the result by hand.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const args = process.argv.slice(2);
const quiet = args.includes('--quiet');
const explicit = args.includes('--files');
const positional = args.filter((a) => !a.startsWith('--'));
const NOISE = 60;        // a needle in more than this many files is a word, not a reference
const MAX_HOPS = 4;

// ── what changed ───────────────────────────────────────────────────────────
let changed;
if (explicit) {
  changed = positional;
} else {
  const ref = positional[0] || 'origin/main';
  try {
    const tracked = execFileSync('git', ['diff', '--name-only', ref], { cwd: root, encoding: 'utf8' });
    const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard'], { cwd: root, encoding: 'utf8' });
    changed = [...new Set(`${tracked}\n${untracked}`.split('\n').map((s) => s.trim()).filter(Boolean))];
  } catch {
    console.error(`blast-radius: could not diff against "${ref}". Pass a ref that exists, or use --files.`);
    process.exit(1);
  }
}
changed = changed.filter((f) => existsSync(join(root, f)));
if (!changed.length) { if (!quiet) console.log('blast-radius: nothing changed'); process.exit(0); }

// ── the searchable tree ────────────────────────────────────────────────────
const KEEP = /\.(mjs|jsx?|txt|json)$/;
const all = [];
const walk = (dir) => {
  let entries;
  try { entries = readdirSync(join(root, dir)); } catch { return; }
  for (const e of entries) {
    if (e === 'node_modules' || e === '.next' || e.startsWith('.')) continue;
    const rel = `${dir}/${e}`;
    if (statSync(join(root, rel)).isDirectory()) walk(rel);
    else if (KEEP.test(e)) all.push(rel);
  }
};
['scripts', 'lib', 'app'].forEach(walk);
const text = new Map();
const srcOf = (rel) => {
  if (!text.has(rel)) { try { text.set(rel, readFileSync(join(root, rel), 'utf8')); } catch { text.set(rel, ''); } }
  return text.get(rel);
};

// ── who reaches this file ──────────────────────────────────────────────────
const needlesFor = (rel) => {
  const base = basename(rel);
  const parts = rel.split('/');
  const stem = base.replace(/\.(mjs|jsx?)$/, '');
  const qualified = parts.length > 1 ? `${parts[parts.length - 2]}/${stem}` : stem;
  const out = [qualified];
  // a data file is only ever reached by its own name, and that name is distinctive
  if (/\.(txt|json)$/.test(base) || base.includes('-')) out.push(base);
  return [...new Set(out)].filter((n) => n.length > 3);
};
const reachers = (rel) => {
  const hits = new Set();
  for (const n of needlesFor(rel)) {
    const found = all.filter((f) => f !== rel && srcOf(f).includes(n));
    if (found.length > NOISE) continue;         // a common word, not a reference
    found.forEach((f) => hits.add(f));
  }
  return [...hits];
};

// ── walk out ───────────────────────────────────────────────────────────────
const CHECKER = /^scripts\/verify-([a-z-]+)\.mjs$/;
const checkers = new Map();                     // checker -> the changed file that reached it
const note = (name, origin) => { if (name !== 'all' && !checkers.has(name)) checkers.set(name, origin); };
const seen = new Set(changed);
let frontier = changed.map((f) => [f, f]);

// A game's OWN files are checked by that game's checker. This applies to the
// files actually changed, not to everything the walk later wanders into.
for (const f of changed) {
  const g = f.match(/^app\/([a-z0-9-]+)\//);
  if (g) note(g[1], f);
  const self = f.match(CHECKER);
  if (self) note(self[1], f);
}

for (let hop = 0; hop < MAX_HOPS && frontier.length; hop++) {
  const next = [];
  for (const [file, origin] of frontier) {
    for (const m of reachers(file)) {
      const c = m.match(CHECKER);
      if (c) { note(c[1], origin); continue; }
      if (seen.has(m)) continue;
      seen.add(m);
      next.push([m, origin]);
    }
  }
  frontier = next;
}

// TREE SCANNERS. A handful of checkers walk app/ or lib/ wholesale and name no
// file at all, so nothing above can ever reach them: verify-inline-style-quotes
// found the Sums <style>{CSS} hazard by scanning, not by importing SumsClient.
// They are detected rather than listed, so a new one is picked up for free.
const scanners = all
  .map((f) => [f, f.match(CHECKER)])
  .filter(([f, m]) => m && /readdirSync/.test(srcOf(f)) && m[1] !== 'all')
  .map(([, m]) => m[1]);
const touchedTree = changed.some((f) => /^(app|lib)\/.*\.(jsx?|mjs)$/.test(f));
if (touchedTree) for (const s of scanners) note(s, 'a source file changed under app/ or lib/');

const names = [...checkers.keys()].sort();
if (quiet) { console.log(names.join(' ')); process.exit(0); }

console.log(`blast-radius: ${changed.length} changed file(s) reach ${names.length} checker(s)\n`);
for (const f of changed.slice(0, 40)) console.log(`  changed  ${f}`);
if (changed.length > 40) console.log(`  changed  ... and ${changed.length - 40} more`);
console.log('');
for (const n of names) console.log(`  run  verify-${n.padEnd(22)} via ${checkers.get(n)}`);
console.log(`\n  node scripts/verify-all.mjs --changed     (computes and runs exactly this)`);
