// app/layout.js - ROOT LAYOUT WITH UPDATED METADATA

import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import VisitorBeacon from './VisitorBeacon';
import ResultQueue from './ResultQueue';
import DailyStartPing from './DailyStartPing';
import ShareCreditPop from './ShareCreditPop';
import ContestPop from './ContestPop';
import QrPosterPop from './QrPosterPop';
import TrophyPop from './TrophyPop';
import { getAllSources } from '@/lib/sources';
import { T } from '@/lib/theme';
import { SITE_URL } from '@/lib/site';

const SOURCE_COUNT = getAllSources().length;

export const metadata = {
  metadataBase: new URL(SITE_URL),
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Mind Loft' },
  title: `Mind Loft | Elevate Your Thinking`,
  description: `Daily puzzles and quizzes to sharpen your brain. Word, number and logic puzzles, plus 1,000+ timed quizzes across films, music, geography, sports, and brands. Then browse consensus Top 10 Lists where ${SOURCE_COUNT} experts and aggregators agree on the best restaurants, hotels, products, films, and books.`,
  openGraph: {
    title: `Mind Loft | Elevate Your Thinking`,
    description: `Daily puzzles and quizzes to sharpen your brain. Word, number and logic puzzles, plus 1,000+ timed quizzes across films, music, geography, sports, and brands. Then browse consensus Top 10 Lists where ${SOURCE_COUNT} experts and aggregators agree on the best restaurants, hotels, products, films, and books.`,
    url: `${SITE_URL}`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Mind Loft | Elevate Your Thinking`,
    description: `Daily puzzles and quizzes to sharpen your brain. Word, number and logic puzzles, plus 1,000+ timed quizzes across films, music, geography, sports, and brands. Then browse consensus Top 10 Lists where ${SOURCE_COUNT} experts and aggregators agree on the best restaurants, hotels, products, films, and books.`,
  },
formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover', themeColor: T.accent,
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Mind Loft',
  alternateName: 'Mind Loft Daily',
  url: `${SITE_URL}`,
  description: `Daily word, number and logic puzzles plus 1,000+ timed quizzes, and consensus Top 10 Lists drawn from ${SOURCE_COUNT} experts and aggregators.`,
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Mind Loft',
  alternateName: 'Mind Loft Daily',
  url: `${SITE_URL}`,
  logo: `${SITE_URL}/icon.png`,
  sameAs: [
    'https://x.com/mindloftdaily',
    'https://www.instagram.com/mindloftdaily/',
  ],
  description: `Daily puzzles and quizzes, plus consensus Top 10 Lists scored from ${SOURCE_COUNT} expert and reader sources using Borda methodology.`,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Card attribution. Deliberately NOT in the metadata export: a route that defines
            its own `twitter` block replaces the parent's entirely, and 52 routes do, so
            these would disappear nearly everywhere. */}
        <meta name="twitter:site" content="@mindloftdaily" />
        <meta name="twitter:creator" content="@mindloftdaily" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6094189268309966"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,700;0,900;1,400;1,700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <VisitorBeacon />
        <ResultQueue />
        <DailyStartPing />
        <ShareCreditPop />
        {/* Mounted AFTER ShareCreditPop: its CTA dispatches the share-credit
            event, and the listener must already exist. Renders null on every
            page except a live contest on a promo path with an undismissed
            browser, so the cost elsewhere is one localStorage read. */}
        <ContestPop />
        <QrPosterPop />
        <TrophyPop />
        <Analytics />
      </body>
    </html>
  );
}
