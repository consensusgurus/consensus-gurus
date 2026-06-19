import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { correctAnswersOf } from '@/lib/quiz-scoring';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Midnight "today" in US Eastern (handles EST/EDT) as a UTC epoch ms. Eastern
// midnight is 05:00Z under EST and 04:00Z under EDT; pick whichever candidate
// instant actually renders as 00:00 on today's Eastern date.
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

// GET /api/quiz/today -> { leaders:[{username,correct}], correctToday, playsToday }
// Everything completed since midnight US Eastern. correctToday / playsToday count
// ALL games (anonymous included); leaders ranks signed-up players by total
// correct answers, top 10.
export async function GET() {
  try {
    const cutoffIso = new Date(startOfEasternTodayUTC()).toISOString();
    const { data, error } = await supabaseAdmin
      .from('quiz_results')
      .select('quiz_id, user_id, username, score, created_at, total')
      .gte('created_at', cutoffIso)
      .order('created_at', { ascending: false })
      .limit(50000);
    if (error) {
      console.error('quiz today error', error);
      return NextResponse.json({ leaders: [], correctToday: 0, perfectToday: 0, playsToday: 0 });
    }
    const rows = data || [];
    let correctToday = 0;
    let perfectToday = 0;
    const byUser = new Map();
    for (const r of rows) {
      const sc = correctAnswersOf(r);
      correctToday += sc;
      if (r.total > 0 && (Number(r.score) || 0) === Number(r.total)) perfectToday += 1;
      if (r.user_id) {
        const cur = byUser.get(r.user_id) || { username: r.username || 'Player', correct: 0, quizzes: 0 };
        cur.correct += sc;
        cur.quizzes += 1;
        if ((!cur.username || cur.username === 'Player') && r.username) cur.username = r.username;
        byUser.set(r.user_id, cur);
      }
    }
    const vals = [...byUser.values()];
    const leaders = vals
      .filter((u) => u.correct > 0)
      .sort((a, b) => b.correct - a.correct || String(a.username).localeCompare(String(b.username)))
      .map((u) => ({ username: u.username, correct: u.correct }))
      .slice(0, 10);
    const quizLeaders = vals
      .filter((u) => u.quizzes > 0)
      .sort((a, b) => b.quizzes - a.quizzes || b.correct - a.correct || String(a.username).localeCompare(String(b.username)))
      .map((u) => ({ username: u.username, quizzes: u.quizzes }))
      .slice(0, 10);
    return NextResponse.json({ leaders, quizLeaders, correctToday, perfectToday, playsToday: rows.length });
  } catch (e) {
    return NextResponse.json({ leaders: [], correctToday: 0, perfectToday: 0, playsToday: 0 });
  }
}
