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
        {/* Responsive via CSS, not a JS breakpoint hook: the table must be
            correct in the very first paint, and a hook would render the desktop
            layout once before correcting itself.

            The bug this fixes: tableLayout:'fixed' with five fixed columns
            (38+74+84+64+74 = 334px) left about 5px for the name on a 375px
            phone, so the username was invisible. Under 640px the three
            breakdown columns are dropped from the row and reappear as a line
            under the name, which is also how the community page shows them. */}
        <style>{`
          .cb-tbl{width:100%;border-collapse:collapse;table-layout:fixed;}
          .cb-tbl td,.cb-tbl th{padding:9px 0;}
          .cb-rk{width:38px;font-size:13px;font-weight:800;}
          .cb-nm{font-size:13.5px;font-weight:600;color:${T.ink};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
          .cb-tbl tr.lead .cb-nm{font-weight:800;}
          .cb-n{width:74px;font-size:13px;color:${T.muted};text-align:right;}
          .cb-n.wide{width:84px;}
          .cb-n.narrow{width:64px;}
          .cb-sc{width:74px;font-size:13.5px;font-weight:800;color:${T.ink};text-align:right;}
          .cb-sub{display:none;margin-top:2px;font-size:11.5px;font-weight:600;color:${T.slate};white-space:normal;}
          @media(max-width:640px){
            .cb-hide{display:none;}
            .cb-nm{white-space:normal;}
            .cb-sub{display:block;}
            .cb-sc{width:64px;}
          }
        `}</style>
        <table className="cb-tbl">
          <thead>
            <tr>
              <th className="cb-rk" style={{ ...th, textAlign: 'left' }}>#</th>
              <th style={{ ...th, textAlign: 'left' }}>Player</th>
              <th className="cb-n cb-hide" style={th}>Players</th>
              <th className="cb-n wide cb-hide" style={th}>Sessions</th>
              <th className="cb-n narrow cb-hide" style={th}>Plays</th>
              <th className="cb-sc" style={th}>Score</th>
            </tr>
          </thead>
          <tbody>
            {board.map((r, i) => (
              <tr key={r.refCode || i} className={i === 0 ? 'lead' : undefined} style={{ borderTop: '1px solid #eef1f5' }}>
                <td className="cb-rk" style={{ color: i < 3 ? MEDAL[i] : T.slate }}>{i + 1}</td>
                <td>
                  <div className="cb-nm">{r.username}</div>
                  <div className="cb-sub">{r.users} players · {r.sessions} sessions · {r.plays} plays</div>
                </td>
                <td className="cb-n cb-hide">{r.users}</td>
                <td className="cb-n wide cb-hide">{r.sessions}</td>
                <td className="cb-n narrow cb-hide">{r.plays}</td>
                <td className="cb-sc">{formatScore(r.score)}</td>
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
