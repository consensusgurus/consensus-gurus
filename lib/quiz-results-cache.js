// In-process cache for the quiz_results table (egress fix, 2026-07-12).
//
// WHY: quiz_results is read in full by many hot routes (me, player, xp,
// xp-categories, share-card, stats, totals, recent, board). Before this cache
// every request shipped the ENTIRE table out of Supabase, which is billed as
// uncached DB egress and blew past the free tier (14.6GB / 5GB). The table only
// ever GROWS in normal operation (one insert per completed game), so a warm
// lambda can hold the rows and fetch only the delta.
//
// HOW: on first use (cold start) the table is loaded in full. On every later
// use we run two cheap queries instead of one huge one:
//   1. an exact-count HEAD request (no row data leaves the DB), and
//   2. a delta select of rows with id > the largest id we have.
// If the count disagrees with cached + delta, rows were deleted (admin
// quiz-reset) and we reload in full. A time-based full reload (FULL_MS) bounds
// staleness from in-place UPDATEs (admin quiz-user-rename), which change no
// row count. A short burst TTL coalesces same-instance request spikes.
//
// Rows are returned in ascending id order, the same order the old
// loadQuizResults produced. Callers MUST NOT mutate the returned array or its
// rows (all current consumers use .slice()/.filter()/.map() copies).

import { fetchAllRows } from './fetch-all';

// Superset of the columns every consumer needs (board also reads time_elapsed,
// is_mobile and guesses_used; stats/totals read time_elapsed).
const COLS_FULL = 'id, user_id, username, quiz_id, score, total, correct_count, anon_id, created_at, time_elapsed, is_mobile, guesses_used, abandoned';
// Progressive fallbacks for a DB that predates migrations 37 / 33 / 25 / 24, in
// the same spirit as the old per-route fallbacks: never let a deploy depend on
// migration timing. `abandoned` (migration 37) is the newest, so it drops first.
const COL_TIERS = [
  COLS_FULL,
  COLS_FULL.replace(', abandoned', ''),
  COLS_FULL.replace(', abandoned', '').replace(', guesses_used', ''),
  COLS_FULL.replace(', abandoned', '').replace(', guesses_used', '').replace(', is_mobile', ''),
  COLS_FULL.replace(', abandoned', '').replace(', guesses_used', '').replace(', is_mobile', '').replace(', correct_count', ''),
];

const BURST_TTL_MS = 5 * 1000;        // serve as-is within a burst
const FULL_MS = 6 * 60 * 60 * 1000;   // full reload cadence (catches renames)

// Shared with lib/daily-results-cache, which runs the same column-tier
// fallback against a day-scoped slice of the same table.
export const QUIZ_RESULT_COL_TIERS = COL_TIERS;

export function isMissingColumn(err) {
  if (!err) return false;
  return err.code === '42703' || err.code === 'PGRST204' || /column|schema cache/i.test(err.message || '');
}

let cache = null;      // { rows, maxId, colsIdx, loadedAt, checkedAt }
let inflight = null;   // dedupe concurrent refreshes within one instance
let inflightAt = 0;    // ms timestamp the in-flight refresh STARTED (see force below)

// A cold instance used to page the whole table SEQUENTIALLY: fetchAllRows asks
// for 1000 rows, waits, asks for the next 1000, and so on, because it cannot
// know the total up front. At 33,800 rows that is 34 round trips in a row, and
// it measured 9.5s to 11.8s on live cold lambdas — the single worst number on
// the homepage, since /api/quiz/me cannot answer until it lands.
//
// Ask Postgres for the count first (no rows shipped), then fetch the pages in
// small parallel batches. Same rows, same ascending id order (pages are
// assembled by index), roughly a sixth of the wall time. A tail query picks up
// anything inserted while we were paging, so the result is never short.
const PAGE = 1000;
const CONCURRENCY = 6;

async function loadAllParallel(admin, cols) {
  const { count, error: countErr } = await admin
    .from('quiz_results')
    .select('id', { count: 'exact', head: true });
  // No count (permissions, an older PostgREST): fall back to the sequential
  // pager rather than guessing how many pages exist.
  if (countErr || count == null) return fetchAllRows(admin, 'quiz_results', cols, ['id']);

  const pages = Math.max(1, Math.ceil(count / PAGE));
  const out = new Array(pages);
  let failed = null;
  for (let i = 0; i < pages && !failed; i += CONCURRENCY) {
    const batch = [];
    for (let p = i; p < Math.min(pages, i + CONCURRENCY); p++) {
      batch.push(
        admin.from('quiz_results').select(cols).order('id', { ascending: true })
          .range(p * PAGE, p * PAGE + PAGE - 1)
          .then(({ data, error }) => { if (error && !failed) failed = error; out[p] = data || []; }),
      );
    }
    await Promise.all(batch);
  }
  // Surface the error unchanged so the caller's column-tier fallback still sees
  // a missing-column code and can drop to the next tier.
  if (failed) return { data: [], error: failed };

  const rows = out.flat();
  const maxId = rows.length ? rows[rows.length - 1].id : 0;
  const tail = await fetchAllRows(admin, 'quiz_results', cols, ['id'], (q) => q.gt('id', maxId));
  if (tail.error) return { data: rows, error: tail.error };
  return { data: rows.concat(tail.data || []), error: null };
}

async function fullLoad(admin) {
  let colsIdx = cache ? cache.colsIdx : 0;
  for (; colsIdx < COL_TIERS.length; colsIdx++) {
    const r = await loadAllParallel(admin, COL_TIERS[colsIdx]);
    if (r.error && isMissingColumn(r.error)) continue;
    if (r.error) return { data: r.data, error: r.error };
    const rows = r.data || [];
    const now = Date.now();
    cache = {
      rows,
      maxId: rows.length ? rows[rows.length - 1].id : 0,
      colsIdx,
      loadedAt: now,
      checkedAt: now,
    };
    return { data: rows, error: null };
  }
  return { data: [], error: { message: 'quiz_results: no column tier matched' } };
}

async function refresh(admin) {
  const now = Date.now();
  if (!cache || now - cache.loadedAt > FULL_MS) return fullLoad(admin);

  // 1. Exact count without shipping any rows.
  const { count, error: countErr } = await admin
    .from('quiz_results')
    .select('id', { count: 'exact', head: true });
  if (countErr) {
    // Serve stale rather than fail (and rather than re-shipping the table).
    console.error('quiz_results cache count error', countErr);
    cache.checkedAt = now;
    return { data: cache.rows, error: null };
  }

  // 2. Delta: only the rows inserted since our newest cached row. Usually
  // empty or a handful of rows, i.e. near-zero egress.
  const d = await fetchAllRows(
    admin, 'quiz_results', COL_TIERS[cache.colsIdx], ['id'],
    (q) => q.gt('id', cache.maxId),
  );
  if (d.error) {
    console.error('quiz_results cache delta error', d.error);
    cache.checkedAt = now;
    return { data: cache.rows, error: null };
  }
  if (d.data && d.data.length) {
    cache.rows = cache.rows.concat(d.data);
    cache.maxId = cache.rows[cache.rows.length - 1].id;
  }

  // 3. Deletions (admin quiz-reset) shrink the count: reload in full.
  if (count != null && count !== cache.rows.length) return fullLoad(admin);

  cache.checkedAt = now;
  return { data: cache.rows, error: null };
}

function startRefresh(admin) {
  inflightAt = Date.now();
  inflight = refresh(admin).finally(() => { inflight = null; });
  return inflight;
}

// Same { data, error } contract as the old loadQuizResults. `data` is the
// shared cached array: treat it as read-only.
export async function loadQuizResultsCached(admin, { force = false } = {}) {
  const issuedAt = Date.now();
  // `force` skips the short burst-TTL short-circuit so a caller that must see
  // the very latest rows (e.g. a just-finished player's own result) always runs
  // the cheap count+delta refresh instead of a possibly-pre-insert snapshot.
  if (!force && cache && issuedAt - cache.checkedAt < BURST_TTL_MS) {
    return { data: cache.rows, error: null };
  }
  if (inflight) {
    // Sharing the in-flight refresh is right for an ordinary read, and right for
    // a forced read too WHEN that refresh started after this call (it will
    // observe anything committed before it). But a forced read that joins an
    // OLDER refresh inherits a snapshot taken before its own write landed, which
    // is the exact staleness `force` exists to prevent: the just-finished player
    // then reads a board without their own row and has to sit through the
    // client's retry ladder. So wait for the older refresh to settle and run our
    // own afterwards. Sequential, never parallel, so two refreshes can never both
    // append the same delta rows on top of the same maxId.
    if (!force || inflightAt > issuedAt) return inflight;
    await inflight.catch(() => {});
    // Anything started while we waited began after `issuedAt`, so it is fresh
    // enough for us and we can simply join it.
    if (inflight) return inflight;
  }
  return startRefresh(admin);
}
