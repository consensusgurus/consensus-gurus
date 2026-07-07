import { Suspense } from 'react';
import CruxClient from './CruxClient';

// Crux soft launch: intentionally NOT in the sitemap, the /quizzes hub,
// or any homepage shelf. Reachable only by direct link until it graduates.

export const metadata = {
  title: 'Crux — A Daily Word Game | Source of Truths',
  description:
    'Eight hidden words interlock in a mini crossword with no clues — the only hints are four secret categories, each owning two of the words. Guess any letters on a shared 18-guess budget, lock letters into the grid, then file each solved word under its category.',
  alternates: { canonical: '/crux' },
  openGraph: {
    title: 'Crux — A Daily Word Game',
    description:
      'Eight interlocking words, zero clues, four secret categories, eighteen shared guesses. A new word game from Source of Truths.',
    url: '/crux',
    type: 'website',
    siteName: 'Source of Truths',
  },
  twitter: {
    card: 'summary',
    title: 'Crux — A Daily Word Game',
    description:
      'Eight interlocking words, zero clues, four secret categories, eighteen shared guesses.',
  },
};

export default function CruxPage({ searchParams }) {
  const n = Number(searchParams && searchParams.p);
  const forceNum = Number.isInteger(n) && n > 0 ? n : null;
  return (
    <Suspense fallback={null}>
      <CruxClient key={forceNum || 'today'} forceNum={forceNum} />
    </Suspense>
  );
}
