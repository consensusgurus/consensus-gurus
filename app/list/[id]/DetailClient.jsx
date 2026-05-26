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

  const sources = useMemo(() => (showSourceTab ? getSources(list) : []), [list, showSourceTab]);
  const [activeSourceId, setActiveSourceId] = useState(list.defaultSource || sources[0]?.id);
  const [newItem, setNewItem] = useState('');
  const [addError, setAddError] = useState('');

  const activeSource = sources.find((s) => s.id === activeSourceId) || sources[0];

  const sortedVote = useMemo(() => {
    if (!showVoteTab) return [];
    const base = list.vote?.items || [];
    const all = dedupeByName([...base, ...extras]);
    const scored = all.map((item, idx) => ({
      item,
      score: voteData[voteKey(list.id, item)] || 0,
      origIdx: idx,
    }));
    scored.sort((a, b) => b.score - a.score || a.origIdx - b.origIdx);
    return scored;
  }, [list, voteData, extras, showVoteTab]);

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
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  fontFamily: 'DM Mono, monospace',
                  fontSize: 10,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: COLORS.faded,
                  marginBottom: 8,
                  display: 'block',
                }}
              >
                Source
              </label>
              <div style={{ position: 'relative', display: 'inline-block', minWidth: 280, maxWidth: '100%' }}>
                <select
                  value={activeSourceId}
                  onChange={(e) => setActiveSourceId(e.target.value)}
                  style={{
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    background: COLORS.paper,
                    border: `1.5px solid ${COLORS.ink}`,
                    padding: '12px 40px 12px 14px',
                    fontFamily: 'Fraunces, serif',
                    fontSize: 17,
                    fontWeight: 600,
                    color: COLORS.ink,
                    cursor: 'pointer',
                    width: '100%',
                    fontVariationSettings: '"SOFT" 100',
                  }}
                >
                  {sources.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  strokeWidth={2.5}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: COLORS.ink,
                  }}
                />
              </div>
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

          <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {sortedVote.map((entry, i) => (
              <VoteRow
                key={entry.item}
                rank={i + 1}
                item={entry.item}
                list={list}
                score={entry.score}
                userVote={userVotes[voteKey(list.id, entry.item)] || 0}
                onUp={() => onVote(list.id, entry.item, 1)}
                onDown={() => onVote(list.id, entry.item, -1)}
              />
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
            Votes shared across all readers · ties broken by default order
          </p>
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
    </div>
  );
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

function VoteRow({ rank, item, list, score, userVote, onUp, onDown }) {
  const isTop = rank === 1;
  return (
    <li
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '16px 0',
        borderBottom: `1px solid ${COLORS.ink}`,
      }}
    >
      <span
        style={{
          fontFamily: 'Fraunces, serif',
          fontWeight: 900,
          fontSize: isTop ? 44 : 32,
          lineHeight: 0.85,
          color: isTop ? COLORS.ember : rank > 10 ? COLORS.faded : COLORS.ink,
          minWidth: 52,
          fontVariationSettings: '"SOFT" 100',
          fontFeatureSettings: '"lnum" 1',
        }}
      >
        {String(rank).padStart(2, '0')}
      </span>

      <div style={{ flex: 1 }}>
        <ItemLink
          list={list}
          item={item}
          style={{
            fontFamily: 'Fraunces, serif',
            fontSize: isTop ? 22 : 18,
            fontWeight: isTop ? 700 : 500,
            lineHeight: 1.2,
            color: COLORS.ink,
            letterSpacing: '-0.01em',
          }}
        >
          <span>{item}</span>
          <ExternalLink size={11} strokeWidth={2} style={{ opacity: 0.4, flexShrink: 0 }} />
        </ItemLink>
        <div
          style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: 10,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: score > 0 ? COLORS.forest : score < 0 ? COLORS.ember : COLORS.faded,
            marginTop: 4,
          }}
        >
          {score > 0 ? `+${score}` : score} {Math.abs(score) === 1 ? 'vote' : 'votes'}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          border: `1.5px solid ${COLORS.ink}`,
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <VoteButton
          active={userVote === 1}
          onClick={onUp}
          activeColor={COLORS.forest}
          icon={<ChevronUp size={18} strokeWidth={3} />}
        />
        <div style={{ height: 1, background: COLORS.ink }} />
        <VoteButton
          active={userVote === -1}
          onClick={onDown}
          activeColor={COLORS.ember}
          icon={<ChevronDown size={18} strokeWidth={3} />}
        />
      </div>
    </li>
  );
}

function VoteButton({ active, onClick, activeColor, icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? activeColor : 'transparent',
        color: active ? COLORS.cream : COLORS.ink,
        border: 'none',
        padding: '8px 12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icon}
    </button>
  );
}

const USER_VOTES_KEY = 'cg-uservotes';

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
