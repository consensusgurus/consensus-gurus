import { getQuiz } from '@/lib/quizzes';
import { renderQuizResultCard } from '@/lib/og-brand-card';

export const runtime = 'nodejs';

// Personalized result share image: /quiz/<id>/result-image?s=<score>&t=<total>&p=<pct>
// Used by the in-app Share tab ("Download image") and Web Share so a player can
// share a card with THEIR score baked in, not the generic quiz card.
export async function GET(req, { params }) {
  const id = decodeURIComponent(params.id);
  const quiz = getQuiz(id);
  const { searchParams } = new URL(req.url);
  const score = Math.max(0, parseInt(searchParams.get('s') || '0', 10) || 0);
  const total = Math.max(0, parseInt(searchParams.get('t') || '0', 10) || 0);
  const pct = Math.max(0, Math.min(100, parseInt(searchParams.get('p') || '0', 10) || 0));
  return renderQuizResultCard({
    title: quiz ? quiz.title : 'Source of Truths Quiz',
    category: quiz ? quiz.category : 'Quiz',
    score, total, pct,
  });
}
