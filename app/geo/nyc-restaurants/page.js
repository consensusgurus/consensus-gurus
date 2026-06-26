import GeoClient from './GeoClient';

const TITLE = 'Locate the Restaurant: NYC Aerial Geo Game';
const DESC = 'Ten iconic New York restaurants, one straight-down aerial map. Read the name, drop a pin, beat the 45-second clock.';

export const metadata = {
  title: `${TITLE} | Source of Truths`,
  description: DESC,
  alternates: { canonical: '/geo/nyc-restaurants' },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: '/geo/nyc-restaurants',
    type: 'website',
    siteName: 'Source of Truths',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESC,
  },
};

export default function GeoRestaurantsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Game',
    name: TITLE,
    about: DESC,
    url: 'https://sourceoftruths.com/geo/nyc-restaurants',
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GeoClient />
    </>
  );
}
