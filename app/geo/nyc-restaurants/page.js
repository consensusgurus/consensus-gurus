import { redirect } from 'next/navigation';

export const metadata = {
  title: 'NYC Restaurant Geo Guesser | Mind Loft',
  alternates: { canonical: '/quiz/nyc-restaurant-geo-guesser' },
};

export default function GeoRestaurantsRedirect() {
  redirect('/quiz/nyc-restaurant-geo-guesser');
}
