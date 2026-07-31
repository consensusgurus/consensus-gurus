import { Suspense } from 'react';
import CheckClient from './CheckClient';
import { PUZZLES } from './puzzles';

// Check launched 2026-07-30 as the 35th daily: linked from the hub puzzles row,
// the footer, the /daily archive, and the sitemap (/check is the canonical,
// evergreen URL). Weekdays are a sweep in three moves, Sundays in four. Puzzles are gated by Eastern date here, so tomorrow's board never reaches
// the browser.

export const metadata = {
  title: 'Check — Free Daily Checkers Puzzle | Source of Truths',
  description:
    'A free daily checkers puzzle. Red to play, with a forced sweep on the board: capture every black piece in three moves, four on Sundays. Captures are compulsory, so the key is always a sacrifice. No app, no signup, and a new board every day.',
  alternates: { canonical: '/check' },
  openGraph: {
    title: 'Check — A Daily Checkers Puzzle',
    description: 'One move sweeps the board. It is always a sacrifice, and there is no take-back. A new shot from Source of Truths, daily.',
    url: '/check', type: 'website', siteName: 'Source of Truths',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Check — A Daily Checkers Puzzle',
    description: 'Take every black piece in three moves. Only one first move does it.',
  },
};

const gameJsonLd = {
  '@context': 'https://schema.org', '@type': 'Game', name: 'Check',
  alternateName: 'Check — Daily Checkers Puzzle',
  url: 'https://sourceoftruths.com/check',
  description:
    'A free daily checkers puzzle. Each board is red to play with a forced sweep: capture every black piece within a fixed number of moves, three on weekdays and four on Sundays, with exactly one first move that works. Captures are compulsory in checkers, so the winning move is a sacrifice that forces the reply. A wrong move is not refused: the engine answers and you finish the board knowing the sweep has gone.',
  genre: ['Checkers puzzle', 'Draughts puzzle', 'Logic puzzle', 'Puzzle'],
  gamePlatform: 'Web browser', isAccessibleForFree: true, inLanguage: 'en',
  numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 1 },
  publisher: { '@type': 'Organization', name: 'Source of Truths', url: 'https://sourceoftruths.com' },
};
const breadcrumbJsonLd = {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sourceoftruths.com' },
    { '@type': 'ListItem', position: 2, name: 'Quizzes', item: 'https://sourceoftruths.com/quizzes' },
    { '@type': 'ListItem', position: 3, name: 'Check' },
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
          {'CHECK'.split('').map((ch, i) => (
            <div key={i} style={{ width: 44, height: 44, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 26, background: i === 3 ? '#166e5a' : '#1c1e24', color: '#fff', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
          ))}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1c1e24', margin: '0 0 8px' }}>Check launches {first ? first.dateLabel : 'soon'}.</h1>
        <p style={{ fontSize: 15, color: '#262b35', fontWeight: 600, lineHeight: 1.5, margin: '0 0 18px' }}>
          The daily checkers shot. One sacrifice takes the whole board. Come back when the first one drops.
        </p>
        <a href="/daily" style={{ color: '#166e5a', fontWeight: 800, textDecoration: 'underline' }}>See the other daily puzzles &rarr;</a>
      </div>
    </div>
  );
}

export default function CheckPage({ searchParams }) {
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
        <CheckClient key={forceNum || 'today'} puzzles={visiblePuzzles} forceNum={forceNum} />
      </Suspense>
    </>
  );
}
