// The engine behind the Sports Ranking pages, version 2 (2026-09-01).
//
// Three pillars, one scale. Every team gets a rating in POINTS BETTER THAN AN
// AVERAGE TEAM in its league on a neutral field, from each of:
//
//   R  Results    what actually happened: capped margins through a ridge SRS
//                 (so schedule strength is built in) blended with a
//                 Bradley-Terry win rating (so a win counts beyond its margin)
//   O  Odds       what money says: a spread-implied rating fit to the last
//                 three weeks of lines, tethered week to week, blended with
//                 the futures boards
//   A  Analytics  what the models say: every live analytics model, put on the
//                 points scale by position against the market's distribution
//
// and the composite is a weighted sum of the three, weights renormalized over
// the pillars that exist this week. There are NO media rankings and NO human
// polls anywhere in the score (owner rule, 2026-09-01). Full method, the 2025
// backtest and the reasoning in CLAUDE-RANKINGS.md sections 2 and 2c.
//
// Deliberately SEPARATE from lib/helpers.js getSources, which is capped at a
// top ten and drives 500+ lists across four mirrors. Numerics live in
// lib/gridiron-math.js so the verifier and the backtest run the same code.
import { resolveTeam, teamsFor, teamById, logoFor, monoFor } from './gridiron-teams';
import { GRIDIRON } from './gridiron-data';
import {
  ridgeLS, bradleyTerry, sd, scaleTo, rankDesc, mean,
} from './gridiron-math';

export const DATA = GRIDIRON;
export const SCORING_VERSION = 2;

// Full-strength pillar shares. Results are the only pillar that is not a
// forecast and the one a reader holds a ranking accountable to; odds beat
// models per the 2026-08-28 ruling (real money over one method). On the 2025
// backtest prediction accuracy was flat across every split from 0/58/42 to
// 60/35/25, so this is an editorial choice about what a ranking is FOR, and
// the backtest cannot make it (CLAUDE-RANKINGS.md section 2c).
export const PILLARS = { results: 0.40, market: 0.35, model: 0.25 };
export const PILLAR_ORDER = ['results', 'market', 'model'];
export const PILLAR_LABEL = {
  results: 'Results', market: 'Betting markets', model: 'Analytics models',
};

// Results ramp in over the first weeks of the season: wR = 0.40 * min(1, W/G)
// where W is the number of league weeks completed. In 2025 the results pillar
// alone predicted 60% of games in weeks 1 to 4 and matched the market by week
// 10, so a flat 40% from week 1 would cost real accuracy for nothing.
export const RAMP_WEEKS = { cfb: 6, nfl: 5 };

export const PARAMS = {
  // cap: margin cap (points). lam: ridge on the results solve. hbt: home field
  // in logits for the win rating. mix: margin share of the results blend.
  // tau: week-to-week tether on the spread-implied fit. window: weights on
  // this week's lines, last week's, the week before. linesShare: share of the
  // odds pillar from lines (rest from futures) for a team that has a line.
  // All of these moved the 2025 backtest by under a point across wide ranges.
  // hf: home field in points, used until there is enough data to fit it (see
  // `fitHomeField`). tau0: the ridge on the FIRST fitted week of lines, when
  // there is no previous week to tether to; it only has to make the solve
  // identifiable, a heavier one would shrink every rating toward zero.
  // beta: points per yard of total-yardage differential, fit on every 2025
  // game (0.070 NFL, 0.107 CFB, yards-only regression). adj: share of the
  // ACTUAL margin in the luck-adjusted margin, the rest from yards. n0: games
  // of shrinkage on the cover term. mix: the results blend.
  cfb: { cap: 28, lam: 1, hbt: 0.30, mix: { margin: 0.45, wins: 0.30, cover: 0.25 }, adj: 0.5, beta: 0.105, n0: 4, tau: 0.5, tau0: 0.05, window: [1, 0.6, 0.35], linesShare: 0.75, hf: 2.5 },
  nfl: { cap: 21, lam: 1, hbt: 0.25, mix: { margin: 0.45, wins: 0.30, cover: 0.25 }, adj: 0.5, beta: 0.07, n0: 4, tau: 0.5, tau0: 0.05, window: [1, 0.6, 0.35], linesShare: 0.75, hf: 2.0 },
};

// Home field is fit from the data only once there are about three games per
// team; fewer than that and the parameter is confounded with the ratings (in
// week 1 nearly every home team is a favourite, so a free H eats the whole
// favouritism and fits at 12 or 14 points). Lines never fit it: the window is
// at most three weeks, which is one to three lines per team, always too few.
const fitHomeField = (rows, n) => rows.length >= 3 * n;

// One model is not a tier: a lone live analytics model carries half the
// pillar's share and the rest goes to the market. The old engine's solo cap,
// kept for the same reason.
const soloScale = (live) => Math.min(1, live / 2);

export const DEPTH = { cfb: 50, nfl: 32 };

// A source older than this is EXCLUDED from the composite (owner rule,
// 2026-08-28). It still renders as a column, greyed, with the reason.
export const MAX_AGE_DAYS = 30;

export function ageOf(src, fetchedAt) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(src.asOf || '')) return null;
  return Math.round((Date.parse(fetchedAt) - Date.parse(src.asOf)) / 86400000);
}

// A source with no date must name the current season in its own label to
// survive; anything undated that does not is stale by assumption.
export function freshness(src, fetchedAt, season) {
  const age = ageOf(src, fetchedAt);
  if (age == null) {
    return String(src.asOf || '').includes(String(season))
      ? { ok: true, age: null, why: 'undated, names the current season' }
      : { ok: false, age: null, why: 'undated and does not name the current season' };
  }
  return age > MAX_AGE_DAYS
    ? { ok: false, age, why: `${age} days old, past the ${MAX_AGE_DAYS}-day limit` }
    : { ok: true, age, why: `${age} days old` };
}

/*
  rankSource(src, sport) -> { ranks: Map<team, effectiveRank>, shown, problems }

  Ordinal sources (the futures boards, the models as published). Two shapes:
  'ordered' is a straight list, rank = array position; 'priced' carries a
  number per team (odds, a win total) and ranks by it, `lowerIsBetter` for
  odds. Ties share the average of the ranks they span, so a coin-flip order
  inside a tie never leaks into the composite. A futures board has many teams
  on one price, so this matters more than it looks.
*/
export function rankSource(src, sport) {
  const out = new Map();
  const shown = new Map();
  const problems = [];
  const put = (raw, rank, display) => {
    const team = resolveTeam(sport, raw);
    if (!team) { problems.push(`could not resolve "${raw}"`); return; }
    if (!out.has(team)) { out.set(team, rank); shown.set(team, display); }
  };
  if (src.kind === 'priced' || src.kind === 'poll') {
    const ranked = src.kind === 'priced' ? (src.values || []) : (src.ranked || []);
    const rows = src.kind === 'priced' ? [...ranked] : [...ranked, ...(src.others || [])];
    const sign = src.lowerIsBetter ? 1 : -1;
    rows.sort((a, b) => sign * (a[1] - b[1]));
    let i = 0;
    while (i < rows.length) {
      let j = i;
      while (j + 1 < rows.length && rows[j + 1][1] === rows[i][1]) j++;
      const avg = (i + 1 + j + 1) / 2;
      const tied = j > i;
      for (let k = i; k <= j; k++) put(rows[k][0], avg, tied ? `T${i + 1}` : String(i + 1));
      i = j + 1;
    }
  } else {
    (src.teams || []).forEach((raw, i) => put(raw, i + 1, String(i + 1)));
  }
  return { ranks: out, shown, problems, count: out.size };
}

// Value at a 1-based (possibly fractional) position of a descending list.
// Positions past the end take the mean of what is left, or the last value.
function atPosition(pos, refSorted, tailMean) {
  const m = refSorted.length;
  if (!m) return 0;
  if (pos >= m) return tailMean != null ? tailMean : refSorted[m - 1];
  const lo = Math.floor(pos - 1), hi = Math.min(m - 1, lo + 1);
  const t = pos - 1 - lo;
  return refSorted[lo] * (1 - t) + refSorted[hi] * t;
}

/*
  computeComposite(block, sport, opts)

  `block` is GRIDIRON[sport]: { week, sources, games, lines, gamesAt, linesAt }.
  Returns the board plus everything the renderers need to show their work:
  columns (pillars and sources in display order), pillar shares, per-source
  freshness, and every problem the ingest would have hidden.
*/
export function computeComposite(block, sport, opts = {}) {
  const depth = DEPTH[sport];
  const P = PARAMS[sport];
  const fetchedAt = opts.fetchedAt || DATA.fetchedAt;
  const season = opts.season || DATA.season || 2026;
  const sources = block.sources || {};
  const games = block.games || [];
  const lines = block.lines || [];
  const problems = [];

  // ---- universe: every registered team, plus one pooled FCS node for CFB ----
  const names = Object.keys(teamsFor(sport));
  const idx = new Map(names.map((t, i) => [t, i]));
  const nTeams = names.length;
  const FCS = sport === 'cfb' ? nTeams : -1;
  const n = nTeams + (FCS >= 0 ? 1 : 0);
  const teamIx = (id, raw) => {
    const t = teamById(sport, id) || (raw ? resolveTeam(sport, raw) : null);
    if (t) return idx.get(t);
    if (FCS >= 0) return FCS;               // an unregistered CFB opponent is FCS
    return -1;
  };

  // ---- source freshness (models and markets only; nothing else is scored) ----
  const status = {};
  for (const [id, src] of Object.entries(sources)) status[id] = freshness(src, fetchedAt, season);
  const liveSrc = (tier) => Object.entries(sources).filter(([id, s]) => s.tier === tier && status[id].ok);
  const excluded = Object.entries(sources).filter(([id]) => !status[id].ok).map(([id, s]) => ({
    id, label: s.label, tier: s.tier, asOf: s.asOf, why: status[id].why,
  }));

  // ---- pillar R: results ----
  //
  // Three terms (owner rule, 2026-09-01):
  //   margin  a ridge SRS over LUCK-ADJUSTED margins. The adjusted margin is
  //           half the actual margin and half what the yardage says the
  //           margin should have been (`beta` points per yard of total-yard
  //           differential, plus home field). Turnovers move the score and
  //           barely move the yards, so a team that doubled its opponent's
  //           yardage and lost the game on fumbles is docked about half of
  //           what the scoreboard says, while a team that was out-gained and
  //           still failed to cover takes the full hit. On 2025 the 50/50
  //           blend predicted marginally better than the raw margin; yards
  //           alone predicted worse.
  //   wins    Bradley-Terry on the actual result. A win is a win.
  //   cover   performance against the spread: the mean of (adjusted margin
  //           minus the closing line's expectation) over the team's games,
  //           shrunk by n / (n + n0). The line already prices the opponent
  //           and the site, so this is a schedule-adjusted measure that needs
  //           no solver. It adds nothing to prediction on 2025 (the market
  //           reprices after every game) and is here as a resume term: what a
  //           team did against what was expected of it.
  const rec = names.map(() => ({ w: 0, l: 0, t: 0 }));
  const ats = names.map(() => ({ w: 0, l: 0, p: 0, sum: 0, n: 0 }));
  const lineOf = new Map(lines.map((l) => [String(l.id), l.sp]));
  const rrows = [];
  for (const g of games) {
    const h = teamIx(g.hid, g.h), a = teamIx(g.aid, g.a);
    if (h < 0 || a < 0) { problems.push(`game ${g.id}: unresolved team ${h < 0 ? g.hid : g.aid}`); continue; }
    const site = g.n ? 0 : 1;
    const m = g.hs - g.as;
    const dy = g.hy != null && g.ay != null ? g.hy - g.ay : null;
    const fromYards = dy == null ? m : P.beta * dy + P.hf * site;
    const madj = dy == null ? m : P.adj * m + (1 - P.adj) * fromYards;
    rrows.push({ h, a, site, m, madj });
    if (h < nTeams) { if (m > 0) rec[h].w++; else if (m < 0) rec[h].l++; else rec[h].t++; }
    if (a < nTeams) { if (m < 0) rec[a].w++; else if (m > 0) rec[a].l++; else rec[a].t++; }
    const sp = lineOf.get(String(g.id));
    if (sp != null && Number.isFinite(sp)) {
      const expected = -sp;                     // home margin the line implied
      const c = madj - expected;                // luck-adjusted cover margin, home side
      const raw = m - expected;                 // the scoreboard's cover, for the record
      for (const [i, sign] of [[h, 1], [a, -1]]) {
        if (i >= nTeams) continue;
        ats[i].sum += sign * c; ats[i].n++;
        if (raw === 0) ats[i].p++; else if (sign * raw > 0) ats[i].w++; else ats[i].l++;
      }
    }
  }
  let R = null, Hr = null;
  const coverAvg = new Array(n).fill(0);
  if (rrows.length) {
    const fitH = fitHomeField(rrows, nTeams);
    const { x: r, H } = ridgeLS(
      rrows.map((g) => ({
        h: g.h, a: g.a, site: g.site,
        y: Math.max(-P.cap, Math.min(P.cap, g.madj)) - (fitH ? 0 : P.hf * g.site),
      })),
      n, { lam: P.lam, fitH },
    );
    Hr = fitH ? H : P.hf;
    const b = bradleyTerry(
      rrows.map((g) => ({ h: g.h, a: g.a, site: g.site, y: g.m > 0 ? 1 : g.m < 0 ? 0 : 0.5 })),
      n, { lam: P.lam, h: P.hbt },
    );
    const k = sd(r) / (sd(b) || 1);
    const cover = ats.map((t) => (t.n ? (t.sum / t.n) * (t.n / (t.n + P.n0)) : 0));
    for (let i = 0; i < nTeams; i++) coverAvg[i] = ats[i].n ? ats[i].sum / ats[i].n : null;
    R = r.map((v, i) => P.mix.margin * v + P.mix.wins * k * b[i] + P.mix.cover * (i < nTeams ? cover[i] : 0));
    // A team that has not played yet has no results rating. It is set to the
    // played teams' mean so it lands at exactly zero once the pillar is
    // centred: no evidence reads as average, never as a penalty.
    const played = (i) => i < nTeams && rec[i].w + rec[i].l + rec[i].t > 0;
    const playedIx = names.map((t, i) => i).filter(played);
    if (playedIx.length && playedIx.length < nTeams) {
      const m = mean(playedIx.map((i) => R[i]));
      for (let i = 0; i < nTeams; i++) if (!played(i)) R[i] = m;
    }
  }

  // ---- pillar O, part 1: spread-implied rating, week by week ----
  const weeks = [...new Set(lines.map((l) => l.w))].sort((a, b) => a - b);
  const hasLine = new Array(n).fill(false);
  const lineRows = new Map();          // week -> rows in that week's window
  for (const w of weeks) {
    const rows = [];
    for (const l of lines) {
      const back = w - l.w;
      if (back < 0 || back >= P.window.length || l.sp == null) continue;
      const h = teamIx(l.hid, l.h), a = teamIx(l.aid, l.a);
      if (h < 0 || a < 0) { problems.push(`line ${l.id}: unresolved team ${h < 0 ? l.hid : l.aid}`); continue; }
      // Lines are capped like margins: a 55-point line over the FCS pool says
      // "much better" and nothing finer, and uncapped it dominates a thin fit.
      const y = Math.max(-P.cap, Math.min(P.cap, -l.sp - (l.n ? 0 : P.hf)));
      rows.push({ h, a, site: l.n ? 0 : 1, y, wt: P.window[back] });
      if (w === weeks[weeks.length - 1]) { hasLine[h] = true; hasLine[a] = true; }
    }
    lineRows.set(w, rows);
  }
  const thin = weeks.length < 3;
  /*
    fitLines(prior): solve each week in order, tethered to the previous week's
    solution. `prior` stands in for the previous week on the FIRST week.

    Why the prior matters: one week of lines is one line per team, which fixes
    each PAIR's difference and nothing else. The pairs chain into small
    clusters whose overall level is arbitrary, so a -30 favourite over a weak
    opponent floats up to +20 on its own, the weak opponent to -10, and the
    market's real opinion of both (the futures board) is ignored. Tethered to
    the futures-implied rating instead of to zero, a single line only nudges a
    team from where the futures already put it.

    With fewer than three weeks of lines the graph is still barely connected,
    so the fit's SCALE is not identified either, only its order; those weeks
    are rescaled so the ratings' spread is what the lines imply
    (a spread is the difference of two ratings, so sd(rating) = sd(line)/sqrt2).
  */
  const fitLines = (prior) => {
    let M = prior ? [...prior] : new Array(n).fill(0);
    let first = true;
    for (const w of weeks) {
      const rows = lineRows.get(w);
      if (!rows.length) continue;
      const { x } = ridgeLS(rows, n, {
        lam: 0, fitH: false,
        tether: first && !prior ? P.tau0 : P.tau,
        prev: first && !prior ? null : M,
      });
      M = x;
      if (thin) {
        const ix = [...new Set(rows.flatMap((r) => [r.h, r.a]))].filter((i) => i !== FCS);
        const cur = ix.map((i) => M[i]);
        const target = sd(rows.map((r) => r.y)) / Math.SQRT2;
        const s0 = sd(cur), m0 = mean(cur);
        if (s0 && target) for (const i of ix) M[i] = ((M[i] - m0) * target) / s0;
      }
      first = false;
    }
    return M;
  };
  const Hm = weeks.length ? P.hf : null;
  let M = fitLines(null);
  const anyLine = hasLine.some(Boolean);

  // ---- pillar O, part 2: futures and the other market boards ----
  const marketSrc = liveSrc('market');
  const sourceRanks = {};
  for (const [id, src] of Object.entries(sources)) {
    const rs = rankSource(src, sport);
    rs.problems.forEach((m) => problems.push(`${id}: ${m}`));
    sourceRanks[id] = rs;
  }
  // Each board's rank is placed on the spread-implied distribution by
  // POSITION, so the gaps come from the market's own distribution.
  const futuresOn = (Mref) => {
    const ref = names.map((t, i) => i).filter((i) => hasLine[i]).map((i) => Mref[i]).sort((a, b) => b - a);
    const F = new Array(n).fill(null);
    if (!marketSrc.length || !ref.length) return F;
    for (let i = 0; i < nTeams; i++) {
      const vals = [];
      for (const [id] of marketSrc) {
        const rk = sourceRanks[id].ranks.get(names[i]);
        if (rk != null) vals.push(atPosition(rk, ref, null));
      }
      if (vals.length) F[i] = mean(vals);
    }
    return F;
  };
  let F = futuresOn(M);
  if (thin && anyLine && F.some((v) => v != null)) {
    // Second pass: refit the thin weeks tethered to the futures-implied rating
    // (the FCS pool and any unpriced team start from the board's floor).
    const floor = Math.min(...F.filter((v) => v != null));
    const prior = F.map((v) => (v == null ? floor : v));
    M = fitLines(prior);
    F = futuresOn(M);
  }

  // One week of lines is thin; until two weeks exist the futures carry half.
  const weeksOfLines = weeks.length;
  const linesShare = weeksOfLines >= 2 ? P.linesShare : 0.5;
  let O = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    if (hasLine[i] && F[i] != null) O[i] = linesShare * M[i] + (1 - linesShare) * F[i];
    else if (hasLine[i]) O[i] = M[i];
    else if (F[i] != null) O[i] = F[i];
    else O[i] = M[i];
  }
  const hasOdds = anyLine || F.some((v) => v != null);

  // ---- pillar A: analytics models, by position on the odds distribution ----
  const modelSrc = liveSrc('model');
  const refO = names.map((t, i) => O[i]).sort((a, b) => b - a);
  let A = null;
  const modelVals = new Array(n).fill(null);
  if (modelSrc.length) {
    A = new Array(n).fill(0);
    for (let i = 0; i < nTeams; i++) {
      const vals = [];
      for (const [id] of modelSrc) {
        const { ranks, count } = sourceRanks[id];
        const rk = ranks.get(names[i]);
        const tailMean = count < refO.length ? mean(refO.slice(count)) : null;
        vals.push(rk != null ? atPosition(rk, refO, tailMean) : (tailMean != null ? tailMean : refO[refO.length - 1]));
      }
      A[i] = mean(vals);
      modelVals[i] = vals;
    }
  }

  // ---- centre every pillar over the board's teams and put A on O's scale ----
  const board = names.map((t, i) => i);
  const centreOn = (v) => { const m = mean(board.map((i) => v[i])); return v.map((x) => x - m); };
  const Rc = R ? centreOn(R) : null;
  const Oc = centreOn(O);
  const Ac = A ? (() => { const c = centreOn(A); const s = scaleTo(board.map((i) => c[i]), board.map((i) => Oc[i])); const out = new Array(n).fill(0); board.forEach((i, k) => { out[i] = s[k]; }); return out; })() : null;

  // ---- weights ----
  const weeksPlayed = Math.max(0, (block.week || 1) - 1);
  const ramp = Math.min(1, weeksPlayed / RAMP_WEEKS[sport]);
  const present = { results: !!Rc, market: hasOdds, model: !!Ac };
  let wR = present.results ? PILLARS.results * ramp : 0;
  const modelShare = PILLARS.model * soloScale(modelSrc.length);
  const restShare = (present.market ? PILLARS.market : 0) + (present.model ? modelShare : 0);
  const rest = 1 - wR;
  const wO = present.market && restShare ? (rest * PILLARS.market) / restShare : 0;
  const wA = present.model && restShare ? (rest * modelShare) / restShare : 0;
  if (!present.market && !present.model) wR = present.results ? 1 : 0;
  const tierShare = {};
  if (present.results) tierShare.results = wR;
  if (present.market) tierShare.market = wO;
  if (present.model) tierShare.model = wA;

  const S = board.map((i) => wR * (Rc ? Rc[i] : 0) + wO * Oc[i] + wA * (Ac ? Ac[i] : 0));
  const rR = Rc ? rankDesc(board.map((i) => Rc[i])) : null;
  const rO = rankDesc(board.map((i) => Oc[i]));
  const rM = anyLine ? rankDesc(board.map((i) => M[i])) : null;
  const rA = Ac ? rankDesc(board.map((i) => Ac[i])) : null;

  // ---- columns, in display order: pillar first, then its sources ----
  const columns = [];
  columns.push({
    id: 'results', kind: 'pillar', tier: 'results', short: 'Résumé',
    label: 'Results rating: luck-adjusted margins with strength of schedule, a win rating, and performance against the spread',
    asOf: block.gamesAt || null, ok: present.results,
    why: present.results ? `${rrows.length} games played` : 'no games played yet',
    weight: wR,
  });
  columns.push({
    id: 'record', kind: 'record', tier: 'results', short: 'W-L', label: 'Record',
    asOf: block.gamesAt || null, ok: present.results, why: 'from the games above', weight: 0,
  });
  columns.push({
    id: 'ats', kind: 'record', tier: 'results', short: 'ATS',
    label: 'Record against the closing spread; hover for the luck-adjusted average cover margin',
    asOf: block.gamesAt || null, ok: present.results, why: 'from the games and their closing lines', weight: 0,
  });
  columns.push({
    id: 'lines', kind: 'pillar', tier: 'market', short: 'Lines',
    label: 'Spread-implied rating: fit to the last three weeks of point spreads',
    asOf: block.linesAt || null, ok: anyLine,
    why: anyLine ? `${lines.length} lines` : 'no lines yet', weight: 0,
  });
  const mkSrc = (tier) => Object.entries(sources).filter(([, s]) => s.tier === tier).map(([id, s]) => ({
    id, kind: 'source', tier, short: s.short, label: s.label, asOf: s.asOf, url: s.url,
    ok: status[id].ok, why: status[id].why, weight: 0,
  }));
  columns.push(...mkSrc('market'));
  columns.push({
    id: 'model', kind: 'pillar', tier: 'model', short: 'Models',
    label: 'Analytics composite: every live model, by position on the market scale',
    asOf: null, ok: present.model,
    why: present.model ? `${modelSrc.length} live model${modelSrc.length === 1 ? '' : 's'}` : 'no live model',
    weight: wA,
  });
  columns.push(...mkSrc('model'));
  // Display weights inside a pillar: the pillar's share split evenly over its
  // live sources, so the header can say what each column moves.
  for (const c of columns) {
    if (c.kind !== 'source' || !c.ok) continue;
    const live = columns.filter((d) => d.kind === 'source' && d.tier === c.tier && d.ok).length;
    const share = c.tier === 'market' ? wO * (anyLine ? 1 - linesShare : 1) : wA;
    c.weight = share / (live || 1);
  }
  const linesCol = columns.find((c) => c.id === 'lines');
  linesCol.weight = anyLine ? wO * (marketSrc.length ? linesShare : 1) : 0;
  const weights = Object.fromEntries(columns.map((c) => [c.id, c.weight]));

  // ---- rows ----
  const fmtRec = (r) => `${r.w}-${r.l}${r.t ? `-${r.t}` : ''}`;
  const rows = board.map((i, k) => {
    const shown = {}, ranks = {}, pts = {};
    const played = rec[i].w + rec[i].l + rec[i].t > 0;
    if (Rc && played) { shown.results = String(rR[k]); ranks.results = rR[k]; pts.results = Rc[i]; }
    else if (Rc) { shown.results = 'no game'; }
    shown.record = present.results ? fmtRec(rec[i]) : null;
    if (present.results && ats[i].n) {
      shown.ats = `${ats[i].w}-${ats[i].l}${ats[i].p ? `-${ats[i].p}` : ''}`;
      pts.ats = coverAvg[i];
    }
    if (rM && hasLine[i]) { shown.lines = String(rM[k]); ranks.lines = rM[k]; pts.lines = M[i] - mean(board.map((j) => M[j])); }
    else if (rM) { shown.lines = 'no line'; }
    if (Ac) { shown.model = String(rA[k]); ranks.model = rA[k]; pts.model = Ac[i]; }
    for (const [id] of Object.entries(sources)) {
      const rs = sourceRanks[id];
      const rk = rs.ranks.get(names[i]);
      if (rk != null && rk <= depth) { shown[id] = rs.shown.get(names[i]); if (status[id].ok) ranks[id] = rk; }
    }
    const hasR = !!(rR && played);
    const pr = [hasR ? rR[k] : null, rO[k], rA ? rA[k] : null].filter((v) => v != null);
    return {
      team: names[i], score: S[k],
      R: Rc ? Rc[i] : null, O: Oc[i], A: Ac ? Ac[i] : null,
      rR: hasR ? rR[k] : null, rO: rO[k], rA: rA ? rA[k] : null,
      gap: hasR ? rR[k] - rO[k] : null,
      record: present.results ? { ...rec[i], text: fmtRec(rec[i]) } : null,
      ats: present.results && ats[i].n ? { w: ats[i].w, l: ats[i].l, p: ats[i].p, avg: coverAvg[i] } : null,
      shown, ranks, pts,
      best: Math.min(...pr), worst: Math.max(...pr), spread: Math.max(...pr) - Math.min(...pr),
      appearances: pr.length,
      logo: logoFor(sport, names[i]), mono: monoFor(sport, names[i]),
    };
  });
  rows.sort((a, b) => b.score - a.score || (b.R ?? 0) - (a.R ?? 0) || b.O - a.O || a.team.localeCompare(b.team));
  rows.forEach((r, i) => { r.rank = i + 1; });

  return {
    ranked: rows.slice(0, depth), all: rows, depth, columns, weights, tierShare,
    status, excluded, problems, liveIds: Object.keys(sources).filter((id) => status[id].ok),
    week: block.week || 1, weeksPlayed, ramp, homeField: { results: Hr, lines: Hm },
    counts: { games: rrows.length, lines: lines.length, models: modelSrc.length, markets: marketSrc.length },
    version: SCORING_VERSION,
  };
}
