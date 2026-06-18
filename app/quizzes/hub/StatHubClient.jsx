'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, ChevronDown, User, ListChecks, Flame, FunctionSquare, Clock,
} from 'lucide-react';
import { QUIZZES } from '@/lib/quizzes';
import { quizDept as deptOf, DEPT_COLOR, DEPT_LABEL, DEPT_NAV } from '@/lib/quiz-departments';
import { CHALLENGES, getChallenge, DEFAULT_CHALLENGE_ID, challengeQuizIds } from '@/lib/challenges';
import Grain from '../../Grain';
import Footer from '../../Footer';

const C = {
  bg: '#f7f8fa', surface: '#fff', ink: '#1c1e24', muted: '#6b7280',
  soft: '#9aa0ab', line: 'rgba(20,22,28,0.09)', accent: '#2563eb',
  accsoft: '#e8effb', live: '#10b981', danger: '#c0392b',
};
const MEDAL = ['#e8b43a', '#b8bcc4', '#c8814b'];
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";

function cleanTitle(t) { return (t || '').replace(/^Name (the )?/i, '').trim(); }
function getAnonId() { if (typeof window === 'undefined') return null; try { return localStorage.getItem('sot_quiz_anon'); } catch { return null; } }
function getIdentity() { if (typeof window === 'undefined') return null; try { return JSON.parse(localStorage.getItem('sot_quiz_identity')); } catch { return null; } }
function mmss(s) { if (!Number.isFinite(s)) return '—'; const m = Math.floor(s / 60); const sec = Math.round(s % 60); return `${m}:${String(sec).padStart(2, '0')}`; }

const TABS = [
  { t: 'player', label: 'Player', Icon: User },
  { t: 'quizzes', label: 'Quizzes', Icon: ListChecks },
  { t: 'challenges', label: 'Challenges', Icon: Flame },
  { t: 'rating', label: 'Rating', Icon: FunctionSquare },
];

export default function StatHubClient() {
  const [scope, setScope] = useState('all');
  const [ddOpen, setDdOpen] = useState(false);
  const [tab, setTab] = useState('player');

  const [me, setMe] = useState(null);
  const [stats, setStats] = useState([]);     // /api/quiz/stats
  const [totals, setTotals] = useState({ byQuiz: {}, leaders: {}, total: 0 });
  const [challenge, setChallenge] = useState(null); // /api/quiz/challenge-leaderboard

  const catalog = useMemo(() => (QUIZZES || []).filter((q) => q && q.id).map((q) => ({
    id: q.id, title: q.navTitle || cleanTitle(q.title) || q.id, dept: deptOf(q),
  })), []);
  const titleById = useMemo(() => Object.fromEntries(catalog.map((q) => [q.id, q.title])), [catalog]);

  const cats = useMemo(() => {
    const byDept = new Map();
    for (const q of catalog) { if (!byDept.has(q.dept)) byDept.set(q.dept, []); byDept.get(q.dept).push(q); }
    const list = [];
    for (const { id } of DEPT_NAV) if (byDept.has(id)) list.push(id);
    for (const k of byDept.keys()) if (!list.includes(k)) list.push(k);
    return list.map((key) => ({ key, label: DEPT_LABEL[key] || 'Quiz', c: (DEPT_COLOR[key] || DEPT_COLOR.misc).c, count: byDept.get(key).length }))
      .sort((a, b) => b.count - a.count);
  }, [catalog]);
  const byKey = useMemo(() => Object.fromEntries(cats.map((c) => [c.key, c])), [cats]);

  // ── data loads ──
  useEffect(() => {
    const ident = getIdentity();
    const anonId = getAnonId();
    const email = ident && ident.email ? ident.email : '';
    if (anonId || email) {
      const params = new URLSearchParams();
      if (anonId) params.set('anonId', anonId);
      if (email) params.set('email', email);
      fetch(`/api/quiz/me?${params.toString()}`).then((r) => r.json()).then((d) => { if (d) setMe(d); }).catch(() => {});
    } else {
      setMe({ found: false });
    }
    fetch('/api/quiz/stats').then((r) => r.json()).then((d) => { if (d && Array.isArray(d.quizzes)) setStats(d.quizzes); }).catch(() => {});
    fetch('/api/quiz/totals').then((r) => r.json()).then((d) => { if (d && !d.error) setTotals({ byQuiz: d.byQuiz || {}, leaders: d.leaders || {}, total: d.total || 0 }); }).catch(() => {});
    fetch('/api/quiz/challenge-leaderboard').then((r) => r.json()).then((d) => { if (d && !d.error) setChallenge(d); }).catch(() => {});
  }, []);

  const found = me && me.found;
  const rating = me ? (me.rating || 1500) : 1500;
  const tierLabel = me && me.tier ? me.tier : 'Unrated';
  const tierBg = me && me.tierBg ? me.tierBg : '#eceef1';
  const tierFg = me && me.tierFg ? me.tierFg : C.muted;

  const statsById = useMemo(() => Object.fromEntries(stats.map((s) => [s.quizId, s])), [stats]);
  const totalPlays = useMemo(() => stats.reduce((a, s) => a + (s.plays || 0), 0), [stats]);

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
    .qzhub{font-family:${FONT};color:${C.ink};}
    .qzhub .lbl{font-size:10px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:${C.muted};}
    .qzhub .card{background:${C.surface};border:1px solid ${C.line};border-radius:12px;overflow:hidden;min-width:0;}
    .qzhub .metric{background:${C.bg};border-radius:10px;padding:12px 14px;}
    .qzhub .metric .v{font-size:21px;font-weight:700;}
    .qzhub .dd{position:relative;}
    .qzhub .ddbtn{display:flex;align-items:center;gap:8px;background:#fff;border:1px solid ${C.line};border-radius:10px;padding:9px 12px;cursor:pointer;font:inherit;min-width:200px;}
    .qzhub .ddmenu{position:absolute;top:calc(100% + 6px);right:0;z-index:30;background:#fff;border:1px solid ${C.line};border-radius:10px;box-shadow:0 8px 24px rgba(20,22,28,0.12);padding:6px;min-width:250px;max-height:360px;overflow:auto;}
    .qzhub .dditem{display:flex;align-items:center;gap:9px;padding:7px 9px;border-radius:7px;cursor:pointer;font-size:13px;}
    .qzhub .dditem:hover{background:${C.bg};}
    .qzhub .dot{width:9px;height:9px;border-radius:3px;flex:none;}
    .qzhub .tabs{display:flex;gap:6px;background:#eceef1;border-radius:10px;padding:4px;margin:16px 0;}
    .qzhub .tab{flex:1;border:none;background:transparent;border-radius:7px;padding:9px;font:inherit;font-family:${FONT};font-size:13px;color:${C.muted};cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;}
    .qzhub .tab.on{background:#fff;color:${C.ink};font-weight:700;box-shadow:0 1px 2px rgba(20,22,28,0.06);}
    .qzhub .hrow{display:flex;align-items:center;gap:10px;padding:7px 0;border-top:1px solid rgba(20,22,28,0.07);font-size:13px;}
    .qzhub .score{font-weight:700;color:${C.accent};font-variant-numeric:tabular-nums;}
    .qzhub table{width:100%;border-collapse:collapse;font-size:12.5px;}
    .qzhub th{text-align:left;font-size:10px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:${C.muted};padding:8px 10px;border-bottom:1px solid ${C.line};}
    .qzhub td{padding:8px 10px;border-bottom:1px solid rgba(20,22,28,0.06);}
    .qzhub .gtag{font-size:8.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:${C.soft};border:1px solid ${C.line};border-radius:4px;padding:1px 4px;}
    .qzhub .formula{background:${C.bg};border:1px solid ${C.line};border-radius:10px;padding:14px 16px;font-family:ui-monospace,Menlo,monospace;font-size:13px;line-height:1.9;}
    .qzhub .back{display:inline-flex;align-items:center;gap:6px;color:${C.muted};text-decoration:none;font-size:13px;}
    .qzhub .back:hover{color:${C.ink};}
    .qzhub .crumb1{font-size:18px;font-weight:800;letter-spacing:-0.02em;}
    .qzhub .crumb2{font-size:18px;font-weight:600;color:${C.accent};}
    .qzhub a.qlink{text-decoration:none;color:inherit;}
    @media(max-width:680px){.qzhub .rgrid{grid-template-columns:1fr !important;}}
  `;

  return (
    <div style={{ background: C.bg, minHeight: '100vh', position: 'relative' }}>
      <Grain />
      <style>{css}</style>
      <div className="qzhub" style={{ maxWidth: 1080, margin: '0 auto', padding: '20px 24px 70px', position: 'relative' }}>

        {/* crumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingBottom: 12, borderBottom: `1px solid ${C.line}` }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 9 }}>
            <Link href="/" className="qlink"><span className="crumb1">Source of Truths</span></Link>
            <span style={{ color: C.soft }}>/</span>
            <span className="crumb2">Stat Hub</span>
          </div>
          <Link className="back" href="/quizzes"><ArrowLeft size={15} /> Back to Quizzes</Link>
        </div>

        {/* profile header */}
        <div className="card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 18, padding: '15px 18px', marginTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="lbl">Skill Rating</span>
              <span style={{ fontSize: 34, fontWeight: 800, color: C.accent, lineHeight: 1 }}>{found ? rating.toLocaleString() : '—'}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ background: tierBg, color: tierFg, fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 6, width: 'max-content' }}>{found ? tierLabel : 'Play to rank'}</span>
              <span style={{ fontSize: 12, color: C.muted }}>
                {found && me.rank ? <>Rank <b style={{ color: C.ink }}>#{me.rank}</b> of {me.totalPlayers?.toLocaleString()}</> : 'No games on record yet'}
              </span>
            </div>
          </div>
          <div className="dd" style={{ marginLeft: 'auto' }}>
            <button className="ddbtn" onClick={(e) => { e.stopPropagation(); setDdOpen((o) => !o); }}>
              <span className="dot" style={{ background: scope === 'all' ? C.ink : (byKey[scope]?.c || C.ink) }} />
              <span style={{ flex: 1, textAlign: 'left', fontWeight: 600, fontSize: 13 }}>{scope === 'all' ? 'All Categories' : byKey[scope]?.label}</span>
              <ChevronDown size={16} style={{ color: C.muted }} />
            </button>
            {ddOpen && (
              <div className="ddmenu" onClick={(e) => e.stopPropagation()}>
                <div className="dditem" onClick={() => { setScope('all'); setDdOpen(false); }}>
                  <span className="dot" style={{ background: C.ink }} /><span style={{ flex: 1 }}>All Categories</span>
                  <span style={{ fontSize: 11, color: C.soft }}>{catalog.length}</span>
                </div>
                {cats.map((c) => (
                  <div key={c.key} className="dditem" onClick={() => { setScope(c.key); setDdOpen(false); }}>
                    <span className="dot" style={{ background: c.c }} /><span style={{ flex: 1 }}>{c.label}</span>
                    <span style={{ fontSize: 11, color: C.soft }}>{c.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* tabs */}
        <div className="tabs">
          {TABS.map(({ t, label, Icon }) => (
            <button key={t} className={`tab${tab === t ? ' on' : ''}`} onClick={() => setTab(t)}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {tab === 'player' && <PlayerPanel me={me} scope={scope} cats={cats} byKey={byKey} totalQuizzes={catalog.length} />}
        {tab === 'quizzes' && <QuizzesPanel me={me} scope={scope} byKey={byKey} catalog={catalog} stats={statsById} totals={totals} totalPlays={totalPlays} />}
        {tab === 'challenges' && <ChallengesPanel me={me} challenge={challenge} titleById={titleById} />}
        {tab === 'rating' && <RatingPanel me={me} titleById={titleById} />}
      </div>

      {ddOpen && <div onClick={() => setDdOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 20 }} />}
      <Footer />
    </div>
  );
}

// ─── Player tab ─────────────────────────────────────────────────────────────
function Metric({ label, value, sub }) {
  return (
    <div className="metric">
      <div className="lbl">{label}</div>
      <div className="v">{value}</div>
      {sub ? <div style={{ fontSize: 10.5, color: C.muted, marginTop: 2 }}>{sub}</div> : null}
    </div>
  );
}

function PlayerPanel({ me, scope, cats, byKey, totalQuizzes }) {
  const found = me && me.found;
  const a = found ? me.activity : { correct: 0, answered: 0, played: 0, completed: 0, accuracy: 0 };
  const pctTotal = totalQuizzes ? Math.round((a.played / totalQuizzes) * 1000) / 10 : 0;
  const pctCompleted = a.played ? Math.round((a.completed / a.played) * 100) : 0;
  const byCat = (found && me.byCategory) || {};

  const catRows = (scope === 'all' ? cats : cats.filter((c) => c.key === scope));

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10, marginBottom: 16 }}>
        <Metric label="Correct" value={found ? a.correct.toLocaleString() : '—'} sub={found ? `${a.accuracy}% of ${a.answered.toLocaleString()} answered` : null} />
        <Metric label="Played" value={found ? a.played : '—'} sub={found ? `${pctTotal}% of ${totalQuizzes.toLocaleString()}` : null} />
        <Metric label="Completed" value={found ? a.completed : '—'} sub={found ? `${pctCompleted}% of played` : null} />
        <Metric label="Accuracy" value={found ? `${a.accuracy}%` : '—'} />
        <Metric label="Matches" value={found ? me.components.matches : '—'} />
        <Metric label="Net Rating" value={found ? (me.components.netDelta >= 0 ? `+${me.components.netDelta}` : me.components.netDelta) : '—'} />
      </div>
      <div className="card" style={{ padding: '14px 16px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
          {scope === 'all' ? 'Your Stats by Category' : `Your ${byKey[scope]?.label} Detail`}
        </div>
        {!found ? (
          <div style={{ fontSize: 13, color: C.soft, padding: '6px 0' }}>Play a few quizzes and your category breakdown shows up here.</div>
        ) : (
          <div style={{ overflow: 'auto' }}>
            <table>
              <thead><tr>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Played</th>
                <th style={{ textAlign: 'right' }}>Correct</th>
                <th style={{ textAlign: 'right' }}>Completed</th>
                <th style={{ textAlign: 'right' }}>Acc</th>
                <th style={{ textAlign: 'right' }}>ELO</th>
              </tr></thead>
              <tbody>
                {catRows.map((c) => {
                  const cr = byCat[c.key];
                  if (!cr) return (
                    <tr key={c.key}>
                      <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}><span className="dot" style={{ background: c.c, display: 'inline-block', marginRight: 8, verticalAlign: 'middle' }} />{c.label}</td>
                      <td style={{ textAlign: 'right', color: C.soft }}>0</td>
                      <td style={{ textAlign: 'right', color: C.soft }}>—</td>
                      <td style={{ textAlign: 'right', color: C.soft }}>—</td>
                      <td style={{ textAlign: 'right', color: C.soft }}>—</td>
                      <td style={{ textAlign: 'right', color: C.soft }}>—</td>
                    </tr>
                  );
                  return (
                    <tr key={c.key}>
                      <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}><span className="dot" style={{ background: c.c, display: 'inline-block', marginRight: 8, verticalAlign: 'middle' }} />{c.label}</td>
                      <td style={{ textAlign: 'right' }}>{cr.matches}</td>
                      <td style={{ textAlign: 'right' }}>—</td>
                      <td style={{ textAlign: 'right' }}>—</td>
                      <td style={{ textAlign: 'right' }}>—</td>
                      <td className="score" style={{ textAlign: 'right' }}>{cr.rating.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ fontSize: 10.5, color: C.soft, marginTop: 8 }}>Per-category Correct / Completed / Accuracy are summarized across all categories above; the ELO column is your rating within each category.</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Quizzes tab ────────────────────────────────────────────────────────────
function QuizzesPanel({ me, scope, byKey, catalog, stats, totals, totalPlays }) {
  const found = me && me.found;
  const pool = scope === 'all' ? catalog : catalog.filter((q) => q.dept === scope);
  const rows = pool.map((q) => ({ q, s: stats[q.id] || { plays: 0, avgScorePct: 0 }, leader: totals.leaders[q.id] || '' }))
    .sort((a, b) => (b.s.plays || 0) - (a.s.plays || 0) || a.q.title.localeCompare(b.q.title))
    .slice(0, 16);
  const playedTotal = found ? me.activity.played : 0;
  const avgScore = found ? me.activity.accuracy : 0;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10, marginBottom: 16 }}>
        <Metric label="Quizzes" value={(scope === 'all' ? catalog.length : pool.length).toLocaleString()} />
        <Metric label="Total Plays" value={totalPlays.toLocaleString()} />
        <Metric label="You've Played" value={found ? playedTotal : '—'} />
        <Metric label="Your Avg Accuracy" value={found ? `${avgScore}%` : '—'} />
      </div>
      <div className="card" style={{ padding: '4px 6px' }}>
        <div style={{ overflow: 'auto' }}>
          <table>
            <thead><tr>
              <th>Quiz</th>
              <th style={{ textAlign: 'right' }}>Plays</th>
              <th style={{ textAlign: 'right' }}>Avg</th>
              <th>Top Scorer</th>
            </tr></thead>
            <tbody>
              {rows.map(({ q, s, leader }) => (
                <tr key={q.id}>
                  <td style={{ fontWeight: 600, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <Link href={`/quiz/${q.id}`} className="qlink">{q.title}</Link>
                  </td>
                  <td className="score" style={{ textAlign: 'right' }}>{(s.plays || 0).toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>{s.avgScorePct || 0}%</td>
                  <td>{leader || <span style={{ color: C.soft }}>Empty</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Challenges tab ─────────────────────────────────────────────────────────
function ChallengesPanel({ me, challenge, titleById }) {
  const ch = getChallenge(DEFAULT_CHALLENGE_ID) || CHALLENGES[0];
  const users = (challenge && challenge.users) || [];
  const setSize = challengeQuizIds(ch).length;
  const myName = me && me.found ? me.name : null;
  const myIdx = myName ? users.findIndex((u) => (u.username || '').toLowerCase() === myName.toLowerCase()) : -1;
  const leader = users[0]?.username || '—';

  return (
    <div>
      <div className="card" style={{ border: `1.5px solid ${C.accent}`, padding: '15px 17px', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
          <span style={{ background: C.accsoft, color: C.accent, fontSize: 11, fontWeight: 700, padding: '4px 11px', borderRadius: 6 }}>Active Now</span>
          <span style={{ fontSize: 11, color: C.muted, display: 'inline-flex', alignItems: 'center', gap: 5 }}><Clock size={12} /> opens {ch.sinceLabel}</span>
        </div>
        <div style={{ fontSize: 18, fontWeight: 800 }}>{ch.title}</div>
        <div style={{ fontSize: 12.5, color: C.muted, margin: '3px 0 13px' }}>{ch.blurb}</div>
        <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap', marginBottom: 14 }}>
          <div><div className="lbl">Entrants</div><div style={{ fontSize: 19, fontWeight: 800 }}>{challenge ? (challenge.totalRegisteredPlayers ?? users.length) : '—'}</div></div>
          <div><div className="lbl">Quizzes in Set</div><div style={{ fontSize: 19, fontWeight: 800 }}>{setSize}</div></div>
          <div><div className="lbl">Your Standing</div><div style={{ fontSize: 19, fontWeight: 800, color: C.accent }}>{myIdx >= 0 ? `#${myIdx + 1}` : '—'}</div></div>
          <div><div className="lbl">Leader</div><div style={{ fontSize: 19, fontWeight: 800 }}>{leader}</div></div>
        </div>
        <div>
          {users.length === 0 && <div style={{ fontSize: 13, color: C.soft }}>No challenge entries yet.</div>}
          {users.slice(0, 10).map((u, i) => (
            <div className="hrow" key={(u.username || '') + i}>
              {i < 3 ? <span style={{ flex: 'none', width: 18, height: 18, borderRadius: '50%', background: MEDAL[i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: C.ink }}>{i + 1}</span>
                : <span style={{ flex: 'none', width: 18, textAlign: 'center', fontSize: 11, color: C.soft }}>{i + 1}</span>}
              <span style={{ flex: 1, fontWeight: myIdx === i ? 800 : 700, color: myIdx === i ? C.accent : C.ink }}>{u.username}{myIdx === i ? ' (You)' : ''}</span>
              <span style={{ fontSize: 11, color: C.muted }}>{mmss(u.totalTime)}</span>
              <span className="score">{u.totalCorrect}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <Link href="/quizzes/leaderboard" className="qlink"><span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: C.accent }}>Full Standings →</span></Link>
        </div>
      </div>
      <div className="card" style={{ padding: '14px 16px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 7 }}>About the Challenge</div>
        <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.7 }}>
          {ch.prize || 'Compete across the challenge quiz set; most correct wins, ties broken by least total time.'} Everyone is eligible, registered and guest. Standings update live as players finish the set.
        </div>
      </div>
    </div>
  );
}

// ─── Rating tab ─────────────────────────────────────────────────────────────
function RatingPanel({ me, titleById }) {
  const found = me && me.found;
  const comp = found ? me.components : { start: 1500, k: 24, matches: 0, netDelta: 0, rating: 1500 };
  const recent = (found && me.recent) || [];

  return (
    <div>
      <div className="rgrid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>How Your Skill Rating Works</div>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: '0 0 10px' }}>
            Every quiz you finish is a match against that quiz's difficulty. Beat the expected score and your rating rises; fall short and it dips. Heavier, harder quizzes move it more.
          </p>
          <div className="formula">
            E = 1 / (1 + 10<sup>(Dq − R) / 400</sup>)<br />
            R′ = R + K · (S − E)
          </div>
          <div style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.8, marginTop: 10 }}>
            R = your rating · Dq = quiz difficulty · S = your result (score fraction, 0–1) · E = expected result · K = {comp.k} (volatility)
          </div>
        </div>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Your Components</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div className="hrow" style={{ borderTop: 'none' }}><span style={{ flex: 1 }}>Season Start Rating</span><span style={{ fontWeight: 700 }}>{comp.start.toLocaleString()}</span></div>
            <div className="hrow"><span style={{ flex: 1 }}>K-Factor (Volatility)</span><span style={{ fontWeight: 700 }}>{comp.k}</span></div>
            <div className="hrow"><span style={{ flex: 1 }}>Matches Played</span><span style={{ fontWeight: 700 }}>{comp.matches}</span></div>
            <div className="hrow"><span style={{ flex: 1 }}>Net Rating From Results</span><span className="score" style={{ color: comp.netDelta >= 0 ? C.accent : C.danger }}>{comp.netDelta >= 0 ? `+${comp.netDelta}` : comp.netDelta}</span></div>
            <div className="hrow" style={{ borderTop: `2px solid ${C.ink}` }}><span style={{ flex: 1, fontWeight: 700 }}>Current Rating</span><span style={{ fontWeight: 800, color: C.accent }}>{comp.rating.toLocaleString()}</span></div>
          </div>
        </div>
      </div>
      <div className="card" style={{ padding: '4px 6px' }}>
        <div style={{ padding: '12px 12px 4px', fontSize: 14, fontWeight: 700 }}>Recent Matches</div>
        <div style={{ overflow: 'auto' }}>
          <table>
            <thead><tr>
              <th>Quiz</th>
              <th style={{ textAlign: 'right' }}>Dq</th>
              <th style={{ textAlign: 'right' }}>Your %</th>
              <th style={{ textAlign: 'right' }}>S</th>
              <th style={{ textAlign: 'right' }}>E</th>
              <th style={{ textAlign: 'right' }}>ΔR</th>
            </tr></thead>
            <tbody>
              {recent.length === 0 && (
                <tr><td colSpan={6} style={{ color: C.soft }}>No matches yet. Finish a quiz to start your rating.</td></tr>
              )}
              {recent.map((m, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <Link href={`/quiz/${m.quizId}`} className="qlink">{titleById[m.quizId] || cleanTitle(m.quizId)}</Link>
                  </td>
                  <td style={{ textAlign: 'right' }}>{m.dq.toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>{m.scorePct}%</td>
                  <td style={{ textAlign: 'right' }}>{m.S.toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>{m.E.toFixed(2)}</td>
                  <td className="score" style={{ textAlign: 'right', color: m.delta >= 0 ? C.accent : C.danger }}>{m.delta >= 0 ? `+${m.delta}` : m.delta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
