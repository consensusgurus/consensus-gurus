import { Suspense } from 'react';
import TallyClient from './TallyClient';
import { PUZZLES } from './puzzles';

// Tally launched 2026-07-15 as the sixth daily: linked from the hub games row,
// the footer, the /daily archive, and the sitemap (/tally is the canonical,
// evergreen URL — the dated /quiz/tally-* stubs canonicalize here). Weekdays
// are a 5×5 board; Sundays step up to 6×6.

export const metadata = {
  title: 'Tally — Free Daily Number Puzzle (Sudoku-style) | Source of Truths',
  description:
    'A free daily number puzzle — fill the grid from a rack of tiles so every row and column hits its target. A logic game in the sudoku family, with a new board every day and a bigger 6×6 grid on Sundays.',
  alternates: { canonical: '/tally' },
  manifest: '/tally.webmanifest',
  icons: {
    icon: [{ url: '/tally-icons/favicon-32.png', sizes: '32x32', type: 'image/png' }],
    apple: [{ url: '/tally-icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Tally' },
  openGraph: {
    title: 'Tally — A Daily Number-Ledger Puzzle',
    description:
      'Fill the grid from your rack so every row and column adds up to its target. One solution, fewest moves wins. A new number puzzle from Source of Truths, daily.',
    url: '/tally',
    type: 'website',
    siteName: 'Source of Truths',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tally — A Daily Number-Ledger Puzzle',
    description:
      'Fill the grid from your rack so every row and column adds up to its target. Fewest moves wins.',
  },
};

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Game',
  name: 'Tally',
  alternateName: 'Tally — Daily Number Puzzle',
  url: 'https://sourceoftruths.com/tally',
  description:
    'A free daily logic puzzle in the sudoku family: fill an N×N grid from a fixed rack of number tiles so every row and column adds up to its printed target. Each board has one solution — solve it in the fewest moves for a perfect score, and ties break on fewest errors then fastest time.',
  genre: ['Logic game', 'Number puzzle', 'Puzzle'],
  gamePlatform: 'Web browser',
  isAccessibleForFree: true,
  inLanguage: 'en',
  numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 1 },
  image: 'https://sourceoftruths.com/quiz-heroes/tally.png',
  publisher: {
    '@type': 'Organization',
    name: 'Source of Truths',
    url: 'https://sourceoftruths.com',
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sourceoftruths.com' },
    { '@type': 'ListItem', position: 2, name: 'Quizzes', item: 'https://sourceoftruths.com/quizzes' },
    { '@type': 'ListItem', position: 3, name: 'Tally' },
  ],
};

export const dynamic = 'force-dynamic';

function etTodayServer() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

export default function TallyPage({ searchParams }) {
  const today = etTodayServer();
  const visiblePuzzles = PUZZLES.filter((p) => p.live <= today);
  const n = Number(searchParams && searchParams.p);
  const forceNum = Number.isInteger(n) && n > 0 ? n : null;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Suspense fallback={null}>
        <TallyClient key={forceNum || 'today'} puzzles={visiblePuzzles} forceNum={forceNum} />
      </Suspense>
    </>
  );
}
