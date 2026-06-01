'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Copy, Link2, Check } from 'lucide-react';
import { LISTS, COLORS } from '@/lib/data';
import { getSources, voteKey, dedupeByName } from '@/lib/helpers';
import { fetchBootstrap } from '@/lib/api';

const POSTER_W = 1080;
const POSTER_H = 1350; // 4:5 portrait, Instagram-friendly

// Source ordering tier: lead with the best sources. True experts first, then
// top-reputation publications, then other publications, then user-ratings
// platforms (Google/Yelp/etc.), then pricing info last.
function sourceTier(src) {
  const id = (src.id || '').toLowerCase();
  const l = (src.label || '').toLowerCase();
  if (src.trueExpert) return 0;
  if (id === 'pricing' || l.includes('pricing') || l.includes('nightly rate')) return 4;
  const platform = ['yelp', 'google', 'tripadvisor', 'trip advisor', 'booking', 'expedia', 'hotels.com', 'opentable', 'amazon'].some((h) => id.includes(h.replace(/[^a-z]/g, '')) || l.includes(h));
  if (platform) return 3;
  const premium = ['michelin', 'infatuation', 'cond', 'leisure', 'cntraveler', 'robb report', 'forbes', 'us news', 'u.s. news', 'new york times', 'nyt'];
  if (premium.some((k) => l.includes(k))) return 1;
  return 2;
}

// Friendly display name for a constituent source on the shared poster.
// Rating platforms and the hotel forward-booking price proxy get clean names;
// editorial publications keep their own label.
function constituentLabel(src) {
  const id = (src.id || '').toLowerCase();
  const raw = src.label || '';
  const l = raw.toLowerCase();
  // Pricing proxy
  if (id === 'pricing' || l.includes('pricing') || l.includes('nightly rate')) {
    return 'Pricing';
  }
  // Rating / review platforms
  if (id.includes('yelp') || l.includes('yelp')) return 'Yelp';
  if (id.includes('google') || l.includes('google')) return 'Google';
  if (l.includes('tripadvisor') || l.includes('trip advisor')) return 'Tripadvisor';
  if (l.includes('booking.com')) return 'Booking';
  if (l.includes('amazon')) return 'Amazon';
  // Known publications -> ultra-short brand name (avoid long article titles)
  const MAP = [
    ['michelin', 'Michelin'],
    ['infatuation', 'Infatuation'],
    ['eater', 'Eater'],
    ['time out', 'Time Out'],
    ['timeout', 'Time Out'],
    ['u.s. news', 'US News'],
    ['us news', 'US News'],
    ['cond\u00e9 nast', 'Cond\u00e9 Nast'],
    ['conde nast', 'Cond\u00e9 Nast'],
    ['cntraveler', 'Cond\u00e9 Nast'],
    ['travel + leisure', 'T+L'],
    ['travel and leisure', 'T+L'],
    ['robb report', 'Robb Report'],
    ['forbes', 'Forbes'],
    ['points guy', 'Points Guy'],
    ['afar', 'AFAR'],
    ['wirecutter', 'Wirecutter'],
    ['good housekeeping', 'Good Housekeeping'],
    ['cnet', 'CNET'],
    ['serious eats', 'Serious Eats'],
    ['thrillist', 'Thrillist'],
    ['new york times', 'NYT'],
    ['bon app', 'Bon App\u00e9tit'],
    ['esquire', 'Esquire'],
    ['johnny novo', 'Johnny Novo'],
    ['johnnynovo', 'Johnny Novo'],
    ['the strategist', 'Strategist'],
    ['rolling stone', 'Rolling Stone'],
    ['pitchfork', 'Pitchfork'],
  ];
  for (let i = 0; i < MAP.length; i++) {
    if (l.includes(MAP[i][0])) return MAP[i][1];
  }
  // Fallback: first token before a delimiter, drop any year, cap length.
  let s = raw.split(/[\u00b7\u2014|:(,]/)[0];
  s = s.replace(/\b(19|20)\d\d\b/g, '').replace(/\s{2,}/g, ' ').trim();
  if (s.length > 18) s = s.slice(0, 18).trim();
  return s || raw;
}

export default function SnapshotClient({ listId }) {
  const router = useRouter();
  const [voteData, setVoteData] = useState({});
  const [extras, setExtras] = useState([]);
  const [userLists, setUserLists] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState('ai'); // 'ai', 'consensus', or 'vote'
  const [modeInit, setModeInit] = useState(false);
  const [copied, setCopied] = useState('');
  const [downloading, setDownloading] = useState(false);
  const posterRef = useRef(null);

  useEffect(() => {
    fetchBootstrap().then((data) => {
      if (data) {
        setVoteData(data.votes || {});
        setExtras((data.extras || {})[listId] || []);
        setUserLists(Array.isArray(data.userLists) ? data.userLists : []);
      }
      setLoaded(true);
    });
  }, [listId]);

  const list = useMemo(() => {
    return [...userLists, ...LISTS].find((l) => l.id === listId);
  }, [userLists, listId]);

  const sources = useMemo(() => {
    if (!list) return [];
    // Facts lists: bare 'ai' ranking only (no extra chips).
    if (list.mode === 'facts' || list.mode === 'unranked') {
      const aiItems = list.sources?.ai?.items || [];
      if (aiItems.length > 0) {
        return [{ id: 'ai', label: list.sources?.ai?.label || 'Consensus AI', items: aiItems }];
      }
      return [];
    }
    // Scores lists: 'ai' composite ranking + platform chips (Google, Yelp), no voting.
    if (list.mode === 'scores') {
      const aiItems = list.sources?.ai?.items || [];
      const publications = Object.entries(list.sources || {})
        .filter(([id]) => id !== 'ai')
        .map(([id, src]) => ({ id, label: src.label, items: src.items, url: src.url }));
      const out = [];
      if (aiItems.length > 0) {
        out.push({ id: 'ai', label: list.sources?.ai?.label || 'Consensus AI', items: aiItems });
      }
      // When only one platform (Google OR Yelp, not both) backs the composite,
      // the composite and that single platform are the SAME data — collapse the
      // redundant second chip so the share picker shows just one option.
      if (publications.length <= 1) return out.length > 0 ? out : publications;
      return [...out, ...publications];
    }
    // 'both' mode: compute Consensus the same way the detail page does, factoring
    // in live vote data and user-added extras so the shared poster matches the
    // list page exactly. (Previously called getSources(list) with no vote/extras,
    // which produced a different top ten that ignored reader votes.)
    return getSources(list, voteData, extras);
  }, [list, voteData, extras]);

  const items = useMemo(() => {
    if (!list) return [];
    if (mode === 'vote') {
      // Mirror the detail page's reader-vote universe. For 'both' mode lists the
      // votable pool is vote.items plus every publication item plus user extras,
      // not just vote.items + extras. Building the same universe here keeps the
      // shared "Reader Votes" poster consistent with what people see on the list.
      const listMode = list.mode || 'both';
      const universeItems = [...(list.vote?.items || [])];
      if (listMode === 'both') {
        getSources(list, voteData, extras).forEach((source) => {
          if (source.id === 'consensus') return; // use publications, not the composite
          source.items.forEach((item) => {
            if (!universeItems.some((i) => i.toLowerCase().trim() === item.toLowerCase().trim())) {
              universeItems.push(item);
            }
          });
        });
      }
      const all = dedupeByName([...universeItems, ...extras]);
      const scored = all.map((item, idx) => ({
        item,
        score: voteData[voteKey(list.id, item)] || 0,
        idx,
      }));
      scored.sort((a, b) => b.score - a.score || a.idx - b.idx);
      return scored.slice(0, 10).map((s) => s.item);
    }
    const src = sources.find((s) => s.id === mode) || sources[0];
    return (src?.items || []).slice(0, 10);
  }, [list, mode, sources, voteData, extras]);

  const modeLabel = useMemo(() => {
    if (mode === 'vote') return 'Reader Votes';
    if (mode === 'consensus') return 'Consensus';
    const src = sources.find((s) => s.id === mode);
    return src?.label || 'Ranked';
  }, [mode, sources]);

  // The publications / rating platforms / pricing that feed the consensus
  // (everything except the computed consensus and the legacy ai seed). Shown
  // in faint text on the poster as the "Constituent Sources" line.
  const constituentSourceNames = useMemo(() => {
    if (!list) return [];
    const ordered = sources
      .filter((s) => s.id !== 'consensus' && s.id !== 'ai')
      .map((s, i) => ({ s, i, t: sourceTier(s) }))
      .sort((a, b) => a.t - b.t || a.i - b.i);
    return dedupeByName(ordered.map((x) => constituentLabel(x.s)));
  }, [sources, list]);

  // Default the share preview to the computed Consensus (not the ai seed) when
  // a consensus exists, so the default poster matches the list's Consensus view.
  useEffect(() => {
    if (modeInit || sources.length === 0) return;
    const hasConsensus = sources.some((s) => s.id === 'consensus');
    setMode(hasConsensus ? 'consensus' : (sources[0]?.id || 'ai'));
    setModeInit(true);
  }, [sources, modeInit]);

  async function downloadPoster() {
    if (!posterRef.current) return;
    setDownloading(true);
    try {
      // Dynamic import so html-to-image only loads when needed
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(posterRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        width: POSTER_W,
        height: POSTER_H,
        backgroundColor: COLORS.cream,
      });
      const link = document.createElement('a');
      link.download = `consensus-gurus-${list.id}-${mode}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Download failed', e);
      alert('Could not generate image. Try a different browser or take a screenshot instead.');
    }
    setDownloading(false);
  }

  function copyLink() {
    const url = `${window.location.origin}/list/${encodeURIComponent(listId)}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied('link');
      setTimeout(() => setCopied(''), 1800);
    });
  }

  function copyText() {
    if (!list) return;
    const lines = [list.title, `— ${modeLabel} —`, ''];
    items.forEach((item, i) => {
      lines.push(`${String(i + 1).padStart(2, '0')}. ${item}`);
    });
    lines.push('', `consensusgurus.com/list/${list.id}`);
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied('text');
      setTimeout(() => setCopied(''), 1800);
    });
  }

  if (!loaded) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: COLORS.cream,
          fontFamily: 'Fraunces, serif',
          fontStyle: 'italic',
          fontSize: 18,
          color: COLORS.faded,
        }}
      >
        loading
      </div>
    );
  }

  if (!list) {
    return (
      <div style={{ padding: 48, textAlign: 'center', background: COLORS.cream, minHeight: '100vh' }}>
        <p style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', color: COLORS.faded }}>
          That list seems to have wandered off.
        </p>
        <button
          onClick={() => router.push('/')}
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
    );
  }

  const modeOptions = [];
  // AI first if available
  const ai = sources.find((s) => s.id === 'ai');
  if (ai) modeOptions.push({ id: 'ai', label: ai.label });
  // Consensus next if it exists
  const cons = sources.find((s) => s.id === 'consensus');
  if (cons) modeOptions.push({ id: 'consensus', label: 'Consensus' });
  // Then the source views, ordered best-first to match the list page.
  sources
    .filter((s) => s.id !== 'ai' && s.id !== 'consensus')
    .map((s, i) => ({ s, i, t: sourceTier(s) }))
    .sort((a, b) => a.t - b.t || a.i - b.i)
    .forEach((x) => modeOptions.push({ id: x.s.id, label: x.s.label }));
  // Offer reader votes (except facts/composite lists, which don't use voting)
  if (list.mode !== 'facts' && list.mode !== 'scores' && list.mode !== 'unranked') {
    modeOptions.push({ id: 'vote', label: 'Reader Votes' });
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: COLORS.cream,
        color: COLORS.ink,
        padding: '24px 16px 64px',
      }}
    >
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <button
          onClick={() => router.push(`/list/${encodeURIComponent(listId)}`)}
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
            marginBottom: 12,
          }}
        >
          <ArrowLeft size={14} strokeWidth={2.5} />
          Back to list
        </button>

        <h2
          style={{
            fontFamily: 'Fraunces, serif',
            fontWeight: 700,
            fontStyle: 'italic',
            fontSize: 24,
            margin: '0 0 14px',
            color: COLORS.ink,
            fontVariationSettings: '"SOFT" 100',
          }}
        >
          Share this list
        </h2>

        {/* Mode picker */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
            marginBottom: 18,
          }}
        >
          {modeOptions.map((opt) => {
            const active = mode === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setMode(opt.id)}
                style={{
                  background: active ? COLORS.ink : 'transparent',
                  color: active ? COLORS.cream : COLORS.ink,
                  border: `1.5px solid ${COLORS.ink}`,
                  padding: '6px 12px',
                  fontFamily: 'DM Mono, monospace',
                  fontSize: 10,
                  letterSpacing: '0.16em',
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

        {/* Action buttons */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            marginBottom: 24,
          }}
        >
          <ActionButton onClick={downloadPoster} disabled={downloading} primary>
            <Download size={14} strokeWidth={2.5} />
            {downloading ? 'Generating...' : 'Download poster'}
          </ActionButton>
          <ActionButton onClick={copyLink}>
            {copied === 'link' ? <Check size={14} strokeWidth={2.5} /> : <Link2 size={14} strokeWidth={2.5} />}
            {copied === 'link' ? 'Copied' : 'Copy link'}
          </ActionButton>
          <ActionButton onClick={copyText}>
            {copied === 'text' ? <Check size={14} strokeWidth={2.5} /> : <Copy size={14} strokeWidth={2.5} />}
            {copied === 'text' ? 'Copied' : 'Copy as text'}
          </ActionButton>
        </div>

        {/* Poster preview - rendered at 1080x1350, but visually scaled to fit screen */}
        <div
          style={{
            background: '#000',
            padding: 8,
            borderRadius: 4,
            display: 'flex',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <PosterScaler>
            <Poster ref={posterRef} list={list} items={items} modeLabel={modeLabel} sourceNames={constituentSourceNames} />
          </PosterScaler>
        </div>

        <p
          style={{
            marginTop: 20,
            fontFamily: 'DM Mono, monospace',
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: COLORS.faded,
            textAlign: 'center',
          }}
        >
          1080 × 1350 · Instagram / Pinterest portrait
        </p>
      </div>
    </div>
  );
}

function ActionButton({ onClick, children, disabled, primary }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: primary ? COLORS.ink : 'transparent',
        color: primary ? COLORS.cream : COLORS.ink,
        border: `1.5px solid ${COLORS.ink}`,
        padding: '10px 16px',
        fontFamily: 'DM Mono, monospace',
        fontSize: 11,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        fontWeight: 600,
        cursor: disabled ? 'wait' : 'pointer',
        boxShadow: primary ? `3px 3px 0 ${COLORS.ember}` : 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );
}

/* Wrap the full-size poster in a scaled-down preview that fits the screen. */
function PosterScaler({ children }) {
  const [scale, setScale] = useState(0.5);
  useEffect(() => {
    function updateScale() {
      const available = Math.min(window.innerWidth - 60, 720);
      setScale(available / POSTER_W);
    }
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);
  return (
    <div
      style={{
        width: POSTER_W * scale,
        height: POSTER_H * scale,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: POSTER_W,
          height: POSTER_H,
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* The actual poster, rendered at full 1080x1350 resolution. */
const Poster = React.forwardRef(function Poster({ list, items, modeLabel, sourceNames }, ref) {
  return (
    <div
      ref={ref}
      style={{
        width: POSTER_W,
        height: POSTER_H,
        background: COLORS.cream,
        color: COLORS.ink,
        padding: 72,
        position: 'relative',
        boxSizing: 'border-box',
        fontFamily: 'DM Sans, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Top masthead */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `2px solid ${COLORS.ink}`,
          paddingBottom: 18,
          fontFamily: 'DM Mono, monospace',
          fontSize: 18,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: COLORS.ink,
        }}
      >
        <span style={{ fontWeight: 600 }}>Consensus Gurus</span>
        <span style={{ color: COLORS.faded, fontSize: 14 }}>Where Experts Agree</span>
        <span style={{ color: COLORS.faded, fontSize: 14 }}>consensusgurus.com</span>
      </div>

      {/* Category */}
      <div
        style={{
          marginTop: 42,
          fontFamily: 'DM Mono, monospace',
          fontSize: 18,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: COLORS.ember,
          fontWeight: 600,
        }}
      >
        {list.category} · Top {Math.min(items.length, 10)}
      </div>

      {/* Title */}
      <h1
        style={{
          fontFamily: 'Fraunces, serif',
          fontWeight: 900,
          fontSize: items.length >= 10 ? 88 : 100,
          lineHeight: 0.92,
          letterSpacing: '-0.035em',
          margin: '14px 0 0',
          color: COLORS.ink,
          fontVariationSettings: '"SOFT" 100, "WONK" 1',
          maxWidth: '92%',
        }}
      >
        {list.title}
      </h1>

      {/* Mode label */}
      <div
        style={{
          marginTop: 20,
          fontFamily: 'Fraunces, serif',
          fontStyle: 'italic',
          fontSize: 26,
          color: COLORS.faded,
          paddingLeft: 16,
          borderLeft: `3px solid ${COLORS.ember}`,
          lineHeight: 1.3,
        }}
      >
        {modeLabel}
      </div>

      {/* Items list */}
      <ol
        style={{
          listStyle: 'none',
          padding: 0,
          margin: '36px 0 0',
        }}
      >
        {items.map((item, i) => (
          <li
            key={i}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 24,
              padding: '14px 0',
              borderBottom: i < items.length - 1 ? `1px solid ${COLORS.ink}` : 'none',
            }}
          >
            <span
              style={{
                fontFamily: 'Fraunces, serif',
                fontWeight: 900,
                fontSize: i === 0 ? 64 : 44,
                color: i === 0 ? COLORS.ember : COLORS.ink,
                minWidth: 78,
                lineHeight: 0.9,
                fontVariationSettings: '"SOFT" 100, "WONK" 1',
                fontFeatureSettings: '"lnum" 1',
              }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <span
              style={{
                fontFamily: 'Fraunces, serif',
                fontSize: i === 0 ? 38 : 30,
                fontWeight: i === 0 ? 700 : 500,
                lineHeight: 1.05,
                letterSpacing: '-0.01em',
                color: COLORS.ink,
                flex: 1,
                fontVariationSettings: '"SOFT" 100',
              }}
            >
              {item}
            </span>
          </li>
        ))}
      </ol>

      {/* Sources: below a separator bar at the foot of the poster. The site
          URL now lives in the top masthead, freeing this space. */}
      {sourceNames && sourceNames.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 52,
            left: 72,
            right: 72,
            borderTop: `2px solid ${COLORS.ink}`,
            paddingTop: 18,
            fontFamily: 'DM Mono, monospace',
            fontSize: 17,
            letterSpacing: '0.03em',
            lineHeight: 1.45,
            color: COLORS.faded,
          }}
        >
          <span style={{ fontWeight: 600, color: COLORS.ink }}>Sources: </span>
          {sourceNames.join(', ')}
        </div>
      )}
    </div>
  );
});
