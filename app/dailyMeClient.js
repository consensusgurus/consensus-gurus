// Shared client for /api/quiz/daily-me (2026-08-01).
//
// WHY: three independent components ask the same question on one daily puzzle
// page — the end card, DailyBoardPanel and DailyGamesGrid — and each was
// "self-contained", so each fired its own request. A live load measured FIVE
// daily-me requests (the card retries until its own row lands, on top of the
// other two). They are parallel, so the wall-clock cost is small, but it is the
// same answer computed several times per page view.
//
// This is a one-entry cache, not a store: a caller asking the same question
// within a few seconds joins the request already in flight instead of starting
// another. It deliberately keeps no long-lived state, because a daily board
// genuinely changes as people play.
//
// The end card passes { fresh: true } on every attempt: it is checking for its
// OWN just-written row, so it must never be served a cached answer. Its result
// still SEEDS the entry, which is what lets the panel and the grid ride along on
// the request the card was already making.

const TTL_MS = 4000;

let entry = null; // { key, at, promise }

// The query string every caller should build, so identical questions produce
// identical keys. `game` scopes the full scoring to one puzzle; without it the
// endpoint only counts rows, which is all the grid needs.
export function dailyMeQuery({ anonId = null, email = null, game = null, quizId = null } = {}) {
  const qs = new URLSearchParams();
  if (anonId) qs.set('anonId', anonId);
  if (email) qs.set('email', email);
  if (game) qs.set('game', game);
  if (quizId) qs.set('quizId', quizId);
  return qs.toString();
}

// Read the identity the quiz client keeps in localStorage. Wrapped because
// Safari private mode throws on access.
export function dailyMeIdentity() {
  let anonId = null, email = null;
  try { anonId = localStorage.getItem('sot_quiz_anon'); } catch (e) {}
  try { const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null'); email = id && id.email; } catch (e) {}
  return { anonId, email };
}

export function fetchDailyMe(qs, { fresh = false } = {}) {
  const now = Date.now();
  // A non-fresh caller joins an identical request from the last few seconds,
  // in flight or just settled. A fresh caller always goes to the origin.
  if (!fresh && entry && entry.key === qs && now - entry.at < TTL_MS) return entry.promise;
  const url = '/api/quiz/daily-me?' + qs + (fresh ? `&fresh=1&_=${now}` : '');
  const promise = fetch(url, { cache: 'no-store' }).then((r) => r.json());
  entry = { key: qs, at: now, promise };
  return promise;
}

// A game finished on this page, so every cached answer is stale by definition.
// Callers already listen for sot:daily-updated; this makes sure the refetch they
// then run cannot be served the pre-finish payload.
export function invalidateDailyMe() { entry = null; }
