import { Suspense } from 'react';
import VennClient from './VennClient';
import { PUZZLES } from './puzzles';

// Venn launched 2026-07-24 as one of the daily puzzles: linked from the daily
// strip, the /daily archive, and the sitemap (/venn is the canonical,
// evergreen URL). One board a day, machine-verified (scripts/verify-venn.mjs).
//
// LEAK GUARD: no board stores its answer. The client re-derives it exactly as
// the verifier does, so nothing but the puzzle itself ever ships.

export const metadata = {
  title: 'Venn — Free Daily Logic Puzzle: Sort the Overlaps | Source of Truths',
  description: 'A free daily logic puzzle. Three overlapping circles, twelve words, and every region prints how many words belong in it, so a misfiling always shows up in the arithmetic. New sheet every day.',
  alternates: { canonical: '/venn' },
  manifest: '/venn.webmanifest',
  icons: {
    icon: [{ url: '/venn-icons/favicon-32.png', sizes: '32x32', type: 'image/png' }],
    apple: [{ url: '/venn-icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Venn' },
  openGraph: { title: 'Venn — Sort Every Word Into Its Region', description: 'Three circles, twelve words, seven regions, and a count on every one. The counts are the proof: a word in the wrong place is a number that refuses to add up.', url: '/venn', type: 'website', siteName: 'Source of Truths' },
  twitter: { card: 'summary_large_image', title: 'Venn — Sort Every Word Into Its Region', description: 'Three circles, twelve words, seven regions, and a count on every one. The counts are the proof: a word in the wrong place is a number that refuses to add up.' },
};

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Game',
  name: 'Venn',
  url: 'https://sourceoftruths.com/venn',
  description: 'A free daily logic puzzle. Three overlapping circles, twelve words, and every region prints how many words belong in it, so a misfiling always shows up in the arithmetic. New sheet every day.',
  genre: ['Logic puzzle', 'Sorting puzzle', 'Word puzzle', 'Puzzle'],
  gamePlatform: 'Web browser',
  isAccessibleForFree: true,
  inLanguage: 'en',
  numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 1 },
  image: 'https://sourceoftruths.com/quiz-heroes/venn.png',
  publisher: { '@type': 'Organization', name: 'Source of Truths', url: 'https://sourceoftruths.com' },
};
const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sourceoftruths.com' },
    { '@type': 'ListItem', position: 2, name: 'Quizzes', item: 'https://sourceoftruths.com/quizzes' },
    { '@type': 'ListItem', position: 3, name: 'Venn' },
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
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1c1e24', margin: '0 0 8px' }}>Venn opens {first ? first.dateLabel : 'soon'}.</h1>
        <a href="/daily" style={{ color: '#b45309', fontWeight: 800, textDecoration: 'underline' }}>See the other daily puzzles &rarr;</a>
      </div>
    </div>
  );
}

export default function VennPage({ searchParams }) {
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
        <VennClient key={forceNum || 'today'} puzzles={visiblePuzzles} forceNum={forceNum} />
      </Suspense>
    </>
  );
}
