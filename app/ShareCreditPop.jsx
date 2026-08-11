'use client';

// Global share-for-credit pop-up.
//
// SHARE FIRST, SIGN UP SECOND (owner, 2026-08-11). Every visitor gets the
// thing they pressed the button for: the result text and the link, with Copy
// and the native share sheet, ABOVE any mention of an account. The sign-up is
// an invite underneath a divider, never a gate.
//
// It used to be a wall. A signed-out viewer got the Join form and NOTHING
// else: no result, no link, no "share anyway", and since notifyShareCredit
// always returns true the caller's own clipboard/native-share path never ran
// either, so closing the modal dropped the share entirely. Signing up then
// DISCARDED the result text they were trying to post, which meant pressing
// Share a second time. Both are fixed here; see restampResult below for how
// the result survives the sign-up.
//
//   - Registered viewer (has a referral code): their credit link, with Copy
//     buttons for "Result + link" (the game status / quiz score, which already
//     carries their ref link) and "Just the link".
//   - Signed-out viewer: the same share rows built from the UNSTAMPED link,
//     then the contest note and a Sign up button that opens the join form in
//     place. After they sign up we resolve their new referral code, re-stamp
//     the link inside their result, and switch to the credit view.
//
// Wiring: a share handler calls notifyShareCredit(resultText?), which ALWAYS
// returns true on the client (the pop-up handles the share for everyone), so
// the handler skips its own copy/native-share. The pop-up derives the link
// itself from the current page URL.

import { useEffect, useState } from 'react';
import { X, Check, Copy, QrCode, Share2 } from 'lucide-react';
import { myRefCode, withRef, ensureMyRefCode } from '@/lib/referrals';
import JoinLeaderboardForm from './quiz/[id]/JoinLeaderboardForm';
import { T } from '@/lib/theme';
import { CONTEST, contestIsLive } from '@/lib/contest';
// The contest terms live in ONE component now (app/ContestNote.jsx), shared
// with the quiz-home credit modal so no share pop-up can state the terms
// differently from another.
import ContestNote from './ContestNote';
import QrPosterForm from './QrPosterForm';

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

// Put the freshly-resolved referral code into the link EMBEDDED IN the result
// text, so a player who signs up keeps the emoji grid they were about to post
// instead of being sent back to press Share again.
//
// The two strings are built by different code and do not have to match
// byte-for-byte: the pop-up's own link comes from location.href (absolute,
// with the scheme), while a daily client builds its share text around a
// BARE-HOST url ('mindloftdaily.com/crux'). So try the absolute form first and
// fall back to the scheme-stripped one.
//
// Returns '' when neither form is found. That is deliberate and it matters:
// showing a row labelled "Result + link" whose link is NOT the new member's
// would credit nobody, which is the exact thing they just signed up for. An
// empty result falls through to the "Just the link" row, which is always
// correct.
export function restampResult(text, oldLink, newLink) {
  if (!text || !oldLink || !newLink) return '';
  if (oldLink === newLink) return text;
  if (text.includes(oldLink)) return text.split(oldLink).join(newLink);
  const strip = (u) => u.replace(/^https?:\/\//, '');
  const oldBare = strip(oldLink);
  const newBare = strip(newLink);
  if (oldBare && oldBare !== oldLink && text.includes(oldBare)) {
    return text.split(oldBare).join(newBare);
  }
  return '';
}

const INK = T.ink;
const SLATE = T.slate;
const BORD = '#e7eaf1';
const BLUE = T.blue;
const PAPER = '#f4f6fa';
const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";

export default function ShareCreditPop() {
  const [open, setOpen] = useState(false);
  // Resolved after mount, not at render: contestIsLive() reads the clock, and
  // this component is mounted in the root layout on every page.
  const [promo, setPromo] = useState(false);
  useEffect(() => { setPromo(contestIsLive()); }, []);
  // navigator.share is read after mount for the same reason (it is absent on
  // the server and on most desktop browsers).
  const [canShare, setCanShare] = useState(false);
  useEffect(() => {
    try { setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function'); } catch (e) {}
  }, []);
  const [mode, setMode] = useState('credit'); // 'credit' | 'signup'
  const [link, setLink] = useState('');
  const [result, setResult] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);
  const [srcUrl, setSrcUrl] = useState(''); // page the credit link should point at
  // The join form, collapsed until asked for. A guest opened this pop-up to
  // share, so the form is an offer below the share rows, never the thing in
  // the way.
  const [joinOpen, setJoinOpen] = useState(false);
  // The QR poster offer, collapsed until asked for. A share pop-up is opened to
  // copy a link, so the poster is an aside here, never the thing in the way.
  const [qrOpen, setQrOpen] = useState(false);

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
      // Shown to EVERYONE now. For a guest withRef is a no-op, so this is the
      // plain uncredited link they would have copied themselves.
      setResult(rt && rt !== u ? rt : '');
      setCopiedKey(null);
      setMode(registered ? 'credit' : 'signup');
      setJoinOpen(false);
      setQrOpen(false);
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
    // Resolve the new code first so withRef includes it, then carry the result
    // text across by swapping the un-stamped link inside it for the stamped
    // one (restampResult). Dropping the text here is what used to force a
    // second trip through the Share button.
    try { await ensureMyRefCode(); } catch (e) {}
    let u = '';
    try { u = withRef(srcUrl || window.location.href); } catch (err) { u = ''; }
    setResult((prev) => restampResult(prev, link, u));
    setLink(u);
    setCopiedKey(null);
    setJoinOpen(false);
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

  function shareNative(txt) {
    try {
      if (navigator.share) navigator.share({ text: txt }).catch(() => {});
    } catch (e) {}
  }

  if (!open) return null;

  const backdrop = { position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(20,22,28,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: SANS };
  const card = { background: T.white, border: `1px solid ${BORD}`, borderRadius: 16, padding: '24px 24px 20px', maxWidth: 460, width: '100%', color: INK, position: 'relative', boxShadow: '0 18px 50px rgba(15,20,35,0.28)', maxHeight: '90vh', overflowY: 'auto' };
  const closeBtn = (
    <button type="button" onClick={() => setOpen(false)} aria-label="Close" style={{ position: 'absolute', top: 12, right: 12, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 9, background: T.white, border: `1px solid ${BORD}`, color: SLATE, cursor: 'pointer', zIndex: 2 }}>
      <X size={18} strokeWidth={2.4} />
    </button>
  );

  const copyBtn = (txt, key) => (
    <button
      type="button"
      onClick={() => copyText(txt, key)}
      style={{ flexShrink: 0, alignSelf: 'stretch', fontSize: 13, fontWeight: 800, color: T.white, background: copiedKey === key ? T.successDeep : INK, border: `1px solid ${copiedKey === key ? T.successDeep : INK}`, borderRadius: 10, padding: '0 16px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap', fontFamily: SANS }}
    >
      {copiedKey === key ? <><Check size={15} strokeWidth={2.6} /> Copied</> : <><Copy size={15} strokeWidth={2.4} /> Copy</>}
    </button>
  );
  const rowLabel = (t) => (
    <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 500, letterSpacing: '.12em', textTransform: 'uppercase', color: SLATE, margin: '0 0 6px' }}>{t}</div>
  );
  const boxStyle = { flex: 1, minWidth: 0, fontFamily: MONO, fontSize: 12.5, color: INK, background: PAPER, border: `1px solid ${BORD}`, borderRadius: 10, padding: '10px 12px', wordBreak: 'break-word' };
  const ghostBtn = { flex: 1, fontFamily: SANS, fontSize: 13, fontWeight: 800, color: SLATE, background: T.white, border: `1px solid ${BORD}`, borderRadius: 10, padding: '10px 14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, whiteSpace: 'nowrap' };

  // The share rows, identical for a guest and a member. The only difference is
  // whether the link they carry has a ref code in it.
  const shareRows = (
    result ? (
      <>
        <div style={{ marginBottom: 12 }}>
          {rowLabel('Result + link')}
          <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
            <div style={{ ...boxStyle, whiteSpace: 'pre-wrap', maxHeight: 132, overflowY: 'auto' }}>{result}</div>
            {copyBtn(result, 'result')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
          {canShare ? (
            <button type="button" onClick={() => shareNative(result)} style={ghostBtn}>
              <Share2 size={15} strokeWidth={2.4} /> Share
            </button>
          ) : null}
          <button type="button" onClick={() => copyText(link, 'link')} style={ghostBtn}>
            {copiedKey === 'link' ? <><Check size={15} strokeWidth={2.6} /> Copied</> : 'Copy just the link'}
          </button>
        </div>
      </>
    ) : (
      <div style={{ marginBottom: 4, display: 'flex', gap: 8, alignItems: 'stretch' }}>
        <div style={boxStyle}>{link}</div>
        {copyBtn(link, 'link')}
      </div>
    )
  );

  if (mode === 'signup') {
    const divider = (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0 14px' }}>
        <i style={{ flex: 1, height: 1, background: BORD }} />
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: SLATE }}>
          {promo ? 'and if you want credit' : 'get credit for it'}
        </span>
        <i style={{ flex: 1, height: 1, background: BORD }} />
      </div>
    );
    return (
      <div onClick={() => setOpen(false)} style={backdrop}>
        <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Share" style={card}>
          {closeBtn}
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.02em', marginBottom: 4, paddingRight: 28 }}>
            {result ? 'Share your result' : 'Share this link'}
          </div>
          <p style={{ margin: '0 0 16px', fontSize: 13.5, lineHeight: 1.5, color: SLATE }}>
            Copy it and post it anywhere. No account needed.
          </p>

          {shareRows}
          {divider}

          <div style={{ border: `1px solid ${BORD}`, borderRadius: 12, padding: 14, background: T.surface }}>
            {/* Collapsed, this block supplies its own heading and pitch. Opened,
                JoinLeaderboardForm brings its own heading and the same
                explanation, so ours come out rather than say it twice. */}
            {joinOpen ? null : (
              <div style={{ fontSize: 14.5, fontWeight: 800, margin: '0 0 8px' }}>Make this link yours</div>
            )}
            <ContestNote />
            {joinOpen ? null : (
              <p style={{ margin: '0 0 12px', fontSize: 12.5, lineHeight: 1.5, color: SLATE }}>
                Sign up (no password) and anyone who opens your link and finishes a game or quiz credits{' '}
                <b style={{ color: INK }}>you</b> on the community leaderboard.
              </p>
            )}
            {joinOpen ? (
              <>
                <JoinLeaderboardForm identity={null} heading="Sign up" hideIcon onJoined={handleJoined} />
                {result ? (
                  <p style={{ margin: '10px 0 0', fontSize: 11.5, lineHeight: 1.45, color: SLATE }}>
                    <b style={{ color: T.successDeep }}>Your result above is kept.</b> The link inside it gets your code.
                  </p>
                ) : null}
              </>
            ) : (
              <button
                type="button"
                onClick={() => setJoinOpen(true)}
                style={{ width: '100%', fontFamily: SANS, fontSize: 14, fontWeight: 800, color: T.white, background: BLUE, border: `1px solid ${BLUE}`, borderRadius: 10, padding: '11px 15px', cursor: 'pointer' }}
              >
                {result ? 'Sign up, keep my result' : 'Sign up and get my link'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div onClick={() => setOpen(false)} style={backdrop}>
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Your share link" style={card}>
        {closeBtn}
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.02em', marginBottom: 8, paddingRight: 28 }}>Your share link</div>
        <ContestNote />
        <p style={{ margin: '0 0 16px', fontSize: 13.5, lineHeight: 1.5, color: SLATE }}>
          This link is yours. Anyone who opens it and finishes a game or quiz credits <b style={{ color: INK }}>you</b> on the community leaderboard, once.
          {' '}<b style={{ color: INK }}>I&rsquo;m a one person startup! Please help us grow!</b>
        </p>

        <div style={{ marginBottom: 16 }}>{shareRows}</div>

        {promo ? (
          <div style={{ marginBottom: 16, border: `1px solid ${BORD}`, borderRadius: 12, padding: '13px 14px', background: PAPER }}>
            {qrOpen ? <QrPosterForm /> : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, flexWrap: 'wrap' }}>
                <span style={{ color: BLUE, flexShrink: 0, lineHeight: 1 }}><QrCode size={20} strokeWidth={2.2} /></span>
                <div style={{ flex: 1, minWidth: 170, fontSize: 12.5, color: SLATE, lineHeight: 1.45 }}>
                  A link reaches the people you know. We will also make you a printable{' '}
                  <b style={{ color: INK }}>QR poster</b> for a coffee shop, a classroom or work.
                </div>
                <button
                  type="button"
                  onClick={() => setQrOpen(true)}
                  style={{ flexShrink: 0, fontSize: 13, fontWeight: 800, color: T.white, background: BLUE, border: `1px solid ${BLUE}`, borderRadius: 10, padding: '9px 14px', cursor: 'pointer', fontFamily: SANS }}
                >
                  Get a QR poster
                </button>
              </div>
            )}
          </div>
        ) : null}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
          <a href="/quizzes/community" onClick={() => setOpen(false)} style={{ fontSize: 13, fontWeight: 800, color: SLATE, textDecoration: 'none', padding: '9px 14px', borderRadius: 10, border: `1px solid ${BORD}`, background: T.white, display: 'inline-flex', alignItems: 'center' }}>Community leaderboard</a>
        </div>
      </div>
    </div>
  );
}
