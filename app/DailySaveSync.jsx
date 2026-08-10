'use client';

// DailySaveSync - carries the in-progress BOARD across devices, and offers it
// back on arrival.
//
// WHY: migration 52 made "in progress" travel, but a daily_in_progress row is a
// marker with no payload. So a player who started on a phone opened the laptop,
// correctly saw "in progress", pressed Play and got a blank board (owner
// report, 2026-08-10). The label crossed devices and the game never did.
//
// WHY PROMPTED AND NOT SILENT (owner ruling, 2026-08-10): every one of the 58
// daily clients hydrates from localStorage in its own mount effect, and no
// network fetch can beat that, so a silent restore would need a gate in front
// of all 58 mounts plus a last-write-wins policy that lets a stale device
// clobber newer progress. Asking instead removes both problems at once: the
// board opens exactly as it does today, and the player decides. It is also the
// honest interaction, because the two boards genuinely can differ.
//
// WHY IT TOUCHES NO GAME: the write side rides the same central
// localStorage.setItem wrapper DailyStartPing uses (which is itself the trick
// ResultQueue uses on window.fetch). Every daily client already writes its whole
// board to `sot_<key>_<num>` on every move, so watching that one write covers
// all 58 games and every future one on the day it ships, with nothing to
// remember and no per-client edit.
//
// WHAT IS NEVER SYNCED: a board with no `t0` (opening a game is not starting
// it), an archive replay (`?p=<num>`, which writes the same key a real drop
// uses and must not overwrite the live board), and a finished board - the
// finishing write instead DELETES the row, so a completed game can never be
// offered back as resumable.
//
// The whole thing is best-effort. It carries no score and reaches nothing that
// scores; if every request fails, the game behaves exactly as it did before.

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { DAILY_KEYS } from '@/lib/daily-games';
import { T } from '@/lib/theme';

const BOARD = /^sot_([a-z]{3,12})_(\d{1,7})(?:_r\d{1,3})?$/;
const PATH = '/api/quiz/daily-save';
const DISMISS = 'sot_resume_dismissed';

// Long enough that a fast run of moves collapses into one write, short enough
// that switching devices mid-thought still finds the latest board. Whatever the
// timer has not flushed yet goes out on pagehide.
const DEBOUNCE_MS = 4000;

const KEYS = new Set(DAILY_KEYS);
let patched = false;

function etToday() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

function who() {
  let anonId = null, email = null;
  try { anonId = localStorage.getItem('sot_quiz_anon'); } catch (e) {}
  try {
    const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null');
    email = id && id.email;
  } catch (e) {}
  return { anonId, email };
}

// A board counts as in play when it has a real t0 and has not reached a verdict.
// `status` is the one field all 58 save shapes share alongside t0; a shape that
// somehow omits it is treated as in play, since t0 alone already means started.
function inPlay(v) {
  return !!(v && v.t0 && (!v.status || v.status === 'playing'));
}

// An archive replay writes the SAME key its drop used, so a player revisiting
// puzzle 100 must not push that board up as today's.
function isArchive() {
  try { return !!new URLSearchParams(window.location.search).get('p'); }
  catch (e) { return false; }
}

const pending = new Map();  // storeKey -> { timer, body }

function send(body, beacon) {
  const json = JSON.stringify(body);
  try {
    if (beacon && navigator.sendBeacon) {
      navigator.sendBeacon(PATH, new Blob([json], { type: 'application/json' }));
      return;
    }
  } catch (e) { /* fall through to fetch */ }
  try {
    fetch(PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: json,
      keepalive: true,
    }).catch(() => {});
  } catch (e) { /* best effort */ }
}

function flushAll(beacon) {
  for (const [k, p] of pending) {
    clearTimeout(p.timer);
    send(p.body, beacon);
    pending.delete(k);
  }
}

function queue(storeKey, body) {
  const prev = pending.get(storeKey);
  if (prev) clearTimeout(prev.timer);
  const timer = setTimeout(() => { pending.delete(storeKey); send(body, false); }, DEBOUNCE_MS);
  pending.set(storeKey, { timer, body });
}

function onBoardWrite(storeKey, value) {
  const m = BOARD.exec(storeKey);
  if (!m || !KEYS.has(m[1])) return;
  if (isArchive()) return;
  const { anonId, email } = who();
  if (!anonId && !email) return;   // nothing to file it under
  const v = JSON.parse(String(value));

  // The finishing write retires the row rather than storing it. Without this a
  // completed board would sit on the server until the sweep and get offered
  // back on another device as if it were still in play.
  if (v && v.t0 && v.status && v.status !== 'playing') {
    const prev = pending.get(storeKey);
    if (prev) { clearTimeout(prev.timer); pending.delete(storeKey); }
    send({ storeKey, ymd: etToday(), done: true, anonId, email }, false);
    return;
  }
  if (!inPlay(v)) return;
  queue(storeKey, { storeKey, ymd: etToday(), state: String(value), anonId, email });
}

export default function DailySaveSync() {
  const pathname = usePathname();
  const [offer, setOffer] = useState(null);   // { storeKey, state }
  const asked = useRef(new Set());

  // ---- write side: one wrapper, all 58 games ----
  useEffect(() => {
    if (patched || typeof window === 'undefined' || !window.localStorage) return;
    patched = true;
    const raw = localStorage.setItem.bind(localStorage);
    // EVERY save on the site runs this, so it must never throw and never delay
    // the write: the original call goes first and the watcher sits in its own
    // try, exactly as DailyStartPing does.
    localStorage.setItem = function (key, value) {
      raw(key, value);
      try { onBoardWrite(String(key), value); }
      catch (e) { /* never let a save fail because of a sync */ }
    };
    const bye = () => { try { flushAll(true); } catch (e) {} };
    window.addEventListener('pagehide', bye);
    return () => window.removeEventListener('pagehide', bye);
  }, []);

  // ---- read side: offer the other device's board, once per board ----
  useEffect(() => {
    const game = String(pathname || '').replace(/^\//, '');
    setOffer(null);
    if (!KEYS.has(game) || isArchive()) return;
    const ymd = etToday();
    const { anonId, email } = who();
    if (!anonId && !email) return;
    let live = true;
    (async () => {
      try {
        const qs = new URLSearchParams({ game, ymd });
        if (anonId) qs.set('anonId', anonId);
        if (email) qs.set('email', email);
        const r = await fetch(`${PATH}?${qs.toString()}`);
        if (!r.ok) return;
        const j = await r.json();
        const save = j && j.save;
        if (!live || !save || !save.storeKey || !save.state) return;
        if (asked.current.has(save.storeKey)) return;
        let dismissed = null;
        try { dismissed = sessionStorage.getItem(DISMISS); } catch (e) {}
        if (dismissed === save.storeKey) return;

        // NEVER offer over real local progress. Only an absent save, or one
        // that was opened and never moved in, may be replaced: a player who has
        // made moves on THIS device keeps them, and the two boards simply
        // diverge, which is the honest outcome of playing in two places.
        let mine = null;
        try { mine = JSON.parse(localStorage.getItem(save.storeKey) || 'null'); } catch (e) {}
        if (mine && mine.t0) return;

        asked.current.add(save.storeKey);
        setOffer({ storeKey: save.storeKey, state: save.state });
      } catch (e) { /* best effort: no banner is the old behaviour */ }
    })();
    return () => { live = false; };
  }, [pathname]);

  if (!offer) return null;

  const resume = () => {
    try { localStorage.setItem(offer.storeKey, offer.state); } catch (e) {}
    // A reload rather than a state hand-off: the game client reads its save in
    // its own mount effect, so the only way in without editing all 58 of them
    // is to let it mount again with the save already in place.
    try { window.location.reload(); } catch (e) { setOffer(null); }
  };
  const dismiss = () => {
    try { sessionStorage.setItem(DISMISS, offer.storeKey); } catch (e) {}
    setOffer(null);
  };

  return (
    <div
      role="status"
      style={{
        position: 'fixed', left: 12, right: 12, bottom: 12, zIndex: 9000,
        margin: '0 auto', maxWidth: 560, display: 'flex', alignItems: 'center', gap: 12,
        background: T.accent, color: T.white, borderRadius: 12, padding: '12px 14px',
        boxShadow: '0 10px 30px rgba(15,31,77,0.28)',
        fontFamily: "'Manrope', system-ui, sans-serif",
      }}
    >
      <span style={{ flex: 1, fontSize: 14, fontWeight: 700, lineHeight: 1.35 }}>
        You have this game in progress on another device.
      </span>
      <button
        type="button"
        onClick={resume}
        style={{
          flex: '0 0 auto', border: 0, borderRadius: 8, padding: '9px 14px',
          background: T.white, color: T.accent, fontWeight: 800, fontSize: 14, cursor: 'pointer',
        }}
      >
        Pick up there
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Start fresh on this device"
        style={{
          flex: '0 0 auto', border: 0, background: 'transparent', color: T.white,
          opacity: 0.75, fontWeight: 800, fontSize: 18, lineHeight: 1, cursor: 'pointer', padding: 4,
        }}
      >
        {'×'}
      </button>
    </div>
  );
}
