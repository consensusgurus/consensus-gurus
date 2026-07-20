'use client';

import { useEffect, useLayoutEffect, useState, useCallback, useRef } from 'react';
import { Crown, Copy, Check, UserPlus, ArrowRight, X } from 'lucide-react';
import JoinLeaderboardForm from '../quiz/[id]/JoinLeaderboardForm';

// Top Community Member tile on /quizzes. Sits in the row-1 hero slot (it swapped
// places with the Newest tile 2026-07-20), and keeps the .ttile class so the
// shared tile grid + media rules apply.
//
// Shows whoever has brought in the most new players over the rolling window,
// and on hover (or tap, on touch) explains how credit is earned and hands the
// viewer their own share link. See lib/referrals.js for the capture flow.
//
// A visitor with no identity joins IN PLACE via the shared JoinLeaderboardForm
// modal: there is no standalone join page on the site (the form lives as a tab
// inside each board), and /quizzes/leaderboard is a redirect to the Stat Hub,
// so linking anywhere here would dead-end the one action the tile is asking for.

const C = { accent: '#0e1d40', cta: '#e8b43a' };

// The winner's name is the single most emphasised username on the page, so it is
// set as large as will fit rather than at a fixed size: binary-search the largest
// whole pixel size that keeps it on one line inside the tile, re-run on resize.
const NAME_MIN = 17;
const NAME_MAX = 46;
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function useFittedName(text) {
  const wrapRef = useRef(null);
  const textRef = useRef(null);

  const fit = useCallback(() => {
    const wrap = wrapRef.current;
    const el = textRef.current;
    if (!wrap || !el || !text) return;
    const avail = wrap.clientWidth;
    if (!avail) return;
    let lo = NAME_MIN;
    let hi = NAME_MAX;
    let best = NAME_MIN;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      el.style.fontSize = `${mid}px`;
      // +1 absorbs sub-pixel rounding, which otherwise costs a whole step.
      if (el.scrollWidth <= avail + 1) { best = mid; lo = mid + 1; } else { hi = mid - 1; }
    }
    el.style.fontSize = `${best}px`;
  }, [text]);

  useIsoLayoutEffect(() => {
    fit();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(fit);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [fit]);

  // Webfonts land after first paint and change the metrics, so refit once ready.
  useEffect(() => {
    if (typeof document === 'undefined' || !document.fonts?.ready) return;
    document.fonts.ready.then(fit).catch(() => {});
  }, [fit]);

  return { wrapRef, textRef };
}

export default function CommunityTile() {
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [identity, setIdentity] = useState(null);

  const load = useCallback(() => {
    let anon = '';
    try { anon = localStorage.getItem('sot_quiz_anon') || ''; } catch { /* private mode */ }
    return fetch(`/api/quiz/referrals${anon ? `?anonId=${encodeURIComponent(anon)}` : ''}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setData(d); })
      .catch(() => { /* tile falls back to its empty state */ });
  }, []);

  useEffect(() => {
    load();
    try {
      const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null');
      if (id && id.username) setIdentity(id);
    } catch { /* ignore */ }
  }, [load]);

  useEffect(() => {
    if (!joinOpen) return undefined;
    const esc = (e) => { if (e.key === 'Escape') setJoinOpen(false); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [joinOpen]);

  const me = data?.me || null;
  const leader = data?.top?.[0] || null;
  const shareUrl = me?.shareUrl || null;
  const { wrapRef, textRef } = useFittedName(leader?.username || '');

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
      onClick={() => { if (!joinOpen) setOpen((v) => !v); }}
      onMouseLeave={() => setOpen(false)}
    >
      <style>{`
        .cmtile{background:linear-gradient(155deg,#16305e 0%,#0e1d40 62%,#0a1530 100%);cursor:pointer;}
        .cmtile .cm-tag{position:absolute;top:12px;left:12px;font-size:10px;font-weight:800;letter-spacing:.08em;background:#fff;border-radius:10px;padding:4px 10px;z-index:3;color:#0e1d40;display:inline-flex;align-items:center;gap:4px;}
        .cmtile .cm-body{position:relative;z-index:1;padding:18px 16px 15px;}
        .cmtile .cm-namewrap{width:100%;}
        /* Auto-fitted: font-size is set inline by useFittedName. */
        .cmtile .cm-who{display:block;white-space:nowrap;font-size:${NAME_MAX}px;font-weight:800;letter-spacing:-1.1px;line-height:1.02;color:${C.cta};text-shadow:0 2px 14px rgba(0,0,0,.45);}
        .cmtile .cm-sub{font-size:12.5px;font-weight:600;color:rgba(255,255,255,.72);margin-top:7px;}
        .cmtile .cm-foot{display:flex;align-items:center;gap:6px;margin-top:10px;font-size:13px;font-weight:800;color:#fff;}
        .cmtile .cm-panel{position:absolute;inset:0;z-index:4;background:rgba(8,15,35,.97);padding:16px 15px;display:flex;flex-direction:column;gap:7px;opacity:0;pointer-events:none;transition:opacity .16s ease;overflow:auto;}
        .cmtile:hover .cm-panel,.cmtile:focus-within .cm-panel,.cmtile.cm-open .cm-panel{opacity:1;pointer-events:auto;}
        .cmtile .cm-h{font-size:12px;font-weight:800;letter-spacing:.07em;color:${C.cta};text-transform:uppercase;}
        .cmtile .cm-p{font-size:12.5px;line-height:1.42;color:rgba(255,255,255,.86);}
        .cmtile .cm-link{display:flex;align-items:center;gap:6px;margin-top:auto;}
        .cmtile .cm-url{flex:1 1 auto;min-width:0;font-size:11px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#fff;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:7px 9px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .cmtile .cm-copy,.cmtile .cm-join{flex:none;display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:800;color:#0e1d40;background:${C.cta};border:0;border-radius:8px;padding:8px 11px;cursor:pointer;font-family:inherit;}
        .cmtile .cm-join{margin-top:auto;align-self:flex-start;font-size:12.5px;}
        .cm-modal{position:fixed;inset:0;z-index:9999;background:rgba(8,15,35,.62);display:flex;align-items:center;justify-content:center;padding:20px;cursor:default;}
        .cm-modal-card{position:relative;width:100%;max-width:390px;background:#fff;border-radius:16px;padding:22px 20px 20px;max-height:88vh;overflow:auto;}
        .cm-modal-x{position:absolute;top:11px;right:11px;background:none;border:0;padding:5px;cursor:pointer;color:#6b7280;line-height:0;}
      `}</style>

      <span className="cm-tag"><Crown size={11} style={{ verticalAlign: -1, color: '#e8b43a' }} /> TOP COMMUNITY MEMBER</span>

      <div className="cm-body">
        {leader ? (
          <>
            {/* No inline crown here: the tag above already carries one, and dropping
                it gives the name the tile's full width to scale into. */}
            <div className="cm-namewrap" ref={wrapRef}>
              <span className="cm-who" ref={textRef}>{leader.username}</span>
            </div>
            <div className="cm-sub">
              {leader.credits} {leader.credits === 1 ? 'player' : 'players'} brought in over the last 30 days
            </div>
          </>
        ) : (
          <>
            <div className="cm-namewrap" ref={wrapRef}>
              <span className="cm-who" ref={textRef} style={{ fontSize: 24, color: '#fff' }}>This spot is open</span>
            </div>
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
        {shareUrl ? (
          <>
            <div className="cm-p" style={{ color: 'rgba(255,255,255,.6)' }}>
              Your link{typeof me.credits === 'number' ? `, ${me.credits} credited so far` : ''}:
            </div>
            <div className="cm-link">
              <span className="cm-url" title={shareUrl}>{shareUrl.replace(/^https:\/\//, '')}</span>
              <button type="button" className="cm-copy" onClick={copy}>
                {copied ? <Check size={13} /> : <Copy size={13} />}{copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            className="cm-join"
            onClick={(e) => { e.stopPropagation(); setJoinOpen(true); }}
          >
            <UserPlus size={13} /> Register to get your link
          </button>
        )}
      </div>

      {joinOpen && (
        <div className="cm-modal" onClick={(e) => { e.stopPropagation(); setJoinOpen(false); }}>
          <div className="cm-modal-card" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="cm-modal-x" aria-label="Close" onClick={() => setJoinOpen(false)}>
              <X size={17} />
            </button>
            <JoinLeaderboardForm
              hideIcon
              heading="Register to get your share link"
              identity={identity}
              onJoined={(id) => {
                setIdentity(id);
                setJoinOpen(false);
                // Re-read so the freshly minted ref_code and link render at once.
                load();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
