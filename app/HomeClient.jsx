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
  Globe,
  Trophy,
  Plane,
  FerrisWheel,
  Trees,
  Car,
  BookOpen,
  Youtube,
  Instagram,
  GraduationCap,
  Drama,
  Gamepad2,
  Music,
  Clapperboard,
  Sparkles,
} from 'lucide-react';
import { LISTS, TYPES, COLORS } from '@/lib/data';
import { voteKey, dedupeByName, getSources, stripItemScore } from '@/lib/helpers';
import { useSampledBg } from '@/lib/useSampledBg';
import { fetchBootstrap, postView } from '@/lib/api';
import Grain from './Grain';
import Footer from './Footer';
import Count from './Count';
import SourcesPopover from './SourcesPopover';
import { HERO_IMAGES } from '@/lib/hero-images';
import { QUIZZES } from '@/lib/quizzes';
import { quizDept as quizDeptOf, quizIcon as quizIconOf, DEPT_COLOR as QUIZ_DEPT_COLOR } from '@/lib/quiz-departments';

// ── HOMEPAGE V2 (June 2026 redesign) ────────────────────────────────────────
// Flip this single flag to false to restore the previous homepage exactly —
// no other change needed (SourcesPopover's `emphasis` prop is also driven by
// it). V2 adds: photo headers on tiles whose consensus top 3 has a hero image
// (from lib/hero-images.js), a sticky ink department-nav bar that replaces the
// Category dropdown (with By City / By Topic panels), and a bold ember
// emphasis on the sources count in the header blurb.
const HOME_V2 = true;

// ── Homepage quiz tiles ──────────────────────────────────────────────────────
// A quiz tile is woven into the list grid at most once every ~5 rows (see the
// interleave logic in Home). Only "factual" quizzes (no paired list, i.e. no
// `listId`) are eligible, since list-backed quizzes already surface through
// their own list tile. quizDeptOf / quizIconOf / QUIZ_DEPT_COLOR MIRROR
// app/quizzes/QuizHomeClient.jsx (deptOf / iconOf / DEPT_COLOR) so the homepage
// tile matches the quizzes-page tile -- keep the two in sync.
const FACTUAL_QUIZZES = (Array.isArray(QUIZZES) ? QUIZZES : []).filter((q) => !q.listId);
// Homepage quiz tiles only surface quizzes that have been completed at least
// this many times (repeats across slots are allowed, since the render loop
// cycles the pool). Once no quiz clears the bar the gate falls back to the
// full factual pool so the tiles never vanish.
const QUIZ_TILE_MIN_PLAYS = 5;


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
  { id: 'bars-nightlife', label: 'Drinking', any: ['bars', 'nightlife', 'drinks'] },
  { id: 'travel', label: 'Travel', any: ['travel', 'luxury'] },
  { id: 'shops', label: 'Products', any: ['product', 'tech'] },
  { id: 'entertainment', label: 'Entertainment', any: ['entertainment'] },
  { id: 'misc', label: 'Miscellaneous', any: ['other'] },
];
const CAT_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

// Filter-chip color coding — each broad category and each By Topic chip is
// tinted with a parent color so the connection between the top row and the
// topic row is visible at a glance. Cities and regions stay uncolored (they
// cut across categories). Inactive chips get a soft tinted background + a
// colored border; the active chip flips to the solid parent color with cream
// text. The five new tones extend the existing palette (ember, rust, forest,
// faded) with slate (Products) and plum (Entertainment).
const PARENT_COLORS = {
  restaurants: '#c0392b',      // ember — Eating
  'bars-nightlife': '#a44a26', // rust — Drinking
  travel: '#3d4f2b',           // forest — Hotels & Travel
  shops: '#3a5670',            // slate — Products
  entertainment: '#6b3a5a',    // plum — Entertainment
  misc: '#7a6f5e',             // faded — Miscellaneous
};
// Precomputed 12% parent tint over cream (#f4ede0). Inlined as hex so we
// don't depend on color-mix browser support.
const PARENT_TINTS = {
  restaurants: '#eed7ca',
  'bars-nightlife': '#ead9ca',
  travel: '#dedaca',
  shops: '#dddbd2',
  entertainment: '#e3d7d0',
  misc: '#e5ded0',
};
// Topic chip → parent category. Chains & Groceries lives under Eating since
// the bulk of its hits (TJ's, Spindrift, snacks, seltzer, grocery) are food.
const TOPIC_PARENT = {
  'topic-pizza': 'restaurants',
  'topic-burgers': 'restaurants',
  'topic-tacos': 'restaurants',
  'topic-bbq': 'restaurants',
  'topic-sushi': 'restaurants',
  'topic-breakfast': 'restaurants',
  'topic-dive-bars': 'bars-nightlife',
  'topic-cocktails': 'bars-nightlife',
  'topic-beer': 'bars-nightlife',
  'topic-spirits': 'bars-nightlife',
  'topic-hotels': 'travel',
  'topic-beaches': 'travel',
  'topic-movies': 'entertainment',
  'topic-tv': 'entertainment',
  'topic-books': 'entertainment',
  'topic-music': 'entertainment',
  'topic-sports': 'entertainment',
  'topic-tech': 'shops',
  'topic-kitchen-home': 'shops',
  'topic-chains': 'restaurants',
};
function parentIdFor(filterId) {
  if (TOPIC_PARENT[filterId]) return TOPIC_PARENT[filterId];
  if (PARENT_COLORS[filterId]) return filterId;
  return null;
}

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
  // One-shot restore payload, written when the user opens a list (see saveScroll).
  // Lets Back return to the same Discover order, filters, search, and scroll spot.
  const restoreRef = useRef(null);
  if (restoreRef.current === null) {
    restoreRef.current = (() => {
      try {
        const raw = typeof window !== 'undefined' && sessionStorage.getItem('sot-home-restore');
        return raw ? JSON.parse(raw) : false;
      } catch (e) { return false; }
    })();
  }
  const restore = restoreRef.current || null;

  const [query, setQuery] = useState(restore?.query || '');
  const [typeFilter, setTypeFilter] = useState(restore?.typeFilter || 'all');
  const [catOpen, setCatOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  // V2 department-nav dropdown panel: null | 'city' | 'topic'
  const [navMenu, setNavMenu] = useState(null);
  // Horizontal-scroll affordance for the department nav ribbon: tracks whether
  // there is more content to scroll to the left / right, so we can show a small
  // arrow indicator (mobile users otherwise can't tell the ribbon scrolls).
  const deptNavRef = useRef(null);
  const [navScroll, setNavScroll] = useState({ left: false, right: false });
  useEffect(() => {
    const el = deptNavRef.current;
    if (!el) return undefined;
    const update = () => {
      const more = el.scrollWidth - el.clientWidth;
      setNavScroll({
        left: el.scrollLeft > 2,
        right: more > 2 && el.scrollLeft < more - 2,
      });
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
    // typeFilter changes the set of nav buttons, so re-measure when it does.
  }, [typeFilter, navMenu]);
  // Default sort is the shuffled "Discover" view.
  const [sortBy, setSortBy] = useState(restore?.sortBy || 'discover');

  // Fresh seed per page load — captured once on mount. Stays stable while
  // the user interacts with the page (so the order doesn't reshuffle
  // when typing in search), but a reload picks a new seed and a new
  // order.
  const [discoverSeed] = useState(
    () => (restore && typeof restore.seed === 'number')
      ? (restore.seed >>> 0)
      : (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0
  );

  // Featured quiz (V2): a single quiz spotlighted at the end of the stats row,
  // linking to /quiz/<id>. A fresh one is picked at random on every page load
  // (client-side, in an effect, so it never causes a hydration mismatch).
  const [featuredQuiz, setFeaturedQuiz] = useState(null);
  useEffect(() => {
    if (!HOME_V2 || !Array.isArray(QUIZZES) || QUIZZES.length === 0) return;
    setFeaturedQuiz(QUIZZES[Math.floor(Math.random() * QUIZZES.length)]);
  }, []);

  // Per-quiz completed-game counts (from /api/quiz/totals). Used to gate the
  // interleaved homepage quiz tiles to quizzes that have been played at least
  // QUIZ_TILE_MIN_PLAYS times (see shuffledQuizzes). Empty until the fetch
  // resolves, which simply means the gate is inactive on first paint.
  const [quizPlays, setQuizPlays] = useState({});
  const [quizLeaders, setQuizLeaders] = useState({});
  useEffect(() => {
    let alive = true;
    fetch('/api/quiz/totals')
      .then((r) => r.json())
      .then((d) => { if (alive && d && !d.error) { setQuizPlays(d.byQuiz || {}); setQuizLeaders(d.leaders || {}); } })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  // Recompute shuffle order when the lists collection or seed changes.
  const discoverOrder = useMemo(() => {
    return seededShuffle(lists, discoverSeed);
  }, [lists, discoverSeed]);

  // Save the current view + scroll position before navigating to a list, so
  // Back can restore the exact spot (Home otherwise remounts with a new seed).
  const saveScroll = useCallback(() => {
    try {
      sessionStorage.setItem('sot-home-restore', JSON.stringify({
        seed: discoverSeed, sortBy, typeFilter, query,
        scrollY: window.scrollY || window.pageYOffset || 0,
      }));
    } catch (e) {}
  }, [discoverSeed, sortBy, typeFilter, query]);

  // If we mounted with a restore payload (a Back navigation), pin the viewport to
  // the saved offset until the layout settles. A single jump drifts because the
  // page keeps reflowing after first paint (web-font swap, related-list sub-boxes
  // filling in), so we re-apply on every animation frame until the document height
  // has been stable for a moment, then stop. We bail the instant the user scrolls
  // or keys so we never fight them, and cap the whole thing with a hard budget.
  useEffect(() => {
    try { sessionStorage.removeItem('sot-home-restore'); } catch (e) {}
    if (!restore || typeof restore.scrollY !== 'number' || restore.scrollY <= 0) return undefined;
    if (typeof window === 'undefined' || typeof requestAnimationFrame === 'undefined') return undefined;
    const targetY = restore.scrollY;
    const HARD_BUDGET = 4000; // ms — give up if the page never settles
    const STABLE_MS = 350;    // height unchanged this long === settled
    let cancelled = false;
    let raf = 0;
    let lastH = -1;
    let stableSince = 0;
    const start = performance.now();
    const onUser = () => stop();
    function detach() {
      window.removeEventListener('wheel', onUser);
      window.removeEventListener('touchmove', onUser);
      window.removeEventListener('keydown', onUser);
    }
    function stop() {
      if (cancelled) return;
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      detach();
    }
    const tick = (now) => {
      if (cancelled) return;
      const h = document.documentElement.scrollHeight;
      if (h !== lastH) { lastH = h; stableSince = now; }
      if (Math.abs(window.scrollY - targetY) > 1) window.scrollTo(0, targetY);
      const settled = (now - stableSince) >= STABLE_MS && Math.abs(window.scrollY - targetY) <= 1;
      if (settled || (now - start) >= HARD_BUDGET) { stop(); return; }
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener('wheel', onUser, { passive: true });
    window.addEventListener('touchmove', onUser, { passive: true });
    window.addEventListener('keydown', onUser);
    // Re-baseline the stability window once web fonts finish (they reflow text).
    if (document.fonts && document.fonts.ready && typeof document.fonts.ready.then === 'function') {
      document.fonts.ready.then(() => { if (!cancelled) { lastH = -1; } });
    }
    raf = requestAnimationFrame(tick);
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close the category / sort dropdowns when clicking anywhere outside.
  useEffect(() => {
    if (!catOpen && !sortOpen && !navMenu) return undefined;
    const close = () => {
      setCatOpen(false);
      setSortOpen(false);
      setNavMenu(null);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [catOpen, sortOpen, navMenu]);

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

  // Mark some lists as "featured": double-height tiles that preview the full
  // top 10 instead of the top 3. A cooldown of 5 guarantees at least 5 lists
  // between featured tiles, which keeps at most one featured tile per row for any
  // layout up to 5 columns. The selection is SEEDED from discoverSeed (xorshift32,
  // same family as seededShuffle) — never Math.random() — so the double/single
  // tile pattern is identical on a Back navigation (the seed is restored). With
  // raw Math.random() the featured set re-rolled on every remount, so tiles
  // flipped between double and single height, the page reflowed, and the restored
  // scrollY landed on different content. Re-derives whenever the seed or sorted
  // set changes.
  const featuredIds = useMemo(() => {
    const set = new Set();
    let s = ((discoverSeed >>> 0) ^ 0x9e3779b9) >>> 0 || 1;
    const rand = () => {
      s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
      return (s >>> 0) / 0x100000000;
    };
    let cooldown = 0;
    for (let i = 0; i < sorted.length; i++) {
      if (cooldown > 0) { cooldown--; continue; }
      if (rand() < 0.5) { set.add(sorted[i].id); cooldown = 5; }
    }
    return set;
  }, [sorted, discoverSeed]);

  // ── Interleaved quiz tiles ────────────────────────────────────────────────
  // Weave a factual (list-less) quiz tile into the grid at most once every ~5
  // rows. "Rows" depend on the live column count of the responsive auto-fill
  // grid, so measure it (ResizeObserver) rather than guessing. gridCols starts
  // at 0 (server + first client render), so no quiz tile is emitted until after
  // mount, keeping SSR and hydration identical. Each slot shows a DIFFERENT
  // factual quiz; the pool is shuffled with a seed derived from discoverSeed, so
  // picks are random per fresh load but stable across a Back navigation.
  const gridRef = useRef(null);
  const [gridCols, setGridCols] = useState(0);
  useEffect(() => {
    const el = gridRef.current;
    if (!el) { setGridCols(0); return; }
    const measure = () => {
      const tracks = getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length;
      setGridCols(tracks || 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [sorted.length]);

  const shuffledQuizzes = useMemo(() => {
    // Gate to quizzes with >= QUIZ_TILE_MIN_PLAYS completed games; fall back to
    // the full factual pool only when none qualify yet (including before the
    // play-count fetch resolves).
    const eligible = FACTUAL_QUIZZES.filter((q) => (quizPlays[q.id] || 0) >= QUIZ_TILE_MIN_PLAYS);
    const arr = (eligible.length ? eligible : FACTUAL_QUIZZES).slice();
    let s = ((discoverSeed >>> 0) ^ 0x85ebca6b) >>> 0 || 1;
    const rand = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 0x100000000; };
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [discoverSeed, quizPlays]);

  const totalViews = Object.values(viewCounts).reduce((a, b) => a + b, 0);

  // Total sources shown in the header: every named (non-'ai') source across
  // every list. Native voting removed (2026-06-18), so the crowd signal now
  // comes through aggregator sources (Yelp/Google) counted here.
  const totalSources = useMemo(() => {
    let total = 0;
    lists.forEach((list) => {
      const src = list.sources || {};
      total += Object.keys(src).filter((sid) => sid !== 'ai').length;
    });
    return total;
  }, [lists]);

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
          padding: '48px 16px 18px',
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
            {HOME_V2 ? (
              <>
                <span style={{ fontStyle: 'italic', fontWeight: 400, color: COLORS.ember }}>of</span> Truths
              </>
            ) : (
              'of Truths'
            )}
          </h1>
          <div className="cg-head-col">
            <div className="cg-tagline">
              For all the important aspects of life
            </div>
            <div className="cg-blurb">
              The consensus of expert critics and everyday users, weighed across{' '}<SourcesPopover emphasis={HOME_V2} />, from Michelin, Condé Nast Traveler, The Infatuation, Eater, and Robb Report to Wirecutter, Goodreads, and Dave Portnoy.
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
          .cg-tape{flex:1 1 auto;min-width:0;overflow:hidden;margin-left:8px;text-overflow:ellipsis;text-align:center;}
          .cg-feat{color:${COLORS.ember};text-decoration:none;white-space:nowrap;}
          .cg-feat .cg-feat-label{color:${COLORS.faded};}
          .cg-feat:hover .cg-feat-title{text-decoration:underline;}
          @media(max-width:760px){.cg-tape{display:none;}}
          @media(max-width:560px){.cg-stats{gap:10px;font-size:clamp(8px,2.7vw,11px);letter-spacing:0.06em;}}
        `}</style>
        <div className="cg-stats">
          <span>{lists.length} lists</span>
          <span><span aria-hidden="true" className="cg-dot">·</span> <Count value={totalSources} /> sources</span>
          <span><span aria-hidden="true" className="cg-dot">·</span> <Count value={totalViews} /> visitors</span>
          {HOME_V2 && featuredQuiz && (
            <span className="cg-tape">
              <Link className="cg-feat" href={`/quiz/${featuredQuiz.id}`}>
                <span className="cg-feat-label">Featured Quiz: </span>
                <span className="cg-feat-title">{featuredQuiz.title}</span>
              </Link>
            </span>
          )}
        </div>
      </header>

      {HOME_V2 && (() => {
        // ── V2 department nav (sticky ink bar) ──────────────────────────────
        // Replaces the Category dropdown: broad categories inline, with the
        // city/region and topic chips of the old mega-menu under two panels.
        const navBtn = (key, label, active, color, onClick) => (
          <button
            key={key}
            onClick={onClick}
            style={{
              flex: '1 0 auto',
              background: active ? color : 'transparent',
              color: COLORS.cream,
              border: 'none',
              borderRight: '1px solid rgba(244,237,224,0.18)',
              height: 42,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 18px',
              fontFamily: 'DM Mono, monospace',
              fontSize: 10.5,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </button>
        );
        const chip = (f) => {
          const active = typeFilter === f.id;
          const parentId = parentIdFor(f.id);
          const parentColor = parentId ? PARENT_COLORS[parentId] : null;
          const parentTint = parentId ? PARENT_TINTS[parentId] : null;
          const count = f.count != null ? f.count : (counts[f.id] || 0);
          return (
            <button
              key={f.id}
              onClick={() => { setTypeFilter(f.id); setNavMenu(null); }}
              style={{
                display: 'inline-flex',
                alignItems: 'baseline',
                gap: 6,
                border: `1px solid ${parentColor || COLORS.ink}`,
                padding: '7px 10px',
                fontFamily: 'DM Mono, monospace',
                fontSize: 9,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                fontWeight: 600,
                cursor: 'pointer',
                background: active ? (parentColor || COLORS.ink) : (parentTint || COLORS.paper),
                color: active ? COLORS.cream : COLORS.ink,
                whiteSpace: 'nowrap',
              }}
            >
              <span>{f.label}</span>
              <span style={{ opacity: active ? 0.75 : 0.55 }}>{count}</span>
            </button>
          );
        };
        const heading = (text) => (
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, color: COLORS.faded, margin: '14px 0 8px' }}>
            {text}
          </div>
        );
        const cityActive = typeFilter.startsWith('city-') || typeFilter.startsWith('region-');
        const topicActive = typeFilter.startsWith('topic-');
        return (
          <nav
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'sticky', top: 0, zIndex: 25, background: COLORS.cream }}
          >
            <style>{`.sot-deptnav{scrollbar-width:none;-ms-overflow-style:none;}.sot-deptnav::-webkit-scrollbar{display:none;}
              @keyframes sotNavNudge{0%,100%{transform:translate(0,-50%);}50%{transform:translate(3px,-50%);}}
              @keyframes sotNavNudgeL{0%,100%{transform:translate(0,-50%);}50%{transform:translate(-3px,-50%);}}
              .sot-navcue{position:absolute;top:50%;z-index:2;display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:${COLORS.ember};color:${COLORS.cream};box-shadow:0 1px 4px rgba(26,22,17,0.45);pointer-events:none;font-size:15px;line-height:1;}
              .sot-navcue-r{right:18px;animation:sotNavNudge 1.4s ease-in-out infinite;}
              .sot-navcue-l{left:18px;animation:sotNavNudgeL 1.4s ease-in-out infinite;}
              @media(min-width:760px){.sot-navcue{display:none;}}
            `}</style>
            {/* Replicate the page's Grain overlay inside the sticky bar so its
                cream matches the grain-textured background around it. */}
            <svg aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.12, mixBlendMode: 'multiply' }}>
              <filter id="sot-nav-grain">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
                <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0" />
              </filter>
              <rect width="100%" height="100%" filter="url(#sot-nav-grain)" />
            </svg>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', position: 'relative' }}>
            <div ref={deptNavRef} className="sot-deptnav" style={{ display: 'flex', alignItems: 'stretch', overflowX: 'auto', background: COLORS.ink, borderBottom: `3px solid ${COLORS.ember}` }}>
              {visibleTypes.map((t) =>
                navBtn(
                  t.id,
                  t.label,
                  typeFilter === t.id,
                  t.id === 'all' ? COLORS.ember : (PARENT_COLORS[t.id] || COLORS.faded),
                  () => { setTypeFilter(t.id); setNavMenu(null); }
                )
              )}
              {cityFilters.length > 0 && navBtn('by-city', `By City ${navMenu === 'city' ? '▴' : '▾'}`, cityActive, COLORS.faded, () => setNavMenu((m) => (m === 'city' ? null : 'city')))}
              {visibleTopics.length > 0 && navBtn('by-topic', `By Topic ${navMenu === 'topic' ? '▴' : '▾'}`, topicActive, COLORS.faded, () => setNavMenu((m) => (m === 'topic' ? null : 'topic')))}
            </div>
            {navScroll.left && <span aria-hidden="true" className="sot-navcue sot-navcue-l">&#8249;</span>}
            {navScroll.right && <span aria-hidden="true" className="sot-navcue sot-navcue-r">&#8250;</span>}
            {navMenu && (
              <div style={{ position: 'absolute', top: '100%', left: 16, right: 16, zIndex: 30, background: COLORS.cream, border: `1.5px solid ${COLORS.ink}`, borderTop: 'none', boxShadow: '0 10px 24px rgba(26,22,17,0.25)', maxHeight: '60vh', overflowY: 'auto' }}>
                <div style={{ padding: '14px 24px 18px' }}>
                  {navMenu === 'city' ? (
                    <>
                      {heading('By City')}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{cityFilters.map(chip)}</div>
                      {visibleRegions.length > 0 && (
                        <>
                          {heading('By Region')}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{visibleRegions.map(chip)}</div>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {heading('By Topic')}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{visibleTopics.map(chip)}</div>
                    </>
                  )}
                </div>
              </div>
            )}
            </div>
          </nav>
        );
      })()}

      <section style={{ padding: '10px 16px 80px', maxWidth: 1200, margin: '0 auto' }}>
        <style>{`.cg-controls{display:grid;grid-template-columns:repeat(${HOME_V2 ? 3 : 4},1fr);gap:16px;margin-bottom:16px;}.cg-controls>*{height:${HOME_V2 ? 42 : 50}px;min-width:0;}.cg-ctrl-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;}@media(max-width:760px){.cg-controls{grid-template-columns:1fr 1fr;}${HOME_V2 ? '.cg-c-search{grid-column:1 / -1;}.cg-c-sort{grid-column:1 / -1;}.cg-c-actions{grid-column:1 / -1;}' : ''}.cg-c-search input{font-size:16px !important;}.cg-ctrl-btn{justify-content:space-between !important;letter-spacing:0.05em !important;padding:0 10px !important;gap:6px !important;}}@media(max-width:760px){.cg-sort-btn{justify-content:center !important;padding:0 30px !important;}}`}</style>
        <div className="cg-controls">
          <div className="cg-c-search" style={{ position: 'relative', minWidth: 0, order: HOME_V2 ? 1 : 3 }}>
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

          {!HOME_V2 && (
          <div style={{ position: 'relative', minWidth: 0, order: 2 }} onClick={(e) => e.stopPropagation()}>
            <button className="cg-ctrl-btn" onClick={() => { setCatOpen((o) => !o); setSortOpen(false); }} aria-haspopup="true" aria-expanded={catOpen} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#bdb3a0', color: COLORS.ink, border: `1.5px solid ${COLORS.ink}`, padding: '0 14px', fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              <span className="cg-ctrl-label"><span style={{ opacity: 0.8 }}>Category:</span> {activeFilterLabel}</span>
              <ChevronDown size={14} strokeWidth={2.5} style={{ transform: catOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
            </button>
            {catOpen && (() => {
              const pick = (id) => { setTypeFilter(id); setCatOpen(false); };
              const chip = (f, big) => {
                const active = typeFilter === f.id;
                const count = f.count != null ? f.count : (counts[f.id] || 0);
                const parentId = parentIdFor(f.id);
                const parentColor = parentId ? PARENT_COLORS[parentId] : null;
                const parentTint = parentId ? PARENT_TINTS[parentId] : null;
                return (
                  <button
                    key={f.id}
                    role="menuitem"
                    onClick={() => pick(f.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'baseline',
                      gap: 6,
                      border: `1px solid ${parentColor || COLORS.ink}`,
                      padding: big ? '9px 12px' : '7px 10px',
                      fontFamily: 'DM Mono, monospace',
                      fontSize: big ? 10 : 9,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: active
                        ? (parentColor || '#bdb3a0')
                        : (parentTint || COLORS.paper),
                      color: active && parentColor ? COLORS.cream : COLORS.ink,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span>{f.label}</span>
                    {f.id !== 'all' && <span style={{ opacity: active && parentColor ? 0.75 : 0.55 }}>{count}</span>}
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
          )}

          <div className="cg-c-sort" style={{ position: 'relative', minWidth: 0, order: HOME_V2 ? 2 : 1 }} onClick={(e) => e.stopPropagation()}>
            <button className="cg-ctrl-btn cg-sort-btn" onClick={() => { setSortOpen((o) => !o); setCatOpen(false); }} aria-haspopup="true" aria-expanded={sortOpen} style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: COLORS.ink, color: COLORS.cream, border: `1.5px solid ${COLORS.ink}`, padding: '0 34px', fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              <span className="cg-ctrl-label"><span style={{ opacity: 0.8 }}>Sort:</span> {(sortButtons.find((o) => o.id === sortBy) || {}).short || 'Discover'}</span>
              <ChevronDown size={14} strokeWidth={2.5} style={{ position: 'absolute', right: 14, top: '50%', transform: sortOpen ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)', transition: 'transform 0.15s' }} />
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

          <div className="cg-c-actions" style={{ order: HOME_V2 ? 3 : 4, display: 'flex', gap: 8, minWidth: 0 }}>
            <Link href="/request" style={{ flex: 1, minWidth: 0, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: COLORS.ember, color: COLORS.cream, border: `1.5px solid ${COLORS.ink}`, padding: '0 8px', fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap', overflow: 'hidden', boxShadow: `3px 3px 0 ${COLORS.ink}`, cursor: 'pointer' }}>
              Request a List
            </Link>
            <Link href="/quizzes" style={{ flex: 1, minWidth: 0, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: COLORS.ink, color: COLORS.cream, border: `1.5px solid ${COLORS.ink}`, padding: '0 8px', fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap', overflow: 'hidden', boxShadow: `3px 3px 0 ${COLORS.ink}`, cursor: 'pointer' }}>
              Quizzes
            </Link>
          </div>
        </div>

        {sorted.length > 0 ? (
          <div
            ref={gridRef}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gridAutoFlow: 'dense',
              gap: 16,
            }}
          >
            {(() => {
              // Quiz-tile spacing is viewport-aware. On desktop (multi-column) a quiz
              // tile lands after every 3.5 rows' worth of tiles (gridCols * 3.5,
              // rounded). On mobile the grid collapses to a single column, where that
              // rule would place one every ~4 tiles, so fall back to a fixed ~7-tile
              // gap. Off until mounted (gridCols > 0) and a factual quiz exists.
              const gap = gridCols > 0 ? (gridCols > 1 ? Math.round(gridCols * 3.5) : 7) : 0;
              const cells = [];
              let quizIdx = 0;
              sorted.forEach((list, idx) => {
                const isFeatured = featuredIds.has(list.id);
                const related = findRelatedLists(list, lists, 6);
                cells.push(
                  <Tile
                    key={list.id}
                    list={list}
                    rank={idx + 1}
                    views={viewCounts[list.id] || 0}
                    voteData={voteData}
                    extras={extras[list.id] || []}
                    onClick={() => { saveScroll(); openList(list.id); }}
                    showConsensus={true}
                    featured={isFeatured}
                    relatedLists={related}
                    onOpenRelated={(id) => { saveScroll(); openList(id); }}
                  />
                );
                if (gap > 0 && shuffledQuizzes.length > 0 && (idx + 1) % gap === 0 && idx + 1 < sorted.length) {
                  const quiz = shuffledQuizzes[quizIdx % shuffledQuizzes.length];
                  quizIdx += 1;
                  cells.push(<QuizTile key={`quiz-${quiz.id}-${idx}`} quiz={quiz} leader={quizLeaders[quiz.id]} />);
                }
              });
              return cells;
            })()}
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

// A single quiz tile woven into the homepage grid. A category-tinted top band
// fills the hero-image area (QUIZ badge + medallion icon + the dynamic answer
// count), so the title below lines up with neighbouring list-tile titles and is
// sized to match them; the play affordance sits at the foot. Links to /quiz/<id>.
function QuizTile({ quiz, leader }) {
  const [hover, setHover] = useState(false);
  const Icon = quizIconOf(quiz);
  const accent = QUIZ_DEPT_COLOR[quizDeptOf(quiz)] || QUIZ_DEPT_COLOR.misc;
  const heading = (quiz.title || '').replace(/^Name (the )?/, '');
  return (
    <Link
      href={`/quiz/${quiz.id}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ cursor: 'pointer', textDecoration: 'none', display: 'flex', flexDirection: 'column', background: hover ? '#e4dbc8' : COLORS.paper, color: COLORS.ink, border: `1.5px solid ${COLORS.ink}`, overflow: 'hidden', transition: 'all 0.2s ease', transform: hover ? 'translate(-2px, -2px)' : 'none', boxShadow: hover ? `3px 3px 0 ${accent.c}` : 'none' }}
    >
      <div style={{ flex: '0 0 auto', height: 150, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16, padding: '0 18px', background: accent.t, borderBottom: `1.5px solid ${COLORS.ink}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ flex: 'none', fontFamily: 'DM Mono, monospace', fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: COLORS.cream, background: accent.c, padding: '5px 10px' }}>Quiz</span>
          <span style={{ flex: 'none', width: 46, height: 46, borderRadius: '50%', background: COLORS.cream, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={23} strokeWidth={2} aria-hidden="true" style={{ color: accent.c }} /></span>
        </div>
      </div>
      <div style={{ padding: '16px 18px 18px', flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 26, lineHeight: 1.05, letterSpacing: '-0.02em', margin: '0 0 12px', fontVariationSettings: '"SOFT" 100', color: COLORS.ink }}>{heading}</h3>
        {quiz.blurb && (<p style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 14.5, lineHeight: 1.5, color: COLORS.faded, margin: 0 }}>{quiz.blurb}</p>)}
        <span style={{ marginTop: 'auto', paddingTop: 16, display: 'flex', alignItems: 'baseline', gap: 6, minWidth: 0, fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600, color: accent.c }}>
          <span style={{ flex: 'none' }}>Current Leader:</span>
          <span style={{ flex: '1 1 auto', minWidth: 0, fontWeight: 700, color: leader ? COLORS.ink : COLORS.faded, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{leader || 'Empty'}</span>
        </span>
        <div style={{ paddingTop: 10, fontFamily: 'DM Mono, monospace', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, color: accent.c }}>▶ Play</div>
      </div>
    </Link>
  );
}
export function Tile({ list, rank, views, voteData, extras, onClick, href, showConsensus, featured, relatedLists, onOpenRelated }) {
  const [hover, setHover] = useState(false);
  const mode = list.mode || 'both';
  // Total contributing sources for this list: every entry in list.sources
  // except the legacy `ai` seed (the real publications/rating sources), plus
  // the Source of Truths user vote on lists that have voting. Floored at 1 so
  // objective `facts` lists (no editorial sources, no vote) still read "Sources: 1".
  const sourceCount = (() => {
    const pubs = Object.keys(list.sources || {}).filter((id) => id !== 'ai').length;
    return Math.max(1, pubs);
  })();

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

  // V2 photo header: first consensus top-3 item with a hero image in
  // lib/hero-images.js gets a cover-cropped photo band atop the tile, with a
  // gold "#N name" caption. Product lists stay text-only (white-background
  // product shots crop badly), as do legacy non-https local-path entries.
  // Lists with heroFit:'contain' render uncropped on a paper background.
  const heroPhoto = useMemo(() => {
    if (!HOME_V2) return null;
    const map = HERO_IMAGES[list.id];
    if (!map) return null;
    // Products and heroFit:'contain' lists render uncropped on paper.
    const contain = isProductList(list) || list.heroFit === 'contain';
    const urlOf = (entry) => {
      const src = entry && (typeof entry === 'string' ? entry : entry.src);
      return src && /^https?:/.test(src) ? src : null;
    };
    const rows = preview.rows.slice(0, 3);
    for (let i = 0; i < rows.length; i++) {
      const src = urlOf(map[rows[i].item]);
      if (src) return { src, rank: i + 1, name: stripItemScore(rows[i].item), contain };
    }
    // Fallback so more tiles carry a photo: any hero stored for this list
    // (covers consensus drift and renamed items). No rank in the caption.
    for (const name of Object.keys(map)) {
      const src = urlOf(map[name]);
      if (src) return { src, rank: null, name: stripItemScore(name), contain };
    }
    return null;
  }, [list, preview]);

  // Auto-match the contain-fit hero pad to the photo's own background
  // (white product shot -> white, tinted shot -> that tint).
  const heroBg = useSampledBg(
    heroPhoto && heroPhoto.contain ? heroPhoto.src : null,
    !!(heroPhoto && heroPhoto.contain),
  );

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
    const want = Math.min(fit, relCount, 6);
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

  // Renders as an <a> when `href` is provided (crawlable internal link, used
  // by the list pages' More-like-this grid); otherwise the original button.
  const RootEl = href ? 'a' : 'button';
  return (
    <RootEl
      href={href}
      onClick={href ? (e) => { e.preventDefault(); if (onClick) onClick(); } : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        cursor: 'pointer',
        textDecoration: 'none',
        gridRow: featured ? 'span 2' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        background: hover ? '#e4dbc8' : COLORS.paper,
        color: COLORS.ink,
        border: `1.5px solid ${COLORS.ink}`,
        padding: HOME_V2 ? 0 : 20,
        overflow: HOME_V2 ? 'hidden' : 'visible',
        textAlign: 'left',
        transition: 'all 0.2s ease',
        position: 'relative',
        fontFamily: 'inherit',
        transform: hover ? 'translate(-2px, -2px)' : 'none',
        boxShadow: hover ? `3px 3px 0 ${COLORS.ember}` : 'none',
      }}
    >
      {HOME_V2 && heroPhoto && (
        <div
          style={{
            position: 'relative',
            height: 150,
            flex: '0 0 auto',
            alignSelf: 'stretch',
            borderBottom: `1.5px solid ${COLORS.ink}`,
            backgroundImage: `url("${heroPhoto.src}")`,
            backgroundSize: heroPhoto.contain ? 'contain' : 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundColor: heroPhoto.contain ? (heroBg || '#ffffff') : COLORS.paper,
            transition: 'background-color 0.2s ease',
          }}
        >
          {!heroPhoto.contain && (
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(18,14,10,0.55), rgba(18,14,10,0) 55%)' }} />
          )}
          <span style={{ position: 'absolute', left: heroPhoto.contain ? 8 : 12, bottom: 8, maxWidth: 'calc(100% - 16px)', color: '#fff', fontSize: 12, fontFamily: 'DM Mono, monospace', letterSpacing: '0.06em', textShadow: '0 1px 5px rgba(0,0,0,0.9)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', background: heroPhoto.contain ? 'rgba(26,22,17,0.78)' : 'transparent', padding: heroPhoto.contain ? '3px 8px' : 0 }}>
            {heroPhoto.rank != null ? (
              <span style={{ color: '#e7cf73', fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 14 }}>#{heroPhoto.rank}</span>
            ) : (
              heroPhoto.name
            )}
          </span>
        </div>
      )}
      <div style={HOME_V2 ? { padding: '16px 18px 14px', display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0, alignSelf: 'stretch' } : { display: 'contents' }}>
      {(() => {
        // V2: drop the category/type corner labels; keep only the READER badge.
        if (HOME_V2 && !list.isUserSubmitted) return null;
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
              {!HOME_V2 && leftLabel}
            </span>
            {!HOME_V2 && (
            <span style={{ ...monoStyle, flexShrink: 0 }}>
              {rightLabel}
            </span>
            )}
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
            {relatedLists.slice(0, 6).map((rl, idx) => {
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
          justifyContent: 'space-between',
          gap: 8,
          fontFamily: 'DM Mono, monospace',
          fontSize: 10,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          opacity: 0.85,
        }}
      >
        {sourceCount > 0 && (
          <span style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
            Sources: {sourceCount}
          </span>
        )}
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <Eye size={12} strokeWidth={2} />
          <span><Count value={views} /> visitors</span>
        </span>
      </div>
      </div>
    </RootEl>
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
        // 'clip' still clips the grain overlay but, unlike 'hidden', does not
        // create a scroll container, so the V2 sticky department nav works.
        overflow: HOME_V2 ? 'clip' : 'hidden',
      }}
    >
      <Grain />
      {!loaded ? (
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            minHeight: '100vh',
            overflowY: 'auto',
            background: '#f4ede0',
            color: '#2b2b2b',
          }}
        >
          {/* Branded loading splash (what a human briefly sees while the app
              boots) followed by a crawlable index of every list (what search
              engines read from the server HTML). React owns this entire tree,
              so it swaps to <Home> cleanly with no manual DOM removal. */}
          <div
            style={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '24px',
            }}
          >
            <p
              style={{
                fontFamily: 'DM Mono, monospace',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                fontSize: 12,
                color: '#c0392b',
                margin: '0 0 14px',
              }}
            >
              Source of Truths
            </p>
            <h1
              style={{
                fontFamily: 'Fraunces, serif',
                fontWeight: 900,
                fontSize: 'clamp(36px, 7vw, 60px)',
                lineHeight: 1.04,
                margin: '0 0 16px',
              }}
            >
              Source of Truths
            </h1>
            <p
              style={{
                fontFamily: 'Fraunces, serif',
                fontStyle: 'italic',
                fontSize: 'clamp(18px, 2.4vw, 22px)',
                color: '#6f6657',
                margin: '0 0 26px',
              }}
            >
              For all the important aspects of life.
            </p>
            <p
              style={{
                fontFamily: 'Fraunces, serif',
                fontStyle: 'italic',
                fontSize: 16,
                color: '#9a8f7d',
                margin: 0,
              }}
            >
              seeking truths...
            </p>
          </div>

          <div style={{ maxWidth: 920, margin: '0 auto', padding: '8px 24px 80px' }}>
            <p
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 17,
                lineHeight: 1.6,
                maxWidth: 680,
                margin: '0 0 28px',
              }}
            >
              Source of Truths is a collection of curated top-ten lists ranked by
              expert consensus and reader votes. Each list blends rankings from
              authoritative publications using Borda consensus scoring, then
              layers live reader voting on top, so you can see what we all
              actually agree on, from the best dive bars and pizza to luxury
              resorts, films, books, and products.
            </p>
            {[
              { type: 'food', label: 'Food & Drink' },
              { type: 'travel', label: 'Travel & Hotels' },
              { type: 'entertainment', label: 'Entertainment' },
              { type: 'product', label: 'Products & Tech' },
              { type: 'stores', label: 'Places & Shops' },
              { type: 'other', label: 'More Lists' },
            ].map(({ type, label }) => {
              const seoLists = LISTS.filter((l) => l.type === type).sort((a, b) =>
                (a.title || '').localeCompare(b.title || '')
              );
              if (seoLists.length === 0) return null;
              return (
                <section key={type} style={{ margin: '0 0 34px' }}>
                  <h2
                    style={{
                      fontFamily: 'Fraunces, serif',
                      fontWeight: 700,
                      fontSize: 22,
                      margin: '0 0 12px',
                      borderBottom: '2px solid #c0392b',
                      paddingBottom: 6,
                    }}
                  >
                    {label}
                  </h2>
                  <ul
                    style={{
                      listStyle: 'none',
                      margin: 0,
                      padding: 0,
                      columns: '2 280px',
                      columnGap: 28,
                    }}
                  >
                    {seoLists.map((l) => (
                      <li
                        key={l.id}
                        style={{
                          breakInside: 'avoid',
                          margin: '0 0 7px',
                          fontFamily: 'DM Sans, sans-serif',
                          fontSize: 15,
                          lineHeight: 1.4,
                        }}
                      >
                        <a
                          href={`/list/${l.id}`}
                          style={{ color: '#2b2b2b', textDecoration: 'none' }}
                        >
                          {l.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
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
