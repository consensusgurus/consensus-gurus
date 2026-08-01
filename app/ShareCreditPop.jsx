'use client';

// Global share-for-credit pop-up.
//
// Every Share button on the site says "(for credit)" and, on click, opens THIS
// pop-up (mounted once in the root layout) instead of copying directly.
//   - Registered viewer (has a referral code): the pop-up shows their credit
//     link with Copy buttons — "Result + link" (the game status / quiz score,
//     which already carries their ref link) and "Just the link".
//   - Signed-out viewer: the pop-up first shows the Join-the-Leaderboard sign-up
//     inputs. After they sign up we resolve their new referral code and switch
//     to the credit-link view.
//
// Wiring: a share handler calls notifyShareCredit(resultText?), which ALWAYS
// returns true on the client (the pop-up handles the share for everyone), so
// the handler skips its own copy/native-share. The pop-up derives the link
// itself from the current page URL.

import { useEffect, useState } from 'react';
import { X, Check, Copy } from 'lucide-react';
import { myRefCode, withRef, ensureMyRefCode } from '@/lib/referrals';
import JoinLeaderboardForm from './quiz/[id]/JoinLeaderboardForm';

export const SHARE_CREDIT_EVENT = 'sot:share-credit';

export function notifyShareCredit(resultText, url) {
  if (typeof window === 'undefined') return false;
  try {
    const detail = {
      resultText: typeof resultText === 'string' ? resultText : '',
      url: typeof url === 'string' && url ? url : '',
    };
    window.dispatchEvent(new CustomEvent(SHARE_CREDIT_EVENT, { detail }));
    return true;
  } catch (e) {
    return false;
  }
}

const INK = '#1c1e24';
const SLATE = '#46506a';
const BORD = '#e7eaf1';
const BLUE = '#2563eb';
const PAPER = '#f4f6fa';
const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";

export default function ShareCreditPop() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('credit'); // 'credit' | 'signup'
  const [link, setLink] = useState('');
  const [result, setResult] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);
  const [srcUrl, setSrcUrl] = useState(''); // page the credit link should point at

  useEffect(() => {
    const onEvt = (e) => {
      // A caller can name the page the link should point at; share buttons that
      // sit somewhere other than the thing being shared (the daily board's
      // expanded tile shares a game from the quizzes home) pass it. Everyone
      // else omits it and gets the current page, exactly as before.
      const raw = (e && e.detail && e.detail.url) ? e.detail.url : window.location.href;
      let u = '';
      try { u = withRef(raw); } catch (err) { u = ''; }
      setSrcUrl(raw);
      const rt = (e && e.detail && typeof e.detail.resultText === 'string') ? e.detail.resultText.trim() : '';
      const registered = !!myRefCode();
      setLink(u);
      setResult(registered && rt && rt !== u ? rt : '');
      setCopiedKey(null);
      setMode(registered ? 'credit' : 'signup');
      setOpen(true);
    };
    window.addEventListener(SHARE_CREDIT_EVENT, onEvt);
    return () => window.removeEventListener(SHARE_CREDIT_EVENT, onEvt);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  async function handleJoined() {
    // The result text captured before sign-up embeds an UN-stamped link (the
    // viewer had no code yet), so drop it and show only the freshly-stamped
    // credit link. Resolve the new code first so withRef includes it.
    try { await ensureMyRefCode(); } catch (e) {}
    let u = '';
    try { u = withRef(srcUrl || window.location.href); } catch (err) { u = ''; }
    setLink(u);
    setResult('');
    setCopiedKey(null);
    setMode('credit');
  }

  function copyText(txt, key) {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(txt).then(() => {
          setCopiedKey(key);
          setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1600);
        }).catch(() => {});
      }
    } catch (e) {}
  }

  if (!open) return null;

  const backdrop = { position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(20,22,28,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: SANS };
  const card = { background: '#fff', border: `1px solid ${BORD}`, borderRadius: 16, padding: '24px 24px 20px', maxWidth: 460, width: '100%', color: INK, position: 'relative', boxShadow: '0 18px 50px rgba(15,20,35,0.28)', maxHeight: '90vh', overflowY: 'auto' };
  const closeBtn = (
    <button type="button" onClick={() => setOpen(false)} aria-label="Close" style={{ position: 'absolute', top: 12, right: 12, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 9, background: '#fff', border: `1px solid ${BORD}`, color: SLATE, cursor: 'pointer', zIndex: 2 }}>
      <X size={18} strokeWidth={2.4} />
    </button>
  );

  if (mode === 'signup') {
    return (
      <div onClick={() => setOpen(false)} style={backdrop}>
        <div onClick={(e) => e.stopPropagation()} style={card}>
          {closeBtn}
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.02em', marginBottom: 8, paddingRight: 28 }}>Share for credit</div>
          <p style={{ margin: '0 0 18px', fontSize: 13.5, lineHeight: 1.5, color: SLATE }}>
            Sign up (no password) to get your own share link. Anyone who opens it and finishes a game or quiz credits <b style={{ color: INK }}>you</b> on the community leaderboard.
          </p>
          <JoinLeaderboardForm identity={null} heading="Sign up" hideIcon onJoined={handleJoined} />
        </div>
      </div>
    );
  }

  const copyBtn = (txt, key) => (
    <button
      type="button"
      onClick={() => copyText(txt, key)}
      style={{ flexShrink: 0, alignSelf: 'stretch', fontSize: 13, fontWeight: 800, color: '#fff', background: copiedKey === key ? '#15803d' : INK, border: `1px solid ${copiedKey === key ? '#15803d' : INK}`, borderRadius: 10, padding: '0 16px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap' }}
    >
      {copiedKey === key ? <><Check size={15} strokeWidth={2.6} /> Copied</> : <><Copy size={15} strokeWidth={2.4} /> Copy</>}
    </button>
  );
  const rowLabel = (t) => (
    <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 500, letterSpacing: '.12em', textTransform: 'uppercase', color: SLATE, margin: '0 0 6px' }}>{t}</div>
  );
  const boxStyle = { flex: 1, minWidth: 0, fontFamily: MONO, fontSize: 12.5, color: INK, background: PAPER, border: `1px solid ${BORD}`, borderRadius: 10, padding: '10px 12px', wordBreak: 'break-word' };

  return (
    <div onClick={() => setOpen(false)} style={backdrop}>
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Your share link" style={card}>
        {closeBtn}
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.02em', marginBottom: 8, paddingRight: 28 }}>Your share link</div>
        <p style={{ margin: '0 0 16px', fontSize: 13.5, lineHeight: 1.5, color: SLATE }}>
          This link is yours. Anyone who opens it and finishes a game or quiz credits <b style={{ color: INK }}>you</b> on the community leaderboard, once.
          {' '}<b style={{ color: INK }}>I&rsquo;m a one person startup! Please help us grow!</b>
        </p>

        {result ? (
          <>
            <div style={{ marginBottom: 14 }}>
              {rowLabel('Result + link')}
              <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
                <div style={{ ...boxStyle, whiteSpace: 'pre-wrap', maxHeight: 132, overflowY: 'auto' }}>{result}</div>
                {copyBtn(result, 'result')}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              {rowLabel('Just the link')}
              <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
                <div style={boxStyle}>{link}</div>
                {copyBtn(link, 'link')}
              </div>
            </div>
          </>
        ) : (
          <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'stretch' }}>
            <div style={boxStyle}>{link}</div>
            {copyBtn(link, 'link')}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
          <a href="/quizzes/community" onClick={() => setOpen(false)} style={{ fontSize: 13, fontWeight: 800, color: SLATE, textDecoration: 'none', padding: '9px 14px', borderRadius: 10, border: `1px solid ${BORD}`, background: '#fff', display: 'inline-flex', alignItems: 'center' }}>Community leaderboard</a>
        </div>
      </div>
    </div>
  );
}
