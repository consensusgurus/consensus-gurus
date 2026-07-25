import { Suspense } from 'react';
import StandsClient from './StandsClient';
import { PUZZLES } from './puzzles';

// Stands launched 2026-07-24 as one of the daily games: linked from the daily
// strip, the /daily archive, and the sitemap (/stands is the canonical,
// evergreen URL). One board a day, machine-verified (scripts/verify-stands.mjs).
//
// LEAK GUARD: no board stores its answer. The client re-derives it exactly as
// the verifier does, so nothing but the puzzle itself ever ships.

export const metadata = {
  title: 'Stands — Free Daily Logic Game: Rebuild the Results | Source of Truths',
  description: 'A free daily logic puzzle. A small league played a full round robin, the results sheet was lost, and a handful of facts survive. Exactly one set of results fits them. New season every day.',
  alternates: { canonical: '/stands' },
  manifest: '/stands.webmanifest',
  icons: {
    icon: [{ url: '/stands-icons/favicon-32.png', sizes: '32x32', type: 'image/png' }],
    apple: [{ url: '/stands-icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Stands' },
  openGraph: { title: 'Stands — Rebuild the Lost Results Table', description: 'Everyone played everyone once. Win 3, draw 1. The sheet is gone and a few facts survive, and only one set of results fits them all.', url: '/stands', type: 'website', siteName: 'Source of Truths' },
  twitter: { card: 'summary_large_image', title: 'Stands — Rebuild the Lost Results Table', description: 'Everyone played everyone once. Win 3, draw 1. The sheet is gone and a few facts survive, and only one set of results fits them all.' },
};

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Game',
  name: 'Stands',
  url: 'https://sourceoftruths.com/stands',
  description: 'A free daily logic puzzle. A small league played a full round robin, the results sheet was lost, and a handful of facts survive. Exactly one set of results fits them. New season every day.',
  genre: ['Logic game', 'Deduction puzzle', 'Constraint puzzle', 'Puzzle'],
  gamePlatform: 'Web browser',
  isAccessibleForFree: true,
  inLanguage: 'en',
  numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 1 },
  image: 'https://sourceoftruths.com/quiz-heroes/stands.png',
  publisher: { '@type': 'Organization', name: 'Source of Truths', url: 'https://sourceoftruths.com' },
};
const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sourceoftruths.com' },
    { '@type': 'ListItem', position: 2, name: 'Quizzes', item: 'https://sourceoftruths.com/quizzes' },
    { '@type': 'ListItem', position: 3, name: 'Stands' },
  ],
};

export const dynamic = 'force-dynamic';

function etTodayServer() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

function ComingSoon({ first }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', fontFamily: "'Manrope', system-ui, sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1c1e24', margin: '0 0 8px' }}>Stands opens {first ? first.dateLabel : 'soon'}.</h1>
        <a href="/daily" style={{ color: '#1d4ed8', fontWeight: 800, textDecoration: 'underline' }}>See the other daily games &rarr;</a>
      </div>
    </div>
  );
}

export default function StandsPage({ searchParams }) {
  const today = etTodayServer();
  const visiblePuzzles = PUZZLES.filter((p) => p.live <= today);
  if (!visiblePuzzles.length) return <ComingSoon first={PUZZLES[0]} />;
  const n = Number(searchParams && searchParams.p);
  const forceNum = Number.isInteger(n) && n > 0 ? n : null;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Suspense fallback={null}>
        <StandsClient key={forceNum || 'today'} puzzles={visiblePuzzles} forceNum={forceNum} />
      </Suspense>
    </>
  );
}
