import BusinessNewsClient from './BusinessNewsClient';

export const metadata = {
  title: 'Business News Quizzes | Source of Truths',
  description: 'The Business News quiz hub: daily market-moving news recaps and company earnings prep quizzes for the firms reporting this week.',
  alternates: { canonical: '/quizzes/business-news' },
  openGraph: {
    title: 'Source of Truths · Business News Quiz Hub',
    description: 'Daily market-moving news recaps and company earnings prep quizzes for the firms reporting this week.',
    url: '/quizzes/business-news',
    type: 'website',
    siteName: 'Source of Truths',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Source of Truths · Business News Quiz Hub',
    description: 'Daily market-moving news recaps and company earnings prep quizzes.',
  },
};

export default function BusinessNewsPage() {
  return <BusinessNewsClient />;
}
