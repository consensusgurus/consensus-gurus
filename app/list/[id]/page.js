import DetailClient from './DetailClient';
import { LISTS } from '@/lib/data';

export async function generateMetadata({ params }) {
  const id = decodeURIComponent(params.id);
  const list = LISTS.find((l) => l.id === id);
  if (list) {
    return {
      title: `${list.title} | Consensus Gurus`,
      description: list.blurb,
      openGraph: {
        title: list.title,
        description: list.blurb,
      },
    };
  }
  return {
    title: 'Consensus Gurus',
  };
}

export function generateStaticParams() {
  return LISTS.map((l) => ({ id: l.id }));
}

export default function ListPage({ params }) {
  return <DetailClient listId={decodeURIComponent(params.id)} />;
}
