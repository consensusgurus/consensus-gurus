import LeaderboardClient from './LeaderboardClient';

export const metadata = {
  title: 'Quiz Champions Leaderboard | Mind Loft',
  description: 'The Mind Loft quiz leaderboard: most quizzes completed and best first-attempt accuracy.',
  alternates: { canonical: '/leaderboard' },
  openGraph: {
    title: 'Quiz Champions Leaderboard | Mind Loft',
    description: 'The Mind Loft quiz leaderboard: most quizzes completed and best first-attempt accuracy.',
    url: '/leaderboard',
    type: 'website',
    siteName: 'Mind Loft',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quiz Champions Leaderboard | Mind Loft',
    description: 'The Mind Loft quiz leaderboard: most quizzes completed and best first-attempt accuracy.',
  },
};

export default function LeaderboardPage() {
  return <LeaderboardClient />;
}
