import ChallengeLeaderboardClient from './ChallengeLeaderboardClient';

export const metadata = {
  title: 'Challenge Leaderboard | Source of Truths',
  description: 'Live standings for the current Source of Truths quiz challenge: percent complete and total time across a themed set of quizzes.',
  alternates: { canonical: '/quizzes/leaderboard' },
  openGraph: {
    title: 'Source of Truths · Challenge Leaderboard',
    description: 'Live standings for the current Source of Truths quiz challenge.',
    url: '/quizzes/leaderboard',
    type: 'website',
    siteName: 'Source of Truths',
  },
};

export default function ChallengeLeaderboardPage() {
  return <ChallengeLeaderboardClient />;
}
