'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Copy, Link2, Check } from 'lucide-react';
import { LISTS, COLORS } from '@/lib/data';
import { getSources, voteKey, dedupeByName } from '@/lib/helpers';
import { fetchBootstrap } from '@/lib/api';

const POSTER_W = 1080;
const POSTER_H = 1350;

const COLOR_SCHEMES = {
  classic:    { label: 'Classic',    bg: '#f4ede0', text: '#1a1a1a', accent: '#c0392b', faded: '#8a7a6a', swatch: ['#f4ede0', '#c0392b'] },
  midnight:   { label: 'Midnight',   bg: '#111118', text: '#f0eeea', accent: '#d4a944', faded: '#7070a0', swatch: ['#111118', '#d4a944'] },
  slate:      { label: 'Slate',      bg: '#1c2b3a', text: '#dce8f0', accent: '#4ea8de', faded: '#7090a8', swatch: ['#1c2b3a', '#4ea8de'] },
  forest:     { label: 'Forest',     bg: '#0e1e14', text: '#d8ead0', accent: '#6cbf5a', faded: '#5a8060', swatch: ['#0e1e14', '#6cbf5a'] },
  crimson:    { label: 'Crimson',    bg: '#b82c20', text: '#fdf4ec', accent: '#f5e050', faded: '#e8a090', swatch: ['#b82c20', '#f5e050'] },
  neon:       { label: 'Neon',       bg: '#000000', text: '#ffffff', accent: '#00ff88', faded: '#666666', swatch: ['#000000', '#00ff88'] },
  cobalt:     { label: 'Cobalt',     bg: '#1244c5', text: '#eef3ff', accent: '#ffde59', faded: '#8aaae0', swatch: ['#1244c5', '#ffde59'] },
  tangerine:  { label: 'Tangerine',  bg: '#e84800', text: '#fff8f0', accent: '#ffe066', faded: '#f0a070', swatch: ['#e84800', '#ffe066'] },
  violet:     { label: 'Violet',     bg: '#3a0f88', text: '#ead4ff', accent: '#9dff6e', faded: '#9060c0', swatch: ['#3a0f88', '#9dff6e'] },
  rose:       { label: 'Rose',       bg: '#c2105a', text: '#fff0f5', accent: '#ffe066', faded: '#e880a8', swatch: ['#c2105a', '#ffe066'] },
  sand:       { label: 'Sand',       bg: '#e8d49a', text: '#2a1a06', accent: '#7a3800', faded: '#9a7a40', swatch: ['#e8d49a', '#7a3800'] },
  espresso:   { label: 'Espresso',   bg: '#1a0d06', text: '#f0e8d8', accent: '#d4a060', faded: '#806040', swatch: ['#1a0d06', '#d4a060'] },
  sage:       { label: 'Sage',       bg: '#c8dcc0', text: '#1a2a15', accent: '#2a6020', faded: '#5a7852', swatch: ['#c8dcc0', '#2a6020'] },
  toxic:      { label: 'Toxic',      bg: '#0a0a0a', text: '#e8ff00', accent: '#ff00aa', faded: '#4a4a00', swatch: ['#0a0a0a', '#e8ff00'] },
  ocean:      { label: 'Ocean',      bg: '#001f3f', text: '#e0f4ff', accent: '#00d4ff', faded: '#305070', swatch: ['#001f3f', '#00d4ff'] },
  bubblegum:  { label: 'Bubblegum', bg: '#ff6eb4', text: '#1a0010', accent: '#ffffff', faded: '#cc3088', swatch: ['#ff6eb4', '#ffffff'] },
  lemon:      { label: 'Lemon',      bg: '#f7e900', text: '#1a1400', accent: '#ff2200', faded: '#8a8000', swatch: ['#f7e900', '#ff2200'] },
  denim:      { label: 'Denim',      bg: '#1b3a6b', text: '#f0f4ff', accent: '#ff7f00', faded: '#6080b0', swatch: ['#1b3a6b', '#ff7f00'] },
  aurora:     { label: 'Aurora',     bg: '#0d0d2b', text: '#e8f0ff', accent: '#ff4fd8', faded: '#4040a0', swatch: ['#0d0d2b', '#ff4fd8'] },
  matcha:     { label: 'Matcha',     bg: '#2d4a1e', text: '#f0f7e8', accent: '#c8f060', faded: '#5a7848', swatch: ['#2d4a1e', '#c8f060'] },
  candy:      { label: 'Candy',      bg: '#ffffff', text: '#cc0022', accent: '#cc0022', faded: '#ff6688', swatch: ['#ffffff', '#cc0022'] },
  ink:        { label: 'Ink',        bg: '#0a0a0a', text: '#ffffff', accent: '#ffffff', faded: '#555555', swatch: ['#0a0a0a', '#ffffff'] },
  copper:     { label: 'Copper',     bg: '#3d1800', text: '#ffe8cc', accent: '#ff8c00', faded: '#804020', swatch: ['#3d1800', '#ff8c00'] },
};

const FONT_STYLES = {
  editorial: {
    label: 'Editorial',
    previewFont: 'Fraunces, serif', previewStyle: 'italic', previewWeight: 700,
  },
  sharp: {
    label: 'Sharp',
    previewFont: 'DM Sans, sans-serif', previewStyle: 'normal', previewWeight: 800,
  },
  elegant: {
    label: 'Elegant',
    previewFont: 'Fraunces, serif', previewStyle: 'italic', previewWeight: 300,
  },
  bold: {
    label: 'Bold',
    previewFont: 'DM Sans, sans-serif', previewStyle: 'normal', previewWeight: 900,
  },
};

function sourceTier(src) {
  const id = (src.id || '').toLowerCase();
  const l = (src.label || '').toLowerCase();
  if (src.trueExpert) return 0;
  if (id === 'pricing' || l.includes('pricing') || l.includes('nightly rate')) return 4;
  const platform = ['yelp','google','tripadvisor','trip advisor','booking','expedia','hotels.com','opentable','amazon'].some((h) => id.includes(h.replace(/[^a-z]/g,'')) || l.includes(h));
  if (platform) return 3;
  const premium = ['michelin','infatuation','cond','leisure','cntraveler','robb report','forbes','us news','u.s. news','new york times','nyt'];
  if (premium.some((k) => l.includes(k))) return 1;
  return 2;
}

function constituentLabel(src) {
  const id = (src.id || '').toLowerCase();
  const raw = src.label || '';
  const l = raw.toLowerCase();
  if (id === 'pricing' || l.includes('pricing') || l.includes('nightly rate')) return 'Pricing';
  if (id.includes('yelp') || l.includes('yelp')) return 'Yelp';
  if (id.includes('google') || l.includes('google')) return 'Google';
  if (l.includes('tripadvisor') || l.includes('trip advisor')) return 'Tripadvisor';
  if (l.includes('booking.com')) return 'Booking';
  if (l.includes('amazon')) return 'Amazon';
  const MAP = [
    ['michelin','Michelin'],['infatuation','Infatuation'],['eater','Eater'],
    ['time out','Time Out'],['timeout','Time Out'],['u.s. news','US News'],['us news','US News'],
    ['condé nast','Condé Nast'],['conde nast','Condé Nast'],['cntraveler','Condé Nast'],
    ['travel + leisure','T+L'],['travel and leisure','T+L'],['robb report','Robb Report'],
    ['forbes','Forbes'],['points guy','Points Guy'],['afar','AFAR'],
    ['wirecutter','Wirecutter'],['good housekeeping','Good Housekeeping'],['cnet','CNET'],
    ['serious eats','Serious Eats'],['thrillist','Thrillist'],['new york times','NYT'],
    ['bon app','Bon Appétit'],['esquire','Esquire'],
    ['johnny novo','Johnny Novo'],['johnnynovo','Johnny Novo'],
    ['the strategist','Strategist'],['rolling stone','Rolling Stone'],['pitchfork','Pitchfork'],
  ];
  for (let i = 0; i < MAP.length; i++) { if (l.includes(MAP[i][0])) return MAP[i][1]; }
  let s = raw.split(/[·—|:(,]/)[0];
  s = s.replace(/\b(19|20)\d\d\b/g,'').replace(/\s{2,}/g,' ').trim();
  const CAP = 22;
  if (s.length > CAP) { const cut = s.slice(0,CAP); const sp = cut.lastIndexOf(' '); if (sp > 6) s = cut.slice(0,sp).trim(); }
  return s || raw;
}

export default function SnapshotClient({ listId }) {
  const router = useRouter();
  const [voteData, setVoteData] = useState({});
  const [extras, setExtras] = useState([]);
  const [userLists, setUserLists] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState('ai');
  const [modeInit, setModeInit] = useState(false);
  const [copied, setCopied] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [colorScheme, setColorScheme] = useState('classic');
  const [fontStyle, setFontStyle] = useState('editorial');
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

  const list = useMemo(() => [...userLists, ...LISTS].find((l) => l.id === listId), [userLists, listId]);

  const sources = useMemo(() => {
    if (!list) return [];
    if (list.mode === 'facts' || list.mode === 'unranked') {
      const aiItems = list.sources?.ai?.items || [];
      if (aiItems.length > 0) return [{ id: 'ai', label: list.sources?.ai?.label || 'Consensus AI', items: aiItems }];
      return [];
    }
    if (list.mode === 'scores') {
      const aiItems = list.sources?.ai?.items || [];
      const publications = Object.entries(list.sources || {}).filter(([id]) => id !== 'ai').map(([id, src]) => ({ id, label: src.label, items: src.items, url: src.url }));
      const out = aiItems.length > 0 ? [{ id: 'ai', label: list.sources?.ai?.label || 'Consensus AI', items: aiItems }] : [];
      if (publications.length <= 1) return out.length > 0 ? out : publications;
      return [...out, ...publications];
    }
    return getSources(list, voteData, extras);
  }, [list, voteData, extras]);

  const items = useMemo(() => {
    if (!list) return [];
    if (mode === 'vote') {
      const listMode = list.mode || 'both';
      const universeItems = [...(list.vote?.items || [])];
      if (listMode === 'both') {
        getSources(list, voteData, extras).forEach((source) => {
          if (source.id === 'consensus') return;
          source.items.forEach((item) => {
            if (!universeItems.some((i) => i.toLowerCase().trim() === item.toLowerCase().trim())) universeItems.push(item);
          });
        });
      }
      const all = dedupeByName([...universeItems, ...extras]);
      const scored = all.map((item, idx) => ({ item, score: voteData[voteKey(list.id, item)] || 0, idx }));
      scored.sort((a, b) => b.score - a.score || a.idx - b.idx);
      return scored.slice(0, 10).map((s) => s.item);
    }
    const src = sources.find((s) => s.id === mode) || sources[0];
    return (src?.items || []).slice(0, 10);
  }, [list, mode, sources, voteData, extras]);

  const modeLabel = useMemo(() => {
    if (mode === 'vote') return 'Source of Truths User Vote';
    if (mode === 'consensus') return 'Consensus';
    const src = sources.find((s) => s.id === mode);
    return src?.label || 'Ranked';
  }, [mode, sources]);

  const constituentSourceNames = useMemo(() => {
    if (!list) return [];
    const ordered = sources.filter((s) => s.id !== 'consensus' && s.id !== 'ai').map((s, i) => ({ s, i, t: sourceTier(s) })).sort((a, b) => a.t - b.t || a.i - b.i);
    return dedupeByName(ordered.map((x) => constituentLabel(x.s)));
  }, [sources, list]);

  useEffect(() => {
    if (modeInit || sources.length === 0) return;
    const hasConsensus = sources.some((s) => s.id === 'consensus');
    setMode(hasConsensus ? 'consensus' : (sources[0]?.id || 'ai'));
    setModeInit(true);
  }, [sources, modeInit]);

  const palette = COLOR_SCHEMES[colorScheme] || COLOR_SCHEMES.classic;

  async function downloadPoster() {
    if (!posterRef.current) return;
    setDownloading(true);
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(posterRef.current, { cacheBust: true, pixelRatio: 2, width: POSTER_W, height: POSTER_H, backgroundColor: palette.bg });
      const link = document.createElement('a');
      link.download = `source-of-truths-${list.id}-${mode}.png`;
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
    navigator.clipboard.writeText(url).then(() => { setCopied('link'); setTimeout(() => setCopied(''), 1800); });
  }

  function copyText() {
    if (!list) return;
    const lines = [list.title, `— ${modeLabel} —`, ''];
    items.forEach((item, i) => { lines.push(`${String(i + 1)}. ${item}`); });
    lines.push('', `sourceoftruths.com/list/${list.id}`);
    navigator.clipboard.writeText(lines.join('\n')).then(() => { setCopied('text'); setTimeout(() => setCopied(''), 1800); });
  }

  if (!loaded) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: COLORS.cream, fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 18, color: COLORS.faded }}>loading</div>;
  }

  if (!list) {
    return (
      <div style={{ padding: 48, textAlign: 'center', background: COLORS.cream, minHeight: '100vh' }}>
        <p style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', color: COLORS.faded }}>That list seems to have wandered off.</p>
        <button onClick={() => router.push('/')} style={{ marginTop: 16, background: COLORS.ink, color: COLORS.cream, border: 'none', padding: '10px 20px', fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer' }}>Back home</button>
      </div>
    );
  }

  const modeOptions = [];
  const ai = sources.find((s) => s.id === 'ai');
  if (ai) modeOptions.push({ id: 'ai', label: ai.label });
  const cons = sources.find((s) => s.id === 'consensus');
  if (cons) modeOptions.push({ id: 'consensus', label: 'Consensus' });
  sources.filter((s) => s.id !== 'ai' && s.id !== 'consensus').map((s, i) => ({ s, i, t: sourceTier(s) })).sort((a, b) => a.t - b.t || a.i - b.i).forEach((x) => modeOptions.push({ id: x.s.id, label: x.s.label }));
  if (list.mode !== 'facts' && list.mode !== 'scores' && list.mode !== 'unranked') modeOptions.push({ id: 'vote', label: 'Source of Truths User Vote' });

  return (
    <div style={{ minHeight: '100vh', background: COLORS.cream, color: COLORS.ink, padding: '24px 16px 64px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <button onClick={() => router.push(`/list/${encodeURIComponent(listId)}`)}
          style={{ background: 'transparent', border: 'none', fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: COLORS.ink, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0', marginBottom: 12 }}>
          <ArrowLeft size={14} strokeWidth={2.5} />Back to list
        </button>

        <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontStyle: 'italic', fontSize: 24, margin: '0 0 18px', color: COLORS.ink, fontVariationSettings: '"SOFT" 100' }}>Share this list</h2>

        <PickerRow label="Source">
          {modeOptions.map((opt) => {
            const active = mode === opt.id;
            return <button key={opt.id} onClick={() => setMode(opt.id)} style={{ background: active ? COLORS.ink : 'transparent', color: active ? COLORS.cream : COLORS.ink, border: `1.5px solid ${COLORS.ink}`, padding: '6px 12px', fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>{opt.label}</button>;
          })}
        </PickerRow>

        <PickerRow label="Color">
          {Object.entries(COLOR_SCHEMES).map(([key, scheme]) => {
            const active = colorScheme === key;
            return (
              <button key={key} onClick={() => setColorScheme(key)} title={scheme.label}
                style={{ background: active ? COLORS.ink : 'transparent', color: active ? COLORS.cream : COLORS.ink, border: `1.5px solid ${active ? COLORS.ink : '#c8bdb0'}`, padding: '5px 10px', fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ display: 'inline-flex', width: 20, height: 14, borderRadius: 2, overflow: 'hidden', border: active ? `1px solid ${COLORS.cream}` : '1px solid #c8bdb0', flexShrink: 0 }}>
                  <span style={{ background: scheme.swatch[0], flex: 1 }} /><span style={{ background: scheme.swatch[1], flex: 1 }} />
                </span>
                {scheme.label}
              </button>
            );
          })}
        </PickerRow>

        <PickerRow label="Style">
          {Object.entries(FONT_STYLES).map(([key, fs]) => {
            const active = fontStyle === key;
            return (
              <button key={key} onClick={() => setFontStyle(key)}
                style={{ background: active ? COLORS.ink : 'transparent', color: active ? COLORS.cream : COLORS.ink, border: `1.5px solid ${active ? COLORS.ink : '#c8bdb0'}`, padding: '6px 14px', fontFamily: fs.previewFont, fontStyle: fs.previewStyle, fontWeight: fs.previewWeight, fontSize: 12, cursor: 'pointer', letterSpacing: key === 'bold' ? '0.08em' : '0.01em', textTransform: key === 'bold' ? 'uppercase' : 'none' }}>
                {fs.label}
              </button>
            );
          })}
        </PickerRow>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24, marginTop: 4 }}>
          <ActionButton onClick={downloadPoster} disabled={downloading} primary><Download size={14} strokeWidth={2.5} />{downloading ? 'Generating...' : 'Download poster'}</ActionButton>
          <ActionButton onClick={copyLink}>{copied === 'link' ? <Check size={14} strokeWidth={2.5} /> : <Link2 size={14} strokeWidth={2.5} />}{copied === 'link' ? 'Copied' : 'Copy link'}</ActionButton>
          <ActionButton onClick={copyText}>{copied === 'text' ? <Check size={14} strokeWidth={2.5} /> : <Copy size={14} strokeWidth={2.5} />}{copied === 'text' ? 'Copied' : 'Copy as text'}</ActionButton>
        </div>

        <div style={{ background: '#000', padding: 8, borderRadius: 4, display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
          <PosterScaler>
            <Poster ref={posterRef} list={list} items={items} modeLabel={modeLabel} sourceNames={constituentSourceNames} palette={palette} fontStyle={fontStyle} />
          </PosterScaler>
        </div>

        <p style={{ marginTop: 20, fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: COLORS.faded, textAlign: 'center' }}>
          1080 × 1350 · Instagram / Pinterest portrait
        </p>
      </div>
    </div>
  );
}

function PickerRow({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: COLORS.faded, marginBottom: 6, fontWeight: 600 }}>{label}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{children}</div>
    </div>
  );
}

function ActionButton({ onClick, children, disabled, primary }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ background: primary ? COLORS.ink : 'transparent', color: primary ? COLORS.cream : COLORS.ink, border: `1.5px solid ${COLORS.ink}`, padding: '10px 16px', fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600, cursor: disabled ? 'wait' : 'pointer', boxShadow: primary ? `3px 3px 0 ${COLORS.ember}` : 'none', display: 'flex', alignItems: 'center', gap: 8, opacity: disabled ? 0.6 : 1 }}>
      {children}
    </button>
  );
}

function PosterScaler({ children }) {
  const [scale, setScale] = useState(0.5);
  useEffect(() => {
    function updateScale() { const available = Math.min(window.innerWidth - 60, 720); setScale(available / POSTER_W); }
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);
  return (
    <div style={{ width: POSTER_W * scale, height: POSTER_H * scale, position: 'relative', overflow: 'hidden' }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: POSTER_W, height: POSTER_H, position: 'absolute', top: 0, left: 0 }}>{children}</div>
    </div>
  );
}

/* ─── LAYOUT: Editorial ─────────────────────────────────────────────────── */
function PosterEditorial({ list, items, modeLabel, sourceNames, pal }) {
  return (
    <div style={{ width: POSTER_W, height: POSTER_H, background: pal.bg, color: pal.text, padding: 72, boxSizing: 'border-box', fontFamily: 'Fraunces, serif', overflow: 'hidden', position: 'relative' }}>
      {/* Masthead */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${pal.text}`, paddingBottom: 18, fontFamily: 'DM Mono, monospace', fontSize: 18, letterSpacing: '0.3em', textTransform: 'uppercase', color: pal.text }}>
        <span style={{ fontWeight: 600 }}>Source of Truths</span>
        <span style={{ color: pal.faded, fontSize: 14 }}>sourceoftruths.com</span>
      </div>

      <div style={{ marginTop: 42, fontFamily: 'DM Mono, monospace', fontSize: 18, letterSpacing: '0.3em', textTransform: 'uppercase', color: pal.accent, fontWeight: 600 }}>
        {list.category} &middot; Top {Math.min(items.length, 10)}
      </div>

      <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 900, fontStyle: 'normal', fontSize: items.length >= 10 ? 88 : 100, lineHeight: 0.92, letterSpacing: '-0.03em', margin: '14px 0 0', color: pal.text, fontVariationSettings: '"SOFT" 100, "WONK" 1', maxWidth: '92%' }}>
        {list.title}
      </h1>

      <div style={{ marginTop: 20, fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 26, color: pal.faded, paddingLeft: 16, borderLeft: `3px solid ${pal.accent}`, lineHeight: 1.3, fontVariationSettings: '"SOFT" 100' }}>
        {modeLabel}
      </div>

      <ol style={{ listStyle: 'none', padding: 0, margin: '36px 0 0' }}>
        {items.map((item, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 24, padding: '14px 0', borderBottom: i < items.length - 1 ? `1px solid rgba(${hexToRgb(pal.text)},1)` : 'none' }}>
            <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: i === 0 ? 64 : 44, color: i === 0 ? pal.accent : pal.text, minWidth: 78, lineHeight: 0.9, fontVariationSettings: '"SOFT" 100, "WONK" 1', opacity: i === 0 ? 1 : 0.5 }}>{i + 1}</span>
            <span style={{ fontFamily: 'Fraunces, serif', fontSize: i === 0 ? 38 : 30, fontWeight: i === 0 ? 700 : 500, lineHeight: 1.05, letterSpacing: '-0.01em', color: pal.text, flex: 1, fontVariationSettings: '"SOFT" 100', fontStyle: i !== 0 ? 'italic' : 'normal' }}>
              {item}
            </span>
          </li>
        ))}
      </ol>

      <SourcesFooter pal={pal} sourceNames={sourceNames} list={list} metaFamily="DM Mono, monospace" />
    </div>
  );
}

/* ─── LAYOUT: Sharp ─────────────────────────────────────────────────────── */
function PosterSharp({ list, items, modeLabel, sourceNames, pal }) {
  return (
    <div style={{ width: POSTER_W, height: POSTER_H, background: pal.bg, color: pal.text, boxSizing: 'border-box', fontFamily: 'DM Sans, sans-serif', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      {/* Top accent bar */}
      <div style={{ height: 8, background: pal.accent, flexShrink: 0 }} />

      {/* Header block */}
      <div style={{ padding: '48px 64px 36px', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, letterSpacing: '0.28em', textTransform: 'uppercase', color: pal.accent, fontWeight: 700, marginBottom: 16 }}>
              Source of Truths &nbsp;/&nbsp; {list.category}
            </div>
            <h1 style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 900, fontSize: 82, lineHeight: 0.88, letterSpacing: '-0.04em', margin: 0, color: pal.text, maxWidth: 820 }}>
              {list.title}
            </h1>
          </div>
        </div>
        <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 40, height: 3, background: pal.accent }} />
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 14, letterSpacing: '0.18em', textTransform: 'uppercase', color: pal.faded }}>{modeLabel}</span>
        </div>
      </div>

      {/* Items — two-column grid feel with large left number */}
      <div style={{ flex: 1, padding: '0 64px', overflow: 'hidden' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', borderTop: `1px solid rgba(${hexToRgb(pal.text)},0.2)`, padding: '10px 0', gap: 0 }}>
            {/* Number block */}
            <div style={{ width: 110, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 28 }}>
              <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 900, fontSize: i === 0 ? 80 : 52, color: i === 0 ? pal.accent : pal.faded, lineHeight: 1, opacity: i === 0 ? 1 : 0.7 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>
            {/* Vertical rule */}
            <div style={{ width: 2, alignSelf: 'stretch', background: i === 0 ? pal.accent : `rgba(${hexToRgb(pal.text)},0.12)`, marginRight: 28, flexShrink: 0 }} />
            {/* Name */}
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: i === 0 ? 800 : 500, fontSize: i === 0 ? 38 : 28, color: pal.text, lineHeight: 1.1, flex: 1, letterSpacing: '-0.02em' }}>
              {item}
            </span>
          </div>
        ))}
        <div style={{ borderTop: `1px solid rgba(${hexToRgb(pal.text)},0.2)` }} />
      </div>

      {/* Footer */}
      <div style={{ padding: '20px 64px 32px', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, letterSpacing: '0.12em', color: pal.faded }}>
          {sourceNames && sourceNames.length > 0 && <>Sources: {[...sourceNames].join(', ')}</>}
        </div>
        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, letterSpacing: '0.12em', color: pal.faded }}>sourceoftruths.com</div>
      </div>
    </div>
  );
}

/* ─── LAYOUT: Elegant ───────────────────────────────────────────────────── */
function PosterElegant({ list, items, modeLabel, sourceNames, pal }) {
  return (
    <div style={{ width: POSTER_W, height: POSTER_H, background: pal.bg, color: pal.text, padding: '80px 96px', boxSizing: 'border-box', fontFamily: 'Fraunces, serif', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Top rule + wordmark */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 52 }}>
        <div style={{ width: 60, height: 1, background: pal.accent, marginBottom: 20 }} />
        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, letterSpacing: '0.38em', textTransform: 'uppercase', color: pal.faded }}>Source of Truths</div>
        <div style={{ width: 60, height: 1, background: pal.accent, marginTop: 20 }} />
      </div>

      {/* Category */}
      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, letterSpacing: '0.32em', textTransform: 'uppercase', color: pal.accent, marginBottom: 24, textAlign: 'center' }}>
        {list.category}
      </div>

      {/* Title — centered, large italic */}
      <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, fontStyle: 'italic', fontSize: 72, lineHeight: 1, letterSpacing: '-0.02em', margin: '0 0 12px', color: pal.text, fontVariationSettings: '"SOFT" 100', textAlign: 'center', maxWidth: 860 }}>
        {list.title}
      </h1>

      {/* Mode label */}
      <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 22, color: pal.faded, textAlign: 'center', marginBottom: 44, fontVariationSettings: '"SOFT" 100' }}>
        {modeLabel}
      </div>

      {/* Thin full-width rule */}
      <div style={{ width: '100%', height: 1, background: `rgba(${hexToRgb(pal.text)},0.25)`, marginBottom: 36 }} />

      {/* Items — centered, minimal */}
      <div style={{ width: '100%', flex: 1 }}>
        {items.map((item, i) => {
          const romanNumerals = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < items.length - 1 ? `1px solid rgba(${hexToRgb(pal.text)},0.12)` : 'none' }}>
              <span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 300, fontSize: i === 0 ? 34 : 26, color: i === 0 ? pal.text : pal.text, lineHeight: 1.1, flex: 1, fontVariationSettings: '"SOFT" 100' }}>
                {item}
              </span>
              <span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 300, fontSize: i === 0 ? 30 : 20, color: i === 0 ? pal.accent : pal.faded, flexShrink: 0, marginLeft: 20, fontVariationSettings: '"SOFT" 100' }}>
                {romanNumerals[i] || String(i + 1)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bottom */}
      <div style={{ marginTop: 40, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ width: '100%', height: 1, background: `rgba(${hexToRgb(pal.text)},0.25)` }} />
        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: pal.faded, textAlign: 'center' }}>
          sourceoftruths.com
        </div>
      </div>
    </div>
  );
}

/* ─── LAYOUT: Bold ──────────────────────────────────────────────────────── */
function PosterBold({ list, items, modeLabel, sourceNames, pal }) {
  return (
    <div style={{ width: POSTER_W, height: POSTER_H, background: pal.bg, color: pal.text, boxSizing: 'border-box', fontFamily: 'DM Sans, sans-serif', overflow: 'hidden', position: 'relative' }}>
      {/* Giant ghost number behind everything */}
      <div style={{ position: 'absolute', top: -40, right: -20, fontFamily: 'DM Sans, sans-serif', fontWeight: 900, fontSize: 680, lineHeight: 1, color: `rgba(${hexToRgb(pal.accent)},0.08)`, userSelect: 'none', letterSpacing: '-0.06em', pointerEvents: 'none' }}>1</div>

      {/* Top strip */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 12, background: pal.accent }} />

      <div style={{ padding: '52px 64px 0', position: 'relative' }}>
        {/* Wordmark */}
        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.38em', textTransform: 'uppercase', color: pal.faded, marginBottom: 36 }}>
          Source of Truths &nbsp;&middot;&nbsp; {list.category}
        </div>

        {/* BIG title */}
        <h1 style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 900, textTransform: 'uppercase', fontSize: 94, lineHeight: 0.85, letterSpacing: '-0.04em', margin: '0 0 28px', color: pal.text, maxWidth: 900 }}>
          {list.title}
        </h1>

        {/* Mode bar */}
        <div style={{ display: 'inline-block', background: pal.accent, padding: '8px 20px', marginBottom: 44 }}>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, color: pal.bg }}>{modeLabel}</span>
        </div>

        {/* Items — left-heavy stacked list */}
        <div>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: i === 0 ? 12 : 4 }}>
              <span style={{
                fontFamily: 'DM Mono, monospace', fontWeight: 900,
                fontSize: i === 0 ? 96 : 44,
                color: i === 0 ? pal.accent : `rgba(${hexToRgb(pal.text)},0.3)`,
                minWidth: i === 0 ? 130 : 100,
                lineHeight: 0.85,
                letterSpacing: '-0.04em',
              }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div style={{ flex: 1, borderTop: i === 0 ? `3px solid ${pal.accent}` : `1px solid rgba(${hexToRgb(pal.text)},0.15)`, paddingTop: i === 0 ? 8 : 4 }}>
                <span style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: i === 0 ? 900 : 600,
                  fontSize: i === 0 ? 44 : 28,
                  color: i === 0 ? pal.text : `rgba(${hexToRgb(pal.text)},0.8)`,
                  lineHeight: 1,
                  letterSpacing: i === 0 ? '-0.03em' : '-0.02em',
                  textTransform: 'uppercase',
                  display: 'block',
                }}>
                  {item}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom strip */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 52, background: pal.accent, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 48px' }}>
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, color: pal.bg }}>sourceoftruths.com</span>
      </div>
    </div>
  );
}

/* ─── Source footer shared component ───────────────────────────────────── */
function SourcesFooter({ pal, sourceNames, list, metaFamily }) {
  if (!sourceNames || sourceNames.length === 0) return null;
  const allNames = [...sourceNames, ...(list.mode !== 'facts' && list.mode !== 'scores' && list.mode !== 'unranked' ? ['CG User Vote'] : [])];
  return (
    <div style={{ position: 'absolute', bottom: 52, left: 72, right: 72, borderTop: `2px solid ${pal.text}`, paddingTop: 18, fontFamily: metaFamily || 'DM Mono, monospace', fontSize: 17, letterSpacing: '0.03em', lineHeight: 1.45, color: pal.faded }}>
      <span style={{ fontWeight: 600, color: pal.text }}>Sources: </span>{allNames.join(', ')}
    </div>
  );
}

/* ─── Hex helper ────────────────────────────────────────────────────────── */
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0,2),16);
  const g = parseInt(h.slice(2,4),16);
  const b = parseInt(h.slice(4,6),16);
  return `${r},${g},${b}`;
}

/* ─── Main Poster router ────────────────────────────────────────────────── */
const Poster = React.forwardRef(function Poster({ list, items, modeLabel, sourceNames, palette, fontStyle }, ref) {
  const pal = palette || COLOR_SCHEMES.classic;
  const props = { list, items, modeLabel, sourceNames, pal };

  let inner;
  if (fontStyle === 'sharp')   inner = <PosterSharp   {...props} />;
  else if (fontStyle === 'elegant') inner = <PosterElegant {...props} />;
  else if (fontStyle === 'bold')    inner = <PosterBold    {...props} />;
  else                              inner = <PosterEditorial {...props} />;

  return (
    <div ref={ref} style={{ width: POSTER_W, height: POSTER_H, overflow: 'hidden' }}>
      {inner}
    </div>
  );
});
