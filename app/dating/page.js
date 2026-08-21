import { Suspense } from 'react';
import DatingClient from './DatingClient';
import { PUZZLES } from './puzzles';
import { SITE_URL } from '@/lib/site';

// Dating launched 2026-07-14 alongside Crux/Garble/Links/Span: linked from
// the hub puzzles row, the footer, and the sitemap (/dating is the canonical,
// evergreen URL — the dated /quiz/dating-* stubs canonicalize here).

export const metadata = {
  title: 'Dating — Free Daily History Ordering Puzzle | Mind Loft',
  description:
    'A free daily history puzzle — put five moments from history in chronological order in three checks or fewer. Every correct placement locks in with its year. New puzzle every day, and six moments in the Sunday Edition.',
  alternates: { canonical: '/dating' },
  manifest: '/api/pwa-manifest?game=dating',
  icons: {
    icon: [{ url: '/dating-icons/favicon-32.png', sizes: '32x32', type: 'image/png' }],
    apple: [{ url: '/dating-icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Dating' },
  openGraph: {
    title: 'Dating — A Daily Put-History-In-Order Puzzle',
    description:
      'Five moments a day, shuffled out of sequence. Arrange them oldest to newest in three checks or fewer. A new history puzzle from Mind Loft.',
    url: '/dating',
    type: 'website',
    siteName: 'Mind Loft',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dating — A Daily Put-History-In-Order Puzzle',
    description:
      'Five moments a day. Put them in chronological order in three checks or fewer.',
  },
};

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Game',
  name: 'Dating',
  alternateName: 'Dating — Daily History Ordering Puzzle',
  url: `${SITE_URL}/dating`,
  description:
    'A free daily history puzzle: five events, shuffled. Arrange them in chronological order — each of your three checks locks the events you placed correctly and reveals their years.',
  genre: ['History puzzle', 'Puzzle'],
  gamePlatform: 'Web browser',
  isAccessibleForFree: true,
  inLanguage: 'en',
  numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 1 },
  image: `${SITE_URL}/quiz-heroes/dating.png`,
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
    { '@type': 'ListItem', position: 3, name: 'Dating' },
  ],
};

export const dynamic = 'force-dynamic';

function etTodayServer() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

export default function DatingPage({ searchParams }) {
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
        <DatingClient key={forceNum || 'today'} puzzles={visiblePuzzles} forceNum={forceNum} />
      </Suspense>
    </>
  );
}
