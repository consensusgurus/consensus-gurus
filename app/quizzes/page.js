import QuizHomeClient from './QuizHomeClient';
import { QUIZZES } from '@/lib/quizzes';

export function generateMetadata() {
  const count = Array.isArray(QUIZZES) ? QUIZZES.length : 0;
  const title = 'Quizzes | Source of Truths';
  const description = `How many can you name? ${count} timed name-them-all quizzes, built from the rankings behind Source of Truths: top-grossing films, best-selling albums, most-streamed songs, biggest games, cars, and more. Ten to name, ninety seconds on the clock. Beat the clock, then the leaderboard.`;
  const url = '/quizzes';

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: 'Source of Truths Quizzes — How Many Can You Name?',
      description,
      url,
      type: 'website',
      siteName: 'Source of Truths',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Source of Truths Quizzes — How Many Can You Name?',
      description,
    },
  };
}

export default function QuizzesPage() {
  return <QuizHomeClient />;
}
