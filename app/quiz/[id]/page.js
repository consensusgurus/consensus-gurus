import QuizClient from './QuizClient';
import { QUIZZES, getQuiz } from '@/lib/quizzes';

export const revalidate = 3600;

export function generateStaticParams() {
  if (!Array.isArray(QUIZZES)) return [];
  return QUIZZES.map((q) => ({ id: q.id }));
}

export async function generateMetadata({ params }) {
  const id = decodeURIComponent(params.id);
  const quiz = getQuiz(id);
  if (!quiz) return { title: 'Quiz not found | Source of Truths' };

  const url = `/quiz/${encodeURIComponent(id)}`;
  const count = quiz.answers.length;
  const secs = quiz.timeLimit || 90;
  const description = `${quiz.blurb} ${count} to name, ${secs} seconds on the clock. How many can you get? Beat the clock, then the leaderboard.`;
  const ogTitle = `${quiz.title} — Can You Beat the Clock?`;

  return {
    title: `${quiz.title} | Source of Truths`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: ogTitle,
      description,
      url,
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

export default function QuizPage({ params }) {
  const id = decodeURIComponent(params.id);
  const quiz = getQuiz(id);

  const jsonLd = quiz
    ? {
        '@context': 'https://schema.org',
        '@type': 'Quiz',
        name: quiz.title,
        about: quiz.blurb,
        url: `https://sourceoftruths.com/quiz/${quiz.id}`,
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <QuizClient quizId={id} />
    </>
  );
}
