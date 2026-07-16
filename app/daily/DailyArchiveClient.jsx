'use client';

// Client for /daily. Renders the daily-games hub + per-game archive, and reads
// each game's per-puzzle localStorage save to mark which dates you've played
// (green check) and which you've aced (gold star) — mirroring the site's
// Played/Completed legend. Self-contained styling (its own <style>) so it
// matches the daily pages' ink-and-paper look without depending on any game CSS.

import React, { useState, useEffect } from 'react';
import DailyCombinedLeaderboard from '../quiz/[id]/DailyCombinedLeaderboard';

const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const INK = '#1c1e24';
const FADED = '#6b7280';
const BG = '#f7f8fa';
const GREEN = '#10b981';
const GOLD = '#e8b43a';
// Sunday-edition marker: a warm amber that reads as "special day" and stays
// distinct from the gold completed-star and each card's own accent.
const SUN = '#b45309';
const SUN_BG = '#fff7ed';

// Every localStorage key a game might have written for one puzzle. Crux keys a
// mid-day revision as _r<rev>, and a player may have finished EITHER the bare
// key (pre-revision) or the revised one — so we check both. The rest are just
// sot_<game>_<num>.
function keysFor(gameKey, num, rev) {
  if (gameKey === 'crux') {
    const ks = [`sot_crux_${num}`];
    if (rev) ks.push(`sot_crux_${num}_r${rev}`);
    return ks;
  }
  return [`sot_${gameKey}_${num}`];
}

function shortDate(dateLabel) {
  return (dateLabel || '').replace(/,\s*\d{4}$/, '');
}

export default function DailyArchiveClient({ games = [] }) {
  // played = you've opened/attempted it (any save exists); completed = you aced
  // it (status 'won'). Filled after mount — localStorage is client-only, so SSR
  // renders the neutral state and hydration matches.
  const [played, setPlayed] = useState(() => new Set());
  const [completed, setCompleted] = useState(() => new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    const pl = new Set();
    const cp = new Set();
    const byQuiz = {}; // quizId -> "gameKey:num", to fold server rows back in
    for (const g of games) {
      for (const p of g.puzzles) {
        if (p.quizId) byQuiz[p.quizId] = `${g.key}:${p.num}`;
        let hasSave = false, won = false;
        for (const k of keysFor(g.key, p.num, p.rev)) {
          let raw = null;
          try { raw = localStorage.getItem(k); } catch (e) {}
          if (!raw) continue;
          hasSave = true;
          try { if ((JSON.parse(raw) || {}).status === 'won') won = true; } catch (e) {}
        }
        if (hasSave) pl.add(`${g.key}:${p.num}`);
        if (won) cp.add(`${g.key}:${p.num}`);
      }
    }
    setPlayed(new Set(pl));
    setCompleted(new Set(cp));
    setReady(true);

    // localStorage only knows THIS browser. The server has every completed play
    // by identity, so a signed-in player's marks follow them across devices —
    // merge those in once fetched (union, never removing a local mark).
    let anonId = null, email = null;
    try { anonId = localStorage.getItem('sot_quiz_anon'); } catch (e) {}
    try { const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null'); email = id && id.email; } catch (e) {}
    const qs = new URLSearchParams();
    if (anonId) qs.set('anonId', anonId);
    if (email) qs.set('email', email);
    fetch('/api/quiz/daily-status?' + qs.toString())
      .then((r) => r.json())
      .then((d) => {
        if (!alive || !d) return;
        const p2 = new Set(pl), c2 = new Set(cp);
        for (const qid of (d.played || [])) { const k = byQuiz[qid]; if (k) p2.add(k); }
        for (const qid of (d.completed || [])) { const k = byQuiz[qid]; if (k) c2.add(k); }
        setPlayed(p2);
        setCompleted(c2);
      })
      .catch(() => {});
    return () => { alive = false; };
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
        .dl-tick{font-size:12px;font-weight:900;line-height:1;}
        .dl-today-tag{font-family:${MONO};font-size:9px;letter-spacing:.1em;text-transform:uppercase;font-weight:700;border-radius:4px;padding:1px 5px;}
        .dl-sun-tag{font-family:${MONO};font-size:9px;letter-spacing:.1em;text-transform:uppercase;font-weight:700;border-radius:4px;padding:1px 5px;color:${SUN};background:${SUN_BG};border:1px solid rgba(180,83,9,0.4);}
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
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 11, fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: FADED }}>
          <span><span style={{ color: GREEN, fontWeight: 900 }}>&#10003;</span> Played</span>
          <span><span style={{ color: GOLD, fontWeight: 900 }}>&#9733;</span> Completed</span>
          <span><span className="dl-sun-tag" style={{ marginRight: 5 }}>Sun</span> Sunday edition &mdash; bigger &amp; tougher</span>
        </div>

        <div style={{ marginTop: 20 }}>
          <DailyCombinedLeaderboard compact todayKey={null} />
        </div>

        {games.map((g) => {
          const playedCount = g.puzzles.reduce((n, p) => n + (played.has(`${g.key}:${p.num}`) ? 1 : 0), 0);
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
                  const isPlayed = played.has(`${g.key}:${p.num}`);
                  const isDone = completed.has(`${g.key}:${p.num}`);
                  const href = isToday ? g.path : `${g.path}?p=${p.num}`;
                  return (
                    <a
                      key={p.num}
                      href={href}
                      className="dl-chip"
                      style={
                        isToday
                          ? { background: g.bg, borderColor: g.accent, color: g.accent, fontWeight: 800 }
                          : isPlayed
                            ? { borderColor: g.accent }
                            : undefined
                      }
                      aria-label={`${g.name} — ${shortDate(p.dateLabel)}${isToday ? ' (today)' : ''}${p.sunday ? ', Sunday edition' : ''}${isDone ? ', completed' : isPlayed ? ', played' : ''}`}
                    >
                      {isToday && (
                        <span className="dl-today-tag" style={{ background: g.accent, color: '#fff' }}>Today</span>
                      )}
                      {p.sunday && (
                        <span className="dl-sun-tag" title="Sunday edition — bigger &amp; tougher">Sun</span>
                      )}
                      <span>{shortDate(p.dateLabel)}</span>
                      {ready && isDone && <span className="dl-tick" style={{ color: GOLD }} aria-hidden="true">&#9733;</span>}
                      {ready && !isDone && isPlayed && <span className="dl-tick" style={{ color: GREEN }} aria-hidden="true">&#10003;</span>}
                    </a>
                  );
                })}
              </div>
            </section>
          );
        })}

        <p style={{ marginTop: 26, fontSize: 12.5, fontWeight: 600, color: FADED }}>
          Played &amp; completed marks are saved on this device only. <a href="/quizzes" style={{ color: INK, fontWeight: 800, textDecoration: 'underline' }}>Back to all quizzes &rarr;</a>
        </p>
      </div>
    </div>
  );
}
