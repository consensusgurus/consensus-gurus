// Shared "Play Similar" picker used by the end-game popup on every quiz board.
// Returns the id of a random other quiz, preferring the same category, then the
// same department, then anything. Mirrors the related-quiz logic in QuizClient.
import { QUIZZES } from './quizzes';
import { quizDept } from './quiz-departments';

export function similarQuizId(quiz) {
  if (!quiz || !quiz.id) return null;
  const usable = (q) => q && q.id && q.id !== quiz.id && !q.hideFromRelated;
  const sameCat = QUIZZES.filter((q) => usable(q) && quiz.category && q.category === quiz.category);
  let pool = sameCat;
  if (!pool.length) {
    const d = quizDept(quiz);
    pool = QUIZZES.filter((q) => usable(q) && quizDept(q) === d);
  }
  if (!pool.length) pool = QUIZZES.filter(usable);
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)].id;
}
