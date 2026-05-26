// Helper functions
import { AMAZON_AFFILIATE_TAG, BOOKING_AFFILIATE_AID, TRIPADVISOR_PARTNER } from './data';

function buildItemLink(itemName, list) {
  // Per-item override: if the list has an entry in `links` matching this item
  // (case-insensitive), use that URL directly. This is how to wire specific
  // amzn.to short links or other deep links to individual items.
  if (list.links) {
    const lookup = itemName.toLowerCase().trim();
    const matchKey = Object.keys(list.links).find(
      (k) => k.toLowerCase().trim() === lookup
    );
    if (matchKey && list.links[matchKey]) return list.links[matchKey];
  }

  const plain = encodeURIComponent(itemName);
  const withCity = encodeURIComponent(`${itemName} ${list.category || ''}`.trim());
  const linkType = list.linkType || 'search';
  switch (linkType) {
    case 'amazon':
      return `https://www.amazon.com/s?k=${plain}&tag=${AMAZON_AFFILIATE_TAG}`;
    case 'imdb':
      return `https://www.imdb.com/find?q=${plain}&s=tt`;
    case 'maps':
      return `https://www.google.com/maps/search/${plain}`;
    case 'mapsCity':
      return `https://www.google.com/maps/search/${withCity}`;
    case 'booking':
      return BOOKING_AFFILIATE_AID
        ? `https://www.booking.com/searchresults.html?ss=${plain}&aid=${BOOKING_AFFILIATE_AID}`
        : `https://www.booking.com/searchresults.html?ss=${plain}`;
    case 'tripadvisor':
      return TRIPADVISOR_PARTNER
        ? `https://www.tripadvisor.com/Search?q=${plain}&partner=${TRIPADVISOR_PARTNER}`
        : `https://www.tripadvisor.com/Search?q=${plain}`;
    case 'steam':
      return `https://store.steampowered.com/search/?term=${plain}`;
    case 'goodreads':
      return `https://www.goodreads.com/search?q=${plain}`;
    case 'wiki':
      return `https://en.wikipedia.org/wiki/Special:Search?search=${plain}`;
    case 'search':
    default:
      return `https://www.google.com/search?q=${plain}`;
  }
}

function getSources(list) {
  /* Returns ordered array of {id, label, items} including computed consensus
     when there are 2+ real sources. */
  const real = Object.entries(list.sources || {}).map(([id, src]) => ({
    id,
    label: src.label,
    items: src.items,
  }));

  // AI always first if present
  const aiIdx = real.findIndex((s) => s.id === 'ai');
  if (aiIdx > 0) {
    const [ai] = real.splice(aiIdx, 1);
    real.unshift(ai);
  }

  if (real.length < 2) return real;

  // Compute consensus: items weighted by appearances across sources, then avg rank
  const itemData = {};
  real.forEach((src) => {
    src.items.forEach((item, idx) => {
      const key = item.toLowerCase().trim();
      if (!itemData[key]) itemData[key] = { name: item, ranks: [] };
      itemData[key].ranks.push(idx + 1);
    });
  });

  const consensusItems = Object.values(itemData)
    .map(({ name, ranks }) => ({
      name,
      appearances: ranks.length,
      avgRank: ranks.reduce((a, b) => a + b, 0) / ranks.length,
    }))
    .sort((a, b) => {
      if (b.appearances !== a.appearances) return b.appearances - a.appearances;
      return a.avgRank - b.avgRank;
    })
    .map((entry) => entry.name);

  const consensus = {
    id: 'consensus',
    label: 'Consensus (all sources combined)',
    items: consensusItems,
  };

  // Order: ai first, consensus second, then the rest in their original order
  const [ai, ...rest] = real;
  return [ai, consensus, ...rest];
}

function voteKey(listId, itemName) {
  return `${listId}::${itemName.toLowerCase().trim()}`;
}

function dedupeByName(items) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const key = item.toLowerCase().trim();
    if (seen.has(key) || !key) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

export { buildItemLink, getSources, voteKey, dedupeByName };
