'use client';

// SITE-LEVEL INSTALL PROMPT (owner build, 2026-08-20). Every daily game page
// already offers its own per-game install (each has its own manifest and a2hs
// button in the client), but the SITE had no install affordance anywhere, even
// though app/manifest.js and the root web-app-manifest icons have existed since
// the rebrand. This is the homepage's: a slim dismissible card offering to
// install Mind Loft itself (root manifest, scope /).
//
// WHO SEES IT: an ENGAGED visitor only — someone with a registered identity or
// at least one daily-game day breadcrumb. That is deliberately the opposite
// audience from WelcomeOverlay (no footprint), so the two can never stack.
// One dismissal (sot_install_dismissed) retires it for good; so does a
// completed install. Modern Chrome no longer requires a service worker for
// installability and the per-game installs already work without one, so this
// ships NO service worker at all: zero staleness risk on a site that deploys
// often, which is the conservative call the deploy-cache history argues for.
//
// PLATFORM SPLIT, same as the game clients' a2hs handling:
//   - Chromium fires beforeinstallprompt; stash it, show the card, call
//     .prompt() on click.
//   - iOS/iPadOS never fires it — A2HS lives in Safari's share sheet — so the
//     card shows a "See how" that opens a two-step instruction sheet.
//   - Anything else (desktop Firefox etc.): render nothing.
import { useEffect, useState } from 'react';
import MindLoftMark from './MindLoftMark';

const DISMISS_KEY = 'sot_install_dismissed';

function isEngaged() {
  try {
    if (localStorage.getItem('sot_quiz_identity')) return true;
    for (let i = 0; i < localStorage.length; i += 1) {
      const k = localStorage.key(i) || '';
      if (/^sot_.+_day$/.test(k)) return true;
    }
  } catch (e) { /* storage unreadable: treat as not engaged */ }
  return false;
}

function isIos() {
  try {
    const ua = navigator.userAgent || '';
    if (/iPad|iPhone|iPod/.test(ua)) return true;
    // iPadOS 13+ reports as Mac; the touch points give it away.
    return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  } catch (e) { return false; }
}

export default function InstallPrompt() {
  const [evt, setEvt] = useState(null);
  const [mode, setMode] = useState(null); // 'prompt' | 'ios' | null
  const [sheet, setSheet] = useState(false);

  useEffect(() => {
    // ?install=1 forces a preview for verification, skipping the engagement
    // and dismissal gates (the card still behaves normally once shown).
    let force = false;
    try { force = new URLSearchParams(window.location.search).get('install') === '1'; } catch (e) {}
    let ok = false;
    try {
      if (!force && localStorage.getItem(DISMISS_KEY)) return undefined;
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return undefined;
      if (window.navigator.standalone === true) return undefined;
      ok = force || isEngaged();
    } catch (e) { return undefined; }
    if (!ok) return undefined;

    let timer = null;
    const onBip = (e) => {
      e.preventDefault();
      setEvt(e);
      // A beat after load, so it never competes with first paint.
      timer = setTimeout(() => setMode('prompt'), 2500);
    };
    const onInstalled = () => {
      setMode(null);
      try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch (e2) {}
    };
    window.addEventListener('beforeinstallprompt', onBip);
    window.addEventListener('appinstalled', onInstalled);
    if (isIos()) timer = setTimeout(() => setMode('ios'), 2500);
    // Forced preview shows the card even where no install path exists (desktop
    // Firefox, an already-installed Chrome); the button then opens the sheet.
    else if (force) timer = setTimeout(() => setMode((m) => m || 'ios'), 800);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBip);
      window.removeEventListener('appinstalled', onInstalled);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const dismiss = () => {
    setMode(null);
    setSheet(false);
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch (e) {}
  };

  const install = () => {
    if (evt) {
      const e = evt;
      setEvt(null);
      setMode(null);
      // One shot either way: a declined native prompt should not re-nag.
      try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch (e2) {}
      try { e.prompt(); } catch (e3) {}
      return;
    }
    setSheet(true);
  };

  if (!mode) return null;

  return (
    <>
      <style>{`
        .mli-card{position:fixed;right:14px;bottom:14px;z-index:150;display:flex;align-items:center;
          gap:11px;background:#fff;border:1.5px solid var(--border,#e5e7eb);border-radius:14px;
          padding:12px 14px;box-shadow:0 14px 40px rgba(8,15,35,.22);max-width:400px;
          font-family:'Manrope',system-ui,-apple-system,sans-serif;color:var(--ink,#0b0c0e);
          animation:mliIn .3s ease-out;}
        @keyframes mliIn{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:none;}}
        .mli-t{flex:1;min-width:0;}
        .mli-t b{display:block;font-weight:800;font-size:13.5px;line-height:1.2;letter-spacing:-.01em;}
        .mli-t s{display:block;text-decoration:none;font-weight:600;font-size:11.5px;line-height:1.35;
          color:var(--muted,#3f4757);margin-top:2px;}
        .mli-go{flex:none;border:0;background:var(--cta,#2563eb);color:#fff;border-radius:9px;
          padding:9px 13px;font-family:inherit;font-weight:800;font-size:12.5px;cursor:pointer;
          white-space:nowrap;}
        .mli-go:hover{background:var(--cta-hover,#1d4ed8);}
        .mli-x{flex:none;border:0;background:transparent;color:var(--slate,#646c7a);
          font-family:inherit;font-weight:800;font-size:11.5px;cursor:pointer;padding:6px 2px;}
        .mli-x:hover{color:var(--ink,#0b0c0e);}
        @media(max-width:560px){.mli-card{left:10px;right:10px;bottom:10px;max-width:none;}}
        .mli-scrim{position:fixed;inset:0;z-index:210;background:rgba(20,22,28,.55);
          display:flex;align-items:center;justify-content:center;padding:18px;}
        .mli-sheet{background:#fff;border-radius:14px;max-width:360px;width:100%;padding:20px 18px;
          font-family:'Manrope',system-ui,-apple-system,sans-serif;color:var(--ink,#0b0c0e);}
        .mli-sheet b.h{display:block;font-weight:800;font-size:16px;margin-bottom:10px;}
        .mli-sheet ol{margin:0 0 6px;padding-left:20px;font-weight:600;font-size:13.5px;line-height:1.6;}
        .mli-ok{margin-top:12px;width:100%;border:0;border-radius:10px;background:var(--ink,#0b0c0e);
          color:#fff;font-family:inherit;font-weight:800;font-size:12.5px;letter-spacing:.05em;
          text-transform:uppercase;padding:12px;cursor:pointer;}
      `}</style>
      <div className="mli-card" role="dialog" aria-label="Install Mind Loft">
        <MindLoftMark size={28} ink="#0b0c0e" accent="#2563eb" />
        <span className="mli-t">
          <b>Install Mind Loft</b>
          <s>Your daily puzzles, one tap from the home screen.</s>
        </span>
        <button type="button" className="mli-go" onClick={install}>
          {evt ? 'Install' : 'See how'}
        </button>
        <button type="button" className="mli-x" onClick={dismiss}>Not now</button>
      </div>
      {sheet ? (
        <div className="mli-scrim" onClick={dismiss}>
          <div className="mli-sheet" onClick={(e) => e.stopPropagation()}>
            <b className="h">Add Mind Loft to your Home Screen</b>
            <ol>
              <li>Tap the <b>Share</b> button in Safari.</li>
              <li>Scroll down and tap <b>Add to Home Screen</b>.</li>
            </ol>
            <button type="button" className="mli-ok" onClick={dismiss}>Got it</button>
          </div>
        </div>
      ) : null}
    </>
  );
}
