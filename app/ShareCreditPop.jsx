'use client';

// Global share-for-credit pop-up.
//
// Every Share button on the site stamps the viewer's referral code onto the
// shared link (lib/referrals.js withRef). When a REGISTERED viewer (one who has
// a code) presses a Share button, this pop-up opens showing THAT link with a
// "Copy link" button, mirroring the share-link display on the quiz page, so the
// person copies their own credit-earning link deliberately.
//
// Wiring: a share handler calls notifyShareCredit(); it returns true when it
// opened the pop-up (registered viewer), letting the handler skip its own
// copy/native-share. For a signed-out visitor it returns false and the normal
// share proceeds unchanged. The pop-up is mounted once in the root layout and
// computes the link itself from the current page URL, so no caller passes it.

import { useEffect, useState } from 'react';
import { X, Check, Copy } from 'lucide-react';
import { myRefCode, withRef } from '@/lib/referrals';

export const SHARE_CREDIT_EVENT = 'sot:share-credit';

export function notifyShareCredit() {
  if (typeof window === 'undefined') return false;
  try {
    if (!myRefCode()) return false;
    window.dispatchEvent(new CustomEvent(SHARE_CREDIT_EVENT));
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
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onEvt = () => {
      let u = '';
      try { u = withRef(window.location.href); } catch (e) { u = ''; }
      setUrl(u);
      setCopied(false);
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

  function copy() {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); }).catch(() => {});
      }
    } catch (e) {}
  }

  function selectAll(e) {
    try {
      const r = document.createRange();
      r.selectNodeContents(e.currentTarget);
      const s = window.getSelection();
      s.removeAllRanges();
      s.addRange(r);
    } catch (_) {}
  }

  if (!open) return null;

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
        style={{ background: '#fff', border: `1px solid ${BORD}`, borderRadius: 16, padding: '24px 24px 20px', maxWidth: 440, width: '100%', color: INK, position: 'relative', boxShadow: '0 18px 50px rgba(15,20,35,0.28)' }}
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
        <p style={{ margin: '0 0 14px', fontSize: 13.5, lineHeight: 1.5, color: SLATE }}>
          This link is yours. Anyone who opens it and finishes a game or quiz credits <b style={{ color: INK }}>you</b> on the community leaderboard, once.
        </p>

        <div
          onClick={selectAll}
          style={{ fontFamily: MONO, fontSize: 12.5, color: INK, background: PAPER, border: `1px solid ${BORD}`, borderRadius: 10, padding: '11px 12px', wordBreak: 'break-all', marginBottom: 12, cursor: 'text' }}
        >
          {url}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <a
            href="/quizzes"
            onClick={() => setOpen(false)}
            style={{ fontSize: 13, fontWeight: 800, color: BLUE, textDecoration: 'none', padding: '10px 14px', borderRadius: 10, border: '1px solid #cfe0fb', background: '#eff4fd', display: 'inline-flex', alignItems: 'center' }}
          >
            See leaderboard
          </a>
          <button
            type="button"
            onClick={copy}
            style={{ fontSize: 13, fontWeight: 800, color: '#fff', background: copied ? '#15803d' : INK, border: `1px solid ${copied ? '#15803d' : INK}`, borderRadius: 10, padding: '10px 18px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7 }}
          >
            {copied ? <><Check size={15} strokeWidth={2.6} /> Copied</> : <><Copy size={15} strokeWidth={2.4} /> Copy link</>}
          </button>
        </div>
      </div>
    </div>
  );
}
