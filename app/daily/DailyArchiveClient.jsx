'use client';

// Client for /daily. Renders the daily-games hub + per-game archive, and reads
// each game's per-puzzle localStorage save to mark which dates you've already
// played. Self-contained styling (its own <style>) so it matches the daily
// pages' ink-and-paper look without depending on any one game's CSS.

import React, { useState, useEffect } from 'react';

const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const INK = '#1c1e24';
const FADED = '#6b7280';
const BG = '#f7f8fa';

// Same per-puzzle key scheme each game client writes. Crux keys a mid-day
// revision with _r<rev>; the rest are bare sot_<game>_<num>.
function storeKey(gameKey, num, rev) {
  if (gameKey === 'crux') return `sot_crux_${num}${rev ? `_r${rev}` : ''}`;
  return `sot_${gameKey}_${num}`;
}

function shortDate(dateLabel) {
  return (dateLabel || '').replace(/,\s*\d{4}$/, '');
}

export default function DailyArchiveClient({ games = [] }) {
  // done/started sets keyed "gameKey:num", filled after mount (localStorage is
  // client-only, so SSR renders the neutral state and hydration matches).
  const [done, setDone] = useState(() => new Set());
  const [started, setStarted] = useState(() => new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const d = new Set();
    const s = new Set();
    for (const g of games) {
      for (const p of g.puzzles) {
        try {
          const raw = localStorage.getItem(storeKey(g.key, p.num, p.rev));
          if (!raw) continue;
          const obj = JSON.parse(raw);
          const status = obj && obj.status;
          if (status && status !== 'playing') d.add(`${g.key}:${p.num}`);
          else s.add(`${g.key}:${p.num}`);
        } catch (e) {}
      }
    }
    setDone(d);
    setStarted(s);
    setReady(true);
  }, [games]);

  return (
    <div style={{ minHeight: '100vh', background: BG }}>
      <style>{`
        .dl-wrap{max-width:760px;margin:0 auto;padding:20px 22px 90px;font-family:${SANS};}
        .dl-nav a{font-family:${MONO};font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:${FADED};text-decoration:none;border-bottom:1px solid rgba(28,30,36,0.25);padding-bottom:1px;}
        .dl-nav a:hover{color:${INK};border-color:${INK};}
        .dl-card{border:2px solid ${INK};border-radius:14px;background:#fff;box-shadow:4px 4px 0 rgba(28,30,36,0.13);padding:16px 17px 17px;margin-top:16px;}
        .dl-play{display:inline-flex;align-items:center;gap:6px;font-family:${SANS};font-weight:800;font-size:13px;color:#fff;border-radius:8px;padding:8px 13px;text-decoration:none;white-space:nowrap;}
        .dl-play:hover{filter:brightness(1.08);}
        .dl-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:13px;}
        .dl-chip{display:inline-flex;align-items:center;gap:6px;font-family:${SANS};font-weight:700;font-size:12.5px;text-decoration:none;border-radius:9px;padding:7px 11px;border:1.5px solid rgba(28,30,36,0.2);color:${INK};background:#fff;}
        .dl-chip:hover{border-color:${INK};}
        .dl-tick{font-size:11px;font-weight:900;}
        .dl-today-tag{font-family:${MONO};font-size:9px;letter-spacing:.1em;text-transform:uppercase;font-weight:700;border-radius:4px;padding:1px 5px;}
      `}</style>

      <div className="dl-wrap">
        <div className="dl-nav" style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
          <a href="/quizzes">Quizzes</a>
          <a href="/">Top 10 Lists</a>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0, fontFamily: SANS, fontSize: 30, fontWeight: 800, letterSpacing: '-0.5px', color: INK }}>
            Daily Games
          </h1>
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: FADED }}>
            {games.length} games · new every day
          </span>
        </div>
        <p style={{ margin: '8px 0 0', fontSize: 14.5, fontWeight: 600, color: FADED, lineHeight: 1.5, maxWidth: 560 }}>
          Today&rsquo;s puzzle and the full archive for each game. Jump into today, or replay any past
          drop &mdash; archive runs never touch your streak.
        </p>

        {games.map((g) => {
          const playedCount = g.puzzles.reduce((n, p) => n + (done.has(`${g.key}:${p.num}`) ? 1 : 0), 0);
          return (
            <section key={g.key} className="dl-card" style={{ borderColor: g.accent }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                  <a href={g.path} style={{ textDecoration: 'none' }}>
                    <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.3px', color: g.accent, lineHeight: 1.1 }}>
                      {g.name}
                    </div>
                  </a>
                  <div style={{ fontSize: 13, fontWeight: 600, color: FADED, marginTop: 2 }}>{g.tag}</div>
                  {ready && playedCount > 0 && (
                    <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: g.accent, marginTop: 6, fontWeight: 700 }}>
                      {playedCount} of {g.puzzles.length} played
                    </div>
                  )}
                </div>
                <a href={g.path} className="dl-play" style={{ background: g.accent }}>Play today &rarr;</a>
              </div>

              <div className="dl-chips">
                {g.puzzles.map((p, i) => {
                  const isToday = i === 0;
                  const isDone = done.has(`${g.key}:${p.num}`);
                  const inProgress = !isDone && started.has(`${g.key}:${p.num}`);
                  const href = isToday ? g.path : `${g.path}?p=${p.num}`;
                  return (
                    <a
                      key={p.num}
                      href={href}
                      className="dl-chip"
                      style={
                        isToday
                          ? { background: g.bg, borderColor: g.accent, color: g.accent, fontWeight: 800 }
                          : isDone
                            ? { borderColor: g.accent }
                            : undefined
                      }
                      aria-label={`${g.name} — ${shortDate(p.dateLabel)}${isToday ? ' (today)' : ''}${isDone ? ', played' : ''}`}
                    >
                      {isToday && (
                        <span className="dl-today-tag" style={{ background: g.accent, color: '#fff' }}>Today</span>
                      )}
                      <span>{shortDate(p.dateLabel)}</span>
                      {ready && isDone && <span className="dl-tick" style={{ color: g.accent }}>&#10003;</span>}
                      {ready && inProgress && <span className="dl-tick" style={{ color: FADED }} aria-label="in progress">&bull;</span>}
                    </a>
                  );
                })}
              </div>
            </section>
          );
        })}

        <p style={{ marginTop: 26, fontSize: 12.5, fontWeight: 600, color: FADED }}>
          Played state lives on this device only. <a href="/quizzes" style={{ color: INK, fontWeight: 800, textDecoration: 'underline' }}>Back to all quizzes &rarr;</a>
        </p>
      </div>
    </div>
  );
}
