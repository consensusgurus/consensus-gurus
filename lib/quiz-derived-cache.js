// In-process memo for the DERIVED xp / trophy state (homepage + end-card
// latency fix, 2026-08-01).
//
// WHY: lib/quiz-results-cache stopped us re-FETCHING the whole quiz_results
// table on every request, but every hot route still re-DERIVES the entire
// site's state from it, per request, to answer a question about one player.
// computeXp sorts and walks all ~33,800 rows to build every player's IQ
// Points, then computeTrophies walks them again for all 34 trophy definitions.
// Measured on the live site: /api/quiz/me (the homepage player stats, called
// from ~50 places) 1,645ms, /api/quiz/iq-standing (the end card) 757ms. The
// inputs are identical between those calls and the answer is identical too.
//
// HOW: memoize by a fingerprint of the row set plus the options that actually
// change the output. Between two rows landing (the common case, seconds apart)
// every caller reuses one computation.
//
// ⚠️ THE RETURNED VALUES ARE SHARED ACROSS REQUESTS. Treat `players`, its
// player objects, and `difficulty` as READ-ONLY, exactly like the rows array
// from quiz-results-cache. Verified at the time of writing: buildProfile
// (lib/quiz-profile), rankPlayers (lib/quiz-xp) and computeTrophies
// (lib/quiz-trophies) all read only and build their own output objects. If a
// consumer ever needs to mutate a player, it must copy first.

import { computeXp, rankPlayers } from './quiz-xp.js';
import { computeTrophies } from './quiz-trophies.js';

// Fingerprint of the row set. maxId alone would miss a deletion (admin
// quiz-reset); length alone would miss a delete plus insert. Together they are
// an O(1) read off the shared array and cannot collide in normal operation.
function versionOf(rows) {
  const n = rows ? rows.length : 0;
  const maxId = n ? (rows[n - 1].id || 0) : 0;
  return `${n}:${maxId}`;
}

// computeXp's xp7d / xp30d are clock-dependent, so a raw Date.now() would make
// every key unique and the memo useless. Bucket to the minute: the derived
// window shifts by under 60s, which is nothing against a 7-day or 30-day cut.
const NOW_BUCKET_MS = 60 * 1000;
function nowBucket(nowMs) {
  return Math.floor((nowMs || Date.now()) / NOW_BUCKET_MS) * NOW_BUCKET_MS;
}

// Two memos on purpose. `shared` holds the rankFor-less variants, which every
// player can reuse; `perPlayer` holds the rankFor variants, one per profiled
// player. Keeping them apart stops a burst of different players from evicting
// the shared entry that the homepage depends on.
const shared = new Map();
const perPlayer = new Map();
const trophies = new Map();
const standings = new Map();
const rankings = new Map();
// Every route now shares this memo, and they ask for different recentN:
// 1 (me light), 20 (xp / xp-categories / share-card), 200 (day-card,
// iq-standing), 400 (daily-status), 100000 (the full profile). Each is its own
// key, so a cap of 3 would thrash and hand most callers a miss.
// Bumped 6 -> 8 on 2026-08-08: `history` mode on /api/quiz/me added a sixth
// live recentN variant (100000 with NO rankFor), and sitting exactly at the cap
// means the homepage's light entry gets evicted by whichever request lands next.
const SHARED_MAX = 8;
// Bumped 4 -> 8 on 2026-08-08. 4 was smaller than the real concurrency of
// distinct players, so the 5th evicted the 1st and the map ran at roughly a 0%
// hit rate. Deliberately NOT raised further: each entry holds a full ~2,900
// player map with every player's recent list (~10MB at recentN 100000), and the
// instance runs at 529MB of 2GB. The real relief is `history` mode moving the
// 47 game clients OFF this map entirely, not a bigger cap here.
const PER_PLAYER_MAX = 8;
const TROPHY_MAX = 2;
const STANDING_MAX = 2;
const RANKING_MAX = 4;

// Map preserves insertion order, so the first key is the oldest. Re-inserting on
// a hit would make this a true LRU; FIFO is enough here because entries are
// invalidated by new rows long before they age out.
function trim(map, max) {
  while (map.size > max) {
    const oldest = map.keys().next().value;
    if (oldest === undefined) break;
    map.delete(oldest);
  }
}

// computeXp(rows, opts), memoized. Same arguments, same return shape.
export function computeXpCached(rows, { recentN = 20, rankFor = null, nowMs = null } = {}) {
  const now = nowBucket(nowMs);
  const version = versionOf(rows);
  const map = rankFor ? perPlayer : shared;
  const key = rankFor
    ? `${version}|${recentN}|${now}|${rankFor}`
    : `${version}|${recentN}|${now}`;

  const hit = map.get(key);
  if (hit) return hit;

  const value = computeXp(rows, { recentN, rankFor, nowMs: now });
  map.set(key, value);
  trim(map, rankFor ? PER_PLAYER_MAX : SHARED_MAX);
  return value;
}

// computeTrophies(rows, players), memoized on the ROW SET ALONE.
//
// That is deliberate and safe: trophies are derived from the rows plus the
// player identity map (key / anonId), and those identity fields are identical
// across every computeXp variant of the same rows. recentN and rankFor only
// affect `recent`, which trophies never read. So a trophy result computed
// alongside one variant is correct for any other variant of the same rows.
// Today's IQ gain per player, and the whole field's ranking both now and as it
// stood before today, memoized per row set + day.
//
// /api/quiz/daily-status needs three things that are IDENTICAL for every player
// against the same rows: how much each player earned today, everyone's rank now,
// and everyone's rank on the IQ they held before today. Only the final lookup is
// personal. It was recomputing all of it per request: two sorts of the ~2,600
// player field plus a scan of every player's recent list. Measured 1,050ms
// median warm after the Intl fix, with a spread from 261ms to 2,968ms depending
// on instance warmth.
//
// The day boundary is part of the key, so the entry rolls over on its own at ET
// midnight without any invalidation.
//
// recentN is in the key because `gained` reads p.recent, which computeXp
// truncates to recentN: a players map built with a different recentN is a
// different input and must not share this entry.
export function dailyStandingCached(rows, players, { dayStartMs, recentN }) {
  const key = `${versionOf(rows)}|${recentN}|${dayStartMs}`;
  const hit = standings.get(key);
  if (hit) return hit;

  const all = [...players.values()];

  const gained = new Map();
  for (const p of all) {
    let sum = 0;
    for (const r of (p.recent || [])) {
      if (!r.createdAt) continue;
      const ts = Date.parse(r.createdAt);
      if (ts >= dayStartMs) sum += Number(r.xp) || 0;
    }
    gained.set(p.key, sum);
  }

  // Player key as the final tiebreak so both orderings are deterministic and a
  // tie can never register as phantom movement.
  const rankMap = (val) => {
    const sorted = all.slice().sort((a, b) => val(b) - val(a) || (a.key < b.key ? -1 : 1));
    const m = new Map();
    for (let i = 0; i < sorted.length; i++) m.set(sorted[i].key, i + 1);
    return m;
  };
  const posNow = rankMap((p) => p.xp);
  const posThen = rankMap((p) => p.xp - (gained.get(p.key) || 0));

  // TODAY'S board (owner, 2026-08-08): the same field ranked by IQ earned since
  // ET midnight, which is what the header's Daily rank box reports. Only players
  // who actually banked something today are on it, so the field size means "how
  // many people played today" rather than "how many accounts exist". Ranking the
  // whole roster instead would hand every idle account a shared last place and
  // make a good day read as #1,900 of 2,952.
  const dayRanked = all
    .filter((p) => (gained.get(p.key) || 0) > 0)
    .sort((a, b) => (gained.get(b.key) || 0) - (gained.get(a.key) || 0) || (a.key < b.key ? -1 : 1));
  const posDay = new Map();
  for (let i = 0; i < dayRanked.length; i++) posDay.set(dayRanked[i].key, i + 1);
  const dayField = dayRanked.length;

  // THE DAY'S NUMBERING IS THE REGISTERED BOARD'S (owner, 2026-09-04), which is
  // the rule every other standing on this site already follows: rank among the
  // NAMED players, renumbered 1,2,3 with no gaps, printed against a field that
  // still counts everyone who played. posDay above interleaves guests, so the
  // cap was reporting a position no board on the site would confirm -- a player
  // reading #14 of 48 in the header and #9 of 48 on their own tiles, with the
  // difference being five guests the public boards do not show. dayField is
  // deliberately NOT narrowed: the denominator is the whole pool, exactly as
  // the per-game "of N" is.
  //
  // dayRanked is already ordered by today's gain, so the filter preserves it
  // and regDayGained comes out descending, which is what the guest slot-in
  // below can walk and stop early on.
  const dayReg = dayRanked.filter((p) => !p.isAnon && p.username);
  const posDayReg = new Map();
  const regDayGained = [];
  for (let i = 0; i < dayReg.length; i++) {
    posDayReg.set(dayReg[i].key, i + 1);
    regDayGained.push(gained.get(dayReg[i].key) || 0);
  }

  const value = { gained, posNow, posThen, posDay, dayField, posDayReg, regDayGained };
  standings.set(key, value);
  trim(standings, STANDING_MAX);
  return value;
}

// rankPlayers(players, metric), memoized. The full field sort is IDENTICAL for
// every caller against the same rows, but /api/quiz/iq-standing was running it
// twice per request on the blocking post-game path (~2,900 players, and the end
// card's retry ladder can fire it six times for one finished game).
//
// recentN is in the key because the players map is built per recentN; two maps
// of the same rows at different recentN are different inputs.
//
// ⚠️ The returned array is SHARED. Read it, slice it, findIndex it. Never sort
// or mutate it in place.
export function rankPlayersCached(rows, players, metric = 'all', recentN = 20) {
  const key = `${versionOf(rows)}|${metric}|${recentN}`;
  const hit = rankings.get(key);
  if (hit) return hit;
  const value = rankPlayers(players, metric);
  rankings.set(key, value);
  trim(rankings, RANKING_MAX);
  return value;
}

export function computeTrophiesCached(rows, players) {
  const key = versionOf(rows);
  const hit = trophies.get(key);
  if (hit) return hit;
  const value = computeTrophies(rows, players);
  trophies.set(key, value);
  trim(trophies, TROPHY_MAX);
  return value;
}
