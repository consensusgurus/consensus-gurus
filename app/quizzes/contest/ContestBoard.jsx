'use client';

// The full contest board, plus the viewer's own row and invite link.
//
// Split out of page.js so the rules stay server-rendered (they need to be in
// the HTML for anyone reading or citing the terms) while only the live figures
// hydrate. Reads /api/quiz/contest, which is the same endpoint the rail panel
// and the pop-up use, so all three can never disagree on a standing.

import { useEffect, useState, useCallback } from 'react';
import { Copy, Check, UserPlus } from 'lucide-react';
import { T } from '@/lib/theme';
import { CONTEST, COPY, formatScore } from '@/lib/contest';
import JoinLeaderboardForm from '../../quiz/[id]/JoinLeaderboardForm';

const MEDAL = [T.gold, T.silver, T.bronze];

export default function ContestBoard() {
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const load = useCallback(() => {
    const qs = new URLSearchParams({ limit: '50' });
    try {
      const anon = localStorage.getItem('sot_quiz_anon') || '';
      if (anon) qs.set('anonId', anon);
      const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null');
      if (id && id.email) qs.set('email', id.email);
    } catch { /* private mode */ }
    return fetch(`/api/quiz/contest?${qs}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setData(d); })
      .catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const board = (data && data.board) || [];
  const me = data && data.me;
  const meta = (data && data.contest) || {};

  function copyLink() {
    if (!me || !me.shareUrl) return;
    try {
      navigator.clipboard.writeText(me.shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }).catch(() => {});
    } catch { /* no clipboard */ }
  }

  const card = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '18px 20px', marginBottom: 16 };
  const th = { fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', color: T.slate, fontWeight: 700, textAlign: 'right', padding: '0 0 8px' };

  return (
    <>
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, letterSpacing: '-.01em', color: T.ink }}>Your standing</h2>
          {meta.live ? <span style={{ fontSize: 12, fontWeight: 700, color: T.slate }}>{meta.daysLeft} days left</span> : null}
        </div>

        {me ? (
          <>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', margin: '12px 0 14px' }}>
              {[
                ['Score', formatScore(me.score)],
                ['Rank', me.rank ? `#${me.rank}` : '--'],
                ['Players', me.users],
                ['Sessions', me.sessions],
                ['Plays', me.plays],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', color: T.slate, fontWeight: 700 }}>{k}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: T.ink, lineHeight: 1.2 }}>{v}</div>
                </div>
              ))}
            </div>
            {me.carryIn ? (
              <p style={{ fontSize: 12, color: T.slate, margin: '0 0 12px', lineHeight: 1.5 }}>
                Includes {formatScore(me.carryIn)} carried in from referrals before the contest started,
                plus {formatScore(me.earned)} earned since.
              </p>
            ) : null}
            {!me.eligible ? (
              <p style={{ fontSize: 12.5, color: T.danger, margin: '0 0 12px', lineHeight: 1.5, fontWeight: 700 }}>
                Your account has no email on it, so you are not currently eligible for the prize.
                Add one and your existing referrals still count.
              </p>
            ) : null}
            <button
              type="button"
              onClick={copyLink}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 800, color: '#fff', background: copied ? T.successDeep : T.cta, border: 0, borderRadius: 10, padding: '11px 16px', cursor: 'pointer' }}
            >
              {copied ? <><Check size={15} strokeWidth={2.6} /> Copied</> : <><Copy size={15} strokeWidth={2.4} /> Copy my invite link</>}
            </button>
          </>
        ) : joinOpen ? (
          <div style={{ marginTop: 12 }}>
            <JoinLeaderboardForm identity={null} heading="Sign up" hideIcon onJoined={() => { setJoinOpen(false); load(); }} />
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13.5, color: T.muted, margin: '8px 0 12px', lineHeight: 1.5 }}>
              Sign up to get your invite link. No password, and an email is what makes you eligible for the prize.
            </p>
            <button
              type="button"
              onClick={() => setJoinOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 800, color: '#fff', background: T.cta, border: 0, borderRadius: 10, padding: '11px 16px', cursor: 'pointer' }}
            >
              <UserPlus size={15} strokeWidth={2.4} /> Get my invite link
            </button>
          </>
        )}
      </div>

      <div style={card}>
        <h2 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 2px', letterSpacing: '-.01em', color: T.ink }}>Leaderboard</h2>
        <p style={{ fontSize: 12.5, color: T.slate, margin: '0 0 12px' }}>{COPY.formulaLine}</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ ...th, textAlign: 'left', width: 38 }}>#</th>
              <th style={{ ...th, textAlign: 'left' }}>Player</th>
              <th style={{ ...th, width: 74 }}>Players</th>
              <th style={{ ...th, width: 84 }}>Sessions</th>
              <th style={{ ...th, width: 64 }}>Plays</th>
              <th style={{ ...th, width: 74 }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {board.map((r, i) => (
              <tr key={r.refCode || i} style={{ borderTop: '1px solid #eef1f5' }}>
                <td style={{ padding: '9px 0', fontSize: 13, fontWeight: 800, color: i < 3 ? MEDAL[i] : T.slate }}>{i + 1}</td>
                <td style={{ padding: '9px 0', fontSize: 13.5, fontWeight: i === 0 ? 800 : 600, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.username}</td>
                <td style={{ padding: '9px 0', fontSize: 13, color: T.muted, textAlign: 'right' }}>{r.users}</td>
                <td style={{ padding: '9px 0', fontSize: 13, color: T.muted, textAlign: 'right' }}>{r.sessions}</td>
                <td style={{ padding: '9px 0', fontSize: 13, color: T.muted, textAlign: 'right' }}>{r.plays}</td>
                <td style={{ padding: '9px 0', fontSize: 13.5, fontWeight: 800, color: T.ink, textAlign: 'right' }}>{formatScore(r.score)}</td>
              </tr>
            ))}
            {!board.length ? (
              <tr><td colSpan={6} style={{ padding: '16px 0', fontSize: 13, color: T.slate }}>
                No entries yet. Share your link and you are in first place.
              </td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
