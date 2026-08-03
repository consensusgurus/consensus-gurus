import { Suspense } from 'react';
import CarveClient from './CarveClient';
import { PUZZLES } from './puzzles';
import { T } from '@/lib/theme';

// Carve launched 2026-07-16 as the eighth daily: linked from the daily strip,
// the footer, the /daily archive, and the sitemap (/carve is the canonical,
// evergreen URL — the dated /quiz/carve-* stubs canonicalize here). Weekdays
// are a 6×6 board in six blocks; Sundays step up to a 7×7 board in nine.

export const metadata = {
  title: 'Carve — Free Daily Number Puzzle | Mind Loft',
  description:
    'A free daily equal-sum puzzle — carve the grid into connected blocks, one per colored anchor, so every block adds to the same target. One valid carving, a clean solve wins, and Sundays go bigger.',
  alternates: { canonical: '/carve' },
  manifest: '/carve.webmanifest',
  icons: {
    icon: [{ url: '/carve-icons/favicon-32.png', sizes: '32x32', type: 'image/png' }],
    apple: [{ url: '/carve-icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Carve' },
  openGraph: {
    title: 'Carve — A Daily Equal-Sum Puzzle',
    description:
      'Slice the grid into connected blocks that all add to the same target. Exactly one valid carving. A new board from Mind Loft, daily.',
    url: '/carve',
    type: 'website',
    siteName: 'Mind Loft',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Carve — A Daily Equal-Sum Puzzle',
    description:
      'Slice the grid into connected blocks that all add to the same target. A clean, error-free carve wins.',
  },
};

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Game',
  name: 'Carve',
  alternateName: 'Carve — Daily Equal-Sum Puzzle',
  url: 'https://sourceoftruths.com/carve',
  description:
    'A free daily number puzzle: carve a digit grid into connected blocks, one grown from each colored anchor, so every block sums to the same target. Each board has exactly one valid carving — solve it with no errors for a perfect score, and ties break on fewest errors then fastest time.',
  genre: ['Logic puzzle', 'Number puzzle', 'Puzzle'],
  gamePlatform: 'Web browser',
  isAccessibleForFree: true,
  inLanguage: 'en',
  numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 1 },
  image: 'https://sourceoftruths.com/quiz-heroes/carve.png',
  publisher: {
    '@type': 'Organization',
    name: 'Mind Loft',
    url: 'https://sourceoftruths.com',
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sourceoftruths.com' },
    { '@type': 'ListItem', position: 2, name: 'Quizzes', item: 'https://sourceoftruths.com/quizzes' },
    { '@type': 'ListItem', position: 3, name: 'Carve' },
  ],
};

export const dynamic = 'force-dynamic';

function etTodayServer() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

function ComingSoon({ first }) {
  // Rendered only if no puzzle is live yet (before the first drop). Never crash
  // the route on an empty visible set — show a friendly placeholder instead.
  return (
    <div style={{ minHeight: '100vh', background: T.surface, fontFamily: "'Manrope', system-ui, sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginBottom: 18 }}>
          {'CARVE'.split('').map((ch, i) => (
            <div key={i} style={{ width: 44, height: 44, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 26, background: i === 3 ? '#7c3aed' : T.ink, color: T.white, boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
          ))}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: T.ink, margin: '0 0 8px' }}>Carve launches {first ? first.dateLabel : 'soon'}.</h1>
        <p style={{ fontSize: 15, color: T.muted, fontWeight: 600, lineHeight: 1.5, margin: '0 0 18px' }}>
          The daily equal-sum puzzle — slice the grid into connected blocks that all add to the same target. Come back when the first board drops.
        </p>
        <a href="/daily" style={{ color: '#7c3aed', fontWeight: 800, textDecoration: 'underline' }}>See the other daily puzzles &rarr;</a>
      </div>
    </div>
  );
}

export default function CarvePage({ searchParams }) {
  const today = etTodayServer();
  const visiblePuzzles = PUZZLES.filter((p) => p.live <= today);
  if (!visiblePuzzles.length) return <ComingSoon first={PUZZLES[0]} />;
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
        <CarveClient key={forceNum || 'today'} puzzles={visiblePuzzles} forceNum={forceNum} />
      </Suspense>
    </>
  );
}
