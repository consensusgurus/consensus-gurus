'use client';

// Global share-for-credit pop-up.
//
// Every Share button on the site stamps the viewer's referral code onto the
// shared link (lib/referrals.js withRef). When a REGISTERED viewer presses a
// Share button, this pop-up opens with their credit-earning link and a Copy
// button. Where the caller has a result/status message (a finished quiz score,
// a daily game's emoji recap), it passes that text too and the pop-up offers a
// SECOND copy option: the full "result + link", stacked above the plain link.
//
// Wiring: a share handler calls notifyShareCredit(resultText?). It returns true
// when it opened the pop-up (registered viewer), letting the handler skip its
// own copy/native-share. For a signed-out visitor it returns false and the
// normal share proceeds. The pop-up is mounted once in the root layout and
// derives the link itself from the current page URL.

import { useEffect, useState } from 'react';
import { X, Check, Copy } from 'lucide-react';
import { myRefCode, withRef } from '@/lib/referrals';

export const SHARE_CREDIT_EVENT = 'sot:share-credit';

export function notifyShareCredit(resultText) {
  if (typeof window === 'undefined') return false;
  try {
    if (!myRefCode()) return false;
    const detail = { resultText: typeof resultText === 'string' ? resultText : '' };
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
  const [link, setLink] = useState('');
  const [result, setResult] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    const onEvt = (e) => {
      let u = '';
      try { u = withRef(window.location.href); } catch (err) { u = ''; }
      const rt = (e && e.detail && typeof e.detail.resultText === 'string') ? e.detail.resultText.trim() : '';
      setLink(u);
      setResult(rt && rt !== u ? rt : '');
      setCopiedKey(null);
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
    <div
      onClick={() => setOpen(false)}
      style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(20,22,28,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: SANS }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Your share link"
        style={{ background: '#fff', border: `1px solid ${BORD}`, borderRadius: 16, padding: '24px 24px 20px', maxWidth: 460, width: '100%', color: INK, position: 'relative', boxShadow: '0 18px 50px rgba(15,20,35,0.28)' }}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          style={{ position: 'absolute', top: 12, right: 12, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 9, background: '#fff', border: `1px solid ${BORD}`, color: SLATE, cursor: 'pointer' }}
        >
          <X size={18} strokeWidth={2.4} />
        </button>

        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.02em', marginBottom: 8 }}>Your share link</div>
        <p style={{ margin: '0 0 16px', fontSize: 13.5, lineHeight: 1.5, color: SLATE }}>
          This link is yours. Anyone who opens it and finishes a game or quiz credits <b style={{ color: INK }}>you</b> on the community leaderboard, once.
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

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <a
            href="/quizzes"
            onClick={() => setOpen(false)}
            style={{ fontSize: 13, fontWeight: 800, color: BLUE, textDecoration: 'none', padding: '9px 14px', borderRadius: 10, border: '1px solid #cfe0fb', background: '#eff4fd', display: 'inline-flex', alignItems: 'center' }}
          >
            See leaderboard
          </a>
        </div>
      </div>
    </div>
  );
}
