import LeaderboardClient from './LeaderboardClient';

export const metadata = {
  title: 'Quiz Champions Leaderboard · Source of Truths',
  description: 'The Source of Truths quiz leaderboard: most quizzes completed and best first-attempt accuracy.',
};

export default function LeaderboardPage() {
  return <LeaderboardClient />;
}
