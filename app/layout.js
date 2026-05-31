// app/layout.js - ROOT LAYOUT WITH UPDATED METADATA

import './globals.css';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  metadataBase: new URL('https://consensusgurus.com'),
  title: 'Consensus Gurus | Where Experts Agree',
  description: 'Curated top-ten lists ranked by expert consensus. From dive bars to luxury resorts, discover what the experts agree on.',
  openGraph: {
    title: 'Consensus Gurus | Where Experts Agree',
    description: 'Curated top-ten lists ranked by expert consensus. From dive bars to luxury resorts, discover what the experts agree on.',
    url: 'https://consensusgurus.com',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Consensus Gurus | Where Experts Agree',
    description: 'Curated top-ten lists ranked by expert consensus.',
  },
  // iOS home screen / web app settings
  appleWebApp: {
    capable: false, // CHANGED: Set to false to enable browser mode instead of standalone app
    statusBarStyle: 'black-translucent',
    startupImage: {
      url: 'https://consensusgurus.com/apple-startup.png',
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
  userScalable: true, // CHANGED: Enabled user scaling for better browser experience
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Fraunces serif font for "Consensus Gurus" branding */}
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,700;0,900;1,400;1,700&display=swap"
          rel="stylesheet"
        />
        {/* DM Sans and DM Mono for body and UI */}
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@400;500;700&display=swap"
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
