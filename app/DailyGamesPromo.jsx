'use client';

// "Still on the table today" — the cross-promo strip every daily game shows
// on its result card. Reads each game's same-device day breadcrumb
// (sot_<game>_day, written by that game's client for TODAY'S puzzle only)
// and lists the dailies the player hasn't finished yet. Adding a game to the
// registry here adds it to every other game's end screen.

import React, { useState, useEffect } from 'react';

const SANS = "'Manrope', system-ui, -apple-system, sans-serif";

export const DAILY_GAMES = [
  { key: 'crux', href: '/crux', name: 'Crux', tag: 'a crossword with no clues', store: 'sot_crux_day', accent: '#2563eb', bg: '#eef4ff', border: 'rgba(37,99,235,0.35)' },
  { key: 'garble', href: '/garble', name: 'Garble', tag: 'five garbled words, one clued finale', store: 'sot_garble_day', accent: '#8a6d1a', bg: '#fdf6e3', border: 'rgba(230,185,63,0.6)' },
  { key: 'links', href: '/links', name: 'Links', tag: 'sixteen words, four hidden threads', store: 'sot_links_day', accent: '#166534', bg: '#eefaf1', border: 'rgba(90,169,106,0.5)' },
  { key: 'span', href: '/span', name: 'Span', tag: 'cross the map, border by border', store: 'sot_span_day', accent: '#9d174d', bg: '#fdf0f6', border: 'rgba(217,99,153,0.45)' },
];

function etToday() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

export default function DailyGamesPromo({ self, refresh }) {
  const [open, setOpen] = useState([]);
  useEffect(() => {
    const today = etToday();
    const pending = DAILY_GAMES.filter((g) => {
      if (g.key === self) return false;
      try {
        const c = JSON.parse(localStorage.getItem(g.store) || 'null');
        return !(c && c.d === today && c.done);
      } catch (e) { return true; }
    });
    setOpen(pending);
  }, [self, refresh]);
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
