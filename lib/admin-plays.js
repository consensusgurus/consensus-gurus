// Shared shaping for a single admin "play" row (2026-08-28).
//
// The admin page and /api/admin/player-plays both turn a quiz_results row into
// the same play object, and they MUST agree: the page computes each player's
// summary stats from these fields, the route serves the per-play detail behind
// an expanded row, and the games CSV is built from the route's output. If the
// two drifted, an expanded row would disagree with the summary above it.
//
// Extracted from app/admin/page.js when the per-play history stopped being
// shipped inside the page (it was 72,254 objects and ~34MB of a 35.7MB
// response) and moved behind this route.

// A play's owner: their registered user_id, else their browser anon_id, else
// the row id for a lone anonymous play. This rule was written out inline in six
// places in the admin page; it lives here now so the page, the route and
// buildAnonPlayers in lib/quiz-anon.js can never disagree about who a play
// belongs to.
export function playerKey(r) {
  return r.user_id ? `u:${r.user_id}` : r.anon_id ? `a:${r.anon_id}` : `r:${r.id}`;
}

// Per-play traffic metadata, derived from a quiz_results row. device is
// Mobile/Desktop from is_mobile (null -> unknown); geo is the finest available
// "City, Region, Country" (e.g. "Austin, TX, US"); browser/os are the coarse
// parsed user-agent; timezone/language/referrer come from migration 27.
export function playMeta(r) {
  const geoParts = [r.city, r.region, r.country].filter(Boolean);
  return {
    device: r.is_mobile === true ? 'Mobile' : r.is_mobile === false ? 'Desktop' : null,
    geo: geoParts.length ? geoParts.join(', ') : null,
    browser: r.ua_browser || null,
    os: r.ua_os || null,
    timezone: r.timezone || null,
    language: r.language || null,
    referrer: r.referrer || null,
  };
}

// One completed game as the admin panel renders it. `title` is resolved by the
// caller, which is the side that holds the quiz/daily-game title maps.
export function playRow(r, title) {
  return {
    quizId: r.quiz_id,
    title: title || r.quiz_id,
    score: r.score,
    total: r.total,
    correct: r.correct_count != null ? r.correct_count : null,
    timeElapsed: r.time_elapsed,
    createdAt: r.created_at,
    ...playMeta(r),
  };
}

// Newest first, the order every admin player panel displays.
export function sortPlaysNewestFirst(plays) {
  return plays.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
}
