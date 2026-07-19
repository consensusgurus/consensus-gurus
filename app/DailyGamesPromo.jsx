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
  { key: 'emcee', href: '/emcee', name: 'Emcee', tag: 'the daily mini crossword', store: 'sot_emcee_day', accent: '#c026d3', bg: '#fbeefc', border: 'rgba(192,38,211,0.4)' },
  { key: 'garble', href: '/garble', name: 'Garble', tag: 'five garbled words, one clued finale', store: 'sot_garble_day', accent: '#8a6d1a', bg: '#fdf6e3', border: 'rgba(230,185,63,0.6)' },
  { key: 'links', href: '/links', name: 'Links', tag: 'sixteen words, four hidden threads', store: 'sot_links_day', accent: '#166534', bg: '#eefaf1', border: 'rgba(90,169,106,0.5)' },
  { key: 'span', href: '/span', name: 'Span', tag: 'cross the map, border by border', store: 'sot_span_day', accent: '#9d174d', bg: '#fdf0f6', border: 'rgba(217,99,153,0.45)' },
  { key: 'dating', href: '/dating', name: 'Dating', tag: 'put five moments in order', store: 'sot_dating_day', accent: '#6d28d9', bg: '#f5f0ff', border: 'rgba(124,58,237,0.4)' },
  { key: 'tally', href: '/tally', name: 'Tally', tag: 'balance every row and column', store: 'sot_tally_day', accent: '#15803d', bg: '#eefaf1', border: 'rgba(21,128,61,0.45)' },
  { key: 'suds', href: '/suds', name: 'Suds', tag: 'the daily 9×9 sudoku', store: 'sot_suds_day', accent: '#ea580c', bg: '#fff5ed', border: 'rgba(234,88,12,0.4)' },
  { key: 'carve', href: '/carve', name: 'Carve', tag: 'carve the grid into equal sums', store: 'sot_carve_day', accent: '#7c3aed', bg: '#f5f0ff', border: 'rgba(124,58,237,0.4)' },
  { key: 'circa', href: '/circa', name: 'Circa', tag: 'pin the year of the moment', store: 'sot_circa_day', accent: '#0e7490', bg: '#e8f7fa', border: 'rgba(14,116,144,0.4)' },
  { key: 'extra', href: '/extra', name: 'Extra', tag: 'unredact the front page', store: 'sot_extra_day', accent: '#b91c1c', bg: '#fdeeee', border: 'rgba(185,28,28,0.4)' },
  { key: 'stet', href: '/stet', name: 'Stet', tag: 'spot the error, fix the copy', store: 'sot_stet_day', accent: '#0369a1', bg: '#e8f3fa', border: 'rgba(3,105,161,0.4)' },
  { key: 'outwit', href: '/outwit', name: 'Outwit', tag: 'five duels against the crowd', store: 'sot_outwit_day', accent: '#1f2937', bg: '#eef1f5', border: 'rgba(31,41,55,0.35)' },
  { key: 'tuck', href: '/tuck', name: 'Tuck', tag: 'build your own crossword', store: 'sot_tuck_day', accent: '#92400e', bg: '#f5e9dc', border: 'rgba(146,64,14,0.35)' },
  { key: 'alibi', href: '/alibi', name: 'Alibi', tag: 'the nightly whodunit', store: 'sot_alibi_day', accent: '#8b1e2d', bg: '#f6e3e5', border: 'rgba(139,30,45,0.35)' },
  { key: 'cipher', href: '/cipher', name: 'Cipher', tag: 'crack the letter math', store: 'sot_cipher_day', accent: '#0f766e', bg: '#d9f0ee', border: 'rgba(15,118,110,0.35)' },
  { key: 'ping', href: '/ping', name: 'Ping', tag: 'find the secret city', store: 'sot_ping_day', accent: '#0284c7', bg: '#e0f2fe', border: 'rgba(2,132,199,0.35)' },
  { key: 'warmer', href: '/warmer', name: 'Warmer', tag: 'hotter or colder', store: 'sot_warmer_day', accent: '#dc2626', bg: '#fef2f2', border: 'rgba(220,38,38,0.35)' },
  { key: 'jester', href: '/jester', name: 'Jesters', tag: 'seat the court', store: 'sot_jester_day', accent: '#7c3aed', bg: '#f3e8ff', border: 'rgba(124,58,237,0.35)' },
  { key: 'sworn', href: '/sworn', name: 'Sworn', tag: 'spot the liars', store: 'sot_sworn_day', accent: '#be185d', bg: '#fce7f3', border: 'rgba(190,24,93,0.35)' },
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
