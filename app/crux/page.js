import { Suspense } from 'react';
import CruxClient from './CruxClient';

// Crux soft launch: intentionally NOT in the sitemap, the /quizzes hub,
// or any homepage shelf. Reachable only by direct link until it graduates.

export const metadata = {
  title: 'Crux — A Daily Word Game | Source of Truths',
  description:
    'Eight hidden words interlock in a mini crossword with no clues — the only hints are four categories, and which words belong to them is the puzzle. Guess real words on a shared budget, lock letters into the grid, then file each solved word where it belongs.',
  alternates: { canonical: '/crux' },
  openGraph: {
    title: 'Crux — A Daily Word Game',
    description:
      'Eight interlocking words, zero clues, four categories to untangle, eighteen shared guesses. A new word game from Source of Truths.',
    url: '/crux',
    type: 'website',
    siteName: 'Source of Truths',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crux — A Daily Word Game',
    description:
      'Eight interlocking words, zero clues, four categories to untangle, eighteen shared guesses.',
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
