// Shared Outwit adaptive scoring. Extracted from app/api/outwit so BOTH the live
// result-page board (/api/outwit) and the daily/combined leaderboard
// (/api/quiz/daily-combined) score Outwit with the EXACT same code.
//
// Outwit is adaptive: a score is a pure function of ALL picks in the pool right
// now (leave-one-out per player), recomputed from scratch every time. Nothing is
// ever frozen. The combined board used to rank Outwit off the one-shot
// quiz_results.score captured at "Face the crowd", so it drifted out of sync with
// the live board as the field filled in. Now both recompute from outwit_picks, so
// the two boards can never disagree.

import { COMPLETION_MAX, PLACEMENT_MAX } from './daily-combined';

// house retires once MORE than this many real players are in (pool-wide flag).
export const HOUSE_CUTOFF = 10;

export const median = (arr) => {
  const s = [...arr].sort((a, b) => a - b);
  const n = s.length;
  if (!n) return 0;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
};
export const mean = (arr) => arr.reduce((a, b) => a + b, 0) / (arr.length || 1);

export function buildContext(pr, pool) {
  if (pr.type === 'twothirds' || pr.type === 'herd') {
    const N = pool.length || 1;
    // The Undercut multiplier MOVES DAILY (owner rule, 2026-07-20): each puzzle
    // from 2026-07-21 on carries its own `frac` (1/3, 2/5, 1/2, 3/5, 2/3, 7/10,
    // 3/4, 4/5) and says so in its question copy, so nobody can memorize one
    // equilibrium. Days banked before that rule shipped have no `frac` and stay
    // at the original two-thirds, so their live scores never move.
    const frac = Number.isFinite(pr.frac) && pr.frac > 0 ? pr.frac : 2 / 3;
    const target = pr.type === 'twothirds' ? frac * mean(pool) : median(pool);
    const dists = pool.map((x) => Math.abs(x - target)).sort((a, b) => a - b);
    // # of pool entries strictly closer than distance dv (lower-bound search)
    const closerThan = (dv) => {
      let lo = 0, hi = dists.length;
      while (lo < hi) { const m = (lo + hi) >> 1; if (dists[m] < dv) lo = m + 1; else hi = m; }
      return lo;
    };
    // # strictly farther than dv (upper-bound search)
    const fartherThan = (dv) => {
      let lo = 0, hi = dists.length;
      while (lo < hi) { const m = (lo + hi) >> 1; if (dists[m] <= dv) lo = m + 1; else hi = m; }
      return dists.length - lo;
    };
    const ptsFor = (v) => {
      const frac = closerThan(Math.abs(v - target)) / N;
      return frac < 1 / 3 ? 2 : frac < 2 / 3 ? 1 : 0;
    };
    const beatPctFor = (v) => Math.round((fartherThan(Math.abs(v - target)) / N) * 100);
    return { kind: 'num', type: pr.type, target, med: median(pool), pool, ptsFor, beatPctFor };
  }
  if (pr.type === 'least' || pr.type === 'match') {
    const counts = new Array(pr.options.length).fill(0);
    for (const v of pool) if (Number.isInteger(v) && v >= 0 && v < counts.length) counts[v]++;
    const order = counts.map((c, i) => ({ c, i })).sort((a, b) => (pr.type === 'least' ? a.c - b.c : b.c - a.c) || a.i - b.i);
    // LEAVE-ONE-OUT scoring: a player is ranked against the field MINUS their own
    // vote, so their own ballot can never push their pick out of the winning tier.
    // Without this, picking the fewest/most option and thereby adding a vote to it
    // could tie or overtake it, making a 2 unreachable — a perfect 10 was literally
    // impossible on most days. `myc` is the option's count with the scored player
    // removed; an option beats them if it's fewer (least)/more (match), or tied at
    // myc with a lower index (the same asc-index tiebreak the full ranking uses).
    const ptsFor = (v) => {
      if (!(Number.isInteger(v) && v >= 0 && v < counts.length)) return 0;
      const myc = counts[v] - 1;
      let ahead = 0;
      for (let i = 0; i < counts.length; i++) {
        if (i === v) continue;
        const beats = pr.type === 'least' ? counts[i] < myc : counts[i] > myc;
        if (beats || (counts[i] === myc && i < v)) ahead++;
      }
      return ahead === 0 ? 2 : ahead === 1 ? 1 : 0;
    };
    return { kind: 'choice', type: pr.type, counts, winner: order[0].i, ptsFor };
  }
  // unique / Rare Bird: the RAREST pick wins, ties to the lower index/number.
  // Two shapes: themed OPTIONS (answer = option index, like least/match) or a
  // legacy numeric range. The themed branch is the current bank; the numeric
  // branch below is kept for any older day that still ships min/max.
  if (pr.options) {
    const K = pr.options.length;
    const counts = new Array(K).fill(0);
    for (const v of pool) if (Number.isInteger(v) && v >= 0 && v < K) counts[v]++;
    const order = counts.map((c, i) => ({ c, i })).sort((a, b) => a.c - b.c || a.i - b.i);
    // Tiers scale with the option count so the challenge tracks the numeric
    // version's roughly top-20% -> 2, top-50% -> 1 (see the numeric branch).
    const two = Math.max(1, Math.round(K * 0.2));
    const one = Math.max(two + 1, Math.round(K * 0.5));
    // LEAVE-ONE-OUT scoring (see the choice branch): rank the player among the
    // OTHER options using their own count minus themselves, so their own vote
    // never bumps their pick out of the rarest tier. rarer<two -> 2, rarer<one -> 1.
    const ptsFor = (v) => {
      const k = Number(v);
      if (!(Number.isInteger(k) && k >= 0 && k < K)) return 0;
      const myc = counts[k] - 1;
      let rarer = 0;
      for (let i = 0; i < K; i++) {
        if (i === k) continue;
        if (counts[i] < myc || (counts[i] === myc && i < k)) rarer++;
      }
      return rarer < two ? 2 : rarer < one ? 1 : 0;
    };
    return { kind: 'unique', type: pr.type, counts, winner: order[0].i, options: pr.options, ptsFor };
  }
  // unique (legacy numeric): rarest number in [min..max] wins, ties to the lower number
  const size = pr.max - pr.min + 1;
  const counts = new Array(size).fill(0);
  for (const v of pool) { const k = v - pr.min; if (Number.isInteger(v) && k >= 0 && k < size) counts[k]++; }
  const order = counts.map((c, i) => ({ c, i })).sort((a, b) => a.c - b.c || a.i - b.i);
  // LEAVE-ONE-OUT scoring (see the choice branch): rank the player among the OTHER
  // numbers using their own count minus themselves. Otherwise, if the house crowd
  // left 4+ numbers unpicked, the act of picking any number (count -> 1) shut the
  // player out of the four-rarest tier and capped them at 1 — the main reason a 10
  // couldn't be reached. rarer<4 -> 2, rarer<10 -> 1.
  const ptsFor = (v) => {
    const k = v - pr.min;
    if (!(Number.isInteger(v) && k >= 0 && k < size)) return 0;
    const myc = counts[k] - 1;
    let rarer = 0;
    for (let i = 0; i < size; i++) {
      if (i === k) continue;
      if (counts[i] < myc || (counts[i] === myc && i < k)) rarer++;
    }
    return rarer < 4 ? 2 : rarer < 10 ? 1 : 0;
  };
  return { kind: 'unique', type: pr.type, counts, winner: order[0].i + pr.min, min: pr.min, max: pr.max, ptsFor };
}


// Build one scoring context per prompt from the current, identical-for-all pool
// (house while seeding + every real pick), and a totalFor() that scores any
// player against it. `players` is every pick that should feed the pool.
export function scoreOutwitField(puzzle, players, { houseCutoff = HOUSE_CUTOFF } = {}) {
  const realCount = players.length;
  const useHouse = realCount <= houseCutoff;
  const contexts = puzzle.prompts.map((pr, i) => {
    const pool = [
      ...(useHouse ? pr.house : []),
      ...players.map((p) => Number(p.answers[i])).filter((x) => Number.isInteger(x)),
    ];
    return { ctx: buildContext(pr, pool), poolSize: pool.length };
  });
  const totalFor = (p) => contexts.reduce((s, c, i) => s + c.ctx.ptsFor(Number(p.answers[i])), 0);
  return { contexts, totalFor, useHouse, realCount };
}

// Build a scoreGame-compatible { field, players:Map } for the daily/combined
// board. `players` is EVERY stored pick [{ answers, created, name, userId,
// anonId }] — all picks feed the pool, but only NAMED (registered) players are
// ranked, exactly like the live board. Ranking + tiebreak match /api/outwit:
// adaptive total desc, then earliest submission, unique ranks 1..N. completion /
// placement are on the same 0..15 scale scoreGame uses so the overall total is
// comparable across games.
export function scoreOutwitGame(puzzle, players, { houseCutoff = HOUSE_CUTOFF } = {}) {
  const { totalFor } = scoreOutwitField(puzzle, players, { houseCutoff });
  const total = puzzle.prompts.length * 2;
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
    const uk = p.userId ? `u:${p.userId}` : `a:${p.anonId}`;
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
