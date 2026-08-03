import ColorMatchClient from './ColorMatchClient';

export const metadata = {
  title: 'Color Match | Kids Corner | Mind Loft',
  description: 'A free matching memory game for kids. Match each color word to its color. 20 cards, 10 pairs. Up to four players.',
  alternates: { canonical: '/kids/color-match' },
  openGraph: {
    title: 'Color Match | Kids Corner',
    description: 'Match each color word to its color. Find all ten pairs. Up to four players.',
    url: '/kids/color-match',
    type: 'website',
    siteName: 'Mind Loft',
  },
};

export default function ColorMatchPage() {
  return <ColorMatchClient />;
}
