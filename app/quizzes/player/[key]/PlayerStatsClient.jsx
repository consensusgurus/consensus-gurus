'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import SiteHeader from '../../../SiteHeader';
import Footer from '../../../Footer';
import { quizDept as deptOf } from '@/lib/quiz-departments';
import { QUIZZES } from '@/lib/quizzes';

const C = { bg: '#f7f8fa', surface: '#fff', ink: '#1c1e24', muted: '#6b7280', soft: '#9aa0ab', line: 'rgba(20,22,28,0.09)', accent: '#2563eb', accsoft: '#e8effb', live: '#10b981', danger: '#c0392b' };
const MEDAL = ['#e8b43a', '#b8bcc4', '#c8814b'];
const MEDAL_BG = ['#fbf2dc', '#eef0f2', '#f6e9df'];
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";
const DEPT_LABEL = { geography: 'Geography', sports: 'Sports', business: 'Business', movies: 'Movies', music: 'Music', history: 'History', 'science-nature': 'Science & Nature', travel: 'Travel', 'food-drink': 'Food & Drink', entertainment: 'Entertainment', gaming: 'Gaming', literature: 'Literature', misc: 'Miscellaneous' };
const DEPT_COLOR = { geography: '#1f8a4c', sports: '#2563eb', business: '#3a3f47', movies: '#c0392b', music: '#b5560f', history: '#7a3b2e', 'science-nature': '#1f8a4c', travel: '#0e8a8a', 'food-drink': '#b5560f', entertainment: '#c0392b', gaming: '#6b3fa0', literature: '#8a6d1f', misc: '#3a3f47' };

function RankChip({ rank, total }) {
  if (!rank) return null;
  const i = rank >= 1 && rank <= 3 ? rank - 1 : -1;
  const st = i >= 0 ? { color: MEDAL[i], background: MEDAL_BG[i] } : { color: C.accent, background: C.accsoft };
  return <span style={{ ...st, fontSize: 10, fontWeight: 700, borderRadius: 5, padding: '1px 6px', marginLeft: 6 }}>#{rank}{total ? ` of ${total.toLocaleString()}` : ''}</span>;
}

export default function PlayerStatsClient({ playerKey }) {
  const [me, setMe] = useState(null);
  useEffect(() => {
    if (!playerKey) { setMe({ found: false }); return; }
    fetch(`/api/quiz/player?key=${encodeURIComponent(playerKey)}`).then((r) => r.json()).then((d) => setMe(d || { found: false })).catch(() => setMe({ found: false }));
  }, [playerKey]);

  const cats = useMemo(() => {
    const counts = new Map();
    for (const q of (QUIZZES || [])) { if (!q || !q.id) continue; const d = deptOf(q); counts.set(d, (counts.get(d) || 0) + 1); }
    return [...counts.keys()].map((key) => ({ key, label: DEPT_LABEL[key] || 'Quiz', c: DEPT_COLOR[key] || '#3a3f47' }));
  }, []);

  const found = me && me.found;
  const a = found ? me.activity : {};
  const ranks = (found && me.ranks) || {};
  const byCat = (found && me.byCategory) || {};
  const totalPlayers = (found && me.totalPlayers) || 0;
  const catRows = cats.filter((c) => byCat[c.key]);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.ink, fontFamily: FONT }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        .pcard{background:#fff;border:1px solid ${C.line};border-radius:14px;}
        .ps table{width:100%;border-collapse:collapse;font-size:12.5px;}
        .ps th{text-align:left;font-size:10px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:${C.muted};padding:8px 10px;border-bottom:1px solid ${C.line};}
        .ps td{padding:8px 10px;border-bottom:1px solid rgba(20,22,28,0.06);}
        .ps .dot{width:9px;height:9px;border-radius:3px;display:inline-block;margin-right:8px;vertical-align:middle;}
      `}</style>
      <SiteHeader active="quizzes" />
      <div className="ps" style={{ maxWidth: 1080, margin: '0 auto', padding: '18px 24px 70px' }}>
        <Link href="/quizzes" style={{ fontSize: 13, color: C.muted, textDecoration: 'none' }}>{'←'} Back to Quizzes</Link>
        {!found ? (
          <div style={{ marginTop: 30, fontSize: 15, color: C.soft }}>{me ? 'No stats on record for this player yet.' : 'Loading…'}</div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, margin: '14px 0 4px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>{me.name}</h1>
              {me.isAnon ? <span style={{ fontSize: 12, color: C.soft, fontWeight: 600 }}>guest</span> : null}
            </div>
            <div className="pcard" style={{ display: 'flex', alignItems: 'center', gap: 26, flexWrap: 'wrap', padding: '16px 20px', margin: '12px 0 18px' }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: C.muted }}>Overall Rank</div>
                <div style={{ fontSize: 38, fontWeight: 800, color: C.accent, lineHeight: 1 }}>#{me.rank}</div>
                <div style={{ fontSize: 11, color: C.soft }}>of {totalPlayers.toLocaleString()} players</div>
              </div>
              {[['Skill Rating', (me.rating || 0).toLocaleString(), ranks.rating], ['Correct', (a.correct || 0).toLocaleString(), ranks.correct], ['Completed', a.completed || 0, ranks.completed], ['Accuracy', `${a.accuracy || 0}%`, ranks.accuracy], ['Days', a.daysPlayed || 0, ranks.daysPlayed]].map(([lbl, val, rk]) => (
                <div key={lbl}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: C.muted }}>{lbl}</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{val}<RankChip rank={rk} total={totalPlayers} /></div>
                </div>
              ))}
            </div>

            <div className="pcard" style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Stats by Category</div>
              <div style={{ overflow: 'auto' }}>
                <table>
                  <thead><tr>
                    <th>Category</th><th style={{ textAlign: 'right' }}>Correct</th><th style={{ textAlign: 'right' }}>Played</th>
                    <th style={{ textAlign: 'right' }}>Completed</th><th style={{ textAlign: 'right' }}>Accuracy</th><th style={{ textAlign: 'right' }}>Days</th><th style={{ textAlign: 'right' }}>Skill Rating</th>
                  </tr></thead>
                  <tbody>
                    {catRows.map((c) => {
                      const cr = byCat[c.key];
                      return (
                        <tr key={c.key}>
                          <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}><span className="dot" style={{ background: c.c }} />{c.label}</td>
                          <td style={{ textAlign: 'right' }}>{(cr.correct || 0).toLocaleString()}</td>
                          <td style={{ textAlign: 'right' }}>{cr.played != null ? cr.played : cr.matches}{cr.playedRank ? <RankChip rank={cr.playedRank} /> : null}</td>
                          <td style={{ textAlign: 'right' }}>{cr.completed || 0}</td>
                          <td style={{ textAlign: 'right' }}>{cr.accuracy || 0}%</td>
                          <td style={{ textAlign: 'right' }}>{cr.daysPlayed || 0}</td>
                          <td style={{ textAlign: 'right', color: C.accent, fontWeight: 700 }}>{(cr.rating || 0).toLocaleString()}{cr.rank ? <RankChip rank={cr.rank} total={cr.catTotal} /> : null}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
