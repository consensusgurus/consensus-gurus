import QuizHomeClient from './quizzes/QuizHomeClient';
import { QUIZZES } from '@/lib/quizzes';
import { getAllSources } from '@/lib/sources';

const SOURCE_COUNT = getAllSources().length;

export function generateMetadata() {
  const count = Array.isArray(QUIZZES) ? QUIZZES.filter((q) => !q.unlisted).length : 0;
  const title = 'Source of Truths | Daily Brain Exercises, Quizzes, and Top 10 Lists';
  const description = `Fresh daily brain exercises: word, number, and logic games, plus ${count}+ timed quizzes across films, music, geography, sports, and brands, from name-them-all and matching to map and multiple-choice. Then browse consensus Top 10 Lists where ${SOURCE_COUNT} experts and aggregators agree.`;
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
