import MemoryMatchClient from './MemoryMatchClient';

export const metadata = {
  title: 'Treats Match | Kids Corner | Source of Truths',
  description: 'A free picture-matching memory game for kids. Flip 20 cards to find 10 pairs of treats. One-player or two-player pass-and-play.',
  alternates: { canonical: '/kids/memory-match' },
  openGraph: {
    title: 'Treats Match | Kids Corner',
    description: 'Flip the cards and find all ten matching treats. Play solo or two-player.',
    url: '/kids/memory-match',
    type: 'website',
    siteName: 'Source of Truths',
  },
};

export default function MemoryMatchPage() {
  return <MemoryMatchClient />;
}
