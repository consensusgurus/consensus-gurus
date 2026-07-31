import CommunityLeaderboardClient from './CommunityLeaderboardClient';

export const metadata = {
  title: 'Community Leaderboard | Source of Truths',
  description: 'The players bringing the most new people to Source of Truths. Share a quiz or daily game with your link and anyone who plays it credits you.',
  alternates: { canonical: '/quizzes/community' },
  openGraph: {
    title: 'Source of Truths · Community Leaderboard',
    description: 'The players bringing the most new people to Source of Truths.',
    url: '/quizzes/community',
    type: 'website',
    siteName: 'Source of Truths',
  },
};

export default function CommunityLeaderboardPage() {
  return <CommunityLeaderboardClient />;
}
