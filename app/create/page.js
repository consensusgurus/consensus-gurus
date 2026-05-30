import { LISTS, COLORS } from '@/lib/data';
import CreateClient from './CreateClient';
import Footer from '../Footer';
import Grain from '../Grain';

export const metadata = {
  title: 'Create Your Own Grid | Consensus Gurus',
  description:
    'Pick a format, fill the tiles with your favorite top-ten lists, and download a clean, shareable grid.',
};

export default function Page() {
  const lists = LISTS.map((l) => ({
    id: l.id,
    title: l.title,
    category: l.category,
    items: ((l.sources && l.sources.ai && l.sources.ai.items) || []).slice(0, 3),
  }));

  return (
    <div
      style={{
        minHeight: '100vh',
        background: COLORS.cream,
        color: COLORS.ink,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Grain />
      <CreateClient lists={lists} />
      <Footer />
    </div>
  );
}
