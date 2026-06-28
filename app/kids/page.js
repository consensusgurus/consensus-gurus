import KidsHubClient from './KidsHubClient';

export const metadata = {
  title: 'Kids Corner | Source of Truths',
  description: 'Free games and learning activities for kids. Tap and play, no sign-up. Start with Memory Match, a picture-matching game.',
  alternates: { canonical: '/kids' },
  openGraph: {
    title: 'Kids Corner | Source of Truths',
    description: 'Free games and learning activities for kids. Start with Memory Match.',
    url: '/kids',
    type: 'website',
    siteName: 'Source of Truths',
  },
};

export default function KidsPage() {
  return <KidsHubClient />;
}
