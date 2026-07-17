import { ImageResponse } from 'next/og';
import { supabaseAdmin } from '@/lib/supabase-server';
import { loadQuizResults } from '@/lib/quiz-results-load';
import { computeXp } from '@/lib/quiz-xp';
import { buildProfile } from '@/lib/quiz-profile';
import { DEPT_LABEL } from '@/lib/quiz-departments';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Downloadable Share Stats player card (1080x1080 PNG). Mirrors the in-page
// ShareStatsModal in app/quizzes/hub/StatHubClient.jsx: overall rank, level +
// tier + XP, completed/correct/accuracy with ranks, and the top-3
// categories by XP. GET /api/quiz/share-card?key=u:123|a:<anon>
const SZ = 1080;
const PAL = { bg: '#ffffff', text: '#1c1e24', accent: '#0e1d40', faded: '#6b7280', soft: '#9aa0ab', line: 'rgba(20,22,28,0.10)', cell: '#f1f3f6', accsoft: '#e8effb' };

async function loadFont(url) {
  try { const r = await fetch(url); if (r.ok) return await r.arrayBuffer(); } catch (e) { /* */ }
  return null;
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
  const { searchParams } = new URL(request.url);
  const key = (searchParams.get('key') || '').trim();

  const [f800, f600, f500] = await Promise.all([
    loadFont('https://cdn.jsdelivr.net/npm/@fontsource/manrope@5/files/manrope-latin-800-normal.woff'),
    loadFont('https://cdn.jsdelivr.net/npm/@fontsource/manrope@5/files/manrope-latin-600-normal.woff'),
    loadFont('https://cdn.jsdelivr.net/npm/@fontsource/manrope@5/files/manrope-latin-500-normal.woff'),
  ]);
  const fonts = [];
  if (f800) fonts.push({ name: 'Manrope', data: f800, weight: 800, style: 'normal' });
  if (f600) fonts.push({ name: 'Manrope', data: f600, weight: 600, style: 'normal' });
  if (f500) fonts.push({ name: 'Manrope', data: f500, weight: 500, style: 'normal' });
  const sans = f800 ? 'Manrope' : 'sans-serif';

  let profile = null;
  try {
    const { data, error } = await loadQuizResults(supabaseAdmin);
    if (!error) { const { players } = computeXp(data || []); profile = buildProfile(players, key || null); }
  } catch (e) { profile = null; }

  if (!profile || !profile.found) return textImage('No stats to share yet', fonts, sans);

  const a = profile.activity || {};
  const r = profile.ranks || {};
  const cats3 = Object.entries(profile.byCategory || {})
    .filter(([, v]) => (v.matches || 0) > 0)
    .sort((x, y) => (y[1].xp || 0) - (x[1].xp || 0))
    .slice(0, 3);
  const maxR = cats3.length ? Math.max(...cats3.map(([, v]) => v.xp || 0), 1) : 1;
  const catLabel = (k) => DEPT_LABEL[k] || k;

  const lbl = (extra) => ({ display: 'flex', fontFamily: sans, fontWeight: 700, fontSize: 22, letterSpacing: '0.08em', textTransform: 'uppercase', color: PAL.faded, ...(extra || {}) });
  const chip = { display: 'flex', background: PAL.accsoft, color: PAL.accent, fontWeight: 700, fontSize: 22, padding: '3px 12px', borderRadius: 9, marginLeft: 12 };
  const cell = (label, value, rk) => (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, flexBasis: 0, background: PAL.cell, borderRadius: 20, padding: '24px 24px 26px' }}>
      <div style={lbl()}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', marginTop: 12 }}>
        <span style={{ display: 'flex', fontFamily: sans, fontWeight: 800, fontSize: 50 }}>{value}</span>
        {rk ? <span style={chip}>{`#${rk}`}</span> : null}
      </div>
    </div>
  );

  try {
    return new ImageResponse(
      (
        <div style={{ width: SZ, height: SZ, background: PAL.bg, color: PAL.text, fontFamily: sans, display: 'flex', flexDirection: 'column', padding: '60px 60px 50px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', fontWeight: 800, fontSize: 30, color: PAL.accent }}>Source of Truths</span>
            <span style={{ display: 'flex', fontWeight: 700, fontSize: 22, letterSpacing: '0.16em', textTransform: 'uppercase', color: PAL.faded }}>Player Card</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 64 }}>
            <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 620 }}>
              <span style={{ display: 'flex', fontWeight: 800, fontSize: 76, letterSpacing: '-0.03em', lineHeight: 1 }}>{profile.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 22 }}>
                <span style={{ display: 'flex', background: profile.tierBg || PAL.cell, color: profile.tierFg || PAL.faded, fontWeight: 700, fontSize: 26, padding: '5px 16px', borderRadius: 10 }}>{(profile.tier || '').replace(/ Tier$/, '')}</span>
                <span style={{ display: 'flex', fontWeight: 600, fontSize: 26, color: PAL.faded, marginLeft: 16 }}>{`Level ${profile.level || 1} · ${Number(profile.xp || 0).toLocaleString()} XP`}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={lbl()}>Overall Rank</span>
              <span style={{ display: 'flex', fontWeight: 800, fontSize: 130, color: PAL.accent, lineHeight: 0.9, marginTop: 6 }}>{profile.rank ? `#${profile.rank}` : '—'}</span>
              <span style={{ display: 'flex', fontWeight: 600, fontSize: 26, color: PAL.faded, marginTop: 8 }}>{profile.totalPlayers ? `of ${profile.totalPlayers.toLocaleString()} players` : ''}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 18, marginTop: 56 }}>
            {cell('Completed', a.completed != null ? String(a.completed) : '—', r.completed)}
            {cell('Correct', a.correct != null ? Number(a.correct).toLocaleString() : '—', r.correct)}
            {cell('Accuracy', a.accuracy != null ? `${a.accuracy}%` : '—', r.accuracy)}
          </div>

          {cats3.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 50 }}>
              <span style={lbl()}>Top Categories</span>
              <div style={{ display: 'flex', flexDirection: 'column', marginTop: 22 }}>
                {cats3.map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', flexDirection: 'column', marginBottom: 22 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
                      <span style={{ display: 'flex', fontWeight: 700, fontSize: 28 }}>{catLabel(k)}</span>
                      <span style={{ display: 'flex', fontWeight: 700, fontSize: 26, color: PAL.faded }}>{`${Number(v.xp || 0).toLocaleString()} XP`}</span>
                    </div>
                    <div style={{ display: 'flex', height: 16, background: PAL.cell, borderRadius: 10 }}>
                      <div style={{ display: 'flex', width: `${Math.round(((v.xp || 0) / maxR) * 100)}%`, height: '100%', background: PAL.accent, borderRadius: 10 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div style={{ display: 'flex', flexGrow: 1 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${PAL.line}`, paddingTop: 26 }}>
            <span style={{ display: 'flex', fontWeight: 700, fontSize: 24, color: PAL.faded }}>sourceoftruths.com/quizzes</span>
            <span style={{ display: 'flex', fontWeight: 600, fontSize: 24, color: PAL.soft }}>Can you out-rank me?</span>
          </div>
        </div>
      ),
      // CDN-cache the rendered card per player key so repeat shares and
      // crawler fetches stop re-reading quiz_results (egress fix 2026-07-12).
      { width: SZ, height: SZ, fonts, headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200' } }
    );
  } catch (e) {
    return textImage('Source of Truths', fonts, sans);
  }
}
