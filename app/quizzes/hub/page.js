import StatHubClient from './StatHubClient';

export const metadata = {
  title: 'Stat Hub | Mind Loft Quizzes',
  description: 'Your IQ Points, level, and tier, category breakdown, challenge standings, and the full player ranking.',
  alternates: { canonical: '/quizzes/hub' },
  openGraph: {
    title: 'Mind Loft · Stat Hub',
    description: 'Your IQ Points, level, and tier, category breakdown, challenge standings, and the full player ranking.',
    url: '/quizzes/hub',
    type: 'website',
    siteName: 'Mind Loft',
  },
};

export default function StatHubPage() {
  return <StatHubClient />;
}
