import MemoryMatchClient from './MemoryMatchClient';

export const metadata = {
  title: 'Memory Match | Kids Corner | Source of Truths',
  description: 'A free picture-matching memory game for kids. Flip 20 cards to find 10 pairs of snacks. One-player or two-player pass-and-play.',
  alternates: { canonical: '/kids/memory-match' },
  openGraph: {
    title: 'Memory Match | Kids Corner',
    description: 'Flip the cards and find all ten matching snacks. Play solo or two-player.',
    url: '/kids/memory-match',
    type: 'website',
    siteName: 'Source of Truths',
  },
};

export default function MemoryMatchPage() {
  return <MemoryMatchClient />;
}
