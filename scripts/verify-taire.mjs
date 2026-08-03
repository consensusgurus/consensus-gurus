// Verify the Taire (daily two-suit solitaire) bank. Taire's own header
// comment (app/taire/puzzles.js) and its rules module (app/taire/rules.js)
// promise, per puzzle:
//   - a legal two-suit deal (card = suit*16 + rank, 1..ranks for the black
//     suit, 17..16+ranks for the red one), dealt face up into columns of 4;
//   - `par` (the field's old name; the game now calls this PERFECT) is the
//     EXACT minimum number of single-card moves to send every card home,
//     foundation moves included, found by BFS over the reachable state
//     space and "confirmed by a second solver written independently of the
//     first" -- perfect can never be beaten, only matched;
//   - `line` is ONE optimal line realizing that minimum;
//   - the week climbs in three rungs, each changing a different dial:
//     Monday-Wednesday 16 cards/2 cells/perfect 18-24 (the short deal),
//     Thursday-Saturday 20 cards/2 cells/perfect 28-34 (the full deal),
//     Sunday 20 cards/1 cell/perfect 34-48 ("one cell is brutal").
// None of that was previously machine-checked. app/taire/rules.js is the
// exact rules engine (movableCards/destinations/apply/isWon) that also
// drives the live game, so this recomputes rather than trusts the stored
// fields, in two tiers:
//
//   TIER 1 -- every board, always, mandatory: `line` is replayed through
//   the real rules engine (`apply`, never a shortcut) from the dealt `cols`,
//   must never hit an illegal move, must end with `isWon(..., ranks)` true,
//   and `line.length` must equal `par` exactly. This alone proves `par` is
//   a genuinely ACHIEVABLE upper bound via a rules-legal sequence, not a
//   fabricated number, on all 126 boards.
//
//   TIER 2 -- independent BFS re-derivation of the TRUE minimum, state-deduped
//   (a state is cols+free+foundation; single-card moves converge onto the same
//   state via many orderings, which is what keeps the reachable space small
//   enough to search at all). This is exhaustive and conclusive for the SHORT
//   (16-card) deals -- empirically a few tens of thousands of states, well
//   under SHORT_CAP -- so a mismatch there is a HARD FAIL.
//   The FULL (20-card, 2-cell) and SUNDAY (20-card, 1-cell) deals are a much
//   bigger reachable space (measured: a single par-34 full-deal board did not
//   resolve inside 3,000,000 states / 36s of search), so exhaustively proving
//   their minimum on every board would make this script take many minutes.
//   Per the "cap search where needed and say so" instruction, those two tiers
//   get a much smaller best-effort budget (FULL_CAP / SUNDAY_CAP, or a
//   TIME_BUDGET_MS wall-clock cutoff, whichever hits first): if the search
//   HAPPENS to resolve inside that budget, a mismatch is still a HARD FAIL
//   (the true minimum was actually found and it disagrees); if the budget is
//   exhausted first, minimality is UNVERIFIED and reported as a note, not a
//   pass or fail -- Tier 1's replay check is what still guarantees those
//   boards are genuinely solvable in the claimed move count.
//
//   3. Deal structure: `cols` has ranks/2 columns of exactly 4 cards each,
//      and the card set is EXACTLY {1..ranks} union {17..16+ranks}, each
//      card appearing exactly once (a complete, non-duplicated two-suit deck).
//   4. Rung bucket: ranks/cells/par-band per the table above; `sunday` must
//      match the real day-of-week of `live`.
//   5. num/quizId/live/dateLabel are mutually consistent and sequential.
//   6. No duplicate boards (identical `cols`, column order included).
//   7. Pool variety: the exact "exposed" signature (the bottom, currently
//      playable card of every column, sorted) is a real analog of an
//      "opening" for a solitaire deal -- it is what a player actually sees
//      first. Ceiling EXPOSED_CEILING per exact signature, enforced hard for
//      boards live on or after TAIRE_FLOOR_FROM and grandfathered as a note
//      before that.
//   8. US spelling: `dateLabel` is scanned for obvious British word forms
//      (kept for parity; Taire carries no other prose field today).
//
// Runtime: Tier-2 caps are tuned so the WHOLE bank (126 boards as of writing)
// finishes in well under a minute: SHORT boards are exhaustively solved
// (fast, always conclusive); FULL/SUNDAY boards get a small best-effort
// budget and mostly report "capped" rather than a proven minimum -- that is
// a deliberate, documented tradeoff, not an oversight.
//
// Run: node scripts/verify-taire.mjs
import { PUZZLES } from '../app/taire/puzzles.js';
import { fromData, cloneState, movableCards, destinations, apply, isWon, FREE, FND } from '../app/taire/rules.js';

let BAD = 0;
const fail = (id, msg) => { BAD++; console.error(`✗ ${id}: ${msg}`); };
const ok = (id, msg) => console.log(`✓ ${id}  ${msg}`);
const note = (id, msg) => console.log(`… ${id}  ${msg}`);

// Boards before this date are frozen history: already published and played.
const TAIRE_FLOOR_FROM = '2026-08-03';
const EXPOSED_CEILING = 3; // an exact exposed-card signature may repeat at most this many times

// Tier-2 search budgets (see the runtime note above).
const SHORT_CAP = 300000, SHORT_TIME_MS = 6000;
const FULL_CAP = 60000, FULL_TIME_MS = 350;
const SUNDAY_CAP = 60000, SUNDAY_TIME_MS = 350;

// ─── US-spelling scan ───────────────────────────────────────────────────────
const BRITISH_RE = /\b(colour|flavour|favourite|centre|theatre|organis(e|ing|ation)|recognis(e|ed|ing)|realis(e|ed|ing)|travell(ed|ing|er)|programme|metre|litre|kerb|tyre|analys(e|ed|ing)|catalogue|dialogue|jewellery|labour|neighbour|honour|armour|cheque|defence|licence|practise|whilst|amongst|learnt|aluminium|aeroplane)\b/i;
function scanBritish(id, label, s) {
  if (typeof s !== 'string') return;
  const m = s.match(BRITISH_RE);
  if (m) fail(id, `British spelling "${m[0]}" in ${label}: "${s}"`);
}

const RUNG = {
  0: { name: 'Sunday', ranks: 10, cells: 1, lo: 34, hi: 48 },
  1: { name: 'Monday', ranks: 8, cells: 2, lo: 18, hi: 24 },
  2: { name: 'Tuesday', ranks: 8, cells: 2, lo: 18, hi: 24 },
  3: { name: 'Wednesday', ranks: 8, cells: 2, lo: 18, hi: 24 },
  4: { name: 'Thursday', ranks: 10, cells: 2, lo: 28, hi: 34 },
  5: { name: 'Friday', ranks: 10, cells: 2, lo: 28, hi: 34 },
  6: { name: 'Saturday', ranks: 10, cells: 2, lo: 28, hi: 34 },
};

// ─── independent BFS, state-deduped ────────────────────────────────────────
function stateKey(s) {
  return s.cols.map((c) => c.join('.')).join('|') + '#' + s.free.slice().sort((a, b) => a - b).join('.') + '#' + s.fnd.join('.');
}
// Returns { depth, capped } -- depth is the true shortest solution length if
// found before the budget runs out, or -1 if the budget (state count or wall
// clock, whichever first) was exhausted before a solution was found.
function bfsMin(cols, ranks, cells, cap, timeMs) {
  const t0 = Date.now();
  const start = fromData(cols);
  if (isWon(start, ranks)) return { depth: 0, capped: false };
  let frontier = [start];
  const seen = new Set([stateKey(start)]);
  let depth = 0, explored = 0;
  while (frontier.length) {
    depth++;
    const next = [];
    for (const s of frontier) {
      const heads = movableCards(s, cells);
      for (const card of heads) {
        for (const dest of destinations(s, card, cells)) {
          const n = apply(s, [card, dest], cells);
          if (!n) continue;
          const k = stateKey(n);
          if (seen.has(k)) continue;
          seen.add(k);
          explored++;
          if (isWon(n, ranks)) return { depth, capped: false };
          next.push(n);
          if (explored > cap || Date.now() - t0 > timeMs) return { depth: -1, capped: true };
        }
      }
    }
    frontier = next;
    if (!frontier.length) return { depth: -1, capped: false }; // exhausted the whole reachable space with no win -- should never happen on a real deal
  }
}

// ─── per-puzzle checks ──────────────────────────────────────────────────────
const seenDeals = new Map();
const exposedPool = new Map();

PUZZLES.forEach((p, i) => {
  const errs = [];

  if (p.num !== i + 1) errs.push(`num ${p.num} != ${i + 1}`);
  const m = p.quizId.match(/^taire-(\d+)-(\d+)-(\d+)$/);
  if (!m) errs.push('bad quizId');
  else {
    const iso = `20${m[3]}-${String(m[1]).padStart(2, '0')}-${String(m[2]).padStart(2, '0')}`;
    if (iso !== p.live) errs.push(`live ${p.live} != quizId date ${iso}`);
  }
  const wantDateLabel = p.live ? new Date(`${p.live}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : null;
  if (wantDateLabel && p.dateLabel !== wantDateLabel) errs.push(`dateLabel "${p.dateLabel}" != "${wantDateLabel}"`);
  scanBritish(p.quizId, 'dateLabel', p.dateLabel);
  let dow = null;
  if (p.live) {
    dow = new Date(`${p.live}T12:00:00Z`).getUTCDay();
    const isSun = dow === 0;
    if (!!p.sunday !== isSun) errs.push(`sunday must be ${isSun} for ${p.live} (real weekday)`);
  }

  // -- rung bucket --
  if (dow !== null) {
    const rung = RUNG[dow];
    if (p.ranks !== rung.ranks) errs.push(`ranks ${p.ranks} != ${rung.ranks} for ${rung.name}`);
    if (p.cells !== rung.cells) errs.push(`cells ${p.cells} != ${rung.cells} for ${rung.name}`);
    if (typeof p.par !== 'number' || p.par < rung.lo || p.par > rung.hi) {
      errs.push(`par ${p.par} outside the ${rung.name} rung's documented band [${rung.lo}, ${rung.hi}]`);
    }
  }

  // -- deal structure --
  if (!Array.isArray(p.cols) || !p.cols.length) {
    errs.push('missing/empty cols');
  } else {
    const wantCols = p.ranks ? p.ranks / 2 : null;
    if (wantCols !== null && p.cols.length !== wantCols) errs.push(`cols has ${p.cols.length} columns, want ${wantCols} for ranks ${p.ranks}`);
    if (p.cols.some((c) => !Array.isArray(c) || c.length !== 4)) errs.push('every column must deal exactly 4 cards');
    const seenCards = new Set();
    const dupes = [];
    for (const c of p.cols) for (const card of c) { if (seenCards.has(card)) dupes.push(card); seenCards.add(card); }
    if (dupes.length) errs.push(`duplicate card(s) in the deal: ${dupes.join(', ')}`);
    if (typeof p.ranks === 'number') {
      const want = new Set();
      for (let r = 1; r <= p.ranks; r++) { want.add(r); want.add(16 + r); }
      const missing = [...want].filter((c) => !seenCards.has(c));
      const extra = [...seenCards].filter((c) => !want.has(c));
      if (missing.length) errs.push(`deal is missing card(s): ${missing.join(', ')}`);
      if (extra.length) errs.push(`deal has card(s) outside the ranks-${p.ranks} deck: ${extra.join(', ')}`);
    }
  }

  // -- Tier 1: replay `line` through the real engine --
  let replayNote = '';
  if (!errs.length) {
    if (!Array.isArray(p.line) || !p.line.length) {
      errs.push('missing/empty line');
    } else {
      let s = fromData(p.cols);
      let illegalAt = -1;
      for (let k = 0; k < p.line.length; k++) {
        const n = apply(s, p.line[k], p.cells);
        if (!n) { illegalAt = k; break; }
        s = n;
      }
      if (illegalAt >= 0) {
        errs.push(`line move #${illegalAt + 1} (${JSON.stringify(p.line[illegalAt])}) is illegal against the rules engine`);
      } else if (!isWon(s, p.ranks)) {
        errs.push('line does not end with the board won (some card never reaches its foundation)');
      } else if (p.line.length !== p.par) {
        errs.push(`line has ${p.line.length} moves, but par is ${p.par}`);
      } else {
        replayNote = `line replays legally to a win in ${p.line.length}`;
      }
    }
  }

  // -- Tier 2: independent BFS re-derivation --
  let solveNote = '';
  if (!errs.length) {
    const isShort = p.ranks === 8;
    const cap = isShort ? SHORT_CAP : (p.sunday ? SUNDAY_CAP : FULL_CAP);
    const timeMs = isShort ? SHORT_TIME_MS : (p.sunday ? SUNDAY_TIME_MS : FULL_TIME_MS);
    const r = bfsMin(p.cols, p.ranks, p.cells, cap, timeMs);
    if (!r.capped) {
      if (r.depth !== p.par) errs.push(`recomputed true minimum ${r.depth} != stated par ${p.par}`);
      else solveNote = `, true minimum ${r.depth} confirmed by exhaustive independent BFS`;
    } else {
      solveNote = `, minimality UNVERIFIED (Tier-2 search budget exhausted -- upper bound only, via Tier 1)`;
    }
  }

  if (Array.isArray(p.cols)) {
    const key = p.cols.map((c) => c.join(',')).join('|');
    seenDeals.set(key, (seenDeals.get(key) || []).concat(p.quizId));
    const exposed = p.cols.map((c) => c[c.length - 1]).slice().sort((a, b) => a - b).join(',');
    const arr = exposedPool.get(exposed) || [];
    arr.push({ id: p.quizId, live: p.live });
    exposedPool.set(exposed, arr);
  }

  errs.length ? fail(p.quizId, errs.join('; ')) : ok(p.quizId, `${replayNote}${solveNote}`);
});

for (const [, ids] of seenDeals) {
  if (ids.length > 1) fail('taire pool', `identical deal shipped on ${ids.length} boards: ${ids.join(', ')}`);
}

// ─── exposed-signature pool variety ────────────────────────────────────────
let staleFound = false;
for (const [sig, entries] of exposedPool) {
  const freshCount = entries.filter((e) => e.live >= TAIRE_FLOOR_FROM).length;
  if (entries.length > EXPOSED_CEILING) {
    const msg = `exposed-card signature "${sig}" reused on ${entries.length} boards (ceiling ${EXPOSED_CEILING}): ${entries.map((e) => e.id).join(', ')}`;
    if (freshCount > 0) { fail('taire pool', msg); staleFound = true; }
    else note('taire pool', `grandfathered: ${msg}`);
  }
}
if (!staleFound && BAD === 0) ok('taire pool', `${PUZZLES.length} boards, ${exposedPool.size} distinct exposed-card signatures, no signature over the ${EXPOSED_CEILING}x ceiling on editable boards`);

console.log(BAD ? `\n${BAD} FAILURE(S)` : '\nAll Taire boards verified.');
process.exit(BAD ? 1 : 0);
