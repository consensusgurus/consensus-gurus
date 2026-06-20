import { LISTS, COLORS } from '@/lib/data';
import CreateClient from './CreateClient';
import Footer from '../Footer';
import Grain from '../Grain';

export const metadata = {
  title: 'Create Your Own Grid | Source of Truths',
  description:
    'Pick a format, fill the tiles with your favorite top-ten lists, and download a clean, shareable grid.',
};

export default function Page() {
  // Pass enough of each list for the client to compute the SAME preview the
  // homepage shows (consensus incl. live votes, computed client-side).
  const lists = LISTS.map((l) => ({
    id: l.id,
    title: l.title,
    category: l.category,
    mode: l.mode || 'both',
    sources: l.sources,
    vote: l.vote,
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
