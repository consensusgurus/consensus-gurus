import LsatQuizClient from './LsatQuizClient';

// Hidden, unlinked preview page (not in the QUIZZES index, not wired into the
// quiz scoring/leaderboard APIs). noindex so it stays out of search results.
export const metadata = {
  title: 'LSAT Practice — Where Will You Get In? | Source of Truths',
  description:
    'Ten hard LSAT-style logical reasoning questions, 35 seconds each. See which law schools your score puts in reach.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/lsat' },
};

export default function LsatPage() {
  return <LsatQuizClient />;
}
