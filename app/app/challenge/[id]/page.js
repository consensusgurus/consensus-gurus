import ChallengeClient from './ChallengeClient';

export default function Page({ params }) {
  return <ChallengeClient id={params.id} />;
}
