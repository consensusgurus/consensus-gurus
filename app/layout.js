// app/layout.js - ROOT LAYOUT WITH UPDATED METADATA

import './globals.css';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  metadataBase: new URL('https://sourceoftruths.com'),
  title: 'Source of Truths | For All of the Important Aspects of Life',
  description: 'Curated top-ten lists ranked by expert consensus and reader votes. From dive bars to luxury resorts, discover what we all agree on.',
  openGraph: {
    title: 'Source of Truths | For All of the Important Aspects of Life',
    description: 'Curated top-ten lists ranked by expert consensus and reader votes. From dive bars to luxury resorts, discover what we all agree on.',
    url: 'https://sourceoftruths.com',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Source of Truths | For All of the Important Aspects of Life',
    description: 'Curated top-ten lists ranked by expert consensus and reader votes.',
  },
  appleWebApp: {
    capable: false,
    statusBarStyle: 'black-translucent',
    startupImage: {
      url: 'https://sourceoftruths.com/apple-startup.png',
      media: '(device-width: 375px) and (device-height: 812px)',
    },
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
  alternateName: 'Source of Truths | For All of the Important Aspects of Life',
  url: 'https://sourceoftruths.com',
  description: 'Curated top-ten lists ranked by expert consensus and reader votes. From dive bars to luxury resorts, discover what we all agree on.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
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
