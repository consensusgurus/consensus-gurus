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
};

const FONT_STYLES = {
  editorial: {
    label: 'Editorial', previewFont: 'Fraunces, serif', previewStyle: 'italic', previewWeight: 700,
    titleFamily: 'Fraunces, serif', titleItalic: false, titleUppercase: false, titleVariation: '"SOFT" 100, "WONK" 1', titleWeight: 900,
    numberFamily: 'Fraunces, serif', numberVariation: '"SOFT" 100, "WONK" 1',
    nameFamily: 'Fraunces, serif', nameVariation: '"SOFT" 100', nameWeight: 500,
    metaFamily: 'DM Mono, monospace', metaLetterSpacing: '0.3em', itemDivider: 'solid', itemDividerOpacity: 1,
  },
  sharp: {
    label: 'Sharp', previewFont: 'DM Sans, sans-serif', previewStyle: 'normal', previewWeight: 800,
    titleFamily: 'DM Sans, sans-serif', titleItalic: false, titleUppercase: false, titleVariation: '', titleWeight: 900,
    numberFamily: 'DM Mono, monospace', numberVariation: '',
    nameFamily: 'DM Sans, sans-serif', nameVariation: '', nameWeight: 500,
    metaFamily: 'DM Mono, monospace', metaLetterSpacing: '0.22em', itemDivider: 'solid', itemDividerOpacity: 1,
  },
  magazine: {
    label: 'Magazine', previewFont: 'DM Sans, sans-serif', previewStyle: 'normal', previewWeight: 700,
    titleFamily: 'DM Sans, sans-serif', titleItalic: false, titleUppercase: false, titleVariation: '', titleWeight: 900,
    numberFamily: 'Fraunces, serif', numberVariation: '"SOFT" 100, "WONK" 1',
    nameFamily: 'DM Sans, sans-serif', nameVariation: '', nameWeight: 500,
    metaFamily: 'DM Mono, monospace', metaLetterSpacing: '0.28em', itemDivider: 'solid', itemDividerOpacity: 1,
  },
  mono: {
    label: 'Mono', previewFont: 'DM Mono, monospace', previewStyle: 'normal', previewWeight: 700,
    titleFamily: 'DM Mono, monospace', titleItalic: false, titleUppercase: false, titleVariation: '', titleWeight: 700,
    numberFamily: 'DM Mono, monospace', numberVariation: '',
    nameFamily: 'DM Mono, monospace', nameVariation: '', nameWeight: 400,
    metaFamily: 'DM Mono, monospace', metaLetterSpacing: '0.2em', itemDivider: 'dashed', itemDividerOpacity: 0.6,
  },
  elegant: {
    label: 'Elegant', previewFont: 'Fraunces, serif', previewStyle: 'italic', previewWeight: 300,
    titleFamily: 'Fraunces, serif', titleItalic: true, titleUppercase: false, titleVariation: '"SOFT" 100', titleWeight: 300,
    numberFamily: 'Fraunces, serif', numberVariation: '"SOFT" 100',
    nameFamily: 'Fraunces, serif', nameVariation: '"SOFT" 100', nameWeight: 300,
    metaFamily: 'DM Sans, sans-serif', metaLetterSpacing: '0.24em', itemDivider: 'solid', itemDividerOpacity: 0.3,
  },
  bold: {
    label: 'Bold', previewFont: 'DM Sans, sans-serif', previewStyle: 'normal', previewWeight: 900,
    titleFamily: 'DM Sans, sans-serif', titleItalic: false, titleUppercase: true, titleVariation: '', titleWeight: 900,
    numberFamily: 'DM Sans, sans-serif', numberVariation: '',
    nameFamily: 'DM Sans, sans-serif', nameVariation: '', nameWeight: 800,
    metaFamily: 'DM Mono, monospace', metaLetterSpacing: '0.26em', itemDivider: 'solid', itemDividerOpacity: 1,
  },
  condensed: {
    label: 'Condensed', previewFont: 'DM Mono, monospace', previewStyle: 'normal', previewWeight: 700,
    titleFamily: 'DM Sans, sans-serif', titleItalic: false, titleUppercase: true, titleVariation: '', titleWeight: 900,
    numberFamily: 'DM Mono, monospace', numberVariation: '',
    nameFamily: 'DM Mono, monospace', nameVariation: '', nameWeight: 400,
    metaFamily: 'DM Mono, monospace', metaLetterSpacing: '0.32em', itemDivider: 'dotted', itemDividerOpacity: 0.7,
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
  const fonts   = FONT_STYLES[fontStyle]  || FONT_STYLES.editorial;

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
            return <button key={key} onClick={() => setFontStyle(key)} style={{ background: active ? COLORS.ink : 'transparent', color: active ? COLORS.cream : COLORS.ink, border: `1.5px solid ${active ? COLORS.ink : '#c8bdb0'}`, padding: '6px 12px', fontFamily: fs.previewFont, fontStyle: fs.previewStyle, fontWeight: fs.previewWeight, fontSize: 11, letterSpacing: key === 'mono' || key === 'condensed' ? '0.08em' : key === 'sharp' ? '0.04em' : '0.02em', cursor: 'pointer', textTransform: (key === 'bold' || key === 'condensed') ? 'uppercase' : 'none' }}>{fs.label}</button>;
          })}
        </PickerRow>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24, marginTop: 4 }}>
          <ActionButton onClick={downloadPoster} disabled={downloading} primary><Download size={14} strokeWidth={2.5} />{downloading ? 'Generating...' : 'Download poster'}</ActionButton>
          <ActionButton onClick={copyLink}>{copied === 'link' ? <Check size={14} strokeWidth={2.5} /> : <Link2 size={14} strokeWidth={2.5} />}{copied === 'link' ? 'Copied' : 'Copy link'}</ActionButton>
          <ActionButton onClick={copyText}>{copied === 'text' ? <Check size={14} strokeWidth={2.5} /> : <Copy size={14} strokeWidth={2.5} />}{copied === 'text' ? 'Copied' : 'Copy as text'}</ActionButton>
        </div>

        <div style={{ background: '#000', padding: 8, borderRadius: 4, display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
          <PosterScaler>
            <Poster ref={posterRef} list={list} items={items} modeLabel={modeLabel} sourceNames={constituentSourceNames} palette={palette} fonts={fonts} />
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

const Poster = React.forwardRef(function Poster({ list, items, modeLabel, sourceNames, palette, fonts }, ref) {
  const pal = palette || COLOR_SCHEMES.classic;
  const fnt = fonts   || FONT_STYLES.editorial;
  const dividerColor = `rgba(${parseInt(pal.text.slice(1,3),16)},${parseInt(pal.text.slice(3,5),16)},${parseInt(pal.text.slice(5,7),16)},${fnt.itemDividerOpacity ?? 1})`;

  return (
    <div ref={ref} style={{ width: POSTER_W, height: POSTER_H, background: pal.bg, color: pal.text, padding: 72, position: 'relative', boxSizing: 'border-box', fontFamily: fnt.nameFamily, overflow: 'hidden' }}>

      {/* Masthead */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${pal.text}`, paddingBottom: 18, fontFamily: fnt.metaFamily, fontSize: 18, letterSpacing: fnt.metaLetterSpacing, textTransform: 'uppercase', color: pal.text }}>
        <span style={{ fontWeight: 600 }}>Source of Truths</span>
        <span style={{ color: pal.faded, fontSize: 14 }}>sourceoftruths.com</span>
      </div>

      {/* Category */}
      <div style={{ marginTop: 42, fontFamily: fnt.metaFamily, fontSize: 18, letterSpacing: fnt.metaLetterSpacing, textTransform: 'uppercase', color: pal.accent, fontWeight: 600 }}>
        {list.category} &middot; Top {Math.min(items.length, 10)}
      </div>

      {/* Title */}
      <h1 style={{
        fontFamily: fnt.titleFamily,
        fontWeight: fnt.titleWeight,
        fontStyle: fnt.titleItalic ? 'italic' : 'normal',
        textTransform: fnt.titleUppercase ? 'uppercase' : 'none',
        fontSize: items.length >= 10 ? 88 : 100,
        lineHeight: 0.92,
        letterSpacing: fnt.titleUppercase ? '-0.02em' : '-0.03em',
        margin: '14px 0 0',
        color: pal.text,
        fontVariationSettings: fnt.titleVariation || 'normal',
        maxWidth: '92%',
      }}>{list.title}</h1>

      {/* Mode label */}
      <div style={{
        marginTop: 20,
        fontFamily: fnt.titleFamily.includes('Mono') ? fnt.metaFamily : fnt.nameFamily,
        fontStyle: fnt.titleItalic ? 'italic' : (fnt.titleFamily.includes('Fraunces') ? 'italic' : 'normal'),
        fontSize: fnt.titleUppercase ? 22 : 26,
        letterSpacing: fnt.titleUppercase ? '0.06em' : 'normal',
        textTransform: fnt.titleUppercase ? 'uppercase' : 'none',
        color: pal.faded,
        paddingLeft: 16,
        borderLeft: `3px solid ${pal.accent}`,
        lineHeight: 1.3,
      }}>{modeLabel}</div>

      {/* Items */}
      <ol style={{ listStyle: 'none', padding: 0, margin: '36px 0 0' }}>
        {items.map((item, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 24, padding: fnt.titleUppercase ? '11px 0' : '14px 0', borderBottom: i < items.length - 1 ? `1px ${fnt.itemDivider} ${dividerColor}` : 'none' }}>
            <span style={{
              fontFamily: fnt.numberFamily,
              fontWeight: 900,
              fontSize: i === 0 ? 64 : 44,
              color: i === 0 ? pal.accent : pal.text,
              minWidth: 78,
              lineHeight: 0.9,
              fontVariationSettings: fnt.numberVariation || 'normal',
              fontFeatureSettings: '"lnum" 1',
              opacity: i === 0 ? 1 : 0.5,
            }}>{fnt.titleUppercase ? String(i + 1).padStart(2, '0') : String(i + 1)}</span>
            <span style={{
              fontFamily: fnt.nameFamily,
              fontSize: i === 0 ? 38 : 30,
              fontWeight: i === 0 ? (fnt.nameWeight > 500 ? fnt.nameWeight : 700) : fnt.nameWeight,
              lineHeight: 1.05,
              letterSpacing: fnt.nameFamily.includes('Mono') ? '0.01em' : '-0.01em',
              color: pal.text,
              flex: 1,
              fontVariationSettings: fnt.nameVariation || 'normal',
              fontStyle: fnt.titleItalic && i !== 0 ? 'italic' : 'normal',
            }}>{item}</span>
          </li>
        ))}
      </ol>

      {/* Sources footer */}
      {sourceNames && sourceNames.length > 0 && (
        <div style={{ position: 'absolute', bottom: 52, left: 72, right: 72, borderTop: `2px solid ${pal.text}`, paddingTop: 18, fontFamily: fnt.metaFamily, fontSize: 17, letterSpacing: '0.03em', lineHeight: 1.45, color: pal.faded }}>
          <span style={{ fontWeight: 600, color: pal.text }}>Sources: </span>
          {[...sourceNames, ...(list.mode !== 'facts' && list.mode !== 'scores' && list.mode !== 'unranked' ? ['CG User Vote'] : [])].join(', ')}
        </div>
      )}
    </div>
  );
});
