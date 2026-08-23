// app/duel/new/layout.js
//
// /duel/new is a 'use client' page, and a client component cannot export
// `metadata`, so the route was inheriting the ROOT layout's title, description
// and og:url wholesale: it announced itself to search and to every social card
// as the homepage. A layout is the only way to give a client page its own
// metadata, which is why this file exists and does nothing else.

export const metadata = {
  title: 'Challenge Someone to a Puzzle or Quiz | Mind Loft',
  description: 'Start a head to head duel on any Mind Loft puzzle or quiz. Pick a game, send the link, and both players race the same board.',
  alternates: { canonical: '/duel/new' },
  openGraph: {
    title: 'Challenge Someone to a Puzzle or Quiz | Mind Loft',
    description: 'Start a head to head duel on any Mind Loft puzzle or quiz. Pick a game, send the link, and both players race the same board.',
    url: '/duel/new',
    type: 'website',
    siteName: 'Mind Loft',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Challenge Someone to a Puzzle or Quiz | Mind Loft',
    description: 'Start a head to head duel on any Mind Loft puzzle or quiz. Pick a game, send the link, and both players race the same board.',
  },
};

export default function DuelNewLayout({ children }) {
  return children;
}
