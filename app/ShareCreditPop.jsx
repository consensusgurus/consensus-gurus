'use client';

// Global share-for-credit explainer pop-up.
//
// Every Share button on the site stamps the viewer's referral code onto the
// copied/shared link (see lib/referrals.js withRef). When a REGISTERED viewer
// (one who actually has a code) presses any of those buttons, we surface this
// one-time explainer so they understand the link is theirs and earns them a
// spot on the community leaderboard.
//
// Design: instead of threading modal state through ~15 board components (each
// with its own hooks and early returns), every share handler just calls the
// exported notifyShareCredit(). That fires a window event which THIS component,
// mounted once in the root layout, listens for. notifyShareCredit() self-guards
// on myRefCode(), so a signed-out visitor never sees it and their share keeps
// working unchanged.

import { useEffect, useState } from 'react';
import { X, Check } from 'lucide-react';
import { myRefCode } from '@/lib/referrals';

export const SHARE_CREDIT_EVENT = 'sot:share-credit';

// Call this from any share/copy handler AFTER performing the share. No-ops for a
// signed-out visitor (no referral code), so it is always safe to call blindly.
export function notifyShareCredit() {
  if (typeof window === 'undefined') return;
  try {
    if (!myRefCode()) return;
    window.dispatchEvent(new CustomEvent(SHARE_CREDIT_EVENT));
  } catch (e) {
    /* no localStorage / no CustomEvent: skip the explainer, the share still worked */
  }
}

const INK = '#1c1e24';
const SLATE = '#46506a';
const BORD = '#e7eaf1';
const BLUE = '#2563eb';
const SANS = "'Manrope', system-ui, -apple-system, sans-serif";

export default function ShareCreditPop() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onEvt = () => setOpen(true);
    window.addEventListener(SHARE_CREDIT_EVENT, onEvt);
    return () => window.removeEventListener(SHARE_CREDIT_EVENT, onEvt);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

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
        aria-label="Sharing for credit"
        style={{ background: '#fff', border: `1px solid ${BORD}`, borderRadius: 16, padding: '24px 24px 20px', maxWidth: 420, width: '100%', color: INK, position: 'relative', boxShadow: '0 18px 50px rgba(15,20,35,0.28)' }}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          style={{ position: 'absolute', top: 12, right: 12, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 9, background: '#fff', border: `1px solid ${BORD}`, color: SLATE, cursor: 'pointer' }}
        >
          <X size={18} strokeWidth={2.4} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ width: 34, height: 34, borderRadius: '50%', background: '#e8f5ec', color: '#15803d', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Check size={20} strokeWidth={2.6} />
          </span>
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.02em' }}>Your unique link is ready</span>
        </div>

        <p style={{ margin: '0 0 10px', fontSize: 14, lineHeight: 1.5, color: SLATE }}>
          You just shared your own <b style={{ color: INK }}>personal link</b>. Anyone who opens it and finishes a game or quiz credits <b style={{ color: INK }}>you</b> on the community leaderboard, once.
        </p>
        <p style={{ margin: '0 0 16px', fontSize: 14, lineHeight: 1.5, color: SLATE }}>
          Paste it anywhere you share. The more players you bring in, the higher you climb.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <a
            href="/quizzes"
            onClick={() => setOpen(false)}
            style={{ fontSize: 13, fontWeight: 800, color: BLUE, textDecoration: 'none', padding: '10px 14px', borderRadius: 10, border: '1px solid #cfe0fb', background: '#eff4fd' }}
          >
            See leaderboard
          </a>
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{ fontSize: 13, fontWeight: 800, color: '#fff', background: INK, border: `1px solid ${INK}`, borderRadius: 10, padding: '10px 18px', cursor: 'pointer' }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
