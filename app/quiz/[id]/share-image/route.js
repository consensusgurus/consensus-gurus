import { getQuiz } from '@/lib/quizzes';
import { renderQuizPromoCard, renderQuizQuestionCard } from '@/lib/og-brand-card';
import { companyDomainForQuiz } from '@/lib/company-quiz-meta';

export const runtime = 'nodejs';

// Standalone promo image for a quiz (post as an image, not a link).
// /quiz/<id>/share-image
export async function GET(req, { params }) {
  const id = decodeURIComponent(params.id);
  const quiz = getQuiz(id);
  if (!quiz) return renderQuizPromoCard({ title: 'Source of Truths Quiz', blurb: '', category: 'Quiz', id });
  if (quiz.category === 'Business' && quiz.format === 'timed-mcq' && Array.isArray(quiz.questions) && quiz.questions.length) {
    return renderQuizQuestionCard({ title: quiz.title, category: quiz.category, question: quiz.questions[0], qIndex: 1, total: quiz.questions.length, id, faviconDomain: companyDomainForQuiz(id) });
  }
  return renderQuizPromoCard({ title: quiz.title, blurb: quiz.blurb, category: quiz.category, id });
}
