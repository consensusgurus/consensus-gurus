import PlayerStatsClient from './PlayerStatsClient';

export const dynamic = 'force-dynamic';

export function generateMetadata({ params }) {
  return { title: 'Player Stats | Source of Truths Quizzes' };
}

export default function Page({ params }) {
  const key = decodeURIComponent(params.key || '');
  return <PlayerStatsClient playerKey={key} />;
}
