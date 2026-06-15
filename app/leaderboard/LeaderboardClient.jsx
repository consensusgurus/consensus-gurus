'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, Scale, Play, Check, CheckCheck } from 'lucide-react';
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
  const [data, setData] = useState({ totalPlays: [], completed: [], weighted: [], correctAnswers: [], perfectQuizzes: [], minQuizzes: 5, anonPlays: 0, anonCompleted: 0, anonWeighted: 0 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/quiz/champions')
      .then((r) => r.json())
      .then((d) => { if (d && !d.error) setData({ totalPlays: d.totalPlays || [], completed: d.completed || [], weighted: d.weighted || [], correctAnswers: d.correctAnswers || [], perfectQuizzes: d.perfectQuizzes || [], minQuizzes: d.minQuizzes || 5, anonPlays: d.anonPlays || 0, anonCompleted: d.anonCompleted || 0, anonWeighted: d.anonWeighted || 0 }); })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const num = (n) => (Number(n) || 0).toLocaleString();
  const totalPlaysRows = data.totalPlays.map((u) => ({ name: u.username, value: num(u.plays) }));
  const correctRows = data.correctAnswers.map((u) => ({ name: u.username, value: num(u.correct) }));
  const completedRows = data.completed.map((u) => ({ name: u.username, value: num(u.quizzes) }));
  const perfectRows = data.perfectQuizzes.map((u) => ({ name: u.username, value: num(u.perfect) }));
  const weightedRows = data.weighted.map((u) => ({ name: u.username, value: u.weighted.toFixed(1) }));

  // Metric-specific anonymous totals, shown as a parenthetical in each column title.
  const anonPlaysStr = `${num(data.anonPlays)} anonymous`;
  const anonCompletedStr = `${num(data.anonCompleted)} anonymous`;

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
            The <span style={{ fontStyle: 'italic', fontWeight: 400, color: COLORS.ember }}>All-Time</span> Leaderboard
          </h1>
          <p style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 17, lineHeight: 1.5, color: COLORS.faded, margin: 0, maxWidth: 720 }}>
            Every signed-up player, ranked five ways: total plays, correct answers banked, distinct quizzes finished, quizzes scored a perfect 100%, and quality-adjusted volume. Anonymous totals are noted where available. Sign up before a quiz to put your name in the running.
          </p>
          <div style={{ borderBottom: `1px solid ${COLORS.ink}`, marginTop: 22 }} />
          <div style={{ borderBottom: `2px solid ${COLORS.ember}` }} />
        </header>

        <section style={{ maxWidth: 1300, margin: '0 auto', padding: '24px 24px 72px' }}>
          {loaded ? (
            <div className="lb-grid">
              <Column icon={Play} title="Total Plays" anon={anonPlaysStr} note="Every game, replays included" rows={totalPlaysRows} empty="No plays recorded yet." />
              <Column icon={Check} title="Most Correct Answers" note="Correct answers, all-time" rows={correctRows} empty="No answers recorded yet." />
              <Column icon={Trophy} title="Unique Quizzes Played" anon={anonCompletedStr} note="Distinct quizzes finished" rows={completedRows} empty="No completed quizzes yet." />
              <Column icon={CheckCheck} title="Fully Completed Quizzes" note="Distinct quizzes scored 100%" rows={perfectRows} empty="No perfect runs yet." />
              <Column icon={Scale} title="Accuracy-Weighted" note="Accuracy × quizzes completed" rows={weightedRows} empty="No completed quizzes yet." />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 24px', fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 18, color: COLORS.faded }}>Loading the standings...</div>
          )}
          <style>{`
            .lb-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:20px;}
            .lb-title{min-height:46px;}
            @media(max-width:1100px){.lb-grid{grid-template-columns:1fr 1fr 1fr;gap:28px;}}
            @media(max-width:760px){.lb-grid{grid-template-columns:1fr 1fr;gap:30px;}}
            @media(max-width:520px){.lb-grid{grid-template-columns:1fr;gap:34px;}.lb-title{min-height:0;}}
          `}</style>
        </section>
      </div>
      <Footer />
    </div>
  );
}
