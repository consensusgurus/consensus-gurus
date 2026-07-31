import PlayerProfileClient from './PlayerProfileClient';

// Public player profile: /player/<display name>. Registered usernames only;
// guests stay reachable through the Stat Hub's in-place viewer.
export async function generateMetadata({ params }) {
  const name = decodeURIComponent(params.name || '');
  const title = `${name} · Player Profile | Source of Truths`;
  const description = `${name}'s Source of Truths player profile: trophy case, IQ Points, level and tier, category standings, streaks, and the full game history.`;
  const url = `/player/${encodeURIComponent(name)}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title: `${name} · Source of Truths Player Profile`, description, url, type: 'profile', siteName: 'Source of Truths' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default function PlayerProfilePage({ params }) {
  return <PlayerProfileClient name={decodeURIComponent(params.name || '')} />;
}
