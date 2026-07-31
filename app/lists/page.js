import HomeClient from '../HomeClient';
import { getAllSources } from '@/lib/sources';

const SOURCE_COUNT = getAllSources().length;

export function generateMetadata() {
  const title = `Top 10 Lists | Where ${SOURCE_COUNT} Experts and Aggregators Agree`;
  const description = `Where ${SOURCE_COUNT} experts and aggregators agree. Consensus best-of lists for restaurants, hotels, products, films, and books, built with Borda consensus scoring.`;

  return {
    title,
    description,
    alternates: { canonical: '/lists' },
    openGraph: {
      title,
      description,
      url: '/lists',
      type: 'website',
      siteName: 'Source of Truths',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

const collectionJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Source of Truths — Top 10 Lists',
  url: 'https://sourceoftruths.com/lists',
  description:
    'Curated ranked lists built from expert sources and reader consensus. Browse the best in dining, travel, entertainment, and products across categories including restaurants, bars, hotels, books, films, and curated products.',
  publisher: {
    '@type': 'Organization',
    name: 'Source of Truths',
    url: 'https://sourceoftruths.com',
    description:
      'Ranked lists determined by expert consensus and reader votes using Borda scoring methodology.',
  },
};

export default function ListsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <HomeClient />
    </>
  );
}
