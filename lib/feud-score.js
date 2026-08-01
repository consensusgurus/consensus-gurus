// Shared Feud adaptive scoring. Extracted (like lib/outwit-score.js and
// lib/outrank-score.js) so BOTH the live result board (/api/feud) and the
// daily/combined leaderboard (/api/quiz/daily-combined) score Feud with the
// EXACT same code.
//
// Feud is the daily crowd-survey game: five everyday prompts, up to three
// free-text answers each. There is NO hidden answer key — the key is the live
// tally of what today's players themselves say, so it is ADAPTIVE exactly like
// Outwit and Outrank: recomputed from scratch on every request, shifting all
// day as new players lock in.
//
// A player's stored answers array is one raw-text array per prompt:
//   [["scroll my phone", "watch tv", "read"], ["coffee"], ...]
//
// BUCKETING: free text is grouped into answer buckets. Each prompt carries a
// hand-written set of canonical buckets (display label + alias keys). Matching
// is deliberately GENEROUS and token-based (lib/feud-match.js): it scores
// every bucket and keeps the best, so plurals, tense, filler words, synonyms,
// compound-word spacing and single-character typos all resolve to the bucket
// the player meant. Anything matching no canonical bucket forms a dynamic
// bucket keyed by its normalized string, so two players typing the same
// oddball answer still find each other.
//
// SCORING: an answer pays the share (integer percent) of the crowd that gave
// its bucket. Duplicate buckets within one player's prompt count once. A
// prompt maxes at 100 (theoretical), the day at prompts x 100 = 500.
//
// LEAVE-ONE-OUT: a player is graded on the crowd MINUS their own answers, so
// an answer nobody else gives pays ZERO and self-votes never pay. Symmetric
// with Outwit/Outrank.
//
// HOUSE POOL: each prompt ships ~40 pre-written house votes (indices into its
// canonical buckets) that seed the pool until more than HOUSE_CUTOFF real
// players are in; then the house retires for everyone, pool-wide.

import { COMPLETION_MAX, PLACEMENT_MAX } from './daily-combined';
import { promptMatcher } from './feud-match';

// The acceptance layer (normalization + bucket matching) lives in
// lib/feud-match.js so it has no imports and scripts/verify-feud.mjs can
// audit it directly. Re-exported here so existing importers keep working.
export { normAnswer, matchScore, tokensOf } from './feud-match';

// house retires once MORE than this many real players are in (pool-wide flag).
export const HOUSE_CUTOFF = 10;
export const MAX_ANSWERS_PER_PROMPT = 3;
export const MAX_ANSWER_LEN = 48;
export const BOARD_SIZE = 8;   // the revealed board: top 8 buckets

// Title-case a normalized dynamic-bucket string for display.
function labelOfDynamic(id) {
  const t = id.slice(2);
  return t.replace(/\b[a-z]/g, (ch) => ch.toUpperCase());
}

// Is `answers` a valid Feud ballot for this puzzle? One array per prompt, each
// holding 1..MAX_ANSWERS_PER_PROMPT non-empty strings within the length cap.
export function validBallot(answers, puzzle) {
  const P = (puzzle.prompts || []).length;
  if (!Array.isArray(answers) || answers.length !== P) return false;
  for (const arr of answers) {
    if (!Array.isArray(arr) || arr.length < 1 || arr.length > MAX_ANSWERS_PER_PROMPT) return false;
    let nonEmpty = 0;
    for (const a of arr) {
      if (typeof a !== 'string' || a.length > MAX_ANSWER_LEN) return false;
      if (normAnswer(a)) nonEmpty++;
    }
    if (!nonEmpty) return false;
  }
  return true;
}

// Trim a raw ballot into canonical stored form: strings trimmed, empties
// dropped, capped per prompt. Returns null when the result is not valid.
export function cleanBallot(answers, puzzle) {
  const P = (puzzle.prompts || []).length;
  if (!Array.isArray(answers) || answers.length !== P) return null;
  const out = answers.map((arr) => (Array.isArray(arr) ? arr : [])
    .map((a) => String(a == null ? '' : a).trim().slice(0, MAX_ANSWER_LEN))
    .filter((a) => normAnswer(a))
    .slice(0, MAX_ANSWERS_PER_PROMPT));
  return validBallot(out, puzzle) ? out : null;
}

// Build the day's shared pool and scorers. `players` is every deduped ballot
// that should feed the pool ([{ answers, ... }]). Mirrors scoreOutrankField.
export function scoreFeudField(puzzle, players, { houseCutoff = HOUSE_CUTOFF } = {}) {
  const prompts = puzzle.prompts || [];
  const P = prompts.length;
  const realCount = players.length;
  const useHouse = realCount <= houseCutoff;

  const matchers = prompts.map(promptMatcher);

  // Per player, per prompt: the DISTINCT bucket ids of their answers.
  const idsFor = (answers) => prompts.map((_, p) => {
    const arr = Array.isArray(answers) && Array.isArray(answers[p]) ? answers[p] : [];
    const seen = new Set();
    const ids = [];
    for (const raw of arr.slice(0, MAX_ANSWERS_PER_PROMPT)) {
      const id = matchers[p].bucketOf(raw);
      if (id && !seen.has(id)) { seen.add(id); ids.push(id); }
    }
    return ids;
  });

  const playerIds = players.map((pl) => idsFor(pl.answers));

  // Pool counts per prompt: house votes (while active) + every player's
  // distinct buckets. totals[p] = number of pooled answer-votes for prompt p.
  const counts = prompts.map(() => new Map());
  const totals = new Array(P).fill(0);
  const bump = (p, id, by) => {
    counts[p].set(id, (counts[p].get(id) || 0) + by);
    totals[p] += by;
  };
  if (useHouse) {
    prompts.forEach((prompt, p) => {
      for (const v of (prompt.house || [])) {
        if (Number.isInteger(v) && v >= 0 && v < (prompt.answers || []).length) bump(p, 'c' + v, 1);
      }
    });
  }
  playerIds.forEach((perPrompt) => {
    perPrompt.forEach((ids, p) => { for (const id of ids) bump(p, id, 1); });
  });

  // Grade one ballot with leave-one-out: its own buckets are removed from the
  // tally it is scored (and revealed) against.
  const detailFor = (answers) => {
    const mine = idsFor(answers);
    const perPrompt = [];
    let total = 0;
    let onBoard = 0;
    for (let p = 0; p < P; p++) {
      const myIds = new Set(mine[p]);
      const looTotal = Math.max(0, totals[p] - myIds.size);
      // Every bucket in the LOO view, sorted: count desc, canonical before
      // dynamic, then label. This is the reveal order.
      const rows = [];
      for (const [id, c] of counts[p]) {
        const loo = myIds.has(id) ? c - 1 : c;
        if (loo <= 0 && !myIds.has(id)) continue;
        rows.push({ id, count: loo });
      }
      // My buckets that aren't in the pool map at all (possible when the pool
      // dropped them via LOO to zero) are already covered above via myIds check.
      for (const id of myIds) if (!counts[p].has(id)) rows.push({ id, count: 0 });
      rows.sort((a, b) => b.count - a.count || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

      const pct = (c) => (looTotal > 0 ? Math.round((c / looTotal) * 100) : 0);
      const matcher = matchers[p];
      const labelOf = (id) => {
        if (id.charCodeAt(0) === 99 /* 'c' */) {
          const b = matcher.buckets[Number(id.slice(1))];
          return b ? b.label : id;
        }
        return labelOfDynamic(id);
      };

      const board = rows.slice(0, BOARD_SIZE).map((r, i) => ({
        rank: i + 1,
        label: labelOf(r.id),
        count: r.count,
        pct: pct(r.count),
        yours: myIds.has(r.id),
      }));
      const boardIds = new Set(rows.slice(0, BOARD_SIZE).map((r) => r.id));
      const missed = [];
      rows.forEach((r, i) => {
        if (i >= BOARD_SIZE && myIds.has(r.id)) {
          missed.push({ rank: i + 1, label: labelOf(r.id), count: r.count, pct: pct(r.count) });
        }
      });

      let pts = 0;
      const perAnswer = mine[p].map((id) => {
        const c = (counts[p].get(id) || 0) - 1; // LOO: minus my own vote
        const share = looTotal > 0 ? Math.round((Math.max(0, c) / looTotal) * 100) : 0;
        pts += share;
        const idx = rows.findIndex((r) => r.id === id);
        const rank = idx >= 0 ? idx + 1 : null;
        if (rank != null && rank <= BOARD_SIZE) onBoard++;
        const lbl = id.charCodeAt(0) === 99 ? ((matcher.buckets[Number(id.slice(1))] || { label: id }).label) : labelOfDynamic(id);
        return { label: lbl, pct: share, rank, top: rank != null && rank <= 3, board: rank != null && rank <= BOARD_SIZE };
      });
      pts = Math.min(100, pts);
      total += pts;
      perPrompt.push({ pts, perAnswer, board, missed, answersIn: looTotal });
    }
    return { total, perPrompt, onBoard };
  };

  const totalFor = (pl) => detailFor(pl.answers).total;

  return { detailFor, totalFor, useHouse, realCount, totals, promptCount: P };
}

// Build a scoreGame-compatible { field, players:Map } for the daily/combined
// board, exactly like scoreOutrankGame: every ballot feeds the pool, only
// NAMED (registered) players rank; adaptive total desc, then earliest.
export function scoreFeudGame(puzzle, players, { houseCutoff = HOUSE_CUTOFF } = {}) {
  const { totalFor, promptCount } = scoreFeudField(puzzle, players, { houseCutoff });
  const total = promptCount * 100;
  const named = players
    .filter((p) => p.name)
    .map((p) => ({ ...p, score: totalFor(p) }));
  named.sort((a, b) => b.score - a.score || String(a.created).localeCompare(String(b.created)));
  const N = named.length;
  const out = new Map();
  named.forEach((p, i) => {
    const rank = i + 1;
    const ratio = total > 0 ? Math.max(0, Math.min(1, p.score / total)) : 0;
    const completion = COMPLETION_MAX * ratio;
    const placement = N > 1 ? PLACEMENT_MAX * (N - rank) / (N - 1) : PLACEMENT_MAX;
    const uk = p.userId ? 'u:' + p.userId : 'a:' + p.anonId;
    out.set(uk, {
      userKey: uk,
      username: p.name,
      score: p.score,
      total,
      guessesUsed: null,
      timeElapsed: null,
      completion,
      placement,
      points: completion + placement,
      rank,
      field: N,
    });
  });
  return { field: N, players: out };
}
