import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import QuizClient from './QuizClient';
import { QUIZZES, getQuiz } from '@/lib/quizzes';

export const revalidate = 3600;

// On-demand ISR: do NOT prerender all ~1,200 quiz pages at build (each imports
// the 2.6MB quizzes.js; together they dominated build time). [] renders each
// page on first request and CDN-caches it via `revalidate`; dynamicParams=true
// allows any quiz id to render on demand.
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  const id = decodeURIComponent(params.id);
  const quiz = getQuiz(id);
  if (!quiz) return { title: 'Quiz not found | Source of Truths' };

  const url = `/quiz/${encodeURIComponent(id)}`;
  // Format-agnostic share copy: just the topic and its description, so the card
  // reads correctly for name-them-all, map, and matching quizzes alike.
  const description = quiz.blurb;
  const ogTitle = quiz.title;

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

  // Crosslock lives on its own page; the catalog entry exists so the hub,
  // search, and sitemap can surface it. Send players to the real board.
  if (quiz && quiz.format === 'crosslock') redirect('/crosslock');

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
      <Suspense fallback={null}>
        <QuizClient quizId={id} />
      </Suspense>
    </>
  );
}
