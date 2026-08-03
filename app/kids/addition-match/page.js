import AdditionMatchClient from './AdditionMatchClient';

export const metadata = {
  title: 'Addition Match | Kids Corner | Mind Loft',
  description: 'A free matching memory game for kids. Match each addition equation to its answer. 28 cards, 14 pairs. Up to four players.',
  alternates: { canonical: '/kids/addition-match' },
  openGraph: {
    title: 'Addition Match | Kids Corner',
    description: 'Match each addition to its answer. Find all fourteen pairs. Up to four players.',
    url: '/kids/addition-match',
    type: 'website',
    siteName: 'Mind Loft',
  },
};

export default function AdditionMatchPage() {
  return <AdditionMatchClient />;
}
