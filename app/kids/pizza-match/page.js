import PizzaMatchClient from './PizzaMatchClient';

export const metadata = {
  title: 'Pizza Match | Kids Corner | Mind Loft',
  description: 'A free picture-matching memory game for kids. Flip 28 cards to find 14 pairs of pizzas. One-player or two-player pass-and-play.',
  alternates: { canonical: '/kids/pizza-match' },
  openGraph: {
    title: 'Pizza Match | Kids Corner',
    description: 'Flip the cards and find all fourteen matching pizzas. Play solo or two-player.',
    url: '/kids/pizza-match',
    type: 'website',
    siteName: 'Mind Loft',
  },
};

export default function PizzaMatchPage() {
  return <PizzaMatchClient />;
}
