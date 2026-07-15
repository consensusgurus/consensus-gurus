import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import QuizClient from './QuizClient';
import CruxRedirect from './CruxRedirect';
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

  // Daily-game catalog stubs render only a client-side hop to the game page.
  // Canonicalize them to the evergreen game URLs so the dated stubs don't
  // compete with /crux, /garble, /links, /span in search (they're also out
  // of the sitemap).
  const GAME_URLS = { crux: '/crux', garble: '/garble', links: '/links', span: '/span', dating: '/dating', tally: '/tally' };
  const gameCanonical = GAME_URLS[quiz.format] || null;

  return {
    title: `${quiz.title} | Source of Truths`,
    description,
    alternates: { canonical: gameCanonical || url },
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

  // Crux lives on its own page; the catalog entry exists so the hub and
  // search can surface it (the sitemap carries /crux + /garble instead, and
  // these stubs canonicalize there). Send players to the real board via a
  // client-side hop that preserves ?duel=/?ch= params (see CruxRedirect).
  // (Legacy id from the few hours it launched as Crosslock, 2026-07-06.)
  if (id === 'crosslock-7-6-26') redirect('/crux?p=1');
  if (quiz && quiz.format === 'crux') return <CruxRedirect num={quiz.cruxNum || null} />;
  if (quiz && quiz.format === 'garble') return <CruxRedirect num={quiz.gameNum || null} base="/garble" />;
  if (quiz && quiz.format === 'links') return <CruxRedirect num={quiz.gameNum || null} base="/links" />;
  if (quiz && quiz.format === 'span') return <CruxRedirect num={quiz.gameNum || null} base="/span" />;
  if (quiz && quiz.format === 'dating') return <CruxRedirect num={quiz.gameNum || null} base="/dating" />;
  if (quiz && quiz.format === 'tally') return <CruxRedirect num={quiz.gameNum || null} base="/tally" />;

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
