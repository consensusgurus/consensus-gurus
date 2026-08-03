'use client';

// Shared "your day" figures: IQ Points earned today, today's move on the global
// IQ board, and how many of today's dailies are finished.
//
// It lives here rather than inside DailyStrip because on 2026-08-03 the owner
// moved the Your-day stats OUT of the daily board's cap and INTO the quizzes
// home command header, where each figure pairs with its lifetime counterpart
// (rank change beside rank, IQ gained beside total IQ, games played beside
// completed). Two components now want the same numbers, so the fetch is
// memoized for the page load: whoever asks second reuses the first request's
// promise instead of hitting /api/quiz/daily-status twice.

import { useEffect, useState } from 'react';
import { DAILY_KEYS } from '@/lib/daily-games';

// Retired games keep scoring their archived days, so they stay in DAILY_KEYS,
// but they are not on today's board and must never inflate the "x of N today"
// denominator. This is the same roster the daily board renders.
const RETIRED = new Set(['circa']);
export const DAY_ROSTER = DAILY_KEYS.filter((k) => !RETIRED.has(k));

export function etToday() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

let pending = null;
export function fetchDayStatus() {
  if (pending) return pending;
  let anonId = null, email = null;
  try { anonId = localStorage.getItem('sot_quiz_anon'); } catch (e) {}
  try { const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null'); email = id && id.email; } catch (e) {}
  const qs = new URLSearchParams();
  if (anonId) qs.set('anonId', anonId);
  if (email) qs.set('email', email);
  // No identity at all: there is nothing for the server to look up, so resolve
  // null rather than firing a request that can only come back empty.
  pending = qs.toString()
    ? fetch('/api/quiz/daily-status?' + qs.toString()).then((r) => r.json()).catch(() => null)
    : Promise.resolve(null);
  return pending;
}

// Same-device breadcrumbs, so the count is right on first paint and still right
// for a signed-out player the server knows nothing about. Mirrors DailyStrip's
// own first-paint pass over sot_<key>_day.
function localDone(today) {
  const out = new Set();
  for (const k of DAY_ROSTER) {
    try {
      const c = JSON.parse(localStorage.getItem(`sot_${k}_day`) || 'null');
      if (c && c.d === today && c.done) out.add(k);
    } catch (e) {}
  }
  return out;
}

export default function useDayStats() {
  const [s, setS] = useState({ todayXp: null, rankChange: null, done: 0, total: DAY_ROSTER.length, ready: false });
  useEffect(() => {
    let alive = true;
    const today = etToday();
    const [Y, M, D] = today.split('-').map(Number);
    const yy = Y % 100;
    const done = localDone(today);
    if (done.size) setS((p) => ({ ...p, done: done.size }));
    fetchDayStatus().then((data) => {
      if (!alive) return;
      if (!data) { setS((p) => ({ ...p, ready: true })); return; }
      const completed = new Set(data.completed || []);
      const played = new Set(data.played || []);
      for (const k of DAY_ROSTER) {
        const id = `${k}-${M}-${D}-${yy}`;
        if (completed.has(id) || played.has(id)) done.add(k);
      }
      setS({
        todayXp: typeof data.todayXp === 'number' ? data.todayXp : null,
        rankChange: typeof data.rankChange === 'number' ? data.rankChange : null,
        done: done.size,
        total: DAY_ROSTER.length,
        ready: true,
      });
    });
    return () => { alive = false; };
  }, []);
  return s;
}
