import GarbleClient from './GarbleClient';

// Garble soft launch: intentionally NOT in the sitemap, the /quizzes hub, or
// any homepage shelf. Reachable only by direct link until it graduates.

export const metadata = {
  title: 'Garble — A Daily Word Game | Source of Truths',
  description:
    'Five garbled words, one clued finale. Untangle each word using exactly the letters shown; the gold letters feed a final answer worth half your score. Fewest misses wins the tiebreak.',
  alternates: { canonical: '/garble' },
  openGraph: {
    title: 'Garble — A Daily Word Game',
    description: 'Five garbled words, one clued finale. Untangle it in the fewest misses.',
    url: '/garble',
    type: 'website',
    siteName: 'Source of Truths',
  },
  twitter: {
    card: 'summary',
    title: 'Garble — A Daily Word Game',
    description: 'Five garbled words, one clued finale. Untangle it in the fewest misses.',
  },
};

export default function GarblePage({ searchParams }) {
  const n = Number(searchParams && searchParams.p);
  const forceNum = Number.isInteger(n) && n > 0 ? n : null;
  return <GarbleClient key={forceNum || 'today'} forceNum={forceNum} />;
}
