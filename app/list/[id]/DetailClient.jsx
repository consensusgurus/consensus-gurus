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

function ListDetail({ list, viewCount, voteData, userVotes, extras, relatedLists, onBack, onVote, onAddExtra, onOpenRelated }) {
  const mode = list.mode || 'both';
  const showSourceTab = mode !== 'votes';
  const showVoteTab = mode !== 'facts';

  const [tab, setTab] = useState(showSourceTab ? 'source' : 'vote');
  const [activeVoteSlot, setActiveVoteSlot] = useState(null);
  const [voteSelections, setVoteSelections] = useState({ 1: null, 2: null, 3: null });
  const [userCurrentVote, setUserCurrentVote] = useState({ 1: null, 2: null, 3: null });
  const [hasVoted, setHasVoted] = useState(false);
  const [voteMessage, setVoteMessage] = useState('');

  // Sources now factor in live vote data so the Consensus chip stays accurate
  // as people vote in real time. For facts-only lists, use the hardcoded ai source.
  const sources = useMemo(() => {
    if (!showSourceTab) return [];
    
    // For facts-only lists: use the hardcoded 'ai' source directly
    if (mode === 'facts') {
      const aiItems = list.sources?.ai?.items || [];
      if (aiItems.length > 0) {
        return [{
          id: 'ai',
          label: list.sources?.ai?.label || 'Consensus AI',
          items: aiItems,
        }];
      }
      return [];
    }
    
    // For 'both' mode lists: compute Consensus from publications
    return getSources(list, voteData, extras);
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

    // Move to next slot if available
    const nextSlot = slot === 1 ? 2 : slot === 2 ? 3 : null;
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

  const showBothTabs = showSourceTab && showVoteTab;

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
            <span>{viewCount} views</span>
          </div>
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

      {showBothTabs && (
        <div
          style={{
            display: 'flex',
            gap: 0,
            marginTop: 28,
            marginBottom: 18,
            border: `1.5px solid ${COLORS.ink}`,
          }}
        >
          <TabButton
            active={tab === 'source'}
            onClick={() => setTab('source')}
            icon={list.isUserSubmitted ? <PenLine size={14} strokeWidth={2.5} /> : <BarChart3 size={14} strokeWidth={2.5} />}
          >
            {list.isUserSubmitted ? 'As Submitted' : 'By the Rankings'}
          </TabButton>
          <TabButton active={tab === 'vote'} onClick={() => setTab('vote')} icon={<Users size={14} strokeWidth={2.5} />}>
            By the People
          </TabButton>
        </div>
      )}

      {!showBothTabs && <div style={{ marginTop: 28 }} />}

      {tab === 'source' && showSourceTab ? (
        <>
          {sources.length > 1 ? (
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

          <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {(activeSource?.items || []).map((item, i) => (
              <DataRow key={i} rank={i + 1} item={item} list={list} />
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

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 40,
              marginBottom: 40,
              opacity: hasVoted ? 0.6 : 1,
              pointerEvents: hasVoted ? 'none' : 'auto',
            }}
          >
            {/* LEFT: All Items List */}
            <div>
              <div
                style={{
                  fontFamily: 'DM Mono, monospace',
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: COLORS.faded,
                  fontWeight: 600,
                  marginBottom: 16,
                }}
              >
                {sortedVote.some((item) => item.score !== 0) ? 'By the People' : 'Current Consensus'}
              </div>

              <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 0 }}>
                {sortedVote.map((entry, idx) => {
                  const isSelected = Object.values(voteSelections).includes(entry.item);
                  const selectedSlot = Object.entries(voteSelections).find(([, v]) => v === entry.item)?.[0];
                  const isClickable = activeVoteSlot !== null && !isSelected;
                  const linksDisabled = activeVoteSlot !== null;
                  
                  return (
                    <li
                      key={entry.item}
                      onClick={() => {
                        if (isClickable) {
                          selectItemForVote(entry.item, activeVoteSlot);
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '14px 12px',
                        borderBottom: entry.isTopTen && idx === 0 ? `2px solid ${COLORS.ember}` : `1px solid ${COLORS.ink}`,
                        cursor: isClickable ? 'pointer' : activeVoteSlot && isSelected ? 'default' : 'default',
                        transition: 'all 0.2s ease',
                        background: selectedSlot === '1' ? COLORS.ember : selectedSlot === '2' ? COLORS.ink : selectedSlot === '3' ? COLORS.faded : 'transparent',
                        color: isSelected ? COLORS.cream : COLORS.ink,
                        opacity: activeVoteSlot && !isClickable && !isSelected ? 0.4 : 1,
                        transform: isClickable ? 'translate(2px, 0)' : 'none',
                      }}
                      onMouseEnter={(e) => {
                        if (isClickable) {
                          e.currentTarget.style.background = '#ebe2d0';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = selectedSlot === '1' ? COLORS.ember : selectedSlot === '2' ? COLORS.ink : selectedSlot === '3' ? COLORS.faded : 'transparent';
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'Fraunces, serif',
                          fontWeight: 900,
                          fontSize: entry.isTopTen && idx === 0 ? 44 : 32,
                          lineHeight: 0.85,
                          minWidth: 52,
                          color: 'inherit',
                        }}
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div style={{ flex: 1 }}>
                        <ItemLink
                          list={list}
                          item={entry.item}
                          style={{
                            fontFamily: 'Fraunces, serif',
                            fontSize: 18,
                            fontWeight: 500,
                            color: 'inherit',
                            textDecoration: 'none',
                            borderBottom: linksDisabled ? 'none' : `1px solid currentColor`,
                            pointerEvents: linksDisabled ? 'none' : 'auto',
                            opacity: linksDisabled ? 0.5 : 1,
                          }}
                        >
                          <span>{entry.item}</span>
                          {!linksDisabled && <ExternalLink size={11} strokeWidth={2} style={{ opacity: 0.4, flexShrink: 0, marginLeft: 4 }} />}
                        </ItemLink>
                        <div
                          style={{
                            fontFamily: 'DM Mono, monospace',
                            fontSize: 10,
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            color: entry.score > 0 ? '#2d5016' : entry.score < 0 ? COLORS.ember : COLORS.faded,
                            marginTop: 4,
                            opacity: 'inherit',
                          }}
                        >
                          {entry.score > 0 ? `+${entry.score}` : entry.score} {Math.abs(entry.score) === 1 ? 'point' : 'points'}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* RIGHT: Vote Selection Boxes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div
                style={{
                  fontFamily: 'DM Mono, monospace',
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: COLORS.faded,
                  fontWeight: 600,
                  marginBottom: 0,
                }}
              >
                {hasVoted ? 'Your Vote' : 'Your Picks'}
              </div>

              {hasVoted && (userCurrentVote[1] || userCurrentVote[2] || userCurrentVote[3]) && (
                <>
                  {userCurrentVote[1] && (
                    <div
                      style={{
                        padding: 16,
                        background: COLORS.ember,
                        color: COLORS.cream,
                        border: `1.5px solid ${COLORS.ember}`,
                        fontFamily: 'Fraunces, serif',
                        fontSize: 16,
                        fontWeight: 600,
                        marginBottom: 12,
                      }}
                    >
                      1st Place (3 pts): {userCurrentVote[1]}
                    </div>
                  )}
                  {userCurrentVote[2] && (
                    <div
                      style={{
                        padding: 16,
                        background: COLORS.ink,
                        color: COLORS.cream,
                        border: `1.5px solid ${COLORS.ink}`,
                        fontFamily: 'Fraunces, serif',
                        fontSize: 16,
                        fontWeight: 600,
                        marginBottom: 12,
                      }}
                    >
                      2nd Place (2 pts): {userCurrentVote[2]}
                    </div>
                  )}
                  {userCurrentVote[3] && (
                    <div
                      style={{
                        padding: 16,
                        background: COLORS.faded,
                        color: COLORS.cream,
                        border: `1.5px solid ${COLORS.faded}`,
                        fontFamily: 'Fraunces, serif',
                        fontSize: 16,
                        fontWeight: 600,
                      }}
                    >
                      3rd Place (1 pt): {userCurrentVote[3]}
                    </div>
                  )}
                </>
              )}

              {!hasVoted && (
              <>
              <div
                onClick={() => activateVoteSlot(1)}
                style={{
                  padding: 20,
                  border: activeVoteSlot === 1 ? `1.5px solid ${COLORS.ember}` : `1.5px solid ${COLORS.ink}`,
                  background: voteSelections[1] ? COLORS.ink : activeVoteSlot === 1 ? COLORS.ink : '#ebe2d0',
                  color: voteSelections[1] || activeVoteSlot === 1 ? COLORS.cream : COLORS.ink,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: activeVoteSlot === 1 ? `4px 4px 0 ${COLORS.ember}` : voteSelections[1] ? `4px 4px 0 ${COLORS.ember}` : 'none',
                  transform: activeVoteSlot === 1 || voteSelections[1] ? 'translate(-2px, -2px)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  minHeight: 100,
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: 10,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    opacity: 0.8,
                  }}
                >
                  1st Place · 3 Points
                </div>
                <div
                  style={{
                    fontFamily: 'Fraunces, serif',
                    fontSize: 18,
                    fontWeight: 600,
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    fontStyle: !voteSelections[1] ? 'italic' : 'normal',
                    color: !voteSelections[1] && activeVoteSlot !== 1 ? COLORS.faded : 'inherit',
                  }}
                >
                  {voteSelections[1] || 'Click to select'}
                </div>
                {voteSelections[1] && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeVoteSelection(1);
                    }}
                    style={{
                      alignSelf: 'flex-start',
                      background: 'transparent',
                      border: 'none',
                      color: 'inherit',
                      cursor: 'pointer',
                      fontFamily: 'DM Mono, monospace',
                      fontSize: 10,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      padding: '4px 0',
                      textDecoration: 'underline',
                    }}
                  >
                    Remove
                  </button>
                )}
                {activeVoteSlot === 1 && !voteSelections[1] && (
                  <div
                    style={{
                      fontFamily: 'DM Mono, monospace',
                      fontSize: 9,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      color: COLORS.cream,
                    }}
                  >
                    Click list item
                  </div>
                )}
              </div>

              {/* 2nd Place Slot */}
              <div
                onClick={() => activateVoteSlot(2)}
                style={{
                  padding: 20,
                  border: activeVoteSlot === 2 ? `1.5px solid ${COLORS.ember}` : `1.5px solid ${COLORS.ink}`,
                  background: voteSelections[2] ? COLORS.ink : activeVoteSlot === 2 ? COLORS.ink : '#ebe2d0',
                  color: voteSelections[2] || activeVoteSlot === 2 ? COLORS.cream : COLORS.ink,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: activeVoteSlot === 2 ? `4px 4px 0 ${COLORS.ember}` : voteSelections[2] ? `4px 4px 0 ${COLORS.ember}` : 'none',
                  transform: activeVoteSlot === 2 || voteSelections[2] ? 'translate(-2px, -2px)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  minHeight: 100,
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: 10,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    opacity: 0.8,
                  }}
                >
                  2nd Place · 2 Points
                </div>
                <div
                  style={{
                    fontFamily: 'Fraunces, serif',
                    fontSize: 18,
                    fontWeight: 600,
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    fontStyle: !voteSelections[2] ? 'italic' : 'normal',
                    color: !voteSelections[2] && activeVoteSlot !== 2 ? COLORS.faded : 'inherit',
                  }}
                >
                  {voteSelections[2] || 'Click to select'}
                </div>
                {voteSelections[2] && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeVoteSelection(2);
                    }}
                    style={{
                      alignSelf: 'flex-start',
                      background: 'transparent',
                      border: 'none',
                      color: 'inherit',
                      cursor: 'pointer',
                      fontFamily: 'DM Mono, monospace',
                      fontSize: 10,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      padding: '4px 0',
                      textDecoration: 'underline',
                    }}
                  >
                    Remove
                  </button>
                )}
                {activeVoteSlot === 2 && !voteSelections[2] && (
                  <div
                    style={{
                      fontFamily: 'DM Mono, monospace',
                      fontSize: 9,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      color: COLORS.cream,
                    }}
                  >
                    Click list item
                  </div>
                )}
              </div>

              {/* 3rd Place Slot */}
              <div
                onClick={() => activateVoteSlot(3)}
                style={{
                  padding: 20,
                  border: activeVoteSlot === 3 ? `1.5px solid ${COLORS.ember}` : `1.5px solid ${COLORS.ink}`,
                  background: voteSelections[3] ? COLORS.ink : activeVoteSlot === 3 ? COLORS.ink : '#ebe2d0',
                  color: voteSelections[3] || activeVoteSlot === 3 ? COLORS.cream : COLORS.ink,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: activeVoteSlot === 3 ? `4px 4px 0 ${COLORS.ember}` : voteSelections[3] ? `4px 4px 0 ${COLORS.ember}` : 'none',
                  transform: activeVoteSlot === 3 || voteSelections[3] ? 'translate(-2px, -2px)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  minHeight: 100,
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: 10,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    opacity: 0.8,
                  }}
                >
                  3rd Place · 1 Point
                </div>
                <div
                  style={{
                    fontFamily: 'Fraunces, serif',
                    fontSize: 18,
                    fontWeight: 600,
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    fontStyle: !voteSelections[3] ? 'italic' : 'normal',
                    color: !voteSelections[3] && activeVoteSlot !== 3 ? COLORS.faded : 'inherit',
                  }}
                >
                  {voteSelections[3] || 'Click to select'}
                </div>
                {voteSelections[3] && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeVoteSelection(3);
                    }}
                    style={{
                      alignSelf: 'flex-start',
                      background: 'transparent',
                      border: 'none',
                      color: 'inherit',
                      cursor: 'pointer',
                      fontFamily: 'DM Mono, monospace',
                      fontSize: 10,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      padding: '4px 0',
                      textDecoration: 'underline',
                    }}
                  >
                    Remove
                  </button>
                )}
                {activeVoteSlot === 3 && !voteSelections[3] && (
                  <div
                    style={{
                      fontFamily: 'DM Mono, monospace',
                      fontSize: 9,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      color: COLORS.cream,
                    }}
                  >
                    Click list item
                  </div>
                )}
              </div>

              <button
                onClick={submitVote}
                disabled={!voteSelections[1] && !voteSelections[2] && !voteSelections[3] || hasVoted}
                style={{
                  marginTop: 8,
                  padding: '12px 20px',
                  background: COLORS.ink,
                  color: COLORS.cream,
                  border: 'none',
                  fontFamily: 'DM Mono, monospace',
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  cursor: voteSelections[1] || voteSelections[2] || voteSelections[3] ? 'pointer' : 'not-allowed',
                  opacity: voteSelections[1] || voteSelections[2] || voteSelections[3] ? 1 : 0.4,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if ((voteSelections[1] || voteSelections[2] || voteSelections[3]) && !hasVoted) {
                    e.currentTarget.style.transform = 'translate(-2px, -2px)';
                    e.currentTarget.style.boxShadow = `4px 4px 0 ${COLORS.ember}`;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {hasVoted ? 'You Already Voted' : 'Submit Your Vote'}
              </button>

              <div
                style={{
                  fontFamily: 'DM Mono, monospace',
                  fontSize: 10,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: COLORS.faded,
                  textAlign: 'center',
                  marginTop: 20,
                  paddingTop: 20,
                  borderTop: `1px solid ${COLORS.ink}`,
                }}
              >
                Submit 1, 2, or all 3 picks. You can update your vote anytime.
              </div>
              </>
              )}
            </div>
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
              placeholder="Add an entry the list is missing..."
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

function DataRow({ rank, item, list }) {
  const isTop = rank === 1;
  const showFullSize = rank <= 10;
  return (
    <li
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 18,
        padding: showFullSize ? '20px 0' : '14px 0',
        borderBottom: `1px solid ${COLORS.ink}`,
        opacity: rank > 10 ? 0.85 : 1,
      }}
    >
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
      <ItemLink
        list={list}
        item={item}
        style={{
          fontFamily: 'Fraunces, serif',
          fontSize: isTop ? 28 : showFullSize ? 22 : 19,
          fontWeight: isTop ? 700 : 500,
          lineHeight: 1.15,
          color: COLORS.ink,
          letterSpacing: '-0.01em',
          flex: 1,
        }}
      >
        <span>{item}</span>
        <ExternalLink size={isTop ? 14 : 12} strokeWidth={2} style={{ opacity: 0.4, flexShrink: 0 }} />
      </ItemLink>
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
