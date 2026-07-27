import { Suspense } from 'react';
import ListedClient from './ListedClient';
import { PUZZLES } from './puzzles';

// Listed launched 2026-07-27 as the 30th daily: linked from the hub games row,
// the daily strip, the archive, the footer, and the sitemap (/listed is the
// canonical, evergreen URL — the dated /quiz/listed-* stubs canonicalize here).

export const metadata = {
  title: 'Listed: Free Daily Ranking Game | Source of Truths',
  description:
    'A free daily ranking game. Eight real things, one measurable quantity, five submits. Green locks a row that is exactly right, amber means you are off by one place. New list every day, and nine items in the Sunday Edition.',
  alternates: { canonical: '/listed' },
  manifest: '/listed.webmanifest',
  icons: {
    icon: [{ url: '/listed-icons/favicon-32.png', sizes: '32x32', type: 'image/png' }],
    apple: [{ url: '/listed-icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Listed' },
  openGraph: {
    title: 'Listed: A Daily Ranking Game',
    description:
      'Eight real things a day, shuffled. Rank them highest to lowest in five submits. Green locks, amber means you are one place off. A new daily game from Source of Truths.',
    url: '/listed',
    type: 'website',
    siteName: 'Source of Truths',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Listed: A Daily Ranking Game',
    description:
      'Eight real things, one ranking, five submits. Green locks, amber means one place off.',
  },
};

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Game',
  name: 'Listed',
  alternateName: 'Listed: Daily Ranking Game',
  url: 'https://sourceoftruths.com/listed',
  description:
    'A free daily ranking game: eight real things and one measurable quantity, shuffled. Arrange them highest to lowest. Each of your five submits grades every row, green for exactly right, amber for off by one place, and every green locks in with its real figure revealed.',
  genre: ['Puzzle', 'Trivia game'],
  gamePlatform: 'Web browser',
  isAccessibleForFree: true,
  inLanguage: 'en',
  numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 1 },
  image: 'https://sourceoftruths.com/quiz-heroes/listed.png',
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
    { '@type': 'ListItem', position: 3, name: 'Listed' },
  ],
};

export const dynamic = 'force-dynamic';

function etTodayServer() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

export default function ListedPage({ searchParams }) {
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
        <ListedClient key={forceNum || 'today'} puzzles={visiblePuzzles} forceNum={forceNum} />
      </Suspense>
    </>
  );
}
