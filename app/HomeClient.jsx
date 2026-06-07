'use client';
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  Eye,
  Plus,
  X,
  Search,
} from 'lucide-react';
import { LISTS, TYPES, COLORS } from '@/lib/data';
import { voteKey, dedupeByName, getSources, stripItemScore } from '@/lib/helpers';
import { fetchBootstrap, postView } from '@/lib/api';
import Grain from './Grain';
import Footer from './Footer';
import SourcesPopover from './SourcesPopover';

// Human-readable labels for each list type, shown in the top-right of tiles.
const TYPE_LABELS = {
  travel: 'Travel',
  food: 'Food & Drink',
  entertainment: 'Entertainment',
  product: 'Products',
  stores: 'Places',
  other: 'Lists',
};

// Tag-derived sub-labels used when list.category would duplicate the type label.
const TAG_SUBLABELS = {
  bars: 'Bars',
  nightlife: 'Nightlife',
  luxury: 'Luxury',
  tech: 'Tech',
  food: 'Food',
  'food-drink': 'Food & Drink',
  entertainment: 'Entertainment',
  product: 'Products',
};

// Returns { leftLabel, rightLabel } for the tile header row.
// rightLabel = human-readable type.
// leftLabel  = list.category, unless that would duplicate rightLabel,
//              in which case we derive something from tags or the title.
function getTileLabels(list) {
  const rightLabel = TYPE_LABELS[list.type] || 'Lists';
  const cat = list.category || '';
  if (cat.toLowerCase() !== rightLabel.toLowerCase()) {
    return { leftLabel: cat, rightLabel };
  }
  // Conflict: category repeats the type label — find a more specific left label.
  const tags = getListTags(list);
  for (const t of tags) {
    if (TAG_SUBLABELS[t] && TAG_SUBLABELS[t].toLowerCase() !== rightLabel.toLowerCase()) {
      return { leftLabel: TAG_SUBLABELS[t], rightLabel };
    }
  }
  // Last resort: pull the "in X" destination out of the title.
  const m = list.title && list.title.match(/\bin\s+(.+)$/i);
  if (m) return { leftLabel: m[1].replace(/^the\s+/i, ''), rightLabel };
  return { leftLabel: cat, rightLabel };
}

// Medal accents for the top-3 consensus rows on homepage tiles only (gold/silver/bronze).
const RANK_MEDALS = [
  { fill: '#c9a227', num: '#8a6d12', numHover: '#e7cf73' },
  { fill: '#9ca3a8', num: '#6b7278', numHover: '#cfd4d8' },
  { fill: '#a9743f', num: '#7a4f2b', numHover: '#d49a66' },
];

// Get the effective tag set for a list. If `tags` is provided, use it.
// Otherwise fall back to [type] for backward compatibility.
function getListTags(list) {
  if (Array.isArray(list.tags) && list.tags.length > 0) return list.tags;
  if (list.type) return [list.type];
  return [];
}

function listHasTag(list, tagId) {
  return getListTags(list).includes(tagId);
}

// Pick the most similar list to `list` (same city/category + shared tags, with a
// nudge toward same-kind menu-item lists). Used to fill the extra vertical space
// in double-height featured tiles. Returns null when nothing is clearly related.
function findRelatedLists(list, lists, n) {
  const tags = new Set(getListTags(list));
  const scored = [];
  for (const other of lists) {
    if (other.id === list.id) continue;
    let score = 0;
    if (list.category && other.category === list.category) score += 5;
    for (const t of getListTags(other)) if (tags.has(t)) score += 1;
    if (list.picsTerm && other.picsTerm) score += 1;
    scored.push({ other, score });
  }
  // Closest-first, and always return up to n so any leftover space can be
  // filled, even when nothing shares the exact topic.
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, n).map((x) => x.other);
}

// Browse categories. Each maps to a set of underlying tags so lists never need
// re-tagging and overlapping tags collapse into one clean filter. 'stores',
// 'nightlife', 'food' etc. remain on lists as internal tags but are no longer
// their own browse buckets.
const CATEGORIES = [
  { id: 'all', label: 'All' },
  // 'any' = belongs if it has any of these tags; 'not' = excluded if it has any of these.
  // Bars carry food-drink/entertainment tags, so Restaurants and Entertainment exclude
  // bars/nightlife to keep a cocktail bar from leaking out of Bars & Nightlife.
  { id: 'restaurants', label: 'Eating', any: ['food', 'food-drink'], not: ['bars', 'nightlife'] },
  { id: 'bars-nightlife', label: 'Drinking', any: ['bars', 'nightlife'] },
  { id: 'travel', label: 'Hotels & Travel', any: ['travel', 'luxury'] },
  { id: 'shops', label: 'Products', any: ['product', 'tech'] },
  { id: 'entertainment', label: 'Entertainment', any: ['entertainment'] },
  { id: 'misc', label: 'Miscellaneous', any: ['other'] },
];
const CAT_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
function listInCategory(list, catId) {
  const cat = CAT_BY_ID[catId];
  if (!cat || cat.id === 'all' || !cat.any) return true;
  const tags = getListTags(list);
  if (cat.not && cat.not.some((t) => tags.includes(t))) return false;
  return cat.any.some((t) => tags.includes(t));
}

// ── Narrow browse filters (mega-menu) ───────────────────────────────────────────
// The category dropdown shows the broad CATEGORIES above as its top row, then
// narrower cuts below: By City, By Region, By Topic. Cities are derived from
// list.category via this normalization map (neighborhoods and naming variants
// roll up into their city). A city only appears in the menu once it has 2+
// lists, so this map can stay generous.
const CITY_CANON = {
  'New York': 'New York',
  'Williamsburg, Brooklyn': 'New York',
  'Greenpoint, Brooklyn': 'New York',
  'East Village': 'New York',
  'West Village': 'New York',
  'Greenwich Village': 'New York',
  'SoHo': 'New York',
  'Boston': 'Boston',
  'Miami': 'Miami',
  'Miami Beach': 'Miami',
  'Chicago': 'Chicago',
  'Atlanta': 'Atlanta',
  'Austin': 'Austin',
  'London': 'London',
  'Tokyo': 'Tokyo',
  'The Hamptons': 'The Hamptons',
  'Hamptons': 'The Hamptons',
  'Los Angeles': 'Los Angeles',
  'Savannah': 'Savannah',
  'New Orleans': 'New Orleans',
  'Tampa': 'Tampa Bay',
  'Tampa Bay': 'Tampa Bay',
  'San Diego': 'San Diego',
  'Buffalo': 'Buffalo',
  'Monaco': 'Monaco',
  'Las Vegas': 'Las Vegas',
  'San Francisco': 'San Francisco',
  'Dallas': 'Dallas',
  'Denver': 'Denver',
  'Charlotte': 'Charlotte',
  'Orlando': 'Orlando',
  'Washington DC': 'Washington DC',
  'Asheville': 'Asheville',
  'Jacksonville': 'Jacksonville',
  'Nashville': 'Nashville',
  'New Haven': 'New Haven',
  'Philadelphia': 'Philadelphia',
  'Cape Cod': 'Cape Cod',
  'Montreal': 'Montreal',
  'Toronto': 'Toronto',
  'Paris': 'Paris',
  'Barcelona': 'Barcelona',
  'Amsterdam': 'Amsterdam',
  'Copenhagen': 'Copenhagen',
  'Prague': 'Prague',
  'Oslo': 'Oslo',
  'Helsinki': 'Helsinki',
  'Athens': 'Athens',
  'Istanbul': 'Istanbul',
  'Kyiv': 'Kyiv',
  'St. Petersburg': 'St. Petersburg',
  'Shanghai': 'Shanghai',
  'Hong Kong': 'Hong Kong',
  'Tel Aviv': 'Tel Aviv',
  'Abu Dhabi': 'Abu Dhabi',
  'Bali': 'Bali',
  'Sydney': 'Sydney',
  'Tulum': 'Tulum',
  'Cabo San Lucas': 'Cabo San Lucas',
  'Buenos Aires': 'Buenos Aires',
  'Marrakesh': 'Marrakesh',
  'Casablanca': 'Casablanca',
  'Cape Town': 'Cape Town',
  'Rio de Janeiro': 'Rio de Janeiro',
  'Sao Paulo': 'Sao Paulo',
  'Santiago': 'Santiago',
  'Cartagena': 'Cartagena',
};
const cityFilterId = (city) => 'city-' + city.toLowerCase().replace(/[^a-z0-9]+/g, '-');

// Region cuts match on raw list.category OR the canonical city, so both
// country-level categories ('Greece', 'Italy') and city lists land in them.
const REGION_FILTERS = [
  { id: 'region-us-regional', label: 'US Regional', cats: ['USA', 'Florida', 'Texas', 'Ohio', 'Kentucky', 'New England', 'Cape Cod', 'The Hamptons'] },
  { id: 'region-europe', label: 'Europe', cats: ['London', 'Paris', 'Barcelona', 'Amsterdam', 'Copenhagen', 'Prague', 'Oslo', 'Helsinki', 'Athens', 'Istanbul', 'Kyiv', 'St. Petersburg', 'Monaco', 'Greece', 'Greek Islands', 'Italy', 'France', 'Spain', 'Croatia', 'Alps', 'Mediterranean', 'Turkey'] },
  { id: 'region-asia-pacific', label: 'Asia & Pacific', cats: ['Tokyo', 'Shanghai', 'Hong Kong', 'Bali', 'Sydney', 'South Pacific'] },
  { id: 'region-mideast-africa', label: 'Middle East & Africa', cats: ['Tel Aviv', 'Abu Dhabi', 'Marrakesh', 'Casablanca', 'Cape Town'] },
  { id: 'region-latam', label: 'Latin America & Caribbean', cats: ['Tulum', 'Cabo San Lucas', 'Buenos Aires', 'Rio de Janeiro', 'Sao Paulo', 'Santiago', 'Cartagena'] },
].map((r) => ({
  ...r,
  match: (l) => r.cats.includes(l.category) || r.cats.includes(CITY_CANON[l.category]),
}));

// Topic cuts match on title + id keywords (and category where cleaner).
const ttext = (l) => `${l.title || ''} ${l.id || ''}`.toLowerCase();
const TOPIC_FILTERS = [
  { id: 'topic-pizza', label: 'Pizza', match: (l) => /pizza/.test(ttext(l)) },
  { id: 'topic-burgers', label: 'Burgers', match: (l) => /burger/.test(ttext(l)) },
  { id: 'topic-tacos', label: 'Tacos & Mexican', match: (l) => /taco|mexican|burrito/.test(ttext(l)) },
  { id: 'topic-bbq', label: 'BBQ & Steak', match: (l) => /bbq|barbecue|steak/.test(ttext(l)) },
  { id: 'topic-sushi', label: 'Sushi & Ramen', match: (l) => /sushi|ramen|omakase/.test(ttext(l)) },
  { id: 'topic-breakfast', label: 'Breakfast & Coffee', match: (l) => /brunch|breakfast|bagel|coffee|cafe/.test(ttext(l)) },
  { id: 'topic-dive-bars', label: 'Dive Bars', match: (l) => /dive.bar/.test(ttext(l)) },
  { id: 'topic-cocktails', label: 'Cocktail Bars', match: (l) => /cocktail/.test(ttext(l)) },
  { id: 'topic-beer', label: 'Breweries & Beer', match: (l) => /brewer|beer/.test(ttext(l)) },
  { id: 'topic-spirits', label: 'Wine & Spirits', match: (l) => /wine|whiskey|whisky|\bgins?\b|vodka|tequila|scotch|distiller|bourbon/.test(ttext(l)) },
  { id: 'topic-hotels', label: 'Hotels & Resorts', match: (l) => /hotel|resort|lodge|villa/.test(ttext(l)) },
  { id: 'topic-beaches', label: 'Beaches & Beach Clubs', match: (l) => /beach/.test(ttext(l)) },
  { id: 'topic-movies', label: 'Movies', match: (l) => /\bfilms?\b|movies?|director/.test(ttext(l)) || ['Film', 'Cinema'].includes(l.category) || /^Movies/.test(l.category || '') },
  { id: 'topic-tv', label: 'TV Shows', match: (l) => /\btv\b|television|hbo|docuseries|sitcom/.test(ttext(l)) || ['TV', 'Television', 'True Crime'].includes(l.category) },
  { id: 'topic-books', label: 'Books', match: (l) => ['Books', 'Cookbooks'].includes(l.category) || /\bbooks?\b|novels?|memoirs?/.test(ttext(l)) },
  { id: 'topic-music', label: 'Music', match: (l) => /\bsongs?\b|albums?|music/.test(ttext(l)) },
  { id: 'topic-sports', label: 'Sports & Outdoors', match: (l) => ['Sports', 'Outdoors', 'Golf', 'College Football', 'Formula 1', 'Fitness'].includes(l.category) || /golf|stadium|football|basketball|whitewater|campground|national park|running shoe|fight song/.test(ttext(l)) },
  { id: 'topic-tech', label: 'Tech & Audio', match: (l) => ['Tech', 'Audio'].includes(l.category) },
  { id: 'topic-kitchen-home', label: 'Kitchen & Home', match: (l) => ['Kitchen', 'Home', 'Sleep'].includes(l.category) },
  { id: 'topic-chains', label: 'Chains & Groceries', match: (l) => ['Fast Food', 'Casual Dining', 'Costco', 'Grocery', 'Frozen Food', 'Snacks', 'Seltzer', 'Beverages'].includes(l.category) || /fast.food|menu items|trader joe/.test(ttext(l)) },
];
const NARROW_BY_ID = Object.fromEntries(
  [...REGION_FILTERS, ...TOPIC_FILTERS].map((f) => [f.id, f])
);

// One filter test for every kind of browse filter (broad category, city,
// region, topic). Unknown ids fail open so a stale id can never blank the page.
function matchesBrowseFilter(list, id) {
  if (!id || id === 'all') return true;
  if (CAT_BY_ID[id]) return listInCategory(list, id);
  if (id.startsWith('city-')) {
    const city = CITY_CANON[list.category];
    return !!city && cityFilterId(city) === id;
  }
  const f = NARROW_BY_ID[id];
  return f ? f.match(list) : true;
}

// A "product list" for homepage placement = anything in the Products browse
// bucket (physical products or tech). Used to keep a product list from ever
// being the first or second tile on the default Discover view, so a fresh
// visitor never lands on a product list first.
function isProductList(list) {
  return listInCategory(list, 'shops');
}

// Resolve a comparable timestamp for a list, in priority order:
//   1. publishedAt   (full ISO string on built-in lists)
//   2. submittedAt   (Supabase timestamptz on reader submissions)
//   3. publishedDate (legacy date-only field, parsed as noon UTC so it
//      sorts predictably against full timestamps)
// Returns a millisecond epoch number. Lists with no timestamp at all
// get 0 so they end up last in recency sort.
function getListTimestamp(list) {
  if (list.publishedAt) {
    const t = new Date(list.publishedAt).getTime();
    if (!Number.isNaN(t)) return t;
  }
  if (list.submittedAt) {
    const t = new Date(list.submittedAt).getTime();
    if (!Number.isNaN(t)) return t;
  }
  if (list.publishedDate) {
    const t = new Date(list.publishedDate + 'T12:00:00Z').getTime();
    if (!Number.isNaN(t)) return t;
  }
  return 0;
}

// Seeded Fisher-Yates so Discover stays put across re-renders within a
// single page view (typing in the search bar, hovering a tile) but
// reshuffles on every fresh page load since the seed comes from
// Date.now() captured once on mount.
function seededShuffle(arr, seed) {
  const out = arr.slice();
  let s = seed >>> 0 || 1;
  for (let i = out.length - 1; i > 0; i--) {
    // xorshift32
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    const j = (s >>> 0) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function Home({ lists, viewCounts, voteData, extras, trending = {}, openList, onSubmit }) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [catOpen, setCatOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  // Default sort is the shuffled "Discover" view.
  const [sortBy, setSortBy] = useState('discover');

  // Fresh seed per page load — captured once on mount. Stays stable while
  // the user interacts with the page (so the order doesn't reshuffle
  // when typing in search), but a reload picks a new seed and a new
  // order.
  const [discoverSeed] = useState(
    () => (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0
  );

  // Recompute shuffle order when the lists collection or seed changes.
  const discoverOrder = useMemo(() => {
    return seededShuffle(lists, discoverSeed);
  }, [lists, discoverSeed]);

  // Close the category / sort dropdowns when clicking anywhere outside.
  useEffect(() => {
    if (!catOpen && !sortOpen) return undefined;
    const close = () => {
      setCatOpen(false);
      setSortOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [catOpen, sortOpen]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return lists.filter((list) => {
      if (typeFilter !== 'all' && !matchesBrowseFilter(list, typeFilter)) return false;
      if (!q) return true;
      const hay = [
        list.title,
        list.category,
        list.blurb,
        ...Object.values(list.sources || {}).flatMap((s) => s.items),
        ...(list.vote?.items || []),
      ]
        .join(' ')
        .toLowerCase();
      // Match every word in the query, in any order (so "boston burger"
      // and "burger boston" both match "Best Burger in Boston").
      const tokens = q.split(/\s+/).filter(Boolean);
      return tokens.every((t) => hay.includes(t));
    });
  }, [lists, query, typeFilter]);

  const sorted = useMemo(() => {
    if (sortBy === 'discover') {
      // Preserve the precomputed shuffle order; just keep entries that
      // survived the current filter.
      const allowed = new Set(filtered);
      const order = discoverOrder.filter((l) => allowed.has(l));
      // Rule: a product list must never be the first or second tile on
      // Discover. If one lands in slot 0 or 1, pull up the nearest later
      // non-product list to take its place; the rest of the shuffle is
      // otherwise untouched. The findIndex guard (-1) leaves things as-is
      // when there aren't enough non-product lists (e.g. the Products
      // filter is active), so the rule degrades gracefully.
      for (let i = 0; i < 2 && i < order.length; i++) {
        if (!isProductList(order[i])) continue;
        const j = order.findIndex((l, k) => k > i && !isProductList(l));
        if (j === -1) break;
        const [moved] = order.splice(j, 1);
        order.splice(i, 0, moved);
      }
      return order;
    }
    return [...filtered].sort((a, b) => {
      if (sortBy === 'trending') {
        const ta = trending[a.id] || 0;
        const tb = trending[b.id] || 0;
        if (tb !== ta) return tb - ta;
        return lists.indexOf(a) - lists.indexOf(b);
      }
      if (sortBy === 'recent') {
        const ta = getListTimestamp(a);
        const tb = getListTimestamp(b);
        if (tb !== ta) return tb - ta;
        // Same timestamp: fall back to original array order
        return lists.indexOf(a) - lists.indexOf(b);
      }
      // 'popularity' (viewCount)
      const va = viewCounts[a.id] || 0;
      const vb = viewCounts[b.id] || 0;
      if (vb !== va) return vb - va;
      return lists.indexOf(a) - lists.indexOf(b);
    });
  }, [filtered, viewCounts, trending, lists, sortBy, discoverOrder]);

  // Randomly mark some lists as "featured": double-height tiles that preview the
  // full top 10 instead of the top 3. A cooldown of 5 guarantees at least 5 lists
  // between featured tiles, which keeps at most one featured tile per row for any
  // layout up to 5 columns. Re-randomizes whenever the sorted set changes.
  const featuredIds = useMemo(() => {
    const set = new Set();
    let cooldown = 0;
    for (let i = 0; i < sorted.length; i++) {
      if (cooldown > 0) { cooldown--; continue; }
      if (Math.random() < 0.5) { set.add(sorted[i].id); cooldown = 5; }
    }
    return set;
  }, [sorted]);

  const totalViews = Object.values(viewCounts).reduce((a, b) => a + b, 0);

  // Total votes shown in the header: every expert entry counts as Borda points
  // (rank 1 = 10, rank 2 = 9 ... rank 10 = 1, nothing beyond), summed across
  // every expert source on every list (the 'ai' seed is excluded, exactly as in
  // the consensus scoring), plus the live, continuously-tallied reader votes.
  const totalVotes = useMemo(() => {
    let total = 0;
    lists.forEach((list) => {
      const src = list.sources || {};
      Object.keys(src).forEach((sid) => {
        if (sid === 'ai') return;
        const items = (src[sid] && src[sid].items) || [];
        for (let i = 0; i < items.length; i++) total += Math.max(0, 10 - i);
      });
    });
    Object.values(voteData || {}).forEach((v) => { if (v > 0) total += v; });
    return total;
  }, [lists, voteData]);

  // Count lists per tag (a list can contribute to multiple tag counts)
  const counts = useMemo(() => {
    const out = { all: lists.length };
    CATEGORIES.forEach((c) => {
      if (c.id === 'all') return;
      out[c.id] = lists.filter((l) => listInCategory(l, c.id)).length;
    });
    [...REGION_FILTERS, ...TOPIC_FILTERS].forEach((f) => {
      out[f.id] = lists.filter(f.match).length;
    });
    return out;
  }, [lists]);

  // Only show tag chips that have at least one matching list (skip empty buckets)
  const visibleTypes = useMemo(() => {
    return CATEGORIES.filter((t) => t.id === 'all' || (counts[t.id] || 0) > 0);
  }, [counts]);

  // Cities for the mega-menu, derived from list.category via CITY_CANON.
  // A city needs 2+ lists to earn a chip; ordered by count, then A-Z.
  const cityFilters = useMemo(() => {
    const byCity = new Map();
    lists.forEach((l) => {
      const city = CITY_CANON[l.category];
      if (!city) return;
      byCity.set(city, (byCity.get(city) || 0) + 1);
    });
    return [...byCity.entries()]
      .filter(([, n]) => n >= 2)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([city, n]) => ({ id: cityFilterId(city), label: city, count: n }));
  }, [lists]);

  // Regions / topics need 2+ matching lists to show.
  const visibleRegions = useMemo(
    () => REGION_FILTERS.filter((f) => (counts[f.id] || 0) >= 2),
    [counts]
  );
  const visibleTopics = useMemo(
    () => TOPIC_FILTERS.filter((f) => (counts[f.id] || 0) >= 2),
    [counts]
  );

  // Resolve the active filter's label for the Category button, across every
  // group (broad, city, region, topic).
  const activeFilterLabel = useMemo(() => {
    const all = [...visibleTypes, ...cityFilters, ...visibleRegions, ...visibleTopics];
    const f = all.find((x) => x.id === typeFilter);
    return (f && f.label) || 'All';
  }, [visibleTypes, cityFilters, visibleRegions, visibleTopics, typeFilter]);

  const sortButtons = [
    { id: 'discover', label: 'Discover', short: 'Discover' },
    { id: 'trending', label: 'Trending', short: 'Trending' },
    { id: 'popularity', label: 'Most Popular', short: 'Popular' },
    { id: 'recent', label: 'Most Recently Added', short: 'Recent' },
  ];

  return (
    <div style={{ position: 'relative', zIndex: 2 }}>
      <header
        style={{
          padding: '48px 24px 18px',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <div className="cg-head">
          <h1
            style={{
              fontFamily: 'Fraunces, serif',
              fontWeight: 600,
              fontSize: 'clamp(40px, 9vw, 84px)',
              lineHeight: 0.9,
              letterSpacing: '-0.015em',
              margin: 0,
              fontVariationSettings: '"SOFT" 100',
              color: COLORS.ink,
              whiteSpace: 'nowrap',
            }}
          >
            Source
            <br />
            of Truths
          </h1>
          <div className="cg-head-col">
            <div className="cg-tagline">
              For all the important aspects of life
            </div>
            <div className="cg-blurb">
              The consensus of expert critics and everyday users, weighed across{' '}<SourcesPopover />, from Michelin, Condé Nast Traveler, The Infatuation, Eater, and Robb Report to Wirecutter, Goodreads, and Dave Portnoy.
            </div>
            <div style={{ borderBottom: `1px solid ${COLORS.ink}`, marginBottom: 4 }} />
            <div style={{ borderBottom: `2px solid ${COLORS.ember}` }} />
          </div>
        </div>
        <style>{`
          .cg-head{display:flex;align-items:flex-end;gap:clamp(16px,4vw,28px);}
          .cg-head-col{flex:1;min-width:0;margin-bottom:clamp(8px,1.4vw,14px);}
          .cg-tagline{font-family:'DM Mono',monospace;font-size:clamp(9px,1.1vw,11px);letter-spacing:0.2em;text-transform:uppercase;font-weight:700;color:${COLORS.ink};text-align:right;margin-bottom:8px;line-height:1.4;}
          .cg-blurb{font-family:'DM Sans',sans-serif;font-size:clamp(11px,1.25vw,13px);line-height:1.5;color:${COLORS.ink};text-align:right;max-width:520px;margin-left:auto;margin-bottom:10px;}
          @media(max-width:640px){
            .cg-head{flex-direction:column;align-items:stretch;gap:14px;}
            .cg-head-col{margin-bottom:0;}
            .cg-tagline{text-align:left;}
            .cg-blurb{text-align:left;max-width:none;margin-left:0;font-size:14px;}
          }
          .cg-stats{margin-top:16px;display:flex;justify-content:flex-start;align-items:baseline;flex-wrap:nowrap;white-space:nowrap;gap:16px;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:${COLORS.faded};}
          .cg-stats .cg-dot{opacity:0.5;}
          @media(max-width:560px){.cg-stats{gap:10px;font-size:clamp(8px,2.7vw,11px);letter-spacing:0.06em;}}
        `}</style>
        <div className="cg-stats">
          <span>{lists.length} lists</span>
          <span><span aria-hidden="true" className="cg-dot">·</span> {totalVotes.toLocaleString()} votes</span>
          <span><span aria-hidden="true" className="cg-dot">·</span> {totalViews.toLocaleString()} visitors</span>
        </div>
      </header>

      <section style={{ padding: '10px 16px 80px', maxWidth: 1200, margin: '0 auto' }}>
        <style>{`.cg-controls{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:36px;}.cg-controls>*{height:50px;min-width:0;}@media(max-width:760px){.cg-controls{grid-template-columns:1fr 1fr;gap:12px;}}`}</style>
        <div className="cg-controls">
          <div className="cg-c-search" style={{ position: 'relative', minWidth: 0, order: 3 }}>
            <Search size={16} strokeWidth={2.5} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: COLORS.faded }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search lists"
              style={{ width: '100%', height: '100%', boxSizing: 'border-box', padding: '0 16px 0 42px', background: COLORS.paper, border: `1.5px solid ${COLORS.ink}`, fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: COLORS.ink, outline: 'none' }}
            />
            {query && (
              <button onClick={() => setQuery('')} aria-label="Clear search" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: COLORS.faded, cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} strokeWidth={2.5} />
              </button>
            )}
          </div>

          <div style={{ position: 'relative', minWidth: 0, order: 2 }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setCatOpen((o) => !o); setSortOpen(false); }} aria-haspopup="true" aria-expanded={catOpen} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#bdb3a0', color: COLORS.ink, border: `1.5px solid ${COLORS.ink}`, padding: '0 14px', fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              <span><span style={{ opacity: 0.8 }}>Category:</span> {activeFilterLabel}</span>
              <ChevronDown size={14} strokeWidth={2.5} style={{ transform: catOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
            </button>
            {catOpen && (() => {
              const pick = (id) => { setTypeFilter(id); setCatOpen(false); };
              const chip = (f, big) => {
                const active = typeFilter === f.id;
                const count = f.count != null ? f.count : (counts[f.id] || 0);
                return (
                  <button
                    key={f.id}
                    role="menuitem"
                    onClick={() => pick(f.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'baseline',
                      gap: 6,
                      border: `1px solid ${COLORS.ink}`,
                      padding: big ? '9px 12px' : '7px 10px',
                      fontFamily: 'DM Mono, monospace',
                      fontSize: big ? 10 : 9,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: active ? '#bdb3a0' : COLORS.paper,
                      color: COLORS.ink,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span>{f.label}</span>
                    {f.id !== 'all' && <span style={{ opacity: 0.55 }}>{count}</span>}
                  </button>
                );
              };
              const heading = (text) => (
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, color: COLORS.faded, margin: '16px 0 8px' }}>
                  {text}
                </div>
              );
              return (
                <div role="menu" style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, left: 'auto', zIndex: 30, width: 'min(640px, calc(100vw - 48px))', background: COLORS.cream, border: `1.5px solid ${COLORS.ink}`, boxShadow: `4px 4px 0 ${COLORS.ink}`, maxHeight: 'min(70vh, 560px)', overflowY: 'auto', padding: '14px 16px 18px', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, paddingBottom: 12, borderBottom: `1px solid ${COLORS.ink}` }}>
                    {visibleTypes.map((t) => chip(t, true))}
                  </div>
                  {cityFilters.length > 0 && (
                    <>
                      {heading('By City')}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {cityFilters.map((f) => chip(f, false))}
                      </div>
                    </>
                  )}
                  {visibleRegions.length > 0 && (
                    <>
                      {heading('By Region')}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {visibleRegions.map((f) => chip(f, false))}
                      </div>
                    </>
                  )}
                  {visibleTopics.length > 0 && (
                    <>
                      {heading('By Topic')}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {visibleTopics.map((f) => chip(f, false))}
                      </div>
                    </>
                  )}
                </div>
              );
            })()}
          </div>

          <div style={{ position: 'relative', minWidth: 0, order: 1 }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setSortOpen((o) => !o); setCatOpen(false); }} aria-haspopup="true" aria-expanded={sortOpen} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: COLORS.ink, color: COLORS.cream, border: `1.5px solid ${COLORS.ink}`, padding: '0 14px', fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              <span><span style={{ opacity: 0.8 }}>Sort:</span> {(sortButtons.find((o) => o.id === sortBy) || {}).short || 'Discover'}</span>
              <ChevronDown size={14} strokeWidth={2.5} style={{ transform: sortOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
            </button>
            {sortOpen && (
              <div role="menu" style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 30, minWidth: 180, background: COLORS.cream, border: `1.5px solid ${COLORS.ink}` }}>
                {sortButtons.map((opt, i) => {
                  const active = sortBy === opt.id;
                  return (
                    <button key={opt.id} role="menuitem" onClick={() => { setSortBy(opt.id); setSortOpen(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, border: 'none', padding: '10px 14px', fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer', textAlign: 'left', justifyContent: 'flex-start', background: active ? COLORS.ink : 'transparent', color: active ? COLORS.cream : COLORS.ink, borderTop: i === 0 ? 'none' : `0.5px solid ${COLORS.paper}` }}>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <Link href="/request" style={{ order: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: COLORS.ember, color: COLORS.cream, border: `1.5px solid ${COLORS.ink}`, padding: '0 14px', fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap', overflow: 'hidden', boxShadow: `3px 3px 0 ${COLORS.ink}`, cursor: 'pointer' }}>
            Request a List
          </Link>
        </div>

        {sorted.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gridAutoFlow: 'dense',
              gap: 16,
            }}
          >
            {sorted.map((list, idx) => {
              const isFeatured = featuredIds.has(list.id);
              const related = findRelatedLists(list, lists, 3);
              return (
                <Tile
                  key={list.id}
                  list={list}
                  rank={idx + 1}
                  views={viewCounts[list.id] || 0}
                  voteData={voteData}
                  extras={extras[list.id] || []}
                  onClick={() => openList(list.id)}
                  showConsensus={true}
                  featured={isFeatured}
                  relatedLists={related}
                  onOpenRelated={(id) => openList(id)}
                />
              );
            })}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '48px 24px',
              fontFamily: 'Fraunces, serif',
              fontStyle: 'italic',
              fontSize: 18,
              color: COLORS.faded,
            }}
          >
            No lists match that filter.
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

function Tile({ list, rank, views, voteData, extras, onClick, showConsensus, featured, relatedLists, onOpenRelated }) {
  const [hover, setHover] = useState(false);
  const mode = list.mode || 'both';

  const preview = useMemo(() => {
    const limit = featured ? 10 : 3;
    // For facts-only lists: always show from sources.ai
    if (mode === 'facts' || mode === 'scores' || mode === 'unranked') {
      const items = list.sources?.ai?.items || [];
      return {
        label: 'Top of the list',
        rows: items.slice(0, limit).map((item) => ({ item, score: null })),
      };
    }

    // For votes-only lists: always show from vote.items ranked by votes
    if (mode === 'votes') {
      const base = list.vote?.items || [];
      const allItems = dedupeByName([...base, ...extras]);
      const scored = allItems.map((item, idx) => ({
        item,
        score: voteData[voteKey(list.id, item)] || 0,
        origIdx: idx,
      }));
      scored.sort((a, b) => b.score - a.score || a.origIdx - b.origIdx);
      return {
        label: 'Current ranking by votes',
        rows: scored.slice(0, limit),
      };
    }

    // For 'both' mode lists: show Consensus if requested, else show votes
    if (showConsensus) {
      const sources = getSources(list, voteData, extras);
      const consensusSource = sources.find((s) => s.id === 'consensus');
      if (consensusSource && consensusSource.items.length > 0) {
        return {
          label: 'Current Consensus',
          rows: consensusSource.items.slice(0, limit).map((item) => ({ item, score: null })),
        };
      }
    }

    // Default for 'both' mode or consensus fallback: show votes
    const base = list.vote?.items || [];
    const allItems = dedupeByName([...base, ...extras]);
    const scored = allItems.map((item, idx) => ({
      item,
      score: voteData[voteKey(list.id, item)] || 0,
      origIdx: idx,
    }));
    scored.sort((a, b) => b.score - a.score || a.origIdx - b.origIdx);
    return {
      label: 'Currently topping the votes',
      rows: scored.slice(0, limit),
    };
  }, [list, voteData, extras, mode, showConsensus, featured]);

  // Tiles fill their leftover vertical space with up to 3 related-list sub-boxes,
  // showing as many as actually fit. The boxes live in an absolutely-positioned
  // inner layer so they never feed back into the container height (loop-free).
  // A callback ref binds the ResizeObserver to the REAL mounted node, so the fit
  // recomputes whenever the grid stretches the tile (the prior useRef+useEffect
  // pattern grabbed a stale/null node and never recomputed past the first paint).
  const [relatedFit, setRelatedFit] = useState(0);
  const fitRef = useRef(0);
  const relNodeRef = useRef(null);
  const relRoRef = useRef(null);
  const relCount = relatedLists ? relatedLists.length : 0;
  const computeRelFit = useCallback(() => {
    const node = relNodeRef.current;
    if (!node) return;
    const avail = node.clientHeight;
    const inner = node.firstElementChild;
    const kids = inner ? inner.children : [];
    let used = 16;
    let fit = 0;
    for (let i = 0; i < kids.length; i++) {
      const h = kids[i].offsetHeight || 50;
      const next = used + (fit === 0 ? h : 12 + h);
      if (next <= avail + 1) { used = next; fit += 1; } else break;
    }
    const want = Math.min(fit, relCount, 3);
    if (want !== fitRef.current) { fitRef.current = want; setRelatedFit(want); }
  }, [relCount]);
  // Drive the fit calc on BOTH requestAnimationFrame AND setTimeout. rAF is
  // frozen while a tab is backgrounded (so a tile rendered in a hidden tab would
  // never get its boxes), whereas setTimeout still fires (throttled) and also
  // gives layout a beat to settle. We also recompute when the tab becomes
  // visible again, so a tab loaded in the background fills in on focus.
  const kickRelFit = useCallback(() => {
    if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(computeRelFit);
    setTimeout(computeRelFit, 60);
    setTimeout(computeRelFit, 300);
  }, [computeRelFit]);
  const setRelNode = useCallback((node) => {
    if (relRoRef.current) { relRoRef.current.disconnect(); relRoRef.current = null; }
    relNodeRef.current = node;
    if (node && typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => kickRelFit());
      ro.observe(node);
      relRoRef.current = ro;
    }
    if (node) kickRelFit();
  }, [kickRelFit]);
  useEffect(() => {
    kickRelFit();
    const onVis = () => { if (!document.hidden) kickRelFit(); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [kickRelFit, preview]);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        cursor: 'pointer',
        gridRow: featured ? 'span 2' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        background: hover ? '#e4dbc8' : COLORS.paper,
        color: COLORS.ink,
        border: `1.5px solid ${COLORS.ink}`,
        padding: 20,
        textAlign: 'left',
        transition: 'all 0.2s ease',
        position: 'relative',
        fontFamily: 'inherit',
        transform: hover ? 'translate(-2px, -2px)' : 'none',
        boxShadow: hover ? `3px 3px 0 ${COLORS.ember}` : 'none',
      }}
    >
      {(() => {
        const { leftLabel, rightLabel } = getTileLabels(list);
        const monoStyle = {
          fontFamily: 'DM Mono, monospace',
          fontSize: 10,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          opacity: 0.75,
          whiteSpace: 'nowrap',
          lineHeight: 1,
        };
        return (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 14,
              gap: 8,
              width: '100%',
            }}
          >
            <span
              style={{
                ...monoStyle,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                flexWrap: 'nowrap',
                overflow: 'hidden',
                minWidth: 0,
              }}
            >
              {list.isUserSubmitted && (
                <span
                  style={{
                    background: COLORS.ink,
                    color: COLORS.cream,
                    padding: '2px 6px',
                    fontSize: 8,
                    letterSpacing: '0.15em',
                    fontWeight: 700,
                  }}
                >
                  READER
                </span>
              )}
              {leftLabel}
            </span>
            <span style={{ ...monoStyle, flexShrink: 0 }}>
              {rightLabel}
            </span>
          </div>
        );
      })()}

      <h3
        style={{
          fontFamily: 'Fraunces, serif',
          fontWeight: 700,
          fontSize: 26,
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          margin: '0 0 14px',
          fontVariationSettings: '"SOFT" 100',
        }}
      >
        {list.title}
      </h3>

      {preview.rows.length > 0 && (
        <>
          <div
            style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: 10,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              opacity: 0.6,
              marginBottom: 8,
            }}
          >
            {preview.label}
          </div>
          <ol
            style={{
              margin: 0,
              padding: 0,
              listStyle: 'none',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 14,
            }}
          >
            {preview.rows.map((t, i) => (
              <li
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 0',
                  borderBottom: i < preview.rows.length - 1 ? `1px dashed ${COLORS.faded}` : 'none',
                  opacity: 1,
                }}
              >
                {i < 3 ? (
                  <span
                    style={{
                      position: 'relative',
                      width: 22,
                      height: 22,
                      flex: '0 0 auto',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        background: RANK_MEDALS[i].fill,
                        opacity: hover ? 0.34 : 0.3,
                      }}
                    />
                    <span
                      style={{
                        position: 'relative',
                        fontFamily: 'Fraunces, serif',
                        fontWeight: 600,
                        fontSize: 13,
                        color: RANK_MEDALS[i].num,
                      }}
                    >
                      {i + 1}
                    </span>
                  </span>
                ) : (
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      flex: '0 0 auto',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'Fraunces, serif',
                      fontWeight: 600,
                      fontSize: 13,
                      color: COLORS.faded,
                    }}
                  >
                    {i + 1}
                  </span>
                )}
                <span style={{ flex: 1 }}>{stripItemScore(t.item)}</span>
              </li>
            ))}
          </ol>
        </>
      )}

      {relatedLists && relatedLists.length > 0 && (
        <div ref={setRelNode} style={{ flex: '1 1 0', minHeight: 0, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 16, left: 0, right: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {relatedLists.slice(0, 3).map((rl, idx) => {
              const shown = idx < relatedFit;
              return (
                <div
                  key={rl.id}
                  role="link"
                  tabIndex={shown ? 0 : -1}
                  aria-hidden={shown ? undefined : true}
                  onClick={(e) => { e.stopPropagation(); if (shown && onOpenRelated) onOpenRelated(rl.id); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); if (shown && onOpenRelated) onOpenRelated(rl.id); } }}
                  style={{
                    flex: '0 0 auto',
                    visibility: shown ? 'visible' : 'hidden',
                    pointerEvents: shown ? 'auto' : 'none',
                    background: hover ? '#d9ccb0' : COLORS.paper,
                    border: `1.5px solid ${COLORS.ink}`,
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ flex: '1 1 auto', minWidth: 0, fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 14, lineHeight: 1.15, fontVariationSettings: '"SOFT" 100' }}>{rl.title}</span>
                  <span style={{ flex: '0 0 auto', fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 14 }}>&#8594;</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: 16,
          paddingTop: 12,
          borderTop: `1px solid ${COLORS.ink}`,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: 'DM Mono, monospace',
          fontSize: 11,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        <Eye size={12} strokeWidth={2} />
        <span>{views} visitors</span>
      </div>
    </button>
  );
}

export default function HomeClient() {
  const router = useRouter();
  const [voteData, setVoteData] = useState({});
  const [viewCounts, setViewCounts] = useState({});
  const [trending, setTrending] = useState({});
  const [extras, setExtras] = useState({});
  const [userLists, setUserLists] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchBootstrap().then((data) => {
      if (data) {
        setVoteData(data.votes || {});
        setViewCounts(data.views || {});
        setTrending(data.trending || {});
        setExtras(data.extras || {});
        setUserLists(Array.isArray(data.userLists) ? data.userLists : []);
      }
      setLoaded(true);
    });
  }, []);

  // Count homepage landings in the visitors total, so visitors who bounce
  // without opening a list page are included. Logged under the pseudo
  // list id 'home' in the views table (totalViews sums every row), deduped
  // to once per browser session via sessionStorage.
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem('sot-home-viewed') === '1';
      if (!seen) sessionStorage.setItem('sot-home-viewed', '1');
    } catch (e) {
      // sessionStorage unavailable: fall through and count this load.
    }
    if (!seen) postView('home');
  }, []);

  const allLists = useMemo(() => [...userLists, ...LISTS], [userLists]);

  function openList(id) {
    router.push(`/list/${encodeURIComponent(id)}`);
  }

  function goToSubmit() {
    router.push('/submit');
  }

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
      {!loaded ? (
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Fraunces, serif',
            fontStyle: 'italic',
            fontSize: 18,
            color: COLORS.faded,
          }}
        >
          seeking truths...
        </div>
      ) : (
        <Home
          lists={allLists}
          viewCounts={viewCounts}
          voteData={voteData}
          extras={extras}
          trending={trending}
          openList={openList}
          onSubmit={goToSubmit}
        />
      )}
    </div>
  );
}
