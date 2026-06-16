// Shared "correct answers" scoring for quiz leaderboards.
//
// Most quizzes store quiz_results.score as the COUNT of correct answers, so for
// them "correct answers" = score. But timed multiple-choice quizzes
// (format 'timed-mcq': the lightning rounds, the daily market quiz, etc.) store
// score as a time-decayed POINTS total (0..questions*maxPerQuestion), NOT a
// count, so summing it into "correct answers" wildly inflates the metric (a
// single 226-point game showed as 226 correct answers).
//
// Those games never recorded a true correct count, and the count can't be
// recovered exactly from the points (a correct answer is worth 1..maxPerQuestion
// depending on speed). So for timed-mcq rows we ESTIMATE the count as the
// fraction of a perfect game achieved, scaled to the number of questions, and
// clamp it to [0, questions]. This is applied uniformly to past and future
// timed plays so the metric is consistent everywhere.

import { QUIZZES } from './quizzes.js';

// quiz_id -> { questions, max } for every points-based (timed-mcq) quiz.
const POINTS_QUIZZES = new Map();
for (const q of QUIZZES) {
  if (q && q.format === 'timed-mcq') {
    POINTS_QUIZZES.set(q.id, {
      questions: Array.isArray(q.questions) ? q.questions.length : 0,
      max: Number(q.maxPerQuestion) || 0,
    });
  }
}

export function isPointsQuiz(quizId) {
  return POINTS_QUIZZES.has(quizId);
}

// Correct-answer contribution of one quiz_results row.
//   count-based quiz -> the raw score (already a correct count)
//   timed-mcq quiz   -> estimated count = round(score / total * questions),
//                       clamped to [0, questions]
export function correctAnswersOf(row) {
  if (!row) return 0;
  const score = Number(row.score) || 0;
  const p = POINTS_QUIZZES.get(row.quiz_id);
  if (!p) return score;
  const questions = p.questions;
  const total = Number(row.total) || (questions * p.max) || 0;
  if (!questions || !total) return 0;
  const est = Math.round((score / total) * questions);
  return Math.max(0, Math.min(questions, est));
}
