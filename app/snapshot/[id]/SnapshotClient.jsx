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
  classic:  { label: 'Classic',  bg: '#f4ede0', text: '#1a1a1a', accent: '#c0392b', faded: '#8a7a6a', swatch: ['#f4ede0', '#c0392b'] },
  midnight: { label: 'Midnight', bg: '#111118', text: '#f0eeea', accent: '#d4a944', faded: '#7070a0', swatch: ['#111118', '#d4a944'] },
  slate:    { label: 'Slate',    bg: '#1c2b3a', text: '#dce8f0', accent: '#4ea8de', faded: '#7090a8', swatch: ['#1c2b3a', '#4ea8de'] },
  forest:   { label: 'Forest',   bg: '#0e1e14', text: '#d8ead0', accent: '#6cbf5a', faded: '#5a8060', swatch: ['#0e1e14', '#6cbf5a'] },
  crimson:  { label: 'Crimson',  bg: '#b82c20', text: '#fdf4ec', accent: '#f5e050', faded: '#e8a090', swatch: ['#b82c20', '#f5e050'] },
  neon:     { label: 'Neon',     bg: '#000000', text: '#ffffff', accent: '#00ff88', faded: '#666666', swatch: ['#000000', '#00ff88'] },
  cobalt:   { label: 'Cobalt',   bg: '#1244c5', text: '#eef3ff', accent: '#ffde59', faded: '#8aaae0', swatch: ['#1244c5', '#ffde59'] },
};

const FONT_STYLES = {
  editorial: {
    label: 'Editorial', previewFont: 'Fraunces, serif', previewStyle: 'italic', previewWeight: 700,
    titleFamily: 'Fraunces, serif', titleItalic: false, titleVariation: '"SOFT" 100, "WONK" 1', titleWeight: 900,
    numberFamily: 'Fraunces, serif', numberVariation: '"SOFT" 100, "WONK" 1', numberItalic: false,
    nameFamily: 'Fraunces, serif', nameVariation: '"SOFT" 100',
    metaFamily: 'DM Mono, monospace', metaLetterSpacing: '0.3em', itemDivider: 'solid',
  },
  sharp: {
    label: 'Sharp', previewFont: 'DM Sans, sans-serif', previewStyle: 'normal', previewWeight: 800,
    titleFamily: 'DM Sans, sans-serif', titleItalic: false, titleVariation: '', titleWeight: 900,
    numberFamily: 'DM Mono, monospace', numberVariation: '', numberItalic: false,
    nameFamily: 'DM Sans, sans-serif', nameVariation: '',
    metaFamily: 'DM Mono, monospace', metaLetterSpacing: '0.22em', itemDivider: 'solid',
  },
  magazine: {
    label: 'Magazine', previewFont: 'DM Sans, sans-serif', previewStyle: 'normal', previewWeight: 700,
    titleFamily: 'DM Sans, sans-serif', titleItalic: false, titleVariation: '', titleWeight: 900,
    numberFamily: 'Fraunces, serif', numberVariation: '"SOFT" 100, "WONK" 1', numberItalic: false,
    nameFamily: 'DM Sans, sans-serif', nameVariation: '',
    metaFamily: 'DM Mono, monospace', metaLetterSpacing: '0.28em', itemDivider: 'solid',
  },
  mono: {
    label: 'Mono', previewFont: 'DM Mono, monospace', previewStyle: 'normal', previewWeight: 700,
    titleFamily: 'DM Mono, monospace', titleItalic: false, titleVariation: '', titleWeight: 700,
    numberFamily: 'DM Mono, monospace', numberVariation: '', numberItalic: false,
    nameFamily: 'DM Mono, monospace', nameVariation: '',
    metaFamily: 'DM Mono, monospace', metaLetterSpacing: '0.2em', itemDivider: 'dashed',
  },
};

const LAYOUTS = {
  standard:  { label: 'Standard',  desc: 'Classic ranked list' },
  gradient:  { label: 'Gradient',  desc: 'Bold sweep with watermark' },
  broadside: { label: 'Broadside', desc: 'Newspaper editorial' },
  blueprint: { label: 'Blueprint', desc: 'Technical grid' },
  stage:     { label: 'Stage',     desc: 'Centered playbill' },
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
  const [layout, setLayout] = useState('standard');
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
            return <button key={key} onClick={() => setFontStyle(key)} style={{ background: active ? COLORS.ink : 'transparent', color: active ? COLORS.cream : COLORS.ink, border: `1.5px solid ${active ? COLORS.ink : '#c8bdb0'}`, padding: '6px 12px', fontFamily: fs.previewFont, fontStyle: fs.previewStyle, fontWeight: fs.previewWeight, fontSize: 11, letterSpacing: key === 'mono' ? '0.08em' : key === 'sharp' ? '0.04em' : '0.02em', cursor: 'pointer' }}>{fs.label}</button>;
          })}
        </PickerRow>

        <PickerRow label="Layout">
          {Object.entries(LAYOUTS).map(([key, ly]) => {
            const active = layout === key;
            return (
              <button key={key} onClick={() => setLayout(key)}
                style={{ background: active ? COLORS.ink : 'transparent', color: active ? COLORS.cream : COLORS.ink, border: `1.5px solid ${active ? COLORS.ink : '#c8bdb0'}`, padding: '6px 12px', fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer' }}>
                {ly.label}
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
            <Poster ref={posterRef} list={list} items={items} modeLabel={modeLabel} sourceNames={constituentSourceNames} palette={palette} fonts={fonts} layout={layout} />
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

const Poster = React.forwardRef(function Poster({ list, items, modeLabel, sourceNames, palette, fonts, layout }, ref) {
  const pal = palette || COLOR_SCHEMES.classic;
  const fnt = fonts   || FONT_STYLES.editorial;
  const props = { list, items, modeLabel, sourceNames, pal, fnt };
  if (layout === 'gradient')  return <GradientPoster  ref={ref} {...props} />;
  if (layout === 'broadside') return <BroadsidePoster ref={ref} {...props} />;
  if (layout === 'blueprint') return <BlueprintPoster ref={ref} {...props} />;
  if (layout === 'stage')     return <StagePoster     ref={ref} {...props} />;
  return <StandardPoster ref={ref} {...props} />;
});

const StandardPoster = React.forwardRef(function StandardPoster({ list, items, modeLabel, sourceNames, pal, fnt }, ref) {
  return (
    <div ref={ref} style={{ width: POSTER_W, height: POSTER_H, background: pal.bg, color: pal.text, padding: 72, position: 'relative', boxSizing: 'border-box', fontFamily: fnt.nameFamily, overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${pal.text}`, paddingBottom: 18, fontFamily: fnt.metaFamily, fontSize: 18, letterSpacing: fnt.metaLetterSpacing, textTransform: 'uppercase', color: pal.text }}>
        <span style={{ fontWeight: 600 }}>Source of Truths</span>
        <span style={{ color: pal.faded, fontSize: 14 }}>sourceoftruths.com</span>
      </div>
      <div style={{ marginTop: 42, fontFamily: fnt.metaFamily, fontSize: 18, letterSpacing: fnt.metaLetterSpacing, textTransform: 'uppercase', color: pal.accent, fontWeight: 600 }}>{list.category} &middot; Top {Math.min(items.length, 10)}</div>
      <h1 style={{ fontFamily: fnt.titleFamily, fontWeight: fnt.titleWeight, fontStyle: fnt.titleItalic ? 'italic' : 'normal', fontSize: items.length >= 10 ? 88 : 100, lineHeight: 0.92, letterSpacing: '-0.03em', margin: '14px 0 0', color: pal.text, fontVariationSettings: fnt.titleVariation || 'normal', maxWidth: '92%' }}>{list.title}</h1>
      <div style={{ marginTop: 20, fontFamily: fnt.titleFamily.includes('Mono') ? fnt.metaFamily : fnt.nameFamily, fontStyle: fnt.titleFamily.includes('Fraunces') ? 'italic' : 'normal', fontSize: 26, color: pal.faded, paddingLeft: 16, borderLeft: `3px solid ${pal.accent}`, lineHeight: 1.3 }}>{modeLabel}</div>
      <ol style={{ listStyle: 'none', padding: 0, margin: '36px 0 0' }}>
        {items.map((item, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 24, padding: '14px 0', borderBottom: i < items.length - 1 ? `1px ${fnt.itemDivider} ${pal.text}` : 'none' }}>
            <span style={{ fontFamily: fnt.numberFamily, fontWeight: 900, fontSize: i === 0 ? 64 : 44, color: i === 0 ? pal.accent : pal.text, minWidth: 78, lineHeight: 0.9, fontVariationSettings: fnt.numberVariation || 'normal', fontFeatureSettings: '"lnum" 1', opacity: i === 0 ? 1 : 0.55 }}>{String(i + 1)}</span>
            <span style={{ fontFamily: fnt.nameFamily, fontSize: i === 0 ? 38 : 30, fontWeight: i === 0 ? 700 : 500, lineHeight: 1.05, letterSpacing: '-0.01em', color: pal.text, flex: 1, fontVariationSettings: fnt.nameVariation || 'normal' }}>{item}</span>
          </li>
        ))}
      </ol>
      {sourceNames && sourceNames.length > 0 && (
        <div style={{ position: 'absolute', bottom: 52, left: 72, right: 72, borderTop: `2px solid ${pal.text}`, paddingTop: 18, fontFamily: fnt.metaFamily, fontSize: 17, letterSpacing: '0.03em', lineHeight: 1.45, color: pal.faded }}>
          <span style={{ fontWeight: 600, color: pal.text }}>Sources: </span>
          {[...sourceNames, ...(list.mode !== 'facts' && list.mode !== 'scores' && list.mode !== 'unranked' ? ['CG User Vote'] : [])].join(', ')}
        </div>
      )}
    </div>
  );
});

const GradientPoster = React.forwardRef(function GradientPoster({ list, items, modeLabel, sourceNames, pal, fnt }, ref) {
  const grad = `linear-gradient(145deg, ${pal.bg} 0%, ${pal.text} 100%)`;
  const textCol = pal.bg;
  return (
    <div ref={ref} style={{ width: POSTER_W, height: POSTER_H, background: grad, color: textCol, padding: 72, position: 'relative', boxSizing: 'border-box', fontFamily: fnt.nameFamily, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -40, right: -20, fontFamily: fnt.numberFamily, fontWeight: 900, fontSize: 600, lineHeight: 1, color: pal.text, opacity: 0.06, fontVariationSettings: fnt.numberVariation || 'normal', pointerEvents: 'none', userSelect: 'none' }}>1</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 60, fontFamily: fnt.metaFamily, fontSize: 15, letterSpacing: '0.28em', textTransform: 'uppercase', color: textCol, opacity: 0.7 }}>
        <span style={{ fontWeight: 600 }}>Source of Truths</span>
        <span>sourceoftruths.com</span>
      </div>
      <div style={{ fontFamily: fnt.metaFamily, fontSize: 16, letterSpacing: '0.3em', textTransform: 'uppercase', color: pal.accent, fontWeight: 700, marginBottom: 12 }}>{list.category}</div>
      <h1 style={{ fontFamily: fnt.titleFamily, fontWeight: fnt.titleWeight, fontStyle: fnt.titleItalic ? 'italic' : 'normal', fontSize: 82, lineHeight: 0.9, letterSpacing: '-0.04em', margin: '0 0 10px', color: textCol, fontVariationSettings: fnt.titleVariation || 'normal', maxWidth: '88%' }}>{list.title}</h1>
      <div style={{ width: 60, height: 4, background: pal.accent, margin: '18px 0 22px' }} />
      <div style={{ fontFamily: fnt.metaFamily, fontSize: 14, letterSpacing: '0.22em', textTransform: 'uppercase', color: textCol, opacity: 0.6, marginBottom: 44 }}>{modeLabel}</div>
      <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map((item, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 28, marginBottom: i === 0 ? 20 : 10 }}>
            <span style={{ fontFamily: fnt.numberFamily, fontWeight: 900, fontSize: i === 0 ? 56 : 32, color: i === 0 ? pal.accent : textCol, minWidth: 66, lineHeight: 1, fontVariationSettings: fnt.numberVariation || 'normal', opacity: i === 0 ? 1 : 0.45, flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
            <span style={{ fontFamily: fnt.nameFamily, fontSize: i === 0 ? 34 : 24, fontWeight: i === 0 ? 700 : 400, lineHeight: 1.1, letterSpacing: '-0.01em', color: textCol, flex: 1, fontVariationSettings: fnt.nameVariation || 'normal', opacity: i === 0 ? 1 : 0.85 }}>{item}</span>
          </li>
        ))}
      </ol>
      <div style={{ position: 'absolute', bottom: 52, left: 72, right: 72, fontFamily: fnt.metaFamily, fontSize: 14, letterSpacing: '0.06em', color: textCol, opacity: 0.45 }}>
        {sourceNames && sourceNames.length > 0 && sourceNames.join(' · ')}
      </div>
    </div>
  );
});

const BroadsidePoster = React.forwardRef(function BroadsidePoster({ list, items, modeLabel, sourceNames, pal, fnt }, ref) {
  return (
    <div ref={ref} style={{ width: POSTER_W, height: POSTER_H, background: pal.bg, color: pal.text, padding: '60px 80px', position: 'relative', boxSizing: 'border-box', fontFamily: fnt.nameFamily, overflow: 'hidden' }}>
      <div style={{ height: 8, background: pal.text, marginBottom: 0 }} />
      <div style={{ height: 2, background: pal.text, marginTop: 5, marginBottom: 22 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: fnt.metaFamily, fontSize: 13, letterSpacing: '0.22em', textTransform: 'uppercase', color: pal.faded, marginBottom: 20 }}>
        <span>Source of Truths</span>
        <span>{list.category}</span>
        <span>sourceoftruths.com</span>
      </div>
      <div style={{ height: 1, background: pal.text, marginBottom: 24, opacity: 0.3 }} />
      <h1 style={{ fontFamily: fnt.titleFamily, fontWeight: fnt.titleWeight, fontStyle: fnt.titleItalic ? 'italic' : 'normal', fontSize: 96, lineHeight: 0.88, letterSpacing: '-0.04em', margin: '0 0 18px', color: pal.text, fontVariationSettings: fnt.titleVariation || 'normal', textTransform: fnt.titleFamily.includes('Mono') || fnt.titleFamily.includes('Sans') ? 'uppercase' : 'none' }}>{list.title}</h1>
      <div style={{ fontFamily: fnt.metaFamily, fontSize: 15, letterSpacing: '0.14em', textTransform: 'uppercase', color: pal.accent, fontWeight: 700, marginBottom: 6 }}>{modeLabel}</div>
      <div style={{ height: 3, background: pal.accent, marginBottom: 28 }} />
      <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map((item, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 18, padding: '11px 0', borderBottom: `1px solid ${pal.text}`, opacity: i === 0 ? 1 : 0.88 }}>
            <span style={{ fontFamily: fnt.metaFamily, fontWeight: 700, fontSize: 13, letterSpacing: '0.12em', color: i === 0 ? pal.accent : pal.faded, minWidth: 34, flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
            <span style={{ fontFamily: fnt.nameFamily, fontSize: i === 0 ? 40 : 30, fontWeight: i === 0 ? 800 : 500, lineHeight: 1.0, letterSpacing: fnt.nameFamily.includes('Mono') ? '0' : '-0.02em', color: pal.text, flex: 1, fontVariationSettings: fnt.nameVariation || 'normal' }}>{item}</span>
          </li>
        ))}
      </ol>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <div style={{ height: 1, background: pal.text, opacity: 0.2 }} />
        <div style={{ height: 36, background: pal.text, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 80px' }}>
          <span style={{ fontFamily: fnt.metaFamily, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: pal.bg, opacity: 0.75 }}>{sourceNames && sourceNames.length > 0 ? sourceNames.join(' · ') : ''}</span>
          <span style={{ fontFamily: fnt.metaFamily, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: pal.bg, opacity: 0.75 }}>sourceoftruths.com</span>
        </div>
      </div>
    </div>
  );
});

const BlueprintPoster = React.forwardRef(function BlueprintPoster({ list, items, modeLabel, sourceNames, pal, fnt }, ref) {
  const navy = '#0b1c2e';
  const ink  = '#c8dff0';
  const grid = 'rgba(100,160,210,0.12)';
  const accent = pal.accent;
  const gridBg = `repeating-linear-gradient(0deg, ${grid} 0px, ${grid} 1px, transparent 1px, transparent 54px), repeating-linear-gradient(90deg, ${grid} 0px, ${grid} 1px, transparent 1px, transparent 54px)`;
  return (
    <div ref={ref} style={{ width: POSTER_W, height: POSTER_H, background: navy, backgroundImage: gridBg, color: ink, padding: 72, position: 'relative', boxSizing: 'border-box', fontFamily: 'DM Mono, monospace', overflow: 'hidden' }}>
      {[{top:20,left:20},{top:20,right:20},{bottom:20,left:20},{bottom:20,right:20}].map((pos, i) => (
        <div key={i} style={{ position: 'absolute', ...pos, width: 28, height: 28, borderTop: i < 2 ? `2px solid ${accent}` : 'none', borderBottom: i >= 2 ? `2px solid ${accent}` : 'none', borderLeft: i % 2 === 0 ? `2px solid ${accent}` : 'none', borderRight: i % 2 === 1 ? `2px solid ${accent}` : 'none' }} />
      ))}
      <div style={{ borderBottom: `1px solid rgba(100,160,210,0.4)`, paddingBottom: 16, marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: accent, marginBottom: 4, fontWeight: 700 }}>SOURCE OF TRUTHS</div>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.18em', color: ink, opacity: 0.45 }}>sourceoftruths.com</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: ink, opacity: 0.5 }}>{list.category}</div>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.18em', color: accent, opacity: 0.7 }}>{modeLabel}</div>
        </div>
      </div>
      <h1 style={{ fontFamily: fnt.titleFamily === 'Fraunces, serif' ? 'DM Mono, monospace' : fnt.titleFamily, fontWeight: 700, fontSize: 80, lineHeight: 0.9, letterSpacing: fnt.titleFamily.includes('Mono') ? '-0.01em' : '-0.03em', margin: '0 0 36px', color: ink, maxWidth: '90%', textTransform: 'uppercase' }}>{list.title}</h1>
      <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map((item, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '12px 0', borderBottom: `1px solid rgba(100,160,210,0.18)` }}>
            <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: 12, letterSpacing: '0.1em', color: i === 0 ? accent : ink, opacity: i === 0 ? 1 : 0.5, minWidth: 50, flexShrink: 0 }}>[{String(i + 1).padStart(2, '0')}]</span>
            <span style={{ fontFamily: fnt.nameFamily === 'Fraunces, serif' ? 'DM Mono, monospace' : fnt.nameFamily, fontSize: i === 0 ? 36 : 27, fontWeight: i === 0 ? 700 : 400, letterSpacing: i === 0 ? '0.01em' : '0.02em', color: i === 0 ? ink : `rgba(200,223,240,0.8)`, flex: 1, lineHeight: 1.1 }}>{item}</span>
            {i === 0 && <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.14em', color: accent, opacity: 0.8, flexShrink: 0 }}>RANK 1</span>}
          </li>
        ))}
      </ol>
      <div style={{ position: 'absolute', bottom: 40, left: 72, right: 72, borderTop: `1px solid rgba(100,160,210,0.25)`, paddingTop: 14, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.12em', color: ink, opacity: 0.35 }}>{sourceNames && sourceNames.length > 0 ? `SRC: ${sourceNames.join(', ')}` : ''}</span>
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.12em', color: accent, opacity: 0.5 }}>REV A</span>
      </div>
    </div>
  );
});

const StagePoster = React.forwardRef(function StagePoster({ list, items, modeLabel, sourceNames, pal, fnt }, ref) {
  const ornament = '· · ·';
  return (
    <div ref={ref} style={{ width: POSTER_W, height: POSTER_H, background: pal.bg, color: pal.text, padding: '56px 80px', position: 'relative', boxSizing: 'border-box', fontFamily: fnt.nameFamily, overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', height: 3, background: pal.text, marginBottom: 4 }} />
      <div style={{ width: '100%', height: 1, background: pal.text, marginBottom: 22, opacity: 0.4 }} />
      <div style={{ fontFamily: fnt.metaFamily, fontSize: 13, letterSpacing: '0.38em', textTransform: 'uppercase', color: pal.faded, marginBottom: 4 }}>Source of Truths</div>
      <div style={{ fontFamily: fnt.metaFamily, fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: pal.accent, fontWeight: 700, marginBottom: 18 }}>{list.category}</div>
      <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 18, letterSpacing: '0.5em', color: pal.accent, marginBottom: 18 }}>{ornament}</div>
      <h1 style={{ fontFamily: fnt.titleFamily, fontWeight: fnt.titleWeight, fontStyle: fnt.titleItalic ? 'italic' : 'normal', fontSize: 82, lineHeight: 0.9, letterSpacing: '-0.03em', margin: '0 0 16px', color: pal.text, fontVariationSettings: fnt.titleVariation || 'normal', textAlign: 'center', maxWidth: '90%' }}>{list.title}</h1>
      <div style={{ fontFamily: fnt.nameFamily, fontStyle: fnt.titleFamily.includes('Fraunces') ? 'italic' : 'normal', fontSize: 22, color: pal.faded, marginBottom: 8 }}>{modeLabel}</div>
      <div style={{ width: '80%', height: 1, background: pal.text, opacity: 0.25, marginBottom: 6 }} />
      <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 16, letterSpacing: '0.4em', color: pal.accent, marginBottom: 24 }}>{ornament}</div>
      <div style={{ width: '100%' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 14, padding: i === 0 ? '10px 0 14px' : '7px 0', borderBottom: i < items.length - 1 ? `1px solid ${pal.text}` : 'none' }}>
            <span style={{ fontFamily: fnt.numberFamily, fontWeight: 900, fontSize: i === 0 ? 60 : 36, color: i === 0 ? pal.accent : pal.faded, lineHeight: 0.9, fontVariationSettings: fnt.numberVariation || 'normal', flexShrink: 0, minWidth: i === 0 ? 70 : 46, textAlign: 'right' }}>{String(i + 1)}</span>
            <span style={{ fontFamily: fnt.nameFamily, fontSize: i === 0 ? 38 : 26, fontWeight: i === 0 ? 700 : 400, lineHeight: 1.05, letterSpacing: '-0.01em', color: pal.text, fontVariationSettings: fnt.nameVariation || 'normal', flex: 1, textAlign: 'left' }}>{item}</span>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', bottom: 30, left: 80, right: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{ width: '80%', height: 1, background: pal.text, opacity: 0.2 }} />
        <div style={{ fontFamily: fnt.metaFamily, fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: pal.faded }}>sourceoftruths.com</div>
        <div style={{ height: 3, width: '100%', background: pal.text }} />
      </div>
    </div>
  );
});
