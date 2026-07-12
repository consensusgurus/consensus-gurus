import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { loadQuizResultsCached } from '@/lib/quiz-results-cache';
import { correctAnswersOf } from '@/lib/quiz-scoring';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
// 60s -> 300s (egress fix 2026-07-12): identical for every visitor, so let the
// CDN hold it longer; the counters tolerate five minutes of staleness.
const CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' };

// GET /api/quiz/totals -> { total, byQuiz, recent7, recent12h, trendingByQuiz, trendingWindowH }
// Aggregate play counts across every quiz (all completed games, signed-up or
// not), for the /quizzes index counter and the Popular / Trending sorts.
//
// `trendingByQuiz` powers the upper "Trending Now" board only (NOT the tiled
// grid's Trending sort, which stays on the 7-day `recent7` basis). It uses a
// dynamic, self-widening window: start at the last 3 hours and, if fewer than
// 3 distinct quizzes have plays, widen by 3 hours at a time (6h, 9h, ...) until
// at least 3 quizzes qualify or the 7-day cap is reached. `trendingWindowH` is
// the chosen window size in hours, so the UI can note how far back it reached.
const TREND_BUCKET_H = 3;            // widen the window in 3-hour steps
const TREND_MAX_BUCKETS = 56;        // cap at 56 * 3h = 7 days
const TREND_MIN_QUIZZES = 3;         // widen until at least this many quizzes have plays

// Midnight "today" in US Eastern (handles EST/EDT) as a UTC epoch ms, matching
// /api/quiz/today so the index's two "today" counters roll over together
// (previously this route used UTC midnight, which reset hours earlier).
function startOfEasternTodayUTC() {
  const tz = 'America/New_York';
  const now = new Date();
  const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  for (const offH of [4, 5]) {
    const guess = Date.parse(`${ymd}T00:00:00.000Z`) + offH * 3600 * 1000;
    const p = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hour12: false })
      .formatToParts(new Date(guess))
      .reduce((a, x) => { a[x.type] = x.value; return a; }, {});
    if (`${p.year}-${p.month}-${p.day}` === ymd && p.hour === '00') return guess;
  }
  return Date.parse(`${ymd}T04:00:00.000Z`);
}

export async function GET() {
  try {
    // Shared in-process cache (egress fix 2026-07-12); the single pass below
    // is order-independent, so id order instead of quiz_id order is fine.
    const { data, error } = await loadQuizResultsCached(supabaseAdmin);
    if (error) {
      console.error('quiz totals error', error);
      return NextResponse.json({ total: 0, byQuiz: {}, recent7: {}, recent12h: {}, trendingByQuiz: {}, trendingWindowH: 0, leaders: {} });
    }
    const rows = data || [];
    const byQuiz = {};
    // Best registered (signed-up) entry per quiz: highest score, then fastest
    // time, then name. Powers the "Current Leader" line on each index tile.
    const bestLeader = {};
    // Best entry per (quiz, username), so the homepage quiz tiles can show the
    // top 3 DISTINCT players per quiz (gold/silver/bronze). Keyed
    // quiz_id -> Map(username -> { score, time }).
    const byUserPerQuiz = {};
    const recent7 = {};
    const recent12h = {};
    const now = Date.now();
    const cutoff7 = now - 7 * 24 * 60 * 60 * 1000;
    const cutoff12h = now - 12 * 60 * 60 * 1000;
    const cutoffToday = startOfEasternTodayUTC();
    let today = 0;
    let totalTime = 0;
    let todayTime = 0;
    let totalCorrect = 0;
    let totalPerfect = 0;
    const bucketMs = TREND_BUCKET_H * 60 * 60 * 1000;
    // Per quiz, plays bucketed by how many 3h steps back they fall (0 = newest).
    const buckets = new Map();
    for (const r of rows) {
      byQuiz[r.quiz_id] = (byQuiz[r.quiz_id] || 0) + 1;
      if (r.user_id && r.username) {
        const sc = Number(r.score) || 0;
        const tm = Number.isFinite(Number(r.time_elapsed)) ? Number(r.time_elapsed) : Infinity;
        const cur = bestLeader[r.quiz_id];
        if (!cur || sc > cur.score || (sc === cur.score && tm < cur.time) || (sc === cur.score && tm === cur.time && r.username.localeCompare(cur.name) < 0)) {
          bestLeader[r.quiz_id] = { score: sc, time: tm, name: r.username, userId: r.user_id };
        }
        let um = byUserPerQuiz[r.quiz_id];
        if (!um) { um = new Map(); byUserPerQuiz[r.quiz_id] = um; }
        const prevU = um.get(r.username);
        if (!prevU || sc > prevU.score || (sc === prevU.score && tm < prevU.time)) {
          um.set(r.username, { score: sc, time: tm });
        }
      }
      totalCorrect += correctAnswersOf(r);
      const te = Number(r.time_elapsed);
      if (Number.isFinite(te) && te > 0) totalTime += te;
      if (r.total > 0 && Number(r.score) === Number(r.total)) totalPerfect += 1;
      if (r.created_at) {
        const t = new Date(r.created_at).getTime();
        if (t >= cutoff7) recent7[r.quiz_id] = (recent7[r.quiz_id] || 0) + 1;
        if (t >= cutoff12h) recent12h[r.quiz_id] = (recent12h[r.quiz_id] || 0) + 1;
        if (t >= cutoffToday) { today += 1; if (Number.isFinite(te) && te > 0) todayTime += te; }
        const idx = Math.floor((now - t) / bucketMs);
        if (idx >= 0 && idx < TREND_MAX_BUCKETS) {
          let arr = buckets.get(r.quiz_id);
          if (!arr) { arr = new Array(TREND_MAX_BUCKETS).fill(0); buckets.set(r.quiz_id, arr); }
          arr[idx] += 1;
        }
      }
    }
    // Widen the window 3h at a time until >= 3 quizzes have any plays in it.
    const cum = {};
    let trendingWindowH = TREND_MAX_BUCKETS * TREND_BUCKET_H;
    for (let k = 0; k < TREND_MAX_BUCKETS; k++) {
      for (const [qid, arr] of buckets) { if (arr[k]) cum[qid] = (cum[qid] || 0) + arr[k]; }
      if (Object.keys(cum).length >= TREND_MIN_QUIZZES) { trendingWindowH = (k + 1) * TREND_BUCKET_H; break; }
    }
    const trendingByQuiz = { ...cum };
    const leaders = {};
    const leaderKeys = {};
    for (const qid of Object.keys(bestLeader)) { leaders[qid] = bestLeader[qid].name; if (bestLeader[qid].userId) leaderKeys[qid] = `u:${bestLeader[qid].userId}`; }
    // Top 3 distinct players per quiz (gold/silver/bronze): best score, then
    // fastest time, then name. Used by the homepage quiz tiles.
    const topLeaders = {};
    for (const qid of Object.keys(byUserPerQuiz)) {
      topLeaders[qid] = [...byUserPerQuiz[qid].entries()]
        .sort((a, b) => b[1].score - a[1].score || a[1].time - b[1].time || a[0].localeCompare(b[0]))
        .slice(0, 3)
        .map(([name]) => name);
    }
    return NextResponse.json({ total: rows.length, today, totalCorrect, totalPerfect, totalTime, todayTime, byQuiz, recent7, recent12h, trendingByQuiz, trendingWindowH, leaders, leaderKeys, topLeaders }, { headers: CACHE_HEADERS });
  } catch (e) {
    return NextResponse.json({ total: 0, byQuiz: {}, recent7: {}, recent12h: {}, trendingByQuiz: {}, trendingWindowH: 0, leaders: {} });
  }
}
