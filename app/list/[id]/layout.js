// app/list/[id]/layout.js - LIST DETAIL LAYOUT WITH UPDATED PREVIEW

import { LISTS } from '@/lib/data';
import { SITE_URL } from '@/lib/site';

export async function generateMetadata({ params }) {
  const list = LISTS.find((l) => l.id === params.id);

  if (!list) {
    return {
      title: 'List Not Found | Source of Truths',
      description: 'This list could not be found.',
    };
  }

  // Get items 6-10 from consensus (not fan vote)
  const consensusItems = list.sources?.consensus?.items || list.sources?.ai?.items || [];
  const previewItems = consensusItems.slice(5, 10).join(', ');

  return {
    title: `${list.title} | Source of Truths`,
    description: `${list.blurb} Ranked by expert consensus.`,
    openGraph: {
      title: `${list.title} | Source of Truths`,
      description: `6-10 of Consensus: ${previewItems}`,
      url: `${SITE_URL}/list/${list.id}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${list.title} | Source of Truths`,
      description: `6-10 of Consensus: ${previewItems}`,
    },
  };
}

export default function ListLayout({ children }) {
  return children;
}
