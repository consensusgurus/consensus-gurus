import NumberMatchClient from './NumberMatchClient';

export const metadata = {
  title: 'Number Match | Kids Corner | Source of Truths',
  description: 'A free matching memory game for kids. Match each number to its spelling, 0 to 15. 32 cards, 16 pairs. Up to four players.',
  alternates: { canonical: '/kids/number-match' },
  openGraph: {
    title: 'Number Match | Kids Corner',
    description: 'Match each number to its spelling, 0 to 15. Up to four players.',
    url: '/kids/number-match',
    type: 'website',
    siteName: 'Source of Truths',
  },
};

export default function NumberMatchPage() {
  return <NumberMatchClient />;
}
