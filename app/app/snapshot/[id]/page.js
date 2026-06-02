import SnapshotClient from './SnapshotClient';
import { LISTS } from '@/lib/data';

export async function generateMetadata({ params }) {
  const id = decodeURIComponent(params.id);
  const list = LISTS.find((l) => l.id === id);
  if (list) {
    return {
      title: `${list.title} — Snapshot | Consensus Gurus`,
      description: list.blurb,
      robots: { index: false, follow: false },
    };
  }
  return { title: 'Snapshot | Consensus Gurus', robots: { index: false, follow: false } };
}

export function generateStaticParams() {
  return LISTS.map((l) => ({ id: l.id }));
}

export default function SnapshotPage({ params }) {
  return <SnapshotClient listId={decodeURIComponent(params.id)} />;
}
