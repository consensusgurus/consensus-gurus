import { Suspense } from 'react';
import EtchClient from './EtchClient';
import { PUZZLES } from './puzzles';

// Etch launched 2026-07-27 as the 29th daily: linked from the hub puzzles row,
// the footer, the /daily archive, and the sitemap (/etch is the canonical,
// evergreen URL). Weekdays are a 10x10 picture; Sundays step up to a 15x15
// Edition. Puzzles are gated by Eastern date here, so tomorrow's picture (and
// its solution) never reaches the browser.

export const metadata = {
  title: 'Etch — Free Daily Nonogram (Picross) | Source of Truths',
  description:
    'A free daily nonogram, also called picross or griddler. The row and column clues give the run lengths of filled squares. Fill the grid by pure logic, never guesswork, and a picture appears. One solution, a new picture every day, and a bigger 15x15 Edition on Sundays.',
  alternates: { canonical: '/etch' },
  openGraph: {
    title: 'Etch — A Daily Nonogram',
    description:
      'Row and column clues, one logical solution, and a picture at the end. A new picture-logic puzzle from Source of Truths, daily.',
    url: '/etch',
    type: 'website',
    siteName: 'Source of Truths',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Etch — A Daily Nonogram',
    description: 'Fill the squares the clues force and a picture appears. One solution, no guessing.',
  },
};

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Game',
  name: 'Etch',
  alternateName: 'Etch — Daily Nonogram',
  url: 'https://sourceoftruths.com/etch',
  description:
    'A free daily nonogram (picross): the numbers beside each row and above each column give the lengths of the filled runs in that line, in order. Fill every square the clues force and a hidden picture appears. Each board has exactly one solution and is solvable by pure line logic, with no guessing. A clean, error-free solve earns a perfect score, and ties break on fewest errors then fastest time.',
  genre: ['Logic puzzle', 'Nonogram', 'Picross', 'Puzzle'],
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
    { '@type': 'ListItem', position: 3, name: 'Etch' },
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
          {'ETCH'.split('').map((ch, i) => (
            <div key={i} style={{ width: 44, height: 44, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 26, background: i === 3 ? '#4d7c0f' : '#1c1e24', color: '#fff', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
          ))}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1c1e24', margin: '0 0 8px' }}>Etch launches {first ? first.dateLabel : 'soon'}.</h1>
        <p style={{ fontSize: 15, color: '#4b5563', fontWeight: 600, lineHeight: 1.5, margin: '0 0 18px' }}>
          The daily nonogram — fill the squares the row and column clues force, and a picture appears. Come back when the first grid drops.
        </p>
        <a href="/daily" style={{ color: '#4d7c0f', fontWeight: 800, textDecoration: 'underline' }}>See the other daily puzzles &rarr;</a>
      </div>
    </div>
  );
}

export default function EtchPage({ searchParams }) {
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
        <EtchClient key={forceNum || 'today'} puzzles={visiblePuzzles} forceNum={forceNum} />
      </Suspense>
    </>
  );
}
