import RequestClient from './RequestClient';

export const metadata = {
  title: 'Request a List | Source of Truths',
  description: 'Request a new top ten list, or submit your own, on Source of Truths.',
};

export default function RequestPage() {
  return <RequestClient />;
}
