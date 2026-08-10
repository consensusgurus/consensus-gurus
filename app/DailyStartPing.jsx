'use client';

// DailyStartPing - tells the server, once, that a daily game has been started.
//
// WHY: in-progress did not cross devices. The only cross-device signal was an
// abandoned quiz_results row filed by useAbandonFlush on `pagehide`, and a phone
// that gets backgrounded (home button, app switch, tab evicted) frequently never
// fires that event, so a game paused on a phone stayed invisible on every other
// device. Flushing an abandon on `visibilitychange` instead is not the fix: an
// abandoned row is a SCORED result, so that would bank a partial score every
// time somebody glanced at another app. See supabase/migrations/52.
//
// HOW, AND WHY IT TOUCHES NO GAME: every daily client already writes the
// breadcrumb `sot_<key>_day` = {d, done} at exactly the right moment, because
// each one writes it only `if (done || g.t0)` - that is, on a genuine first
// move, never on merely opening the board ("opening a game is not starting
// it"). So rather than edit 56 clients, this wraps localStorage.setItem once for
// the whole site and watches for that write, the same central-wrapper trick
// ResultQueue uses on window.fetch. A new daily game is covered the day it
// ships, with nothing to remember.
//
// The ping is best-effort and fire-and-forget. It carries no score and reaches
// nothing that scores; if it fails the only consequence is that this game shows
// as in-progress on this device alone, which is exactly the old behaviour.

import { useEffect } from 'react';

const CRUMB = /^sot_([a-z]+)_day$/;
const SENT = 'sot_start_pinged';
const PATH = '/api/quiz/daily-start';

let patched = false;

function etToday() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

// `<game>-<M>-<D>-<YY>`, the id shape every daily result is filed under. Built
// from the crumb's OWN date rather than the clock, so a board saved either side
// of Eastern midnight pings for the day it actually belongs to.
function quizIdFor(game, ymd) {
  const [Y, M, D] = String(ymd).split('-').map(Number);
  if (!Y || !M || !D) return null;
  return `${game}-${M}-${D}-${Y % 100}`;
}

function readSent() {
  try {
    const v = JSON.parse(localStorage.getItem(SENT) || 'null');
    return v && typeof v === 'object' ? v : {};
  } catch (e) { return {}; }
}

// Keyed by quizId, and pruned to today, so the record cannot grow without bound
// and yesterday's entries never suppress today's ping.
function markSent(quizId, ymd) {
  try {
    const keep = {};
    const suffix = quizIdFor('x', ymd);
    const tail = suffix ? suffix.slice(1) : null;
    const cur = readSent();
    for (const k of Object.keys(cur)) if (tail && k.endsWith(tail)) keep[k] = 1;
    keep[quizId] = 1;
    localStorage.setItem(SENT, JSON.stringify(keep));
  } catch (e) { /* a browser that cannot remember simply pings again */ }
}

function ping(game, ymd) {
  const quizId = quizIdFor(game, ymd);
  if (!quizId) return;
  if (readSent()[quizId]) return;
  let anonId = null, email = null;
  try { anonId = localStorage.getItem('sot_quiz_anon'); } catch (e) {}
  try {
    const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null');
    email = id && id.email;
  } catch (e) {}
  // Nothing to file the row under, and the server would only refuse it.
  if (!anonId && !email) return;
  // Marked BEFORE the request, not after: a start is worth one attempt, and a
  // retry loop on a failing endpoint would fire on every keystroke that saves.
  markSent(quizId, ymd);
  try {
    fetch(PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quizId, anonId, email }),
      keepalive: true,
    }).catch(() => {});
  } catch (e) { /* best effort */ }
}

export default function DailyStartPing() {
  useEffect(() => {
    if (patched || typeof window === 'undefined' || !window.localStorage) return;
    patched = true;
    const raw = localStorage.setItem.bind(localStorage);
    // Wrapping a storage method means EVERY save on the site runs this. It must
    // never throw and never delay the write, so the original call goes first and
    // the whole watcher sits inside its own try.
    localStorage.setItem = function (key, value) {
      raw(key, value);
      try {
        const m = CRUMB.exec(String(key));
        if (!m) return;
        const v = JSON.parse(String(value));
        // done:true is a finished game, which files a real result of its own and
        // supersedes any hint. Only an unfinished board on TODAY's date pings.
        if (!v || v.done || v.d !== etToday()) return;
        ping(m[1], v.d);
      } catch (e) { /* never let a save fail because of a ping */ }
    };
    // A board restored from a save writes its crumb in an effect that may have
    // already run by the time this mounts, so sweep what is already there once.
    try {
      const today = etToday();
      for (const key of Object.keys(localStorage)) {
        const m = CRUMB.exec(key);
        if (!m) continue;
        const v = JSON.parse(localStorage.getItem(key) || 'null');
        if (v && !v.done && v.d === today) ping(m[1], v.d);
      }
    } catch (e) { /* best effort */ }
  }, []);
  return null;
}
