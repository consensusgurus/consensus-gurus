'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Crown, Copy, Check, UserPlus, Users } from 'lucide-react';
import QuizNavHeader from '../QuizNavHeader';
import JoinLeaderboardForm from '../../quiz/[id]/JoinLeaderboardForm';
import Grain from '../../Grain';
import Footer from '../../Footer';

// Public referral board. The Top Community Member tile on the home hub shows only
// the winner and the two runners-up; this is the full ranking behind it, plus the
// viewer's own standing and share link.

const C = {
  bg: '#f7f8fa', surface: '#fff', ink: '#1c1e24', muted: '#6b7280',
  soft: '#6b7280', line: 'rgba(20,22,28,0.09)', accent: '#0e1d40', cta: '#e8b43a',
};
const MEDAL = ['#e8b43a', '#b8bcc4', '#c8814b'];
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";

const WINDOWS = [
  { key: 90, label: 'Last 90 days' },
  { key: 36500, label: 'All time' },
];

export default function CommunityLeaderboardClient() {
  const [days, setDays] = useState(90);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [identity, setIdentity] = useState(null);

  const load = useCallback((d) => {
    setLoading(true);
    // The email travels with the anon so the board recognises the viewer on a
    // second device; quiz_users.anon_id only ever holds their first browser.
    const qs = new URLSearchParams({ days: String(d), limit: '100' });
    try {
      const anon = localStorage.getItem('sot_quiz_anon') || '';
      if (anon) qs.set('anonId', anon);
      const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null');
      if (id && id.email) qs.set('email', id.email);
    } catch { /* private mode */ }
    return fetch(`/api/quiz/referrals?${qs}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (j) setData(j); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(days); }, [days, load]);
  useEffect(() => {
    try {
      const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null');
      if (id && id.username) setIdentity(id);
    } catch { /* ignore */ }
  }, []);

  const me = data?.me || null;
  const rows = data?.top || [];
  const myRank = me ? rows.findIndex((r) => r.refCode && me.code && r.refCode === me.code) : -1;

  const copy = useCallback(async () => {
    if (!me?.shareUrl) return;
    try {
      await navigator.clipboard.writeText(me.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked; the link is selectable */ }
  }, [me]);

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: FONT, color: C.ink }}>
      <Grain />
      <QuizNavHeader />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '12px 20px 70px', position: 'relative' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: C.muted, textDecoration: 'none', margin: '10px 0 16px' }}>
          <ArrowLeft size={14} /> Back to all quizzes
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Users size={22} style={{ color: C.accent }} />
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '-0.6px' }}>Community Leaderboard</h1>
        </div>
        <p style={{ margin: '0 0 4px', fontSize: 14.5, lineHeight: 1.5, color: C.muted, maxWidth: 620 }}>
          The players bringing the most new people to Source of Truths. I&apos;m a single person
          startup, so word of mouth is how this grows.
        </p>
        <p style={{ margin: '0 0 18px', fontSize: 13.5, lineHeight: 1.5, color: C.soft, maxWidth: 620 }}>
          Registered players get a unique share link, and the Share button on every quiz and daily
          game already includes it. Anyone who opens one and finishes a game counts once.
        </p>

        {/* Your standing + link */}
        <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16, marginBottom: 18 }}>
          {me ? (
            <>
              <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.soft, fontWeight: 800, marginBottom: 8 }}>Your standing</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                <span style={{ fontSize: 22, fontWeight: 800 }}>{me.username}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.muted }}>
                  {me.credits} brought in{myRank >= 0 ? ` · #${myRank + 1}` : ''}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <code style={{ flex: '1 1 260px', minWidth: 0, fontSize: 12.5, background: '#f2f4f7', border: `1px solid ${C.line}`, borderRadius: 9, padding: '9px 11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {me.shareUrl}
                </code>
                <button type="button" onClick={copy} style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: FONT, fontSize: 13, fontWeight: 800, color: C.ink, background: C.cta, border: 0, borderRadius: 9, padding: '10px 14px', cursor: 'pointer' }}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}{copied ? 'Copied' : 'Copy link'}
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 300px', fontSize: 14, color: C.muted }}>
                Register to get your own share link and appear on this board.
              </div>
              <button type="button" onClick={() => setJoinOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: FONT, fontSize: 13, fontWeight: 800, color: C.ink, background: C.cta, border: 0, borderRadius: 9, padding: '10px 14px', cursor: 'pointer' }}>
                <UserPlus size={14} /> Register
              </button>
            </div>
          )}
        </div>

        {/* Window toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {WINDOWS.map((w) => (
            <button
              key={w.key}
              type="button"
              onClick={() => setDays(w.key)}
              style={{
                fontFamily: FONT, fontSize: 12.5, fontWeight: 800, cursor: 'pointer',
                padding: '7px 13px', borderRadius: 999,
                border: `1px solid ${days === w.key ? C.accent : C.line}`,
                background: days === w.key ? C.accent : C.surface,
                color: days === w.key ? '#fff' : C.muted,
              }}
            >
              {w.label}
            </button>
          ))}
        </div>

        {/* The board */}
        <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, overflow: 'hidden' }}>
          {loading && !rows.length ? (
            <div style={{ padding: 26, textAlign: 'center', color: C.soft, fontSize: 14 }}>Loading…</div>
          ) : rows.length ? (
            rows.map((r, i) => {
              const mine = me && me.code && r.refCode === me.code;
              return (
                <div
                  key={r.refCode || r.username || i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '11px 15px',
                    borderTop: i ? `1px solid ${C.line}` : 'none',
                    background: mine ? 'rgba(232,180,58,0.10)' : 'transparent',
                  }}
                >
                  <span style={{
                    flex: 'none', width: 26, height: 26, borderRadius: '50%',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 800,
                    background: i < 3 ? MEDAL[i] : '#eef0f4',
                    color: i < 3 ? '#1a1408' : C.muted,
                  }}>{i + 1}</span>
                  {i === 0 ? <Crown size={16} style={{ flex: 'none', color: MEDAL[0] }} /> : null}
                  <span style={{ flex: '1 1 auto', minWidth: 0, fontWeight: 700, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.username}{mine ? <span style={{ color: C.soft, fontWeight: 700, fontSize: 12 }}> · you</span> : null}
                  </span>
                  <span style={{ flex: 'none', fontWeight: 800, fontSize: 15, fontVariantNumeric: 'tabular-nums' }}>{r.credits}</span>
                  <span style={{ flex: 'none', fontSize: 11.5, color: C.soft, fontWeight: 700 }}>
                    {r.credits === 1 ? 'player' : 'players'}
                  </span>
                </div>
              );
            })
          ) : (
            <div style={{ padding: 26, textAlign: 'center', color: C.soft, fontSize: 14 }}>
              Nobody has brought in a player yet in this window. The top spot is open.
            </div>
          )}
        </div>
      </div>

      {joinOpen && (
        <div
          onClick={() => setJoinOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(14,29,64,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: 390, maxWidth: '100%', background: '#fff', borderRadius: 16, padding: '22px 20px 20px', maxHeight: '88vh', overflow: 'auto' }}>
            <JoinLeaderboardForm
              hideIcon
              heading="Register to get your share link"
              identity={identity}
              onJoined={(id) => { setIdentity(id); setJoinOpen(false); load(days); }}
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
