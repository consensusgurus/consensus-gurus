import DetailClient from './DetailClient';
import { LISTS } from '@/lib/data';

export async function generateMetadata({ params }) {
  const id = decodeURIComponent(params.id);
  const list = LISTS.find((l) => l.id === id);
  if (!list) {
    return {
      title: 'List not found',
    };
  }

  const url = `/list/${encodeURIComponent(id)}`;
  // Build a concise description that includes the top 3 items for scrapers
  // that show description text alongside the preview image.
  const topItems = (list.sources?.ai?.items || list.vote?.items || []).slice(0, 3);
  const description =
    topItems.length > 0
      ? `${list.blurb} Top picks: ${topItems.join(', ')}.`
      : list.blurb;

  return {
    title: list.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${list.title} | Consensus Gurus`,
      description,
      url,
      type: 'article',
      siteName: 'Consensus Gurus',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${list.title} | Consensus Gurus`,
      description,
    },
  };
}

export function generateStaticParams() {
  return LISTS.map((l) => ({ id: l.id }));
}

export default function ListPage({ params }) {
  return <DetailClient listId={decodeURIComponent(params.id)} />;
}
