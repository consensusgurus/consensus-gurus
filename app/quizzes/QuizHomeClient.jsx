'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { COLORS } from '@/lib/data';
import { QUIZZES } from '@/lib/quizzes';
import Grain from '../Grain';
import Footer from '../Footer';

function QuizTile({ quiz }) {
  const [hover, setHover] = useState(false);
  const blurb = (quiz.blurb || '').split(' Ninety seconds')[0];
  return (
    <Link
      href={`/quiz/${quiz.id}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        cursor: 'pointer',
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        background: hover ? '#e4dbc8' : COLORS.paper,
        color: COLORS.ink,
        border: `1.5px solid ${COLORS.ink}`,
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        transform: hover ? 'translate(-2px, -2px)' : 'none',
        boxShadow: hover ? `3px 3px 0 ${COLORS.ember}` : 'none',
      }}
    >
      <div style={{ padding: '16px 18px 14px', display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: COLORS.ember, fontWeight: 700 }}>
            {quiz.category || 'Quiz'} · Quiz
          </span>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded }}>
            {quiz.answers.length} to name
          </span>
        </div>
        <h3 style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 22, lineHeight: 1.1, letterSpacing: '-0.01em', margin: '0 0 8px', color: COLORS.ink }}>
          {quiz.title}
        </h3>
        {blurb && (
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, lineHeight: 1.45, color: COLORS.faded, margin: 0 }}>
            {blurb}
          </p>
        )}
        <div style={{ marginTop: 'auto', paddingTop: 14, fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: COLORS.ember }}>
          ▶ Play · 90s on the clock
        </div>
      </div>
    </Link>
  );
}

export default function QuizHomeClient() {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');

  const categories = useMemo(() => {
    const seen = [];
    for (const q of QUIZZES) {
      const c = q.category || 'Other';
      if (!seen.includes(c)) seen.push(c);
    }
    return seen.sort((a, b) => a.localeCompare(b));
  }, []);

  const filtered = useMemo(() => {
    const ql = query.trim().toLowerCase();
    return QUIZZES.filter((q) => {
      if (cat !== 'all' && (q.category || 'Other') !== cat) return false;
      if (!ql) return true;
      return (
        (q.title || '').toLowerCase().includes(ql) ||
        (q.category || '').toLowerCase().includes(ql) ||
        (q.blurb || '').toLowerCase().includes(ql)
      );
    });
  }, [query, cat]);

  const chip = (id, label) => {
    const active = cat === id;
    return (
      <button
        key={id}
        onClick={() => setCat(id)}
        style={{
          background: active ? COLORS.ember : 'transparent',
          color: active ? COLORS.cream : COLORS.ink,
          border: `1.5px solid ${COLORS.ink}`,
          padding: '7px 14px',
          fontFamily: 'DM Mono, monospace',
          fontSize: 11,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: COLORS.cream, color: COLORS.ink, position: 'relative', overflow: 'clip' }}>
      <Grain />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <header style={{ padding: '48px 24px 18px', maxWidth: 1200, margin: '0 auto' }}>
          <div className="cg-head">
            <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 'clamp(40px, 9vw, 84px)', lineHeight: 0.9, letterSpacing: '-0.015em', margin: 0, fontVariationSettings: '"SOFT" 100', color: COLORS.ink, whiteSpace: 'nowrap' }}>
              Source
              <br />
              <span style={{ fontStyle: 'italic', fontWeight: 400, color: COLORS.ember }}>of</span> Truths
            </h1>
            <div className="cg-head-col">
              <div className="cg-tagline">The Quizzes</div>
              <div className="cg-blurb">
                Timed name-them-all quizzes built from the same ranked consensus as our lists. Beat the clock, then beat the leaderboard.
              </div>
              <div style={{ borderBottom: `1px solid ${COLORS.ink}`, marginBottom: 4 }} />
              <div style={{ borderBottom: `2px solid ${COLORS.ember}` }} />
            </div>
          </div>
          <style>{`
            .cg-head{display:flex;align-items:flex-end;gap:clamp(16px,4vw,28px);}
            .cg-head-col{flex:1;min-width:0;margin-bottom:clamp(8px,1.4vw,14px);}
            .cg-tagline{font-family:'DM Mono',monospace;font-size:clamp(9px,1.1vw,11px);letter-spacing:0.2em;text-transform:uppercase;font-weight:700;color:${COLORS.ink};text-align:right;margin-bottom:8px;line-height:1.4;}
            .cg-blurb{font-family:'DM Sans',sans-serif;font-size:clamp(11px,1.25vw,13px);line-height:1.5;color:${COLORS.ink};text-align:right;max-width:520px;margin-left:auto;margin-bottom:10px;}
            @media(max-width:640px){.cg-head{flex-direction:column;align-items:stretch;gap:14px;}.cg-head-col{margin-bottom:0;}.cg-tagline{text-align:left;}.cg-blurb{text-align:left;max-width:none;margin-left:0;font-size:14px;}}
          `}</style>
          <div style={{ marginTop: 16, fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: COLORS.faded }}>
            {QUIZZES.length} quizzes
          </div>
        </header>

        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '8px 24px 64px' }}>
          <div style={{ position: 'relative', marginBottom: 16, maxWidth: 420 }}>
            <Search size={16} strokeWidth={2.5} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: COLORS.faded }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search quizzes"
              style={{ width: '100%', height: 42, boxSizing: 'border-box', padding: '0 16px 0 42px', background: COLORS.paper, border: `1.5px solid ${COLORS.ink}`, fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: COLORS.ink, outline: 'none' }}
            />
            {query && (
              <button onClick={() => setQuery('')} aria-label="Clear search" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: COLORS.faded, cursor: 'pointer', padding: 6, display: 'flex' }}>
                <X size={16} strokeWidth={2.5} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {chip('all', 'All')}
            {categories.map((c) => chip(c, c))}
          </div>

          {filtered.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {filtered.map((q) => (
                <QuizTile key={q.id} quiz={q} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 24px', fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 18, color: COLORS.faded }}>
              No quizzes match that filter.
            </div>
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
}
