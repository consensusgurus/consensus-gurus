// app/layout.js - ROOT LAYOUT WITH UPDATED METADATA

import './globals.css';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  metadataBase: new URL('https://sourceoftruths.com'),
  title: 'Source of Truths | Producing Objectivity',
  description: 'Producing objectivity from subjective opinion. Curated top-ten lists ranked by expert consensus and reader votes, from dive bars and pizza to luxury resorts, films, books, and products.',
  openGraph: {
    title: 'Source of Truths | Producing Objectivity',
    description: 'Producing objectivity from subjective opinion. Curated top-ten lists ranked by expert consensus and reader votes, from dive bars and pizza to luxury resorts, films, books, and products.',
    url: 'https://sourceoftruths.com',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Source of Truths | Producing Objectivity',
    description: 'Many voices, one verified answer. Top-ten lists ranked by expert consensus and reader votes.',
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
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Source of Truths',
  alternateName: 'Source of Truths | Producing Objectivity',
  url: 'https://sourceoftruths.com',
  description: 'Ranked lists of the best restaurants, hotels, bars, products, films, books, and more, built from expert sources and reader votes using Borda consensus scoring.',
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Source of Truths',
  alternateName: 'Source of Truths | Producing Objectivity',
  url: 'https://sourceoftruths.com',
  logo: 'https://sourceoftruths.com/icon.png',
  description: 'Curated top-ten lists ranked by expert consensus and reader votes, built using Borda consensus scoring.',
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
