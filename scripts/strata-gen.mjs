// Strata bank generator.
//
// Boards are built BACKWARDS, which is the only way the gating can exist. If you
// partition a full grid into paths, every word is contiguous at the start and
// nothing is gated. So instead we run the game in reverse: begin with an empty
// board and insert the LAST word first, then the second last, and so on. A word
// is inserted along a contiguous path in the board as it stands, which is exactly
// the board the player will be looking at when that word becomes its turn. Words
// inserted afterwards pile on top and routinely break that contiguity in the full
// starting grid, which is the gate.
//
// Two facts make the insertion legal without any extra bookkeeping:
//   * cells never change column, so removing the inserted word and letting the
//     column compact restores the previous board exactly;
//   * therefore the only constraint is that a column never exceeds `rows`, and
//     since the word lengths sum to rows*cols, "no column overflows" forces every
//     column to finish exactly full.
//
// Every candidate is then proved forwards by strata-core.analyse: reachable state
// graph, no dead ends anywhere, one placement per word per state, and the gating
// actually present.

import { writeFileSync, readFileSync, existsSync, statSync } from 'node:fs';
import { analyse, decoys, makeCells, gridOf, placements } from '../lib/strata-core.js';
import { loadThemes } from './strata-themes.mjs';

// ── the week's difficulty curve (owner, 2026-08-06) ─────────────────────────
// Day one shipped GUSSET and BOBBIN on a Sewing board and players did not know
// the words. Two separate things were wrong, so there are two separate dials.
//
//   maxTier  how obscure the CATEGORY may be. 1 = everyday, 3 = specialist.
//   minZipf  how rare any single WORD may be, on the Zipf scale in
//            scripts/.lode-freq.json. 4.7 is "apple", 3.5 is "seam",
//            2.5 is "bobbin". EVERY answer on the board must clear the floor.
//
// Monday is everyday words in an everyday category and it loosens across the
// week, so a Monday board is about seeing the collapse and a Sunday is about
// knowing the vocabulary as well. Keyed by getUTCDay: 0 = Sunday.
export const DIFFICULTY = {
  1: { maxTier: 1, minZipf: 4.0 },
  2: { maxTier: 1, minZipf: 3.8 },
  3: { maxTier: 2, minZipf: 3.6 },
  4: { maxTier: 2, minZipf: 3.4 },
  5: { maxTier: 3, minZipf: 3.2 },
  6: { maxTier: 3, minZipf: 3.0 },
  0: { maxTier: 3, minZipf: 2.8 },
};
export const dayRule = (iso) => DIFFICULTY[new Date(iso + 'T12:00:00Z').getUTCDay()];

export function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
function shuffle(r, arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// Subsets of `pool` whose lengths sum to EXACTLY `target`, with a word count in
// range. An exact search, not a greedy fill: greedy takes words while they fit and
// then dead-ends two letters short, which quietly made every weekday a five word
// board because only the longest-first pass ever landed on the number.
export function subsets(r, pool, target, minW, maxW, tries = 900) {
  const out = new Map();
  for (let t = 0; t < tries && out.size < 40; t++) {
    const want = minW + Math.floor(r() * (maxW - minW + 1));
    const bag = shuffle(r, pool);
    const chosen = [];
    let hit = null;
    (function dfs(i, sum) {
      if (hit) return;
      if (chosen.length === want) { if (sum === target) hit = chosen.slice(); return; }
      if (sum >= target || i >= bag.length) return;
      const left = want - chosen.length;
      if (bag.length - i < left) return;
      for (let j = i; j < bag.length && !hit; j++) {
        if (sum + bag[j].length > target) continue;
        chosen.push(bag[j]); dfs(j + 1, sum + bag[j].length); chosen.pop();
      }
    })(0, 0);
    if (hit) out.set(hit.slice().sort().join(','), hit);
  }
  return [...out.values()];
}

// subsets() is a search, so calling it inside a loop is what wedged the first
// full run. Every (theme, target, count-range) answer is computed once.
const SUBSET_CACHE = new Map();
function cachedSubsets(r, tag, words, target, minW, maxW) {
  const key = `${tag}|${target}|${minW}|${maxW}`;
  if (!SUBSET_CACHE.has(key)) SUBSET_CACHE.set(key, subsets(r, words, target, minW, maxW, 400));
  return SUBSET_CACHE.get(key);
}

const DIRS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

// One random simple 8-connected path of `len` cells, biased low so it has a
// chance of clearing the insertion test on a mostly empty board.
function randomPath(r, rows, cols, len, heights) {
  const startPool = [];
  for (let rr = 0; rr < rows; rr++) for (let cc = 0; cc < cols; cc++) {
    const depth = rows - rr;                       // 1 at the bottom row
    const slack = heights[cc] + len;               // most this column could ever hold
    if (depth <= slack) startPool.push([rr, cc, 1 + (rows - rr)]);
  }
  if (!startPool.length) return null;
  let total = startPool.reduce((s, x) => s + x[2], 0);
  let roll = r() * total, cur = null;
  for (const s of startPool) { roll -= s[2]; if (roll <= 0) { cur = [s[0], s[1]]; break; } }
  if (!cur) cur = [startPool[0][0], startPool[0][1]];

  const path = [cur];
  const seen = new Set([cur[0] * cols + cur[1]]);
  while (path.length < len) {
    const [cr, cc] = path[path.length - 1];
    const opts = [];
    for (const [dr, dc] of DIRS) {
      const nr = cr + dr, nc = cc + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (seen.has(nr * cols + nc)) continue;
      // Prune inside the walk, not after it. A cell this high in a column that
      // this word could never fill is dead however the rest of the path goes,
      // and letting the walk wander up there is what made the Sunday boards
      // (empty columns, eight words to seat) reject thousands of paths in a row.
      if (rows - nr > heights[nc] + len) continue;
      opts.push([nr, nc, 1 + (rows - nr)]);
    }
    if (!opts.length) return null;
    total = opts.reduce((s, x) => s + x[2], 0);
    roll = r() * total; let nxt = null;
    for (const o of opts) { roll -= o[2]; if (roll <= 0) { nxt = [o[0], o[1]]; break; } }
    if (!nxt) nxt = [opts[0][0], opts[0][1]];
    path.push(nxt); seen.add(nxt[0] * cols + nxt[1]);
  }
  return path;
}

// Insert `word` into the column stacks along a legal path. Returns new stacks or null.
function insert(r, rows, cols, stacks, word, attempts = 2500) {
  const heights = stacks.map((s) => s.length);
  for (let t = 0; t < attempts; t++) {
    const path = randomPath(r, rows, cols, word.length, heights);
    if (!path) continue;
    const k = Array(cols).fill(0);
    for (const [, c] of path) k[c]++;
    let ok = true;
    for (let c = 0; c < cols && ok; c++) {
      if (heights[c] + k[c] > rows) ok = false;
    }
    if (!ok) continue;
    // every path cell must land inside its column's new window
    for (const [rr, cc] of path) {
      if (rows - rr > heights[cc] + k[cc]) { ok = false; break; }
    }
    if (!ok) continue;

    const mark = new Map();                            // "r,c" -> letter index
    path.forEach(([rr, cc], i) => mark.set(rr + ',' + cc, i));
    const next = [];
    for (let c = 0; c < cols; c++) {
      const h2 = heights[c] + k[c];
      const old = stacks[c];
      let oi = 0;
      const col = [];
      for (let d = 1; d <= h2; d++) {                   // d = 1 is the bottom row
        const rr = rows - d;
        const m = mark.get(rr + ',' + c);
        if (m !== undefined) col.push({ ch: word[m], word });
        else col.push(old[oi++]);
      }
      if (oi !== old.length) { ok = false; break; }
      next.push(col);
    }
    if (ok) return next;
  }
  return null;
}

// One candidate board for a given removal order. Words go in reverse.
function build(r, rows, cols, order) {
  let stacks = Array.from({ length: cols }, () => []);
  for (let i = order.length - 1; i >= 0; i--) {
    const nx = insert(r, rows, cols, stacks, order[i]);
    if (!nx) return null;
    stacks = nx;
  }
  if (stacks.some((s) => s.length !== rows)) return null;
  return stacks;
}

// Pack straight into the SHIPPED shape, so everything measured below is measured
// on the exact object that goes in the bank rather than on an intermediate the
// verifier will never see.
function packRaw(rows, cols, stacks, order, pool) {
  const idx = new Map(order.map((w, i) => [w, i]));
  const columns = [], owners = [];
  for (let c = 0; c < cols; c++) {
    let letters = '', own = '';
    for (let i = 0; i < rows; i++) { letters += stacks[c][i].ch; own += String(idx.get(stacks[c][i].word)); }
    columns.push(letters); owners.push(own);
  }
  return { rows, cols, columns, owners, words: order.slice(), pool };
}

// How many words can be read on the untouched board. One grid and one search per
// word, so it is cheap enough to run on every candidate, and it throws out the
// great majority of them before the full state walk is paid for. Skipping this
// is what made the first Sunday run appear to hang.
function openingCount(p) {
  const { cells, columns } = makeCells(p);
  const grid = gridOf(p.rows, p.cols, columns, new Set());
  let n = 0;
  for (const w of p.words) if (placements(grid, w, cells, p.rows, p.cols, 1).length) n++;
  return n;
}

// ── candidate search ─────────────────────────────────────────────────────────
export function findBoard(seed, spec) {
  const { rows, cols, wordSets, pool, maxOpening, minDepth, budget = 260, until = Infinity } = spec;
  const r = rng(seed);
  let best = null;
  for (let attempt = 0; attempt < budget; attempt++) {
    // The clock has to be inside the candidate loop, not just around it. A single
    // Sunday call with a big budget can run for minutes on an awkward word set,
    // which is exactly how the run appeared to hang on the second Sunday.
    if ((attempt & 7) === 0 && Date.now() > until) break;
    const words = pick(r, wordSets);
    const order = shuffle(r, words);
    const stacks = build(r, rows, cols, order);
    if (!stacks) continue;
    const p = packRaw(rows, cols, stacks, order, pool);
    if (openingCount(p) > maxOpening) continue;
    const a = analyse(p);
    // `exhausted === false` means a search hit the node budget, so the board was
    // not fully proved. Never ship one of those; throw it away and move on.
    if (!a.exhausted) continue;
    if (!a.cleared || a.deadEnds.length || a.ambiguous.length || a.unreachable.length) continue;
    // A word whose one readable trace runs through another word's cells reshapes
    // the board away from the `owners` map, which is what the whole proof above
    // is written against. Boards built before this check shipped dead ends the
    // state walk never saw: #5, #8, #32. Throw them away here, not in review.
    if (a.offOwner.length) continue;
    if (a.openingCount > maxOpening || a.deepest < minDepth) continue;
    const dec = decoys(p);
    if (dec.length || dec.exhausted === false) continue;
    const score = a.deepest * 100 - a.openingCount * 10 + words.length;
    if (!best || score > best.score) best = { score, p, analysis: a };
    if (a.deepest >= minDepth + 1 && a.openingCount <= 2) break;
  }
  return best;
}

export function pack(found, meta) {
  return {
    ...meta, ...found.p,
    opening: found.analysis.openingCount,
    deepest: found.analysis.deepest,
  };
}

// ── driver ───────────────────────────────────────────────────────────────────
function etDateAdd(startISO, days) {
  const d = new Date(startISO + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
function labelOf(iso) {
  const d = new Date(iso + 'T12:00:00Z');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}
function isSunday(iso) {
  return new Date(iso + 'T12:00:00Z').getUTCDay() === 0;
}

// RESUMABLE. Each run works to a wall clock and appends to strata-bank.json, so
// a long bank can be built across several short invocations instead of one long
// one. Rerun until it prints "complete".
function main() {
  const START = process.argv[2] || '2026-08-10';
  const DAYS = Number(process.argv[3] || 35);
  const RUN_MS = Number(process.argv[4] || 35000);
  const runUntil = Date.now() + RUN_MS;
  const BANK = new URL('./strata-bank.json', import.meta.url);
  const FREQ = JSON.parse(readFileSync(new URL('./.lode-freq.json', import.meta.url), 'utf8'));
  const themes = loadThemes(FREQ);
  // Salt lets a rerun try a different theme order on a day the previous run
  // could not seat. The OUTPUT is proved either way, so a varying seed costs
  // nothing; pass STRATA_SALT to shuffle the deck again.
  const r = rng(90210 + (existsSync(BANK) ? statSync(BANK).size : 0) + Number(process.env.STRATA_SALT || 0) * 7919);

  const out = existsSync(BANK) ? JSON.parse(readFileSync(BANK, 'utf8')) : [];
  // A theme may not come round again inside 14 days, so a resumed run has to
  // know what the earlier runs already used.
  const recent = new Map();
  out.forEach((p, i) => (p.themes || []).forEach((t) => recent.set(t, i + 1)));

  let themeCursor = shuffle(r, themes.map((_, i) => i));
  let ci = 0;
  // Draw a theme that satisfies the day's rule and has enough vocabulary ABOVE
  // the day's Zipf floor to actually fill the grid. Later in the week we prefer
  // the hardest tier still allowed, so the everyday categories are not all spent
  // on Thursdays and missing when Monday comes round.
  const nextTheme = (num, rule, needLetters) => {
    const eligible = [];
    for (let guard = 0; guard < themes.length * 2; guard++) {
      if (ci >= themeCursor.length) { themeCursor = shuffle(r, themeCursor); ci = 0; }
      const t = themes[themeCursor[ci++]];
      const prev = recent.get(t.name);
      if (prev !== undefined && num - prev < 14) continue;
      if (t.tier > rule.maxTier) continue;
      const usable = t.pool.filter((w) => t.zipf(w) >= rule.minZipf);
      if (usable.reduce((s, w) => s + w.length, 0) < needLetters) continue;
      eligible.push({ ...t, usable });
      if (eligible.length >= 6) break;
    }
    if (!eligible.length) return null;
    const best = Math.max(...eligible.map((t) => t.tier));
    const top = eligible.filter((t) => t.tier === best);
    return pick(r, top);
  };

  let num = out.length;
  for (let d = out.length; d < DAYS; d++) {
    if (Date.now() > runUntil) { console.error(`… out of time, ${out.length} of ${DAYS} done, rerun to continue`); break; }
    const live = etDateAdd(START, d);
    const sunday = isSunday(live);
    const rule = dayRule(live);
    // A per-day deadline. Some theme pools simply cannot seat eight words on a
    // 6x7 grid at the tight gate, and without a clock the run just sits there
    // (which it did, twice, before this was added).
    const deadline = Math.min(Date.now() + (sunday ? 70000 : 25000), runUntil);
    let found = null, used = null, tries = 0;
    while (!found && tries < 26 && Date.now() < deadline) {
      tries++;
      if (sunday) {
        const a = nextTheme(num + 1, rule, 20), b = nextTheme(num + 1, rule, 20);
        if (!a || !b || a.name === b.name) continue;
        const rows = 7, cols = 6, target = 42;
        // two threads, each contributing at least three words
        // Both threads are drawn to an exact letter budget so the two halves of the
        // grid come out comparable, and neither thread can be guessed just from
        // having far more letters on the board than the other.
        // 9 words is the hard ceiling: `owners` encodes the cell-to-word map as one
        // digit per cell, so a tenth word would need two characters.
        const sets = [];
        for (let sumA = 16; sumA <= 26 && sets.length < 40; sumA++) {
          const left = cachedSubsets(r, a.name + rule.minZipf, a.usable, sumA, 3, 5);
          const right = cachedSubsets(r, b.name + rule.minZipf, b.usable, target - sumA, 3, 5);
          if (!left.length || !right.length) continue;
          for (let t = 0; t < 6 && sets.length < 40; t++) {
            const combo = pick(r, left).concat(pick(r, right));
            if (combo.length >= 7 && combo.length <= 9) sets.push(combo);
          }
        }
        if (process.env.STRATA_TRACE) console.error(`   [${live} try ${tries}] ${a.name}+${b.name} sets=${sets.length} t=${Date.now() - (deadline - 70000)}ms`);
        if (!sets.length) continue;
        const sunSpec ={ rows, cols, wordSets: sets, pool: a.pool.concat(b.pool), maxOpening: 3, minDepth: 4, budget: 240, until: deadline };
        found = findBoard((d + 1) * 7919 + tries, sunSpec);
        if (!found && tries >= 5) found = findBoard((d + 1) * 7919 + tries, { ...sunSpec, minDepth: 3, until: deadline + 20000 });
        used = { themes: [a.name, b.name], pool: a.pool.concat(b.pool), tier: Math.max(a.tier, b.tier) };
      } else {
        const th = nextTheme(num + 1, rule, 32);
        if (!th) continue;
        const sets = cachedSubsets(r, th.name + rule.minZipf, th.usable, 25, 5, 7);
        if (!sets.length) continue;
        // Ask for a properly gated board first (at most two words readable at the
        // start, something buried three deep). Only if a theme cannot produce one
        // after several passes do we take a softer board, so the bank is not
        // hostage to one awkward word pool.
        const tight = { rows: 5, cols: 5, wordSets: sets, pool: th.pool, maxOpening: 2, minDepth: 3, budget: 700, until: deadline };
        found = findBoard((d + 1) * 104729 + tries, tight);
        if (!found && tries >= 8) found = findBoard((d + 1) * 104729 + tries, { ...tight, maxOpening: 3, minDepth: 2, budget: 500, until: deadline + 10000 });
        used = { themes: [th.name], pool: th.pool, tier: th.tier };
      }
    }
    if (!found) { console.error(`✗ no board for ${live}${sunday ? ' (SUNDAY)' : ''} after ${tries} theme(s)`); break; }
    num++;
    for (const t of used.themes) recent.set(t, num);
    const lowest = Math.min(...found.p.words.map((w) => FREQ[w.toLowerCase()]));
    out.push(pack(found, {
      num, quizId: `strata-${Number(live.slice(5, 7))}-${Number(live.slice(8, 10))}-${live.slice(2, 4)}`,
      live, dateLabel: labelOf(live), sunday, themes: used.themes, pool: used.pool,
      tier: used.tier, minZipf: Number(lowest.toFixed(2)),
    }));
    const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(live + 'T12:00:00Z').getUTCDay()];
    console.error(`${live} ${dow}${sunday ? '*' : ' '} t${used.tier} ${used.themes.join(' + ').padEnd(30)} w=${found.p.words.length} open=${found.analysis.openingCount} depth=${found.analysis.deepest} rarest=${lowest.toFixed(2)}(floor ${rule.minZipf})`);
    writeFileSync(BANK, JSON.stringify(out, null, 1));
  }
  writeFileSync(BANK, JSON.stringify(out, null, 1));
  console.error(out.length >= DAYS ? `\ncomplete: ${out.length} boards` : `\npartial: ${out.length} of ${DAYS} boards`);
}

if (process.argv[1] && process.argv[1].endsWith('strata-gen.mjs')) main();
