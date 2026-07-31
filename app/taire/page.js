import { Suspense } from 'react';
import TaireClient from './TaireClient';
import { PUZZLES } from './puzzles';

// Taire launched 2026-07-31 as the 38th daily: linked from the hub puzzles row,
// the footer, the /daily archive, and the sitemap (/taire is the canonical,
// evergreen URL). Twenty cards, two suits, everything face up, scored against a
// par that is the proven minimum. Weekdays give two free cells and run a par of
// 23 to 34; the Sunday Edition gives one. Deals are gated by Eastern date here,
// so tomorrow's board never reaches the browser.

export const metadata = {
  title: 'Taire — Free Daily Solitaire Puzzle | Source of Truths',
  description:
    'A free daily solitaire puzzle. Twenty cards, two suits, all face up, and a free cell or two beside them. No hidden cards and no luck, so every deal is winnable and everybody plays the same one. You are scored against par, the proven minimum number of moves. No app, no signup, and a new deal every day.',
  alternates: { canonical: '/taire' },
  openGraph: {
    title: 'Taire — A Daily Solitaire Puzzle',
    description: 'Send all twenty home. Par is the proven minimum, and there is no undo. A new deal from Source of Truths, daily.',
    url: '/taire', type: 'website', siteName: 'Source of Truths',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Taire — A Daily Solitaire Puzzle',
    description: 'Two suits, nothing hidden, no luck. Match par if you can.',
  },
};

const gameJsonLd = {
  '@context': 'https://schema.org', '@type': 'Game', name: 'Taire',
  alternateName: 'Taire — Daily Solitaire Puzzle',
  url: 'https://sourceoftruths.com/taire',
  description:
    'A free daily solitaire puzzle. Twenty cards in two suits, ace through ten, are dealt face up into five columns beside one or two free cells, and every card must be sent home to its foundation. Nothing is hidden and nothing is shuffled mid-game, so the deal carries no luck and is always winnable. Every deal is machine generated and solved exactly, so par is the true minimum number of moves rather than an estimate, confirmed by a second independent solver. Solving at par scores ten and every two moves over costs a point. Weekday deals give two free cells and run a par of 23 to 34, and the Sunday Edition gives only one.',
  genre: ['Solitaire', 'Card puzzle', 'Logic puzzle', 'Puzzle'],
  gamePlatform: 'Web browser', isAccessibleForFree: true, inLanguage: 'en',
  numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 1 },
  publisher: { '@type': 'Organization', name: 'Source of Truths', url: 'https://sourceoftruths.com' },
};
const breadcrumbJsonLd = {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sourceoftruths.com' },
    { '@type': 'ListItem', position: 2, name: 'Quizzes', item: 'https://sourceoftruths.com/quizzes' },
    { '@type': 'ListItem', position: 3, name: 'Taire' },
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
          {'TAIRE'.split('').map((ch, i) => (
            <div key={i} style={{ width: 40, height: 44, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 24, background: i === 4 ? '#1d6b4f' : '#1c1e24', color: '#fff', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
          ))}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1c1e24', margin: '0 0 8px' }}>Taire launches {first ? first.dateLabel : 'soon'}.</h1>
        <p style={{ fontSize: 15, color: '#262b35', fontWeight: 600, lineHeight: 1.5, margin: '0 0 18px' }}>
          The daily solitaire. Twenty cards, nothing hidden, and a par nobody can beat. Come back when the first deal drops.
        </p>
        <a href="/daily" style={{ color: '#1d6b4f', fontWeight: 800, textDecoration: 'underline' }}>See the other daily puzzles &rarr;</a>
      </div>
    </div>
  );
}

export default function TairePage({ searchParams }) {
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
        <TaireClient key={forceNum || 'today'} puzzles={visiblePuzzles} forceNum={forceNum} />
      </Suspense>
    </>
  );
}
