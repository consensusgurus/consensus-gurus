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

import { computeXp } from './quiz-xp.js';
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
// Every route now shares this memo, and they ask for different recentN:
// 1 (me light), 20 (xp / xp-categories / share-card), 200 (day-card,
// iq-standing), 400 (daily-status), 100000 (the full profile). Each is its own
// key, so a cap of 3 would thrash and hand most callers a miss.
const SHARED_MAX = 6;
const PER_PLAYER_MAX = 4;
const TROPHY_MAX = 2;

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
export function computeTrophiesCached(rows, players) {
  const key = versionOf(rows);
  const hit = trophies.get(key);
  if (hit) return hit;
  const value = computeTrophies(rows, players);
  trophies.set(key, value);
  trim(trophies, TROPHY_MAX);
  return value;
}
