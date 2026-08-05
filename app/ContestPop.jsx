'use client';

// Referral contest pop-up: the one interruptive surface for the promo.
//
// Fires ONCE per browser, on first load of a quiz/daily surface while the
// contest is live, and never again once dismissed. It is deliberately the only
// blocking element the promo gets: everything else (the end-card teaser, the
// share pop block, the contest board) is passive and sits where the player was
// already going.
//
// Mounted once in the root layout alongside ShareCreditPop. It renders null in
// every case except a live contest, an eligible country and a browser that has
// not dismissed it, so the cost on a normal page load is one localStorage read.
//
// The CTA routes into the existing share machinery rather than reinventing it:
// a registered player gets ShareCreditPop with their stamped link, and a guest
// gets its sign-up view first. That is the same path the end-card share button
// takes, so there is exactly one join flow to maintain.

import { useEffect, useState } from 'react';
import { X, Trophy, Mail, Globe, Clock, AlertTriangle } from 'lucide-react';
import { T } from '@/lib/theme';
import { CONTEST, COPY, canShowPromo, readGeoCookie } from '@/lib/contest';
import { notifyShareCredit } from './ShareCreditPop';

const INK = T.ink;
const SLATE = T.slate;
const MUTED = T.muted;
const BORD = '#e5e7eb';
const BLUE = T.blue;
const NAVY = T.accent;
const SANS = "'Manrope', system-ui, -apple-system, sans-serif";

// Keyed by contest id, so a FUTURE contest shows again to someone who dismissed
// this one. A single 'seen' flag would silently suppress every promo forever.
const SEEN_KEY = `sot_contest_seen_${CONTEST.id}`;

// Shown at most once a WEEK per browser (owner, 2026-08-05), not once ever.
// Over a 30-day contest a single impression is too few: someone who dismisses
// it on day one never hears about the prize again, and the value stored is the
// timestamp of the last showing rather than a flag, so the next visit AFTER the
// week elapses re-opens it. Roughly four impressions across the contest.
const SEEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// Surfaces the promo belongs on. The pop-up is for players, so it stays off the
// editorial list pages and off admin entirely.
const PROMO_PATHS = [/^\/quizzes/, /^\/quiz\//, /^\/daily/, /^\/player\//];

function onPromoPath(path) {
  return PROMO_PATHS.some((re) => re.test(path || ''));
}

// True while the browser is still inside its one-week quiet period. An
// unparseable or absent value means never shown, so it shows. A read failure
// (private mode) returns true so a browser that cannot remember the dismissal
// is never nagged on every single page load.
function seen() {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (!raw) return false;
    const t = Number(raw);
    if (!Number.isFinite(t)) return false;
    return Date.now() - t < SEEN_TTL_MS;
  } catch {
    return true;
  }
}

function markSeen() {
  try { localStorage.setItem(SEEN_KEY, String(Date.now())); } catch { /* private mode */ }
}

export default function ContestPop() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!onPromoPath(window.location.pathname)) return;
    if (seen()) return;
    if (!canShowPromo({ country: readGeoCookie() })) return;

    // A short beat before showing. Landing straight into a modal reads as an ad
    // and costs the first impression of the game itself; a second of the real
    // page first makes the interruption feel like part of the site.
    const t = setTimeout(() => setOpen(true), 1100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') dismiss(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  function dismiss() {
    markSeen();
    setOpen(false);
  }

  function accept() {
    markSeen();
    setOpen(false);
    // Hand off to the shared share pop: registered players get their stamped
    // link, guests get the sign-up view first and land back on the link.
    notifyShareCredit('', window.location.origin + '/quizzes');
  }

  if (!open) return null;

  const backdrop = {
    position: 'fixed', inset: 0, zIndex: 3200, background: 'rgba(11,12,14,0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '24px 16px', fontFamily: SANS,
  };
  const card = {
    width: '100%', maxWidth: 404, background: T.white, borderRadius: 14,
    overflow: 'hidden', color: INK, position: 'relative',
    boxShadow: '0 18px 50px rgba(15,20,35,0.28)', maxHeight: '92vh', overflowY: 'auto',
  };
  // First place is visually weighted to match the prize split: it carries the
  // brand tint and a larger figure, so the $20 reads as the thing to chase
  // rather than as one of three equal boxes.
  const medal = (color, place, i) => (
    <div
      key={place}
      style={{
        flex: i === 0 ? 1.25 : 1,
        background: i === 0 ? T.accentSoft : '#f7f8fa',
        border: i === 0 ? `1px solid ${T.accentBorder}` : '1px solid transparent',
        borderRadius: 10, padding: '10px 8px', textAlign: 'center',
      }}
    >
      <Trophy size={i === 0 ? 18 : 16} strokeWidth={2.2} color={color} />
      <div style={{ fontSize: 12, fontWeight: 800, marginTop: 2 }}>{place}</div>
      <div style={{ fontSize: i === 0 ? 17 : 13, fontWeight: i === 0 ? 800 : 600, color: i === 0 ? NAVY : MUTED, lineHeight: 1.25 }}>
        {COPY.prizeOrdinal(i)}
      </div>
    </div>
  );
  const row = (Icon, color, children) => (
    <div style={{ display: 'flex', gap: 9, marginBottom: 10, alignItems: 'flex-start' }}>
      <span style={{ color, flexShrink: 0, lineHeight: 1.4, marginTop: 1 }}>
        <Icon size={15} strokeWidth={2.3} />
      </span>
      <div style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.45 }}>{children}</div>
    </div>
  );

  return (
    <div onClick={dismiss} style={backdrop}>
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${COPY.headline}. ${COPY.sub}`}
        style={card}
      >
        <div style={{ background: NAVY, padding: '24px 26px 20px', textAlign: 'center', position: 'relative' }}>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Close"
            style={{ position: 'absolute', top: 10, right: 12, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: 'transparent', border: 0, color: 'rgba(255,255,255,0.65)', cursor: 'pointer' }}
          >
            <X size={18} strokeWidth={2.4} />
          </button>
          <div style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: '#bfdbfe', marginBottom: 9 }}>
            Limited time · {CONTEST.days} days
          </div>
          <div style={{ fontSize: 46, fontWeight: 800, color: T.white, lineHeight: 1.05, letterSpacing: '-.02em' }}>
            {COPY.headline}
          </div>
          <div style={{ fontSize: 14.5, color: '#dbeafe', marginTop: 9, lineHeight: 1.45 }}>{COPY.sub}</div>
        </div>

        <div style={{ padding: '18px 26px 0' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'stretch' }}>
            {[[T.gold, '1st'], [T.silver, '2nd'], [T.bronze, '3rd']]
              .slice(0, CONTEST.winners)
              .map(([c, p], i) => medal(c, p, i))}
          </div>

          <div style={{ background: T.accentSoft, border: `1px solid ${T.accentBorder}`, borderRadius: 10, padding: '11px 13px', marginBottom: 16 }}>
            <div style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: NAVY, marginBottom: 5 }}>How you score</div>
            {/* Sans, not mono: the formula is a sentence the player reads, not
                code, and switching typeface for it made it look like a system
                string rather than part of the offer (owner, 2026-08-05). */}
            <div style={{ fontSize: 13, fontWeight: 800, color: INK, lineHeight: 1.5, letterSpacing: '-.01em' }}>{COPY.formulaLine}</div>
            <div style={{ fontSize: 11.5, color: MUTED, marginTop: 6, lineHeight: 1.45 }}>{COPY.formulaSub}</div>
          </div>

          <div style={{ borderTop: `1px solid ${BORD}`, paddingTop: 13 }}>
            {row(Mail, BLUE, <><b style={{ color: INK, fontWeight: 800 }}>An email on your account is required</b> to be eligible and to get paid.</>)}
            {row(Globe, BLUE, <>Open worldwide. Winners pick <b style={{ color: INK, fontWeight: 800 }}>Venmo, PayPal, bank transfer or gift card</b>.</>)}
            {row(Clock, BLUE, <>Ends <b style={{ color: INK, fontWeight: 800 }}>{CONTEST.deadlineLabel}</b>.</>)}
            {row(AlertTriangle, T.danger, <>Fake or spoofed accounts mean <b style={{ color: INK, fontWeight: 800 }}>disqualification</b>. Referrals are reviewed before payout.</>)}
          </div>
        </div>

        <div style={{ padding: '16px 26px 20px' }}>
          <button
            type="button"
            onClick={accept}
            style={{ width: '100%', background: BLUE, color: T.white, border: `1px solid ${BLUE}`, textAlign: 'center', padding: '13px', borderRadius: 10, fontSize: 15, fontWeight: 800, fontFamily: SANS, cursor: 'pointer' }}
          >
            Get my invite link
          </button>
          <button
            type="button"
            onClick={dismiss}
            style={{ display: 'block', width: '100%', marginTop: 11, background: 'transparent', border: 0, fontSize: 13, fontWeight: 700, color: SLATE, fontFamily: SANS, cursor: 'pointer' }}
          >
            No thanks
          </button>
          <div style={{ textAlign: 'center', marginTop: 13, fontSize: 10.5, color: SLATE, lineHeight: 1.5 }}>
            {COPY.legal}{' '}
            <a href="/quizzes/contest" onClick={markSeen} style={{ color: SLATE, textDecoration: 'underline' }}>Full rules</a>
          </div>
        </div>
      </div>
    </div>
  );
}
