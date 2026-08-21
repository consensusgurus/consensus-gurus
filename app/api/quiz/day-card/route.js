import { ImageResponse } from 'next/og';
import { supabaseAdmin } from '@/lib/supabase-server';
import { loadQuizResults } from '@/lib/quiz-results-load';
import { findQuizIdentity } from '@/lib/quiz-identity';
import { rankPlayers } from '@/lib/quiz-xp';
import { computeXpCached } from '@/lib/quiz-derived-cache';
import { dailyGameName } from '@/lib/daily-games';
import { SHARE_HOST } from '@/lib/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Downloadable "my day" share card (1080x1080 PNG). One brain meter filled by
// how much of today's slate the player has cleared, the day's IQ Points gain as
// the hero number, and four stat tiles down the right.
// GET /api/quiz/day-card?anonId=&email=[&date=M-D-YY]
//
// Data comes from the same two places the daily end card already reads, so this
// adds no new queries and no new tables:
//   IQ + global rank -> computeXp/rankPlayers over quiz_results (as /api/quiz/iq-standing)
//   the day's slate  -> /api/quiz/daily-combined on this same deployment
// The brain is two flat PNGs in /public/day-card (pale + solid). The fill is the
// solid one inside an overflow-hidden box anchored to the bottom, because Satori
// does not honor SVG masks the way a browser does. Do not "simplify" this back
// into an inline <svg mask>: it renders as a full brain at every score.

const SZ = 1080;
const PAL = {
  bg: '#ffffff', text: '#0b0d12', navy: '#233a63', slate: '#646c7a',
  soft: '#6b7280', cell: '#f1f3f6', line: 'rgba(20,22,28,0.10)',
  blue: '#2563eb', green: '#15803d', gold: '#b7791f', goldBg: '#fdf6e4',
};
const BRAIN_W = 430;
const BRAIN_H = 387; // matches the 640x576 source art

const ET = 'America/New_York';
function etToday() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: ET }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}
function etDate(ts) {
  try { return new Date(ts).toLocaleDateString('en-CA', { timeZone: ET }); }
  catch (e) { return String(ts || '').slice(0, 10); }
}
// "7-30-26" -> "Thu Jul 30". Returns '' if the suffix is malformed.
function prettyDay(suffix) {
  const m = /^(\d{1,2})-(\d{1,2})-(\d{2})$/.exec(String(suffix || ''));
  if (!m) return '';
  const d = new Date(Date.UTC(2000 + Number(m[3]), Number(m[1]) - 1, Number(m[2]), 12));
  try {
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
  } catch (e) { return suffix; }
}

async function loadBin(url) {
  try { const r = await fetch(url); if (r.ok) return await r.arrayBuffer(); } catch (e) { /* */ }
  return null;
}
function dataUri(buf) {
  return buf ? `data:image/png;base64,${Buffer.from(buf).toString('base64')}` : null;
}

function textImage(msg, fonts, sans) {
  return new ImageResponse(
    (
      <div style={{ width: SZ, height: SZ, background: PAL.bg, color: PAL.text, fontFamily: sans, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80, textAlign: 'center' }}>
        <div style={{ display: 'flex', fontSize: 40, fontWeight: 800 }}>{msg}</div>
      </div>
    ),
    { width: SZ, height: SZ, fonts }
  );
}

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const anonId = (searchParams.get('anonId') || '').trim() || null;
  const email = (searchParams.get('email') || '').trim() || null;
  const date = (searchParams.get('date') || '').trim() || null;

  const [f800, f600, f500, bEmpty, bBlue, bGreen] = await Promise.all([
    loadBin('https://cdn.jsdelivr.net/npm/@fontsource/manrope@5/files/manrope-latin-800-normal.woff'),
    loadBin('https://cdn.jsdelivr.net/npm/@fontsource/manrope@5/files/manrope-latin-600-normal.woff'),
    loadBin('https://cdn.jsdelivr.net/npm/@fontsource/manrope@5/files/manrope-latin-500-normal.woff'),
    loadBin(`${origin}/day-card/brain-empty.png`),
    loadBin(`${origin}/day-card/brain-blue.png`),
    loadBin(`${origin}/day-card/brain-green.png`),
  ]);
  const fonts = [];
  if (f800) fonts.push({ name: 'Manrope', data: f800, weight: 800, style: 'normal' });
  if (f600) fonts.push({ name: 'Manrope', data: f600, weight: 600, style: 'normal' });
  if (f500) fonts.push({ name: 'Manrope', data: f500, weight: 500, style: 'normal' });
  const sans = f800 ? 'Manrope' : 'sans-serif';
  const imgEmpty = dataUri(bEmpty);
  const imgBlue = dataUri(bBlue);
  const imgGreen = dataUri(bGreen);

  // --- the day's slate: games played, combined rank, best finish -------------
  let daily = null;
  try {
    const qs = new URLSearchParams();
    if (anonId) qs.set('anonId', anonId);
    if (email) qs.set('email', email);
    if (date) qs.set('date', date);
    const r = await fetch(`${origin}/api/quiz/daily-combined?${qs.toString()}`, { cache: 'no-store' });
    if (r.ok) daily = await r.json();
  } catch (e) { daily = null; }

  const dMe = (daily && (daily.me || daily.meProvisional)) || null;
  const perGame = (dMe && dMe.perGame) || {};
  const gameCount = (daily && daily.gameCount) || 0;
  const gamesPlayed = dMe ? (typeof dMe.gamesPlayed === 'number' ? dMe.gamesPlayed : Object.keys(perGame).length) : 0;
  const dailyRank = dMe ? dMe.rank : null;
  const dailyField = daily ? (daily.uniquePlayers ?? daily.overallField ?? 0) : 0;

  let bestKey = null, bestRank = null;
  for (const k of Object.keys(perGame)) {
    const g = perGame[k];
    if (!g || g.abandoned || !g.rank) continue;
    if (bestRank == null || g.rank < bestRank) { bestRank = g.rank; bestKey = k; }
  }

  // --- IQ Points banked today, and the global standing ----------------------
  let iqToday = null, iqRank = null, iqTotal = null;
  try {
    let myKey = null;
    const ident = await findQuizIdentity(supabaseAdmin, { email, anonId });
    if (ident && ident.id) myKey = `u:${ident.id}`;
    else if (anonId) myKey = `a:${anonId}`;
    if (myKey) {
      const { data, error } = await loadQuizResults(supabaseAdmin);
      if (!error) {
        const { players } = computeXpCached(data || [], { recentN: 200 });
        const me = players.get(myKey);
        if (me) {
          const day = etToday();
          const recent = Array.isArray(me.recent) ? me.recent : [];
          iqToday = Math.round(recent
            .filter((r) => r.createdAt && etDate(r.createdAt) === day)
            .reduce((s, r) => s + (Number(r.xp) || 0), 0));
          const ranked = rankPlayers(players, 'all');
          const idx = ranked.findIndex((p) => p.key === myKey);
          if (idx >= 0) { iqRank = idx + 1; iqTotal = ranked.length; }
        }
      }
    }
  } catch (e) { /* the card still renders without the IQ figures */ }

  if (!gamesPlayed && !iqToday) return textImage('No games played yet today', fonts, sans);

  const full = gameCount > 0 && gamesPlayed >= gameCount;
  const frac = gameCount > 0 ? Math.max(0, Math.min(1, gamesPlayed / gameCount)) : 0;
  const fillH = Math.round(BRAIN_H * frac);
  const fillImg = full ? imgGreen : imgBlue;
  const hero = full ? PAL.green : PAL.blue;
  const dayLabel = prettyDay((daily && daily.date) || date || '');

  const tile = (label, value, sub, accent) => (
    <div style={{ display: 'flex', flexDirection: 'column', background: accent ? PAL.goldBg : PAL.cell, borderRadius: 20, padding: '20px 24px 22px' }}>
      <div style={{ display: 'flex', fontWeight: 800, fontSize: 20, letterSpacing: '0.14em', textTransform: 'uppercase', color: accent ? PAL.gold : PAL.soft }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 8 }}>
        <span style={{ display: 'flex', fontWeight: 800, fontSize: 46, letterSpacing: '-0.02em' }}>{value}</span>
        {sub ? <span style={{ display: 'flex', fontWeight: 600, fontSize: 22, color: PAL.slate, marginLeft: 12 }}>{sub}</span> : null}
      </div>
    </div>
  );

  try {
    return new ImageResponse(
      (
        <div style={{ width: SZ, height: SZ, background: PAL.bg, color: PAL.text, fontFamily: sans, display: 'flex', flexDirection: 'column', padding: '54px 60px 44px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ display: 'flex', fontWeight: 800, fontSize: 30, letterSpacing: '0.14em', textTransform: 'uppercase', color: PAL.navy }}>Mind Loft</span>
            <span style={{ display: 'flex', fontWeight: 600, fontSize: 24, color: PAL.slate }}>{dayLabel ? `Daily slate · ${dayLabel}` : 'Daily slate'}</span>
          </div>

          <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', marginTop: 26 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 460 }}>
              {imgEmpty ? (
                <div style={{ display: 'flex', position: 'relative', width: BRAIN_W, height: BRAIN_H }}>
                  <img src={imgEmpty} width={BRAIN_W} height={BRAIN_H} alt="" />
                  {fillH > 0 && fillImg ? (
                    <div style={{ display: 'flex', position: 'absolute', left: 0, bottom: 0, width: BRAIN_W, height: fillH, overflow: 'hidden', alignItems: 'flex-end' }}>
                      <img src={fillImg} width={BRAIN_W} height={BRAIN_H} alt="" />
                    </div>
                  ) : null}
                </div>
              ) : (
                <div style={{ display: 'flex', width: BRAIN_W, height: BRAIN_H, background: PAL.cell, borderRadius: 30, alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', width: BRAIN_W, height: fillH, background: hero, borderRadius: 30 }} />
                </div>
              )}
              <span style={{ display: 'flex', fontWeight: 800, fontSize: 118, letterSpacing: '-0.03em', lineHeight: 1, color: hero, marginTop: 18 }}>
                {`+${Number(iqToday || 0).toLocaleString()}`}
              </span>
              <span style={{ display: 'flex', fontWeight: 800, fontSize: 22, letterSpacing: '0.16em', textTransform: 'uppercase', color: PAL.slate, marginTop: 12 }}>IQ points today</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, marginLeft: 34 }}>
              {tile('Games played', String(gamesPlayed), gameCount ? `of ${gameCount} today` : '', false)}
              <div style={{ display: 'flex', height: 14 }} />
              {tile('Daily rank', dailyRank ? `#${Number(dailyRank).toLocaleString()}` : '—', dailyField ? `of ${Number(dailyField).toLocaleString()} players` : '', false)}
              <div style={{ display: 'flex', height: 14 }} />
              {tile('Best finish', bestRank ? `#${bestRank}` : '—', bestKey ? `in ${dailyGameName(bestKey)}` : '', false)}
              <div style={{ display: 'flex', height: 14 }} />
              {tile('Global IQ', iqRank ? `#${Number(iqRank).toLocaleString()}` : '—', iqTotal ? `of ${Number(iqTotal).toLocaleString()}` : '', true)}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${PAL.line}`, paddingTop: 26, marginTop: 10 }}>
            <span style={{ display: 'flex', fontWeight: 800, fontSize: 28, color: PAL.navy }}>{SHARE_HOST}</span>
            <span style={{ display: 'flex', fontWeight: 800, fontSize: 24, color: '#ffffff', background: hero, borderRadius: 12, padding: '12px 22px' }}>Beat my score</span>
          </div>
        </div>
      ),
      { width: SZ, height: SZ, fonts, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
    );
  } catch (e) {
    return textImage('Mind Loft', fonts, sans);
  }
}
