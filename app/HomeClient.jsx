'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
import { fetchBootstrap } from '@/lib/api';
import Grain from './Grain';
import Footer from './Footer';

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

// Browse categories. Each maps to a set of underlying tags so lists never need
// re-tagging and overlapping tags collapse into one clean filter. 'stores',
// 'nightlife', 'food' etc. remain on lists as internal tags but are no longer
// their own browse buckets.
const CATEGORIES = [
  { id: 'all', label: 'All' },
  // 'any' = belongs if it has any of these tags; 'not' = excluded if it has any of these.
  // Bars carry food-drink/entertainment tags, so Restaurants and Entertainment exclude
  // bars/nightlife to keep a cocktail bar from leaking out of Bars & Nightlife.
  { id: 'restaurants', label: 'Eating Establishments', any: ['food', 'food-drink'], not: ['bars', 'nightlife'] },
  { id: 'bars-nightlife', label: 'Drinking Establishments', any: ['bars', 'nightlife'] },
  { id: 'travel', label: 'Hotels & Travel', any: ['travel', 'luxury'] },
  { id: 'shops', label: 'Shops & Products', any: ['product', 'tech'] },
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
      if (typeFilter !== 'all' && !listInCategory(list, typeFilter)) return false;
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
      return hay.includes(q);
    });
  }, [lists, query, typeFilter]);

  const sorted = useMemo(() => {
    if (sortBy === 'discover') {
      // Preserve the precomputed shuffle order; just keep entries that
      // survived the current filter.
      const allowed = new Set(filtered);
      return discoverOrder.filter((l) => allowed.has(l));
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
    return out;
  }, [lists]);

  // Only show tag chips that have at least one matching list (skip empty buckets)
  const visibleTypes = useMemo(() => {
    return CATEGORIES.filter((t) => t.id === 'all' || (counts[t.id] || 0) > 0);
  }, [counts]);

  const sortButtons = [
    { id: 'discover', label: 'Discover' },
    { id: 'trending', label: 'Trending' },
    { id: 'popularity', label: 'Most Popular' },
    { id: 'recent', label: 'Most Recently Added' },
  ];

  return (
    <div style={{ position: 'relative', zIndex: 2 }}>
      <header
        style={{
          padding: '48px 24px 32px',
          borderBottom: `2px solid ${COLORS.ink}`,
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: 'Fraunces, serif',
            fontWeight: 900,
            fontSize: 'clamp(48px, 12vw, 140px)',
            lineHeight: 0.85,
            letterSpacing: '-0.04em',
            margin: 0,
            fontVariationSettings: '"SOFT" 100, "WONK" 1',
            color: COLORS.ink,
          }}
        >
          CONSENSUS
          <br />
          <span style={{ fontStyle: 'italic', color: COLORS.ember }}>gurus</span>
        </h1>
        <p
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 16,
            maxWidth: 560,
            margin: '24px auto 0',
            lineHeight: 1.5,
            color: COLORS.ink,
          }}
        >
          Where We All Agree
        </p>
        <div
          style={{
            marginTop: 28,
            display: 'flex',
            justifyContent: 'center',
            gap: '6px 20px',
            fontFamily: 'DM Mono, monospace',
            fontSize: 11,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: COLORS.faded,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ whiteSpace: 'nowrap' }}>{lists.length} lists</span>
          <span style={{ whiteSpace: 'nowrap' }}><span aria-hidden="true" style={{ opacity: 0.5 }}>·</span> {totalVotes.toLocaleString()} votes</span>
          <span style={{ whiteSpace: 'nowrap' }}><span aria-hidden="true" style={{ opacity: 0.5 }}>·</span> {totalViews.toLocaleString()} visitors</span>
        </div>
      </header>

      <section style={{ padding: '32px 16px 80px', maxWidth: 1200, margin: '0 auto' }}>
        <style>{`.cg-controls{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-bottom:36px;}.cg-c-search{grid-column:span 2;}@media(max-width:607px){.cg-controls{grid-template-columns:1fr 1fr;}.cg-c-search{grid-column:span 2;}}`}</style>
        <div className="cg-controls">
          <div className="cg-c-search" style={{ position: 'relative', minWidth: 0, order: 3 }}>
            <Search size={16} strokeWidth={2.5} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: COLORS.faded }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search lists, items, cities..."
              style={{ width: '100%', boxSizing: 'border-box', padding: '14px 16px 14px 42px', background: COLORS.paper, border: `1.5px solid ${COLORS.ink}`, fontFamily: 'Fraunces, serif', fontSize: 17, color: COLORS.ink, outline: 'none', fontVariationSettings: '"SOFT" 100' }}
            />
            {query && (
              <button onClick={() => setQuery('')} aria-label="Clear search" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: COLORS.faded, cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} strokeWidth={2.5} />
              </button>
            )}
          </div>

          <div style={{ position: 'relative', minWidth: 0, order: 2 }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setCatOpen((o) => !o); setSortOpen(false); }} aria-haspopup="true" aria-expanded={catOpen} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'transparent', color: COLORS.ink, border: `1.5px solid ${COLORS.ink}`, padding: '12px 14px', fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              <span><span style={{ opacity: 0.6 }}>Category:</span> {(visibleTypes.find((t) => t.id === typeFilter) || {}).label || 'All'}</span>
              <ChevronDown size={14} strokeWidth={2.5} style={{ transform: catOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
            </button>
            {catOpen && (
              <div role="menu" style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, left: 'auto', zIndex: 30, minWidth: 220, maxWidth: 'calc(100vw - 48px)', background: COLORS.cream, border: `1.5px solid ${COLORS.ink}`, maxHeight: 360, overflowY: 'auto' }}>
                {visibleTypes.map((t, i) => {
                  const active = typeFilter === t.id;
                  return (
                    <button key={t.id} role="menuitem" onClick={() => { setTypeFilter(t.id); setCatOpen(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, border: 'none', padding: '10px 14px', fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer', textAlign: 'left', background: active ? COLORS.ink : 'transparent', color: active ? COLORS.cream : COLORS.ink, borderTop: i === 0 ? 'none' : `0.5px solid ${COLORS.paper}` }}>
                      <span>{t.label}</span>
                      <span style={{ opacity: 0.6 }}>{counts[t.id] || 0}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ position: 'relative', minWidth: 0, order: 1 }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setSortOpen((o) => !o); setCatOpen(false); }} aria-haspopup="true" aria-expanded={sortOpen} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'transparent', color: COLORS.ink, border: `1.5px solid ${COLORS.ink}`, padding: '12px 14px', fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              <span><span style={{ opacity: 0.6 }}>Sort:</span> {(sortButtons.find((o) => o.id === sortBy) || {}).label || 'Discover'}</span>
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
        </div>

        {sorted.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {sorted.map((list, idx) => (
              <Tile
                key={list.id}
                list={list}
                rank={idx + 1}
                views={viewCounts[list.id] || 0}
                voteData={voteData}
                extras={extras[list.id] || []}
                onClick={() => openList(list.id)}
                showConsensus={true}
              />
            ))}
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

function Tile({ list, rank, views, voteData, extras, onClick, showConsensus }) {
  const [hover, setHover] = useState(false);
  const mode = list.mode || 'both';

  const preview = useMemo(() => {
    // For facts-only lists: always show from sources.ai
    if (mode === 'facts' || mode === 'scores' || mode === 'unranked') {
      const items = list.sources?.ai?.items || [];
      return {
        label: 'Top of the list',
        rows: items.slice(0, 3).map((item) => ({ item, score: null })),
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
        rows: scored.slice(0, 3),
      };
    }

    // For 'both' mode lists: show Consensus if requested, else show votes
    if (showConsensus) {
      const sources = getSources(list, voteData, extras);
      const consensusSource = sources.find((s) => s.id === 'consensus');
      if (consensusSource && consensusSource.items.length > 0) {
        return {
          label: 'Current Consensus',
          rows: consensusSource.items.slice(0, 3).map((item) => ({ item, score: null })),
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
      rows: scored.slice(0, 3),
    };
  }, [list, voteData, extras, mode, showConsensus]);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        cursor: 'pointer',
        background: hover ? COLORS.ink : COLORS.paper,
        color: hover ? COLORS.cream : COLORS.ink,
        border: `1.5px solid ${COLORS.ink}`,
        padding: 20,
        textAlign: 'left',
        transition: 'all 0.2s ease',
        position: 'relative',
        fontFamily: 'inherit',
        transform: hover ? 'translate(-2px, -2px)' : 'none',
        boxShadow: hover ? `4px 4px 0 ${COLORS.ember}` : 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 14,
          gap: 8,
        }}
      >
        <span
          style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: 10,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            opacity: 0.75,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexWrap: 'wrap',
          }}
        >
          {list.isUserSubmitted && (
            <span
              style={{
                background: hover ? COLORS.cream : COLORS.ink,
                color: hover ? COLORS.ink : COLORS.cream,
                padding: '2px 6px',
                fontSize: 8,
                letterSpacing: '0.15em',
                fontWeight: 700,
              }}
            >
              READER
            </span>
          )}
          {list.category}
        </span>
        <span
          style={{
            fontFamily: 'Fraunces, serif',
            fontWeight: 900,
            fontSize: 18,
            color: COLORS.ember,
            fontVariationSettings: '"SOFT" 100',
          }}
        >
          #{rank}
        </span>
      </div>

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
                  borderBottom: i < 2 ? `1px dashed ${hover ? COLORS.cream : COLORS.faded}` : 'none',
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
                        color: hover ? RANK_MEDALS[i].numHover : RANK_MEDALS[i].num,
                      }}
                    >
                      {i + 1}
                    </span>
                  </span>
                ) : (
                  <span
                    style={{
                      fontFamily: 'Fraunces, serif',
                      fontWeight: 600,
                      width: 16,
                      color: hover ? COLORS.cream : COLORS.faded,
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

      <div
        style={{
          marginTop: 16,
          paddingTop: 12,
          borderTop: `1px solid ${hover ? COLORS.cream : COLORS.ink}`,
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
          gathering consensus
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
