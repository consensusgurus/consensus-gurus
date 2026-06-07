import { ImageResponse } from 'next/og';
import { LISTS } from '@/lib/data';
import { HERO_IMAGES } from '@/lib/hero-images';
import { getSources } from '@/lib/helpers';

export const runtime = 'edge';

// Instagram-ready poster: the snapshot page's Ink Spotlight design rendered
// server-side at 1080x1350 (IG's 4:5 portrait max). Layout mirrors
// PosterSpotlight in app/snapshot/[id]/SnapshotClient.jsx — keep the two in
// sync when the design changes. Consensus comes from the REAL lib/helpers.js
// getSources (imported, not mirrored) plus live votes/extras fetched from
// Supabase REST, so the poster always matches the site's Consensus tab.

const W = 1080;
const H = 1350;
// Ink palette — COLOR_SCHEMES.ink in SnapshotClient.jsx
const PAL = { bg: '#0a0a0a', text: '#ffffff', accent: '#ffffff', faded: '#555555' };

// --- copied from SnapshotClient.jsx (sourceTier / constituentLabel) ---
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
    ['michelin', 'Michelin'], ['infatuation', 'Infatuation'], ['eater', 'Eater'],
    ['time out', 'Time Out'], ['timeout', 'Time Out'], ['u.s. news', 'US News'], ['us news', 'US News'],
    ['condé nast', 'Condé Nast'], ['conde nast', 'Condé Nast'], ['cntraveler', 'Condé Nast'],
    ['travel + leisure', 'T+L'], ['travel and leisure', 'T+L'], ['robb report', 'Robb Report'],
    ['forbes', 'Forbes'], ['points guy', 'Points Guy'], ['afar', 'AFAR'],
    ['wirecutter', 'Wirecutter'], ['good housekeeping', 'Good Housekeeping'], ['cnet', 'CNET'],
    ['serious eats', 'Serious Eats'], ['thrillist', 'Thrillist'], ['new york times', 'NYT'],
    ['bon app', 'Bon Appétit'], ['esquire', 'Esquire'],
    ['johnny novo', 'Johnny Novo'], ['johnnynovo', 'Johnny Novo'],
    ['the strategist', 'Strategist'], ['rolling stone', 'Rolling Stone'], ['pitchfork', 'Pitchfork'],
  ];
  for (let i = 0; i < MAP.length; i++) { if (l.includes(MAP[i][0])) return MAP[i][1]; }
  let s = raw.split(/[·—|:(,]/)[0];
  s = s.replace(/\b(19|20)\d\d\b/g, '').replace(/\s{2,}/g, ' ').trim();
  const CAP = 22;
  if (s.length > CAP) { const cut = s.slice(0, CAP); const sp = cut.lastIndexOf(' '); if (sp > 6) s = cut.slice(0, sp).trim(); }
  return s || raw;
}
// --- end copies ---

function fitTitle(title, base) {
  const n = (title || '').length;
  if (n > 64) return Math.round(base * 0.58);
  if (n > 44) return Math.round(base * 0.72);
  if (n > 30) return Math.round(base * 0.86);
  return base;
}

function heroSrcFor(list, item) {
  const entry = item ? (HERO_IMAGES[list.id] || {})[item] : null;
  if (!entry) return null;
  return typeof entry === 'string' ? entry : entry.src;
}

async function loadFont(url) {
  try {
    const res = await fetch(url);
    if (res.ok) return await res.arrayBuffer();
  } catch (e) { /* fall through */ }
  return null;
}

export async function GET(request, { params }) {
  const list = LISTS.find((l) => l.id === params.id);
  if (!list) return new Response('Not found', { status: 404 });

  // Live votes + extras straight from Supabase REST (no supabase-js, keeps the
  // edge bundle small). Graceful fallback: sources-only consensus.
  let voteData;
  let extras;
  try {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (base && key) {
      const headers = { apikey: key, Authorization: `Bearer ${key}` };
      const [vRes, eRes] = await Promise.all([
        fetch(`${base}/rest/v1/votes?list_id=eq.${encodeURIComponent(list.id)}&select=item_name,score`, { headers }),
        fetch(`${base}/rest/v1/extras?list_id=eq.${encodeURIComponent(list.id)}&select=item_name`, { headers }),
      ]);
      if (vRes.ok) {
        const rows = await vRes.json();
        voteData = {};
        rows.forEach((r) => { voteData[`${list.id}::${String(r.item_name).toLowerCase().trim()}`] = Math.max(0, r.score); });
      }
      if (eRes.ok) {
        const rows = await eRes.json();
        extras = rows.map((r) => r.item_name);
      }
    }
  } catch (e) { voteData = undefined; extras = undefined; }

  const mode = list.mode || 'both';
  const srcs = getSources(list, voteData, extras);
  let items;
  if (mode === 'facts' || mode === 'scores' || mode === 'unranked') {
    items = (((list.sources || {}).ai || {}).items || []).slice(0, 10);
  } else {
    const cons = srcs.find((s) => s.id === 'consensus') || srcs[0] || { items: [] };
    items = (cons.items || []).slice(0, 10);
  }
  if (items.length === 0) return new Response('No items', { status: 404 });

  const orderedSrcs = srcs
    .filter((s) => s.id !== 'consensus' && s.id !== 'ai')
    .map((s, i) => ({ s, i, t: sourceTier(s) }))
    .sort((a, b) => a.t - b.t || a.i - b.i);
  const seen = new Set();
  const sourceNames = [];
  orderedSrcs.forEach((x) => {
    const label = constituentLabel(x.s);
    const k = label.toLowerCase().trim();
    if (k && !seen.has(k)) { seen.add(k); sourceNames.push(label); }
  });

  const [sans900, sans600, mono500] = await Promise.all([
    loadFont('https://cdn.jsdelivr.net/npm/@fontsource/dm-sans@5/files/dm-sans-latin-900-normal.woff'),
    loadFont('https://cdn.jsdelivr.net/npm/@fontsource/dm-sans@5/files/dm-sans-latin-600-normal.woff'),
    loadFont('https://cdn.jsdelivr.net/npm/@fontsource/dm-mono@5/files/dm-mono-latin-500-normal.woff'),
  ]);
  const fonts = [];
  if (sans900) fonts.push({ name: 'DM Sans', data: sans900, weight: 900, style: 'normal' });
  if (sans600) fonts.push({ name: 'DM Sans', data: sans600, weight: 600, style: 'normal' });
  if (mono500) fonts.push({ name: 'DM Mono', data: mono500, weight: 500, style: 'normal' });
  const sans = sans900 ? 'DM Sans' : 'sans-serif';
  const mono = mono500 ? 'DM Mono' : 'monospace';

  const top = items[0] || '';
  const rest = items.slice(1);
  const topSrc = heroSrcFor(list, top);
  const modeLabel = 'Consensus';

  return new ImageResponse(
    (
      <div style={{ width: W, height: H, background: PAL.bg, color: PAL.text, fontFamily: sans, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', padding: '42px 56px 18px', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: mono, fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase', color: PAL.faded }}>
            <span style={{ color: PAL.accent, fontWeight: 700 }}>Source of Truths</span>
            <span>{`${list.category} · ${modeLabel}`}</span>
          </div>
          <div style={{ display: 'flex', fontFamily: sans, fontWeight: 900, fontSize: fitTitle(list.title, 58), lineHeight: 0.9, letterSpacing: '-0.03em', marginTop: 16, color: PAL.text, maxWidth: '96%' }}>
            {list.title}
          </div>
        </div>
        <div style={{ display: 'flex', flexGrow: 2.2, flexShrink: 0, flexBasis: 0, position: 'relative', marginLeft: 56, marginRight: 56, overflow: 'hidden', background: topSrc ? PAL.accent : '#1a1a1a' }}>
          {topSrc ? (
            <img src={topSrc} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : null}
          <div style={{ display: 'flex', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.82), rgba(0,0,0,0.18) 56%, rgba(0,0,0,0))' }} />
          <div style={{ display: 'flex', position: 'absolute', left: 28, right: 28, bottom: 24, alignItems: 'flex-end', gap: 18 }}>
            <span style={{ fontFamily: sans, fontWeight: 900, fontSize: 78, lineHeight: 0.78, color: PAL.accent, textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>01</span>
            <span style={{ fontFamily: sans, fontWeight: 900, fontSize: 40, lineHeight: 1, letterSpacing: '-0.02em', color: '#ffffff', flexGrow: 1, paddingBottom: 6, wordBreak: 'break-word', textShadow: '0 2px 10px rgba(0,0,0,0.6)' }}>{top}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexGrow: 3, flexShrink: 0, flexBasis: 0, flexDirection: 'column', padding: '10px 56px 0' }}>
          {rest.map((item, i) => (
            <div key={String(i)} style={{ display: 'flex', flexGrow: 1, flexBasis: 0, alignItems: 'center', gap: 22, borderTop: '1px solid rgba(255,255,255,0.16)' }}>
              <span style={{ fontFamily: mono, fontWeight: 500, fontSize: 28, color: i < 2 ? PAL.accent : PAL.faded, minWidth: 52, flexShrink: 0 }}>{String(i + 2).padStart(2, '0')}</span>
              <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 25, color: PAL.text, lineHeight: 1.04, flexGrow: 1, letterSpacing: '-0.02em', wordBreak: 'break-word' }}>{item}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexShrink: 0, padding: '10px 56px 26px', justifyContent: 'space-between', fontFamily: mono, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: PAL.faded }}>
          <span style={{ maxWidth: 820, overflow: 'hidden' }}>{sourceNames.length > 0 ? `Sources: ${sourceNames.join(', ')}` : ''}</span>
          <span>{`sourceoftruths.com/list/${list.id}`}</span>
        </div>
      </div>
    ),
    { width: W, height: H, fonts }
  );
}
