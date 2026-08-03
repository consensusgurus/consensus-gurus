import { Suspense } from 'react';
import CruxClient from './CruxClient';
import { PUZZLES } from './puzzles';
import { SITE_URL } from '@/lib/site';

// Crux is fully launched: linked from the hub (dated catalog entries), the
// footer, and the sitemap (/crux is the canonical, evergreen URL — the dated
// /quiz/crux-* stubs canonicalize here).

export const metadata = {
  title: 'Crux — Free Daily Word Puzzle | Mind Loft',
  description:
    'A clueless crossword and a free daily word puzzle. Eight hidden words interlock, and four categories are the only hints. New puzzle every day.',
  alternates: { canonical: '/crux' },
  manifest: '/crux.webmanifest',
  icons: {
    icon: [{ url: '/crux-icons/favicon-32.png', sizes: '32x32', type: 'image/png' }],
    apple: [{ url: '/crux-icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Crux' },
  openGraph: {
    title: 'Crux — A Daily Word Puzzle',
    description:
      'A clueless crossword. Eight interlocking words, four categories to untangle, eighteen shared guesses. A new daily word puzzle from Mind Loft.',
    url: '/crux',
    type: 'website',
    siteName: 'Mind Loft',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crux — A Daily Word Puzzle',
    description:
      'A clueless crossword. Eight interlocking words, four categories to untangle, eighteen shared guesses.',
  },
};

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Game',
  name: 'Crux',
  alternateName: 'Crux — Daily Word Puzzle',
  url: `${SITE_URL}/crux`,
  description:
    'A clueless crossword and a free daily word puzzle. Four categories are the only hints: guess real words on a shared budget, lock letters into the grid, then file each solved word under its category.',
  genre: ['Word puzzle', 'Puzzle'],
  gamePlatform: 'Web browser',
  isAccessibleForFree: true,
  inLanguage: 'en',
  numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 1 },
  image: `${SITE_URL}/quiz-heroes/crux.png`,
  publisher: {
    '@type': 'Organization',
    name: 'Mind Loft',
    url: `${SITE_URL}`,
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}` },
    { '@type': 'ListItem', position: 2, name: 'Quizzes', item: `${SITE_URL}/quizzes` },
    { '@type': 'ListItem', position: 3, name: 'Crux' },
  ],
};

export const dynamic = 'force-dynamic';

function etTodayServer() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

export default function CruxPage({ searchParams }) {
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
        <CruxClient key={forceNum || 'today'} puzzles={visiblePuzzles} forceNum={forceNum} />
      </Suspense>
    </>
  );
}
