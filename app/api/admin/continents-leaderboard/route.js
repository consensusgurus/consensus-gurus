import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { fetchAllRows } from '@/lib/fetch-all';
import { isAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Read-only data feed for the "Continents Challenge" snapshot leaderboard.
// GET /api/admin/continents-leaderboard?token=ADMIN_TASK_TOKEN[&since=ISO]
//
// Auth: an "x-admin-token" header OR a ?token= query param matching the
// ADMIN_TASK_TOKEN env var (query param so a browser GET can read it).
// Read-only; mutates nothing.
//
// Returns, for each REGISTERED player (user_id not null) who completed any of
// the 12 flag / no-outline quizzes since `since` (default = Mon Jun 15 2026
// 11:40 ET = 15:40 UTC), their BEST attempt per quiz (highest score, tie
// broken by fastest time), plus total correct and total time across the 12.
// Sorted by total correct desc, then total time asc.

const CONTINENTS = [
  { key: 'north-america', label: 'North America', flags: 'flags-of-north-america', outline: 'north-america-no-outline' },
  { key: 'south-america', label: 'South America', flags: 'flags-of-south-america', outline: 'south-america-no-outline' },
  { key: 'europe',        label: 'Europe',        flags: 'flags-of-europe',        outline: 'europe-no-outline' },
  { key: 'africa',        label: 'Africa',        flags: 'flags-of-africa',        outline: 'africa-no-outline' },
  { key: 'asia',          label: 'Asia',          flags: 'flags-of-asia',          outline: 'asia-no-outline' },
  { key: 'oceania',       label: 'Oceania',       flags: 'flags-of-oceania',       outline: 'oceania-no-outline' },
];
const QUIZ_IDS = CONTINENTS.flatMap((c) => [c.flags, c.outline]);
const DEFAULT_SINCE = '2026-06-15T15:40:00.000Z';

function tokenOk(request, searchParams) {
  const expected = process.env.ADMIN_TASK_TOKEN;
  if (!expected) return false;
  const headerTok = request.headers.get('x-admin-token');
  const queryTok = searchParams.get('token');
  return headerTok === expected || queryTok === expected;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  if (!isAdmin() && !tokenOk(request, searchParams)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const sinceParam = searchParams.get('since');
  const since = sinceParam && !Number.isNaN(Date.parse(sinceParam)) ? new Date(sinceParam).toISOString() : DEFAULT_SINCE;
  const sinceMs = Date.parse(since);

  try {
    const { data, error } = await fetchAllRows(
      supabaseAdmin,
      'quiz_results',
      'id, quiz_id, user_id, username, score, total, time_elapsed, created_at',
      ['id'],
      (q) => q.in('quiz_id', QUIZ_IDS).not('user_id', 'is', null),
    );
    if (error) {
      console.error('continents-leaderboard error', error);
      return NextResponse.json({ error: 'db error' }, { status: 500 });
    }

    const rows = (data || []).filter((r) => {
      const t = Date.parse(r.created_at);
      return Number.isFinite(t) && t >= sinceMs;
    });

    const best = new Map();
    const nameById = new Map();
    const nameRowId = new Map();
    for (const r of rows) {
      const uid = r.user_id;
      const sc = Number(r.score) || 0;
      const tm = Number.isFinite(Number(r.time_elapsed)) ? Number(r.time_elapsed) : Infinity;
      const k = `${uid}::${r.quiz_id}`;
      const cur = best.get(k);
      if (!cur || sc > cur.score || (sc === cur.score && tm < cur.time)) {
        best.set(k, { score: sc, time: tm });
      }
      const id = r.id || 0;
      if (id >= (nameRowId.get(uid) || -1)) { nameRowId.set(uid, id); nameById.set(uid, r.username || 'Player'); }
    }

    const byUser = new Map();
    for (const [k, v] of best) {
      const sep = k.indexOf('::');
      const uid = k.slice(0, sep);
      const quizId = k.slice(sep + 2);
      let u = byUser.get(uid);
      if (!u) { u = { userId: uid, username: nameById.get(uid) || 'Player', scores: {}, times: {}, totalCorrect: 0, totalTime: 0, quizzesPlayed: 0 }; byUser.set(uid, u); }
      u.scores[quizId] = v.score;
      u.times[quizId] = Number.isFinite(v.time) ? v.time : 0;
      u.totalCorrect += v.score;
      u.totalTime += Number.isFinite(v.time) ? v.time : 0;
      u.quizzesPlayed += 1;
    }

    const users = [...byUser.values()].sort(
      (a, b) => b.totalCorrect - a.totalCorrect || a.totalTime - b.totalTime || (a.username || '').localeCompare(b.username || ''),
    );

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      since,
      continents: CONTINENTS,
      quizIds: QUIZ_IDS,
      totalRegisteredPlayers: users.length,
      users,
    });
  } catch (e) {
    console.error('continents-leaderboard exception', e);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
