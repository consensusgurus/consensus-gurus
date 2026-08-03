// Manual play credits — a hand-maintained allowlist of drops a player genuinely
// finished but has no `quiz_results` row for, because their result post never
// reached the server.
//
// A credit is folded into the viewer's PLAYED SET only (the drop calendar, the
// archive percentage, and the played-day streaks in /api/quiz/daily-game). It
// grants NO score: no result row is invented, the drop's field size is
// untouched, and no board, points total or rank moves. It is deliberately the
// weakest possible fix, so a mistaken entry can never distort the standings.
//
// Keyed by userKey exactly as the daily routes build it: `u:<quiz_users.id>` for
// a registered player, `a:<anon_id>` for a guest. Value is a list of quizIds.
//
// Log every grant with its reason:
//
//   u:2369e505… = e4n (enelinkavak@gmail.com), crux-7-9-26, granted 2026-08-03.
//   She reported the drop as played and her device streak agrees (29 of 29). The
//   database holds 28 of the 29 live Crux drops for her, and no unclaimed
//   anonymous row on 7/9 matches her device, so the post was lost rather than
//   filed under a second identity. That drop drew 107 plays, an ordinary Crux
//   day, so this was hers alone and not an outage.
export const MANUAL_CREDITS = {
  'u:2369e505-dec3-4e3a-bc02-daf754d1022a': ['crux-7-9-26'],
};

// The quizIds credited to one viewer. Returns an empty array for an unknown or
// missing userKey, so callers can spread it unconditionally.
export function creditedFor(userKey) {
  if (!userKey) return [];
  const list = MANUAL_CREDITS[userKey];
  return Array.isArray(list) ? list : [];
}
