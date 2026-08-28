// The consensus engine behind the Sports Ranking pages.
//
// Deliberately SEPARATE from lib/helpers.js getSources, which is capped at a
// top ten (`bordaFromRank` returns 0 past rank 10) and drives 500+ lists across
// four mirrors. These rankings are 25 to 50 deep and weight by TIER rather than
// per source, so bending that engine to fit would mean a SCORING_ENGINE_VERSION
// bump and a four-mirror change touching every list on the site, to serve two
// pages. Full reasoning in CLAUDE-RANKINGS.md.
import { resolveTeam, logoFor, monoFor } from './gridiron-teams';
import { GRIDIRON } from './gridiron-data';

export const DATA = GRIDIRON;

// Tier shares of the composite. These renormalize over the tiers that actually
// published this week, so a tier going dark never breaks the composite.
//
// TIER ORDER: MARKETS > MODELS > MEDIA > HUMAN POLLS (owner rule, 2026-08-28).
//
// Ordered by how much is riding on being right. A betting market is real money
// continuously repricing against every public and private model at once, and it
// is the hardest signal in sport to beat. An analytics model is objective but is
// one method. Human polls come last: voters anchor on preseason expectation and
// on brand, they move slowly, and they systematically reward teams that started
// the year ranked. Same instinct as the media-list crowd tilt already in
// CLAUDE.md, pushed further down the subjective end.
const TIERS = {
  cfb: { official: 0.15, model: 0.35, media: 0.10, market: 0.40 },
  nfl: { official: 0.00, model: 0.35, media: 0.20, market: 0.45 },
};

// A source older than this is EXCLUDED from the composite (owner rule,
// 2026-08-28). It still renders as a column, greyed, with the reason — a
// dropped source that simply vanishes teaches the reader nothing, and hiding
// it is how a thin week passes for a full one.
export const MAX_AGE_DAYS = 30;

// Age in days against the build date. Null when the source publishes no date.
export function ageOf(src, fetchedAt) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(src.asOf || '')) return null;
  return Math.round((Date.parse(fetchedAt) - Date.parse(src.asOf)) / 86400000);
}

/*
  A source with no date cannot be aged, so it has to prove currency some other
  way: its own label must name the current season. Sagarin's "2026 preseason"
  and the market's "2026 season" pass; anything naming an older season, or
  nothing at all, fails. This is the content-derived freshness check the whole
  framework leans on, applied to the sources that publish no timestamp.
*/
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

// Within-tier share. Anything unnamed splits the remainder evenly.
const WITHIN = {
  withCfp:    { cfp: 0.50, ap: 0.30, coaches: 0.20 }, // from the committee's first release
  withoutCfp: { ap: 0.60, coaches: 0.40 },
};

export const DEPTH = { cfb: 50, nfl: 32 };

/*
  rankSource(src, depth) -> Map<canonicalTeam, effectiveRank>

  Two source shapes:

  - kind 'ordered'  a straight ranked list. Rank is array position.
  - kind 'poll'     the AP / Coaches shape: 25 ranked teams plus an "others
                    receiving votes" tail, both carrying vote POINTS. The tail
                    is what lets a 25-team poll still say something about rank
                    26-50, which is the whole reason a top 50 is honest rather
                    than models-only below 25.

  Polls rank by POINTS, not by array position, and ties are everywhere: the
  2026 preseason AP has USC and BYU tied at 839, and its vote tail has four
  teams tied on a single point. Tied teams share the AVERAGE of the ranks they
  span (standard competition ranking), so a coin-flip ordering inside a tie
  can never leak into the composite.
*/
export function rankSource(src, sport) {
  const out = new Map();      // team -> effective rank, used for SCORING
  const shown = new Map();    // team -> what the source actually published
  const problems = [];
  const put = (raw, rank, display) => {
    const team = resolveTeam(sport, raw);
    if (!team) { problems.push(`could not resolve "${raw}"`); return; }
    if (!out.has(team)) { out.set(team, rank); shown.set(team, display); }
  };

  if (src.kind === 'poll' || src.kind === 'priced') {
    // 'priced' is a market: the number is odds or a win total, not votes, and
    // for odds a SMALLER number is better. Otherwise it ranks exactly like a
    // poll, ties and all — a futures board has many teams on the same price.
    const ranked = src.kind === 'priced' ? (src.values || []) : (src.ranked || []);
    const rows = src.kind === 'priced' ? [...ranked] : [...ranked, ...(src.others || [])];
    const sign = src.lowerIsBetter ? 1 : -1;
    rows.sort((a, b) => sign * (a[1] - b[1]));
    let i = 0;
    while (i < rows.length) {
      let j = i;
      while (j + 1 < rows.length && rows[j + 1][1] === rows[i][1]) j++;
      const avg = (i + 1 + j + 1) / 2;          // 1-indexed average of the tie block
      const tied = j > i;
      for (let k = i; k <= j; k++) {
        // A poll publishes 25 ranks and then a list of teams "receiving votes".
        // Rendering a vote-getter as "#31" would invent a rank the poll never
        // published, so the tail shows RV and only the top 25 shows a number.
        // A market has no such tail: every priced team gets its position.
        const display = (src.kind !== 'priced' && k >= ranked.length)
          ? 'RV' : (tied ? `T${i + 1}` : String(i + 1));
        put(rows[k][0], avg, display);
      }
      i = j + 1;
    }
  } else {
    src.teams.forEach((raw, i) => put(raw, i + 1, String(i + 1)));
  }
  return { ranks: out, shown, problems };
}

const pointsForRank = (rank, depth) =>
  !rank || rank < 1 || rank > depth ? 0 : depth + 1 - rank;

export function computeComposite(sources, sport, opts = {}) {
  const depth = DEPTH[sport];
  const fetchedAt = opts.fetchedAt || DATA.fetchedAt;
  const season = opts.season || 2026;
  const all = Object.entries(sources);
  const problems = [];

  // 0. Age gate. An excluded source scores nothing and takes no tier weight,
  //    but is still reported so the page can show it greyed with the reason.
  const status = {};
  for (const [id, src] of all) status[id] = freshness(src, fetchedAt, season);
  const live = all.filter(([id]) => status[id].ok);
  const excluded = all.filter(([id]) => !status[id].ok).map(([id, s]) => ({
    id, label: s.label, tier: s.tier, asOf: s.asOf, why: status[id].why,
  }));

  // 1. Renormalize tier shares over the tiers that have a LIVE source this week.
  const present = new Set(live.map(([, s]) => s.tier));
  const declared = TIERS[sport];
  const totalPresent = [...present].reduce((n, t) => n + (declared[t] || 0), 0);
  const tierShare = {};
  for (const t of present) tierShare[t] = (declared[t] || 0) / totalPresent;

  // One OUTLET is not a tier. A tier carrying a single source is capped at
  // SOLO_CAP and the excess redistributes to the tiers that have real breadth.
  //
  // The market tier is EXEMPT, and the exemption is the whole reason markets can
  // sit on top. The cap exists to stop one publication's opinion standing in for
  // a whole category. A betting line is not an opinion: it is already an
  // aggregation, priced by every participant with money at stake and moved by
  // books balancing action against each other, so a single futures board carries
  // the market rather than one voice. Capping it would have handed the top tier
  // back to the models on college football, where the market is one source.
  const SOLO_CAP = 0.35;
  const solo = [...present].filter(
    (t) => t !== 'market'
      && live.filter(([, s]) => s.tier === t).length === 1 && tierShare[t] > SOLO_CAP);
  if (solo.length) {
    let freed = 0;
    for (const t of solo) { freed += tierShare[t] - SOLO_CAP; tierShare[t] = SOLO_CAP; }
    const rest = [...present].filter((t) => !solo.includes(t));
    const restTotal = rest.reduce((n, t) => n + tierShare[t], 0);
    for (const t of rest) tierShare[t] += freed * (tierShare[t] / restTotal);
  }

  // 2. Per-source weight = tier share, split within the tier.
  const weights = {};
  for (const tier of present) {
    const inTier = live.filter(([, s]) => s.tier === tier);
    const table = tier === 'official'
      ? (inTier.some(([id]) => id === 'cfp') ? WITHIN.withCfp : WITHIN.withoutCfp)
      : null;
    const namedShare = table
      ? inTier.filter(([id]) => table[id] != null).reduce((n, [id]) => n + table[id], 0) : 0;
    const restCount = inTier.filter(([id]) => !table || table[id] == null).length;
    for (const [id] of inTier) {
      weights[id] = tierShare[tier] * (table && table[id] != null
        ? table[id] : (1 - namedShare) / (restCount || 1));
    }
  }

  // 3. Rank each source, then score.
  const universe = new Map();
  const sourceRanks = {};
  // Rank EVERY source, live or excluded. Only live sources create universe
  // membership and score; an excluded source's ranks are carried for DISPLAY
  // only, so the page can show what was considered and rejected rather than a
  // gap. A team ranked solely by an excluded source never reaches the board.
  const liveIdSet = new Set(live.map(([id]) => id));
  for (const [id, src] of all) {
    const { ranks, shown, problems: p } = rankSource(src, sport);
    p.forEach((m) => problems.push(`${id}: ${m}`));
    sourceRanks[id] = { ranks, shown };
    if (!liveIdSet.has(id)) continue;
    for (const [team, rank] of ranks) {
      if (rank > depth) continue;            // outside the evaluation depth
      if (!universe.has(team)) universe.set(team, { team, ranks: {}, shown: {}, score: 0 });
      universe.get(team).ranks[id] = rank;
      universe.get(team).shown[id] = shown.get(team);
    }
  }
  // Attach the excluded sources' own numbers to teams already on the board.
  for (const [id] of all) {
    if (liveIdSet.has(id)) continue;
    const { ranks, shown } = sourceRanks[id];
    for (const row of universe.values()) {
      const rk = ranks.get(row.team);
      if (rk != null && rk <= depth) row.shown[id] = shown.get(row.team);
    }
  }
  for (const row of universe.values()) {
    for (const [id] of live) row.score += pointsForRank(row.ranks[id], depth) * weights[id];
    const seen = Object.values(row.ranks);
    row.appearances = seen.length;
    row.best = Math.min(...seen);
    row.worst = Math.max(...seen);
    // Spread is computed across the sources that RANK the team. At depth 50
    // with 25-deep polls, requiring every source to rank a team would make
    // spread meaningless below 25, so `appearances` carries the caveat instead.
    row.spread = row.worst - row.best;
    row.complete = seen.length === live.length;
    row.logo = logoFor(sport, row.team);
    row.mono = monoFor(sport, row.team);
  }

  const ranked = [...universe.values()].sort((a, b) =>
    b.score - a.score || b.appearances - a.appearances ||
    a.best - b.best || a.team.localeCompare(b.team)
  );
  ranked.forEach((r, i) => { r.rank = i + 1; });
  return {
    ranked: ranked.slice(0, depth), weights, tierShare, depth, problems,
    excluded, status, liveIds: live.map(([id]) => id),
  };
}
