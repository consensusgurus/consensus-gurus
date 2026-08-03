import { Suspense } from 'react';
import JesterClient from './JesterClient';
import { PUZZLES } from './puzzles';
import { T } from '@/lib/theme';
import { SITE_URL } from '@/lib/site';

// Jester launched 2026-07-18 as one of the daily puzzles: linked from
// the daily strip, the footer, the /daily archive, and the sitemap (/jester is
// the canonical, evergreen URL — the dated /quiz/jester-* stubs canonicalize
// here). One court a day, machine-verified to a unique solution AND to fall
// to pure deduction (scripts/verify-jester.mjs).
//
// LEAK GUARD: clientSafe() strips each board's `solution` before it is passed
// to the client — the browser re-derives the unique seating from the regions
// with its own backtracking solver, so the answer never ships.

export const metadata = {
  title: 'Jesters — Daily Logic Puzzle: Seat the Court | Mind Loft',
  description:
    'A free daily placement puzzle in the Star Battle family — seat a jester in every row, column and colored court, with no two jesters touching. Exactly one solution, pure deduction. A new court every day, harder as the week goes on, and two jesters per row on Sundays.',
  alternates: { canonical: '/jester' },
  manifest: '/jester.webmanifest',
  icons: {
    icon: [{ url: '/jester-icons/favicon-32.png', sizes: '32x32', type: 'image/png' }],
    apple: [{ url: '/jester-icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Jesters' },
  openGraph: {
    title: 'Jesters — Seat the Court, Every Day',
    description:
      'One jester per row, per column, per colored court, and no two may touch. Two apiece on Sundays. Every board is machine-verified to a single solution reachable by pure deduction. From Mind Loft.',
    url: '/jester',
    type: 'website',
    siteName: 'Mind Loft',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jesters — Seat the Court, Every Day',
    description:
      'One jester per row, column and court, two on Sundays. No touching. Exactly one solution, seat today’s court.',
  },
};

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Game',
  name: 'Jesters',
  alternateName: 'Jesters — Daily Court-Placement Logic Puzzle',
  url: `${SITE_URL}/jester`,
  description:
    'A free daily Star Battle-style logic puzzle: seat a jester in every row, every column and every colored court, with no two jesters touching, even diagonally. Boards are graded so the week climbs from a gentle Monday to a hard Saturday, and Sunday seats two jesters per row, column and court. Every board is machine-verified to have exactly one solution reachable by pure deduction — no guessing.',
  genre: ['Logic puzzle', 'Placement puzzle', 'Star Battle', 'Puzzle'],
  gamePlatform: 'Web browser',
  isAccessibleForFree: true,
  inLanguage: 'en',
  numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 1 },
  image: `${SITE_URL}/quiz-heroes/jester.png`,
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
    { '@type': 'ListItem', position: 3, name: 'Jesters' },
  ],
};

export const dynamic = 'force-dynamic';

function etTodayServer() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

// Strip the stored solution — the client re-derives it from the regions.
function clientSafe(p) {
  const { solution, ...safe } = p;
  return safe;
}

function ComingSoon({ first }) {
  // Rendered only if no puzzle is live yet (before the first drop). Never crash
  // the route on an empty visible set — show a friendly placeholder instead.
  return (
    <div style={{ minHeight: '100vh', background: T.surface, fontFamily: "'Manrope', system-ui, sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginBottom: 18 }}>
          {'JESTER'.split('').map((ch, i) => (
            <div key={i} style={{ width: 44, height: 44, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 26, background: i === 0 ? '#7c3aed' : T.ink, color: T.white, boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
          ))}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: T.ink, margin: '0 0 8px' }}>Jesters opens {first ? first.dateLabel : 'soon'}.</h1>
        <p style={{ fontSize: 15, color: T.muted, fontWeight: 600, lineHeight: 1.5, margin: '0 0 18px' }}>
          The daily court-placement puzzle &mdash; a jester per row, column and court, no touching, exactly one solution. Come back when the first court convenes.
        </p>
        <a href="/daily" style={{ color: '#7c3aed', fontWeight: 800, textDecoration: 'underline' }}>See the other daily puzzles &rarr;</a>
      </div>
    </div>
  );
}

export default function JesterPage({ searchParams }) {
  const today = etTodayServer();
  const visiblePuzzles = PUZZLES.filter((p) => p.live <= today).map(clientSafe);
  if (!visiblePuzzles.length) return <ComingSoon first={PUZZLES[0]} />;
  const n = Number(searchParams && searchParams.p);
  const forceNum = Number.isInteger(n) && n > 0 ? n : null;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Suspense fallback={null}>
        <JesterClient key={forceNum || 'today'} puzzles={visiblePuzzles} forceNum={forceNum} />
      </Suspense>
    </>
  );
}
