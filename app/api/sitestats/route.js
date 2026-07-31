import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { loadQuizResultsCached } from '@/lib/quiz-results-cache';
import { fetchAllRows } from '@/lib/fetch-all';
import { guestHandleFromAnon } from '@/lib/quiz-xp';
import { QUIZZES } from '@/lib/quizzes';
import { DAILY_KEYS } from '@/lib/daily-combined';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
// Identical for every visitor, so let Vercel's CDN absorb repeat hits instead
// of recomputing (and re-reading Supabase) per request — same egress posture as
// /api/quiz/stats and /api/quiz/totals.
const CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' };

const TZ = 'America/New_York';
const DAY = 24 * 60 * 60 * 1000;

// quiz_id -> display title. Regular quizzes resolve from QUIZZES; daily-game
// plays carry ids like `crux-7-18-26`, which fold to the game's proper name.
const QUIZ_TITLE = new Map((QUIZZES || []).map((q) => [q.id, q.navTitle || q.title || q.id]));
const HIDDEN = new Set((QUIZZES || []).filter((q) => q && (q.unlisted || q.mobilePreview)).map((q) => q.id));
const DAILY_NAME = Object.fromEntries(DAILY_KEYS.map((k) => [k, k.charAt(0).toUpperCase() + k.slice(1)]));
const DAILY_RE = new RegExp('^(' + DAILY_KEYS.join('|') + ')-(\\d+)-(\\d+)-(\\d+)$');

function titleOf(id) {
  if (!id) return 'Unknown';
  if (QUIZ_TITLE.has(id)) return QUIZ_TITLE.get(id);
  const m = id.match(DAILY_RE);
  if (m) return DAILY_NAME[m[1]] || id;
  return id;
}

const playerKey = (r) => (r.user_id ? `u:${r.user_id}` : (r.anon_id ? `a:${r.anon_id}` : `r:${r.id}`));

// US-Eastern date + hour parts for a Date, so buckets roll over on the same
// clock the rest of the site uses.
const ET_FMT = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
});
function etParts(d) {
  const p = {};
  for (const x of ET_FMT.formatToParts(d)) p[x.type] = x.value;
  return p;
}

// Midnight "today" in US Eastern as a UTC epoch ms (handles EST/EDT), matching
// /api/quiz/today so this page's "today" rolls over with the rest of the site.
function startOfEasternTodayUTC() {
  const now = new Date();
  const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  for (const offH of [4, 5]) {
    const guess = Date.parse(`${ymd}T00:00:00.000Z`) + offH * 3600 * 1000;
    const p = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hour12: false })
      .formatToParts(new Date(guess))
      .reduce((a, x) => { a[x.type] = x.value; return a; }, {});
    if (`${p.year}-${p.month}-${p.day}` === ymd && p.hour === '00') return guess;
  }
  return Date.parse(`${ymd}T04:00:00.000Z`);
}

// Distinct players + play count + total seconds played for quiz_results rows
// in [start, end).
function aggPlays(rows, start, end) {
  const s = new Set();
  let plays = 0;
  let time = 0;
  for (const r of rows) {
    const t = r.created_at ? new Date(r.created_at).getTime() : 0;
    if (t >= start && t < end) {
      plays += 1;
      s.add(playerKey(r));
      const te = Number(r.time_elapsed);
      if (Number.isFinite(te) && te > 0) time += te;
    }
  }
  return { people: s.size, plays, time };
}

// Percent change vs a prior period. null == no baseline to compare against
// (prev was 0 but current is not), which the UI renders as "NEW".
function pct(cur, prev) {
  if (prev > 0) return Math.round(((cur - prev) / prev) * 100);
  if (cur > 0) return null;
  return 0;
}
const cell = (cur, prev) => ({ now: cur, prev, pct: pct(cur, prev) });

function isMissingFn(err) {
  if (!err) return false;
  return err.code === 'PGRST202' || err.code === '42883' || /function|schema cache|does not exist/i.test(err.message || '');
}

// Fallback when migration 36 has not been applied yet: pull the minimal
// (visitor_id, created_at) columns for the trailing window and aggregate in JS.
// Bounded to 40 days so the 30-60d "previous month" baseline is unavailable
// (its % change shows "—" until the SQL function exists). Heavy relative to the
// RPC but rare — the whole route is CDN-cached for 5 minutes.
async function viewersFallback(now, startToday) {
  const sinceIso = new Date(now - 40 * DAY).toISOString();
  const [ve, qve] = await Promise.all([
    fetchAllRows(supabaseAdmin, 'view_events', 'visitor_id,created_at', ['id'], (q) => q.gte('created_at', sinceIso)),
    fetchAllRows(supabaseAdmin, 'quiz_view_events', 'visitor_id,created_at', ['id'], (q) => q.gte('created_at', sinceIso)),
  ]);
  const rows = [...(ve.data || []), ...(qve.data || [])];

  const uniq = (start, end) => {
    const s = new Set();
    let views = 0;
    for (const r of rows) {
      const t = r.created_at ? new Date(r.created_at).getTime() : 0;
      if (t >= start && t < end) { views += 1; if (r.visitor_id) s.add(r.visitor_id); }
    }
    return { people: s.size, views };
  };
  const d = uniq(now - DAY, now + 1), dp = uniq(now - 2 * DAY, now - DAY);
  const w = uniq(now - 7 * DAY, now + 1), wp = uniq(now - 14 * DAY, now - 7 * DAY);
  const m = uniq(now - 30 * DAY, now + 1); // 30-60d prev is outside the 40d window

  const hourly = Array.from({ length: 24 }, () => ({ set: new Set(), views: 0 }));
  for (const r of rows) {
    const t = r.created_at ? new Date(r.created_at).getTime() : 0;
    if (t < startToday) continue;
    const h = Number(etParts(new Date(r.created_at)).hour) % 24;
    hourly[h].views += 1;
    if (r.visitor_id) hourly[h].set.add(r.visitor_id);
  }

  return {
    viewers: {
      unique: {
        d: cell(d.people, dp.people),
        w: cell(w.people, wp.people),
        m: { now: m.people, prev: null, pct: null },
      },
      views: {
        d: cell(d.views, dp.views),
        w: cell(w.views, wp.views),
        m: { now: m.views, prev: null, pct: null },
      },
    },
    hourly: hourly.map((x) => ({ viewers: x.set.size, views: x.views })),
    source: 'fallback',
  };
}

// GET /api/sitestats  -> the whole /sitestats payload (public, aggregate only).
export async function GET() {
  const now = Date.now();
  const startToday = startOfEasternTodayUTC();
  const nowP = etParts(new Date(now));
  const todayET = `${nowP.year}-${nowP.month}-${nowP.day}`;

  // ---- Quiz players / plays (from the shared in-process cache) ----
  let players = null;
  let topToday = [];
  let lastPlayed = [];
  let hourlyPlayers = Array.from({ length: 24 }, () => ({ people: 0, plays: 0 }));
  try {
    const { data, error } = await loadQuizResultsCached(supabaseAdmin);
    const rows = error ? [] : (data || []);

    const pD = aggPlays(rows, now - DAY, now + 1), pDp = aggPlays(rows, now - 2 * DAY, now - DAY);
    const pW = aggPlays(rows, now - 7 * DAY, now + 1), pWp = aggPlays(rows, now - 14 * DAY, now - 7 * DAY);
    const pM = aggPlays(rows, now - 30 * DAY, now + 1), pMp = aggPlays(rows, now - 60 * DAY, now - 30 * DAY);
    players = {
      unique: { d: cell(pD.people, pDp.people), w: cell(pW.people, pWp.people), m: cell(pM.people, pMp.people) },
      plays: { d: cell(pD.plays, pDp.plays), w: cell(pW.plays, pWp.plays), m: cell(pM.plays, pMp.plays) },
      time: { d: cell(pD.time, pDp.time), w: cell(pW.time, pWp.time), m: cell(pM.time, pMp.time) },
    };

    // Today's plays only, for the top-5 board and the hourly-players buckets.
    const todayRows = rows.filter((r) => r.created_at && new Date(r.created_at).getTime() >= startToday);
    const byQuizToday = new Map();
    for (const r of todayRows) {
      if (!r.quiz_id || HIDDEN.has(r.quiz_id)) continue;
      byQuizToday.set(r.quiz_id, (byQuizToday.get(r.quiz_id) || 0) + 1);
    }
    topToday = [...byQuizToday.entries()]
      .map(([id, plays]) => ({ quizId: id, title: titleOf(id), plays }))
      .sort((a, b) => b.plays - a.plays || a.title.localeCompare(b.title))
      .slice(0, 5);

    for (const r of todayRows) {
      if (!r.created_at) continue;
      const h = Number(etParts(new Date(r.created_at)).hour) % 24;
      hourlyPlayers[h].plays += 1;
    }
    // distinct players per hour
    const hourSets = Array.from({ length: 24 }, () => new Set());
    for (const r of todayRows) {
      if (!r.created_at) continue;
      const h = Number(etParts(new Date(r.created_at)).hour) % 24;
      hourSets[h].add(playerKey(r));
    }
    hourlyPlayers = hourlyPlayers.map((x, h) => ({ people: hourSets[h].size, plays: x.plays }));

    // Last 5 completed plays, newest first (rows arrive in id/chronological order).
    const visible = rows.filter((r) => r.quiz_id && !HIDDEN.has(r.quiz_id) && r.created_at);
    lastPlayed = visible.slice(-60)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
      .map((r) => ({
        quizId: r.quiz_id,
        title: titleOf(r.quiz_id),
        name: r.user_id ? (r.username || 'Player') : (r.username || guestHandleFromAnon(r.anon_id || `r:${r.id}`)),
        score: r.score,
        total: r.total,
        playedAt: r.created_at,
      }));
  } catch (e) {
    console.error('sitestats players error', e);
  }

  // ---- Site viewers (RPC first; JS fallback until migration 36 is applied) ----
  let viewers = null;
  let viewerSource = 'none';
  let hourlyViewers = Array.from({ length: 24 }, () => ({ viewers: 0, views: 0 }));
  try {
    const { data: t, error } = await supabaseAdmin.rpc('site_view_trends');
    if (!error && Array.isArray(t) && t.length) {
      const row = t[0];
      const N = (v) => Number(v) || 0;
      viewers = {
        unique: {
          d: cell(N(row.viewers_d), N(row.viewers_dp)),
          w: cell(N(row.viewers_w), N(row.viewers_wp)),
          m: cell(N(row.viewers_m), N(row.viewers_mp)),
        },
        views: {
          d: cell(N(row.views_d), N(row.views_dp)),
          w: cell(N(row.views_w), N(row.views_wp)),
          m: cell(N(row.views_m), N(row.views_mp)),
        },
      };
      viewerSource = 'rpc';
      const { data: hv, error: hvErr } = await supabaseAdmin.rpc('site_view_hourly_today', { p_tz: TZ });
      if (!hvErr && Array.isArray(hv)) {
        for (const r of hv) {
          const h = Number(r.hour);
          if (h >= 0 && h < 24) hourlyViewers[h] = { viewers: Number(r.viewers) || 0, views: Number(r.views) || 0 };
        }
      }
    } else if (isMissingFn(error)) {
      const fb = await viewersFallback(now, startToday);
      viewers = fb.viewers;
      hourlyViewers = fb.hourly;
      viewerSource = fb.source;
    } else if (error) {
      console.error('sitestats viewers rpc error', error);
    }
  } catch (e) {
    console.error('sitestats viewers error', e);
  }

  const hourly = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    players: hourlyPlayers[h].people,
    plays: hourlyPlayers[h].plays,
    viewers: hourlyViewers[h].viewers,
    views: hourlyViewers[h].views,
  }));

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    tz: TZ,
    today: todayET,
    players,
    viewers,
    viewerSource,
    topToday,
    lastPlayed,
    hourly,
  }, { headers: CACHE_HEADERS });
}
