'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  Plus,
  X,
  ExternalLink,
  PenLine,
  BarChart3,
  Users,
  Share2,
  MapPin,
  Globe,
  Play,
  ShoppingBag,
  Clock,
} from 'lucide-react';
import { LISTS, COLORS } from '@/lib/data';
import { DESCRIPTIONS } from '@/lib/descriptions';
import { buildItemLink, getSources, voteKey, dedupeByName } from '@/lib/helpers';
import { fetchBootstrap, postVote, postView, postExtra } from '@/lib/api';
import Grain from '../../Grain';
import Footer from '../../Footer';
import ListOverview from './ListOverview';
import ActivityFeed from './ActivityFeed';
import SnapshotClient from '../../snapshot/[id]/SnapshotClient';
import { Tile as HomeTile } from '../../HomeClient';

// ── LIST-PAGE RIBBON V2 (June 2026 redesign) ────────────────────────────────
// Flip to false to restore the previous outlined tab chips exactly. V2 renders
// the tab row as the same ink ribbon band used on the V2 homepage (cream mono
// buttons, ember active fill, 3px ember bottom rule). The band spans the
// content width, matching how the homepage band stops at the tile edges.
const LIST_RIBBON_V2 = true;

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
  { key: 'composite', title: 'Composite Ranking', color: COLORS.ember },
  { key: 'trueexpert', title: 'True Experts', color: COLORS.ember },
  { key: 'publication', title: 'Expert Publications', color: COLORS.ink },
  { key: 'platform', title: 'Reviews & Ratings Aggregations', color: COLORS.forest },
  { key: 'pricing', title: 'Pricing Data', color: COLORS.rust },
];

// Vote-page ordering: the same universe + ranking the User Vote tab shows, so a
// "Source of Truths User Vote" source matches that page exactly. Items are the
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
  // The composite ranking on chain "best-run" (mode: 'scores') lists renders
  // as its own lead tile in the grouped sources layout.
  if ((src.id || '') === 'ai') return 'composite';
  // The live Source of Truths fan vote is a user-ratings signal.
  if ((src.id || '') === 'cgvote') return 'platform';
  const id = (src.id || '').toLowerCase();
  const label = (src.label || '').toLowerCase();
  if (id === 'pricing' || label.includes('pricing') || label.includes('nightly rate')) {
    return 'pricing';
  }
  // The "Reviews & Ratings Aggregations" group covers any aggregated review or
  // rating signal: user-rating platforms (Yelp/Google/TripAdvisor/Amazon/etc.),
  // readers' choice polls (T+L Readers, CNT Readers' Choice, Newsweek Readers'
  // Choice, Boston.com Readers' Poll, etc. -- aggregated reader votes, not
  // editorial picks), and critic aggregators (Rotten Tomatoes / Tomatometer,
  // Metacritic / Metascore).
  const platformHints = [
    'yelp', 'google', 'tripadvisor', 'trip advisor', 'booking', 'expedia',
    'hotels.com', 'opentable', 'amazon', 'reviews', 'rating',
    'rotten tomatoes', 'tomatometer', 'metacritic', 'metascore',
  ];
  if (platformHints.some((h) => id.includes(h.replace(/[^a-z]/g, '')) || label.includes(h))) {
    return 'platform';
  }
  // Readers' poll / readers' choice routing: an aggregated reader vote is a
  // user-ratings signal, not an editorial pick. Match any label containing the
  // word "readers", but exclude the normal publication Reader's Digest (id
  // 'readersdigest', singular possessive).
  if (id !== 'readersdigest' && /\breaders\b/i.test(src.label || '')) {
    return 'platform';
  }
  return 'publication';
}

// A source's label/button links out whenever it carries a `url` AND the
// source isn't an internal composite. Editorial publications and true experts
// always link; Reviews & Ratings Aggregations sources (Yelp, Google, Amazon,
// Goodreads, TripAdvisor, readers' polls like T+L Readers / CNT Readers'
// Choice, and critic aggregators like Rotten Tomatoes / Metacritic) also link
// when a URL is present — even though their URL may be a search rather than
// an article, the destination is the right place to take a reader who wants
// to dig in. Only the internal `composite` group and the live fan vote
// (`cgvote`, which has no URL) stay non-linking.
function isPublicationLink(src) {
  if (!src || !src.url) return false;
  const g = expertGroupKey(src);
  return g === 'publication' || g === 'trueexpert' || g === 'platform' || g === 'pricing';
}

function ListDetail({ list, viewCount, voteData, userVotes, extras, relatedLists, relatedViews, onBack, onVote, onAddExtra, onOpenRelated, compact }) {
  const mode = list.mode || 'both';
  const showSourceTab = mode !== 'votes';
  const showVoteTab = mode !== 'facts' && mode !== 'scores' && mode !== 'unranked';

  // The list page is one tabbed view: chips switch the content below in place
  // (Consensus, Consensus Sources, Activity Log, Vote) with no navigation.
  const [tab, setTab] = useState('consensus');
  // Deep-links: /list/[id]#vote opens straight to the Vote tab; #sources opens
  // the side-by-side Consensus Sources view; #activity (or #ledger) opens the
  // Activity Log. Old /rankings URLs redirect here with their hash intact.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash === '#vote' && showVoteTab) {
      setTab('vote');
    } else if (window.location.hash === '#sources' && showSourceTab) {
      setTab('source');
    } else if (window.location.hash === '#activity' || window.location.hash === '#ledger') {
      setTab('activity');
    } else if (window.location.hash === '#share') {
      setTab('share');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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

  // Horizontal-scroll affordance for the list-page tab ribbon (mobile): track
  // whether there is more to scroll left/right so we can show a small arrow cue,
  // matching the homepage department nav.
  const listNavRef = useRef(null);
  const [navScroll, setNavScroll] = useState({ left: false, right: false });
  useEffect(() => {
    const el = listNavRef.current;
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
  }, [compact, tab]);

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
    // standalone "Source of Truths User Vote" source built from live fan votes,
    // shown as a Reviews & Ratings Aggregations source at the base of the page.
    const result = getSources(list, voteData, extras);
    const cgVote = {
      id: 'cgvote',
      label: 'Source of Truths User Vote',
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
  const useGroupedLayout = !!consensusSource || mode === 'scores';

  // The header "Top N" label must match the actual number of ranked items
  // (consensus is capped at 10, but short lists have fewer). Never hardcode "Top Ten".
  const topCount = Math.min(
    consensusSource?.items?.length ||
      list.vote?.items?.length ||
      activeSource?.items?.length ||
      10,
    10
  );

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
    <div style={{ position: 'relative', zIndex: 2, maxWidth: 920, margin: '0 auto', padding: '24px 20px 80px' }}>
      {!compact && (
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
      )}

      {!compact && <div style={{ paddingBottom: 0, marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'clamp(16px, 4vw, 28px)' }}>
          <h1
            style={{
              fontFamily: 'Fraunces, serif',
              fontWeight: 800,
              fontSize: 'clamp(30px, 5vw, 50px)',
              lineHeight: 1.02,
              letterSpacing: '-0.02em',
              margin: 0,
              color: COLORS.ink,
              fontVariationSettings: '"SOFT" 100',
            }}
          >
            {list.title}
          </h1>
          <div style={{ flex: 1, minWidth: 120, marginBottom: 6 }}>
            <div
              style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: 'clamp(9px, 1.1vw, 11px)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: COLORS.ember,
                textAlign: 'right',
                marginBottom: 8,
              }}
            >
              {list.isUserSubmitted ? 'Reader Submitted · ' : ''}{list.category} · Top {topCount}
            </div>
            <div style={{ borderBottom: `1px solid ${COLORS.ink}`, marginBottom: 4 }} />
            <div style={{ borderBottom: `2px solid ${COLORS.ember}` }} />
          </div>
        </div>
        <p
          style={{
            fontFamily: 'Fraunces, serif',
            fontStyle: 'italic',
            fontSize: 16,
            lineHeight: 1.45,
            margin: '12px 0 0',
            color: COLORS.faded,
            maxWidth: 640,
          }}
        >
          {list.blurb}
        </p>
      </div>}

      {!compact && <>
        {LIST_RIBBON_V2 && (
          <style>{`.sot-listnav{scrollbar-width:none;-ms-overflow-style:none;}.sot-listnav::-webkit-scrollbar{display:none;}
            @keyframes sotListNudge{0%,100%{transform:translate(0,-50%);}50%{transform:translate(3px,-50%);}}
            @keyframes sotListNudgeL{0%,100%{transform:translate(0,-50%);}50%{transform:translate(-3px,-50%);}}
            .sot-listcue{position:absolute;top:50%;z-index:3;display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:${COLORS.ember};color:${COLORS.cream};box-shadow:0 1px 4px rgba(26,22,17,0.45);pointer-events:none;font-size:15px;line-height:1;}
            .sot-listcue-r{right:8px;animation:sotListNudge 1.4s ease-in-out infinite;}
            .sot-listcue-l{left:8px;animation:sotListNudgeL 1.4s ease-in-out infinite;}
            @media(min-width:760px){.sot-listcue{display:none;}}
          `}</style>
        )}
        <div style={LIST_RIBBON_V2 ? { position: 'sticky', top: 0, zIndex: 25, marginTop: 18 } : { display: 'contents' }}>
        <div
          ref={LIST_RIBBON_V2 ? listNavRef : undefined}
          className={LIST_RIBBON_V2 ? 'sot-listnav' : undefined}
          style={LIST_RIBBON_V2 ? {
            display: 'flex',
            alignItems: 'stretch',
            gap: 0,
            flexWrap: 'nowrap',
            overflowX: 'auto',
            background: COLORS.ink,
            borderBottom: `3px solid ${COLORS.ember}`,
          } : {
            marginTop: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          {/* Tab chips, in order: Consensus, Consensus Sources, Activity
              Log, Vote — then Share and the Request Review modal trigger.
              Chips swap the content below without navigating; each chip
              flex-grows so the row fills the page width edge to edge while
              the gaps stay fixed. */}
            <button
              onClick={() => setTab('consensus')}
              style={{
                flex: LIST_RIBBON_V2 ? '1 0 auto' : '1 1 auto',
                justifyContent: 'center',
                background: tab === 'consensus' ? COLORS.ember : 'transparent',
                color: LIST_RIBBON_V2 ? COLORS.cream : (tab === 'consensus' ? COLORS.cream : COLORS.ember),
                border: LIST_RIBBON_V2 ? 'none' : `1.5px solid ${COLORS.ember}`,
                borderRight: LIST_RIBBON_V2 ? '1px solid rgba(244,237,224,0.18)' : undefined,
                padding: LIST_RIBBON_V2 ? '0 14px' : '8px 14px',
                height: LIST_RIBBON_V2 ? 42 : undefined,
                whiteSpace: LIST_RIBBON_V2 ? 'nowrap' : undefined,
                fontFamily: 'DM Mono, monospace',
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              Consensus
            </button>
            {showSourceTab && (
              <button
                onClick={() => setTab('source')}
                style={{
                  flex: LIST_RIBBON_V2 ? '1 0 auto' : '1 1 auto',
                  justifyContent: 'center',
                  background: tab === 'source' ? COLORS.ember : 'transparent',
                  color: LIST_RIBBON_V2 ? COLORS.cream : (tab === 'source' ? COLORS.cream : COLORS.ember),
                  border: LIST_RIBBON_V2 ? 'none' : `1.5px solid ${COLORS.ember}`,
                  borderRight: LIST_RIBBON_V2 ? '1px solid rgba(244,237,224,0.18)' : undefined,
                  padding: LIST_RIBBON_V2 ? '0 14px' : '8px 14px',
                  height: LIST_RIBBON_V2 ? 42 : undefined,
                  whiteSpace: LIST_RIBBON_V2 ? 'nowrap' : undefined,
                  fontFamily: 'DM Mono, monospace',
                  fontSize: 10,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                Consensus Sources
              </button>
            )}
            <button
              onClick={() => setTab('activity')}
              style={{
                flex: LIST_RIBBON_V2 ? '1 0 auto' : '1 1 auto',
                justifyContent: 'center',
                background: tab === 'activity' ? COLORS.ember : 'transparent',
                color: LIST_RIBBON_V2 ? COLORS.cream : (tab === 'activity' ? COLORS.cream : COLORS.ember),
                border: LIST_RIBBON_V2 ? 'none' : `1.5px solid ${COLORS.ember}`,
                borderRight: LIST_RIBBON_V2 ? '1px solid rgba(244,237,224,0.18)' : undefined,
                padding: LIST_RIBBON_V2 ? '0 14px' : '8px 14px',
                height: LIST_RIBBON_V2 ? 42 : undefined,
                whiteSpace: LIST_RIBBON_V2 ? 'nowrap' : undefined,
                fontFamily: 'DM Mono, monospace',
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              Activity Log
            </button>
            {showVoteTab && (
              <button
                onClick={() => setTab('vote')}
                style={{
                  flex: LIST_RIBBON_V2 ? '1 0 auto' : '1 1 auto',
                  justifyContent: 'center',
                  background: tab === 'vote' ? COLORS.ember : 'transparent',
                  color: LIST_RIBBON_V2 ? COLORS.cream : (tab === 'vote' ? COLORS.cream : COLORS.ember),
                  border: LIST_RIBBON_V2 ? 'none' : `1.5px solid ${COLORS.ember}`,
                  borderRight: LIST_RIBBON_V2 ? '1px solid rgba(244,237,224,0.18)' : undefined,
                  padding: LIST_RIBBON_V2 ? '0 14px' : '8px 14px',
                  height: LIST_RIBBON_V2 ? 42 : undefined,
                  whiteSpace: LIST_RIBBON_V2 ? 'nowrap' : undefined,
                  fontFamily: 'DM Mono, monospace',
                  fontSize: 10,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                Vote
              </button>
            )}
            <button
              onClick={() => setTab('share')}
              style={{
                flex: LIST_RIBBON_V2 ? '1 0 auto' : '1 1 auto',
                justifyContent: 'center',
                background: tab === 'share' ? COLORS.ember : 'transparent',
                color: LIST_RIBBON_V2 ? COLORS.cream : (tab === 'share' ? COLORS.cream : COLORS.ember),
                border: LIST_RIBBON_V2 ? 'none' : `1.5px solid ${COLORS.ember}`,
                borderRight: LIST_RIBBON_V2 ? '1px solid rgba(244,237,224,0.18)' : undefined,
                padding: LIST_RIBBON_V2 ? '0 14px' : '8px 14px',
                height: LIST_RIBBON_V2 ? 42 : undefined,
                whiteSpace: LIST_RIBBON_V2 ? 'nowrap' : undefined,
                fontFamily: 'DM Mono, monospace',
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Share2 size={12} strokeWidth={2.5} />
              Share
            </button>
            <button
              onClick={() => { setComplainSent(false); setComplainOpen(true); }}
              style={{
                flex: LIST_RIBBON_V2 ? '1 0 auto' : '1 1 auto',
                justifyContent: 'center',
                background: 'transparent',
                color: LIST_RIBBON_V2 ? COLORS.cream : COLORS.ink,
                border: LIST_RIBBON_V2 ? 'none' : `1.5px solid ${COLORS.ink}`,
                padding: LIST_RIBBON_V2 ? '0 14px' : '8px 14px',
                height: LIST_RIBBON_V2 ? 42 : undefined,
                whiteSpace: LIST_RIBBON_V2 ? 'nowrap' : undefined,
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
              Request Review
            </button>
        </div>
        {LIST_RIBBON_V2 && navScroll.left && <span aria-hidden="true" className="sot-listcue sot-listcue-l">&#8249;</span>}
        {LIST_RIBBON_V2 && navScroll.right && <span aria-hidden="true" className="sot-listcue sot-listcue-r">&#8250;</span>}
        </div>
      </>}

      <div style={{ marginTop: compact ? 5 : 24 }} />

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

      {tab === 'consensus' ? (
        <ListOverview
          list={list}
          voteData={voteData}
          extras={extras}
          embedded
          onBack={onBack}
          onOpenSources={
            showSourceTab
              ? () => { setTab('source'); if (typeof window !== 'undefined') window.scrollTo({ top: 0 }); }
              : undefined
          }
          onOpenVote={
            showVoteTab
              ? () => { setTab('vote'); if (typeof window !== 'undefined') window.scrollTo({ top: 0 }); }
              : undefined
          }
        />
      ) : tab === 'share' ? (
        <SnapshotClient listId={list.id} embedded list={list} voteData={voteData} extras={extras} />
      ) : tab === 'activity' ? (
        <ActivityFeed list={list} voteData={voteData} extras={extras} />
      ) : tab === 'source' && showSourceTab ? (
        <>
          {useGroupedLayout ? null : sources.length > 1 ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
              {sources.map((s) => {
                const active = activeSourceId === s.id;
                const isConsensus = s.id === 'consensus';
                const borderColor = isConsensus ? COLORS.ember : COLORS.ink;
                const activeBg = isConsensus ? COLORS.ember : COLORS.ink;
                // When a source button is already selected and the source has a
                // real URL, a second click opens that source in a new tab.
                const linkable = active && !!s.url && isPublicationLink(s);
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

          {useGroupedLayout ? (
            <>
              {/* All sources side by side as tiled lists; the grid wraps extra
                  sources down into new rows when the row is full. */}
              <style>{`.src-tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px;align-items:start;}`}</style>
              <div className="src-tiles">
                {EXPERT_GROUPS.map((group) =>
                  expertSources
                    .filter((s) => expertGroupKey(s) === group.key)
                    .map((s) => (
                      <div key={s.id} style={{ border: `1.5px solid ${COLORS.ink}`, background: COLORS.paper }}>
                        <div
                          style={{
                            background: group.color,
                            color: COLORS.cream,
                            padding: '9px 12px',
                            fontFamily: 'DM Mono, monospace',
                            fontSize: 10,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            fontWeight: 700,
                            lineHeight: 1.4,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 8.5,
                              letterSpacing: '0.18em',
                              opacity: 0.78,
                              fontWeight: 600,
                              marginBottom: 3,
                            }}
                          >
                            {group.title}
                          </div>
                          {isPublicationLink(s) ? (
                            <a
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: 2 }}
                            >
                              {s.label} ↗
                            </a>
                          ) : (
                            s.label
                          )}
                        </div>
                        <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                          {s.items.map((item, i) => (
                            <li
                              key={i}
                              style={{
                                display: 'flex',
                                gap: 8,
                                alignItems: 'baseline',
                                padding: '7px 12px',
                                borderBottom: i === s.items.length - 1 ? 'none' : '1px solid #d8cdb8',
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: 'DM Mono, monospace',
                                  fontSize: 9,
                                  color: COLORS.faded,
                                  minWidth: 18,
                                  textAlign: 'right',
                                  flexShrink: 0,
                                }}
                              >
                                {s.unordered ? '•' : `${i + 1}.`}
                              </span>
                              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12.5, color: COLORS.ink, lineHeight: 1.35 }}>
                                {s.id === 'pricing' ? priceDecorate(item, list) : (s.id === 'ai' && list.scores ? scoreDecorate(item, list) : item)}
                              </span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    ))
                )}
              </div>

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
                Every source side by side · tap an underlined source title to open the original
              </p>
            </>
          ) : (
            <>
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
                  Showing:{' '}
                  {activeSource?.url && isPublicationLink(activeSource) ? (
                    <a
                      href={activeSource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: '2px' }}
                    >
                      {activeSource.label || 'Source'}
                    </a>
                  ) : (
                    activeSource?.label || 'Source'
                  )}
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
                Tap any entry to see links · affiliate links may earn a commission
              </p>
            </>
          )}
        </>
      ) : showVoteTab ? (
        <>
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
                  {isSelected && (
                    <div
                      style={{
                        fontFamily: 'DM Mono, monospace',
                        fontSize: 10,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: COLORS.cream,
                      }}
                    >
                      {selectedSlot === '1' ? 'Your 1st pick' : selectedSlot === '2' ? 'Your 2nd pick' : 'Your 3rd pick'}
                    </div>
                  )}
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
            More Lists
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {relatedLists.map((rl) => (
              <HomeTile
                key={rl.id}
                list={rl}
                rank={0}
                views={(relatedViews || {})[rl.id] || 0}
                voteData={voteData}
                extras={[]}
                href={`/list/${encodeURIComponent(rl.id)}`}
                onClick={() => { if (onOpenRelated) onOpenRelated(rl.id); }}
                showConsensus={true}
                featured={false}
                relatedLists={null}
              />
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
// "Pics" Yelp/Google links are built from the name + neighborhood.
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
  // For lists whose title names a specific menu item (Best Burgers, Best Pizza,
  // Best Pasta...), `picsTerm` holds the singular item word; appending it to the
  // Google Image query makes the photos show that dish, not the storefront.
  const picsTerm = (list.picsTerm || '').trim();
  const gq = encodeURIComponent((base + ' ' + loc + ' ' + picsTerm).replace(/\s+/g, ' ').trim());
  const tq = encodeURIComponent((base + ' ' + loc).replace(/\s+/g, ' ').trim());
  const pick = (map) => (map && (map[name] || map[base])) || null;
  const website = pick(list.itemLinks);
  // Yelp / TripAdvisor link to the actual business page only when a real URL is
  // stored for the item; otherwise the chip is omitted and only Google is shown.
  const yelp = pick(list.itemYelp);
  const tripadvisor = pick(list.itemTripadvisor);
  // Video review link (e.g. a One Bite / Dave Portnoy YouTube review). Present
  // only when a true-expert source for the topic publishes per-item video and a
  // real URL is stored in list.itemVideo; otherwise the chip is omitted.
  const video = pick(list.itemVideo);
  return {
    website,
    map: buildItemLink(name, list),
    yelp,
    google: `https://www.google.com/search?q=${gq}&tbm=isch`,
    tripadvisor,
    video,
  };
}

// Per-category "pics" convention for the hover menu. The label is always a
// plain "Pics:" for every category (the old "Food Pics:" food-list variant was
// retired 2026-06-05 for consistency); the chip set still varies by category
// (hotels get TripAdvisor + Google, everything else Yelp/local platform + Google).
function entryPicsConfig(list) {
  const tags = list.tags || [];
  const type = list.type || '';
  // Regions without real Yelp coverage substitute the local platform (Tabelog,
  // OpenRice, TheFork...): `itemYelp` then stores that platform's business-page
  // URLs and `itemYelpLabel` renames the chip accordingly.
  const yelpLabel = list.itemYelpLabel || 'Yelp';
  // Venue-first places (breweries, beach clubs, wineries, distilleries):
  // always "Pics:", regardless of other tags.
  const venueKey = `${list.title || ''} ${list.id || ''}`.toLowerCase();
  const isVenue = /brewer|beach[\s-]?club|winer|distiller/.test(venueKey);
  if (isVenue) return { label: 'Pics:', links: [['yelp', yelpLabel], ['google', 'Google']] };
  // Bars / nightlife: checked before food so the branch order stays identical
  // to the overview-page mirror (labels are all "Pics:" now).
  const isBar = tags.includes('bars') || tags.includes('nightlife');
  if (isBar) return { label: 'Pics:', links: [['yelp', yelpLabel], ['google', 'Google']] };
  // Explicit food venues (restaurants, bakeries, cafes).
  const isFood = type === 'food' || tags.includes('food') || tags.includes('food-drink');
  if (isFood) return { label: 'Pics:', links: [['yelp', yelpLabel], ['google', 'Google']] };
  // Hotels / travel: "Pics:" with TripAdvisor.
  const isHotel = type === 'travel' || tags.includes('travel') || tags.includes('luxury');
  if (isHotel) return { label: 'Pics:', links: [['tripadvisor', 'TripAdvisor'], ['google', 'Google']] };
  return { label: 'Pics:', links: [['yelp', yelpLabel], ['google', 'Google']] };
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

// Filled-ink CTA chip for the affiliate Rent / Buy links (digital purchase of a
// film or song). Distinct from the outlined aux chips and the ember video chip
// so it reads as a purchase call to action. The retailer is never named.
function buyChip() {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    color: COLORS.cream,
    background: COLORS.ink,
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
  const [expanded, setExpanded] = useState(false);
  const aux = (list.itemLinks || list.itemYelp || list.itemTripadvisor || list.linkType === 'mapsCity') ? buildAuxLinks(item, list) : null;
  const pics = aux ? entryPicsConfig(list) : null;
  // For non-aux items (products, films, etc.) the primary link is still available
  // via buildItemLink — shown as a single chip when expanded.
  const primaryLink = !aux ? buildItemLink(item, list) : null;
  // Video review chip (One Bite / Dave Portnoy YouTube review etc.). Shown for
  // any list that stores a per-item URL in list.itemVideo, location list or not.
  const video = list.itemVideo ? (list.itemVideo[item] || null) : null;
  const videoLabel = list.itemVideoLabel || 'Video';
  // Affiliate purchase links. list.buyLinks === 'video' renders Rent + Buy chips
  // (both to the title page), 'music' renders a single Buy chip. The per-item
  // URL lives in list.itemBuy; the retailer is never named on the button.
  const buyMode = list.buyLinks || null;
  const buyUrl = list.itemBuy ? (list.itemBuy[item] || null) : null;
  const hasLinks = !!(aux || primaryLink || video || buyUrl);

  return (
    <li
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: unranked ? 14 : 18,
        padding: '20px 0',
        borderBottom: `1px solid ${COLORS.ink}`,
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
            opacity: rank > 10 ? 0.85 : 1,
            width: 50,
            flexShrink: 0,
            textAlign: 'left',
            fontVariationSettings: '"SOFT" 100, "WONK" 1',
            fontFeatureSettings: '"lnum" 1',
          }}
        >
          {String(rank)}
        </span>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, flex: 1, minWidth: 0 }}>
        {/* Row button — hover shows subtle lift, click toggles link panel */}
        <button
          onClick={() => hasLinks && setExpanded((e) => !e)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '2px 6px 2px 0',
            cursor: hasLinks ? 'pointer' : 'default',
            textAlign: 'left',
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: 8,
            transition: 'transform 0.12s ease, box-shadow 0.12s ease',
            transform: hover && hasLinks ? 'translate(-2px, -2px)' : 'none',
            boxShadow: hover && hasLinks ? `3px 3px 0 ${COLORS.ember}` : 'none',
          }}
        >
          <span
            style={{
              fontFamily: 'Fraunces, serif',
              fontSize: unranked ? 20 : isTop ? 28 : showFullSize ? 22 : 19,
              fontWeight: unranked ? 500 : isTop ? 700 : 500,
              lineHeight: 1.15,
              color: COLORS.ink,
              letterSpacing: '-0.01em',
              opacity: !unranked && rank > 10 ? 0.85 : 1,
            }}
          >
            {display}
          </span>
          {hasLinks && (
            expanded
              ? <ChevronUp size={isTop ? 14 : 12} strokeWidth={2.5} style={{ color: COLORS.ember, flexShrink: 0, opacity: 0.8 }} />
              : <ChevronDown size={isTop ? 14 : 12} strokeWidth={2.5} style={{ color: COLORS.ember, flexShrink: 0, opacity: hover ? 0.7 : 0 }} />
          )}
        </button>

        {/* Description (shown when expanded) */}
        {expanded && DESCRIPTIONS[list.id]?.[item] && (
          <p
            style={{
              margin: '10px 0 0',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 14,
              lineHeight: 1.55,
              color: COLORS.faded,
              maxWidth: 560,
            }}
          >
            {DESCRIPTIONS[list.id]?.[item]}
          </p>
        )}

        {/* Expanded link panel */}
        {expanded && hasLinks && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '6px 10px',
              fontFamily: 'DM Mono, monospace',
              fontSize: 11,
              letterSpacing: '0.04em',
              marginTop: (list.descriptions && list.descriptions[item]) ? 10 : 10,
              marginBottom: 4,
            }}
          >
            {aux ? (
              <>
                {aux.website && (
                  <a href={aux.website} target="_blank" rel="noopener noreferrer" style={auxChip()}>
                    <Globe size={11} strokeWidth={2.2} /> Website
                  </a>
                )}
                <a href={aux.map} target="_blank" rel="noopener noreferrer" style={auxChip()}>
                  <MapPin size={11} strokeWidth={2.2} /> Map
                </a>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: `1.3px solid ${COLORS.ink}`, borderRadius: 4, padding: '4px 9px' }}>
                  <span style={{ textTransform: 'uppercase', color: COLORS.ink }}>{pics.label}</span>
                  {pics.links.filter(([key]) => aux[key]).map(([key, label], i) => (
                    <React.Fragment key={key}>
                      {i > 0 && <span style={{ color: COLORS.ink }}>|</span>}
                      <a href={aux[key]} target="_blank" rel="noopener noreferrer" style={{ color: COLORS.ink, textDecoration: 'none' }}>{label}</a>
                    </React.Fragment>
                  ))}
                </span>
              </>
            ) : (
              <a href={primaryLink} target="_blank" rel="noopener noreferrer sponsored" style={auxChip()}>
                <ExternalLink size={11} strokeWidth={2.2} /> {list.linkLabel || 'View'}
              </a>
            )}
            {video && (
              <a
                href={video}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...auxChip(), background: COLORS.ember, color: COLORS.cream, border: `1.3px solid ${COLORS.ember}` }}
              >
                <Play size={11} strokeWidth={2.2} fill={COLORS.cream} /> {videoLabel}
              </a>
            )}
            {buyUrl && buyMode === 'video' && (
              <>
                <a href={buyUrl} target="_blank" rel="noopener noreferrer sponsored" style={buyChip()}>
                  <Clock size={11} strokeWidth={2.2} /> Rent
                </a>
                <a href={buyUrl} target="_blank" rel="noopener noreferrer sponsored" style={buyChip()}>
                  <ShoppingBag size={11} strokeWidth={2.2} /> Buy
                </a>
              </>
            )}
            {buyUrl && buyMode === 'music' && (
              <a href={buyUrl} target="_blank" rel="noopener noreferrer sponsored" style={buyChip()}>
                <ShoppingBag size={11} strokeWidth={2.2} /> Buy
              </a>
            )}
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
  const [allViews, setAllViews] = useState({});
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
        setAllViews(data.views || {});
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

    const scored = allLists
      .filter((l) => l.id !== list.id)
      .map((l) => {
        const theirTags = getListTags(l);
        const overlap = theirTags.filter((t) => myTags.has(t)).length;
        return { list: l, overlap };
      })
      .filter((x) => x.overlap > 0)
      .sort((a, b) => b.overlap - a.overlap);

    if (scored.length >= 6) return scored.slice(0, 6).map((x) => x.list);

    const usedIds = new Set(scored.map((x) => x.list.id));
    const fillers = allLists.filter((l) => l.id !== list.id && !usedIds.has(l.id));
    return [...scored.map((x) => x.list), ...fillers].slice(0, 6);
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
        overflow: LIST_RIBBON_V2 ? 'clip' : 'hidden',
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
          relatedViews={allViews}
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
