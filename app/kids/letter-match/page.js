import LetterMatchClient from './LetterMatchClient';

export const metadata = {
  title: 'Letter Match | Kids Corner | Source of Truths',
  description: 'A free matching memory game for kids. Match each capital letter to its lowercase letter. 52 cards, 26 pairs. Up to four players.',
  alternates: { canonical: '/kids/letter-match' },
  openGraph: {
    title: 'Letter Match | Kids Corner',
    description: 'Match each capital letter to its lowercase letter. Find all twenty-six pairs. Up to four players.',
    url: '/kids/letter-match',
    type: 'website',
    siteName: 'Source of Truths',
  },
};

export default function LetterMatchPage() {
  return <LetterMatchClient />;
}
