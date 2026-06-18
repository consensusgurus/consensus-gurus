// app/layout.js - ROOT LAYOUT WITH UPDATED METADATA

import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import { getAllSources } from '@/lib/sources';

const SOURCE_COUNT = getAllSources().length;

export const metadata = {
  metadataBase: new URL('https://sourceoftruths.com'),
  title: 'Source of Truths | Producing Objectivity',
  description: `Producing objectivity from ${SOURCE_COUNT} sources.`,
  openGraph: {
    title: 'Source of Truths | Producing Objectivity',
    description: `Producing objectivity from ${SOURCE_COUNT} sources.`,
    url: 'https://sourceoftruths.com',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Source of Truths | Producing Objectivity',
    description: `Producing objectivity from ${SOURCE_COUNT} sources.`,
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
  themeColor: '#f7f8fa',
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Source of Truths',
  alternateName: 'Source of Truths | Producing Objectivity',
  url: 'https://sourceoftruths.com',
  description: `Producing objectivity from ${SOURCE_COUNT} expert and reader sources using Borda consensus scoring.`,
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Source of Truths',
  alternateName: 'Source of Truths | Producing Objectivity',
  url: 'https://sourceoftruths.com',
  logo: 'https://sourceoftruths.com/icon.png',
  description: `Producing objectivity from ${SOURCE_COUNT} sources, scored by expert and reader consensus using Borda methodology.`,
};

const collectionJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Source of Truths',
  url: 'https://sourceoftruths.com',
  description: 'Curated ranked lists built from expert sources and reader consensus. Browse the best in dining, travel, entertainment, and products across categories including restaurants, bars, hotels, books, films, and curated products.',
  publisher: {
    '@type': 'Organization',
    name: 'Source of Truths',
    url: 'https://sourceoftruths.com',
    description: 'Ranked lists determined by expert consensus and reader votes using Borda scoring methodology.',
  },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
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
        <Analytics />
      </body>
    </html>
  );
}
