// app/list/[id]/layout.js - LIST DETAIL LAYOUT WITH UPDATED PREVIEW

import { LISTS } from '@/lib/data';

export async function generateMetadata({ params }) {
  const list = LISTS.find((l) => l.id === params.id);

  if (!list) {
    return {
      title: 'List Not Found | Consensus Gurus',
      description: 'This list could not be found.',
    };
  }

  // Get first 6-10 items from consensus (not fan vote)
  const consensusItems = list.sources?.consensus?.items || list.sources?.ai?.items || [];
  const previewItems = consensusItems.slice(0, 6).join(', ');
  const itemCount = consensusItems.length;

  return {
    title: `${list.title} | Consensus Gurus`,
    description: `${list.blurb} Ranked by expert consensus: ${previewItems}${itemCount > 6 ? '...' : ''}`,
    openGraph: {
      title: `${list.title} | Consensus Gurus`,
      description: `6-10 of Consensus: ${previewItems}${itemCount > 6 ? '...' : ''}`,
      url: `https://consensusgurus.com/list/${list.id}`,
      type: 'website',
      images: [
        {
          url: `https://consensusgurus.com/og-list-${list.id}.jpg`,
          width: 1200,
          height: 630,
          alt: `${list.title} - Consensus Gurus`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${list.title} | Consensus Gurus`,
      description: `6-10 of Consensus: ${previewItems}`,
      images: [`https://consensusgurus.com/og-list-${list.id}.jpg`],
    },
  };
}

export default function ListLayout({ children }) {
  return children;
}
