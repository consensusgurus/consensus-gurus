import GarbleClient from './GarbleClient';

// Garble is fully launched: linked from the hub (dated catalog entries), the
// footer, and the sitemap (/garble is the canonical, evergreen URL — the dated
// /quiz/garble-* stubs canonicalize here).

export const metadata = {
  title: 'Garble — Free Daily Word Scramble Game | Source of Truths',
  description:
    'A free daily word scramble game — untangle five garbled words, feed their gold letters into a clued finale, and finish in the fewest misses. New puzzle every day.',
  alternates: { canonical: '/garble' },
  manifest: '/garble.webmanifest',
  icons: {
    icon: [{ url: '/garble-icons/favicon-32.png', sizes: '32x32', type: 'image/png' }],
    apple: [{ url: '/garble-icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Garble' },
  openGraph: {
    title: 'Garble — A Daily Word Scramble',
    description:
      'Five garbled words, one clued finale. Untangle it in the fewest misses. A new word game from Source of Truths.',
    url: '/garble',
    type: 'website',
    siteName: 'Source of Truths',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Garble — A Daily Word Scramble',
    description: 'Five garbled words, one clued finale. Untangle it in the fewest misses.',
  },
};

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Game',
  name: 'Garble',
  alternateName: 'Garble — Daily Word Scramble',
  url: 'https://sourceoftruths.com/garble',
  description:
    'A free daily word scramble game: untangle five garbled words using exactly the letters shown. Each solution donates its gold letters to a clued finale — solve the finale any time to end the game. Fewest misses wins the tiebreak.',
  genre: ['Word game', 'Puzzle'],
  gamePlatform: 'Web browser',
  isAccessibleForFree: true,
  inLanguage: 'en',
  numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 1 },
  image: 'https://sourceoftruths.com/quiz-heroes/garble.png',
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
    { '@type': 'ListItem', position: 3, name: 'Garble' },
  ],
};

export default function GarblePage({ searchParams }) {
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
      <GarbleClient key={forceNum || 'today'} forceNum={forceNum} />
    </>
  );
}
