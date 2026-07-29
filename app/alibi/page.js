import { Suspense } from 'react';
import AlibiClient from './AlibiClient';
import { PUZZLES } from './puzzles';

// Alibi launched 2026-07-18 as one of the daily puzzles: linked from
// the daily strip, the footer, the /daily archive, and the sitemap (/alibi is
// the canonical, evergreen URL — the dated /quiz/alibi-* stubs canonicalize
// here). One whodunit a day, machine-verified to a unique solution.
//
// LEAK GUARD: clientSafe() strips each case's `solution` before it is passed
// to the client — the browser re-derives the unique arrangement from the
// clues with its own brute-force solver, so the answer never ships.

export const metadata = {
  title: 'Alibi — Daily Logic Puzzle: Solve the Whodunit | Source of Truths',
  description:
    'A free daily logic deduction game — four suspects, four rooms, four departure times, four curious items, and five of each in the Sunday Edition. Every witness statement is true; work the deduction boards and close the case. A new mystery every day.',
  alternates: { canonical: '/alibi' },
  manifest: '/alibi.webmanifest',
  icons: {
    icon: [{ url: '/alibi-icons/favicon-32.png', sizes: '32x32', type: 'image/png' }],
    apple: [{ url: '/alibi-icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Alibi' },
  openGraph: {
    title: 'Alibi — A Fresh Mystery Every Day',
    description:
      'Four suspects, one stolen treasure. Work the deduction boards, corner the truth, and close the case — every statement is true, and there is exactly one solution. From Source of Truths.',
    url: '/alibi',
    type: 'website',
    siteName: 'Source of Truths',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alibi — A Fresh Mystery Every Day',
    description:
      'Four suspects, three deduction boards, exactly one solution. Close tonight’s case.',
  },
};

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Game',
  name: 'Alibi',
  alternateName: 'Alibi — Daily Logic Deduction Game',
  url: 'https://sourceoftruths.com/alibi',
  description:
    'A free daily Einstein-style logic puzzle dressed as a whodunit: four suspects, four rooms, four departure times, four items, with a five-suspect Sunday Edition. Every witness statement is true, and each case is machine-verified to have exactly one solution — pure deduction closes it.',
  genre: ['Logic game', 'Deduction puzzle', 'Mystery game', 'Puzzle'],
  gamePlatform: 'Web browser',
  isAccessibleForFree: true,
  inLanguage: 'en',
  numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 1 },
  image: 'https://sourceoftruths.com/quiz-heroes/alibi.png',
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
    { '@type': 'ListItem', position: 3, name: 'Alibi' },
  ],
};

export const dynamic = 'force-dynamic';

function etTodayServer() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

// Strip the stored solution — the client re-derives it from the clues.
function clientSafe(p) {
  const { solution, ...safe } = p;
  return safe;
}

function ComingSoon({ first }) {
  // Rendered only if no puzzle is live yet (before the first drop). Never crash
  // the route on an empty visible set — show a friendly placeholder instead.
  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', fontFamily: "'Manrope', system-ui, sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginBottom: 18 }}>
          {'ALIBI'.split('').map((ch, i) => (
            <div key={i} style={{ width: 44, height: 44, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 26, background: i === 0 ? '#8b1e2d' : '#1c1e24', color: '#fff', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
          ))}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1c1e24', margin: '0 0 8px' }}>Alibi opens {first ? first.dateLabel : 'soon'}.</h1>
        <p style={{ fontSize: 15, color: '#6b7280', fontWeight: 600, lineHeight: 1.5, margin: '0 0 18px' }}>
          The nightly whodunit — four suspects, three deduction boards, exactly one solution. Come back when the first case opens.
        </p>
        <a href="/daily" style={{ color: '#8b1e2d', fontWeight: 800, textDecoration: 'underline' }}>See the other daily puzzles &rarr;</a>
      </div>
    </div>
  );
}

export default function AlibiPage({ searchParams }) {
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
        <AlibiClient key={forceNum || 'today'} puzzles={visiblePuzzles} forceNum={forceNum} />
      </Suspense>
    </>
  );
}
