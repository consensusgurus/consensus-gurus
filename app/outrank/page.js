import { Suspense } from 'react';
import OutrankClient from './OutrankClient';
import { PUZZLES } from './puzzles';

// Outrank launched 2026-07-21 as the twenty-first daily (taking retired
// Circa's slot in the lineup): linked from the daily strip, the footer, the
// /daily archive, and the sitemap (/outrank is the canonical, evergreen URL —
// the dated /quiz/outrank-* stubs canonicalize here). One themed slate a day:
// vote your favorite, then predict the crowd's full ranking; scoring happens
// server-side in /api/outrank against the house crowd + real votes.
//
// IMPORTANT: the client gets a STRIPPED view of each puzzle — the `house`
// arrays never ship to the browser, or the early crowd could be
// reverse-engineered before playing.

export const metadata = {
  title: 'Outrank — Daily Crowd Puzzle: Predict the Crowd’s Ranking | Source of Truths',
  description:
    'A free daily puzzle where the crowd is the answer key. Vote your favorite from a themed slate, then predict how everyone playing today ranks the whole list. Seven items in the Sunday Edition. Exact slot pays double; the order shifts all day as votes arrive.',
  alternates: { canonical: '/outrank' },
  manifest: '/outrank.webmanifest',
  icons: {
    icon: [{ url: '/outrank-icons/favicon-32.png', sizes: '32x32', type: 'image/png' }],
    apple: [{ url: '/outrank-icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Outrank' },
  openGraph: {
    title: 'Outrank — The Daily Crowd-Ranking Puzzle',
    description:
      'Vote your favorite, then call the crowd’s order. The answer key is everyone playing today. From Source of Truths.',
    url: '/outrank',
    type: 'website',
    siteName: 'Source of Truths',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Outrank — The Daily Crowd-Ranking Puzzle',
    description:
      'One themed slate a day. Vote your favorite, predict the crowd’s full ranking, then watch the real order roll in.',
  },
};

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Game',
  name: 'Outrank',
  alternateName: 'Outrank — Daily Crowd-Ranking Puzzle',
  url: 'https://sourceoftruths.com/outrank',
  description:
    'A free daily crowd puzzle: vote your favorite from a themed slate, then predict how the whole field of players ranks the list. The answer key is built from every player’s vote and keeps moving all day.',
  genre: ['Game theory', 'Trivia puzzle', 'Party puzzle', 'Puzzle'],
  gamePlatform: 'Web browser',
  isAccessibleForFree: true,
  inLanguage: 'en',
  numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 1 },
  image: 'https://sourceoftruths.com/quiz-heroes/outrank.png',
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
    { '@type': 'ListItem', position: 3, name: 'Outrank' },
  ],
};

export const dynamic = 'force-dynamic';

function etTodayServer() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

// Strip everything the browser must not see: the house crowds.
function clientSafe(p) {
  return {
    num: p.num,
    quizId: p.quizId,
    live: p.live,
    dateLabel: p.dateLabel,
    // `sunday` MUST survive this strip or the Sunday Edition badge never
    // renders (see the Sunday Editions section of CLAUDE.md).
    sunday: !!p.sunday,
    theme: p.theme,
    flavor: p.flavor,
    items: p.items.slice(),
  };
}

function ComingSoon({ first }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', fontFamily: "'Manrope', system-ui, sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 18 }}>
          {'OUTRANK'.split('').map((ch, i) => (
            <div key={i} style={{ width: 34, height: 34, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 20, background: i >= 3 ? '#4338ca' : '#1c1e24', color: '#fff', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
          ))}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1c1e24', margin: '0 0 8px' }}>Outrank launches {first ? first.dateLabel : 'soon'}.</h1>
        <p style={{ fontSize: 15, color: '#4b5563', fontWeight: 600, lineHeight: 1.5, margin: '0 0 18px' }}>
          The daily crowd-ranking puzzle — vote your favorite, then call the order everyone playing puts them in. Come back when the first crowd forms.
        </p>
        <a href="/daily" style={{ color: '#4338ca', fontWeight: 800, textDecoration: 'underline' }}>See the other daily puzzles &rarr;</a>
      </div>
    </div>
  );
}

export default function OutrankPage({ searchParams }) {
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
        <OutrankClient key={forceNum || 'today'} puzzles={visiblePuzzles} forceNum={forceNum} />
      </Suspense>
    </>
  );
}
