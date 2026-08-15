import { DAILY_DATED_RE, DAILY_GAME_MAP, dailyLabel, etTodayISO } from './daily-games.js';

// WHAT A DUEL IS FOUGHT OVER (2026-08-15). A duel row carries one field,
// `quiz_id`, and that id is now one of two things: a quiz from lib/quizzes, or a
// DATED daily puzzle ('crux-8-15-26'). Five surfaces have to turn it back into a
// title, a play link and, for a daily, whether that board is still today's: the
// picker at /duel/new, the token page, the hub DuelTile, the Stat Hub duel list
// and the challenge pop-up. Before this module they each resolved it their own
// way, which is how three of them printed a raw dated id at the reader.
//
// This file is CLIENT-SAFE on purpose. lib/daily-games is a plain registry, so
// nothing here pulls in a puzzle file. Today's playable slate is a different
// question and comes from /api/duel/subjects, which has to be server-side.

// The '-M-D-YY' suffix for today in Eastern, the zone every daily rolls over on.
export function etSuffixToday() {
  const [Y, M, D] = etTodayISO().split('-').map(Number);
  return `${M}-${D}-${Y % 100}`;
}

// Parse a dated daily quiz_id. Returns null for an ordinary quiz id, so this
// doubles as the "is this duel a daily?" test.
export function parseDailyId(quizId) {
  const m = DAILY_DATED_RE.exec(quizId || '');
  if (!m) return null;
  const key = m[1];
  const g = DAILY_GAME_MAP[key] || {};
  return {
    key,
    suffix: `${Number(m[2])}-${Number(m[3])}-${m[4]}`,
    name: g.name || key,
    // The registry href, never `/${key}`: Parker keeps the 'park' key.
    href: g.href || `/${key}`,
  };
}

// The duel's subject, for display. `quiz` is the caller's own already-resolved
// QUIZZES entry (or null), passed in so this module never imports the quiz
// catalog: the daily clients import it too and the catalog is large.
//
//   title      'Crux: 8/15/26 (Sunday Edition)'  /  the quiz's title
//   href       '/crux'                           /  '/quiz/<id>'
//   noun       'puzzle'                          /  'quiz'
//   expired    true once the pinned day is not today's ET day (daily only)
export function duelSubject(quizId, quiz) {
  const d = parseDailyId(quizId);
  if (d) {
    return {
      isDaily: true,
      key: d.key,
      title: dailyLabel(quizId) || d.name,
      shortTitle: d.name,
      href: d.href,
      noun: 'puzzle',
      Noun: 'Puzzle',
      expired: d.suffix !== etSuffixToday(),
    };
  }
  return {
    isDaily: false,
    key: null,
    title: (quiz && quiz.title) || quizId,
    shortTitle: (quiz && quiz.title) || quizId,
    href: `/quiz/${quizId}`,
    noun: 'quiz',
    Noun: 'Quiz',
    expired: false,
  };
}
