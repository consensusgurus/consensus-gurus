import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import PricerClient from './PricerClient';
import { PUZZLES } from './puzzles';
import { T } from '@/lib/theme';
import { SITE_URL } from '@/lib/site';

// Pricer launched 2026-08-10: Bracket's engine pointed at money. Sixteen real
// things from ONE category, one price question a day, fifteen picks that
// propagate, and no feedback until the reveal. Machine-verified
// (scripts/verify-pricer.mjs).
//
// LEAK GUARD: no board stores its winners. Every item ships with its real price
// and the client recomputes each matchup, exactly as the verifier does.

export const metadata = {
  title: 'Pricer — Free Daily Puzzle: Which Costs More, or Less? | Mind Loft',
  description:
    'A free daily price puzzle. Sixteen real things from one category, one money question, fifteen picks, and no feedback until the end. Your picks propagate, so one bad call in round one busts everything downstream. New field every day.',
  alternates: { canonical: '/pricer' },
  manifest: '/api/pwa-manifest?game=pricer',
  icons: {
    // Favicon is the Mind Loft mark on every page, games included (owner rule, 2026-08-31).
    // Do NOT restore a per-game favicon here, and do NOT 'simplify' this by deleting the line:
    // ANY metadata.icons object suppresses the root app/icon.png inheritance (Next resolves the
    // file-convention icon only `if (!resolvedMetadata.icons)`), so removing it would leave the
    // tab on the 16px favicon.ico alone. The per-game apple-touch icon below and the .webmanifest
    // icons are deliberately untouched, so a home-screen or installed shortcut keeps the game's
    // own art. The now-unreferenced favicon-32.png files stay in /public.
    icon: [{ url: '/icon.png', sizes: '512x512', type: 'image/png' }],
    apple: [{ url: '/pricer-icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Pricer' },
  openGraph: {
    // Static share card (2026-09-02): pre-rendered once into public/og/, replacing the per-game
    // opengraph-image / twitter-image routes that satori re-rendered on every deploy.
    images: [{ url: '/og/pricer.png', width: 1200, height: 630, alt: 'Pricer — the daily price bracket from Mind Loft' }],
    title: 'Pricer — The Daily Price Bracket',
    description: 'Sixteen price tags, one question, fifteen picks. Your winners carry forward, so a first-round mistake takes every later line down with it.',
    url: '/pricer', type: 'website', siteName: 'Mind Loft',
  },
  twitter: {
    images: ['/og/pricer.png'],
    card: 'summary_large_image',
    title: 'Pricer — The Daily Price Bracket',
    description: 'Sixteen real price tags, one question, and a bracket that busts exactly like your Final Four.',
  },
};

const gameJsonLd = {
  '@context': 'https://schema.org', '@type': 'Game', name: 'Pricer',
  url: `${SITE_URL}/pricer`,
  description: 'A free daily price puzzle: sixteen real things from one category seeded into a single-elimination draw, one money question for the day, and picks that propagate like a real pool sheet.',
  genre: ['Trivia puzzle', 'Bracket puzzle', 'Puzzle'],
  gamePlatform: 'Web browser', isAccessibleForFree: true, inLanguage: 'en',
  numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 1 },
  image: `${SITE_URL}/quiz-heroes/pricer.png`,
  publisher: { '@type': 'Organization', name: 'Mind Loft', url: `${SITE_URL}` },
};
const breadcrumbJsonLd = {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}` },
    { '@type': 'ListItem', position: 2, name: 'Quizzes', item: `${SITE_URL}/quizzes` },
    { '@type': 'ListItem', position: 3, name: 'Pricer' },
  ],
};

// PRICER PULLED 2026-08-09. The bank shipped two structural problems worth
// fixing before anyone plays it: 63% of first-round matchups are decided by
// the seeding before the player reads them, and 20 matchups across 9 boards
// pit the same product against itself at a different size (40pc nuggets vs
// 4pc), which is arithmetic rather than a price question. Data, engine,
// verifier and rolodex all stay in the tree; only the door is shut.
// Flip this to true and uncomment the registry entries to bring it back.
const PRICER_LIVE = false;

export const dynamic = 'force-dynamic';
function etTodayServer() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}
function ComingSoon({ first }) {
  return (
    <div style={{ minHeight: '100vh', background: T.surface, fontFamily: "'Manrope', system-ui, sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: T.ink, margin: '0 0 8px' }}>Pricer opens {first ? first.dateLabel : 'soon'}.</h1>
        <a href="/daily" style={{ color: '#15803d', fontWeight: 800, textDecoration: 'underline' }}>See the other daily puzzles &rarr;</a>
      </div>
    </div>
  );
}
export default function PricerPage({ searchParams }) {
  if (!PRICER_LIVE) notFound();
  const today = etTodayServer();
  const preview = searchParams && searchParams.preview === '1';
  const visiblePuzzles = preview ? PUZZLES : PUZZLES.filter((p) => p.live <= today);
  if (!visiblePuzzles.length) return <ComingSoon first={PUZZLES[0]} />;
  const n = Number(searchParams && searchParams.p);
  const forceNum = Number.isInteger(n) && n > 0 ? n
    : preview ? (PUZZLES.find((p) => p.live > today) || PUZZLES[0]).num
    : null;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Suspense fallback={null}>
        <PricerClient key={forceNum || 'today'} puzzles={visiblePuzzles} forceNum={forceNum} preview={preview} />
      </Suspense>
    </>
  );
}
