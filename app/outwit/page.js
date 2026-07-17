import { Suspense } from 'react';
import OutwitClient from './OutwitClient';
import { PUZZLES } from './puzzles';

// Outwit launched 2026-07-17 as the thirteenth daily: linked from the daily
// strip, the footer, the /daily archive, and the sitemap (/outwit is the
// canonical, evergreen URL — the dated /quiz/outwit-* stubs canonicalize
// here). Five game-theory duels a day against the whole player field; scoring
// happens server-side in /api/outwit against the house crowd + real picks.
//
// IMPORTANT: the client gets a STRIPPED view of each puzzle — the `house`
// arrays (and the herd question's truth) never ship to the browser, or the
// crowd could be reverse-engineered before playing.

export const metadata = {
  title: 'Outwit — Daily Crowd Game: Beat Everyone Playing Today | Source of Truths',
  description:
    'A free daily game where the puzzle is other people. Five game-theory duels against the whole field: undercut the average, dodge the popular pick, read the herd, meet the crowd, be the rare bird. Then see where everyone actually went.',
  alternates: { canonical: '/outwit' },
  manifest: '/outwit.webmanifest',
  icons: {
    icon: [{ url: '/outwit-icons/favicon-32.png', sizes: '32x32', type: 'image/png' }],
    apple: [{ url: '/outwit-icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Outwit' },
  openGraph: {
    title: 'Outwit — The Daily Crowd Game',
    description:
      'Your opponent is everyone playing today. Five quick duels, no right answers — only what the crowd does. From Source of Truths.',
    url: '/outwit',
    type: 'website',
    siteName: 'Source of Truths',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Outwit — The Daily Crowd Game',
    description:
      'Five duels against everyone playing today. Predict the crowd, then watch the real numbers roll in.',
  },
};

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Game',
  name: 'Outwit',
  alternateName: 'Outwit — Daily Crowd Game',
  url: 'https://sourceoftruths.com/outwit',
  description:
    'A free daily game-theory game: five duels against every other player. Undercut two-thirds of the average, pick what the fewest pick, guess the crowd median, match the crowd favorite, and find the rarest number. Scored against the real player pool.',
  genre: ['Game theory', 'Trivia game', 'Party game', 'Puzzle'],
  gamePlatform: 'Web browser',
  isAccessibleForFree: true,
  inLanguage: 'en',
  numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 1 },
  image: 'https://sourceoftruths.com/quiz-heroes/outwit.png',
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
    { '@type': 'ListItem', position: 3, name: 'Outwit' },
  ],
};

export const dynamic = 'force-dynamic';

function etTodayServer() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

// Strip everything the browser must not see: house crowds and herd truths.
function clientSafe(p) {
  return {
    num: p.num,
    quizId: p.quizId,
    live: p.live,
    dateLabel: p.dateLabel,
    prompts: p.prompts.map((pr) => ({
      type: pr.type,
      tag: pr.tag,
      q: pr.q,
      ...(pr.options ? { options: pr.options } : {}),
      ...(pr.min != null ? { min: pr.min, max: pr.max } : {}),
    })),
  };
}

function ComingSoon({ first }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', fontFamily: "'Manrope', system-ui, sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 18 }}>
          {'OUTWIT'.split('').map((ch, i) => (
            <div key={i} style={{ width: 38, height: 38, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 22, background: i >= 3 ? '#1f2937' : '#1c1e24', color: i >= 3 ? '#e8b43a' : '#fff', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
          ))}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1c1e24', margin: '0 0 8px' }}>Outwit launches {first ? first.dateLabel : 'soon'}.</h1>
        <p style={{ fontSize: 15, color: '#6b7280', fontWeight: 600, lineHeight: 1.5, margin: '0 0 18px' }}>
          The daily crowd game — five duels against everyone playing. Come back when the first crowd forms.
        </p>
        <a href="/daily" style={{ color: '#1f2937', fontWeight: 800, textDecoration: 'underline' }}>See the other daily games &rarr;</a>
      </div>
    </div>
  );
}

export default function OutwitPage({ searchParams }) {
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
        <OutwitClient key={forceNum || 'today'} puzzles={visiblePuzzles} forceNum={forceNum} />
      </Suspense>
    </>
  );
}
