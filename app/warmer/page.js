import { Suspense } from 'react';
import WarmerClient from './WarmerClient';
import { PUZZLES } from './puzzles';

// Warmer launched 2026-07-18 as the seventeenth daily: linked from the daily
// strip, the /daily archive, the games grids, and the sitemap (/warmer is the
// canonical, evergreen URL — the dated /quiz/warmer-* stubs canonicalize here).
// One secret word a day; guess by meaning, hotter or colder, until you land it.
// The Sunday Edition picks a rarer word (deeper in the frequency-ordered vocab).
//
// The server picks the ACTIVE puzzle (today, or ?p=N from the archive) and sends
// only THAT day's similarity `order` to the client, plus a slim answer-free meta
// list of the rest — so future words never reach the browser.

export const metadata = {
  title: 'Warmer — Daily Word Game: Hotter or Colder | Source of Truths',
  description:
    'A free daily word game — one secret word, and every guess tells you how close it is in meaning on a cold-to-hot spectrum. Ocean is scorching for "sea," pencil is freezing. Unlimited guesses; the leaderboard ranks fewest guesses, fastest time. The Sunday Edition hides a rarer word.',
  alternates: { canonical: '/warmer' },
  manifest: '/warmer.webmanifest',
  icons: {
    icon: [{ url: '/warmer-icons/favicon-32.png', sizes: '32x32', type: 'image/png' }],
    apple: [{ url: '/warmer-icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Warmer' },
  openGraph: {
    title: 'Warmer — Hotter or Colder',
    description:
      'One secret word a day. Every guess is scored by meaning, cold to hot, until you land the word. A new one every day from Source of Truths.',
    url: '/warmer',
    type: 'website',
    siteName: 'Source of Truths',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Warmer — Hotter or Colder',
    description: 'One secret word a day. Guess by meaning — hotter or colder — until you land it.',
  },
};

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Game',
  name: 'Warmer',
  alternateName: 'Warmer — Daily Hot-and-Cold Word Game',
  url: 'https://sourceoftruths.com/warmer',
  description:
    'A free daily word game: one secret word, and every guess is scored by how close it is in meaning on a cold-to-hot spectrum. Unlimited guesses — the daily leaderboard ranks players on fewest guesses, fastest time breaking ties.',
  genre: ['Word game', 'Guessing game', 'Vocabulary game', 'Puzzle'],
  gamePlatform: 'Web browser',
  isAccessibleForFree: true,
  inLanguage: 'en',
  numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 1 },
  image: 'https://sourceoftruths.com/quiz-heroes/warmer.png',
  publisher: { '@type': 'Organization', name: 'Source of Truths', url: 'https://sourceoftruths.com' },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sourceoftruths.com' },
    { '@type': 'ListItem', position: 2, name: 'Quizzes', item: 'https://sourceoftruths.com/quizzes' },
    { '@type': 'ListItem', position: 3, name: 'Warmer' },
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
        <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginBottom: 18 }}>
          {'WARMER'.split('').map((ch, i) => (
            <div key={i} style={{ width: 40, height: 44, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 24, background: i === 5 ? '#dc2626' : '#1c1e24', color: '#fff', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
          ))}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1c1e24', margin: '0 0 8px' }}>Warmer launches {first ? first.dateLabel : 'soon'}.</h1>
        <p style={{ fontSize: 15, color: '#6b7280', fontWeight: 600, lineHeight: 1.5, margin: '0 0 18px' }}>
          The daily hot-and-cold word hunt — one secret word, guessed by meaning. Come back when the first word drops.
        </p>
        <a href="/daily" style={{ color: '#dc2626', fontWeight: 800, textDecoration: 'underline' }}>See the other daily puzzles &rarr;</a>
      </div>
    </div>
  );
}

export default function WarmerPage({ searchParams }) {
  const today = etTodayServer();
  const visible = PUZZLES.filter((p) => p.live <= today);
  if (!visible.length) return <ComingSoon first={PUZZLES[0]} />;
  const n = Number(searchParams && searchParams.p);
  const forceNum = Number.isInteger(n) && n > 0 ? n : null;
  // The active puzzle: the requested archive day (if live) or the latest drop.
  let active = forceNum ? visible.find((p) => p.num === forceNum) : null;
  if (!active) active = visible[visible.length - 1];
  // Slim, answer-free meta for the rest (prev-day link, streaks, "is this today").
  const meta = visible.map((p) => ({ num: p.num, quizId: p.quizId, live: p.live, dateLabel: p.dateLabel, sunday: p.sunday }));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Suspense fallback={null}>
        <WarmerClient key={forceNum || 'today'} active={active} puzzles={meta} forceNum={forceNum} />
      </Suspense>
    </>
  );
}
