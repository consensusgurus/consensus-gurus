import './globals.css';
import { Analytics } from '@vercel/analytics/next';

const RAW_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://consensus-gurus.vercel.app';

// Strip trailing slash and force https
const SITE_URL = RAW_SITE_URL.replace(/\/+$/, '').replace(/^http:/, 'https:');

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Consensus Gurus | Top Ten Lists from Every Angle',
    template: '%s | Consensus Gurus',
  },
  description:
    'Top ten lists scored by AI, by consensus across publications, and by reader vote. Movies, food, travel, products, and more.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Consensus Gurus',
    description:
      'Top ten lists from every angle. AI, consensus, publications, and reader votes.',
    url: '/',
    type: 'website',
    siteName: 'Consensus Gurus',
    locale: 'en_US',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Consensus Gurus',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Consensus Gurus',
    description: 'Top ten lists from every angle.',
    images: ['/twitter-image'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}