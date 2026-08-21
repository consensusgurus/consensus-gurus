'use client';

// The QR poster offer: the pitch, the form, and the states after it is sent.
//
// Rendered in TWO places and deliberately owns everything below whatever header
// the host supplies, so the two can never drift apart on the copy or on what the
// admin receives:
//   * app/QrPosterPop.jsx        the interruptive pop-up, which adds modal chrome
//                                and passes `dismiss` so the offer can be waved off
//   * app/quizzes/contest/       the contest board, inline under "Your standing",
//     ContestBoard.jsx           where a player is already thinking about score
//
// It is an EXPRESSION OF INTEREST, not a generator. The owner designs each poster
// by hand over email, because a real placement needs a real conversation about
// where it is going and what it should say, so the form asks only for an optional
// note and a reply address.
//
// Delivery rides the EXISTING complaints pipeline rather than adding a second mail
// integration: /api/complaints inserts a row, the table's insert webhook calls the
// send-notification-email edge function, and Brevo mails the admin. That gets an
// email AND a row in the admin Notices tab for free. It is filed under a synthetic
// list id matching no list, and no public surface reads that table any more (see
// app/feed/page.js), so the request stays private.

import { useEffect, useState } from 'react';
import { Trophy, Check } from 'lucide-react';
import { T } from '@/lib/theme';
import { CONTEST, daysLeft, contestIsLive } from '@/lib/contest';
import { myRefCode, withRef } from '@/lib/referrals';
import { savedIdentity } from '@/lib/saved-identity';

const INK = T.ink;
const SLATE = T.slate;
const MUTED = T.muted;
const BORD = '#e5e7eb';
const BLUE = T.blue;
const SANS = "'Manrope', system-ui, -apple-system, sans-serif";

// Keyed by contest id so a FUTURE promo can make the offer again to someone who
// took one this time round. Shared with QrPosterPop, which reads it to stay shut
// once a poster has been asked for: the pop-up's own weekly "seen" key is about
// DISMISSAL and lives there, this one is about SUBMISSION and lives here, next to
// the code that sets it.
export const QR_DONE_KEY = `sot_qr_poster_done_${CONTEST.id}`;

export function qrPosterDone() {
  if (typeof window === 'undefined') return false;
  try { return !!localStorage.getItem(QR_DONE_KEY); } catch { return true; }
}

function markQrPosterDone() {
  try { localStorage.setItem(QR_DONE_KEY, String(Date.now())); } catch { /* private mode */ }
}

export default function QrPosterForm({ dismiss = null, hideDaysLeft = false }) {
  const [note, setNote] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [already, setAlready] = useState(false);
  const [err, setErr] = useState('');
  // Resolved after mount, not at render: contestIsLive() reads the clock, and
  // this renders inside surfaces that are server-rendered. Defaults to true so
  // the common case (a live contest) paints immediately with no flash.
  const [live, setLive] = useState(true);

  // localStorage is read after mount, never during render, so the server and the
  // first client render agree.
  useEffect(() => {
    const who = savedIdentity();
    setName(who.username || '');
    setEmail(who.email || '');
    if (qrPosterDone()) setAlready(true);
    setLive(contestIsLive());
  }, []);

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
          // Synthetic list id, matching no real list. That is what routes this to
          // the admin Notices tab while keeping it off every public surface.
          listId: 'qr-poster-request',
          listTitle: 'QR poster request',
          message: lines.join('\n'),
          name: name.trim(),
          email: mail,
        }),
      });
      if (!r.ok) throw new Error(`post ${r.status}`);
      markQrPosterDone();
      setSent(true);
    } catch {
      setErr('That did not send. Try again in a moment.');
    } finally {
      setSending(false);
    }
  }

  const field = {
    width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 9,
    border: `1px solid ${BORD}`, fontSize: 13.5, fontFamily: SANS, color: INK,
    background: T.white, outline: 'none',
  };
  const confirmBox = {
    background: T.accentSoft, border: `1px solid ${T.accentBorder}`, borderRadius: 10,
    padding: '13px 14px', display: 'flex', gap: 9, alignItems: 'flex-start',
  };

  // The whole offer is pitched on the prize, so it goes away with the contest.
  // A just-sent confirmation still shows, since swallowing it would read as the
  // request having failed.
  if (!live && !sent) return null;

  if (sent) {
    return (
      <div style={{ fontFamily: SANS }}>
        <div style={confirmBox}>
          <span style={{ color: T.successDeep, flexShrink: 0, marginTop: 1 }}><Check size={16} strokeWidth={2.8} /></span>
          <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.55 }}>
            <b style={{ color: INK, fontWeight: 800 }}>Request sent.</b> We will email{' '}
            <b style={{ color: INK, fontWeight: 800 }}>{email.trim()}</b> a poster carrying your own
            QR code, usually within a couple of days. Reply to that email and tell us where it is
            going, and we will size the wording to suit the spot.
          </div>
        </div>
        {dismiss ? (
          <button
            type="button"
            onClick={dismiss}
            style={{ width: '100%', marginTop: 14, background: BLUE, color: T.white, border: `1px solid ${BLUE}`, padding: '12px', borderRadius: 10, fontSize: 14.5, fontWeight: 800, fontFamily: SANS, cursor: 'pointer' }}
          >
            Back to the game
          </button>
        ) : null}
      </div>
    );
  }

  // Asked for one already. Showing the form again invites a duplicate request
  // and reads as though the first one went nowhere.
  if (already) {
    return (
      <div style={{ fontFamily: SANS }}>
        <div style={confirmBox}>
          <span style={{ color: T.successDeep, flexShrink: 0, marginTop: 1 }}><Check size={16} strokeWidth={2.8} /></span>
          <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.55 }}>
            <b style={{ color: INK, fontWeight: 800 }}>You have already asked for a poster.</b> Check
            your email, and reply to that thread if you want another copy or a different spot.
          </div>
        </div>
      </div>
    );
  }

  const left = daysLeft();

  return (
    <div style={{ fontFamily: SANS }}>
      {/* The reason to want one. The prize figure and the deadline both come from
          lib/contest, so a change to the promo never leaves this quoting a stale
          number. */}
      <div style={{ background: T.accentSoft, border: `1px solid ${T.accentBorder}`, borderRadius: 10, padding: '12px 13px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
          <Trophy size={15} strokeWidth={2.4} color={T.gold} />
          <div style={{ fontSize: 13.5, fontWeight: 800, color: INK, letterSpacing: '-.01em' }}>
            This is how you win the {CONTEST.prizeLabel}
          </div>
        </div>
        <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5 }}>
          A link in a group chat reaches the people you already know. One poster on a coffee shop
          counter, a community board, your classroom or the break room at work is seen by strangers
          all day, and every one of them who plays adds to your score.
          {!hideDaysLeft && left > 0 ? ` ${left} day${left === 1 ? '' : 's'} left.` : ''}
        </div>
      </div>

      <form onSubmit={submit} style={{ marginTop: 14 }}>
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
        {dismiss ? (
          <button
            type="button"
            onClick={dismiss}
            style={{ display: 'block', width: '100%', marginTop: 11, background: 'transparent', border: 0, fontSize: 13, fontWeight: 700, color: SLATE, fontFamily: SANS, cursor: 'pointer' }}
          >
            No thanks
          </button>
        ) : null}
        <div style={{ textAlign: 'center', marginTop: 13, fontSize: 10.5, color: SLATE, lineHeight: 1.5 }}>
          We design it and email it to you. Scans count toward your contest score exactly the way a
          shared link does.
        </div>
      </form>
    </div>
  );
}
