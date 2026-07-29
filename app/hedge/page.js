import { Suspense } from 'react';
import HedgeClient from './HedgeClient';
import { PUZZLES } from './puzzles';

// Hedge launched 2026-07-27 as the 30th daily: linked from the hub games row,
// the footer, the /daily archive, and the sitemap (/hedge is the canonical,
// evergreen URL). Weekdays are a 7x7 loop; Sundays step up to a 10x10 Edition.
// Puzzles are gated by Eastern date here, so tomorrow's loop never reaches the
// browser.

export const metadata = {
  title: 'Hedge — Free Daily Slitherlink Loop Puzzle | Source of Truths',
  description:
    'A free daily slitherlink, the loop puzzle also known as fences. Draw one single closed loop so every numbered cell has exactly that many of its four sides on the loop. One logical solution, a new grid every day, and a bigger 10x10 Edition on Sundays.',
  alternates: { canonical: '/hedge' },
  openGraph: {
    title: 'Hedge — A Daily Loop Puzzle',
    description:
      'One closed loop, every number satisfied. A new slitherlink from Source of Truths, daily.',
    url: '/hedge',
    type: 'website',
    siteName: 'Source of Truths',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hedge — A Daily Loop Puzzle',
    description: 'Draw one closed loop so every number has exactly that many sides on it.',
  },
};

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Game',
  name: 'Hedge',
  alternateName: 'Hedge — Daily Slitherlink',
  url: 'https://sourceoftruths.com/hedge',
  description:
    'A free daily slitherlink (loop the loop): draw one single closed loop along the grid lines so that each numbered cell has exactly that many of its four sides used by the loop. The loop never branches or crosses itself, and every board has exactly one solution. A clean, error-free solve earns a perfect score, and ties break on fewest errors then fastest time.',
  genre: ['Logic game', 'Slitherlink', 'Loop puzzle', 'Puzzle'],
  gamePlatform: 'Web browser',
  isAccessibleForFree: true,
  inLanguage: 'en',
  numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 1 },
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
    { '@type': 'ListItem', position: 3, name: 'Hedge' },
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
          {'HEDGE'.split('').map((ch, i) => (
            <div key={i} style={{ width: 40, height: 44, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 24, background: i === 4 ? '#0891b2' : '#1c1e24', color: '#fff', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
          ))}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1c1e24', margin: '0 0 8px' }}>Hedge launches {first ? first.dateLabel : 'soon'}.</h1>
        <p style={{ fontSize: 15, color: '#6b7280', fontWeight: 600, lineHeight: 1.5, margin: '0 0 18px' }}>
          The daily loop puzzle — one closed loop, every number satisfied. Come back when the first grid drops.
        </p>
        <a href="/daily" style={{ color: '#0891b2', fontWeight: 800, textDecoration: 'underline' }}>See the other daily puzzles &rarr;</a>
      </div>
    </div>
  );
}

export default function HedgePage({ searchParams }) {
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
        <HedgeClient key={forceNum || 'today'} puzzles={visiblePuzzles} forceNum={forceNum} />
      </Suspense>
    </>
  );
}
