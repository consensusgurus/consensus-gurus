import { Suspense } from 'react';
import RaceClient from './RaceClient';
import { PUZZLES } from './puzzles';
import { T } from '@/lib/theme';
import { SITE_URL } from '@/lib/site';

// Race launched 2026-08-21 as a daily: linked from the hub puzzles row, the
// footer, the /daily archive, and the sitemap (/race is the canonical,
// evergreen URL). The race deepens through the week and the Sunday Edition is
// the longest, a win in five. Puzzles are gated by Eastern date here, AND the
// key move is STRIPPED before the client sees a board, so neither tomorrow's
// position nor any day's answer ever reaches the browser.

export const metadata = {
  title: 'Race — Free Daily Pawn Race Puzzle | Mind Loft',
  description:
    'A free daily pawn-race puzzle. Pawns move one square forward, capture on the diagonal, and the first one to the far rank wins. You are winning in a fixed number of moves against a perfect defence, exactly one first move keeps it, and there are no draws at all. Ten seconds of rules, a real endgame of counting.',
  alternates: { canonical: '/race' },
  openGraph: {
    title: 'Race — A Daily Pawn Race',
    description:
      'First pawn to the far rank wins. One move keeps the race and every other loses it. A new position from Mind Loft, daily.',
    url: '/race',
    type: 'website',
    siteName: 'Mind Loft',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Race — A Daily Pawn Race',
    description: 'First pawn through wins. One move keeps the race.',
  },
};

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Game',
  name: 'Race',
  alternateName: 'Race — Daily Pawn Race Endgame',
  url: `${SITE_URL}/race`,
  description:
    'A free daily pawn-race endgame puzzle. Three pawns a side: a pawn moves one square straight forward onto an empty square or one square diagonally forward onto an empty square or an enemy pawn, and the first pawn to the far rank wins on the spot. Each position is proven, by two independent solvers, to be a win in exactly the stated number of moves against a perfect defence, with exactly one first move that keeps it and no draws in the game at all. A clean solve earns a perfect score and ties break on fastest time. The Sunday Edition is the longest race of the week.',
  genre: ['Strategy game', 'Logic puzzle', 'Puzzle'],
  gamePlatform: 'Web browser',
  isAccessibleForFree: true,
  inLanguage: 'en',
  numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 1 },
  publisher: {
    '@type': 'Organization',
    name: 'Mind Loft',
    url: `${SITE_URL}`,
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}` },
    { '@type': 'ListItem', position: 2, name: 'Quizzes', item: `${SITE_URL}/quizzes` },
    { '@type': 'ListItem', position: 3, name: 'Race' },
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
          {'RACE'.split('').map((ch, i) => (
            <div key={i} style={{ width: 44, height: 44, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 26, background: i === 0 ? '#1d4ed8' : T.ink, color: T.white, boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
          ))}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: T.ink, margin: '0 0 8px' }}>Race launches {first ? first.dateLabel : 'soon'}.</h1>
        <p style={{ fontSize: 15, color: T.muted, fontWeight: 600, lineHeight: 1.5, margin: '0 0 18px' }}>
          The daily pawn race. First pawn to the far rank wins, and only one move keeps yours in front. Come back when the first position drops.
        </p>
        <a href="/daily" style={{ color: '#1d4ed8', fontWeight: 800, textDecoration: 'underline' }}>See the other daily puzzles &rarr;</a>
      </div>
    </div>
  );
}

export default function RacePage({ searchParams }) {
  const today = etTodayServer();
  // The key move never ships: the client computes everything it needs from the
  // position itself, so stripping keyUci/keySan here keeps the answer out of
  // the page payload entirely (Race is a keepsAnswer game). The strip is a
  // rest-pattern so `sunday` and every other field survives it.
  const visiblePuzzles = PUZZLES.filter((p) => p.live <= today)
    .map(({ keyUci, keySan, ...rest }) => rest);
  if (!visiblePuzzles.length) return <ComingSoon first={PUZZLES[0]} />;
  const n = Number(searchParams && searchParams.p);
  const forceNum = Number.isInteger(n) && n > 0 ? n : null;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Suspense fallback={null}>
        <RaceClient key={forceNum || 'today'} puzzles={visiblePuzzles} forceNum={forceNum} />
      </Suspense>
    </>
  );
}
