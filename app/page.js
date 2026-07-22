import QuizHomeClient from './quizzes/QuizHomeClient';
import { QUIZZES } from '@/lib/quizzes';
import { getAllSources } from '@/lib/sources';

// Render the homepage dynamically so its header/emblem always reflects the
// latest deployment (a stale prerender cache was pinning the old logo).
export const dynamic = 'force-dynamic';

const SOURCE_COUNT = getAllSources().length;

export function generateMetadata() {
  const count = Array.isArray(QUIZZES) ? QUIZZES.filter((q) => !q.unlisted).length : 0;
  const title = 'Source of Truths | Exercise Your Mind';
  const description = `Exercise your mind every day: word, number, and logic games, plus ${count}+ timed quizzes across films, music, geography, sports, and brands, from name-them-all and matching to map and multiple-choice. Then browse consensus Top 10 Lists where ${SOURCE_COUNT} experts and aggregators agree.`;
  const ogTitle = 'Source of Truths: Exercise Your Mind';

  return {
    title,
    description,
    alternates: { canonical: '/' },
    openGraph: {
      title: ogTitle,
      description,
      url: '/',
      type: 'website',
      siteName: 'Source of Truths',
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
    },
  };
}

export default function HomePage() {
  return <QuizHomeClient />;
}
