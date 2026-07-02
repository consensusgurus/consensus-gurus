import StatHubClient from './StatHubClient';

export const metadata = {
  title: 'Stat Hub | Source of Truths Quizzes',
  description: 'Your quiz skill rating, category breakdown, challenge standings, and how the Elo rating is calculated.',
  alternates: { canonical: '/quizzes/hub' },
  openGraph: {
    title: 'Source of Truths · Stat Hub',
    description: 'Your quiz skill rating, category breakdown, challenge standings, and how the Elo rating is calculated.',
    url: '/quizzes/hub',
    type: 'website',
    siteName: 'Source of Truths',
  },
};

export default function StatHubPage() {
  return <StatHubClient />;
}
