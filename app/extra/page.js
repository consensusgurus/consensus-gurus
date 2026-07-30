import { Suspense } from 'react';
import ExtraClient from './ExtraClient';
import { PUZZLES } from './puzzles';

// Extra launched 2026-07-16 as the ninth daily: linked from the daily strip,
// the footer, the /daily archive, and the sitemap (/extra is the canonical,
// evergreen URL — the dated /quiz/extra-* stubs canonicalize here). One
// redacted historic front page a day; name the story before the censor
// strips run out. Sundays run a trickier story.

export const metadata = {
  title: 'Extra — Daily History Puzzle: Name the Redacted Headline | Source of Truths',
  description:
    "A free daily history puzzle — one historic front page with the giveaway words blacked out. Name the story; every wrong guess tears one more word free. Six tears, one hint, and a perfect score for naming it cold.",
  alternates: { canonical: '/extra' },
  manifest: '/extra.webmanifest',
  icons: {
    icon: [{ url: '/extra-icons/favicon-32.png', sizes: '32x32', type: 'image/png' }],
    apple: [{ url: '/extra-icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Extra' },
  openGraph: {
    title: 'Extra — The Daily Front Page',
    description:
      "One historic headline a day, with the giveaway words blacked out. Name the story before the censor strips run out. From Source of Truths.",
    url: '/extra',
    type: 'website',
    siteName: 'Source of Truths',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Extra — The Daily Front Page',
    description:
      'One historic headline a day, redacted. Name the story — every wrong guess tears a word free.',
  },
};

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Game',
  name: 'Extra',
  alternateName: 'Extra — Daily History Puzzle',
  url: 'https://sourceoftruths.com/extra',
  description:
    'A free daily history puzzle: a historic newspaper front page with the giveaway words blacked out. Name the story — a wrong guess or a tear reveals one more word, and naming it with zero tears is a perfect cold read.',
  genre: ['History puzzle', 'Trivia puzzle', 'Word puzzle', 'Puzzle'],
  gamePlatform: 'Web browser',
  isAccessibleForFree: true,
  inLanguage: 'en',
  numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 1 },
  image: 'https://sourceoftruths.com/quiz-heroes/extra.png',
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
    { '@type': 'ListItem', position: 3, name: 'Extra' },
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
          {'EXTRA'.split('').map((ch, i) => (
            <div key={i} style={{ width: 44, height: 44, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 26, background: i === 1 ? '#b91c1c' : '#1c1e24', color: '#fff', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
          ))}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1c1e24', margin: '0 0 8px' }}>Extra launches {first ? first.dateLabel : 'soon'}.</h1>
        <p style={{ fontSize: 15, color: '#262b35', fontWeight: 600, lineHeight: 1.5, margin: '0 0 18px' }}>
          The daily front page — a historic headline with the giveaway words blacked out. Come back when the first edition hits the stands.
        </p>
        <a href="/daily" style={{ color: '#b91c1c', fontWeight: 800, textDecoration: 'underline' }}>See the other daily puzzles &rarr;</a>
      </div>
    </div>
  );
}

export default function ExtraPage({ searchParams }) {
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
        <ExtraClient key={forceNum || 'today'} puzzles={visiblePuzzles} forceNum={forceNum} />
      </Suspense>
    </>
  );
}
