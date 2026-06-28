import DogMatchClient from './DogMatchClient';

export const metadata = {
  title: 'Dog Match | Kids Corner | Source of Truths',
  description: 'A free picture-matching memory game for kids. Flip 28 cards to find 14 pairs of dog breeds. One-player or two-player pass-and-play.',
  alternates: { canonical: '/kids/dog-match' },
  openGraph: {
    title: 'Dog Match | Kids Corner',
    description: 'Flip the cards and find all fourteen matching dog breeds. Play solo or two-player.',
    url: '/kids/dog-match',
    type: 'website',
    siteName: 'Source of Truths',
  },
};

export default function DogMatchPage() {
  return <DogMatchClient />;
}
