import { ImageResponse } from 'next/og';
import { LISTS } from '@/lib/data';
import { HERO_IMAGES } from '@/lib/hero-images';
import { getSources } from '@/lib/helpers';

export const runtime = 'edge';

// Instagram-ready poster: the snapshot page's Classic Showcase design rendered
// server-side at 1080x1350 (IG's 4:5 portrait max). Layout mirrors
// PosterShowcase (+ PhotoCard) in app/snapshot/[id]/SnapshotClient.jsx — keep
// the two in sync when the design changes. Consensus comes from the REAL
// lib/helpers.js getSources (imported, not mirrored) plus live votes/extras
// fetched from Supabase REST, so the poster always matches the site's
// Consensus tab.

const W = 1080;
const H = 1350;
// Classic palette — COLOR_SCHEMES.classic in SnapshotClient.jsx
const PAL = { bg: '#f4ede0', text: '#1a1a1a', accent: '#c0392b', faded: '#8a7a6a' };

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

// Pre-fetch a hero image URL from the Edge runtime with a tight timeout, and
// validate it returns image/* content. Returns the URL when good, null when
// the Edge runtime can't reliably fetch/decode it.
//
// WHY: Satori (next/og) fetches every <img src> from inside the Edge function.
// If a CDN is slow, blocks Vercel egress, or returns non-image content, the
// streaming ImageResponse aborts mid-render and the route returns HTTP 200
// with content-length: 0 (an unreadable PNG that breaks the IG /media POST).
// Pre-validating from the same Edge runtime catches those upfront — failed
// validations become null, and photoCard's existing solid-accent fallback
// panel renders in their place instead of the whole route crashing.
async function validateHero(url) {
  if (!url) return null;
  const ctl = new AbortController();
  const to = setTimeout(() => ctl.abort('timeout'), 3500);
  try {
    // Force CDNs to deliver JPEG/PNG. Satori's Edge image decoder is
    // unreliable on WebP/AVIF (browsers decode them fine, but ImageResponse
    // does not), which causes the streaming PNG response to abort with 0
    // bytes — the failure mode we are guarding against. The Accept header
    // covers Cloudinary's f_auto and similar negotiated delivery; the
    // explicit content-type check covers CDNs that ignore Accept.
    const r = await fetch(url, {
      signal: ctl.signal,
      redirect: 'follow',
      cache: 'force-cache',
      headers: { Accept: 'image/jpeg,image/png;q=0.9,*/*;q=0.1' },
    });
    clearTimeout(to);
    if (!r.ok) return null;
    const ct = (r.headers.get('content-type') || '').toLowerCase();
    if (!ct.startsWith('image/')) return null;
    if (ct.includes('webp') || ct.includes('avif')) return null;
    // Consume body to confirm the stream is actually deliverable (some CDNs
    // 200 with empty/aborted bodies). Cap at ~6MB to avoid OOM in Edge.
    const reader = r.body && r.body.getReader();
    if (!reader) return null;
    let bytes = 0;
    const tc = setTimeout(() => ctl.abort('body-timeout'), 2500);
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > 6 * 1024 * 1024) break;
      }
    } finally { clearTimeout(tc); }
    return bytes > 0 ? url : null;
  } catch (e) {
    clearTimeout(to);
    return null;
  }
}

// Last-resort text-only poster — used when the full ImageResponse construction
// throws synchronously. Guarantees the route never returns 0 bytes (which is
// the failure mode that hangs the IG /media POST).
function renderFallback(list, items, sans, mono, fonts) {
  try {
    return new ImageResponse(
      (
        <div style={{ width: W, height: H, background: PAL.bg, color: PAL.text, fontFamily: sans, display: 'flex', flexDirection: 'column', padding: '56px 56px 40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: mono, fontSize: 14, letterSpacing: '0.28em', textTransform: 'uppercase', color: PAL.faded }}>
            <span style={{ color: PAL.accent, fontWeight: 700 }}>Source of Truths</span>
            <span>{`${list.category} · Top ${Math.min(items.length, 10)}`}</span>
          </div>
          <div style={{ display: 'flex', fontFamily: sans, fontWeight: 900, fontSize: fitTitle(list.title, 62), lineHeight: 0.95, letterSpacing: '-0.03em', marginTop: 26, color: PAL.text, maxWidth: '96%' }}>
            {list.title}
          </div>
          <div style={{ display: 'flex', marginTop: 8, fontFamily: mono, fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: PAL.faded }}>Consensus</div>
          <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, marginTop: 28 }}>
            {items.slice(0, 10).map((item, i) => (
              <div key={String(i)} style={{ display: 'flex', flexGrow: 1, flexBasis: 0, alignItems: 'center', gap: 24, borderTop: '1px solid rgba(26,26,26,0.16)' }}>
                <span style={{ fontFamily: mono, fontWeight: 500, fontSize: 30, color: PAL.faded, minWidth: 70, flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 28, color: PAL.text, lineHeight: 1.05, flexGrow: 1, letterSpacing: '-0.02em', wordBreak: 'break-word' }}>{item || ''}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', marginTop: 18, justifyContent: 'flex-end', fontFamily: mono, fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: PAL.faded }}>
            {`sourceoftruths.com/list/${list.id}`}
          </div>
        </div>
      ),
      { width: W, height: H, fonts }
    );
  } catch (_) {
    return new Response('Render failed', { status: 500 });
  }
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
  // Keep the footer line short enough to never collide with the URL on the right.
  const shownSources = sourceNames.slice(0, 4);
  const moreSources = sourceNames.length - shownSources.length;
  const sourcesLine = shownSources.length > 0
    ? `Sources: ${shownSources.join(', ')}${moreSources > 0 ? ` +${moreSources}` : ''}`
    : '';

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

  const t3 = items.slice(0, 3);
  const rest = items.slice(3, 10);
  const modeLabel = 'Consensus';

  // Pre-validate the top-3 hero URLs from the Edge runtime in parallel.
  // Any URL that fails or stalls is replaced with null so photoCard falls back
  // to its solid-accent panel instead of triggering a Satori mid-stream crash.
  const t3Heroes = await Promise.all(t3.map((it) => validateHero(heroSrcFor(list, it))));

  // PhotoCard — mirrors PosterShowcase's PhotoCard in SnapshotClient.jsx.
  // When an item has no hero photo the card falls back to a solid accent
  // panel (white name text reads fine on the Classic red).
  const photoCard = (item, src, rank, big) => {
    return (
      <div style={{ display: 'flex', flexGrow: big ? 1.5 : 1, flexBasis: 0, position: 'relative', overflow: 'hidden', background: PAL.accent }}>
        {src ? (
          <img src={src} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : null}
        <div style={{ display: 'flex', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.12) 60%, rgba(0,0,0,0))' }} />
        <div style={{ display: 'flex', position: 'absolute', left: big ? 18 : 14, right: 12, bottom: big ? 16 : 11, alignItems: 'flex-end', gap: 10 }}>
          <span style={{ display: 'flex', fontFamily: sans, fontWeight: 900, fontSize: big ? 34 : 22, lineHeight: 1, color: PAL.bg, background: PAL.accent, padding: big ? '5px 13px' : '3px 9px', flexShrink: 0 }}>{String(rank)}</span>
          <span style={{ fontFamily: sans, fontWeight: 900, fontSize: big ? 30 : 19, lineHeight: 1, letterSpacing: '-0.02em', color: '#ffffff', flexGrow: 1, wordBreak: 'break-word', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>{item || ''}</span>
        </div>
      </div>
    );
  };

  try {
    return new ImageResponse(
      (
        <div style={{ width: W, height: H, background: PAL.bg, color: PAL.text, fontFamily: sans, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', flexDirection: 'column', padding: '40px 56px 16px', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: mono, fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase', color: PAL.faded }}>
              <span style={{ color: PAL.accent, fontWeight: 700 }}>Source of Truths</span>
              <span>{`${list.category} · Top ${Math.min(items.length, 10)}`}</span>
            </div>
            <div style={{ display: 'flex', fontFamily: sans, fontWeight: 900, fontSize: fitTitle(list.title, 52), lineHeight: 0.9, letterSpacing: '-0.03em', marginTop: 14, color: PAL.text, maxWidth: '96%' }}>
              {list.title}
            </div>
            <div style={{ display: 'flex', marginTop: 6, fontFamily: mono, fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: PAL.faded }}>{modeLabel}</div>
          </div>
          <div style={{ display: 'flex', flexGrow: 2.6, flexShrink: 0, flexBasis: 0, gap: 10, padding: '4px 56px 0' }}>
            {photoCard(t3[0], t3Heroes[0], 1, true)}
            <div style={{ display: 'flex', flexGrow: 1, flexBasis: 0, flexDirection: 'column', gap: 10 }}>
              {t3[1] !== undefined ? photoCard(t3[1], t3Heroes[1], 2, false) : null}
              {t3[2] !== undefined ? photoCard(t3[2], t3Heroes[2], 3, false) : null}
            </div>
          </div>
          <div style={{ display: 'flex', flexGrow: 2.1, flexShrink: 0, flexBasis: 0, flexDirection: 'column', padding: '12px 56px 0' }}>
            {rest.map((item, i) => (
              <div key={String(i)} style={{ display: 'flex', flexGrow: 1, flexBasis: 0, alignItems: 'center', gap: 20, borderTop: '1px solid rgba(26,26,26,0.16)' }}>
                <span style={{ fontFamily: mono, fontWeight: 500, fontSize: 24, color: PAL.faded, minWidth: 50, flexShrink: 0 }}>{String(i + 4).padStart(2, '0')}</span>
                <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 24, color: PAL.text, lineHeight: 1.02, flexGrow: 1, letterSpacing: '-0.02em', wordBreak: 'break-word' }}>{item}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexShrink: 0, padding: '10px 56px 24px', justifyContent: 'space-between', fontFamily: mono, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: PAL.faded }}>
            <span style={{ maxWidth: 560, overflow: 'hidden', marginRight: 28 }}>{sourcesLine}</span>
            <span>{`sourceoftruths.com/list/${list.id}`}</span>
          </div>
        </div>
      ),
      { width: W, height: H, fonts }
    );
  } catch (e) {
    // Synchronous ImageResponse construction failed — fall back to a no-photos
    // text-only render so the route never returns the 0-byte response that
    // hangs IG /media POSTs.
    return renderFallback(list, items, sans, mono, fonts);
  }
}
