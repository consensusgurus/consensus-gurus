import { Suspense } from 'react';
import TuckClient from './TuckClient';
import { PUZZLES } from './puzzles';
import { T } from '@/lib/theme';

// Tuck launched 2026-07-18 as one of the daily puzzles: linked from the daily
// strip, the footer, the /daily archive, and the sitemap (/tuck is the
// canonical, evergreen URL — the dated /quiz/tuck-* stubs canonicalize here).
// One 14-letter rack a day; players build their own interlocking grid and
// chase the solver-verified par.

export const metadata = {
  title: 'Tuck — Daily Word Puzzle: Same Letters, Highest Score Wins | Mind Loft',
  description:
    'A free daily word puzzle — everyone gets the same 14 letters, and 15 in the Sunday Edition. Tuck them into your own interlocking crossword grid: every run must be a word, intersections score double, and each day has a solver-verified par to beat.',
  alternates: { canonical: '/tuck' },
  manifest: '/tuck.webmanifest',
  icons: {
    icon: [{ url: '/tuck-icons/favicon-32.png', sizes: '32x32', type: 'image/png' }],
    apple: [{ url: '/tuck-icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Tuck' },
  openGraph: {
    title: 'Tuck — The Daily Tile-Tucking Word Puzzle',
    description:
      'Fourteen letters, one empty board, no single answer. Everyone plays the same rack, and the highest score wins the day. From Mind Loft.',
    url: '/tuck',
    type: 'website',
    siteName: 'Mind Loft',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tuck — The Daily Tile-Tucking Word Puzzle',
    description:
      'Everyone gets the same 14 letters. Tuck them into your own crossword grid and beat today’s par.',
  },
};

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Game',
  name: 'Tuck',
  alternateName: 'Tuck — Daily Tile-Tucking Word Puzzle',
  url: 'https://sourceoftruths.com/tuck',
  description:
    'A free daily word puzzle: everyone gets the same 14 standard-weighted letters and builds their own interlocking crossword on a 9×9 board. Every run of letters must be a dictionary word, intersections score in both words, and each day carries a solver-verified par to beat.',
  genre: ['Word puzzle', 'Puzzle', 'Strategy puzzle'],
  gamePlatform: 'Web browser',
  isAccessibleForFree: true,
  inLanguage: 'en',
  numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 1 },
  image: 'https://sourceoftruths.com/quiz-heroes/tuck.png',
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
    { '@type': 'ListItem', position: 3, name: 'Tuck' },
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
          {'TUCK'.split('').map((ch, i) => (
            <div key={i} style={{ width: 44, height: 44, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 26, background: i === 0 ? '#92400e' : T.ink, color: T.white, boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
          ))}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: T.ink, margin: '0 0 8px' }}>Tuck launches {first ? first.dateLabel : 'soon'}.</h1>
        <p style={{ fontSize: 15, color: T.muted, fontWeight: 600, lineHeight: 1.5, margin: '0 0 18px' }}>
          The daily tile-tucking word puzzle — 14 letters, one empty board, and a par to beat. Come back when the first rack drops.
        </p>
        <a href="/daily" style={{ color: '#92400e', fontWeight: 800, textDecoration: 'underline' }}>See the other daily puzzles &rarr;</a>
      </div>
    </div>
  );
}

export default function TuckPage({ searchParams }) {
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
        <TuckClient key={forceNum || 'today'} puzzles={visiblePuzzles} forceNum={forceNum} />
      </Suspense>
    </>
  );
}
