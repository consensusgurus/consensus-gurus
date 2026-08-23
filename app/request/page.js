import RequestClient from './RequestClient';

export const metadata = {
  title: 'Request a List or Quiz | Mind Loft',
  description: 'Request a new top ten list or quiz, or submit your own, on Mind Loft.',
  alternates: { canonical: '/request' },
  openGraph: {
    title: 'Request a List or Quiz | Mind Loft',
    description: 'Request a new top ten list or quiz, or submit your own, on Mind Loft.',
    url: '/request',
    type: 'website',
    siteName: 'Mind Loft',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Request a List or Quiz | Mind Loft',
    description: 'Request a new top ten list or quiz, or submit your own, on Mind Loft.',
  },
};

export default function RequestPage() {
  return <RequestClient />;
}
