'use client';

// "Put your code on a wall" pop-up: the follow-on to ContestPop.
//
// ContestPop sells the prize and hands the player their invite LINK, which only
// travels online. This one is the offline half, offering a printable QR poster
// for a coffee shop counter, a community board, a classroom or a break room, which
// is the one channel a link in a group chat cannot reach. The pitch is the contest itself:
// a poster in a busy room is a way to WIN, not a favour to the site.
//
// It is deliberately an EXPRESSION OF INTEREST, not a generator. The owner
// designs each poster by hand over email, because a real placement needs a real
// conversation about where it is going and what it should say. The form asks for
// nothing but a reply address: where they intend to hang it is a question for
// that conversation, not a gate on getting the request filed.
//
// Delivery rides the EXISTING complaints pipeline rather than adding a second
// mail integration: /api/complaints inserts a row, the table's insert webhook
// calls the send-notification-email edge function, and Brevo mails
// sourceoftruthsadmin@gmail.com. That gets an email AND a row in the admin
// Notices tab for free. It is filed under a synthetic list id that matches no
// list, which is what keeps it out of the public activity feed.
//
// Mounted once in the root layout next to ContestPop. It renders null in every
// case except a live contest, a registered player, and a browser that already
// dealt with the contest pop-up on an earlier visit, so a normal page load costs
// two localStorage reads.

import { useEffect, useState } from 'react';
import { X, QrCode, Trophy, Check } from 'lucide-react';
import { T } from '@/lib/theme';
import { CONTEST, canShowPromo, readGeoCookie, onPromoPath, daysLeft } from '@/lib/contest';
import { contestSeenAt } from './ContestPop';
import { myRefCode, withRef } from '@/lib/referrals';
import { savedIdentity } from '@/lib/saved-identity';

const INK = T.ink;
const SLATE = T.slate;
const MUTED = T.muted;
const BORD = '#e5e7eb';
const BLUE = T.blue;
const NAVY = T.accent;
const SANS = "'Manrope', system-ui, -apple-system, sans-serif";

// Keyed by contest id for the same reason ContestPop's key is: a FUTURE promo
// must be able to make this offer again to someone who passed on this one.
const SEEN_KEY = `sot_qr_poster_seen_${CONTEST.id}`;
// Separate from SEEN_KEY and permanent. Once someone has asked for a poster,
// asking again is noise, so a submission suppresses the offer for good rather
// than for a week.
const DONE_KEY = `sot_qr_poster_done_${CONTEST.id}`;

// Same weekly cadence as ContestPop: a single impression across a 30 day
// contest is too few, and a value of "last shown at" rather than a flag is what
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

function done() {
  try { return !!localStorage.getItem(DONE_KEY); } catch { return true; }
}

function markDone() {
  try { localStorage.setItem(DONE_KEY, String(Date.now())); } catch { /* private mode */ }
}

export default function QrPosterPop() {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');

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
    if (done()) return;
    if (seen()) return;

    const who = savedIdentity();
    setName(who.username || '');
    setEmail(who.email || '');

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

  async function submit(e) {
    e.preventDefault();
    if (sending) return;
    const mail = email.trim();
    // The whole flow is a back and forth by email, so an address is the one
    // genuinely required field. Everything else gets sorted out in the reply.
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) {
      setErr('We need an email address to send the poster to.');
      return;
    }
    setSending(true);
    setErr('');

    const code = myRefCode() || '';
    // Their stamped invite link, resolved here rather than asked for, so the
    // request arrives with everything needed to build the code.
    const link = withRef(`${window.location.origin}/quizzes`);
    const lines = [
      note.trim() ? `Notes: ${note.trim()}` : 'Notes: none given',
      `Referral code: ${code || 'unknown'}`,
      `Invite link: ${link}`,
    ];

    try {
      const r = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Synthetic list id, matching no real list. That is what routes this
          // to the admin Notices tab while keeping it out of the public feed.
          listId: 'qr-poster-request',
          listTitle: 'QR poster request',
          message: lines.join('\n'),
          name: name.trim(),
          email: mail,
        }),
      });
      if (!r.ok) throw new Error(`post ${r.status}`);
      markDone();
      setSent(true);
    } catch {
      setErr('That did not send. Try again in a moment.');
    } finally {
      setSending(false);
    }
  }

  if (!open) return null;

  const left = daysLeft();

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
  const field = {
    width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 9,
    border: `1px solid ${BORD}`, fontSize: 13.5, fontFamily: SANS, color: INK,
    background: T.white, outline: 'none',
  };
  const closeBtn = (
    <button
      type="button"
      onClick={dismiss}
      aria-label="Close"
      style={{ position: 'absolute', top: 10, right: 12, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: 'transparent', border: 0, color: 'rgba(255,255,255,0.65)', cursor: 'pointer' }}
    >
      <X size={18} strokeWidth={2.4} />
    </button>
  );

  if (sent) {
    return (
      <div onClick={dismiss} style={backdrop}>
        <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Request sent" style={card}>
          <div style={{ background: NAVY, padding: '26px 26px 22px', textAlign: 'center', position: 'relative' }}>
            {closeBtn}
            <Check size={30} strokeWidth={2.6} color="#bfdbfe" />
            <div style={{ fontSize: 27, fontWeight: 800, color: T.white, lineHeight: 1.1, letterSpacing: '-.02em', marginTop: 8 }}>
              Request sent
            </div>
          </div>
          <div style={{ padding: '20px 26px 24px' }}>
            <div style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.55 }}>
              We will email <b style={{ color: INK, fontWeight: 800 }}>{email.trim()}</b> a poster carrying your own QR code,
              usually within a couple of days. Reply to that email and tell us where it is going,
              and we will size the wording to suit the spot.
            </div>
            <button
              type="button"
              onClick={dismiss}
              style={{ width: '100%', marginTop: 18, background: BLUE, color: T.white, border: `1px solid ${BLUE}`, padding: '12px', borderRadius: 10, fontSize: 14.5, fontWeight: 800, fontFamily: SANS, cursor: 'pointer' }}
            >
              Back to the game
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          {closeBtn}
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

        <div style={{ padding: '18px 26px 0' }}>
          {/* The reason to want one. The prize figure and the deadline both come
              from lib/contest, so a change to the promo never leaves this
              pop-up quoting a stale number. */}
          <div style={{ background: T.accentSoft, border: `1px solid ${T.accentBorder}`, borderRadius: 10, padding: '12px 13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
              <Trophy size={15} strokeWidth={2.4} color={T.gold} />
              <div style={{ fontSize: 13.5, fontWeight: 800, color: INK, letterSpacing: '-.01em' }}>
                This is how you win the {CONTEST.prizeLabel}
              </div>
            </div>
            <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5 }}>
              A link in a group chat reaches the people you already know. One poster on a
              coffee shop counter, a community board, your classroom or the break room at
              work is seen by strangers all day, and every one of them who plays adds to
              your score.
              {left > 0 ? ` ${left} day${left === 1 ? '' : 's'} left.` : ''}
            </div>
          </div>
        </div>

        <form onSubmit={submit} style={{ padding: '14px 26px 22px' }}>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={200}
            placeholder="Where are you thinking of putting it? Optional."
            style={{ ...field, marginBottom: 9 }}
          />
          <div style={{ display: 'flex', gap: 9, marginBottom: 9 }}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              placeholder="Your name"
              style={{ ...field, flex: 1 }}
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={200}
              type="email"
              placeholder="Email"
              style={{ ...field, flex: 1.2 }}
            />
          </div>

          {err ? (
            <div style={{ fontSize: 12, color: T.danger, fontWeight: 700, marginBottom: 9 }}>{err}</div>
          ) : null}

          <button
            type="submit"
            disabled={sending}
            style={{ width: '100%', background: BLUE, color: T.white, border: `1px solid ${BLUE}`, padding: '13px', borderRadius: 10, fontSize: 15, fontWeight: 800, fontFamily: SANS, cursor: sending ? 'default' : 'pointer', opacity: sending ? 0.7 : 1 }}
          >
            {sending ? 'Sending...' : 'Send me a poster'}
          </button>
          <button
            type="button"
            onClick={dismiss}
            style={{ display: 'block', width: '100%', marginTop: 11, background: 'transparent', border: 0, fontSize: 13, fontWeight: 700, color: SLATE, fontFamily: SANS, cursor: 'pointer' }}
          >
            No thanks
          </button>
          <div style={{ textAlign: 'center', marginTop: 13, fontSize: 10.5, color: SLATE, lineHeight: 1.5 }}>
            We design it and email it to you. Scans count toward your contest score
            exactly the way a shared link does.
          </div>
        </form>
      </div>
    </div>
  );
}
