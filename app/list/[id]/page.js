import { cache } from 'react';
import { notFound } from 'next/navigation';
import DetailClient from './DetailClient';
import { ListSeoSection } from '@/app/SeoSection';
import { LISTS } from '@/lib/data';
import { DESCRIPTIONS } from '@/lib/descriptions';
import { getSources } from '@/lib/helpers';
import { supabase } from '@/lib/supabase';
import { SITE_URL } from '@/lib/site';

// Re-render each list page (and its metadata) at most hourly so the SEO
// description and JSON-LD track the live, vote-inclusive consensus instead
// of the static ai seed. Pages stay statically served between revalidations.
export const revalidate = 3600;

function getItemNames(items, count) {
  if (!Array.isArray(items)) return [];
  return items
    .slice(0, count)
    .map((item) => (typeof item === 'string' ? item : item?.name || item?.title || ''))
    .filter(Boolean);
}

// Compute the same consensus the page renders: Borda over publications plus
// the live People vote (and user extras) from Supabase. Cached per render
// pass so generateMetadata and the page body share one fetch.
const getConsensusItems = cache(async (listId) => {
  const list = LISTS.find((l) => l.id === listId);
  if (!list) return [];

  const seed = list.sources?.ai?.items || list.vote?.items || [];
  const seedItems = Array.isArray(seed) ? seed : [];

  // Non-consensus modes (facts / scores / unranked / votes) render the ai
  // seed order on the page; mirror that here.
  if (
    list.mode === 'facts' ||
    list.mode === 'scores' ||
    list.mode === 'unranked' ||
    list.mode === 'votes'
  ) {
    return seedItems;
  }

  try {
    const [votesRes, extrasRes] = await Promise.all([
      supabase.from('votes').select('item_name,score').eq('list_id', list.id),
      supabase.from('extras').select('item_name').eq('list_id', list.id),
    ]);

    // Same shaping as /api/bootstrap: key `${listId}::${name}`, clamp legacy
    // negative scores to 0.
    const voteData = {};
    (votesRes.data || []).forEach((row) => {
      voteData[`${list.id}::${row.item_name.toLowerCase().trim()}`] = Math.max(0, row.score);
    });
    const extras = (extrasRes.data || []).map((r) => r.item_name);

    const sources = getSources(list, voteData, extras);
    const consensus = Array.isArray(sources)
      ? sources.find((s) => s.id === 'consensus')
      : null;
    if (consensus && Array.isArray(consensus.items) && consensus.items.length > 0) {
      return consensus.items;
    }
  } catch (e) {
    console.error('live consensus for metadata failed', list.id, e);
  }

  // Graceful fallback: publications-only consensus, then the seed.
  try {
    const sources = getSources(list);
    const consensus = Array.isArray(sources)
      ? sources.find((s) => s.id === 'consensus')
      : null;
    if (consensus && Array.isArray(consensus.items) && consensus.items.length > 0) {
      return consensus.items;
    }
  } catch (e) {
    // fall through to seed
  }
  return seedItems;
});

function generateSeoDescription(list, consensusItems) {
  const top3 = getItemNames(consensusItems, 3);
  const top3Str = top3.join(', ');

  const sourceKeys = Object.keys(list.sources || {}).filter((k) => k !== 'ai');
  const sourceCount = sourceKeys.length;

  if (list.mode === 'facts' || list.mode === 'scores' || list.mode === 'unranked') {
    const sourceLabel = list.sources?.ai?.label || 'authoritative rankings';
    return `${list.title}, ranked by ${sourceLabel}. Includes ${top3Str}. See the full ranking at Mind Loft.`;
  }

  if (list.mode === 'votes') {
    return `${list.title}, ranked by readers. Vote on the picks including ${top3Str}. Cast your vote at Mind Loft.`;
  }

  if (sourceCount >= 2) {
    return `${list.title}: compare rankings from ${sourceCount} expert publications and reader votes. Top picks: ${top3Str}.`;
  }
  return `${list.title}: expert rankings and reader votes. Top picks: ${top3Str}.`;
}

function buildStructuredData(list, baseUrl, consensusItems) {
  const itemNames = getItemNames(consensusItems, 10);

  if (itemNames.length === 0) return null;

  // Per-item `description` added 2026-08-17. The ItemList previously carried
  // name + position only, which is the thinnest shape the type allows; the
  // descriptions already exist in lib/descriptions.js for every consensus
  // top-10 item (it is a build requirement, see CLAUDE.md), so this costs
  // nothing and gives the markup something to actually say.
  const descs = DESCRIPTIONS[list.id] || {};

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: list.title,
    description: list.blurb,
    url: `${baseUrl}/list/${list.id}`,
    numberOfItems: itemNames.length,
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    itemListElement: itemNames.map((name, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name,
      ...(descs[name] ? { description: descs[name] } : {}),
    })),
  };
}

// Server-side mirror of the `relatedLists` memo in DetailClient: most shared
// tags first, backfilled to six. Kept deterministic (no votes, no views) so the
// server HTML and the hydrated page agree on the links.
function relatedListsFor(list) {
  const tagsOf = (l) =>
    Array.isArray(l.tags) && l.tags.length > 0 ? l.tags : l.type ? [l.type] : [];
  const mine = new Set(tagsOf(list));

  const scored = LISTS.filter((l) => l.id !== list.id)
    .map((l) => ({ list: l, overlap: tagsOf(l).filter((t) => mine.has(t)).length }))
    .filter((x) => x.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap || a.list.id.localeCompare(b.list.id))
    .map((x) => x.list);

  return scored.slice(0, 6);
}

export async function generateMetadata({ params }) {
  const id = decodeURIComponent(params.id);
  const list = LISTS.find((l) => l.id === id);

  if (!list) {
    return { title: 'List not found' };
  }

  const consensusItems = await getConsensusItems(id);
  const url = `/list/${encodeURIComponent(id)}`;
  const description = generateSeoDescription(list, consensusItems);

  const seoTitle = list.seoTitle || list.title;

  return {
    title: seoTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${seoTitle} | Mind Loft`,
      description,
      url,
      type: 'article',
      siteName: 'Mind Loft',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${seoTitle} | Mind Loft`,
      description,
    },
  };
}

// On-demand ISR (Vercel support, 2026-06-11): do NOT prerender all ~450 list
// pages at build. Each is ~1.28MB; together with the snapshot pages that is
// >1.1GB of static output, which overruns Vercel's post-build deploy agent
// (a separate memory limit that bigger build machines do NOT raise). Returning
// [] renders each page on first request and CDN-caches it via `revalidate`.
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export default async function ListPage({ params }) {
  const id = decodeURIComponent(params.id);
  const list = LISTS.find((l) => l.id === id);
  if (!list) notFound();
  const baseUrl = `${SITE_URL}`;
  const consensusItems = list ? await getConsensusItems(id) : [];
  const jsonLd = list ? buildStructuredData(list, baseUrl, consensusItems) : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {/* The section is passed INTO DetailClient rather than rendered beside
          it, so it lands above the shared <Footer /> that DetailClient owns.
          This works because DetailClient genuinely server-renders (it just
          renders its "Loading the ranking..." state), unlike the quiz route,
          where a useSearchParams Suspense bail forces the section outside the
          client tree. A server-rendered element passed as a prop to a client
          component is rendered on the server and slotted in. */}
      <DetailClient
        key="list-overview"
        listId={id}
        seo={
          <ListSeoSection
            list={list}
            items={consensusItems}
            related={relatedListsFor(list)}
          />
        }
      />
    </>
  );
}
