import DetailClient from '../DetailClient';
import { LISTS } from '@/lib/data';

export async function generateMetadata({ params }) {
  const id = decodeURIComponent(params.id);
  const list = LISTS.find((l) => l.id === id);

  if (!list) {
    return { title: 'List not found' };
  }

  const url = `/list/${encodeURIComponent(id)}/rankings`;
  const description = `${list.title}: full consensus rankings, every expert source compared, and reader voting.`;

  return {
    title: `${list.title} — Full Rankings & Voting`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${list.title} — Full Rankings & Voting | Source of Truths`,
      description,
      url,
      type: 'article',
      siteName: 'Source of Truths',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${list.title} — Full Rankings & Voting | Source of Truths`,
      description,
    },
  };
}

export function generateStaticParams() {
  if (!Array.isArray(LISTS)) return [];
  return LISTS.map((l) => ({ id: l.id }));
}

export default function ListRankingsPage({ params }) {
  const id = decodeURIComponent(params.id);
  return <DetailClient listId={id} view="detail" />;
}
