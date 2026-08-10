// One-off: rebuild the banked boards that the corrected state walk rejects.
//
// lib/strata-core.js used to model a found word as losing its OWNED cells rather
// than the cells the player actually traced, so any board where a word's one
// readable trace runs through another word's letter was proved against a game
// nobody was playing. Four future boards fail the corrected check (#8, #14, #31,
// #32); this rebuilds each ON ITS OWN THEME so the 14-day theme-repeat window and
// the whole-bank theme ceiling stay satisfied, and prints the replacements.
//
// #5 is deliberately NOT in the list. It went live on 2026-08-10 and is frozen.
//
// Run: node scripts/strata-repair.mjs [num ...]
import { readFileSync } from 'node:fs';
import { PUZZLES } from '../app/strata/puzzles.js';
import { loadThemes } from './strata-themes.mjs';
import { findBoard, pack, dayRule, subsets, rng } from './strata-gen.mjs';
import { analyse } from '../lib/strata-core.js';

const FREQ = JSON.parse(readFileSync(new URL('./.lode-freq.json', import.meta.url), 'utf8'));
const themes = loadThemes(FREQ);
const byName = new Map(themes.map((t) => [t.name, t]));
const targets = process.argv.slice(2).map(Number);
const want = targets.length ? targets : [8, 14, 31, 32];

const out = [];
for (const num of want) {
  const old = PUZZLES.find((p) => p.num === num);
  if (!old) { console.error(`no board #${num}`); continue; }
  const rule = dayRule(old.live);
  const r = rng(num * 7919 + 13);
  // Same theme, same day rule, so only the grid changes.
  const usableOf = (name) => (byName.get(name)?.pool || []).filter((w) => FREQ[w.toLowerCase()] >= rule.minZipf);

  let found = null;
  for (let tries = 1; tries <= 40 && !found; tries++) {
    if (old.sunday) {
      const [a, b] = old.themes;
      const sets = [];
      for (let sumA = 16; sumA <= 26 && sets.length < 40; sumA++) {
        const left = subsets(r, usableOf(a), sumA, 3, 5, 400);
        const right = subsets(r, usableOf(b), 42 - sumA, 3, 5, 400);
        if (!left.length || !right.length) continue;
        for (let t = 0; t < 6 && sets.length < 40; t++) {
          const combo = left[Math.floor(r() * left.length)].concat(right[Math.floor(r() * right.length)]);
          if (combo.length >= 7 && combo.length <= 9) sets.push(combo);
        }
      }
      if (!sets.length) continue;
      found = findBoard(num * 7919 + tries, { rows: 7, cols: 6, wordSets: sets, pool: old.pool, maxOpening: 3, minDepth: 4, budget: 400 });
    } else {
      const sets = subsets(r, usableOf(old.themes[0]), 25, 5, 7, 900);
      if (!sets.length) continue;
      found = findBoard(num * 104729 + tries, { rows: 5, cols: 5, wordSets: sets, pool: old.pool, maxOpening: 2, minDepth: 3, budget: 900 });
      if (!found && tries >= 10) found = findBoard(num * 104729 + tries, { rows: 5, cols: 5, wordSets: sets, pool: old.pool, maxOpening: 3, minDepth: 2, budget: 700 });
    }
  }
  if (!found) { console.error(`✗ #${num} ${old.live}: no clean board on theme ${old.themes.join(' + ')}`); continue; }

  const lowest = Math.min(...found.p.words.map((w) => FREQ[w.toLowerCase()]));
  const p = pack(found, {
    num, quizId: old.quizId, live: old.live, dateLabel: old.dateLabel,
    ...(old.sunday ? { sunday: true } : {}),
    themes: old.themes, pool: old.pool, tier: old.tier, minZipf: Number(lowest.toFixed(2)),
  });
  const a = analyse(p);
  if (a.deadEnds.length || a.offOwner.length || a.ambiguous.length) { console.error(`✗ #${num} rebuilt board still dirty`); continue; }
  console.error(`✓ #${num} ${old.live} ${old.themes.join(' + ')}  ${old.words.join(',')}  ->  ${p.words.join(',')}  open=${p.opening} depth=${p.deepest}`);
  out.push(p);
}
console.log(JSON.stringify(out, null, 1));
