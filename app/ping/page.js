import { Suspense } from 'react';
import PingClient from './PingClient';
import { PUZZLES } from './puzzles';
import { T } from '@/lib/theme';

// Ping launched 2026-07-18 as the seventeenth daily: linked from the daily
// strip, the /daily archive, and the sitemap (/ping is the canonical, evergreen
// URL — the dated /quiz/ping-* stubs canonicalize here). One secret city a day;
// guess any world city and each guess pings back the distance in miles to the
// target (no direction). Keep guessing until you land on it; score is how few
// guesses it took, and giving up scores you on your closest guess. Sundays
// hide a trickier city.

export const metadata = {
  title: 'Ping — Daily City Puzzle: Guess the City by Distance | Mind Loft',
  description:
    'A free daily geography puzzle — one secret world city, no clues. Guess any city and Ping tells you exactly how many miles away it is. Home in and keep guessing until you find it; the fewer guesses, the better your score.',
  alternates: { canonical: '/ping' },
  manifest: '/ping.webmanifest',
  icons: {
    icon: [{ url: '/ping-icons/favicon-32.png', sizes: '32x32', type: 'image/png' }],
    apple: [{ url: '/ping-icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Ping' },
  openGraph: {
    title: 'Ping — The Daily City Hunt',
    description:
      'One secret city a day, no clues. Guess a city and get the exact miles to the target. Home in and find it. From Mind Loft.',
    url: '/ping',
    type: 'website',
    siteName: 'Mind Loft',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ping — The Daily City Hunt',
    description:
      'One secret city a day, no clues. Every guess pings back the exact distance in miles to the target.',
  },
};

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Game',
  name: 'Ping',
  alternateName: 'Ping — Daily City Puzzle',
  url: 'https://sourceoftruths.com/ping',
  description:
    'A free daily geography puzzle: one secret world city, no clues. Guess any city and each guess returns the great-circle distance in miles to the target. Keep guessing until you find it — the fewer guesses, the better.',
  genre: ['Geography puzzle', 'Trivia puzzle', 'Guessing puzzle', 'Puzzle'],
  gamePlatform: 'Web browser',
  isAccessibleForFree: true,
  inLanguage: 'en',
  numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 1 },
  image: 'https://sourceoftruths.com/quiz-heroes/ping.png',
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
    { '@type': 'ListItem', position: 3, name: 'Ping' },
  ],
};

export const dynamic = 'force-dynamic';

function etTodayServer() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

function ComingSoon({ first }) {
  // Rendered only before the first drop. Never crash the route on an empty
  // visible set — show a friendly placeholder instead.
  return (
    <div style={{ minHeight: '100vh', background: T.surface, fontFamily: "'Manrope', system-ui, sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginBottom: 18 }}>
          {'PING'.split('').map((ch, i) => (
            <div key={i} style={{ width: 44, height: 44, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 26, background: i === 3 ? '#0284c7' : T.ink, color: T.white, boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
          ))}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: T.ink, margin: '0 0 8px' }}>Ping launches {first ? first.dateLabel : 'soon'}.</h1>
        <p style={{ fontSize: 15, color: T.muted, fontWeight: 600, lineHeight: 1.5, margin: '0 0 18px' }}>
          The daily city hunt: one secret city, no clues, homing in by distance alone. Come back when the first city drops.
        </p>
        <a href="/daily" style={{ color: '#0284c7', fontWeight: 800, textDecoration: 'underline' }}>See the other daily puzzles &rarr;</a>
      </div>
    </div>
  );
}

export default function PingPage({ searchParams }) {
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
        <PingClient key={forceNum || 'today'} puzzles={visiblePuzzles} forceNum={forceNum} />
      </Suspense>
    </>
  );
}
