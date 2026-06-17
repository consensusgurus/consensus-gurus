'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { COLORS } from '@/lib/data';
import { CHALLENGES, getChallenge, DEFAULT_CHALLENGE_ID, challengeColumns } from '@/lib/challenges';
import Grain from '../../Grain';
import Footer from '../../Footer';

const MEDAL = { 1: '#caa12e', 2: '#9c968a', 3: '#b1763f' };
const TINT = { 1: 'rgba(202,161,46,0.10)', 2: 'rgba(156,150,138,0.10)', 3: 'rgba(177,118,63,0.10)' };

function mmss(s) {
  const n = Math.max(0, Math.round(Number(s) || 0));
  return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`;
}

function fmtUpdated(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) + ' ET';
  } catch (e) { return ''; }
}

function TitleLine({ title, accent }) {
  if (!accent || !title.includes(accent)) {
    return <>{title}</>;
  }
  const i = title.indexOf(accent);
  return (
    <>
      {title.slice(0, i)}
      <span style={{ fontStyle: 'italic', fontWeight: 400, color: COLORS.ember }}>{accent}</span>
      {title.slice(i + accent.length)}
    </>
  );
}

export default function ChallengeLeaderboardClient() {
  const [chId, setChId] = useState(DEFAULT_CHALLENGE_ID);
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const ch = getChallenge(chId) || CHALLENGES[0];
  const cols = challengeColumns(ch);

  function load(showSpin) {
    if (showSpin) setRefreshing(true);
    fetch(`/api/quiz/challenge-leaderboard?id=${encodeURIComponent(ch.id)}`)
      .then((r) => r.json())
      .then((d) => { if (d && !d.error) setData(d); })
      .catch(() => {})
      .finally(() => { setLoaded(true); setRefreshing(false); });
  }

  useEffect(() => {
    setLoaded(false);
    setData(null);
    load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chId]);

  const users = (data && data.users) || [];

  return (
    <div style={{ minHeight: '100vh', background: COLORS.cream, color: COLORS.ink, position: 'relative', overflow: 'clip' }}>
      <Grain />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <header style={{ padding: '40px 24px 18px', maxWidth: 1400, margin: '0 auto' }}>
          <Link href="/quizzes" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, color: COLORS.faded, textDecoration: 'none', marginBottom: 22 }}>
            <ArrowLeft size={15} strokeWidth={2.5} /> All Quizzes
          </Link>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: COLORS.ember, marginBottom: 10 }}>Source of Truths · {ch.kicker}</div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 'clamp(34px, 7vw, 58px)', lineHeight: 0.96, letterSpacing: '-0.015em', margin: '0 0 14px', fontVariationSettings: '"SOFT" 100', color: COLORS.ink }}>
            <TitleLine title={ch.title} accent={ch.accent} />
          </h1>
          <p style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 17, lineHeight: 1.5, color: COLORS.faded, margin: 0, maxWidth: 760 }}>{ch.blurb}</p>

          {CHALLENGES.length > 1 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 20 }}>
              {CHALLENGES.map((c) => {
                const on = c.id === ch.id;
                return (
                  <button key={c.id} onClick={() => setChId(c.id)} style={{ padding: '8px 16px', background: on ? COLORS.ink : 'transparent', color: on ? COLORS.cream : COLORS.ink, border: `1.5px solid ${COLORS.ink}`, fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer' }}>{c.title.replace(/^The\s+/, '')}</button>
                );
              })}
            </div>
          )}

          <div className="clb-meta">
            <span><b>{data ? data.totalRegisteredPlayers : '—'}</b> registered players</span>
            <span>Window opens <b>{ch.sinceLabel}</b></span>
            {data && data.generatedAt ? <span>Updated <b>{fmtUpdated(data.generatedAt)}</b></span> : null}
            <span>Best attempt per quiz</span>
            <button className="clb-refresh" onClick={() => load(true)} disabled={refreshing}>
              <RefreshCw size={12} strokeWidth={2.4} style={{ animation: refreshing ? 'clbspin 0.8s linear infinite' : 'none' }} /> Refresh
            </button>
          </div>
          <div style={{ borderBottom: `1px solid ${COLORS.ink}`, marginTop: 16 }} />
          <div style={{ borderBottom: `2px solid ${COLORS.ember}` }} />
        </header>

        <section style={{ maxWidth: 1400, margin: '0 auto', padding: '22px 24px 64px' }}>
          {!loaded ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 18, color: COLORS.faded }}>Loading the standings…</div>
          ) : users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 18, color: COLORS.faded }}>No registered players have played yet. Sign up before a quiz to put your name in the running.</div>
          ) : (
            <div className="clb-scroll">
              <table className="clb-table">
                <thead>
                  <tr>
                    <th className="clb-corner" rowSpan={2}>Player</th>
                    {ch.groups.map((g) => (
                      <th key={g.key} className="clb-grp" colSpan={g.columns.length} style={{ '--ac': g.color }}>
                        <span className="clb-grp-ico">{g.emoji}</span>
                        <span className="clb-grp-nm">{g.label}</span>
                      </th>
                    ))}
                    <th className="clb-thc clb-first" rowSpan={2}>Total<br />Correct</th>
                    <th className="clb-thc" rowSpan={2}>Total<br />Time</th>
                  </tr>
                  <tr>
                    {ch.groups.map((g) => g.columns.map((col) => (
                      <th key={col.quizId} className="clb-sub" style={{ '--ac': g.color }}>{col.icon} {col.label}</th>
                    )))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => {
                    const rank = i + 1;
                    const medal = MEDAL[rank];
                    const tint = TINT[rank] || 'transparent';
                    return (
                      <tr key={u.username + i} style={{ background: tint }}>
                        <th className="clb-player" style={{ background: medal ? `linear-gradient(90deg, ${tint}, transparent)` : undefined }}>
                          <span className="clb-rk" style={medal ? { background: medal, borderColor: COLORS.ink } : undefined}>{rank}</span>
                          <span className="clb-nm">{u.username}</span>
                          <span className="clb-pl">{u.quizzesPlayed}/{cols.length}</span>
                        </th>
                        {cols.map((col) => {
                          const sc = u.scores ? u.scores[col.quizId] : undefined;
                          if (sc === undefined || sc === null) return <td key={col.quizId} className="clb-sc clb-empty">·</td>;
                          const tm = u.times ? u.times[col.quizId] : null;
                          return (
                            <td key={col.quizId} className={`clb-sc${sc === 0 ? ' clb-zero' : ''}`} title={tm != null ? `${mmss(tm)} · best attempt` : ''}>
                              <span className="clb-v" style={{ '--ac': col.group.color }}>{sc}</span>
                            </td>
                          );
                        })}
                        <td className="clb-totc"><span>{u.totalCorrect}</span></td>
                        <td className="clb-tott">{mmss(u.totalTime)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="clb-legend">
            {ch.groups.map((g) => (
              <span key={g.key} className="clb-chip"><span className="clb-sw" style={{ background: g.color }} />{g.label} {g.emoji}</span>
            ))}
          </div>
          <p className="clb-foot">
            Each section shows two columns: <b>🚩 Flags</b> (name the country from its flag) and <b>🗺️ Map</b> (click the country with no outline). Cells show a player's correct-answer count on their best attempt since the window opened — hover a score to see that attempt's time; a dot (·) means they haven't taken that quiz yet. Ranking is by <b>total correct</b> across every quiz, ties broken by <b>least total time</b>. Only signed-up players appear. Standings are live — hit Refresh for the latest.
          </p>
        </section>
        <Footer />
      </div>

      <style>{`
        .clb-meta{display:flex;flex-wrap:wrap;align-items:center;gap:10px 24px;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:0.04em;color:${COLORS.faded};margin-top:22px;}
        .clb-meta b{color:${COLORS.ink};font-weight:500;}
        .clb-refresh{display:inline-flex;align-items:center;gap:6px;padding:5px 11px;background:${COLORS.paper};border:1.5px solid ${COLORS.ink};font-family:'DM Mono',monospace;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;font-weight:700;color:${COLORS.ink};cursor:pointer;}
        .clb-refresh:hover{background:#e4dbc8;}
        .clb-refresh:disabled{opacity:0.55;cursor:default;}
        @keyframes clbspin{to{transform:rotate(360deg);}}
        .clb-scroll{overflow-x:auto;border:1px solid rgba(26,22,17,0.16);border-radius:4px;background:${COLORS.cream};}
        .clb-table{border-collapse:separate;border-spacing:0;width:100%;font-variant-numeric:tabular-nums;}
        .clb-table th,.clb-table td{white-space:nowrap;}
        .clb-grp{padding:10px 8px 8px;text-align:center;border-bottom:2px solid var(--ac);border-left:1px solid rgba(26,22,17,0.10);background:${COLORS.paper};}
        .clb-grp-ico{font-size:20px;display:block;line-height:1;margin-bottom:4px;}
        .clb-grp-nm{font-family:'Fraunces',serif;font-weight:600;font-size:13px;color:${COLORS.ink};}
        .clb-sub{padding:6px 8px 8px;text-align:center;font-family:'DM Mono',monospace;font-size:9.5px;letter-spacing:0.06em;text-transform:uppercase;color:var(--ac);font-weight:500;border-bottom:1px solid rgba(26,22,17,0.16);border-left:1px solid rgba(26,22,17,0.06);background:${COLORS.paper};}
        .clb-corner{position:sticky;left:0;z-index:2;background:${COLORS.paper};text-align:left;padding:10px 14px;font-family:'Fraunces',serif;font-weight:600;font-size:13px;color:${COLORS.ink};border-bottom:2px solid ${COLORS.ember};border-right:2px solid rgba(26,22,17,0.18);}
        .clb-thc{padding:8px 10px;font-family:'DM Mono',monospace;font-size:9.5px;letter-spacing:0.07em;text-transform:uppercase;color:${COLORS.faded};border-bottom:1px solid rgba(26,22,17,0.16);text-align:center;vertical-align:bottom;background:${COLORS.paper};}
        .clb-thc.clb-first{border-left:2px solid rgba(26,22,17,0.25);}
        .clb-player{position:sticky;left:0;z-index:1;background:${COLORS.cream};text-align:left;padding:9px 14px;font-weight:400;border-right:2px solid rgba(26,22,17,0.18);border-bottom:1px solid rgba(26,22,17,0.08);}
        .clb-rk{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;border:1.5px solid rgba(26,22,17,0.2);font-family:'DM Mono',monospace;font-size:11px;font-weight:500;margin-right:9px;vertical-align:middle;color:${COLORS.ink};}
        .clb-nm{font-family:'Fraunces',serif;font-weight:600;font-size:14.5px;vertical-align:middle;}
        .clb-pl{font-family:'DM Mono',monospace;font-size:10px;color:${COLORS.faded};margin-left:8px;vertical-align:middle;}
        .clb-sc{text-align:center;padding:8px;border-bottom:1px solid rgba(26,22,17,0.06);border-left:1px solid rgba(26,22,17,0.05);}
        .clb-v{font-family:'Fraunces',serif;font-weight:700;font-size:15px;color:var(--ac);}
        .clb-empty{color:rgba(26,22,17,0.22);font-size:13px;}
        .clb-zero .clb-v{color:rgba(26,22,17,0.3);font-weight:500;}
        .clb-totc{text-align:center;padding:8px 12px;border-left:2px solid rgba(26,22,17,0.25);border-bottom:1px solid rgba(26,22,17,0.06);}
        .clb-totc span{font-family:'Fraunces',serif;font-weight:700;font-size:18px;color:${COLORS.ember};}
        .clb-tott{text-align:center;padding:8px 14px 8px 10px;font-family:'DM Mono',monospace;font-size:13px;font-weight:500;color:${COLORS.ink};border-bottom:1px solid rgba(26,22,17,0.06);}
        .clb-table tbody tr:hover td,.clb-table tbody tr:hover th.clb-player{background:rgba(192,57,43,0.05);}
        .clb-legend{display:flex;flex-wrap:wrap;gap:8px 16px;margin:16px 0 4px;font-family:'DM Mono',monospace;font-size:11px;color:${COLORS.faded};}
        .clb-chip{display:inline-flex;align-items:center;gap:6px;}
        .clb-sw{width:10px;height:10px;border-radius:2px;display:inline-block;}
        .clb-foot{font-family:'DM Mono',monospace;font-size:11px;line-height:1.6;color:${COLORS.faded};max-width:880px;margin-top:14px;}
        .clb-foot b{color:${COLORS.ink};font-weight:500;}
      `}</style>
    </div>
  );
}
