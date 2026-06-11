import RequestClient from './RequestClient';

export const metadata = {
  title: 'Request a List or Quiz | Source of Truths',
  description: 'Request a new top ten list or quiz, or submit your own, on Source of Truths.',
};

export default function RequestPage() {
  return <RequestClient />;
}
