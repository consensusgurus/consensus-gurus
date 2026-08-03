import CommunityLeaderboardClient from './CommunityLeaderboardClient';

export const metadata = {
  title: 'Community Leaderboard | Mind Loft',
  description: 'The players bringing the most new people to Mind Loft. Share a quiz or daily game with your link and anyone who plays it credits you.',
  alternates: { canonical: '/quizzes/community' },
  openGraph: {
    title: 'Mind Loft · Community Leaderboard',
    description: 'The players bringing the most new people to Mind Loft.',
    url: '/quizzes/community',
    type: 'website',
    siteName: 'Mind Loft',
  },
};

export default function CommunityLeaderboardPage() {
  return <CommunityLeaderboardClient />;
}
