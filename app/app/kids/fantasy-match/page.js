import FantasyMatchClient from './FantasyMatchClient';

export const metadata = {
  title: 'Fantasy Match | Kids Corner | Source of Truths',
  description: 'A free matching memory game for kids. Match unicorns, princesses, princes, castles, and dragons. 30 cards, 15 pairs. Up to four players.',
  alternates: { canonical: '/kids/fantasy-match' },
  openGraph: {
    title: 'Fantasy Match | Kids Corner',
    description: 'Match unicorns, princesses, princes, castles, and dragons. Find all fifteen pairs. Up to four players.',
    url: '/kids/fantasy-match',
    type: 'website',
    siteName: 'Source of Truths',
  },
};

export default function FantasyMatchPage() {
  return <FantasyMatchClient />;
}
