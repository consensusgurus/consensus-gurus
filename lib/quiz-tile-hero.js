// Resolve a hero image for a "Similar quizzes" TILE, using the same ladder the
// quiz hub uses for its featured slots:
//   1. the quiz's own registered hero (QUIZ_HEROES / NAMED_QUIZ_HEROES)
//   2. its department's category hero (CATEGORY_HEROES, keyed by quizDept)
//   3. null  -> the tile renders a gradient monogram so it is never blank.
// Returns { src, pos } or null. pos is a CSS object-position for off-center crops.
import { QUIZ_HEROES } from './quiz-heroes';
import { CATEGORY_HEROES, NAMED_QUIZ_HEROES } from './quiz-category-heroes';
import { quizDept } from './quiz-departments';

export function tileHero(quiz) {
  if (!quiz || !quiz.id) return null;
  const own = QUIZ_HEROES[quiz.id];
  if (own && own.src) return { src: own.src, pos: own.pos || 'center' };
  const named = NAMED_QUIZ_HEROES[quiz.id];
  if (named) return { src: named, pos: 'center' };
  const cat = CATEGORY_HEROES[quizDept(quiz)];
  if (cat && cat.hero) return { src: cat.hero, pos: cat.pos || 'center' };
  return null;
}
