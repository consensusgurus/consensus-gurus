import { LISTS, COLORS } from '@/lib/data';
import { getSources } from '@/lib/helpers';
import CreateClient from './CreateClient';
import Footer from '../Footer';
import Grain from '../Grain';

export const metadata = {
  title: 'Create Your Own Grid | Consensus Gurus',
  description:
    'Pick a format, fill the tiles with your favorite top-ten lists, and download a clean, shareable grid.',
};

// Mirror the homepage tile preview so the grid shows the same rows as the main page.
function previewFor(l) {
  const mode = l.mode || 'both';

  if (mode === 'facts' || mode === 'scores' || mode === 'unranked') {
    return { label: 'Top of the list', items: ((l.sources && l.sources.ai && l.sources.ai.items) || []).slice(0, 3) };
  }
  if (mode === 'votes') {
    return { label: 'Currently topping the votes', items: ((l.vote && l.vote.items) || []).slice(0, 3) };
  }

  // 'both' (default): show the computed consensus, exactly like the homepage.
  try {
    const sources = getSources(l);
    const consensus = sources.find((s) => s.id === 'consensus');
    if (consensus && consensus.items.length > 0) {
      return { label: 'Current Consensus', items: consensus.items.slice(0, 3) };
    }
  } catch (e) {
    // fall through to vote/ai fallback
  }
  const fallback = ((l.vote && l.vote.items) || (l.sources && l.sources.ai && l.sources.ai.items) || []).slice(0, 3);
  return { label: 'Current Consensus', items: fallback };
}

export default function Page() {
  const lists = LISTS.map((l) => {
    const p = previewFor(l);
    return { id: l.id, title: l.title, category: l.category, label: p.label, items: p.items };
  });

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
