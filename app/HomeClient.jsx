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
import { voteKey, dedupeByName, getSources } from '@/lib/helpers';
import { fetchBootstrap } from '@/lib/api';
import Grain from './Grain';
import Footer from './Footer';

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

function Home({ lists, viewCounts, voteData, extras, openList, onSubmit }) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return lists.filter((list) => {
      if (typeFilter !== 'all' && !listHasTag(list, typeFilter)) return false;
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
  }, [filtered, viewCounts, lists, sortBy, discoverOrder]);

  const totalViews = Object.values(viewCounts).reduce((a, b) => a + b, 0);
  const totalVotes = Object.values(voteData).reduce((a, b) => a + Math.abs(b), 0);

  // Count lists per tag (a list can contribute to multiple tag counts)
  const counts = useMemo(() => {
    const out = { all: lists.length };
    TYPES.forEach((t) => {
      if (t.id === 'all') return;
      out[t.id] = lists.filter((l) => listHasTag(l, t.id)).length;
    });
    return out;
  }, [lists]);

  // Only show tag chips that have at least one matching list (skip empty buckets)
  const visibleTypes = useMemo(() => {
    return TYPES.filter((t) => t.id === 'all' || (counts[t.id] || 0) > 0);
  }, [counts]);

  // Caption shown next to the section heading
  const subhead =
    sortBy === 'recent'
      ? 'most recent first'
      : sortBy === 'popularity'
      ? 'most viewed first'
      : 'a fresh mix every visit';

  const headingLabel =
    query || typeFilter !== 'all'
      ? `${sorted.length} ${sorted.length === 1 ? 'list' : 'lists'}`
      : sortBy === 'recent'
      ? 'Ranked by most recent'
      : sortBy === 'popularity'
      ? 'Ranked by popularity'
      : 'A fresh mix for you';

  const sortButtons = [
    { id: 'discover', label: 'Discover' },
    { id: 'popularity', label: 'Popularity' },
    { id: 'recent', label: 'Most Recent' },
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: 'DM Mono, monospace',
            fontSize: 11,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: COLORS.faded,
            marginBottom: 28,
          }}
        >
          <span>Vol. I · No. 1</span>
          <span>Est. 2026</span>
        </div>
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
          Top Ten Lists from Every Angle.
        </p>
        <div
          style={{
            marginTop: 28,
            display: 'flex',
            justifyContent: 'center',
            gap: 24,
            fontFamily: 'DM Mono, monospace',
            fontSize: 11,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: COLORS.faded,
            flexWrap: 'wrap',
          }}
        >
          <span>{lists.length} lists</span>
          <span>·</span>
          <span>{totalViews} views</span>
          <span>·</span>
          <span>{totalVotes} votes cast</span>
        </div>
      </header>

      <section style={{ padding: '32px 16px 80px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ position: 'relative', marginBottom: 18 }}>
          <Search
            size={16}
            strokeWidth={2.5}
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: COLORS.faded,
            }}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lists, items, cities..."
            style={{
              width: '100%',
              padding: '14px 16px 14px 42px',
              background: COLORS.paper,
              border: `1.5px solid ${COLORS.ink}`,
              fontFamily: 'Fraunces, serif',
              fontSize: 17,
              color: COLORS.ink,
              outline: 'none',
              fontVariationSettings: '"SOFT" 100',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: COLORS.faded,
                cursor: 'pointer',
                padding: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          {visibleTypes.map((t) => {
            const active = typeFilter === t.id;
            const cnt = counts[t.id] || 0;
            return (
              <button
                key={t.id}
                onClick={() => setTypeFilter(t.id)}
                style={{
                  background: active ? COLORS.ink : 'transparent',
                  color: active ? COLORS.cream : COLORS.ink,
                  border: `1.5px solid ${COLORS.ink}`,
                  padding: '8px 14px',
                  fontFamily: 'DM Mono, monospace',
                  fontSize: 10,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {t.label}
                <span style={{ opacity: 0.6 }}>{cnt}</span>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          {sortButtons.map((opt) => {
            const active = sortBy === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSortBy(opt.id)}
                style={{
                  background: active ? COLORS.ink : 'transparent',
                  color: active ? COLORS.cream : COLORS.ink,
                  border: `1.5px solid ${COLORS.ink}`,
                  padding: '8px 14px',
                  fontFamily: 'DM Mono, monospace',
                  fontSize: 10,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>


        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 4px 16px',
            borderBottom: `1px solid ${COLORS.ink}`,
            marginBottom: 24,
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <h2
            style={{
              fontFamily: 'Fraunces, serif',
              fontSize: 22,
              fontWeight: 700,
              margin: 0,
              fontStyle: 'italic',
              color: COLORS.ink,
            }}
          >
            {headingLabel}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span
              style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: 10,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: COLORS.faded,
              }}
            >
              {subhead}
            </span>
            <button
              onClick={onSubmit}
              style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                fontWeight: 600,
                padding: '8px 14px',
                border: `1.5px solid ${COLORS.ink}`,
                background: 'transparent',
                color: COLORS.ink,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Plus size={14} strokeWidth={2.5} />
              Submit
            </button>
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
    if (mode === 'facts' || mode === 'scores') {
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
                  gap: 8,
                  padding: '4px 0',
                  borderBottom: i < 2 ? `1px dashed ${hover ? COLORS.cream : COLORS.faded}` : 'none',
                  opacity: i === 0 ? 1 : 0.75,
                }}
              >
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
                <span style={{ flex: 1 }}>{t.item}</span>
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
        <span>{views} views</span>
      </div>
    </button>
  );
}

export default function HomeClient() {
  const router = useRouter();
  const [voteData, setVoteData] = useState({});
  const [viewCounts, setViewCounts] = useState({});
  const [extras, setExtras] = useState({});
  const [userLists, setUserLists] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchBootstrap().then((data) => {
      if (data) {
        setVoteData(data.votes || {});
        setViewCounts(data.views || {});
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
          loading the gurus
        </div>
      ) : (
        <Home
          lists={allLists}
          viewCounts={viewCounts}
          voteData={voteData}
          extras={extras}
          openList={openList}
          onSubmit={goToSubmit}
        />
      )}
    </div>
  );
}
