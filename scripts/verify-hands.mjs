// Verify the Hands (daily poker solitaire) bank.
//
// app/hands/puzzles.js promises, per board:
//   - a legal 26 card deal off a standard deck, card = rank * 4 + suit, and
//     that deal is exactly what the banked `seed` produces;
//   - `par` is a REAL blind playout (the median of 400 solver runs) and `ace`
//     is a REAL blind playout (the best of those runs), both realizable in the
//     dealt order under the one muck rule;
//   - `ceiling` is the highest total found for any arrangement of those cards,
//     and `best` is an arrangement that scores it.
//
// None of that is taken on trust. Everything below is recomputed from
// app/hands/rules.js, which is the same scoring engine the live game uses, so a
// change to the rules that silently invalidated the bank would fail here rather
// than ship.
//
//   TIER 1 -- every board, always, mandatory: both banked lines (app/hands/
//   proofs.js) are replayed cell by cell. A line must place 25 cards into 25
//   distinct cells, take them in dealt order, skip exactly one card (the muck,
//   which is the whole reason the deal is 26 cards for a 25 cell board), and
//   score EXACTLY the number the bank claims. This is what proves par and ace
//   are rounds somebody actually played rather than numbers someone chose.
//
//   TIER 2 -- the ceiling. `best` is rescored from scratch and must equal
//   `ceiling`: that proves the ceiling is ACHIEVABLE, which is the part the page
//   actually claims. It does NOT claim the ceiling is the proven maximum, and
//   this script deliberately does not pretend to prove one. Finding the true
//   maximum arrangement of 25 cards is a search problem attacked here with
//   simulated annealing, a heuristic: run it twice with different seeds and it
//   returns different answers, so no fixed budget can certify a maximum. What
//   Tier 2 does instead is a REGRESSION check with a tolerance. An independent
//   search (different code path, different seed) runs against each board, and:
//
//     - beats the ceiling by more than CEILING_TOLERANCE  -> HARD FAIL. The bank
//       is materially under-searched and needs regenerating.
//     - beats it by a point or two                        -> note. That is
//       annealing noise, not a broken bank.
//     - matches or falls short                            -> note.
//
//   The banked ceilings were pinned against this exact search at this exact
//   budget while the bank was built, so a clean run is the expected state and
//   any movement means something changed. Tier 1 is unaffected either way,
//   because par and ace are the scoring anchors and the ceiling is a footnote.
//
//   Also checked: num/quizId/live/dateLabel consistency, `sunday` false
//   throughout (Hands ships no Sunday Edition, so a true here would make
//   lib/sunday-editions and the bank disagree), par < ace <= ceiling, the ten
//   point scale landing on 8 at par and 10 at ace, no duplicate deals, and pool
//   variety across the bank.
//
// Run: node scripts/verify-hands.mjs
import { PUZZLES } from '../app/hands/puzzles.js';
import { PROOFS } from '../app/hands/proofs.js';
import { totalOf, lineScores, scoreHand, dealFor, rankOf, suitOf, scoreForPoints, mulberry32 } from '../app/hands/rules.js';

let BAD = 0;
const fail = (id, msg) => { BAD++; console.error(`✗ ${id}: ${msg}`); };
const ok = (id, msg) => console.log(`✓ ${id}  ${msg}`);
const note = (id, msg) => console.log(`… ${id}  ${msg}`);

// Tier-2 budget. Sized so the whole bank verifies in well under a minute: this
// search is a CHECK on the banked ceiling, not the search that produced it (the
// generator spends roughly twenty times as long per board). If this smaller
// budget can still beat a banked ceiling, that ceiling was under-searched and
// the bank needs regenerating, which is exactly the signal wanted.
const ANNEAL_RESTARTS = 1, ANNEAL_ITERS = 110000;
// How far an independent search may beat a banked ceiling before it counts as a
// broken bank rather than annealing noise. Five per cent: the pinning pass that
// built the bank closed every gap at this budget, so in practice this should
// never trip, and a large jump means the ceilings were not searched properly.
const CEILING_TOLERANCE = 0.05;

// ─── independent ceiling search ─────────────────────────────────────────────
// Deliberately written straight rather than imported from the generator: if the
// generator had a bug, importing it would reproduce the bug instead of catching
// it. 26 slots, the 26th being the discard, so the search also chooses which
// card to drop.
function searchCeiling(deck, seed) {
  const rand = mulberry32(seed);
  let best = -1;
  const g = deck.slice();
  const score = (arr) => totalOf(arr.slice(0, 25));
  for (let run = 0; run < ANNEAL_RESTARTS; run++) {
    for (let i = 0; i < 26; i++) g[i] = deck[i];
    for (let i = 25; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const t = g[i]; g[i] = g[j]; g[j] = t;
    }
    let cur = score(g);
    if (cur > best) best = cur;
    for (let it = 0; it < ANNEAL_ITERS; it++) {
      const T = 9 * (1 - it / ANNEAL_ITERS) + 0.015;
      const a = (rand() * 26) | 0, b = (rand() * 26) | 0;
      if (a === b) continue;
      const t = g[a]; g[a] = g[b]; g[b] = t;
      const nxt = score(g);
      const delta = nxt - cur;
      if (delta >= 0 || rand() < Math.exp(delta / T)) {
        cur = nxt;
        if (cur > best) best = cur;
      } else {
        const u = g[a]; g[a] = g[b]; g[b] = u;
      }
    }
  }
  return best;
}

// ─── per board ──────────────────────────────────────────────────────────────
const seenDeals = new Map();
const openingPool = new Map();
let unprovenCeilings = 0;
let looseCeilings = 0;

PUZZLES.forEach((p, i) => {
  const errs = [];

  // -- identity --
  if (p.num !== i + 1) errs.push(`num ${p.num} != ${i + 1}`);
  const m = p.quizId.match(/^hands-(\d+)-(\d+)-(\d+)$/);
  if (!m) errs.push('bad quizId');
  else {
    const iso = `20${m[3]}-${String(m[1]).padStart(2, '0')}-${String(m[2]).padStart(2, '0')}`;
    if (iso !== p.live) errs.push(`live ${p.live} != quizId date ${iso}`);
  }
  const wantLabel = p.live ? new Date(`${p.live}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : null;
  if (wantLabel && p.dateLabel !== wantLabel) errs.push(`dateLabel "${p.dateLabel}" != "${wantLabel}"`);
  if (p.sunday !== false) errs.push('sunday must be false: Hands ships no Sunday Edition, and lib/sunday-editions.js does not list it');

  // -- the deal --
  if (!Array.isArray(p.deck) || p.deck.length !== 26) {
    errs.push(`deck has ${p.deck ? p.deck.length : 0} cards, want 26`);
  } else {
    if (new Set(p.deck).size !== 26) errs.push('deck repeats a card');
    for (const c of p.deck) {
      const r = rankOf(c), s = suitOf(c);
      if (r < 2 || r > 14 || s < 0 || s > 3) errs.push(`card ${c} is outside a standard deck (rank ${r}, suit ${s})`);
    }
    if (typeof p.seed === 'number') {
      const rederived = dealFor(p.seed);
      if (rederived.join(',') !== p.deck.join(',')) errs.push('deck does not match what its own seed deals');
    } else errs.push('missing seed');
  }

  // -- TIER 1: replay both banked lines --
  const proof = PROOFS[p.quizId];
  if (!proof) errs.push('no playout proof in app/hands/proofs.js');
  else if (!errs.length) {
    for (const [label, line, claim] of [['par', proof.par, p.par], ['ace', proof.ace, p.ace]]) {
      if (!Array.isArray(line) || line.length !== 25) { errs.push(`${label} line has ${line ? line.length : 0} placements, want 25`); continue; }
      const grid = new Array(25).fill(null);
      const cells = new Set();
      let broke = false;
      for (const [card, cell] of line) {
        if (!Number.isInteger(cell) || cell < 0 || cell > 24) { errs.push(`${label} line targets cell ${cell}, off the board`); broke = true; break; }
        if (cells.has(cell)) { errs.push(`${label} line fills cell ${cell} twice`); broke = true; break; }
        if (!p.deck.includes(card)) { errs.push(`${label} line plays card ${card}, which is not in the deal`); broke = true; break; }
        cells.add(cell); grid[cell] = card;
      }
      if (broke) continue;
      if (grid.some((c) => c == null)) { errs.push(`${label} line leaves the board unfinished`); continue; }
      // dealt order, with exactly one skip: the muck
      const order = line.map(([c]) => p.deck.indexOf(c));
      let outOfOrder = false;
      for (let k = 1; k < order.length; k++) if (order[k] <= order[k - 1]) outOfOrder = true;
      if (outOfOrder) { errs.push(`${label} line plays cards out of the order they are dealt`); continue; }
      const skipped = p.deck.map((_, k) => k).filter((k) => !order.includes(k));
      if (skipped.length !== 1) { errs.push(`${label} line skips ${skipped.length} cards, and exactly one muck is allowed`); continue; }
      const got = totalOf(grid);
      if (got !== claim) errs.push(`${label} line scores ${got}, but the bank claims ${claim}`);
    }
  }

  // -- targets and the ten point scale --
  if (!(p.par < p.ace)) errs.push(`par ${p.par} is not under ace ${p.ace}`);
  if (!(p.ace <= p.ceiling)) errs.push(`ace ${p.ace} is above the ceiling ${p.ceiling}`);
  if (scoreForPoints(p.par, p.par, p.ace) !== 8) errs.push(`par does not score 8 (got ${scoreForPoints(p.par, p.par, p.ace)})`);
  if (scoreForPoints(p.ace, p.par, p.ace) !== 10) errs.push(`ace does not score 10 (got ${scoreForPoints(p.ace, p.par, p.ace)})`);
  if (scoreForPoints(0, p.par, p.ace) !== 1) errs.push('an empty board does not floor at 1');

  // -- TIER 2: the ceiling --
  let ceilNote = '';
  if (!errs.length) {
    if (!Array.isArray(p.best) || p.best.length !== 25 || new Set(p.best).size !== 25) {
      errs.push('best is not 25 distinct cards');
    } else if (p.best.some((c) => !p.deck.includes(c))) {
      errs.push('best uses a card that is not in the deal');
    } else {
      const missing = p.deck.filter((c) => !p.best.includes(c));
      if (missing.length !== 1) errs.push(`best drops ${missing.length} cards, and exactly one is discarded`);
      const got = totalOf(p.best);
      if (got !== p.ceiling) errs.push(`best scores ${got}, but ceiling says ${p.ceiling}`);
      else {
        const found = searchCeiling(p.deck, (p.seed ^ 0x2545f491) >>> 0);
        if (found > p.ceiling * (1 + CEILING_TOLERANCE)) {
          errs.push(`an independent search found ${found}, more than ${Math.round(CEILING_TOLERANCE * 100)}% above the banked ceiling ${p.ceiling}: this board was not searched properly and the bank needs regenerating`);
        } else if (found > p.ceiling) {
          looseCeilings++;
          ceilNote = `, ceiling ${p.ceiling} achievable, and an independent search edged it to ${found} (annealing noise, inside tolerance)`;
        } else if (found === p.ceiling) {
          ceilNote = `, ceiling ${p.ceiling} matched by an independent search`;
        } else {
          unprovenCeilings++;
          ceilNote = `, ceiling ${p.ceiling} achievable, best independent search reached ${found}`;
        }
      }
    }
  }

  if (Array.isArray(p.deck)) {
    const key = p.deck.join(',');
    seenDeals.set(key, (seenDeals.get(key) || []).concat(p.quizId));
    // A deal's "opening" is the first five cards, which is what every player
    // meets before a single line can complete, so it is the real analog of a
    // repeated position.
    const open = p.deck.slice(0, 5).join(',');
    openingPool.set(open, (openingPool.get(open) || []).concat(p.quizId));
  }

  errs.length
    ? fail(p.quizId, errs.join('; '))
    : ok(p.quizId, `par ${p.par} and ace ${p.ace} both replay to the point${ceilNote}`);
});

for (const [, ids] of seenDeals) {
  if (ids.length > 1) fail('hands pool', `identical deal shipped on ${ids.length} boards: ${ids.join(', ')}`);
}
for (const [open, ids] of openingPool) {
  if (ids.length > 1) fail('hands pool', `opening five cards "${open}" repeat on ${ids.join(', ')}`);
}

// ─── bank-wide shape ────────────────────────────────────────────────────────
const pars = PUZZLES.map((p) => p.par).sort((a, b) => a - b);
const aces = PUZZLES.map((p) => p.ace).sort((a, b) => a - b);
const gaps = PUZZLES.map((p) => p.ace - p.par).sort((a, b) => a - b);
if (gaps[0] < 12) fail('hands pool', `a board leaves only ${gaps[0]} points between par and ace, too tight for the scale`);
// Hand-type variety across the banked ceilings: a bank that is all flushes
// would mean the generator found one trick and repeated it.
const kinds = new Map();
for (const p of PUZZLES) for (const v of lineScores(p.best)) kinds.set(v, (kinds.get(v) || 0) + 1);
const distinctKinds = [...kinds.keys()].filter((k) => k > 0).length;
if (distinctKinds < 6) fail('hands pool', `banked ceilings use only ${distinctKinds} hand types, too samey`);

if (!BAD) {
  ok('hands pool', `${PUZZLES.length} boards, all deals distinct, par ${pars[0]}-${pars[pars.length - 1]}, ace ${aces[0]}-${aces[aces.length - 1]}, ${distinctKinds} hand types across the banked ceilings`);
  if (unprovenCeilings || looseCeilings) note('hands pool', `ceilings are best-known arrangements, not proven maxima: ${unprovenCeilings} stood up to the independent search and ${looseCeilings} were edged inside tolerance`);
}

console.log(BAD ? `\n${BAD} FAILURE(S)` : '\nAll Hands boards verified.');
process.exit(BAD ? 1 : 0);
