import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { fetchAllRows } from '@/lib/fetch-all';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

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

export async function GET() {
  try {
    const { data, error } = await fetchAllRows(supabaseAdmin, 'quiz_results', 'quiz_id, created_at', ['quiz_id']);
    if (error) {
      console.error('quiz totals error', error);
      return NextResponse.json({ total: 0, byQuiz: {}, recent7: {}, recent12h: {}, trendingByQuiz: {}, trendingWindowH: 0 });
    }
    const rows = data || [];
    const byQuiz = {};
    const recent7 = {};
    const recent12h = {};
    const now = Date.now();
    const cutoff7 = now - 7 * 24 * 60 * 60 * 1000;
    const cutoff12h = now - 12 * 60 * 60 * 1000;
    const startToday = new Date(); startToday.setUTCHours(0, 0, 0, 0); const cutoffToday = startToday.getTime();
    let today = 0;
    const bucketMs = TREND_BUCKET_H * 60 * 60 * 1000;
    // Per quiz, plays bucketed by how many 3h steps back they fall (0 = newest).
    const buckets = new Map();
    for (const r of rows) {
      byQuiz[r.quiz_id] = (byQuiz[r.quiz_id] || 0) + 1;
      if (r.created_at) {
        const t = new Date(r.created_at).getTime();
        if (t >= cutoff7) recent7[r.quiz_id] = (recent7[r.quiz_id] || 0) + 1;
        if (t >= cutoff12h) recent12h[r.quiz_id] = (recent12h[r.quiz_id] || 0) + 1;
        if (t >= cutoffToday) today += 1;
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
    return NextResponse.json({ total: rows.length, today, byQuiz, recent7, recent12h, trendingByQuiz, trendingWindowH });
  } catch (e) {
    return NextResponse.json({ total: 0, byQuiz: {}, recent7: {}, recent12h: {}, trendingByQuiz: {}, trendingWindowH: 0 });
  }
}
