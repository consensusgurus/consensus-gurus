import BusinessNewsClient from './BusinessNewsClient';

export const metadata = {
  title: 'Business News Quizzes: Earnings & Market Recaps | Source of Truths',
  description: 'The Business News quiz hub. Daily market-moving news recaps, company earnings prep quizzes for the firms reporting this week, and thematic sector updates. Test your knowledge against the clock.',
  alternates: { canonical: '/quizzes/business-news' },
  openGraph: {
    title: 'Source of Truths · Business News Quiz Hub',
    description: 'Daily market news recap quizzes plus company earnings prep quizzes (Micron, FedEx, Darden and more) and thematic sector updates. Beat your best score.',
    url: '/quizzes/business-news',
    type: 'website',
    siteName: 'Source of Truths',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Business News Quizzes · Source of Truths',
    description: 'Market news recaps and company earnings quizzes for the firms reporting this week, plus thematic sector updates.',
  },
};

export default function BusinessNewsPage() {
  return <BusinessNewsClient />;
}
