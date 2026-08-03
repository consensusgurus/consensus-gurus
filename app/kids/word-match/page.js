import WordMatchClient from './WordMatchClient';

export const metadata = {
  title: 'Word Match | Kids Corner | Mind Loft',
  description: 'A free matching memory game for kids. Match each word to its picture (dog, house, school bus, and more). 24 cards, 12 pairs. Up to four players.',
  alternates: { canonical: '/kids/word-match' },
  openGraph: {
    title: 'Word Match | Kids Corner',
    description: 'Match each word to its picture. Find all twelve pairs. Up to four players.',
    url: '/kids/word-match',
    type: 'website',
    siteName: 'Mind Loft',
  },
};

export default function WordMatchPage() {
  return <WordMatchClient />;
}
