import { Suspense } from 'react';
import AxiomClient from './AxiomClient';
import { PUZZLES } from './puzzles';

// Axiom launched 2026-07-25 as one of the daily puzzles: linked from the daily
// strip, the /daily archive, and the sitemap (/axiom is the canonical,
// evergreen URL — the dated /quiz/axiom-* stubs canonicalize here). One board a
// day, machine-verified to have exactly one consistent rule AND to need at
// least two tests to isolate it (scripts/verify-axiom.mjs).
//
// LEAK GUARD: no board stores its answer. Tile verdicts must ship (the board
// answers tests locally), but which candidate is the rule is derived in the
// browser by finding the one spec that agrees with every tile.

export const metadata = {
  title: 'Axiom — Free Daily Logic Game: Find the Hidden Rule | Source of Truths',
  description:
    'A free daily logic puzzle. One hidden rule splits a board of words, five candidate rules are on the table, and you get a handful of tests to tell them apart. New board every day.',
  alternates: { canonical: '/axiom' },
  manifest: '/axiom.webmanifest',
  icons: {
    icon: [{ url: '/axiom-icons/favicon-32.png', sizes: '32x32', type: 'image/png' }],
    apple: [{ url: '/axiom-icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Axiom' },
  openGraph: {
    title: 'Axiom — Find the Hidden Rule',
    description:
      'Green tiles obey a rule you cannot see. Red ones break it. Five candidates, a handful of tests, and most tiles teach you nothing. A new daily logic game from Source of Truths.',
    url: '/axiom',
    type: 'website',
    siteName: 'Source of Truths',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Axiom — Find the Hidden Rule',
    description: 'One hidden rule, five candidates, and a test budget that punishes guessing. Play today’s board.',
  },
};

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Game',
  name: 'Axiom',
  alternateName: 'Axiom — Daily Rule-Induction Game',
  url: 'https://sourceoftruths.com/axiom',
  description:
    'A free daily logic game: a hidden rule splits a board of words into green and red, five candidate rules are listed, and a small budget of tests decides which one fits. Every board is machine-verified to have exactly one consistent rule.',
  genre: ['Logic game', 'Deduction puzzle', 'Word game', 'Puzzle'],
  gamePlatform: 'Web browser',
  isAccessibleForFree: true,
  inLanguage: 'en',
  numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 1 },
  image: 'https://sourceoftruths.com/quiz-heroes/axiom.png',
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
    { '@type': 'ListItem', position: 3, name: 'Axiom' },
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
          {'AXIOM'.split('').map((ch, i) => (
            <div key={i} style={{ width: 44, height: 44, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 26, background: i === 0 ? '#0f766e' : '#1c1e24', color: '#fff', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
          ))}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1c1e24', margin: '0 0 8px' }}>Axiom opens {first ? first.dateLabel : 'soon'}.</h1>
        <p style={{ fontSize: 15, color: '#6b7280', fontWeight: 600, lineHeight: 1.5, margin: '0 0 18px' }}>
          The daily hidden-rule game. Green tiles obey it, red tiles break it, and most tiles teach you nothing at all.
        </p>
        <a href="/daily" style={{ color: '#0f766e', fontWeight: 800, textDecoration: 'underline' }}>See the other daily puzzles &rarr;</a>
      </div>
    </div>
  );
}

export default function AxiomPage({ searchParams }) {
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
        <AxiomClient key={forceNum || 'today'} puzzles={visiblePuzzles} forceNum={forceNum} />
      </Suspense>
    </>
  );
}
