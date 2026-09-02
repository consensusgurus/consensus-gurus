// scripts/verify-feud.mjs — acceptance audit for Feud's bucket matcher.
//
// Feud's answer key is the live crowd, so the ONE thing that must hold is that
// a player who typed the intended answer lands in the intended bucket. This
// script proves it two ways across every banked prompt:
//
//   1. SELF-COLLISION: every bucket label and every alias key, run back through
//      the matcher, must resolve to its OWN bucket. A key that resolves to a
//      sibling means players naming that answer are silently credited to the
//      wrong crowd (the launch pass had 23 of these — "headphones" hitting the
//      Phone bucket, "dishwasher" hitting Washer, "backseat" hitting AC).
//   2. FIXTURES: hand-written realistic answers — typos, plurals, tense,
//      synonyms, filler words, compound spacing — must land where a human
//      would put them, and the known traps must NOT match.
//
// Run: node scripts/verify-feud.mjs
import { PUZZLES } from '../app/feud/puzzles.js';
import { normAnswer, promptMatcher } from '../lib/feud-match.js';

// The audit runs the REAL matcher (lib/feud-match.js has no imports precisely
// so it can be loaded here), never a copy — a mirror would drift.
const matcherFor = promptMatcher;

let fail = 0;
const bad = [];

// ---- 1. self-collision sweep -------------------------------------------
let prompts = 0, probes = 0;
for (const puz of PUZZLES) {
  for (const [pi, prompt] of (puz.prompts || []).entries()) {
    prompts++;
    const m = matcherFor(prompt);
    (prompt.answers || []).forEach((b, i) => {
      const want = 'c' + i;
      for (const probe of [b.c, ...(b.k || [])]) {
        probes++;
        const got = m.bucketOf(probe);
        if (got !== want) {
          fail++;
          const gotLabel = got && got.startsWith('c')
            ? (prompt.answers[Number(got.slice(1))] || {}).c
            : '(no bucket — dynamic)';
          bad.push(`  #${puz.num} p${pi + 1} "${probe}" → ${gotLabel}  (should be "${b.c}")`);
        }
      }
    });
  }
}

// ---- 2. fixtures ---------------------------------------------------------
// [prompt-finding substring, typed answer, expected bucket label or null]
const FIXTURES = [
  ["can't fall asleep", 'scrolling on my phone', 'Scroll their phone'],
  ["can't fall asleep", 'SCROLL TIKTOK', 'Scroll their phone'],
  ["can't fall asleep", 'watch television', 'Watch TV'],
  ["can't fall asleep", 'reading a book', 'Read'],
  ["can't fall asleep", 'counting sheep', 'Count sheep'],
  ["can't fall asleep", 'tossing and turning', 'Toss and turn'],
  ["can't fall asleep", 'melatonan', 'Take melatonin'],          // typo
  ["can't fall asleep", 'drink some tea', 'Drink something warm'],
  ['better as a leftover', 'PIZZA!!!', 'Pizza'],
  ['better as a leftover', 'cold pizza slice', 'Pizza'],
  ['better as a leftover', 'chinese', 'Chinese food'],
  ['better as a leftover', 'lasagne', 'Lasagna'],                // spelling
  ['better as a leftover', 'spagetti', 'Spaghetti'],             // typo
  ['always losing', 'my keys', 'Keys'],
  ['always losing', 'the tv remote', 'The remote'],
  ['always losing', 'sunglasses', 'Sunglasses'],
  ['always losing', 'chap stick', 'Chapstick'],                  // compound spacing
  ['always losing', 'airpods', 'Earbuds'],
  // 2026-09-01 player report (Matty P): quality nouns and irregular plurals
  ['fall activity', 'leaf watch', 'Looking at the leaves'],
  ['fall activity', 'leaf peeping', 'Looking at the leaves'],
  ['fall activity', 'the leaves changing', 'Looking at the leaves'],
  ['fall activity', 'foliage', 'Looking at the leaves'],
  ['notice first about a house', 'cleanliness', 'How clean it is'],
  ['notice first about a house', 'cleanness', 'How clean it is'],
  ['notice first about a house', 'tidiness', 'How clean it is'],
  ['notice first about a house', 'how messy it is', 'How clean it is'],
  ['notice first about a house', 'how big it is', 'How big it is'],
  // traps: an accidental substring must NOT be credited to the short bucket
  ['always losing', 'headphones', null],
  ['always losing', 'my dignity', null],
];

let fx = 0, fxBad = [];
for (const [needle, typed, wantLabel] of FIXTURES) {
  let found = null;
  for (const puz of PUZZLES) {
    for (const prompt of puz.prompts || []) {
      if (prompt.q.toLowerCase().includes(needle.toLowerCase())) { found = prompt; break; }
    }
    if (found) break;
  }
  if (!found) { fxBad.push(`  (no prompt matching "${needle}" — fixture stale)`); fail++; continue; }
  fx++;
  const m = matcherFor(found);
  const got = m.bucketOf(typed);
  const gotLabel = got && got.startsWith('c') ? (found.answers[Number(got.slice(1))] || {}).c : null;
  if (gotLabel !== wantLabel) {
    fail++;
    fxBad.push(`  "${typed}" → ${gotLabel || '(dynamic)'}  (expected ${wantLabel || '(dynamic)'})`);
  }
}

// ---- 3. synonym table sanity --------------------------------------------
// A synonym target must never itself be a synonym key (no chains), or the
// canonical form depends on iteration order.
const chainBad = [];
{
  const probe = (w) => normAnswer(w);
  const seen = new Map();
  for (const w of ['television', 'cell', 'sofa', 'pop', 'restroom', 'garbage', 'automobile', 'film', 'child', 'mother', 'holiday', 'lift', 'queue', 'petrol']) {
    const once = probe(w);
    const twice = probe(once);
    if (once !== twice) chainBad.push(`  "${w}" → "${once}" → "${twice}" (synonym chain)`);
    seen.set(w, once);
  }
}
fail += chainBad.length;

// ---- report --------------------------------------------------------------
console.log(`Feud acceptance audit`);
console.log(`  ${PUZZLES.length} days, ${prompts} prompts, ${probes} label/alias probes`);
console.log(`  ${fx} fixtures`);
if (bad.length) { console.log(`\nSELF-COLLISIONS (${bad.length}):`); bad.forEach((l) => console.log(l)); }
if (fxBad.length) { console.log(`\nFIXTURE FAILURES (${fxBad.length}):`); fxBad.forEach((l) => console.log(l)); }
if (chainBad.length) { console.log(`\nSYNONYM CHAINS (${chainBad.length}):`); chainBad.forEach((l) => console.log(l)); }
if (!fail) console.log(`\nPASS — every label and alias resolves to its own bucket.`);
else console.log(`\nFAIL — ${fail} problem(s).`);
process.exit(fail ? 1 : 0);
