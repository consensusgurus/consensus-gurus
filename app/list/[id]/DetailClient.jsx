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
  ExternalLink,
  PenLine,
  BarChart3,
  Users,
  Share2,
  MapPin,
  Globe,
} from 'lucide-react';
import { LISTS, COLORS } from '@/lib/data';
import { buildItemLink, getSources, voteKey, dedupeByName } from '@/lib/helpers';
import { fetchBootstrap, postVote, postView, postExtra } from '@/lib/api';
import Grain from '../../Grain';
import Footer from '../../Footer';

// Get the effective tag set for a list. If `tags` is provided, use it.
// Otherwise fall back to [type] for backward compatibility.
function getListTags(list) {
  if (Array.isArray(list.tags) && list.tags.length > 0) return list.tags;
  if (list.type) return [list.type];
  return [];
}

// Expert source groups shown below the ranked list. Each group gets its own
// color so the three kinds of source read as visually distinct sets:
//   - publication: editorial "best of" rankings (Eater, Michelin, etc.) -- ink
//   - platform: crowd ratings / booking sites (Google, Yelp, TripAdvisor,
//     Amazon reviews, booking sites) -- forest green
//   - pricing: live pricing data -- rust
const EXPERT_GROUPS = [
  { key: 'trueexpert', title: 'True Experts', color: COLORS.ember },
  { key: 'publication', title: 'Expert Publications', color: COLORS.ink },
  { key: 'platform', title: 'User Reviews & Ratings', color: COLORS.forest },
  { key: 'pricing', title: 'Pricing Data', color: COLORS.rust },
];

// Vote-page ordering: the same universe + ranking the User Vote tab shows, so a
// "Consensus Gurus User Vote" source matches that page exactly. Items are the
// vote.items + every publication item + extras, ranked by live votes; with no
// votes yet it falls back to the consensus order (full universe, not just 10).
function voteOrderedItems(list, voteData, extras) {
  const mode = list.mode || 'both';
  const base = list.vote?.items || [];
  let universeItems = [...base];
  if (mode === 'both') {
    getSources(list, voteData, extras).forEach((source) => {
      if (source.id !== 'consensus') {
        source.items.forEach((item) => {
          if (!universeItems.some((i) => i.toLowerCase().trim() === item.toLowerCase().trim())) {
            universeItems.push(item);
          }
        });
      }
    });
  }
  const all = dedupeByName([...universeItems, ...(Array.isArray(extras) ? extras : [])]);
  const scored = all.map((item, idx) => ({ item, score: (voteData || {})[voteKey(list.id, item)] || 0, origIdx: idx }));
  scored.sort((a, b) => b.score - a.score || a.origIdx - b.origIdx);
  const hasAnyVotes = scored.some((x) => x.score !== 0);
  if (!hasAnyVotes && mode === 'both') {
    const consensusSource = getSources(list, voteData, extras).find((x) => x.id === 'consensus');
    if (consensusSource && consensusSource.items.length > 0) {
      const rank = {};
      consensusSource.items.forEach((item, idx) => { rank[item.toLowerCase().trim()] = idx; });
      scored.sort((a, b) => {
        const ra = rank[a.item.toLowerCase().trim()];
        const rb = rank[b.item.toLowerCase().trim()];
        if (ra !== undefined && rb !== undefined) return ra - rb;
        if (ra !== undefined) return -1;
        if (rb !== undefined) return 1;
        return a.origIdx - b.origIdx;
      });
    }
  }
  return scored.map((x) => x.item);
}

// Classify an expert source into one of the EXPERT_GROUPS by id/label.
function expertGroupKey(src) {
  // A flagged true-expert source is exceptionally authoritative and gets its
  // own group, regardless of whether its label mentions ratings/reviews.
  if (src.trueExpert) return 'trueexpert';
  // The live Consensus Gurus fan vote is a user-ratings signal.
  if ((src.id || '') === 'cgvote') return 'platform';
  const id = (src.id || '').toLowerCase();
  const label = (src.label || '').toLowerCase();
  if (id === 'pricing' || label.includes('pricing') || label.includes('nightly rate')) {
    return 'pricing';
  }
  const platformHints = [
    'yelp', 'google', 'tripadvisor', 'trip advisor', 'booking', 'expedia',
    'hotels.com', 'opentable', 'amazon', 'reviews', 'rating',
  ];
  if (platformHints.some((h) => id.includes(h.replace(/[^a-z]/g, '')) || label.includes(h))) {
    return 'platform';
  }
  return 'publication';
}

function ListDetail({ list, viewCount, voteData, userVotes, extras, relatedLists, onBack, onVote, onAddExtra, onOpenRelated }) {
  const mode = list.mode || 'both';
  const showSourceTab = mode !== 'votes';
  const showVoteTab = mode !== 'facts' && mode !== 'scores' && mode !== 'unranked';

  const [tab, setTab] = useState(showSourceTab ? 'source' : 'vote');
  const [activeVoteSlot, setActiveVoteSlot] = useState(null);
  const [voteSelections, setVoteSelections] = useState({ 1: null, 2: null, 3: null });
  const [userCurrentVote, setUserCurrentVote] = useState({ 1: null, 2: null, 3: null });
  const [hasVoted, setHasVoted] = useState(false);
  // When a reader cast only a partial set (e.g. just a 1st pick), they can come
  // back later and fill the remaining empty slots. `completing` toggles that mode.
  const [completing, setCompleting] = useState(false);
  const [voteMessage, setVoteMessage] = useState('');
  const [complainOpen, setComplainOpen] = useState(false);
  const [complainMsg, setComplainMsg] = useState('');
  const [complainName, setComplainName] = useState('');
  const [complainEmail, setComplainEmail] = useState('');
  const [complainSent, setComplainSent] = useState(false);
  const [complainBusy, setComplainBusy] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);

  // Sources now factor in live vote data so the Consensus chip stays accurate
  // as people vote in real time. For facts-only lists, use the hardcoded ai source.
  const sources = useMemo(() => {
    if (!showSourceTab) return [];
    
    // Facts lists: bare ranking from the hardcoded 'ai' source, no other chips.
    if (mode === 'facts') {
      const aiItems = list.sources?.ai?.items || [];
      if (aiItems.length > 0) {
        return [{ id: 'ai', label: list.sources?.ai?.label || 'Consensus AI', items: aiItems }];
      }
      return [];
    }

    // Unranked products: a curated, subjective set. No ranking math, no voting —
    // just the hardcoded 'ai' items shown in the chosen order.
    if (mode === 'unranked') {
      const aiItems = list.sources?.ai?.items || [];
      if (aiItems.length > 0) {
        return [{ id: 'ai', label: list.sources?.ai?.label || 'Our picks', items: aiItems }];
      }
      return [];
    }

    // Scores lists (e.g. chain rankings): the 'ai' composite ranking first, plus
    // the raw platform sources (Google, Yelp) as informational chips. No voting.
    if (mode === 'scores') {
      const aiItems = list.sources?.ai?.items || [];
      const publications = Object.entries(list.sources || {})
        .filter(([id]) => id !== 'ai')
        .map(([id, src]) => ({ id, label: src.label, items: src.items, url: src.url }));
      const out = [];
      if (aiItems.length > 0) {
        out.push({ id: 'ai', label: list.sources?.ai?.label || 'Consensus AI', items: aiItems });
      }
      // When only one platform (Google OR Yelp, not both) backs the composite,
      // the composite and that single platform are the SAME data — showing two
      // selection chips is redundant. Collapse to one chip: the composite if we
      // have it, otherwise the lone platform.
      if (publications.length <= 1) return out.length > 0 ? out : publications;
      return [...out, ...publications];
    }

    // For 'both' mode lists: compute Consensus from publications, then append a
    // standalone "Consensus Gurus User Vote" source built from live fan votes,
    // shown as a User Reviews & Ratings source at the base of the page.
    const result = getSources(list, voteData, extras);
    const cgVote = {
      id: 'cgvote',
      label: 'Consensus Gurus User Vote',
      items: voteOrderedItems(list, voteData, extras),
    };
    return [...result, cgVote];
  }, [list, voteData, extras, showSourceTab, mode]);

  // Default: Consensus if exists, else configured default, else first available
  const initialSourceId =
    sources.find((s) => s.id === 'consensus')?.id ||
    list.defaultSource ||
    sources[0]?.id;
  const [activeSourceId, setActiveSourceId] = useState(initialSourceId);

  // If the source set ever changes (e.g. data swap on related-list click),
  // keep the selection sensible.
  useEffect(() => {
    if (!sources.find((s) => s.id === activeSourceId)) {
      setActiveSourceId(
        sources.find((s) => s.id === 'consensus')?.id || sources[0]?.id
      );
    }
  }, [sources, activeSourceId]);

  const [newItem, setNewItem] = useState('');
  const [addError, setAddError] = useState('');

  useEffect(() => {
    // Check if user already voted
    const alreadyVoted = hasUserVoted(list.id);
    setHasVoted(alreadyVoted);

    if (alreadyVoted) {
      // Load their previous vote
      const previousVote = getUserVoteForList(list.id);
      if (previousVote) {
        setUserCurrentVote(previousVote);
        setVoteMessage('You already voted on this list. Your selections are shown below.');
      }
    }
  }, [list.id]);

  const activeSource = sources.find((s) => s.id === activeSourceId) || sources[0];

  // New layout (for 'both' mode lists that have a computed consensus): two
  // full-width chips at the top (Expert Consensus + User Vote), and all the
  // individual expert source buttons moved into grouped, color-coded sets
  // BELOW the ranked list.
  const consensusSource = sources.find((s) => s.id === 'consensus');
  const expertSources = sources.filter((s) => s.id !== 'consensus');
  const useGroupedLayout = !!consensusSource;

  const sortedVote = useMemo(() => {
    if (!showVoteTab) return [];
    
    // Gather base items from vote.items
    const base = list.vote?.items || [];
    
    // For 'both' mode lists: also include all items from expert sources
    let universeItems = [...base];
    if (mode === 'both') {
      // Add all unique items from all sources
      const sources = getSources(list, voteData, extras);
      sources.forEach((source) => {
        if (source.id !== 'consensus') { // Skip consensus, use publications only
          source.items.forEach((item) => {
            if (!universeItems.some((i) => i.toLowerCase().trim() === item.toLowerCase().trim())) {
              universeItems.push(item);
            }
          });
        }
      });
    }
    
    // Add any user extras
    const all = dedupeByName([...universeItems, ...extras]);
    
    // Score by votes
    const scored = all.map((item, idx) => ({
      item,
      score: voteData[voteKey(list.id, item)] || 0,
      origIdx: idx,
      isTopTen: base.indexOf(item) < 10, // Mark if in original top 10
    }));
    
    // Sort by votes descending, then by original order
    scored.sort((a, b) => b.score - a.score || a.origIdx - b.origIdx);

    // If no votes recorded, fall back to consensus ranking — but keep the
    // full universe of items, not just the top-10 consensus list. Items in
    // the consensus appear first in consensus order; the rest follow in
    // their original appearance order.
    const hasAnyVotes = scored.some((s) => s.score !== 0);
    if (!hasAnyVotes && mode === 'both') {
      const consensusSource = getSources(list, voteData, extras).find((s) => s.id === 'consensus');
      if (consensusSource && consensusSource.items.length > 0) {
        const consensusRank = {};
        consensusSource.items.forEach((item, idx) => {
          consensusRank[item.toLowerCase().trim()] = idx;
        });
        scored.sort((a, b) => {
          const ra = consensusRank[a.item.toLowerCase().trim()];
          const rb = consensusRank[b.item.toLowerCase().trim()];
          if (ra !== undefined && rb !== undefined) return ra - rb;
          if (ra !== undefined) return -1;
          if (rb !== undefined) return 1;
          return a.origIdx - b.origIdx;
        });
        return scored.map((entry, idx) => ({
          ...entry,
          isTopTen: idx < 10,
        }));
      }
    }

    return scored;
  }, [list, voteData, extras, showVoteTab, mode]);

  function handleAdd() {
    setAddError('');
    const trimmed = newItem.trim();
    if (!trimmed) return;
    if (trimmed.length > 90) return setAddError('Keep it under 90 characters');
    const base = list.vote?.items || [];
    const allLower = new Set([...base, ...extras].map((i) => i.toLowerCase().trim()));
    if (allLower.has(trimmed.toLowerCase())) {
      setAddError('That one is already on the list');
      return;
    }
    onAddExtra(list.id, trimmed);
    setNewItem('');
  }

  function activateVoteSlot(slot) {
    // In completion mode, slots already cast earlier are locked.
    if (completing && userCurrentVote[slot]) return;
    setActiveVoteSlot(slot);
  }

  function selectItemForVote(item, slot) {
    if (!slot) return;

    // Check if item already selected in another slot
    const otherSelections = { ...voteSelections };
    delete otherSelections[slot];
    if (Object.values(otherSelections).includes(item)) {
      // Item already selected elsewhere, don't allow
      return;
    }

    setVoteSelections((prev) => ({
      ...prev,
      [slot]: item,
    }));

    // Move to next slot if available. In completion mode, skip slots that were
    // already cast earlier and only advance to a still-empty one.
    let nextSlot = slot === 1 ? 2 : slot === 2 ? 3 : null;
    if (completing) {
      nextSlot = [slot + 1, slot + 2].find((s) => s <= 3 && !userCurrentVote[s]) || null;
    }
    if (nextSlot) {
      setActiveVoteSlot(nextSlot);
    } else {
      setActiveVoteSlot(null);
    }
  }

  function removeVoteSelection(slot) {
    setVoteSelections((prev) => ({
      ...prev,
      [slot]: null,
    }));
    setActiveVoteSlot(null);
  }

  async function submitComplaint() {
    if (complainBusy) return;
    setComplainBusy(true);
    try {
      await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listId: list.id, listTitle: list.title, message: complainMsg.trim(), name: complainName.trim(), email: complainEmail.trim() }),
      });
    } catch (e) {
      // swallow — we still acknowledge the request to the reader
    }
    setComplainSent(true);
    setComplainBusy(false);
  }

  function submitVote() {
    // Only submit if at least one slot is filled
    const filledSlots = [voteSelections[1], voteSelections[2], voteSelections[3]].filter(Boolean);
    if (filledSlots.length === 0) return;

    // Create vote records with weights: 1st=3, 2nd=2, 3rd=1
    // Parent component (DetailClient wrapper) must update voteData state
    // after these API calls succeed so Consensus recalculates
    const points = { 1: 3, 2: 2, 3: 1 };
    
    if (voteSelections[1]) {
      onVote(list.id, voteSelections[1], points[1]);
    }
    if (voteSelections[2]) {
      onVote(list.id, voteSelections[2], points[2]);
    }
    if (voteSelections[3]) {
      onVote(list.id, voteSelections[3], points[3]);
    }

    // Save to localStorage
    const userVotes = loadUserVotes();
    userVotes[list.id] = voteSelections;
    saveUserVotes(userVotes);

    // Set voting cookie to prevent duplicate voting
    setVoteCookie(list.id);
    setHasVoted(true);

    // Update user's current vote
    setUserCurrentVote(voteSelections);
    setVoteSelections({ 1: null, 2: null, 3: null });
    setActiveVoteSlot(null);
    setVoteMessage('Vote submitted! You can view the updated rankings on this page.');
  }

  // Slots the reader left empty when they first voted can be filled later.
  const emptyVoteSlots = [1, 2, 3].filter((s) => !userCurrentVote[s]);
  const canCompleteVote = hasVoted && emptyVoteSlots.length > 0;

  function startCompleting() {
    // Seed selections with the existing vote so cast picks render (locked) and
    // can't be re-picked from the choices below; focus the first empty slot.
    setVoteSelections({ ...userCurrentVote });
    setCompleting(true);
    setActiveVoteSlot(emptyVoteSlots[0] || null);
    setVoteMessage('');
  }

  function cancelCompleting() {
    setCompleting(false);
    setVoteSelections({ 1: null, 2: null, 3: null });
    setActiveVoteSlot(null);
  }

  function submitCompletion() {
    const points = { 1: 3, 2: 2, 3: 1 };
    // Only the slots that were empty before and are now filled count as new votes.
    const newlyFilled = [1, 2, 3].filter((s) => !userCurrentVote[s] && voteSelections[s]);
    if (newlyFilled.length === 0) {
      cancelCompleting();
      return;
    }
    newlyFilled.forEach((s) => onVote(list.id, voteSelections[s], points[s]));

    const merged = { ...userCurrentVote };
    newlyFilled.forEach((s) => { merged[s] = voteSelections[s]; });

    const userVotes = loadUserVotes();
    userVotes[list.id] = merged;
    saveUserVotes(userVotes);

    setUserCurrentVote(merged);
    setVoteSelections({ 1: null, 2: null, 3: null });
    setActiveVoteSlot(null);
    setCompleting(false);
    setVoteMessage('Thanks! Your remaining picks were added.');
  }

  return (
    <div style={{ position: 'relative', zIndex: 2, maxWidth: 820, margin: '0 auto', padding: '24px 20px 80px' }}>
      <button
        onClick={onBack}
        style={{
          background: 'transparent',
          border: 'none',
          fontFamily: 'DM Mono, monospace',
          fontSize: 11,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: COLORS.ink,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 0',
        }}
      >
        <ArrowLeft size={14} strokeWidth={2.5} />
        Back to all lists
      </button>

      <div style={{ borderBottom: `2px solid ${COLORS.ink}`, paddingBottom: 24, marginTop: 20 }}>
        <div
          style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: 11,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: COLORS.ember,
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          {list.isUserSubmitted && (
            <span
              style={{
                background: COLORS.ink,
                color: COLORS.cream,
                padding: '3px 7px',
                fontSize: 9,
                letterSpacing: '0.2em',
                fontWeight: 700,
              }}
            >
              READER SUBMITTED
            </span>
          )}
          <span>{list.category} · Top Ten</span>
        </div>
        <h1
          style={{
            fontFamily: 'Fraunces, serif',
            fontWeight: 900,
            fontSize: 'clamp(40px, 9vw, 76px)',
            lineHeight: 0.92,
            letterSpacing: '-0.03em',
            margin: 0,
            color: COLORS.ink,
            fontVariationSettings: '"SOFT" 100',
          }}
        >
          {list.title}
        </h1>
        <p
          style={{
            fontFamily: 'Fraunces, serif',
            fontStyle: 'italic',
            fontSize: 18,
            lineHeight: 1.45,
            margin: '16px 0 0',
            color: COLORS.faded,
            maxWidth: 580,
          }}
        >
          {list.blurb}
        </p>
        <div
          style={{
            marginTop: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: 'DM Mono, monospace',
              fontSize: 10,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: COLORS.faded,
            }}
          >
            <Eye size={11} strokeWidth={2} />
            <span>{viewCount} visitors</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => { setComplainSent(false); setComplainOpen(true); }}
              style={{
                background: 'transparent',
                color: COLORS.ink,
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
                gap: 6,
              }}
            >
              <PenLine size={12} strokeWidth={2.5} />
              Speak With The Manager
            </button>
            <a
              href={`/snapshot/${encodeURIComponent(list.id)}`}
              style={{
                background: 'transparent',
                color: COLORS.ink,
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
                gap: 6,
                textDecoration: 'none',
              }}
            >
              <Share2 size={12} strokeWidth={2.5} />
              Share
            </a>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 28 }} />

      {complainOpen && (
        <div
          onClick={() => setComplainOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(26,22,17,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6vh 16px' }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 480, background: COLORS.cream, border: `2px solid ${COLORS.ink}`, padding: 24 }}>
            {complainSent ? (
              <>
                <h3 style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 22, margin: '0 0 10px' }}>Thanks — noted.</h3>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: COLORS.faded, margin: '0 0 20px' }}>
                  Your note went to the editors' desk. Flagged lists get re-researched.
                </p>
                <button
                  onClick={() => { setComplainOpen(false); setComplainSent(false); setComplainMsg(''); setComplainName(''); setComplainEmail(''); }}
                  style={{ cursor: 'pointer', background: COLORS.ink, color: COLORS.cream, border: `1.5px solid ${COLORS.ink}`, padding: '12px 20px', fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600 }}
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <h3 style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 22, margin: '0 0 6px' }}>Comments? Questions?</h3>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: COLORS.faded, margin: '0 0 14px' }}>
                  Think this list is wrong or stale? Tell the editors what to re-research.
                </p>
                <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    value={complainName}
                    onChange={(e) => setComplainName(e.target.value)}
                    maxLength={120}
                    placeholder="Name (optional)"
                    style={{ flex: 1, minWidth: 140, boxSizing: 'border-box', padding: 12, border: `1.5px solid ${COLORS.ink}`, background: COLORS.paper, fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: COLORS.ink, outline: 'none' }}
                  />
                  <input
                    type="email"
                    value={complainEmail}
                    onChange={(e) => setComplainEmail(e.target.value)}
                    maxLength={200}
                    placeholder="Email (optional)"
                    style={{ flex: 1, minWidth: 140, boxSizing: 'border-box', padding: 12, border: `1.5px solid ${COLORS.ink}`, background: COLORS.paper, fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: COLORS.ink, outline: 'none' }}
                  />
                </div>
                <textarea
                  value={complainMsg}
                  onChange={(e) => setComplainMsg(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  placeholder="What's off about this list? (optional)"
                  style={{ width: '100%', boxSizing: 'border-box', padding: 12, border: `1.5px solid ${COLORS.ink}`, background: COLORS.paper, fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: COLORS.ink, outline: 'none', resize: 'vertical', marginBottom: 16 }}
                />
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setComplainOpen(false)}
                    style={{ cursor: 'pointer', background: 'transparent', color: COLORS.ink, border: `1.5px solid ${COLORS.ink}`, padding: '10px 18px', fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitComplaint}
                    disabled={complainBusy}
                    style={{ cursor: 'pointer', background: COLORS.rust, color: COLORS.cream, border: `1.5px solid ${COLORS.rust}`, padding: '10px 18px', fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, opacity: complainBusy ? 0.6 : 1 }}
                  >
                    {complainBusy ? 'Sending…' : 'Send to editors'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {tab === 'source' && showSourceTab ? (
        <>
          {useGroupedLayout ? (
            // Three full-width chips: Consensus Ranking (the computed list),
            // Consensus Sources (toggles a grouped, color-coded dropdown of all
            // sources right here at the top), and Vote. Each fills red when
            // active, red outline when not.
            <div style={{ marginBottom: 24 }}>
              {(() => {
                const consActive = tab === 'source' && activeSourceId === 'consensus';
                const srcActive = sourcesOpen || activeSourceId !== 'consensus';
                const chipBase = {
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  border: `1.5px solid ${COLORS.ember}`,
                  padding: '13px 10px',
                  fontFamily: 'DM Mono, monospace',
                  fontSize: 12,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                };
                return (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => { setActiveSourceId('consensus'); setSourcesOpen(false); }}
                      style={{ ...chipBase, background: consActive ? COLORS.ember : 'transparent', color: consActive ? COLORS.cream : COLORS.ember }}
                    >
                      Consensus Ranking
                    </button>
                    <button
                      onClick={() => setSourcesOpen((o) => !o)}
                      style={{ ...chipBase, background: srcActive ? COLORS.ember : 'transparent', color: srcActive ? COLORS.cream : COLORS.ember }}
                    >
                      Consensus Sources
                      {sourcesOpen ? <ChevronUp size={14} strokeWidth={2.5} /> : <ChevronDown size={14} strokeWidth={2.5} />}
                    </button>
                    {showVoteTab && (
                      <button
                        onClick={() => setTab('vote')}
                        style={{ ...chipBase, background: 'transparent', color: COLORS.ember }}
                      >
                        Vote
                      </button>
                    )}
                  </div>
                );
              })()}

              {sourcesOpen && (
                <div style={{ marginTop: 8, border: `1.5px solid ${COLORS.ink}`, background: COLORS.paper }}>
                  {EXPERT_GROUPS.map((group) => {
                    const groupSources = expertSources.filter((s) => expertGroupKey(s) === group.key);
                    if (groupSources.length === 0) return null;
                    return (
                      <div key={group.key}>
                        <div
                          style={{
                            fontFamily: 'DM Mono, monospace',
                            fontSize: 10,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            color: COLORS.cream,
                            background: group.color,
                            fontWeight: 700,
                            padding: '7px 16px',
                          }}
                        >
                          {group.title}
                        </div>
                        {groupSources.map((s) => {
                          const active = activeSourceId === s.id;
                          return (
                            <button
                              key={s.id}
                              onClick={() => { setActiveSourceId(s.id); setSourcesOpen(false); }}
                              style={{
                                display: 'block',
                                width: '100%',
                                textAlign: 'left',
                                background: active ? group.color : 'transparent',
                                color: active ? COLORS.cream : group.color,
                                border: 'none',
                                borderLeft: `4px solid ${group.color}`,
                                borderBottom: `1px solid ${COLORS.cream}`,
                                padding: '11px 16px',
                                fontFamily: 'DM Mono, monospace',
                                fontSize: 12,
                                letterSpacing: '0.04em',
                                fontWeight: active ? 700 : 600,
                                cursor: 'pointer',
                                transition: 'all 0.12s ease',
                              }}
                            >
                              {s.label}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : sources.length > 1 ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
              {sources.map((s) => {
                const active = activeSourceId === s.id;
                const isConsensus = s.id === 'consensus';
                const borderColor = isConsensus ? COLORS.ember : COLORS.ink;
                const activeBg = isConsensus ? COLORS.ember : COLORS.ink;
                // When a source button is already selected and the source has a
                // real URL, a second click opens that source in a new tab.
                const linkable = active && !!s.url;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      if (linkable) {
                        window.open(s.url, '_blank', 'noopener,noreferrer');
                      } else {
                        setActiveSourceId(s.id);
                      }
                    }}
                    title={linkable ? `View source: ${s.label}` : undefined}
                    style={{
                      background: active ? activeBg : 'transparent',
                      color: active ? COLORS.cream : (isConsensus ? COLORS.ember : COLORS.ink),
                      border: `1.5px solid ${borderColor}`,
                      padding: '10px 16px',
                      fontFamily: 'DM Mono, monospace',
                      fontSize: 11,
                      letterSpacing: '0.12em',
                      fontWeight: isConsensus ? 700 : 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {s.label}{linkable ? ' ↗' : ''}
                  </button>
                );
              })}
              {showVoteTab && (
                <button
                  onClick={() => setTab('vote')}
                  style={{
                    background: COLORS.ember,
                    color: COLORS.cream,
                    border: `1.5px solid ${COLORS.ember}`,
                    padding: '10px 16px',
                    fontFamily: 'DM Mono, monospace',
                    fontSize: 11,
                    letterSpacing: '0.12em',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  User Vote
                </button>
              )}
            </div>
          ) : (
            <div
              style={{
                fontFamily: 'Fraunces, serif',
                fontStyle: 'italic',
                fontSize: 14,
                color: COLORS.faded,
                marginBottom: 24,
                paddingLeft: 14,
                borderLeft: `2px solid ${COLORS.ember}`,
              }}
            >
              {activeSource?.label || 'Ranked'}
            </div>
          )}

          {/* When viewing an individual expert source (not consensus) under the
              grouped layout, show a small caption so the reader knows which
              source the ranking below reflects. */}
          {useGroupedLayout && activeSourceId !== 'consensus' && (
            <div
              style={{
                fontFamily: 'Fraunces, serif',
                fontStyle: 'italic',
                fontSize: 14,
                color: COLORS.faded,
                marginBottom: 20,
                marginTop: -8,
                paddingLeft: 14,
                borderLeft: `2px solid ${COLORS.ember}`,
              }}
            >
              Showing: {activeSource?.label || 'Source'}
            </div>
          )}

          <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {(activeSource?.items || []).map((item, i) => (
              <DataRow key={i} rank={i + 1} item={item} list={list} unranked={mode === 'unranked' || !!activeSource?.unordered} showPrice={activeSource?.id === 'pricing'} />
            ))}
          </ol>

          <p
            style={{
              marginTop: 28,
              fontFamily: 'DM Mono, monospace',
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: COLORS.faded,
              textAlign: 'center',
            }}
          >
            Each entry links out · affiliate links may earn a commission
          </p>
        </>
      ) : showVoteTab ? (
        <>
          {mode !== 'votes' && (
            <button
              onClick={() => setTab('source')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24, cursor: 'pointer', background: 'transparent', color: COLORS.ink, border: `1.5px solid ${COLORS.ink}`, padding: '10px 18px', fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}
            >
              <ArrowLeft size={14} strokeWidth={2.5} /> Back to Rankings
            </button>
          )}
          {voteMessage && (
            <div
              style={{
                background: hasVoted ? '#ebe2d0' : '#ebe2d0',
                padding: 16,
                border: `1.5px solid ${COLORS.ink}`,
                marginBottom: 24,
                fontFamily: 'Fraunces, serif',
                fontStyle: 'italic',
                fontSize: 14,
                color: COLORS.ink,
                borderLeft: `3px solid ${COLORS.ember}`,
              }}
            >
              {voteMessage}
            </div>
          )}

          {/* Your picks: submit button on top spanning the three slots, then
              the three pick slots in a row. Mobile-friendly stacking. */}
          <div style={{ marginBottom: 30 }}>
            <div
              style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: COLORS.faded,
                fontWeight: 600,
                marginBottom: 12,
              }}
            >
              {completing ? 'Complete Your Picks' : hasVoted ? 'Your Vote' : 'Your Picks'}
            </div>

            {(!hasVoted || completing) ? (
              <>
                {(() => {
                  // In completion mode, only newly-filled empty slots count.
                  const hasNewPick = completing
                    ? emptyVoteSlots.some((s) => voteSelections[s])
                    : (voteSelections[1] || voteSelections[2] || voteSelections[3]);
                  return (
                <button
                  onClick={completing ? submitCompletion : submitVote}
                  disabled={!hasNewPick}
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    background: COLORS.ember,
                    color: COLORS.cream,
                    border: 'none',
                    fontFamily: 'DM Mono, monospace',
                    fontSize: 12,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    cursor: hasNewPick ? 'pointer' : 'not-allowed',
                    opacity: hasNewPick ? 1 : 0.4,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {completing ? 'Add Remaining Picks' : 'Submit Your Vote'}
                </button>
                  );
                })()}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 8 }}>
                  {[1, 2, 3].map((slot) => {
                    const labels = { 1: '1st · 3 pts', 2: '2nd · 2 pts', 3: '3rd · 1 pt' };
                    const val = voteSelections[slot];
                    const isActive = activeVoteSlot === slot;
                    // A slot cast in an earlier visit is locked during completion.
                    const locked = completing && !!userCurrentVote[slot];
                    return (
                      <div
                        key={slot}
                        onClick={() => activateVoteSlot(slot)}
                        style={{
                          padding: '12px 12px',
                          minHeight: 92,
                          border: isActive ? `1.5px solid ${COLORS.ember}` : `1.5px solid ${COLORS.ink}`,
                          background: val || isActive ? COLORS.ink : '#ebe2d0',
                          color: val || isActive ? COLORS.cream : COLORS.ink,
                          cursor: locked ? 'default' : 'pointer',
                          opacity: locked ? 0.7 : 1,
                          transition: 'all 0.2s ease',
                          boxShadow: isActive || val ? `3px 3px 0 ${COLORS.ember}` : 'none',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                        }}
                      >
                        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, opacity: 0.85 }}>
                          {labels[slot]}{locked ? ' · cast' : ''}
                        </div>
                        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 15, fontWeight: 600, flex: 1, lineHeight: 1.1, fontStyle: val ? 'normal' : 'italic', color: !val && !isActive ? COLORS.faded : 'inherit' }}>
                          {val || (isActive ? 'Tap a choice' : 'Tap to pick')}
                        </div>
                        {val && !locked && (
                          <button
                            onClick={(e) => { e.stopPropagation(); removeVoteSelection(slot); }}
                            style={{ alignSelf: 'flex-start', background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', padding: 0, textDecoration: 'underline' }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div
                  style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: 10,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: COLORS.faded,
                    marginTop: 12,
                  }}
                >
                  {completing
                    ? 'Fill your remaining picks, then add them to your vote.'
                    : 'Tap a box, then tap a choice below. Submit 1, 2, or all 3 picks.'}
                </div>
                {completing && (
                  <button
                    onClick={cancelCompleting}
                    style={{ marginTop: 8, background: 'transparent', border: 'none', color: COLORS.faded, cursor: 'pointer', fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', padding: 0, textDecoration: 'underline' }}
                  >
                    Cancel
                  </button>
                )}
              </>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[1, 2, 3].map((slot) => {
                  const labels = { 1: '1st · 3 pts', 2: '2nd · 2 pts', 3: '3rd · 1 pt' };
                  const colors = { 1: COLORS.ember, 2: COLORS.ink, 3: COLORS.faded };
                  const val = userCurrentVote[slot];
                  if (!val) {
                    return (
                      <div key={slot} style={{ padding: '12px', minHeight: 72, border: `1.5px dashed ${COLORS.faded}`, opacity: 0.5, fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded }}>
                        {labels[slot]}
                      </div>
                    );
                  }
                  return (
                    <div key={slot} style={{ padding: '12px', minHeight: 72, background: colors[slot], color: COLORS.cream, border: `1.5px solid ${colors[slot]}`, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, opacity: 0.85 }}>{labels[slot]}</div>
                      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 15, fontWeight: 600, lineHeight: 1.1 }}>{val}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {canCompleteVote && !completing && (
              <button
                onClick={startCompleting}
                style={{
                  width: '100%',
                  marginTop: 10,
                  padding: '12px 20px',
                  background: 'transparent',
                  color: COLORS.ink,
                  border: `1.5px solid ${COLORS.ink}`,
                  fontFamily: 'DM Mono, monospace',
                  fontSize: 11,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {emptyVoteSlots.length === 1 ? 'Add your remaining pick' : 'Add your remaining picks'}
              </button>
            )}
          </div>

          {/* Choices as tiles (no rank numbers) */}
          <div
            style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: COLORS.faded,
              fontWeight: 600,
              marginBottom: 12,
            }}
          >
            {sortedVote.some((item) => item.score !== 0) ? 'By the People' : 'Current Consensus'}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 8,
              marginBottom: 36,
              opacity: (hasVoted && !completing) ? 0.6 : 1,
              pointerEvents: (hasVoted && !completing) ? 'none' : 'auto',
            }}
          >
            {sortedVote.map((entry) => {
              const isSelected = Object.values(voteSelections).includes(entry.item);
              const selectedSlot = Object.entries(voteSelections).find(([, v]) => v === entry.item)?.[0];
              const isClickable = activeVoteSlot !== null && !isSelected;
              const linksDisabled = activeVoteSlot !== null;
              const bg = selectedSlot === '1' ? COLORS.ember : selectedSlot === '2' ? COLORS.ink : selectedSlot === '3' ? COLORS.faded : COLORS.paper;
              return (
                <div
                  key={entry.item}
                  onClick={() => { if (isClickable) selectItemForVote(entry.item, activeVoteSlot); }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    padding: '12px 14px',
                    border: `1.5px solid ${isSelected ? bg : COLORS.ink}`,
                    background: isSelected ? bg : COLORS.paper,
                    color: isSelected ? COLORS.cream : COLORS.ink,
                    cursor: isClickable ? 'pointer' : 'default',
                    opacity: activeVoteSlot && !isClickable && !isSelected ? 0.4 : 1,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <ItemLink
                    list={list}
                    item={entry.item}
                    style={{
                      fontFamily: 'Fraunces, serif',
                      fontSize: 17,
                      fontWeight: 600,
                      color: 'inherit',
                      textDecoration: 'none',
                      lineHeight: 1.15,
                      pointerEvents: linksDisabled ? 'none' : 'auto',
                    }}
                  >
                    <span>{entry.item}</span>
                    {!linksDisabled && <ExternalLink size={11} strokeWidth={2} style={{ opacity: 0.4, flexShrink: 0, marginLeft: 4 }} />}
                  </ItemLink>
                  <div
                    style={{
                      fontFamily: 'DM Mono, monospace',
                      fontSize: 10,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: isSelected ? COLORS.cream : entry.score > 0 ? '#2d5016' : entry.score < 0 ? COLORS.ember : COLORS.faded,
                    }}
                  >
                    {entry.score > 0 ? `+${entry.score}` : entry.score} {Math.abs(entry.score) === 1 ? 'point' : 'points'}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              display: 'flex',
              gap: 8,
              marginBottom: 18,
              padding: 14,
              border: `1.5px dashed ${COLORS.ink}`,
              background: COLORS.paper,
            }}
          >
            <input
              type="text"
              value={newItem}
              onChange={(e) => {
                setNewItem(e.target.value);
                if (addError) setAddError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
              }}
              placeholder="Add an entry"
              maxLength={90}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                borderBottom: `1.5px solid ${COLORS.ink}`,
                padding: '8px 4px',
                fontFamily: 'Fraunces, serif',
                fontSize: 16,
                color: COLORS.ink,
                outline: 'none',
                fontVariationSettings: '"SOFT" 100',
              }}
            />
            <button
              onClick={handleAdd}
              style={{
                background: COLORS.ink,
                color: COLORS.cream,
                border: 'none',
                padding: '8px 16px',
                fontFamily: 'DM Mono, monospace',
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Plus size={12} strokeWidth={3} />
              Add
            </button>
          </div>
          {addError && (
            <p
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 13,
                color: COLORS.ember,
                margin: '-8px 0 16px',
                paddingLeft: 4,
              }}
            >
              {addError}
            </p>
          )}
        </>
      ) : null}

      {/* RELATED LISTS — internal linking for SEO and stickiness */}
      {relatedLists && relatedLists.length > 0 && (
        <div
          style={{
            marginTop: 60,
            paddingTop: 32,
            borderTop: `2px solid ${COLORS.ink}`,
          }}
        >
          <h2
            style={{
              fontFamily: 'Fraunces, serif',
              fontSize: 26,
              fontWeight: 700,
              margin: '0 0 20px',
              fontStyle: 'italic',
              color: COLORS.ink,
              fontVariationSettings: '"SOFT" 100',
            }}
          >
            More like this
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 14,
            }}
          >
            {relatedLists.map((rl) => (
              <a
                key={rl.id}
                href={`/list/${encodeURIComponent(rl.id)}`}
                onClick={(e) => {
                  if (onOpenRelated) {
                    e.preventDefault();
                    onOpenRelated(rl.id);
                  }
                }}
                style={{
                  display: 'block',
                  padding: 18,
                  background: COLORS.paper,
                  border: `1.5px solid ${COLORS.ink}`,
                  textDecoration: 'none',
                  color: COLORS.ink,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translate(-2px, -2px)';
                  e.currentTarget.style.boxShadow = `4px 4px 0 ${COLORS.ember}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: 10,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    opacity: 0.6,
                    marginBottom: 8,
                  }}
                >
                  {rl.category}
                </div>
                <div
                  style={{
                    fontFamily: 'Fraunces, serif',
                    fontSize: 20,
                    fontWeight: 700,
                    lineHeight: 1.1,
                    fontVariationSettings: '"SOFT" 100',
                  }}
                >
                  {rl.title}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {list.publishedDate && (
        <div
          style={{
            marginTop: 48,
            paddingTop: 18,
            borderTop: `1px solid ${COLORS.faded}`,
            fontFamily: 'DM Mono, monospace',
            fontSize: 9,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: COLORS.faded,
            opacity: 0.7,
            textAlign: 'center',
          }}
        >
          Published {formatPublishedDate(list.publishedDate)}
        </div>
      )}
    </div>
  );
}

function formatPublishedDate(iso) {
  // iso is 'YYYY-MM-DD'. Render as 'DD Mon YYYY' (e.g. "26 May 2026").
  try {
    const [y, m, d] = iso.split('-').map((n) => parseInt(n, 10));
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d} ${months[m - 1]} ${y}`;
  } catch {
    return iso;
  }
}

function TabButton({ active, onClick, icon, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        background: active ? COLORS.ink : 'transparent',
        color: active ? COLORS.cream : COLORS.ink,
        border: 'none',
        padding: '14px 12px',
        fontFamily: 'DM Mono, monospace',
        fontSize: 11,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      {icon}
      {children}
    </button>
  );
}

function ItemLink({ list, item, children, style }) {
  const href = buildItemLink(item, list);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      style={{
        color: 'inherit',
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 6,
        cursor: 'pointer',
        ...style,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
    >
      {children}
    </a>
  );
}

// Per-entry link menu (shown on hover for lists that define `itemLinks`).
// Map comes from the existing mapsCity link; Website from list.itemLinks; the
// "Food Pics" Yelp/Google links are built from the name + neighborhood.
//
// Geography is derived from the list, not hardcoded. The anchor is `list.category`
// when it names a real place (New York, Boston, Tokyo, Turkey, London ...). For
// world/continent-scope lists the category is generic ("Travel"), so it is ignored
// and the item parenthetical — which already carries "(city, country)" at that
// scope — supplies the geography on its own.
const GENERIC_CATEGORIES = new Set([
  'travel', 'tech', 'product', 'products', 'entertainment',
  'other', 'food', 'food-drink', 'stores', 'nightlife', 'bars', 'luxury',
]);

function auxSearchLocation(locality, list) {
  const cat = (list.category || '').trim();
  const anchor = cat && !GENERIC_CATEGORIES.has(cat.toLowerCase()) ? cat : '';
  if (!anchor) return locality;
  if (!locality) return anchor;
  if (locality.toLowerCase().includes(anchor.toLowerCase())) return locality;
  return `${locality}, ${anchor}`;
}

function buildAuxLinks(name, list) {
  const m = name.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
  const base = (m ? m[1] : name).trim();
  const locality = m ? m[2].trim() : '';
  const loc = auxSearchLocation(locality, list);
  const yelpDesc = encodeURIComponent(base);
  const yelpLoc = encodeURIComponent(loc);
  const gq = encodeURIComponent((base + ' ' + loc).replace(/\s+/g, ' ').trim());
  const tq = encodeURIComponent((base + ' ' + loc).replace(/\s+/g, ' ').trim());
  const website = (list.itemLinks && (list.itemLinks[name] || list.itemLinks[base])) || null;
  return {
    website,
    map: buildItemLink(name, list),
    yelp: `https://www.yelp.com/search?find_desc=${yelpDesc}&find_loc=${yelpLoc}`,
    google: `https://www.google.com/search?q=${gq}&tbm=isch`,
    tripadvisor: `https://www.tripadvisor.com/Search?q=${tq}`,
  };
}

// Per-category "pics" convention for the hover menu: hotels use Property Pics
// (TripAdvisor + Google), bars use a plain "Pics", everything else Food Pics.
function entryPicsConfig(list) {
  const tags = list.tags || [];
  const type = list.type || '';
  const isHotel = type === 'travel' || tags.includes('travel') || tags.includes('luxury');
  const isBar = tags.includes('bars') || tags.includes('nightlife');
  // Bars take priority over the hotel branch: a bar list also tagged travel/luxury
  // must still get Yelp pics, never TripAdvisor.
  if (isBar) return { label: 'Pics:', links: [['yelp', 'Yelp'], ['google', 'Google']] };
  if (isHotel) return { label: 'Property Pics:', links: [['tripadvisor', 'TripAdvisor'], ['google', 'Google']] };
  return { label: 'Food Pics:', links: [['yelp', 'Yelp'], ['google', 'Google']] };
}

function auxChip() {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    color: COLORS.ink,
    border: `1.3px solid ${COLORS.ink}`,
    borderRadius: 4,
    padding: '4px 9px',
    textTransform: 'uppercase',
    textDecoration: 'none',
  };
}

// Hotel nightly price (list.prices) is shown ONLY on the pricing source view,
// never in consensus / other source views / the vote tab / the home page.
function priceDecorate(name, list) {
  const p = list.prices && list.prices[name];
  if (!p) return name;
  return /\)\s*$/.test(name) ? name.replace(/\)\s*$/, `; ${p})`) : `${name} (${p})`;
}

// Chain "best-run" composite score (list.scores) shown as (neighborhood; 7.8),
// ONLY on the list page, never on the home tile or share poster.
function scoreDecorate(name, list) {
  const sc = list.scores && list.scores[name];
  if (!sc) return name;
  return /\)\s*$/.test(name) ? name.replace(/\)\s*$/, `; ${sc})`) : `${name} (${sc})`;
}

function DataRow({ rank, item, list, unranked, showPrice }) {
  // Ranked lists number each entry. Unranked lists (a source flagged
  // `unordered`, or a `mode: 'unranked'` list) show a plain bullet instead,
  // so the order reads as incidental rather than a ranking.
  const isTop = !unranked && rank === 1;
  const showFullSize = rank <= 10;
  const display = showPrice ? priceDecorate(item, list) : (list.scores ? scoreDecorate(item, list) : item);
  const [hover, setHover] = useState(false);
  const aux = list.itemLinks ? buildAuxLinks(item, list) : null;
  const pics = aux ? entryPicsConfig(list) : null;
  return (
    <li
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: unranked ? 14 : 18,
        padding: showFullSize ? '20px 0' : '14px 0',
        borderBottom: `1px solid ${COLORS.ink}`,
        opacity: !unranked && rank > 10 ? 0.85 : 1,
      }}
    >
      {unranked ? (
        <span
          aria-hidden="true"
          style={{
            fontFamily: 'Fraunces, serif',
            fontWeight: 900,
            fontSize: 22,
            lineHeight: 1,
            color: COLORS.ember,
            minWidth: 18,
            textAlign: 'center',
            flexShrink: 0,
          }}
        >
          •
        </span>
      ) : (
        <span
          style={{
            fontFamily: 'Fraunces, serif',
            fontWeight: 900,
            fontSize: isTop ? 64 : showFullSize ? 44 : 32,
            lineHeight: 0.85,
            color: isTop ? COLORS.ember : rank > 10 ? COLORS.faded : COLORS.ink,
            minWidth: 70,
            fontVariationSettings: '"SOFT" 100, "WONK" 1',
            fontFeatureSettings: '"lnum" 1',
          }}
        >
          {String(rank).padStart(2, '0')}
        </span>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 0 }}>
        <ItemLink
          list={list}
          item={item}
          style={{
            fontFamily: 'Fraunces, serif',
            fontSize: unranked ? 20 : isTop ? 28 : showFullSize ? 22 : 19,
            fontWeight: unranked ? 500 : isTop ? 700 : 500,
            lineHeight: 1.15,
            color: COLORS.ink,
            letterSpacing: '-0.01em',
          }}
        >
          <span>{display}</span>
          <ExternalLink size={isTop ? 14 : 12} strokeWidth={2} style={{ opacity: 0.4, flexShrink: 0 }} />
        </ItemLink>
        {aux && (
          <div
            style={{
              maxHeight: hover ? 220 : 0,
              opacity: hover ? 1 : 0,
              overflow: 'hidden',
              transition: 'max-height 0.2s ease, opacity 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '6px 10px',
              fontFamily: 'DM Mono, monospace',
              fontSize: 11,
              letterSpacing: '0.04em',
            }}
          >
            {aux.website && (
              <a href={aux.website} target="_blank" rel="noopener noreferrer" style={auxChip()}>
                <Globe size={11} strokeWidth={2.2} /> Website
              </a>
            )}
            <a href={aux.map} target="_blank" rel="noopener noreferrer" style={auxChip()}>
              <MapPin size={11} strokeWidth={2.2} /> Map
            </a>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: `1.3px solid ${COLORS.faded}`, borderRadius: 4, padding: '4px 9px' }}>
              <span style={{ textTransform: 'uppercase', color: COLORS.faded }}>{pics.label}</span>
              {pics.links.map(([key, label], i) => (
                <React.Fragment key={key}>
                  {i > 0 && <span style={{ color: COLORS.faded }}>|</span>}
                  <a href={aux[key]} target="_blank" rel="noopener noreferrer" style={{ color: COLORS.ember, textDecoration: 'none' }}>{label}</a>
                </React.Fragment>
              ))}
            </span>
          </div>
        )}
      </div>
    </li>
  );
}

const USER_VOTES_KEY = 'cg-uservotes';
const VOTE_COOKIE_PREFIX = 'cg-voted-';

function loadUserVotes() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(USER_VOTES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveUserVotes(votes) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USER_VOTES_KEY, JSON.stringify(votes));
  } catch {}
}

function hasUserVoted(listId) {
  if (typeof document === 'undefined') return false;
  const cookieName = `${VOTE_COOKIE_PREFIX}${listId}`;
  return document.cookie.split(';').some((c) => c.trim().startsWith(cookieName));
}

function setVoteCookie(listId) {
  if (typeof document === 'undefined') return;
  const cookieName = `${VOTE_COOKIE_PREFIX}${listId}`;
  // Set cookie to expire in 30 days
  const date = new Date();
  date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000);
  document.cookie = `${cookieName}=true; expires=${date.toUTCString()}; path=/`;
}

function getUserVoteForList(listId) {
  const userVotes = loadUserVotes();
  return userVotes[listId] || null;
}

export default function DetailClient({ listId }) {
  const router = useRouter();
  const [voteData, setVoteData] = useState({});
  const [userVotes, setUserVotes] = useState({});
  const [viewCount, setViewCount] = useState(0);
  const [extras, setExtras] = useState([]);
  const [userLists, setUserLists] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [viewed, setViewed] = useState(false);

  useEffect(() => {
    setUserVotes(loadUserVotes());
    fetchBootstrap().then((data) => {
      if (data) {
        setVoteData(data.votes || {});
        setViewCount((data.views || {})[listId] || 0);
        setExtras((data.extras || {})[listId] || []);
        setUserLists(Array.isArray(data.userLists) ? data.userLists : []);
      }
      setLoaded(true);
    });
  }, [listId]);

  useEffect(() => {
    if (loaded && !viewed) {
      setViewed(true);
      setViewCount((c) => c + 1);
      postView(listId);
    }
  }, [loaded, viewed, listId]);

  const allLists = useMemo(() => [...userLists, ...LISTS], [userLists]);

  const list = useMemo(() => {
    return allLists.find((l) => l.id === listId);
  }, [allLists, listId]);

  // Compute related lists by counting overlapping tags. Lists that share
  // more tags are more "related". Fall back to filling remaining slots
  // with any other lists if we don't have 4 same-tag matches.
  const relatedLists = useMemo(() => {
    if (!list) return [];
    const myTags = new Set(getListTags(list));
    if (myTags.size === 0) return [];

    const scored = allLists
      .filter((l) => l.id !== list.id)
      .map((l) => {
        const theirTags = getListTags(l);
        const overlap = theirTags.filter((t) => myTags.has(t)).length;
        return { list: l, overlap };
      })
      .filter((x) => x.overlap > 0)
      .sort((a, b) => b.overlap - a.overlap);

    if (scored.length >= 4) return scored.slice(0, 4).map((x) => x.list);

    const usedIds = new Set(scored.map((x) => x.list.id));
    const fillers = allLists.filter((l) => l.id !== list.id && !usedIds.has(l.id));
    return [...scored.map((x) => x.list), ...fillers].slice(0, 4);
  }, [allLists, list]);

  function vote(lId, itemName, direction) {
    const key = voteKey(lId, itemName);
    const current = userVotes[key] || 0;
    const newDirection = current === direction ? 0 : direction;
    const delta = newDirection - current;
    if (delta === 0) return;

    const newVoteData = { ...voteData, [key]: (voteData[key] || 0) + delta };
    const newUserVotes = { ...userVotes };
    if (newDirection === 0) delete newUserVotes[key];
    else newUserVotes[key] = newDirection;

    setVoteData(newVoteData);
    setUserVotes(newUserVotes);
    saveUserVotes(newUserVotes);
    postVote(lId, itemName, delta);
  }

  function addExtra(lId, itemName) {
    const lowerSet = new Set(extras.map((e) => e.toLowerCase().trim()));
    if (lowerSet.has(itemName.toLowerCase().trim())) return;
    setExtras((prev) => [...prev, itemName]);
    postExtra(lId, itemName);
    setTimeout(() => vote(lId, itemName, 1), 0);
  }

  function backHome() {
    router.push('/');
  }

  function openRelated(id) {
    router.push(`/list/${encodeURIComponent(id)}`);
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
          loading the list
        </div>
      ) : list ? (
        <ListDetail
          list={list}
          viewCount={viewCount}
          voteData={voteData}
          userVotes={userVotes}
          extras={extras}
          relatedLists={relatedLists}
          onBack={backHome}
          onVote={vote}
          onAddExtra={addExtra}
          onOpenRelated={openRelated}
        />
      ) : (
        <div style={{ position: 'relative', zIndex: 2, padding: 48, textAlign: 'center' }}>
          <p style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', color: COLORS.faded }}>
            That list seems to have wandered off.
          </p>
          <button
            onClick={backHome}
            style={{
              marginTop: 16,
              background: COLORS.ink,
              color: COLORS.cream,
              border: 'none',
              padding: '10px 20px',
              fontFamily: 'DM Mono, monospace',
              fontSize: 11,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Back home
          </button>
        </div>
      )}
      <Footer />
    </div>
  );
}
