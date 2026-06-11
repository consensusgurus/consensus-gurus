'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Share2, Check, Flag } from 'lucide-react';
import { getQuiz } from '@/lib/quizzes';
import Grain from '../../Grain';
import Footer from '../../Footer';

// Palette is inlined (not imported from lib/data) so the quiz route bundle
// stays tiny — importing COLORS from the 3.6MB data.js would pull the whole
// file into this bundle.
const COLORS = {
  cream: '#f4ede0',
  paper: '#ebe2d0',
  ink: '#1a1611',
  ember: '#c0392b',
  rust: '#a44a26',
  forest: '#3d4f2b',
  faded: '#7a6f5e',
};

const MONO = 'DM Mono, monospace';
const SERIF = 'Fraunces, serif';
const SANS = 'DM Sans, sans-serif';

function norm(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

// ── Personal stats (client-side, real) ──────────────────────────────────────
function statsKey(id) {
  return `sot_quiz_${id}`;
}
function loadStats(id) {
  if (typeof window === 'undefined') return { attempts: 0, best: 0, totalCorrect: 0 };
  try {
    return JSON.parse(localStorage.getItem(statsKey(id))) || { attempts: 0, best: 0, totalCorrect: 0 };
  } catch {
    return { attempts: 0, best: 0, totalCorrect: 0 };
  }
}
function recordResult(id, score, total) {
  const s = loadStats(id);
  const next = {
    attempts: s.attempts + 1,
    best: Math.max(s.best, score),
    totalCorrect: s.totalCorrect + score,
    lastScore: score,
    lastTotal: total,
  };
  try {
    localStorage.setItem(statsKey(id), JSON.stringify(next));
  } catch {}
  return next;
}

// rough cumulative percentile curve for the "you beat X%" line
function percentile(score, total) {
  const frac = total ? score / total : 0;
  return Math.round(Math.min(99, Math.max(2, Math.pow(frac, 1.35) * 100)));
}

export default function QuizClient({ quizId }) {
  const router = useRouter();
  const quiz = useMemo(() => getQuiz(quizId), [quizId]);

  if (!quiz) {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.cream, color: COLORS.ink, position: 'relative' }}>
        <Grain />
        <div style={{ position: 'relative', zIndex: 2, padding: 48, textAlign: 'center' }}>
          <p style={{ fontFamily: SERIF, fontStyle: 'italic', color: COLORS.faded }}>
            That quiz seems to have wandered off.
          </p>
          <button
            onClick={() => router.push('/')}
            style={{ marginTop: 16, background: COLORS.ink, color: COLORS.cream, border: 'none', padding: '10px 20px', fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer' }}
          >
            Back home
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const answers = quiz.answers;
  const total = answers.length;

  const [tab, setTab] = useState('play');
  const [found, setFound] = useState(() => new Array(total).fill(false));
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [time, setTime] = useState(quiz.timeLimit);
  const [hint, setHint] = useState('Press Play to start the clock.');
  const [hintBad, setHintBad] = useState(false);
  const [guess, setGuess] = useState('');
  const [stats, setStats] = useState({ attempts: 0, best: 0, totalCorrect: 0 });
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setStats(loadStats(quizId));
  }, [quizId]);

  const score = found.filter(Boolean).length;

  function endGame(win) {
    if (ended) return;
    setEnded(true);
    clearInterval(timerRef.current);
    const finalScore = found.filter(Boolean).length;
    setStats(recordResult(quizId, finalScore, total));
    setHint(win ? `Perfect — all ${total} named!` : `Time! You got ${finalScore}/${total}.`);
    setHintBad(!win);
  }

  function start() {
    if (started || ended) return;
    setStarted(true);
    setHint('Go — name them all.');
    setHintBad(false);
    timerRef.current = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          endGame(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    if (inputRef.current) inputRef.current.focus();
  }

  function checkGuess(raw) {
    const g = norm(raw);
    if (!g) return;
    for (let i = 0; i < answers.length; i++) {
      if (found[i]) continue;
      const a = answers[i];
      const hit = a.keys.some((k) => g.includes(norm(k)));
      const blocked = (a.anti || []).some((k) => g.includes(norm(k)));
      if (hit && !blocked) {
        const next = found.slice();
        next[i] = true;
        setFound(next);
        setHint(`Correct — ${a.t}`);
        setHintBad(false);
        if (next.every(Boolean)) endGame(true);
        return;
      }
    }
    setHint('Not on the list — try another.');
    setHintBad(true);
  }

  function onKey(e) {
    if (e.key !== 'Enter' || !started || ended) return;
    checkGuess(e.target.value);
    setGuess('');
  }

  useEffect(() => () => clearInterval(timerRef.current), []);

  const personalAvg = stats.attempts ? (stats.totalCorrect / stats.attempts).toFixed(1) : null;
  const clock = `${Math.floor(time / 60)}:${String(time % 60).padStart(2, '0')}`;

  const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://sourceoftruths.com/quiz/${quiz.id}`;
  function share() {
    const text = ended
      ? `I named ${score}/${total} on "${quiz.title}" at Source of Truths. Can you beat me?`
      : `Can you name the ${total}? "${quiz.title}" at Source of Truths.`;
    if (navigator.share) {
      navigator.share({ title: quiz.title, text, url: shareUrl }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(`${text} ${shareUrl}`).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      });
    }
  }

  // ── tab chip (ink ribbon, ember active fill — mirrors the list page) ──
  function chip(key, label, icon) {
    const active = tab === key;
    return (
      <button
        onClick={() => setTab(key)}
        style={{
          flex: '1 0 auto',
          justifyContent: 'center',
          background: active ? COLORS.ember : 'transparent',
          color: COLORS.cream,
          border: 'none',
          borderRight: '1px solid rgba(244,237,224,0.18)',
          padding: '0 16px',
          height: 42,
          whiteSpace: 'nowrap',
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {icon}
        {label}
      </button>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.cream, color: COLORS.ink, position: 'relative', overflow: 'clip' }}>
      <Grain />
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 920, margin: '0 auto', padding: '24px 20px 80px' }}>

        <button
          onClick={() => router.push('/')}
          style={{ background: 'transparent', border: 'none', fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: COLORS.ink, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0' }}
        >
          <ArrowLeft size={14} strokeWidth={2.5} />
          Back to all lists
        </button>

        {/* Header — Fraunces title + ember eyebrow, double rule */}
        <div style={{ paddingBottom: 0, marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'clamp(16px, 4vw, 28px)' }}>
            <h1 style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 'clamp(30px, 5vw, 50px)', lineHeight: 1.02, letterSpacing: '-0.02em', margin: 0, color: COLORS.ink, fontVariationSettings: '"SOFT" 100' }}>
              {quiz.title}
            </h1>
            <div style={{ flex: 1, minWidth: 120, marginBottom: 6 }}>
              <div style={{ fontFamily: MONO, fontSize: 'clamp(9px, 1.1vw, 11px)', letterSpacing: '0.2em', textTransform: 'uppercase', color: COLORS.ember, textAlign: 'right', marginBottom: 8 }}>
                {quiz.category} · Quiz
              </div>
              <div style={{ borderBottom: `1px solid ${COLORS.ink}`, marginBottom: 4 }} />
              <div style={{ borderBottom: `2px solid ${COLORS.ember}` }} />
            </div>
          </div>
          <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 16, lineHeight: 1.45, margin: '12px 0 0', color: COLORS.faded, maxWidth: 640 }}>
            {quiz.blurb}
          </p>
        </div>

        {/* Ribbon */}
        <div style={{ position: 'sticky', top: 0, zIndex: 25, marginTop: 18 }}>
          <div style={{ display: 'flex', alignItems: 'stretch', flexWrap: 'nowrap', overflowX: 'auto', background: COLORS.ink, borderBottom: `3px solid ${COLORS.ember}` }}>
            {chip('play', 'Play')}
            {chip('stats', 'Stats')}
            {chip('share', 'Share', <Share2 size={12} strokeWidth={2.5} />)}
          </div>
        </div>

        <div style={{ marginTop: 24 }} />

        {/* ── PLAY ── */}
        {tab === 'play' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, background: COLORS.paper, border: `1px solid ${COLORS.faded}33`, padding: '16px 20px', marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 34, lineHeight: 1 }}>
                  {score}<span style={{ fontSize: 20, color: COLORS.faded }}>/{total}</span>
                </div>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded }}>Your score</div>
              </div>
              <div style={{ textAlign: 'center', borderLeft: `1px solid ${COLORS.faded}33`, borderRight: `1px solid ${COLORS.faded}33`, padding: '0 22px' }}>
                <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 34, lineHeight: 1, color: COLORS.ember }}>{quiz.stats.avg}</div>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded }}>Avg · {quiz.stats.plays.toLocaleString()} plays</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: MONO, fontSize: 24, color: time <= 10 && started && !ended ? COLORS.ember : COLORS.ink }}>{clock}</div>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded }}>Time left</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
              <input
                ref={inputRef}
                value={guess}
                disabled={!started || ended}
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={onKey}
                placeholder={started ? 'Type an airline, then Enter…' : 'Press Play to begin…'}
                autoComplete="off"
                style={{ flex: 1, fontFamily: SANS, fontSize: 17, padding: '14px 16px', border: `1.5px solid ${COLORS.ink}`, background: !started || ended ? COLORS.paper : '#fff', color: COLORS.ink, opacity: !started || ended ? 0.5 : 1 }}
              />
              <button
                onClick={start}
                disabled={started || ended}
                style={{ fontFamily: MONO, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, padding: '0 22px', border: 'none', background: COLORS.ember, color: '#fff', cursor: started || ended ? 'default' : 'pointer', opacity: started || ended ? 0.5 : 1 }}
              >
                {ended ? 'Done' : started ? 'Playing' : 'Play'}
              </button>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 12, minHeight: 18, marginBottom: 20, color: hintBad ? COLORS.ember : COLORS.faded }}>{hint}</div>

            <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {answers.map((a, i) => {
                const f = found[i];
                const reveal = ended && !f;
                return (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '13px 16px', border: `1px solid ${f ? COLORS.forest : reveal ? COLORS.ember + '66' : COLORS.faded + '33'}`, marginBottom: 8, background: f ? '#fff' : reveal ? '#fdf0ee' : COLORS.paper, transform: f ? 'translateX(2px)' : 'none', transition: 'all .2s' }}>
                    <span style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 22, width: 30, color: COLORS.ember, flex: 'none', textAlign: 'center' }}>{i + 1}</span>
                    {f || reveal ? (
                      <span style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 500, flex: 1 }}>{a.t}</span>
                    ) : (
                      <span style={{ fontFamily: MONO, fontSize: 13, letterSpacing: '0.06em', color: COLORS.faded, opacity: 0.55, flex: 1 }}>— — — — —</span>
                    )}
                    <span style={{ width: 20, flex: 'none', color: COLORS.forest, opacity: f ? 1 : 0 }}>
                      <Check size={17} strokeWidth={3} />
                    </span>
                  </li>
                );
              })}
            </ol>

            {ended && (
              <div style={{ marginTop: 22, padding: 24, border: `1.5px solid ${COLORS.ink}`, background: COLORS.paper, textAlign: 'center' }}>
                <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLORS.ember, marginBottom: 8 }}>
                  {score === total ? 'Perfect score' : time <= 0 ? 'Time!' : 'Gave up'}
                </div>
                <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 26, lineHeight: 1.1, marginBottom: 10 }}>
                  {score} of {total} · you beat {percentile(score, total)}% of players
                </div>
                <p style={{ fontFamily: SANS, fontSize: 15, color: '#4a4339', maxWidth: 440, margin: '0 auto 18px' }}>
                  {score > quiz.stats.avg ? `You beat the ${quiz.stats.avg} average.` : `The ${quiz.stats.avg} average is the score to beat.`} The titles above are filled in.
                  {quiz.listId ? ' Want the full ranking, with sources and the consensus breakdown?' : ''}
                </p>
                {quiz.listId && (
                  <a
                    href={`/list/${quiz.listId}`}
                    style={{ display: 'inline-block', fontFamily: MONO, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, lineHeight: '46px', padding: '0 28px', background: COLORS.ember, color: '#fff', textDecoration: 'none' }}
                  >
                    See the full list detail →
                  </a>
                )}
              </div>
            )}

            <div style={{ marginTop: 22, display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => endGame(false)} disabled={ended || !started} style={ghostBtn(ended || !started)}>
                <Flag size={12} strokeWidth={2.5} /> Give up &amp; reveal
              </button>
            </div>
          </>
        )}

        {/* ── STATS ── */}
        {tab === 'stats' && (
          <div>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLORS.ember, marginBottom: 14 }}>Your record</div>
            {stats.attempts === 0 ? (
              <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 17, color: COLORS.faded }}>
                Play a round and your stats will show up here. Everything is kept on this device.
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 26 }}>
                <StatBox label="Best score" value={`${stats.best}/${total}`} />
                <StatBox label="Your average" value={`${personalAvg}/${total}`} />
                <StatBox label="Attempts" value={stats.attempts} />
              </div>
            )}
            <div style={{ borderTop: `1px solid ${COLORS.faded}33`, paddingTop: 20 }}>
              <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLORS.faded, marginBottom: 14 }}>Community</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                <StatBox label="Average correct" value={`${quiz.stats.avg}/${total}`} accent />
                <StatBox label="Total plays" value={quiz.stats.plays.toLocaleString()} accent />
              </div>
              <p style={{ fontFamily: SANS, fontSize: 13, color: COLORS.faded, marginTop: 14 }}>
                Community figures are a baseline; wire them to live play data when the quiz backend lands.
              </p>
            </div>
          </div>
        )}

        {/* ── SHARE ── */}
        {tab === 'share' && (
          <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
            <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 19, color: COLORS.ink, maxWidth: 480, margin: '0 auto 20px' }}>
              {ended ? `You named ${score} of ${total}. Challenge someone to beat it.` : 'Send this quiz to someone who thinks they know their airlines.'}
            </p>
            <button onClick={share} style={{ fontFamily: MONO, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, padding: '0 28px', lineHeight: '46px', border: 'none', background: COLORS.ember, color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Share2 size={14} strokeWidth={2.5} /> {copied ? 'Link copied!' : 'Share this quiz'}
            </button>
            <div style={{ fontFamily: MONO, fontSize: 12, color: COLORS.faded, marginTop: 16, wordBreak: 'break-all' }}>{shareUrl}</div>
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}

function ghostBtn(disabled) {
  return {
    fontFamily: MONO,
    fontSize: 11,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontWeight: 600,
    padding: '10px 18px',
    background: 'transparent',
    color: COLORS.faded,
    border: `1px solid ${COLORS.faded}55`,
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  };
}

function StatBox({ label, value, accent }) {
  return (
    <div style={{ background: accent ? COLORS.paper : '#fff', border: `1px solid ${COLORS.faded}33`, padding: '18px 16px', textAlign: 'center' }}>
      <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 30, lineHeight: 1, color: accent ? COLORS.ember : COLORS.ink }}>{value}</div>
      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded, marginTop: 8 }}>{label}</div>
    </div>
  );
}
