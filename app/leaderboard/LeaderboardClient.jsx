'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, Play, Check, CheckCheck } from 'lucide-react';
import { COLORS } from '@/lib/data';
import Grain from '../Grain';
import Footer from '../Footer';

const MEDAL = ['#caa12e', '#9c968a', '#b1763f'];

function RankRow({ rank, name, value }) {
  const medal = rank <= 3 ? MEDAL[rank - 1] : null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 3px', borderBottom: `1px solid rgba(26,22,17,0.12)` }}>
      <span style={{ flex: 'none', width: 24, height: 24, borderRadius: '50%', background: medal || 'transparent', border: medal ? `1.5px solid ${COLORS.ink}` : `1.5px solid rgba(26,22,17,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Mono, monospace', fontSize: 11, fontWeight: 500, color: medal ? COLORS.ink : COLORS.faded }}>{rank}</span>
      <span style={{ flex: '1 1 auto', minWidth: 0, fontFamily: 'DM Mono, monospace', fontSize: 12.5, fontWeight: 500, color: COLORS.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
      <span style={{ flex: 'none', fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 15, color: COLORS.ink }}>{value}</span>
    </div>
  );
}

function Column({ icon: Icon, title, anon, note, rows, empty }) {
  return (
    <div>
      <div className="lb-title" style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 3 }}>
        <Icon size={16} strokeWidth={2} aria-hidden="true" style={{ flex: 'none', marginTop: 2, color: COLORS.ember }} />
        <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 16, lineHeight: 1.1, letterSpacing: '-0.01em', margin: 0, color: COLORS.ink }}>
          {title}
          {anon ? <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 9.5, fontWeight: 500, letterSpacing: '0.04em', color: COLORS.faded, marginLeft: 6, whiteSpace: 'nowrap' }}>({anon})</span> : null}
        </h2>
      </div>
      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded, marginBottom: 10 }}>{note}</div>
      <div style={{ borderTop: `2px solid ${COLORS.ember}` }}>
        {rows.length > 0 ? rows.map((r, i) => (
          <RankRow key={`${r.name}-${i}`} rank={i + 1} name={r.name} value={r.value} />
        )) : (
          <div style={{ padding: '20px 3px', fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 13.5, color: COLORS.faded }}>{empty}</div>
        )}
      </div>
    </div>
  );
}

export default function LeaderboardClient() {
  const [data, setData] = useState({ totalPlays: [], completed: [], correctAnswers: [], perfectQuizzes: [], minQuizzes: 5, anonPlays: 0, anonCompleted: 0, anonPlayers: [], today: {} });
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState('registered');
  const [period, setPeriod] = useState('all');

  useEffect(() => {
    fetch('/api/quiz/champions')
      .then((r) => r.json())
      .then((d) => { if (d && !d.error) setData({ totalPlays: d.totalPlays || [], completed: d.completed || [], correctAnswers: d.correctAnswers || [], perfectQuizzes: d.perfectQuizzes || [], minQuizzes: d.minQuizzes || 5, anonPlays: d.anonPlays || 0, anonCompleted: d.anonCompleted || 0, anonPlayers: d.anonPlayers || [], today: d.today || {} }); })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const num = (n) => (Number(n) || 0).toLocaleString();
  // Source for the current period (all-time = top-level fields; today = data.today).
  const src = period === 'today' ? (data.today || {}) : data;
  const totalPlaysRows = (src.totalPlays || []).map((u) => ({ name: u.username, value: num(u.plays) }));
  const correctRows = (src.correctAnswers || []).map((u) => ({ name: u.username, value: num(u.correct) }));
  const completedRows = (src.completed || []).map((u) => ({ name: u.username, value: num(u.quizzes) }));
  const perfectRows = (src.perfectQuizzes || []).map((u) => ({ name: u.username, value: num(u.perfect) }));

  // Anonymous players: same four metrics, ranked, shown under their random number.
  const apl = src.anonPlayers || [];
  const anonTop = (key) => apl.filter((p) => (p[key] || 0) > 0).sort((a, b) => (b[key] || 0) - (a[key] || 0) || (a.num - b.num)).slice(0, 50).map((p) => ({ name: p.label, value: num(p[key]) }));
  const anonPlaysRows = anonTop('plays');
  const anonCorrectRows = anonTop('correct');
  const anonQuizzesRows = anonTop('quizzes');
  const anonPerfectRows = anonTop('perfect');

  // Combined view: registered + anonymous players merged into one ranking per
  // metric, sorted by value desc, top 50.
  const combine = (regField, regKey, anonKey) => {
    const reg = (src[regField] || []).map((u) => ({ name: u.username, v: Number(u[regKey]) || 0 }));
    const an = apl.filter((p) => (p[anonKey] || 0) > 0).map((p) => ({ name: p.label, v: Number(p[anonKey]) || 0 }));
    return [...reg, ...an]
      .sort((a, b) => b.v - a.v || (a.name || '').localeCompare(b.name || ''))
      .slice(0, 50)
      .map((x) => ({ name: x.name, value: num(x.v) }));
  };
  const combPlaysRows = combine('totalPlays', 'plays', 'plays');
  const combCorrectRows = combine('correctAnswers', 'correct', 'correct');
  const combQuizzesRows = combine('completed', 'quizzes', 'quizzes');
  const combPerfectRows = combine('perfectQuizzes', 'perfect', 'perfect');

  // Metric-specific anonymous totals, shown as a parenthetical in each column title.
  const anonPlaysStr = `${num(period === 'today' ? apl.reduce((s, p) => s + (p.plays || 0), 0) : data.anonPlays)} anonymous`;
  const anonCompletedStr = `${num(period === 'today' ? apl.reduce((s, p) => s + (p.quizzes || 0), 0) : data.anonCompleted)} anonymous`;

  return (
    <div style={{ minHeight: '100vh', background: COLORS.cream, color: COLORS.ink, position: 'relative', overflow: 'clip' }}>
      <Grain />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <header style={{ padding: '40px 24px 18px', maxWidth: 1300, margin: '0 auto' }}>
          <Link href="/quizzes" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, color: COLORS.faded, textDecoration: 'none', marginBottom: 22 }}>
            <ArrowLeft size={15} strokeWidth={2.5} /> All Quizzes
          </Link>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: COLORS.ember, marginBottom: 10 }}>Quiz Champions</div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 'clamp(34px, 7vw, 60px)', lineHeight: 0.95, letterSpacing: '-0.015em', margin: '0 0 14px', fontVariationSettings: '"SOFT" 100', color: COLORS.ink }}>
            The <span style={{ fontStyle: 'italic', fontWeight: 400, color: COLORS.ember }}>Quiz</span> Leaderboard
          </h1>
          <p style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 17, lineHeight: 1.5, color: COLORS.faded, margin: 0, maxWidth: 720 }}>
            Every signed-up player, ranked four ways: total plays, correct answers banked, distinct quizzes finished, and quizzes scored a perfect 100%. Anonymous totals are noted where available. Sign up before a quiz to put your name in the running.
          </p>
          <div style={{ borderBottom: `1px solid ${COLORS.ink}`, marginTop: 22 }} />
          <div style={{ borderBottom: `2px solid ${COLORS.ember}` }} />
        </header>

        <section style={{ maxWidth: 1300, margin: '0 auto', padding: '24px 24px 72px' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
            <div style={{ display: 'inline-flex', border: `1.5px solid ${COLORS.ink}` }}>
              {[['registered', 'Registered'], ['anon', 'Anonymous'], ['combined', 'Combined']].map(([k, label], idx) => {
                const on = view === k;
                return (
                  <button key={k} onClick={() => setView(k)} style={{ padding: '8px 20px', background: on ? COLORS.ink : 'transparent', color: on ? COLORS.cream : COLORS.ink, border: 'none', borderLeft: idx === 0 ? 'none' : `1.5px solid ${COLORS.ink}`, fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer' }}>{label}</button>
                );
              })}
            </div>
            <div style={{ display: 'inline-flex', border: `1.5px solid ${COLORS.ink}` }}>
              {[['all', 'All Time'], ['today', 'Today']].map(([k, label], idx) => {
                const on = period === k;
                return (
                  <button key={k} onClick={() => setPeriod(k)} style={{ padding: '8px 20px', background: on ? COLORS.ink : 'transparent', color: on ? COLORS.cream : COLORS.ink, border: 'none', borderLeft: idx === 0 ? 'none' : `1.5px solid ${COLORS.ink}`, fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer' }}>{label}</button>
                );
              })}
            </div>
          </div>
          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.03em', color: COLORS.faded, margin: '0 0 18px', maxWidth: 720 }}>
            {view === 'anon' ? 'Players who never signed up, batched by browser and shown under a random number.' : view === 'combined' ? 'Registered and anonymous players merged into one combined ranking.' : 'Signed-up players only. Switch to Anonymous or Combined to see everyone else.'}{period === 'today' ? ' Showing today only.' : ''}
          </p>
          {loaded ? (
            <div className="lb-grid">
              {view === 'registered' ? (
                <>
                  <Column icon={Play} title="Plays" anon={anonPlaysStr} note="Every game, replays included" rows={totalPlaysRows} empty="No plays recorded yet." />
                  <Column icon={Check} title="Correct Answers" note="Correct answers" rows={correctRows} empty="No answers recorded yet." />
                  <Column icon={Trophy} title="Unique Quizzes Played" anon={anonCompletedStr} note="Distinct quizzes finished" rows={completedRows} empty="No completed quizzes yet." />
                  <Column icon={CheckCheck} title="Fully Completed Quizzes" note="Distinct quizzes scored 100%" rows={perfectRows} empty="No perfect runs yet." />
                </>
              ) : view === 'anon' ? (
                <>
                  <Column icon={Play} title="Plays" note="Every game, replays included" rows={anonPlaysRows} empty="No anonymous plays yet." />
                  <Column icon={Check} title="Correct Answers" note="Correct answers" rows={anonCorrectRows} empty="No anonymous answers yet." />
                  <Column icon={Trophy} title="Unique Quizzes Played" note="Distinct quizzes finished" rows={anonQuizzesRows} empty="No anonymous quizzes yet." />
                  <Column icon={CheckCheck} title="Fully Completed Quizzes" note="Distinct quizzes scored 100%" rows={anonPerfectRows} empty="No perfect anonymous runs yet." />
                </>
              ) : (
                <>
                  <Column icon={Play} title="Plays" note="Every game, replays included" rows={combPlaysRows} empty="No plays recorded yet." />
                  <Column icon={Check} title="Correct Answers" note="Correct answers" rows={combCorrectRows} empty="No answers recorded yet." />
                  <Column icon={Trophy} title="Unique Quizzes Played" note="Distinct quizzes finished" rows={combQuizzesRows} empty="No completed quizzes yet." />
                  <Column icon={CheckCheck} title="Fully Completed Quizzes" note="Distinct quizzes scored 100%" rows={combPerfectRows} empty="No perfect runs yet." />
                </>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 24px', fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 18, color: COLORS.faded }}>Loading the standings...</div>
          )}
          <style>{`
            .lb-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:22px;}
            .lb-title{min-height:46px;}
            @media(max-width:900px){.lb-grid{grid-template-columns:1fr 1fr;gap:30px;}}
            @media(max-width:520px){.lb-grid{grid-template-columns:1fr;gap:34px;}.lb-title{min-height:0;}}
          `}</style>
        </section>
      </div>
      <Footer />
    </div>
  );
}
