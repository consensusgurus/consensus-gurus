// Helper functions
import { AMAZON_AFFILIATE_TAG, BOOKING_AFFILIATE_AID, TRIPADVISOR_PARTNER } from './data';

// Bump this whenever the scoring engine's behavior changes (getSources math,
// padding, weighting, tie-breaks) here OR in any of its three mirrors. The
// consensus-check cron folds it into each list's sources fingerprint, so
// consensus shifts caused by an engine deploy are attributed to the deploy
// (cause 'edit'), never misread as fan votes.
export const SCORING_ENGINE_VERSION = '2026-06-07.1';

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
  // For Maps links, strip the characters Google reads as waypoint separators.
  // An item name like "Amanoi (Vinh Hy Bay, Vietnam)" otherwise makes Maps open
  // driving directions (Amanoi -> Vinh Hy Bay) instead of a single location pin.
  const mapsName = itemName
    .replace(/[()]/g, ' ')   // drop parentheses, keep the words inside as context
    .replace(/[;,]/g, ' ')   // commas/semicolons also read as separators
    .replace(/&/g, ' ')      // ampersand -> space
    .replace(/\s+/g, ' ')    // collapse whitespace
    .trim();
  const mapsQuery = encodeURIComponent(mapsName);
  const mapsCityQuery = encodeURIComponent(`${mapsName} ${list.category || ''}`.trim());
  const linkType = list.linkType || 'search';
  switch (linkType) {
    case 'amazon':
      return `https://www.amazon.com/s?k=${plain}&tag=${AMAZON_AFFILIATE_TAG}`;
    case 'imdb':
      return `https://www.google.com/search?q=${plain}+imdb`;
    case 'maps':
      return `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
    case 'mapsCity':
      return `https://www.google.com/maps/search/?api=1&query=${mapsCityQuery}`;
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
      return `https://en.wikipedia.org/w/index.php?title=Special:Search&search=${plain}&go=Go`;
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
    - Items unranked by a publication receive ZERO points (an item absent from a
      list earns nothing from that list; no average credit)
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
    url: src.url,
    unordered: src.unordered,
    trueExpert: src.trueExpert,
    weight: src.weight,
    rankedHead: src.rankedHead,
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

  // Unordered roundups (flagged `unordered: true`, labeled "(unordered roundup)"
  // or "(alphabetical)") contribute EQUAL flat points to every item they list,
  // rather than rank-decaying Borda points — their order is not a ranking.
  //
  // The flat value scales with the source's size. The budget is what those n
  // items could earn at the TOP of a ranked top-10 list:
  //   n <= 10: budget = 10+9+...+(11-n), so flat = (21-n)/2 per item
  //            (1 item -> 10, 3 -> 9, 9 -> 6, 10 -> 5.5)
  //   n > 10:  budget stays at the full 55 (10+9+...+1) split across all n,
  //            so flat = 55/n (16 -> ~3.44, 2000 -> ~0.03 — inclusion on a
  //            huge unordered list means almost nothing).
  const FLAT_BUDGET = 55;
  const flatUnordered = (n) =>
    n <= 0 ? 0 : n <= 10 ? (21 - n) / 2 : FLAT_BUDGET / n;

  // Source weighting. A normal expert publication counts as weight 1.
  // A "true expert" source (flagged `trueExpert: true`) counts for HALF the
  // combined weight of all the other (non-true-expert) experts, with a floor of
  // 2x a single normal expert. So with N other experts (weight 1 each) the true
  // expert's weight is max(2, N / 2):
  //   1 other  -> max(2, 0.5) = 2     (floor)
  //   3 others -> max(2, 1.5) = 2     (floor)
  //   5 others -> max(2, 2.5) = 2.5
  //   6 others -> max(2, 3)   = 3
  // A source may also set an explicit numeric `weight` to override the default 1.
  const normalWeightTotal = publications
    .filter((s) => !s.trueExpert)
    .reduce((sum, s) => sum + (s.weight || 1), 0);
  const sourceWeight = (src) => {
    // An explicit numeric `weight` always takes precedence, including on a
    // trueExpert source (so a true expert can carry an owner-ruled override
    // like 8x or 30x while still grouping/displaying as a True Expert).
    if (src.weight) return src.weight;
    if (src.trueExpert) return Math.max(2, normalWeightTotal / 2);
    return 1;
  };

  // Score each publication, scaled by its weight.
  publications.forEach((src) => {
    const w = sourceWeight(src);
    // A "ranked head" source: the publication ranks/scores only its first
    // `rankedHead` items (e.g. one spot carries a numeric score while the rest
    // of the roundup is unranked). Head items earn Borda rank points; each
    // tail item earns the flat unordered score for a roundup of the tail's
    // size. First used on burgers-boston (Infatuation: Neptune Oyster scored
    // 9.0, rest unscored; owner ruling 2026-06-07 ranks only Neptune).
    if (src.rankedHead) {
      const head = src.items.slice(0, src.rankedHead);
      const tail = src.items.slice(src.rankedHead);
      const flat = flatUnordered(tail.length);
      const pts = {};
      head.forEach((item, idx) => {
        pts[item.toLowerCase().trim()] = bordaFromRank(idx + 1);
      });
      tail.forEach((item) => {
        pts[item.toLowerCase().trim()] = flat;
      });
      universe.forEach((item) => {
        const key = item.toLowerCase().trim();
        if (pts[key] !== undefined) scores[key] += pts[key] * w;
      });
      return;
    }
    if (src.unordered) {
      const listed = new Set(src.items.map((i) => i.toLowerCase().trim()));
      const flat = flatUnordered(listed.size);
      universe.forEach((item) => {
        const key = item.toLowerCase().trim();
        if (listed.has(key)) scores[key] += flat * w;
      });
      return;
    }
    const pubRanks = {};
    src.items.forEach((item, idx) => {
      pubRanks[item.toLowerCase().trim()] = idx + 1;
    });

    // Items this publication ranks earn Borda points; items it omits earn 0.
    // (An item absent from a list receives no average credit.)
    universe.forEach((item) => {
      const key = item.toLowerCase().trim();
      if (pubRanks[key] !== undefined) {
        scores[key] += bordaFromRank(pubRanks[key]) * w;
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
      const topTen = peopleScored.slice(0, 10);
      const peopleRanks = {};
      topTen.forEach((entry, idx) => {
        peopleRanks[entry.item.toLowerCase().trim()] = idx + 1;
      });

      // Items the People ranked earn Borda points; items they omit earn 0
      // (no average credit), consistent with the publication scoring above.
      universe.forEach((item) => {
        const key = item.toLowerCase().trim();
        const pts =
          peopleRanks[key] !== undefined ? bordaFromRank(peopleRanks[key]) : 0;
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

  // Backfill to 10: when fewer than 10 tier-qualifying items exist across the
  // sources, pad the consensus up to 10 from the curated `ai` seed (items not
  // already present), in seed order, appended AFTER every scored item. Seed
  // backfill items never enter the Borda `universe`, so they are unscored and
  // can only occupy the trailing spots, never outranking a real ranked item.
  if (consensusItems.length < 10) {
    const present = new Set(consensusItems.map((i) => i.toLowerCase().trim()));
    const seed = (list.sources && list.sources.ai && list.sources.ai.items) || [];
    for (const seedItem of seed) {
      if (consensusItems.length >= 10) break;
      const key = seedItem.toLowerCase().trim();
      if (!present.has(key)) {
        consensusItems.push(seedItem);
        present.add(key);
      }
    }
  }

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

// Strip a trailing chain-list composite score (" — 7.8/10") from an item name
// for contexts that should not show it (e.g. the home page tile).
function stripItemScore(name) {
  return String(name).replace(/\s*(?:\u2014|-)\s*\d+(?:\.\d+)?\/10\s*$/, '');
}

// Auto-generated re-encode note. When a re-encoded (refreshed) source carries no
// hand-written sourceRevisions entry, the ledgers fall back to this so EVERY
// re-encode shows a note (owner rule). Rating-platform sources name the platform;
// anything else gets a generic line. No em dashes (site copy rule).
function autoSourceNote(label) {
  const l = String(label || '');
  const m = l.match(/yelp|google|tripadvisor|tabelog|openrice|naver|wongnai|zomato|foody|yandex|thefork|beeradvocate|untappd|goodreads|amazon/i);
  const NAMES = { yelp: 'Yelp', google: 'Google', tripadvisor: 'TripAdvisor', tabelog: 'Tabelog', openrice: 'OpenRice', naver: 'Naver', wongnai: 'Wongnai', zomato: 'Zomato', foody: 'Foody', yandex: 'Yandex', thefork: 'TheFork', beeradvocate: 'BeerAdvocate', untappd: 'Untappd', goodreads: 'Goodreads', amazon: 'Amazon' };
  if (m) return `Added ${NAMES[m[0].toLowerCase()]} ratings for entries not previously covered.`;
  return 'Source re-gathered and expanded with additional entries.';
}

export { buildItemLink, getSources, voteKey, dedupeByName, stripItemScore, autoSourceNote };
