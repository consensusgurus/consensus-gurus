import DuelClient from './DuelClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Duel | Mind Loft', description: 'A head-to-head quiz duel. Same quiz, two players, winner takes the bragging rights.' };

export default function Page({ params }) {
  return <DuelClient token={params.token} />;
}
