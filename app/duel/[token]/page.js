import DuelClient from './DuelClient';

export const dynamic = 'force-dynamic';
// A duel link is private and single use: noindex, but follow so the quiz it
// points at is still reachable.
export const metadata = {
  title: 'Duel | Mind Loft',
  description: 'A head-to-head quiz duel. Same quiz, two players, winner takes the bragging rights.',
  robots: { index: false, follow: true },
};

export default function Page({ params }) {
  return <DuelClient token={params.token} />;
}
