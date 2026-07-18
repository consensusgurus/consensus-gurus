// app/layout.js - ROOT LAYOUT WITH UPDATED METADATA

import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import VisitorBeacon from './VisitorBeacon';
import { getAllSources } from '@/lib/sources';

const SOURCE_COUNT = getAllSources().length;

export const metadata = {
  metadataBase: new URL('https://sourceoftruths.com'),
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Source of Truths' },
  title: `Source of Truths | Daily Brain Exercises, Quizzes, and Top 10 Lists`,
  description: `New daily brain exercises every day: word, number, and logic games, plus 1,000+ timed quizzes across films, music, geography, sports, and brands. Then browse consensus Top 10 Lists where ${SOURCE_COUNT} experts and aggregators agree on the best restaurants, hotels, products, films, and books.`,
  openGraph: {
    title: `Source of Truths | Daily Brain Exercises, Quizzes, and Top 10 Lists`,
    description: `New daily brain exercises every day: word, number, and logic games, plus 1,000+ timed quizzes across films, music, geography, sports, and brands. Then browse consensus Top 10 Lists where ${SOURCE_COUNT} experts and aggregators agree on the best restaurants, hotels, products, films, and books.`,
    url: 'https://sourceoftruths.com',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Source of Truths | Daily Brain Exercises, Quizzes, and Top 10 Lists`,
    description: `New daily brain exercises every day: word, number, and logic games, plus 1,000+ timed quizzes across films, music, geography, sports, and brands. Then browse consensus Top 10 Lists where ${SOURCE_COUNT} experts and aggregators agree on the best restaurants, hotels, products, films, and books.`,
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
  viewportFit: 'cover', themeColor: '#0e1d40',
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Source of Truths',
  alternateName: 'SoT',
  url: 'https://sourceoftruths.com',
  description: `Where ${SOURCE_COUNT} experts and aggregators agree, built from expert and reader sources using Borda consensus scoring.`,
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Source of Truths',
  alternateName: 'SoT',
  url: 'https://sourceoftruths.com',
  logo: 'https://sourceoftruths.com/icon.png',
  sameAs: [
    'https://x.com/sourceoftruths',
    'https://www.instagram.com/source_of_truths/',
  ],
  description: `Where ${SOURCE_COUNT} experts and aggregators agree, scored by expert and reader consensus using Borda methodology.`,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
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
        <Analytics />
      </body>
    </html>
  );
}
