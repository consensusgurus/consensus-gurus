'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Crown, Copy, Check, UserPlus, ArrowRight } from 'lucide-react';

// Top Community Member tile on /quizzes. Occupies the slot the Trending tile
// used to hold, so it keeps the .ttile class for the row's grid + media rules.
//
// Shows whoever has brought in the most new players over the rolling window,
// and on hover (or tap, on touch) explains how credit is earned and hands the
// viewer their own share link. See lib/referrals.js for the capture flow.

const C = { accent: '#0e1d40', cta: '#e8b43a', line: 'rgba(20,22,28,0.09)' };

export default function CommunityTile() {
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    let anon = '';
    try { anon = localStorage.getItem('sot_quiz_anon') || ''; } catch { /* private mode */ }
    fetch(`/api/quiz/referrals${anon ? `?anonId=${encodeURIComponent(anon)}` : ''}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive && d) setData(d); })
      .catch(() => { /* tile falls back to its empty state */ });
    return () => { alive = false; };
  }, []);

  const me = data?.me || null;
  const leader = data?.top?.[0] || null;
  const shareUrl = me?.shareUrl || null;

  const copy = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked: the link is selectable in the panel */ }
  }, [shareUrl]);

  return (
    <div
      className={`ttile cmtile${open ? ' cm-open' : ''}`}
      onClick={() => setOpen((v) => !v)}
      onMouseLeave={() => setOpen(false)}
    >
      <style>{`
        .cmtile{background:linear-gradient(155deg,#16305e 0%,#0e1d40 62%,#0a1530 100%);cursor:pointer;}
        .cmtile .cm-tag{position:absolute;top:12px;left:12px;font-size:10px;font-weight:800;letter-spacing:.08em;background:#fff;border-radius:10px;padding:4px 10px;z-index:3;color:#0e1d40;display:inline-flex;align-items:center;gap:4px;}
        .cmtile .cm-body{position:relative;z-index:1;padding:18px 16px 15px;}
        .cmtile .cm-who{font-size:20px;font-weight:800;letter-spacing:-.3px;line-height:1.1;color:#fff;display:flex;align-items:center;gap:7px;}
        .cmtile .cm-sub{font-size:12.5px;font-weight:600;color:rgba(255,255,255,.72);margin-top:6px;}
        .cmtile .cm-foot{display:flex;align-items:center;gap:6px;margin-top:10px;font-size:13px;font-weight:800;color:#fff;}
        .cmtile .cm-panel{position:absolute;inset:0;z-index:4;background:rgba(8,15,35,.97);padding:16px 15px;display:flex;flex-direction:column;gap:7px;opacity:0;pointer-events:none;transition:opacity .16s ease;overflow:auto;}
        .cmtile:hover .cm-panel,.cmtile:focus-within .cm-panel,.cmtile.cm-open .cm-panel{opacity:1;pointer-events:auto;}
        .cmtile .cm-h{font-size:12px;font-weight:800;letter-spacing:.07em;color:${C.cta};text-transform:uppercase;}
        .cmtile .cm-p{font-size:12.5px;line-height:1.42;color:rgba(255,255,255,.86);}
        .cmtile .cm-link{display:flex;align-items:center;gap:6px;margin-top:auto;}
        .cmtile .cm-url{flex:1 1 auto;min-width:0;font-size:11px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#fff;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:7px 9px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .cmtile .cm-copy{flex:none;display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:800;color:#0e1d40;background:${C.cta};border:0;border-radius:8px;padding:8px 11px;cursor:pointer;}
        .cmtile .cm-join{display:inline-flex;align-items:center;gap:6px;margin-top:auto;font-size:12.5px;font-weight:800;color:#0e1d40;background:${C.cta};border-radius:8px;padding:8px 11px;text-decoration:none;align-self:flex-start;}
      `}</style>

      <span className="cm-tag"><Crown size={11} style={{ verticalAlign: -1, color: '#e8b43a' }} /> TOP COMMUNITY MEMBER</span>

      <div className="cm-body">
        {leader ? (
          <>
            <div className="cm-who"><Crown size={17} style={{ color: C.cta, flex: 'none' }} />{leader.username}</div>
            <div className="cm-sub">
              {leader.credits} {leader.credits === 1 ? 'player' : 'players'} brought in over the last 30 days
            </div>
          </>
        ) : (
          <>
            <div className="cm-who">This spot is open</div>
            <div className="cm-sub">Nobody has brought in a player yet this month.</div>
          </>
        )}
        <div className="cm-foot">How to get credit <ArrowRight size={13} style={{ verticalAlign: -1 }} /></div>
      </div>

      <div className="cm-panel">
        <div className="cm-h">How to get credit</div>
        <div className="cm-p">
          Registered users get a unique share link that credits them. Anyone who opens
          your link and finishes a quiz or a daily game counts toward your total, once.
        </div>
        {me?.shareUrl ? (
          <>
            <div className="cm-p" style={{ color: 'rgba(255,255,255,.6)' }}>
              Your link{typeof me.credits === 'number' ? `, ${me.credits} credited so far` : ''}:
            </div>
            <div className="cm-link">
              <span className="cm-url" title={me.shareUrl}>{me.shareUrl.replace(/^https:\/\//, '')}</span>
              <button type="button" className="cm-copy" onClick={copy}>
                {copied ? <Check size={13} /> : <Copy size={13} />}{copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </>
        ) : (
          <Link href="/quizzes/leaderboard" className="cm-join" onClick={(e) => e.stopPropagation()}>
            <UserPlus size={13} /> Join the leaderboard to get your link
          </Link>
        )}
      </div>
    </div>
  );
}
