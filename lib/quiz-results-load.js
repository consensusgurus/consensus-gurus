// Loads quiz_results for the Elo/stats routes. Since 2026-07-12 this is a thin
// wrapper over the shared in-process cache (lib/quiz-results-cache.js): a cold
// lambda loads the table once, warm lambdas fetch only newly-inserted rows.
// Egress fix: previously every call shipped the WHOLE table out of Supabase.
//
// The cache handles the correct_count-missing fallback (pre-migration 24)
// internally via column tiers, so callers keep the same { data, error } shape
// they always had. Treat the returned array as READ-ONLY: it is shared across
// requests within a lambda instance.
import { loadQuizResultsCached } from './quiz-results-cache';

// `opts` passes straight through to the cache, so a caller that must see a
// row inserted moments ago (the daily end card reading its own just-finished
// result) can ask for { force: true } and skip the 5s burst TTL. Without it a
// first-time player is absent from the snapshot entirely and gets no IQ figure
// at all, rather than a slightly stale one (owner fix 2026-07-31).
export async function loadQuizResults(admin, opts) {
  return loadQuizResultsCached(admin, opts);
}
