import StatHubClient from './StatHubClient';

export const metadata = {
  title: 'Stat Hub | Source of Truths Quizzes',
  description: 'Your XP, level, and tier, category breakdown, challenge standings, and the full player ranking.',
  alternates: { canonical: '/quizzes/hub' },
  openGraph: {
    title: 'Source of Truths · Stat Hub',
    description: 'Your XP, level, and tier, category breakdown, challenge standings, and the full player ranking.',
    url: '/quizzes/hub',
    type: 'website',
    siteName: 'Source of Truths',
  },
};

export default function StatHubPage() {
  return <StatHubClient />;
}
