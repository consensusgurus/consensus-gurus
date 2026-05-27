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

/*
  getSources(list, voteData, extras)

  Returns ordered array of { id, label, items } for the "By the Rankings" view.

  The first entry is always a computed Consensus that composites:
    - every named publication's ranking
    - the live "By the People" vote (weighted at 0.5x of one publication)

  Scoring is Borda-style:
    - For each publication, rank 1 scores 10, rank 2 scores 9, ..., rank 10 scores 1
    - Items unranked by a publication receive that publication's *average* score
      (so missing items don't artificially penalize or inflate an entry)
    - The People vote scores are scaled to the same 1..10 range, then weighted 0.5x
    - All weighted scores are summed per item, then items sort descending

  The legacy `ai` source (hardcoded consensus arrays in data.js) is intentionally
  ignored. It stays in data.js as a backup but is never rendered.

  Named publications that follow Consensus keep their original order from data.js.

  voteData and extras are optional. If omitted, Consensus is computed from
  publications only (graceful fallback for any caller that doesn't pass them).
*/
function getSources(list, voteData, extras) {
  const allEntries = Object.entries(list.sources || {}).map(([id, src]) => ({
    id,
    label: src.label,
    items: src.items,
  }));

  // Drop the legacy hardcoded `ai` source from rendering.
  const publications = allEntries.filter((s) => s.id !== 'ai');

  if (publications.length === 0) return [];
  if (publications.length === 1 && !voteData) return publications;

  // Gather every unique item that appears in any publication, plus user extras.
  const universeMap = {};
  publications.forEach((src) => {
    src.items.forEach((item) => {
      const key = item.toLowerCase().trim();
      if (!universeMap[key]) universeMap[key] = item;
    });
  });
  if (Array.isArray(extras)) {
    extras.forEach((item) => {
      const key = item.toLowerCase().trim();
      if (key && !universeMap[key]) universeMap[key] = item;
    });
  }
  const universe = Object.values(universeMap);
  if (universe.length === 0) return publications;

  // Build a Borda score table: scores[itemKey] = total weighted score.
  const scores = {};
  universe.forEach((item) => {
    scores[item.toLowerCase().trim()] = 0;
  });

  // Helper: convert a rank (1-indexed) to Borda points on a 1..10 scale.
  // Anything ranked 11+ falls off to 0 (defensive; lists are top tens).
  const bordaFromRank = (rank) => {
    if (rank < 1 || rank > 10) return 0;
    return 11 - rank;
  };

  // Score each publication.
  publications.forEach((src) => {
    const pubRanks = {};
    src.items.forEach((item, idx) => {
      pubRanks[item.toLowerCase().trim()] = idx + 1;
    });

    // Compute this publication's average Borda score across the items it did rank.
    const rankedKeys = Object.keys(pubRanks);
    let avgScore = 0;
    if (rankedKeys.length > 0) {
      const total = rankedKeys.reduce(
        (sum, k) => sum + bordaFromRank(pubRanks[k]),
        0
      );
      avgScore = total / rankedKeys.length;
    }

    universe.forEach((item) => {
      const key = item.toLowerCase().trim();
      if (pubRanks[key] !== undefined) {
        scores[key] += bordaFromRank(pubRanks[key]);
      } else {
        scores[key] += avgScore;
      }
    });
  });

  // Score the People vote (if we have vote data).
  // Approach: rank items by their net vote count (descending), then award
  // Borda points to the top 10. Items with zero or negative votes get 0.
  // The whole People contribution is weighted at 0.5x (half a publication).
  if (voteData && typeof voteData === 'object') {
    const peopleScored = universe
      .map((item) => {
        const key = `${list.id}::${item.toLowerCase().trim()}`;
        return { item, score: voteData[key] || 0 };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    if (peopleScored.length > 0) {
      // Compute average Borda across the entries the People actually ranked.
      const topTen = peopleScored.slice(0, 10);
      const peopleTotal = topTen.reduce(
        (sum, _, idx) => sum + bordaFromRank(idx + 1),
        0
      );
      const peopleAvg = peopleTotal / topTen.length;

      const peopleRanks = {};
      topTen.forEach((entry, idx) => {
        peopleRanks[entry.item.toLowerCase().trim()] = idx + 1;
      });

      universe.forEach((item) => {
        const key = item.toLowerCase().trim();
        let pts;
        if (peopleRanks[key] !== undefined) {
          pts = bordaFromRank(peopleRanks[key]);
        } else {
          pts = peopleAvg;
        }
        scores[key] += pts * 0.5;
      });
    }
  }

  // Sort by score descending. Break ties by appearance count across publications
  // (more appearances wins), then by alphabetical for stability.
  const appearanceCount = {};
  universe.forEach((item) => {
    const key = item.toLowerCase().trim();
    appearanceCount[key] = publications.reduce((n, src) => {
      return (
        n +
        (src.items.some((i) => i.toLowerCase().trim() === key) ? 1 : 0)
      );
    }, 0);
  });

  const consensusItems = [...universe]
    .sort((a, b) => {
      const ka = a.toLowerCase().trim();
      const kb = b.toLowerCase().trim();
      if (scores[kb] !== scores[ka]) return scores[kb] - scores[ka];
      if (appearanceCount[kb] !== appearanceCount[ka]) {
        return appearanceCount[kb] - appearanceCount[ka];
      }
      return a.localeCompare(b);
    })
    .slice(0, 10);

  const consensus = {
    id: 'consensus',
    label: 'Consensus',
    items: consensusItems,
  };

  return [consensus, ...publications];
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
