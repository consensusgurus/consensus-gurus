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

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Consensus Gurus',
  alternateName: 'Consensus Gurus | Where Experts Agree',
  url: 'https://consensusgurus.com',
  description: 'Curated top-ten lists ranked by expert consensus. From dive bars to luxury resorts, discover what the experts agree on.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* WebSite structured data — tells Google our site name for search result display */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }