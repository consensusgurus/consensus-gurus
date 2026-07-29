import { Suspense } from 'react';
import LodeClient from './LodeClient';
import { PUZZLES } from './puzzles';

// Lode launched 2026-07-25 as a daily puzzle: linked from the daily strip, the
// footer, the /daily archive, and the sitemap (/lode is the canonical, evergreen
// URL — the dated /quiz/lode-* stubs canonicalize here). Seven letters, one core
// letter, and scoring that pays for rare words rather than long ones.
//
// The whole scored word list lives in the puzzle object, so this SERVER
// component is what keeps future boards out of the browser: filter live<=today
// before anything reaches the client.

export const metadata = {
  title: 'Lode — Free Daily Word Game: Seven Letters, Rare Words Pay | Source of Truths',
  description:
    'A free daily word game and a fresh spin on the letters puzzle. Seven letters, one core letter every word must use, and points that reward rare words over long ones. Strike the vein, then chase the Mother Lode. New board every day.',
  alternates: { canonical: '/lode' },
  manifest: '/lode.webmanifest',
  icons: {
    icon: [{ url: '/lode-icons/favicon-32.png', sizes: '32x32', type: 'image/png' }],
    apple: [{ url: '/lode-icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Lode' },
  openGraph: {
    title: 'Lode — A Daily Word Game Where Rare Words Pay',
    description:
      'Seven letters, one core letter, four letters minimum. Common words are chip shots; the rare ones are worth three times as much. Strike the vein, then dig for the Mother Lode.',
    url: '/lode',
    type: 'website',
    siteName: 'Source of Truths',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lode — A Daily Word Game Where Rare Words Pay',
    description:
      'Seven letters, one core letter, and scoring that rewards the words nobody else finds.',
  },
};

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Game',
  name: 'Lode',
  alternateName: 'Lode — Daily Letter-Mining Word Game',
  url: 'https://sourceoftruths.com/lode',
  description:
    'A free daily word game: everyone gets the same seven letters and one core letter that every word must contain. Words are four letters or longer and letters may be reused. Points scale with how rare a word is rather than how long it is, a pangram uses every letter, and each day carries a vein to strike and a Mother Lode to chase.',
  genre: ['Word game', 'Puzzle'],
  gamePlatform: 'Web browser',
  isAccessibleForFree: true,
  inLanguage: 'en',
  numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 1 },
  image: 'https://sourceoftruths.com/quiz-heroes/lode.png',
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
    { '@type': 'ListItem', position: 3, name: 'Lode' },
  ],
};

export const dynamic = 'force-dynamic';

function etTodayServer() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

function ComingSoon({ first }) {
  // Rendered only if no board is live yet. Never crash the route on an empty
  // visible set — show a friendly placeholder instead.
  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', fontFamily: "'Manrope', system-ui, sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginBottom: 18 }}>
          {'LODE'.split('').map((ch, i) => (
            <div key={i} style={{ width: 44, height: 44, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 26, background: i === 0 ? '#a16207' : '#2b2f38', color: '#fff', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.6)' }}>{ch}</div>
          ))}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1c1e24', margin: '0 0 8px' }}>Lode launches {first ? first.dateLabel : 'soon'}.</h1>
        <p style={{ fontSize: 15, color: '#6b7280', fontWeight: 600, lineHeight: 1.5, margin: '0 0 18px' }}>
          The daily letter-mining word game &mdash; seven letters, one core, and points that pay for the rare finds. Come back when the first seam opens.
        </p>
        <a href="/daily" style={{ color: '#a16207', fontWeight: 800, textDecoration: 'underline' }}>See the other daily puzzles &rarr;</a>
      </div>
    </div>
  );
}

export default function LodePage({ searchParams }) {
  const today = etTodayServer();
  const visiblePuzzles = PUZZLES.filter((p) => p.live <= today);
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
        <LodeClient key={forceNum || 'today'} puzzles={visiblePuzzles} forceNum={forceNum} />
      </Suspense>
    </>
  );
}
