import { getQuiz } from '@/lib/quizzes';
import { renderQuizResultCard } from '@/lib/og-stage-cards';

export const runtime = 'nodejs';

// Personalised result share image: /quiz/<id>/result-image?s=<score>&t=<total>&p=<pct>
// Used by the in-app Share tab ("Download image") and by Web Share, so a player
// shares a card with THEIR score baked in rather than the generic quiz card.
//
// The score now sits in a full-bleed accent curtain with onramp ink, which is
// the same shape StageFinish gives a finished run in the app: the card and the
// screen it came from read as one thing.
export async function GET(req, { params }) {
  const id = decodeURIComponent(params.id);
  const quiz = getQuiz(id);
  const { searchParams } = new URL(req.url);
  const score = Math.max(0, parseInt(searchParams.get('s') || '0', 10) || 0);
  const total = Math.max(0, parseInt(searchParams.get('t') || '0', 10) || 0);
  const pct = Math.max(0, Math.min(100, parseInt(searchParams.get('p') || '0', 10) || 0));
  const stats = [];
  if (total) stats.push([Math.round((score / total) * 100) + '%', 'correct']);
  if (pct) stats.push(['Top ' + Math.max(1, 100 - pct) + '%', 'of the field']);
  return renderQuizResultCard({
    id,
    title: quiz ? quiz.title : 'Mind Loft Quiz',
    category: quiz ? quiz.category : 'Quiz',
    score, total, pct, stats,
  });
}
