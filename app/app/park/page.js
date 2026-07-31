import { Suspense } from 'react';
import ParkClient from './ParkClient';
import { PUZZLES } from './puzzles';

// Park launched 2026-07-30 as the 34th daily: linked from the hub puzzles row,
// the footer, the /daily archive, and the sitemap (/park is the canonical,
// evergreen URL). The week climbs in three rungs: Monday to Wednesday run to a
// par of 11 to 14 moves, Thursday to Saturday 16 to 20, and Sundays 32 to 38.
// Puzzles are gated by Eastern date here, so tomorrow's board never reaches
// the browser.

export const metadata = {
  title: 'Park — Free Daily Sliding Block Puzzle | Source of Truths',
  description:
    'A free daily sliding-block puzzle. A jammed six by six lot, blocks that each slide on one axis, and a red block that has to reach the gap in the wall. You are scored against par, the proven minimum number of moves. No app, no signup, and a new board every day.',
  alternates: { canonical: '/park' },
  openGraph: {
    title: 'Park — A Daily Sliding Block Puzzle',
    description: 'Get the red block out. Par is the proven minimum, and there is no undo. A new jam from Source of Truths, daily.',
    url: '/park', type: 'website', siteName: 'Source of Truths',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Park — A Daily Sliding Block Puzzle',
    description: 'Slide the blocks, free the red one, and try to match par.',
  },
};

const gameJsonLd = {
  '@context': 'https://schema.org', '@type': 'Game', name: 'Park',
  alternateName: 'Park — Daily Sliding Block Puzzle',
  url: 'https://sourceoftruths.com/park',
  description:
    'A free daily sliding-block puzzle. Blocks fill a six by six lot and each slides along one axis only; the red block must reach the exit gap. Every board is machine generated and solved exactly, so par is the true minimum number of moves rather than an estimate. Solving at par scores ten and every two moves over costs a point. The week climbs: Monday to Wednesday run 11 to 14 moves, Thursday to Saturday 16 to 20, and Sundays 32 to 38.',
  genre: ['Sliding block puzzle', 'Logic puzzle', 'Puzzle'],
  gamePlatform: 'Web browser', isAccessibleForFree: true, inLanguage: 'en',
  numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 1 },
  publisher: { '@type': 'Organization', name: 'Source of Truths', url: 'https://sourceoftruths.com' },
};
const breadcrumbJsonLd = {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sourceoftruths.com' },
    { '@type': 'ListItem', position: 2, name: 'Quizzes', item: 'https://sourceoftruths.com/quizzes' },
    { '@type': 'ListItem', position: 3, name: 'Park' },
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
          {'PARK'.split('').map((ch, i) => (
            <div key={i} style={{ width: 44, height: 44, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 26, background: i === 3 ? '#7c5c2e' : '#1c1e24', color: '#fff', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
          ))}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1c1e24', margin: '0 0 8px' }}>Park launches {first ? first.dateLabel : 'soon'}.</h1>
        <p style={{ fontSize: 15, color: '#262b35', fontWeight: 600, lineHeight: 1.5, margin: '0 0 18px' }}>
          The daily sliding-block jam. Free the red block, and try to do it in par. Come back when the first board drops.
        </p>
        <a href="/daily" style={{ color: '#7c5c2e', fontWeight: 800, textDecoration: 'underline' }}>See the other daily puzzles &rarr;</a>
      </div>
    </div>
  );
}

export default function ParkPage({ searchParams }) {
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
        <ParkClient key={forceNum || 'today'} puzzles={visiblePuzzles} forceNum={forceNum} />
      </Suspense>
    </>
  );
}
