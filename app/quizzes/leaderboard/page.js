import ChallengeLeaderboardClient from './ChallengeLeaderboardClient';

export const metadata = {
  title: 'Challenge Leaderboard | Source of Truths',
  description: 'Live standings for the Source of Truths Continents Challenge. A prize is on the line for the player who tops the leaderboard. Ranked by percent complete and total time across twelve geography quizzes.',
  alternates: { canonical: '/quizzes/leaderboard' },
  openGraph: {
    title: 'Source of Truths · Challenge Leaderboard',
    description: 'Live standings for the Source of Truths Continents Challenge. A prize is on the line for the player who tops the leaderboard.',
    url: '/quizzes/leaderboard',
    type: 'website',
    siteName: 'Source of Truths',
  },
};

export default function ChallengeLeaderboardPage() {
  return <ChallengeLeaderboardClient />;
}
