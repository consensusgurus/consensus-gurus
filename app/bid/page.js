import { Suspense } from 'react';
import BidClient from './BidClient';
import { PUZZLES } from './puzzles';

// Bid launched 2026-07-30 as the 38th daily, and the third crowd game after Outwit and
// Outrank. Puzzles are gated by Eastern date here, and each one is stripped of
// its `house` opening crowd before it reaches the client: see clientSafe below.

export const metadata = {
  title: 'Bid — Free Daily Auction Game | Source of Truths',
  description:
    'A free daily auction game. Split a fixed purse across five lots and take the ones where you outbid the crowd. There is no right answer, only the other players, and your score moves as they arrive. No app, no signup, a new sale every day.',
  alternates: { canonical: '/bid' },
  openGraph: {
    title: 'Bid — A Daily Auction Game',
    description: 'One purse, five lots, and everyone else bidding against you. A new sale from Source of Truths, daily.',
    url: '/bid', type: 'website', siteName: 'Source of Truths',
  },
  twitter: { card: 'summary_large_image', title: 'Bid — A Daily Auction Game', description: 'Split the purse. Take the lots the crowd undervalued.' },
};

const gameJsonLd = {
  '@context': 'https://schema.org', '@type': 'Game', name: 'Bid',
  alternateName: 'Rung — Daily Word Ladder', url: 'https://sourceoftruths.com/bid',
  description:
    'A free daily auction game scored against the crowd. You get a fixed purse and five lots of differing value, and you take a lot by beating the median bid of everyone else who played that day. Because the purse is fixed you cannot outbid the field everywhere, so the game is choosing where to be strong and where to walk away. Nothing is final: every score is recomputed against the live field, so results move as more people bid.',
  genre: ['Auction game', 'Strategy game', 'Puzzle'],
  gamePlatform: 'Web browser', isAccessibleForFree: true, inLanguage: 'en',
  numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 1 },
  publisher: { '@type': 'Organization', name: 'Source of Truths', url: 'https://sourceoftruths.com' },
};
const breadcrumbJsonLd = {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sourceoftruths.com' },
    { '@type': 'ListItem', position: 2, name: 'Quizzes', item: 'https://sourceoftruths.com/quizzes' },
    { '@type': 'ListItem', position: 3, name: 'Bid' },
  ],
};

export const dynamic = 'force-dynamic';

// Strip what the browser must not see. The `house` opening crowd is the whole
// basis of day-one scoring, so shipping it to the client would hand over the
// answer to a game whose only answer is what other people did.
const clientSafe = (p) => ({
  num: p.num, quizId: p.quizId, live: p.live, dateLabel: p.dateLabel,
  sunday: p.sunday, title: p.title, budget: p.budget, lots: p.lots,
});

function etTodayServer() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

function ComingSoon({ first }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', fontFamily: "'Manrope', system-ui, sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginBottom: 18 }}>
          {'BID'.split('').map((ch, i) => (
            <div key={i} style={{ width: 44, height: 44, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 26, background: i === 3 ? '#7c2d12' : '#1c1e24', color: '#fff', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
          ))}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1c1e24', margin: '0 0 8px' }}>Bid launches {first ? first.dateLabel : 'soon'}.</h1>
        <p style={{ fontSize: 15, color: '#262b35', fontWeight: 600, lineHeight: 1.5, margin: '0 0 18px' }}>
          The daily auction. One purse, five lots, and the rest of the field bidding against you. Come back when the first sale opens.
        </p>
        <a href="/daily" style={{ color: '#7c2d12', fontWeight: 800, textDecoration: 'underline' }}>See the other daily puzzles &rarr;</a>
      </div>
    </div>
  );
}

export default function BidPage({ searchParams }) {
  const today = etTodayServer();
  const visiblePuzzles = PUZZLES.filter((p) => p.live <= today).map(clientSafe);
  if (!visiblePuzzles.length) return <ComingSoon first={PUZZLES[0]} />;
  const n = Number(searchParams && searchParams.p);
  const forceNum = Number.isInteger(n) && n > 0 ? n : null;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Suspense fallback={null}>
        <BidClient key={forceNum || 'today'} puzzles={visiblePuzzles} forceNum={forceNum} />
      </Suspense>
    </>
  );
}
