'use client';

// "Put your code on a wall" pop-up: the follow-on to ContestPop.
//
// ContestPop sells the prize and hands the player their invite LINK, which only
// travels online. This one is the offline half, offering a printable QR poster
// for a coffee shop counter, a community board, a classroom or a break room,
// which is the one channel a link in a group chat cannot reach. The pitch is the
// contest itself: a poster in a busy room is a way to WIN, not a favour to the
// site.
//
// This file is ONLY the interruption: when to show, and the modal chrome. The
// pitch, the form and everything the admin receives live in QrPosterForm, which
// the contest board and the share pop-up render too, so the three surfaces can
// never drift apart on the copy or on the payload.
//
// Mounted once in the root layout next to ContestPop. It renders null in every
// case except a live contest, a registered player, and a browser that already
// dealt with the contest pop-up on an earlier visit, so a normal page load costs
// two localStorage reads.

import { useEffect, useState } from 'react';
import { X, QrCode } from 'lucide-react';
import { T } from '@/lib/theme';
import { CONTEST, canShowPromo, readGeoCookie, onPromoPath } from '@/lib/contest';
import { contestSeenAt } from './ContestPop';
import { myRefCode } from '@/lib/referrals';
import QrPosterForm, { qrPosterDone } from './QrPosterForm';

const NAVY = T.accent;
const SANS = "'Manrope', system-ui, -apple-system, sans-serif";

// Keyed by contest id so a FUTURE promo shows again to someone who waved this
// one off. This key is about DISMISSAL; the submission key lives in
// QrPosterForm next to the code that sets it.
const SEEN_KEY = `sot_qr_poster_seen_${CONTEST.id}`;

// Same weekly cadence as ContestPop: a single impression across a 30 day
// contest is too few, and storing "last shown at" rather than a flag is what
// lets it come back once the week is up.
const SEEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// How long after the contest pop-up this one may appear. The owner's rule is
// "next visit", not "next modal", so the gap has to outlast a single sitting
// without pushing a morning player to the following evening. 20 hours does
// both: someone who met the contest pop at 9am Monday sees this one Tuesday
// morning, and nobody ever gets two modals in one session.
const QUIET_MS = 20 * 60 * 60 * 1000;

function seen() {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (!raw) return false;
    const t = Number(raw);
    if (!Number.isFinite(t)) return false;
    return Date.now() - t < SEEN_TTL_MS;
  } catch {
    // A browser that cannot remember a dismissal must never be nagged on every
    // page load, so an unreadable store counts as already seen.
    return true;
  }
}

function markSeen() {
  try { localStorage.setItem(SEEN_KEY, String(Date.now())); } catch { /* private mode */ }
}

export default function QrPosterPop() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!onPromoPath(window.location.pathname)) return;
    if (!canShowPromo({ country: readGeoCookie() })) return;
    // Registered players only. There is no code to put on a poster otherwise,
    // and the offer would be an invitation to sign up, which is the contest
    // pop-up's job. A player who joined moments ago may not have had their code
    // resolved into localStorage yet (ensureMyRefCode runs in VisitorBeacon);
    // they simply get the offer on a later visit, which is the intent anyway.
    if (!myRefCode()) return;
    // The offer only makes sense to someone who has already met the prize.
    const contestAt = contestSeenAt();
    if (!contestAt) return;
    if (Date.now() - contestAt < QUIET_MS) return;
    // Already asked for one, here or on the contest board or from a share
    // pop-up. Interrupting them again would be asking a question they answered.
    if (qrPosterDone()) return;
    if (seen()) return;

    // A beat longer than ContestPop's. This one interrupts a player who is
    // already mid-session rather than one who just landed, so it waits until
    // they have visibly settled into the page.
    const t = setTimeout(() => setOpen(true), 1400);
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

  if (!open) return null;

  const backdrop = {
    position: 'fixed', inset: 0, zIndex: 3200, background: 'rgba(11,12,14,0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '24px 16px', fontFamily: SANS,
  };
  const card = {
    width: '100%', maxWidth: 404, background: T.white, borderRadius: 14,
    overflow: 'hidden', color: T.ink, position: 'relative',
    boxShadow: '0 18px 50px rgba(15,20,35,0.28)', maxHeight: '92vh', overflowY: 'auto',
  };

  return (
    <div onClick={dismiss} style={backdrop}>
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Get a printable QR poster and put your invite code where people will scan it, for a chance at ${CONTEST.prizeLabel}`}
        style={card}
      >
        <div style={{ background: NAVY, padding: '22px 26px 20px', textAlign: 'center', position: 'relative' }}>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Close"
            style={{ position: 'absolute', top: 10, right: 12, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: 'transparent', border: 0, color: 'rgba(255,255,255,0.65)', cursor: 'pointer' }}
          >
            <X size={18} strokeWidth={2.4} />
          </button>
          <div style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: '#bfdbfe', marginBottom: 9 }}>
            Free, and made by hand
          </div>
          <QrCode size={30} strokeWidth={2} color={T.white} />
          <div style={{ fontSize: 30, fontWeight: 800, color: T.white, lineHeight: 1.12, letterSpacing: '-.02em', marginTop: 6 }}>
            Put your code on a wall
          </div>
          <div style={{ fontSize: 14, color: '#dbeafe', marginTop: 9, lineHeight: 1.45 }}>
            A printable poster with your own QR code on it. Everyone who scans it and
            plays counts as your invite.
          </div>
        </div>

        <div style={{ padding: '18px 26px 22px' }}>
          <QrPosterForm dismiss={dismiss} />
        </div>
      </div>
    </div>
  );
}
