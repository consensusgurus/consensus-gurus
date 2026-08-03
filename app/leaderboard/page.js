import LeaderboardClient from './LeaderboardClient';

export const metadata = {
  title: 'Quiz Champions Leaderboard · Mind Loft',
  description: 'The Mind Loft quiz leaderboard: most quizzes completed and best first-attempt accuracy.',
};

export default function LeaderboardPage() {
  return <LeaderboardClient />;
}
