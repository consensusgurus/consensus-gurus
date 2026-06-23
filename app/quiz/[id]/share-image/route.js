import { getQuiz } from '@/lib/quizzes';
import { renderQuizPromoCard } from '@/lib/og-brand-card';

export const runtime = 'nodejs';

// Standalone promo image for a quiz (post as an image, not a link).
// /quiz/<id>/share-image
export async function GET(req, { params }) {
  const id = decodeURIComponent(params.id);
  const quiz = getQuiz(id);
  if (!quiz) return renderQuizPromoCard({ title: 'Source of Truths Quiz', blurb: '', category: 'Quiz', id });
  return renderQuizPromoCard({ title: quiz.title, blurb: quiz.blurb, category: quiz.category, id });
}
