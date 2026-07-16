'use client';

// "Still on the table today" — the cross-promo strip every daily game shows
// on its result card. Reads each game's same-device day breadcrumb
// (sot_<game>_day, written by that game's client for TODAY'S puzzle only)
// and lists the dailies the player hasn't finished yet. Adding a game to the
// registry here adds it to every other game's end screen.

import React, { useState, useEffect } from 'react';

const SANS = "'Manrope', system-ui, -apple-system, sans-serif";

export const DAILY_GAMES = [
  { key: 'crux', href: '/crux', name: 'Crux', tag: 'a clueless crossword', store: 'sot_crux_day', accent: '#2563eb', bg: '#eef4ff', border: 'rgba(37,99,235,0.35)' },
  { key: 'garble', href: '/garble', name: 'Garble', tag: 'five garbled words, one clued finale', store: 'sot_garble_day', accent: '#8a6d1a', bg: '#fdf6e3', border: 'rgba(230,185,63,0.6)' },
  { key: 'links', href: '/links', name: 'Links', tag: 'sixteen words, four hidden threads', store: 'sot_links_day', accent: '#166534', bg: '#eefaf1', border: 'rgba(90,169,106,0.5)' },
  { key: 'span', href: '/span', name: 'Span', tag: 'cross the map, border by border', store: 'sot_span_day', accent: '#9d174d', bg: '#fdf0f6', border: 'rgba(217,99,153,0.45)' },
  { key: 'dating', href: '/dating', name: 'Dating', tag: 'put five moments in order', store: 'sot_dating_day', accent: '#6d28d9', bg: '#f5f0ff', border: 'rgba(124,58,237,0.4)' },
  { key: 'tally', href: '/tally', name: 'Tally', tag: 'balance every row and column', store: 'sot_tally_day', accent: '#15803d', bg: '#eefaf1', border: 'rgba(21,128,61,0.45)' },
  { key: 'suds', href: '/suds', name: 'Suds', tag: 'the daily 9×9 sudoku', store: 'sot_suds_day', accent: '#ea580c', bg: '#fff5ed', border: 'rgba(234,88,12,0.4)' },
  { key: 'carve', href: '/carve', name: 'Carve', tag: 'carve the grid into equal sums', store: 'sot_carve_day', accent: '#7c3aed', bg: '#f5f0ff', border: 'rgba(124,58,237,0.4)' },
  { key: 'circa', href: '/circa', name: 'Circa', tag: 'pin the year of the moment', store: 'sot_circa_day', accent: '#0e7490', bg: '#e8f7fa', border: 'rgba(14,116,144,0.4)' },
  { key: 'extra', href: '/extra', name: 'Extra', tag: 'unredact the front page', store: 'sot_extra_day', accent: '#b91c1c', bg: '#fdeeee', border: 'rgba(185,28,28,0.4)' },
];

function etToday() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

export default function DailyGamesPromo({ self, refresh }) {
  const [open, setOpen] = useState([]);
  // Games the signed-in player already finished TODAY on ANY device (from the
  // server), so a game done on their phone drops off this list here too. Null
  // until the fetch resolves; localStorage still gates the first paint.
  const [serverDoneToday, setServerDoneToday] = useState(null);
  const [dailyMe, setDailyMe] = useState(null);

  useEffect(() => {
    let anonId = null, email = null;
    try { anonId = localStorage.getItem('sot_quiz_anon'); } catch (e) {}
    try { const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null'); email = id && id.email; } catch (e) {}
    const qs = new URLSearchParams();
    if (anonId) qs.set('anonId', anonId);
    if (email) qs.set('email', email);
    let alive = true;
    fetch('/api/quiz/daily-status?' + qs.toString())
      .then((r) => r.json())
      .then((d) => {
        if (!alive || !d) return;
        const [Y, M, D] = etToday().split('-').map(Number);
        const yy = Y % 100; // today's quizId per game is `<key>-<M>-<D>-<YY>`
        const playedSet = new Set(d.played || []);
        const done = new Set();
        for (const g of DAILY_GAMES) { if (playedSet.has(`${g.key}-${M}-${D}-${yy}`)) done.add(g.key); }
        setServerDoneToday(done);
      })
      .catch(() => {});
    fetch('/api/quiz/daily-combined?' + qs.toString())
      .then((r) => r.json())
      .then((d) => { if (alive && d && d.me) setDailyMe({ ...d.me, maxTotal: d.maxTotal }); })
      .catch(() => {});
    return () => { alive = false; };
  }, [refresh]);

  useEffect(() => {
    const today = etToday();
    const pending = DAILY_GAMES.filter((g) => {
      if (g.key === self) return false;
      if (serverDoneToday && serverDoneToday.has(g.key)) return false;
      try {
        const c = JSON.parse(localStorage.getItem(g.store) || 'null');
        return !(c && c.d === today && c.done);
      } catch (e) { return true; }
    });
    setOpen(pending);
  }, [self, refresh, serverDoneToday]);
  if (!open.length) return null;
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: '#6b7280', marginBottom: 7 }}>
        Still on the table today
      </div>
      {dailyMe && dailyMe.total != null ? (
        <div style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: '#37506e', marginBottom: 9, lineHeight: 1.4 }}>
          You&rsquo;re <b style={{ color: '#1c1e24' }}>#{dailyMe.rank}</b> on today&rsquo;s daily board &middot; <b style={{ color: '#1c1e24' }}>{dailyMe.total}/{dailyMe.maxTotal}</b>. Finish {open.length} more to climb.
        </div>
      ) : null}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {open.map((g) => (
          <a key={g.key} href={g.href}
            style={{ display: 'block', padding: '9px 13px', borderRadius: 10, background: g.bg, border: `1.5px solid ${g.border}`, textDecoration: 'none', fontFamily: SANS, fontSize: 13, fontWeight: 700, color: '#1c1e24' }}>
            <b style={{ color: g.accent }}>{g.name}</b> &mdash; {g.tag} &rarr;
          </a>
        ))}
      </div>
    </div>
  );
}
