import { Suspense } from 'react';
import TaireClient from './TaireClient';
import { PUZZLES } from './puzzles';
import { T } from '@/lib/theme';

// Taire launched 2026-07-31 as the 38th daily: linked from the hub puzzles row,
// the footer, the /daily archive, and the sitemap (/taire is the canonical,
// evergreen URL). Two suits, everything face up, scored against a perfect line
// that is the proven minimum, with par a cushion above it (lib/par.js). The week
// climbs on a different dial each rung: Monday to Wednesday are the short
// sixteen-card deals (perfect 18 to 24), Thursday to Saturday run the full
// twenty (perfect 28 to 34), and the Sunday Edition keeps twenty cards but
// allows a single free cell (perfect 34 to 48). Deals are gated by
// Eastern date here, so tomorrow's board never reaches the browser.

export const metadata = {
  title: 'Taire — Free Daily Solitaire Puzzle | Source of Truths',
  description:
    'A free daily solitaire puzzle. Two suits dealt face up with a free cell or two beside them, sixteen cards early in the week and twenty from Thursday on. No hidden cards and no luck, so every deal is winnable and everybody plays the same one. You play against par, the number a clean line comes home in, and perfect, the proven minimum nobody beats. No app, no signup, and a new deal every day.',
  alternates: { canonical: '/taire' },
  openGraph: {
    title: 'Taire — A Daily Solitaire Puzzle',
    description: 'Send all twenty home. Beat par, chase perfect, and there is no undo. A new deal from Source of Truths, daily.',
    url: '/taire', type: 'website', siteName: 'Source of Truths',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Taire — A Daily Solitaire Puzzle',
    description: 'Two suits, nothing hidden, no luck. Get under par if you can.',
  },
};

const gameJsonLd = {
  '@context': 'https://schema.org', '@type': 'Game', name: 'Taire',
  alternateName: 'Taire — Daily Solitaire Puzzle',
  url: 'https://sourceoftruths.com/taire',
  description:
    'A free daily solitaire puzzle. Two suits are dealt face up into columns of four beside one or two free cells, and every card must be sent home to its foundation. Nothing is hidden and nothing is shuffled mid-game, so the deal carries no luck and is always winnable. Every deal is machine generated and solved exactly, so the perfect line is the true minimum number of moves rather than an estimate, confirmed by a second independent solver. Par sits a cushion above perfect and is beatable. Perfect scores ten and par scores eight. The week climbs on a different dial each rung: Monday to Wednesday are short sixteen-card deals with a perfect line of 18 to 24, Thursday to Saturday run the full twenty cards at 28 to 34, and the Sunday Edition keeps twenty cards but allows a single free cell.',
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
    <div style={{ minHeight: '100vh', background: T.surface, fontFamily: "'Manrope', system-ui, sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginBottom: 18 }}>
          {'TAIRE'.split('').map((ch, i) => (
            <div key={i} style={{ width: 40, height: 44, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 24, background: i === 4 ? '#1d6b4f' : T.ink, color: T.white, boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
          ))}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: T.ink, margin: '0 0 8px' }}>Taire launches {first ? first.dateLabel : 'soon'}.</h1>
        <p style={{ fontSize: 15, color: T.muted, fontWeight: 600, lineHeight: 1.5, margin: '0 0 18px' }}>
          The daily solitaire. Two suits, nothing hidden, and a perfect line nobody can beat. Come back when the first deal drops.
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
