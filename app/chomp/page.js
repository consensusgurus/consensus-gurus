import { Suspense } from 'react';
import ChompClient from './ChompClient';
import { PUZZLES } from './puzzles';
import { SITE_URL } from '@/lib/site';

// Chomp launched 2026-08-08 as a daily Logic game: linked from the hub puzzles
// row, the footer, the /daily archive, and the sitemap (/chomp is the canonical,
// evergreen URL). Rows are gated by Eastern date here, the same as every other
// daily, so tomorrow's board never reaches a browser.

export const metadata = {
  title: 'Chomp — Free Daily Route Puzzle | Mind Loft',
  description:
    'Chomp is a free daily route puzzle. A cast of mascots on a small board, eaten in order, and every square you touch stays yours for the rest of the run. Your trail and a few bolted-down bleachers are the only obstacles, and the board is tight enough that finishing takes most of it. One board a day, the same for everybody, you do not need them all, and replay is free.',
  alternates: { canonical: '/chomp' },
  openGraph: {
    title: 'Chomp — A Daily Route Puzzle',
    description: 'Eat them in order. Your own trail is the maze.',
    url: '/chomp',
    type: 'website',
    siteName: 'Mind Loft',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chomp — A Daily Route Puzzle',
    description: 'Eat them in order. Your own trail is the maze.',
  },
};

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Game',
  name: 'Chomp',
  alternateName: 'Chomp — Daily Route Puzzle',
  url: `${SITE_URL}/chomp`,
  description:
    'A daily route puzzle. A cast of mascots eaten in order on a shared board, where every square you touch becomes a permanent wall.',
  genre: ['Puzzle', 'Logic', 'Route planning'],
  gamePlatform: 'Web browser',
  isAccessibleForFree: true,
  inLanguage: 'en',
  numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 1 },
  publisher: { '@type': 'Organization', name: 'Mind Loft', url: `${SITE_URL}` },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}` },
    { '@type': 'ListItem', position: 2, name: 'Quizzes', item: `${SITE_URL}/quizzes` },
    { '@type': 'ListItem', position: 3, name: 'Chomp' },
  ],
};

export const dynamic = 'force-dynamic';

function etTodayServer() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

function ComingSoon({ first }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Manrope', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 420, width: '100%', background: '#fff', border: '2px solid #0b0d12', borderRadius: 12, padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Chomp</div>
        <p style={{ fontSize: 14, lineHeight: 1.55, color: '#3f4757', margin: '0 0 16px' }}>
          Chomp launches {first.dateLabel}. Eat them in order, and mind your own trail.
        </p>
        <a href="/daily" style={{ display: 'inline-block', background: '#2563eb', color: '#fff', fontWeight: 800, fontSize: 14, padding: '11px 22px', borderRadius: 9, textDecoration: 'none' }}>
          Today&rsquo;s slate
        </a>
      </div>
    </div>
  );
}

export default function ChompPage({ searchParams }) {
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
        <ChompClient key={forceNum || 'today'} puzzles={visiblePuzzles} forceNum={forceNum} />
      </Suspense>
    </>
  );
}
