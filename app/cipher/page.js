import { Suspense } from 'react';
import CipherClient from './CipherClient';
import { PUZZLES } from './puzzles';

// Cipher launched 2026-07-18 as one of the daily puzzles: linked from the daily
// strip, the footer, the /daily archive, and the sitemap (/cipher is the
// canonical, evergreen URL — the dated /quiz/cipher-* stubs canonicalize
// here). One cryptarithm a day, machine-verified to a unique solution.

export const metadata = {
  title: 'Cipher — Daily Cryptarithm: Crack the Letter Math | Source of Truths',
  description:
    'A free daily cryptarithm — one WORD + WORD = WORD equation where every letter hides a different digit. Exactly one solution, no guessing required. Crack it clean for a perfect 10, and take on three addends in the Sunday Edition.',
  alternates: { canonical: '/cipher' },
  manifest: '/cipher.webmanifest',
  icons: {
    icon: [{ url: '/cipher-icons/favicon-32.png', sizes: '32x32', type: 'image/png' }],
    apple: [{ url: '/cipher-icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Cipher' },
  openGraph: {
    title: 'Cipher — The Daily Cryptarithm',
    description:
      'One letter-arithmetic equation a day: every letter is a different digit, and there is exactly one solution. From Source of Truths.',
    url: '/cipher',
    type: 'website',
    siteName: 'Source of Truths',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cipher — The Daily Cryptarithm',
    description:
      'Every letter hides a digit. One equation a day, exactly one solution — crack it clean for a perfect 10.',
  },
};

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Game',
  name: 'Cipher',
  alternateName: 'Cipher — Daily Cryptarithm Game',
  url: 'https://sourceoftruths.com/cipher',
  description:
    'A free daily cryptarithm (alphametic) game: one WORD + WORD = WORD equation where every letter stands for a different digit. Each puzzle is machine-verified to have exactly one solution, so pure column logic cracks it — no guessing.',
  genre: ['Number game', 'Logic game', 'Math puzzle', 'Puzzle'],
  gamePlatform: 'Web browser',
  isAccessibleForFree: true,
  inLanguage: 'en',
  numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 1 },
  image: 'https://sourceoftruths.com/quiz-heroes/cipher.png',
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
    { '@type': 'ListItem', position: 3, name: 'Cipher' },
  ],
};

export const dynamic = 'force-dynamic';

function etTodayServer() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

function ComingSoon({ first }) {
  // Rendered only if no puzzle is live yet (before the first drop). Never crash
  // the route on an empty visible set — show a friendly placeholder instead.
  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', fontFamily: "'Manrope', system-ui, sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginBottom: 18 }}>
          {'CIPHER'.split('').map((ch, i) => (
            <div key={i} style={{ width: 40, height: 40, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 23, background: i === 0 ? '#0f766e' : '#1c1e24', color: '#fff', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
          ))}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1c1e24', margin: '0 0 8px' }}>Cipher launches {first ? first.dateLabel : 'soon'}.</h1>
        <p style={{ fontSize: 15, color: '#6b7280', fontWeight: 600, lineHeight: 1.5, margin: '0 0 18px' }}>
          The daily cryptarithm — every letter hides a digit, and there is exactly one solution. Come back when the first equation drops.
        </p>
        <a href="/daily" style={{ color: '#0f766e', fontWeight: 800, textDecoration: 'underline' }}>See the other daily puzzles &rarr;</a>
      </div>
    </div>
  );
}

export default function CipherPage({ searchParams }) {
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
        <CipherClient key={forceNum || 'today'} puzzles={visiblePuzzles} forceNum={forceNum} />
      </Suspense>
    </>
  );
}
