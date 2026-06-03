import DetailClient from './DetailClient';
import { LISTS } from '@/lib/data';

function getItemNames(items, count) {
  if (!Array.isArray(items)) return [];
  return items
    .slice(0, count)
    .map((item) => (typeof item === 'string' ? item : item?.name || item?.title || ''))
    .filter(Boolean);
}

function generateSeoDescription(list) {
  const items = list.sources?.ai?.items || list.vote?.items || [];
  const safeItems = Array.isArray(items) ? items : [];
  const top3 = getItemNames(safeItems, 3);
  const top3Str = top3.join(', ');

  const sourceKeys = Object.keys(list.sources || {}).filter((k) => k !== 'ai');
  const sourceCount = sourceKeys.length;

  if (list.mode === 'facts' || list.mode === 'scores' || list.mode === 'unranked') {
    const sourceLabel = list.sources?.ai?.label || 'authoritative rankings';
    return `${list.title}, ranked by ${sourceLabel}. Includes ${top3Str}. See the full ranking at Source of Truths.`;
  }

  if (list.mode === 'votes') {
    return `${list.title}, ranked by readers. Vote on the picks including ${top3Str}. Cast your vote at Source of Truths.`;
  }

  if (sourceCount >= 2) {
    return `${list.title}: compare AI rankings, ${sourceCount} expert publications, and reader votes. Top picks: ${top3Str}.`;
  }
  return `${list.title}: expert rankings and reader votes. Top picks: ${top3Str}.`;
}

function buildStructuredData(list, baseUrl) {
  const items = list.sources?.ai?.items || list.vote?.items || [];
  const safeItems = Array.isArray(items) ? items : [];
  const itemNames = getItemNames(safeItems, 10);

  if (itemNames.length === 0) return null;

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
    })),
  };
}

export async function generateMetadata({ params }) {
  const id = decodeURIComponent(params.id);
  const list = LISTS.find((l) => l.id === id);

  if (!list) {
    return { title: 'List not found' };
  }

  const url = `/list/${encodeURIComponent(id)}`;
  const description = generateSeoDescription(list);

  return {
    title: list.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${list.title} | Source of Truths`,
      description,
      url,
      type: 'article',
      siteName: 'Source of Truths',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${list.title} | Source of Truths`,
      description,
    },
  };
}

export function generateStaticParams() {
  if (!Array.isArray(LISTS)) {
    console.error('LISTS IS NOT AN ARRAY:', typeof LISTS, LISTS);
    return [];
  }
  return LISTS.map((l) => ({ id: l.id }));
}

export default function ListPage({ params }) {
  const id = decodeURIComponent(params.id);
  const list = LISTS.find((l) => l.id === id);
  const baseUrl = 'https://sourceoftruths.com';
  const jsonLd = list ? buildStructuredData(list, baseUrl) : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <DetailClient listId={id} />
    </>
  );
}
