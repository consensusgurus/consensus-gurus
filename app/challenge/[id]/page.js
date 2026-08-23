import ChallengeClient from './ChallengeClient';

// One person's run of one challenge. There is nothing here for an index: the
// content is a single player's result, the url is unguessable, and it duplicates
// the quiz page it points at. Follow, so the quiz link is still a crawl path.
export const metadata = {
  title: 'Challenge | Mind Loft',
  description: 'A head to head quiz challenge on Mind Loft.',
  robots: { index: false, follow: true },
};

export default function Page({ params }) {
  return <ChallengeClient id={params.id} />;
}
