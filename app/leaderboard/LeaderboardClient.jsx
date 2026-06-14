'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, Scale, Target } from 'lucide-react';
import { COLORS } from '@/lib/data';
import Grain from '../Grain';
import Footer from '../Footer';

const MEDAL = ['#caa12e', '#9c968a', '#b1763f'];

function RankRow({ rank, name, value }) {
  const medal = rank <= 3 ? MEDAL[rank - 1] : null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 4px', borderBottom: `1px solid rgba(26,22,17,0.12)` }}>
      <span style={{ flex: 'none', width: 30, height: 30, borderRadius: '50%', background: medal || 'transparent', border: medal ? `1.5px solid ${COLORS.ink}` : `1.5px solid rgba(26,22,17,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Mono, monospace', fontSize: 13, fontWeight: 500, color: medal ? COLORS.ink : COLORS.faded }}>{rank}</span>
      <span style={{ flex: '1 1 auto', minWidth: 0, fontFamily: 'DM Mono, monospace', fontSize: 14, fontWeight: 500, color: COLORS.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
      <span style={{ flex: 'none', fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 17, color: COLORS.ink }}>{value}</span>
    </div>
  );
}

function Column({ icon: Icon, title, note, rows, empty }) {
  return (
    <div>
      <div className="lb-title" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 4 }}>
        <Icon size={20} strokeWidth={2} aria-hidden="true" style={{ color: COLORS.ember }} />
        <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 21, letterSpacing: '-0.01em', margin: 0, color: COLORS.ink }}>{title}</h2>
      </div>
      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded, marginBottom: 12 }}>{note}</div>
      <div style={{ borderTop: `2px solid ${COLORS.ember}` }}>
        {rows.length > 0 ? rows.map((r, i) => (
          <RankRow key={`${r.name}-${i}`} rank={i + 1} name={r.name} value={r.value} />
        )) : (
          <div style={{ padding: '24px 4px', fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 15, color: COLORS.faded }}>{empty}</div>
        )}
      </div>
    </div>
  );
}

export default function LeaderboardClient() {
  const [data, setData] = useState({ completed: [], weighted: [], accuracy: [], minQuizzes: 5 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/quiz/champions')
      .then((r) => r.json())
      .then((d) => { if (d && !d.error) setData({ completed: d.completed || [], weighted: d.weighted || [], accuracy: d.accuracy || [], minQuizzes: d.minQuizzes || 5 }); })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const completedRows = data.completed.map((u) => ({ name: u.username, value: u.quizzes.toLocaleString() }));
  const weightedRows = data.weighted.map((u) => ({ name: u.username, value: u.weighted.toFixed(1) }));
  const accuracyRows = data.accuracy.map((u) => ({ name: u.username, value: `${u.accuracy.toFixed(1)}%` }));

  return (
    <div style={{ minHeight: '100vh', background: COLORS.cream, color: COLORS.ink, position: 'relative', overflow: 'clip' }}>
      <Grain />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <header style={{ padding: '40px 24px 18px', maxWidth: 1100, margin: '0 auto' }}>
          <Link href="/quizzes" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, color: COLORS.faded, textDecoration: 'none', marginBottom: 22 }}>
            <ArrowLeft size={15} strokeWidth={2.5} /> All Quizzes
          </Link>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: COLORS.ember, marginBottom: 10 }}>Quiz Champions</div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 'clamp(34px, 7vw, 60px)', lineHeight: 0.95, letterSpacing: '-0.015em', margin: '0 0 14px', fontVariationSettings: '"SOFT" 100', color: COLORS.ink }}>
            The <span style={{ fontStyle: 'italic', fontWeight: 400, color: COLORS.ember }}>All-Time</span> Leaderboard
          </h1>
          <p style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 17, lineHeight: 1.5, color: COLORS.faded, margin: 0, maxWidth: 640 }}>
            Every signed-up player, ranked three ways: sheer volume, quality-adjusted volume, and pure precision. Sign up before a quiz to put your name in the running.
          </p>
          <div style={{ borderBottom: `1px solid ${COLORS.ink}`, marginTop: 22 }} />
          <div style={{ borderBottom: `2px solid ${COLORS.ember}` }} />
        </header>

        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px 72px' }}>
          {loaded ? (
            <div className="lb-grid">
              <Column icon={Trophy} title="Quizzes Played" note="Distinct quizzes finished" rows={completedRows} empty="No completed quizzes yet." />
              <Column icon={Target} title="Accuracy (min 5 plays)" note={`Min ${data.minQuizzes} quizzes · first attempt`} rows={accuracyRows} empty={`No players with ${data.minQuizzes}+ quizzes yet.`} />
              <Column icon={Scale} title="Accuracy-Weighted Plays" note="Accuracy × quizzes completed" rows={weightedRows} empty="No completed quizzes yet." />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 24px', fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 18, color: COLORS.faded }}>Loading the standings...</div>
          )}
          <style>{`
            .lb-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:40px;}
            .lb-title{min-height:58px;}
            @media(max-width:880px){.lb-grid{grid-template-columns:1fr 1fr;gap:36px;}}
            @media(max-width:600px){.lb-grid{grid-template-columns:1fr;gap:40px;}.lb-title{min-height:0;}}
          `}</style>
        </section>
      </div>
      <Footer />
    </div>
  );
}
