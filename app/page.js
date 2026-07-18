import QuizHomeClient from './quizzes/QuizHomeClient';
import { QUIZZES } from '@/lib/quizzes';
import { getAllSources } from '@/lib/sources';

const SOURCE_COUNT = getAllSources().length;

export function generateMetadata() {
  const count = Array.isArray(QUIZZES) ? QUIZZES.filter((q) => !q.unlisted).length : 0;
  const title = 'Source of Truths | Timed Trivia Quizzes + Daily Games';
  const description = `Test your knowledge with ${count}+ timed quizzes across films, music, geography, sports, and brands: name-them-all, matching, map, and multiple-choice, plus daily word and number games. Then browse consensus Top 10 Lists where ${SOURCE_COUNT} experts and aggregators agree.`;
  const ogTitle = 'Source of Truths: Test Your Knowledge';

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
