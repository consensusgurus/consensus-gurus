import RequestClient from './RequestClient';

export const metadata = {
  title: 'Request a List | Consensus Gurus',
  description: 'Request a new top ten list, or submit your own, on Consensus Gurus.',
};

export default function RequestPage() {
  return <RequestClient />;
}
