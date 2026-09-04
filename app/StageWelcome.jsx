'use client';

// THE DOORWAY: the ending's own sequence, run on the way in.
//
// A returning player lands on the home while /api/quiz/daily-status is still in
// flight, and the cap's figures sit empty until it arrives. This fills that gap
// with an arrival instead of a hole, then collapses onto the cap so the figures
// travel to the cells they live in. It is app/StageFinish.jsx's CurtainFlood
// pointed the other way, and every constant below is that file's rather than a
// new set: FLOOD_MIN, FLOOD_COUNT, FLOOD_STAMP, FLOOD_SETTLE and the stf-stamp
// overshoot. One motion vocabulary for arriving and leaving.
//
// WHY THIS IS NOT THE OVERLAY THAT WAS REMOVED. app/page.js carries the rule
// (NOTHING UNINVITED ON THE HOMEPAGE) that took out the Daily Five overlay and
// the install card on 2026-08-30, and the objection recorded there is precise:
// the page asked for something before the reader did, and waiting on engagement
// did not save it. This asks for nothing. There is no call to action, nothing to
// dismiss and nothing to click. It is a loading state for a fetch that is
// already running, and THE MOMENT THE DATA IS ALREADY THERE IT DOES NOT RUN AT
// ALL (see FLOOR). Owner asked for it 2026-08-31.
//
// THE WAIT IS THE SEQUENCE, NOT DEAD TIME. This is the whole reason the ending
// was rewritten in its second pass and it is why the figures do not all land at
// once: each one is stamped in and given long enough to be read, and a figure
// whose data has not arrived HOLDS the queue rather than printing a blank. A
// slow read therefore costs nothing and a fast one still reads as an arrival
// rather than a flash. The lead's dwell is its own count, so a number can never
// be cut off mid-climb.
//
// THERE IS NO SINGLE RETURNING PLAYER, and that is the part the first draft got
// wrong. Someone back an hour later has a day in progress; someone back after a
// week has an empty day, so their IQ today is 0 and they have no rank today at
// all. A welcome built on those cells would resolve into nothing, which is worse
// than the hole it was covering. So the GAP picks the figures, and every case
// has a set that is real:
//
//   resume  played today   IQ today, place on the day's board, best gain
//   newday  yesterday      streak, rank
//   away    2 days or more days away, rank
//
// NOTHING IS INVENTED. Every figure comes off the daily-status payload the page
// already fetches; a figure with no value is skipped rather than guessed, and a
// case with no figures at all does not show.
//
// THE RAMP IS ITS FRONT HALF (owner, 2026-09-01). The arrival now OPENS with
// the Broadcast's paint at the scale of the whole roster: the ten category
// bands rise in ramp order and name themselves, the ground wipes across and
// leaves them as a ladder along the foot, and only then do the words land.
// The words are chosen by footprint: a reader with a name gets the welcome
// and the gap-branched figures exactly as before; a reader without one gets
// the mark, the wordmark and the three lines (Gain IQ Points / Sharpen
// Your Mind / Elevate Your Thinking), which is the one moment the brand explains
// itself to someone who has not met it. The ladder keeps looping for as long
// as the reads take, so the hold is a loading state rather than a freeze, and
// the collapse onto the cap is unchanged.
//
// It is ONCE PER ET DAY and it now ALWAYS PLAYS on that first visit: the
// warm-cache floor that used to let it stand down is gone, because the opening
// is the brand moment and a return from a daily is not this screen's problem
// any more. Every OTHER uncached load gets the per-cell Patch on the home
// (app/StagePatch.jsx), which covers exactly the figures that are waiting and
// nothing else. So a reader sees this door once a day, and never a full screen
// on the way back from a game.
import { useEffect, useMemo, useRef, useState } from 'react';
import { DAILY_GAME_MAP } from '@/lib/daily-games';
import { RAMP_ORDER, CATEGORY_RAMP, RAMP_INK } from '@/lib/category-ramp';
import MindLoftMark from './MindLoftMark';
import { fetchDayStatus, etToday } from './useDayStats';

// ── the ending's constants, not a new set ──────────────────────────────────
// THE OPENING: bands up by ~1.05s, the wipe from 1.15s, the words at 1.6s.
// Fixed, so it reads the same on a warm cache as on a cold one.
const RAMP_WORDS = 1600;
const FLOOD_MIN = RAMP_WORDS + 600;   // the words alone, before any figure
const FLOOD_COUNT = 820;    // the lead's climb, which is also its dwell
// LONGER THAN THE ENDING'S, DELIBERATELY (owner, live, 2026-08-31: "the stats
// flash too quickly to read"). The ending can stamp at 380 and settle at 420
// because the card underneath repeats every figure in place, so a reader who
// missed one just reads it again. HERE THE FLOOD IS THE ONLY PLACE SOME OF
// THEM ARE EVER SAID: the cap carries the IQ and the rank, and nothing on the
// page says which game you are most improved at. So each figure gets long
// enough to land and the finished set is held for over a second.
const FLOOD_STAMP = 560;    // every other figure lands this far after the last
// THE RECAP'S ROWS GET LESS, and it is not a compromise on the owner's "too
// quick to read". Those 560ms are for figures that differ from each other, so
// each one has to be parsed on arrival. A recap row is the SAME SHAPE every
// time (a place, a game), so after the first one the reader is reading a value
// rather than working out what they are looking at. Uncapped by owner ruling
// 2026-08-31, so a ten-game day is a real list and the per-row cost is what
// keeps it from being a minute long.
const FLOOD_ROW = 420;
// HOW LONG THE ARRIVAL WILL WAIT FOR THE RECAP, and it is a hard ceiling.
// Measured live 2026-08-31: daily-combined for a PAST date costs 3.2 to 4.5s
// cold and 66ms warm, and a cross-day arrival is always the cold path, because
// nobody has asked for that player's past-date board in the last 30 seconds.
// Without a ceiling the reader sits on a lead figure watching nothing happen
// for two and a half seconds, which is the same complaint as the stats going by
// too fast, from the other end. Past this the arrival proceeds with the figures
// it has and the recap simply does not appear.
const RECAP_WAIT = 2400 + RAMP_WORDS;
const FLOOD_SETTLE = 1200;  // a beat on the finished set, to read it whole
const FLOOD_SHRINK = 640;   // it collapses onto the cap's rectangle
const FLOOD_FADE = 200;     // colour onto colour, so the cap's words appear
// THE BACKSTOP IS 4s, NOT THE ENDING'S 12s. A finished game can hold a reader
// twelve seconds because they just finished something. An arrival cannot: past
// this the queue short-circuits, the flood leaves with what it has, and the cap
// fills in the rest when it lands.
const FLOOD_MAX = 4000 + RAMP_WORDS;
// ...BUT THE BACKSTOP CAPS THE WAIT, NOT A QUEUE THAT IS ALREADY PLAYING
// (owner, 2026-09-01: on a phone the arrival "seems to end prematurely"). A
// phone's cold read lands at three to four seconds, so its figures started
// walking with a second or two left on the 5.6s clock and the collapse cut
// them off mid-stamp: the reader saw two figures land and the screen leave.
// Past FLOOD_MAX a screen still WAITING leaves with what it has, as before; a
// screen whose figures have started finishes them. FLOOD_HARD is the ceiling
// on that: past it the screen goes whatever is left, so a long queue on a
// very slow read can never hold the home hostage.
const FLOOD_HARD = FLOOD_MAX + 4500;
// THE WARM-CACHE FLOOR, and the whole answer to the pop-up objection. If the
// read answers this fast the page was never waiting, so there is nothing to
// fill and nothing runs.
// A home rendered this long after the document loaded is a client-side
// navigation back to it, not an arrival. Same test FLOOD_FRESH makes.
// 8s rather than 2.5s (2026-09-01): performance.now() counts from navigation
// start, download and hydration included, and a phone on a mobile connection
// routinely reaches this effect past 2.5s, which read as "no arrival at all".
// A lingering document that routes back to the home is tens of seconds old,
// so the test still separates the two.
const FRESH = 8000;

const ease = (t) => 1 - Math.pow(1 - t, 3);

// The lead counts, because a number that lands is the one thing a reader
// watches. It owns its own frame loop so a tick re-renders this and nothing else.
function Count({ to, ms }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    let raf = 0;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / Math.max(1, ms));
      setV(to * ease(p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // A BACKSTOP, because requestAnimationFrame does not run in a throttled or
    // hidden tab and a number that never climbs reads as a real zero rather
    // than as a stalled animation. Measured: the lead showed "+0 IQ today" for
    // an entire sequence in a backgrounded frame. This guarantees the value
    // lands whatever the frame loop does.
    const settle = setTimeout(() => setV(to), ms + 140);
    return () => { cancelAnimationFrame(raf); clearTimeout(settle); };
  }, [to, ms]);
  return <>{Math.round(v).toLocaleString()}</>;
}

// ONE GREETING FOR EVERY CASE (owner, live, 2026-08-31: "it says 'back, [name]'
// this makes no sense"). The first pass varied the salutation by gap, which
// produced "Back, Gator85" on a resumption and read as a clipped fragment. The
// figures are what differ between arrivals; the greeting is just a greeting.
const HELLO = 'Welcome back, ';
// THE THREE LINES, for a reader with no footprint. They stamp in one at a time
// like figures, because on this screen they are the figures.
const LINES = [
  // Title case, and in THIS order (owner, 2026-09-04). Climb the Board came off:
  // it named a mechanic on the one screen whose job is to say what the site is for.
  { k: 'l1', line: true, v: 'Gain IQ Points' },
  { k: 'l2', line: true, v: 'Sharpen Your Mind' },
  { k: 'l3', line: true, v: 'Elevate Your Thinking' },
];
// Short names for the bands: the ramp's own order, two words at most.
const BAND_NAMES = { 'Crowd Psychology': 'Crowd' };

// A recap row is a place and a game, and it carries the field the same way the
// cap does (#3/91), so the two surfaces state a standing identically.
function rowsOf(recap) {
  if (!recap || !recap.length) return [];
  return recap.map((r) => ({
    k: r.k, row: true, v: '#' + r.rank,
    sub: r.field ? '/' + r.field : null,
    lab: r.name,
  }));
}

// WITHOUT THIS THE RECAP READS AS TODAY. A screen that says "Welcome back" over
// a date, then prints a row of placements, is claiming those are current unless
// something says otherwise.
function capOf(mdy) {
  const m = /^(\d+)-(\d+)-(\d+)$/.exec(String(mdy || ''));
  if (!m) return null;
  const d = new Date(Date.UTC(2000 + Number(m[3]), Number(m[1]) - 1, Number(m[2])));
  return 'Last time out · ' + d.toLocaleDateString('en-US',
    { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

function readName() {
  try {
    const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null');
    const n = id && (id.username || id.name);
    return typeof n === 'string' && n.trim() ? n.trim() : null;
  } catch (e) { return null; }
}

// M-D-YY, the shape every daily quizId carries, to an ET day count.
function daysBetween(mdy, todayYmd) {
  const m = /^(\d+)-(\d+)-(\d+)$/.exec(String(mdy || ''));
  if (!m) return null;
  const then = Date.UTC(2000 + Number(m[3]), Number(m[1]) - 1, Number(m[2]));
  const [Y, MM, D] = todayYmd.split('-').map(Number);
  const now = Date.UTC(Y, MM - 1, D);
  const d = Math.round((now - then) / 86400000);
  return d >= 0 && d < 3650 ? d : null;
}

// ONCE PER ET DAY, AND THAT IS THE POINT (owner, live, 2026-08-31: "this
// animation should not display EVERY time a person returns to main page. now it
// displays whenever a game completes and user goes back to main").
//
// The freshness test alone was never going to hold this: coming back from a
// finished game IS a fresh document load, so a player who plays six dailies got
// six arrivals. An arrival is a thing that happens when you arrive, not every
// time you pass through, and the figures are a day's figures, so the day is the
// right unit. Stamped the moment it decides to show, so a reload during the
// sequence cannot replay it either.
const DAY = 'sot_welcome_day';
export default function StageWelcome({ capRef }) {
  const [on, setOn] = useState(false);     // decided in an effect: server renders null
  const [data, setData] = useState(null);  // the daily-status payload
  const [settled, setSettled] = useState(false); // the read has answered, blank means blank
  // THE RECAP, and whether its read is done. Separate from `settled` because it
  // is a SECOND request that only a cross-day arrival makes, and the queue must
  // not treat "still fetching the recap" as "this reader has no figures".
  const [recap, setRecap] = useState(null);
  const [recapDone, setRecapDone] = useState(false);
  const [name, setName] = useState('');
  const [cold, setCold] = useState(false);  // no name: the mark and the three lines
  const today = useMemo(() => {
    try {
      const [Y, M, D] = etToday().split('-').map(Number);
      return new Date(Date.UTC(Y, M - 1, D)).toLocaleDateString('en-US',
        { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' });
    } catch (e) { return ''; }
  }, []);
  const [phase, setPhase] = useState('');  // '' -> up -> shrink -> out
  const [clip, setClip] = useState(null);
  const [held, setHeld] = useState(false);
  const [expired, setExpired] = useState(false);
  const [hard, setHard] = useState(false);
  const [shown, setShown] = useState(0);
  const doneRef = useRef(false);
  const goneRef = useRef(false);
  const stepRef = useRef(-1);
  // ONE list for every timer, cleared once on unmount. NOT a cleanup per effect:
  // the queue effects re-run as figures arrive, and a cleanup in one of them
  // would clear the collapse it had already scheduled and then decline to
  // reschedule it, stranding the reader on a full screen.
  const timers = useRef([]);
  const at = (ms, fn) => { timers.current.push(setTimeout(fn, ms)); };

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setPhase('');
    setOn(false);
  };

  // ── whether it runs at all ───────────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    let force = false, off = false;
    try {
      const q = new URLSearchParams(window.location.search);
      force = q.get('welcome') === '1';   // preview, for showing the owner
      off = q.get('welcome') === '0';     // the kill switch
    } catch (e) {}
    if (off) return;
    if (!force) {
      // Reduced motion gets none, exactly as the ending gives none.
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      // A page that has been open a while is a navigation back to the home, not
      // an arrival, and there is no fetch in flight to cover.
      if (typeof performance !== 'undefined' && performance.now() > FRESH) return;
      // A FIRST VISIT GETS THE DOOR TOO (owner, 2026-09-01: "new users first
      // visit to site should get the loading animation too"). This used to
      // stand down whenever `sot_theme_intro2` was unset, deferring to the
      // first-load theme flip; that flip is RETIRED (lib/stage-theme.js,
      // INTRO_RETIRED) and no longer stamps its key, so the check had quietly
      // become "never, for any new browser". The theme pop-up that replaced
      // the flip polls the DOM for this screen and waits its turn, so nothing
      // else owns the arrival now.
    }
    const who = readName();
    const day = etToday();
    if (!force) {
      try {
        if (localStorage.getItem(DAY) === day) return;
        localStorage.setItem(DAY, day);
      } catch (e) { return; }
    }
    setName(who || '');
    setCold(!who);

    // NO FLOOR ANY MORE: the day's first visit always gets the door. The
    // read is still the page's own memoised fetchDayStatus, so this costs no
    // request; it decides what the figures say, not whether the screen runs.
    // A read that answers empty is a settled answer (a guest has no figures,
    // and that is a fact rather than a wait).
    setOn(true);
    fetchDayStatus().then((d) => {
      if (!alive) return;
      if (d) setData(d);
      setSettled(true);
    }).catch(() => { if (alive) setSettled(true); });
    return () => { alive = false; };
  }, []);

  useEffect(() => () => { timers.current.forEach(clearTimeout); timers.current = []; }, []);

  // WHERE THEY PLACED, LAST TIME THEY PLAYED (owner, 2026-08-31). On a
  // cross-day arrival the figures that describe TODAY are all zero, and the
  // ones that are left (a streak, a site rank) are abstract standing. What a
  // returning player actually wants is the day they last played, so this reads
  // their per-game placements off it.
  //
  // ONE CALL, NO NEW ENDPOINT: /api/quiz/daily-combined already takes a date,
  // and its `me.perGame` carries an UNCAPPED registered-board rank per game
  // (the public board is sliced to ten, that map is not), so a 40th place reads
  // as truly as a 2nd. `lastPlayed` off daily-status is what says which day to
  // ask for, so nothing has to be guessed or stored.
  //
  // It is chained behind daily-status rather than fired in parallel, because
  // until that answers we do not know this is a cross-day arrival, and firing it
  // for everyone would put a second request on every homepage load to serve the
  // minority who see a recap. The lead figure lands off daily-status while this
  // is in flight, so the chain costs the sequence nothing.
  useEffect(() => {
    if (!on) return;
    // A read that settled empty has no last day to ask about.
    if (!data) { if (settled) setRecapDone(true); return; }
    const last = data.lastPlayed;
    const gap = daysBetween(last, etToday());
    if (data.playedToday || gap == null || gap < 1) { setRecapDone(true); return; }
    let alive = true;
    const p = new URLSearchParams();
    p.set('date', last);
    try {
      const a = localStorage.getItem('sot_quiz_anon'); if (a) p.set('anonId', a);
      const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null');
      if (id && id.email) p.set('email', id.email);
    } catch (e) {}
    fetch('/api/quiz/daily-combined?' + p.toString())
      .then((r) => r.json())
      .then((d) => {
        // Late is the same as never once the collapse is scheduled: adding rows
        // behind a screen that is already leaving would reopen a queue nobody
        // is watching.
        if (!alive || goneRef.current) return;
        const per = d && d.me && d.me.perGame;
        if (!per) { setRecapDone(true); return; }
        const fieldOf = new Map();
        for (const g of (d.games || [])) fieldOf.set(g.key, g.registered || g.field || null);
        const rows = Object.keys(per)
          .map((k) => {
            const r = per[k];
            const rank = r && typeof r.rank === 'number' ? r.rank : null;
            if (!rank) return null;
            // A FIELD OF ONE IS NOT A PLACEMENT. Measured on a real day, the
            // recap opened on "Sando #1 of 1", which reads as a joke and
            // discredits the twelve honest rows under it. Coming first among
            // nobody is not a finish, so it is not reported as one.
            const field = fieldOf.get(k) || null;
            if (field != null && field < 2) return null;
            const g = DAILY_GAME_MAP[k];
            return { k: 'g:' + k, rank, name: (g && g.name) || k, field };
          })
          .filter(Boolean)
          // BEST FIRST. The reader's best finish is the one worth opening on,
          // and a list that starts strong is read further than one that does not.
          .sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name));
        setRecap(rows);
        setRecapDone(true);
      })
      .catch(() => { if (alive) setRecapDone(true); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, data, settled]);

  // ── the case, and its figures ────────────────────────────────────────────
  const view = useMemo(() => {
    const today = etToday();
    if (cold) return { figs: LINES };
    if (!data) return { figs: [] };
    const gap = daysBetween(data.lastPlayed, today);
    const num = (v) => (typeof v === 'number' && isFinite(v) ? v : null);

    // RESUME. They have played today and come back, so the news is what moved
    // while they were away: other people played the day and their place on the
    // combined board went with it.
    if (data.playedToday) {
      const rank = num(data.dayRank);
      // PLACES MOVED TODAY, not the best-improved game (owner, live, 2026-08-31:
      // "i can't tell what the third stat is... four ten?"). The old figure put a
      // game NAME beside a signed number, and half this roster is named after
      // numbers (Four, Sixes), so it read as two numerals. That is structural
      // rather than one unlucky name, so the figure goes, not its label.
      //
      // WHICH BOARD, because the figure above it is a different one: rankChange
      // is movement on the global IQ board since the ET day started, and it is
      // the only "places moved today" the server keeps. A drop measured against
      // the reader's own earlier position on TODAY'S combined board would need a
      // history of that rank through the day, and nothing stores one.
      const moved = num(data.rankChange);
      const streak = num(data.streak);
      return {
        figs: [
          num(data.todayXp) ? { k: 'iq', lead: true, count: num(data.todayXp), pre: '+', lab: 'IQ today', good: true } : null,
          rank ? {
            k: 'pos', v: `#${rank}`,
            lab: num(data.dayField) ? `of ${data.dayField} today` : 'today',
          } : null,
          // Nobody passing you and you passing nobody is the common case for a
          // settled rank, so the streak stands in rather than leaving the row a
          // figure short.
          moved
            ? {
              k: 'moved', v: String(Math.abs(moved)),
              good: moved > 0, bad: moved < 0,
              lab: moved > 0 ? 'places gained today' : 'places lost today',
            }
            : (streak ? { k: 'streak', v: String(streak), lab: 'day streak' } : null),
        ].filter(Boolean),
      };
    }

    // NEW DAY. The board is untouched, so every figure about today is zero. The
    // streak is what is at stake and the rank is what still stands.
    if (gap === 1) {
      const st = num(data.streak);
      return {
        caption: capOf(data.lastPlayed),
        figs: [
          st ? { k: 'streak', lead: true, count: st, lab: 'day streak' } : null,
          ...rowsOf(recap),
        ].filter(Boolean),
      };
    }

    // AWAY. Not a greeting, a re-orientation. The absence is stated as a figure
    // and never as a verdict: no scolding, and the spent streak is reported as
    // the best it reached rather than as something lost.
    if (gap != null && gap >= 2) {
      const rows = rowsOf(recap);
      return {
        caption: rows.length ? capOf(data.lastPlayed) : null,
        figs: [
          { k: 'away', lead: true, count: gap, lab: gap === 1 ? 'day away' : 'days away' },
          // A long absence often has no recap worth showing (the last day was
          // months ago, or they placed in nothing), so the standing figures stay
          // as the fallback rather than leaving the arrival a lead and nothing.
          ...(rows.length ? rows : [
            num(data.communityRank) ? {
              k: 'rank', v: `#${data.communityRank.toLocaleString()}`,
              lab: num(data.communityTotal) ? `of ${data.communityTotal.toLocaleString()}` : 'rank',
            } : null,
            num(data.streakGameDays) >= 2 ? { k: 'best', v: String(data.streakGameDays), lab: 'best streak' } : null,
          ]),
        ].filter(Boolean),
      };
    }

    return { figs: [] };
  }, [data, recap, cold]);

  // ── the two edges of the hold, anchored to mount ─────────────────────────
  useEffect(() => {
    if (!on) return;
    at(20, () => setPhase('up'));
    at(FLOOD_MIN, () => setHeld(true));
    at(FLOOD_MAX, () => setExpired(true));
    at(FLOOD_HARD, () => setHard(true));
    at(RECAP_WAIT, () => setRecapDone(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on]);

  // ── walking the queue, one step per effect run ───────────────────────────
  useEffect(() => {
    if (!on || !held || goneRef.current) return;
    const figs = view.figs;
    // Still reading and nothing to show yet: hold here. That is the wait. The
    // recap is a second read, so a cross-day arrival is not "settled" until it
    // has answered, or the whole list would be skipped as an empty one.
    const ready = settled && recapDone;
    if (!ready && !expired && shown >= figs.length) return;
    if (shown >= figs.length) return;
    // ONE DWELL PER STEP, guarded by a ref: this effect re-runs whenever the
    // payload arrives, and a dwell scheduled with a cleanup would be cancelled
    // and restarted, so a figure could sit for two dwells.
    if (stepRef.current === shown) return;
    stepRef.current = shown;
    const next = figs[shown];
    // ITS DWELL IS ITS COUNT, so the screen cannot leave mid-climb.
    at(next.lead ? FLOOD_COUNT + 180 : (next.row ? FLOOD_ROW : FLOOD_STAMP), () => setShown((s) => s + 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, held, shown, view, settled, recapDone, expired]);

  // ── the collapse, once the queue has run out ─────────────────────────────
  useEffect(() => {
    if (!on || !held || goneRef.current) return;
    const ran = shown >= view.figs.length;
    // The figures are on screen and walking: let them finish (FLOOD_HARD is
    // the only thing that cuts a started queue). Only a screen still WAITING
    // for its reads leaves at FLOOD_MAX.
    const walking = settled && recapDone && view.figs.length > 0;
    // A settled read with no figures at all is not an arrival worth holding.
    if (!ran && !hard && (!expired || walking)) return;
    if ((!settled || !recapDone) && !expired && !hard) return;
    goneRef.current = true;
    at(FLOOD_SETTLE, () => {
      const el = capRef && capRef.current;
      // ON A PHONE THE SCREEN FADES WHOLE (owner, 2026-09-02: "a black box
      // lingers for .25 seconds at the header area"). The collapse onto the
      // cap's rectangle reads as the colour landing where it belongs on a wide
      // screen; on a phone the cap is a short dark bar across the top and the
      // clipped curtain sat on it as a black block until the fade ran out.
      const phone = window.innerWidth <= 640;
      if (!el || phone) { setPhase('out'); at(FLOOD_FADE, finish); return; }
      // MEASURED LATE, on purpose: by now the page has settled, so the rectangle
      // the colour lands on is the one it will still be sitting on.
      const r = el.getBoundingClientRect();
      const w = window.innerWidth, h = window.innerHeight;
      setClip(`inset(${Math.max(0, r.top)}px ${Math.max(0, w - r.right)}px ${Math.max(0, h - r.bottom)}px ${Math.max(0, r.left)}px)`);
      setPhase('shrink');
      at(FLOOD_SHRINK + 40, () => setPhase('out'));
      at(FLOOD_SHRINK + 40 + FLOOD_FADE, finish);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, held, shown, view, settled, recapDone, expired, hard]);

  // Any key skips, exactly as any tap does.
  useEffect(() => {
    if (!on) return;
    const k = () => finish();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on]);

  if (!on) return null;

  return (
    // aria-hidden because every word on it is read again, in place, on the cap
    // underneath, and there is nothing focusable inside it to strand.
    <div
      className={'stw' + (phase ? ' ' + phase : '')}
      aria-hidden="true"
      onClick={finish}
      style={clip ? { clipPath: clip, WebkitClipPath: clip } : undefined}
    >
      <style>{CSS}</style>
      {/* THE RAMP. Ten bands in ramp order, each naming its category in the
          ramp's ink. THE CURTAIN IS DARK IN BOTH REGISTERS, and the bands are
          the DARK register's pastels in both (owner, 2026-09-01, settled after a
          register-aware cut and a greyscale cut were both turned down: "just
          make it dark mode color strip even if light mode"). Earlier ruling:
          "suits the dark mode but not the light mode"): on the pale register the
          first cut painted the page's own ground, and a pale full screen with
          ten deep bands and a ladder of pastels on white read as a blank sheet
          with a sentence on it. The door is one object, the near-black ground
          with the pastel ramp on it, whichever register the page behind it is
          in; the collapse then lands on the cap and fades, which on the pale
          register is a 200ms cross-fade rather than colour onto colour. */}
      <div className="stw-bands" aria-hidden="true">
        {RAMP_ORDER.map((cat, i) => (
          <span key={cat} className="stw-b"
            style={{ background: CATEGORY_RAMP[i], animationDelay: `${0.05 + i * 0.075}s` }}>
            <i style={{ color: RAMP_INK }}>{BAND_NAMES[cat] || cat}</i>
          </span>
        ))}
      </div>
      <div className="stw-wipe" aria-hidden="true" />
      {/* THE LADDER along the foot is the hold: it keeps lighting rung by rung
          for as long as the reads take, so a slow read never looks like a
          frozen screen. Same ten colours, same order, as the Patch's loop. */}
      <div className="stw-lad" aria-hidden="true">
        {CATEGORY_RAMP.map((c, i) => <i key={c} style={{ background: c, animationDelay: `${i * 0.1}s` }} />)}
      </div>
      <div className="stw-in">
        {cold ? (
          <>
            <div className="stw-mark"><MindLoftMark size={72} ink="#e9edf4" accent="#7dd3fc" /></div>
            <div className="stw-nm stw-wm">Mind <em>Loft</em></div>
          </>
        ) : (
          <>
            {/* THE DATE, not a per-case label: it is local, so it paints with the
                name rather than waiting on the read, and it is the same line the
                cap carries two rows down. */}
            <span className="stw-eye">{today}</span>
            <div className="stw-nm"><span className="stw-hand">{HELLO}</span>{name}</div>
          </>
        )}
        {/* Each figure mounts when the queue reaches it, so the stamp is an
            animation on mount rather than a class anyone has to toggle. */}
        <div className="stw-figs">
          {/* It lands with the first placement rather than up front, so the
              lead figure is not sharing its moment with a heading. */}
          {view.caption && shown > 0 && view.figs.some((f, i) => f.row && i < shown)
            ? <div className="stw-cap">{view.caption}</div> : null}
          {view.figs.map((f, i) => (i < shown ? (
            <div key={f.k} className={'stw-fig' + (f.lead ? ' lead' : '') + (f.row ? ' row' : '') + (f.good ? ' good' : '') + (f.line ? ' line' : '')}>
              <b>
                {f.count != null
                  ? <>{f.pre || ''}<Count to={f.count} ms={FLOOD_COUNT} /></>
                  : f.v}
                {f.sub ? <i className={f.bad ? 'dn' : 'up'}>{f.sub}</i> : null}
              </b>
              {f.lab ? <i className="cl">{f.lab}</i> : null}
            </div>
          ) : null))}
        </div>
      </div>
    </div>
  );
}

const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

const CSS = `
.stw{position:fixed;inset:0;z-index:9000;cursor:pointer;display:grid;place-items:center;
  padding:clamp(48px,12vh,120px) 20px 24px;
  background:#0b0f1a;color:#e9edf4;
  opacity:0;-webkit-clip-path:inset(0 0 0 0);clip-path:inset(0 0 0 0);
  transition:opacity 180ms ease,clip-path ${FLOOD_SHRINK}ms cubic-bezier(.2,.8,.25,1),
    -webkit-clip-path ${FLOOD_SHRINK}ms cubic-bezier(.2,.8,.25,1);}
/* The ground does not change colour to greet anyone: the only lift is a wash
   under the name, so the one thing spending colour is the figures. */
.stw::after{content:'';position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(120% 78% at 50% 38%,rgba(255,255,255,.055),transparent 72%);}
.stw.up,.stw.shrink{opacity:1;}

/* THE BANDS rise from the foot, staggered in ramp order; each names itself once
   it is up. They are BEHIND the wipe and the words (z 1), so the wipe reads as
   the page reclaiming the screen. */
.stw-bands{position:absolute;inset:0 0 6px 0;z-index:1;display:flex;}
.stw-b{position:relative;flex:1;transform:scaleY(0);transform-origin:50% 100%;}
.stw.up .stw-b{animation:stw-band .5s cubic-bezier(.2,.8,.2,1) forwards;}
/* VERTICAL TEXT BY WRITING MODE, not by rotating a horizontal box (owner,
   2026-09-02: on a phone "the categories ... bleed into each other"). A
   rotated box is still LAID OUT horizontally, so translateX(-50%) centred it by
   half the WORD's width and the rotation then swung it off its own band into
   the neighbour's; at ten bands across a 390px screen every label overlapped
   the next. In vertical-rl the box IS narrow and tall, so centring on left:50%
   is exact, and the label reads bottom-to-top like a spine. */
.stw-b i{position:absolute;left:50%;bottom:clamp(14px,4vh,40px);
  writing-mode:vertical-rl;transform:translateX(-50%) rotate(180deg);
  white-space:nowrap;font-style:normal;font-weight:900;
  font-size:clamp(11px,1.2vw,14px);letter-spacing:.12em;text-transform:uppercase;opacity:0;}
.stw.up .stw-b i{animation:stw-fade .3s .85s both;}
@keyframes stw-band{to{transform:scaleY(1);}}
@keyframes stw-fade{to{opacity:1;}}
/* THE WIPE: the ground itself, scaling in from the left, stops short of the
   ladder strip so the bands survive there as the foot. */
.stw-wipe{position:absolute;inset:0 0 6px 0;z-index:1;background:#0b0f1a;
  transform:scaleX(0);transform-origin:0 50%;}
.stw.up .stw-wipe{animation:stw-wipe .55s ${RAMP_WORDS - 450}ms cubic-bezier(.6,0,.2,1) forwards;}
@keyframes stw-wipe{to{transform:scaleX(1);}}
/* THE LADDER, the hold. Lit rung by rung, looping, until the collapse. */
.stw-lad{position:absolute;left:0;right:0;bottom:0;height:6px;z-index:1;display:flex;gap:2px;}
.stw-lad i{flex:1;opacity:.28;}
.stw.up .stw-lad i{animation:stw-rung 1.2s ${RAMP_WORDS}ms linear infinite;}
@keyframes stw-rung{0%{opacity:.28}12%{opacity:1}45%{opacity:.28}100%{opacity:.28}}
/* THE WORDS wait for the wipe. */
.stw.up .stw-in{transition-delay:${RAMP_WORDS}ms;}
.stw.shrink .stw-in{transition-delay:0ms;}
.stw-mark{margin-bottom:14px;animation:stw-stamp 420ms cubic-bezier(.2,.9,.3,1.3) both;}
.stw-nm.stw-wm em{font-style:normal;color:#7dd3fc;}
/* A LINE is a figure-sized sentence: it takes the stamp and a dot in the brand
   blue, and no caption under it. */
.stw-fig.line b{font-size:clamp(17px,2.4vw,26px);font-weight:700;letter-spacing:-.01em;}
.stw-fig.line b::before{content:'';display:inline-block;width:.42em;height:.42em;border-radius:50%;
  background:#7dd3fc;margin-right:.5em;vertical-align:middle;}
/* The clip has landed by now, so the colour is exactly the cap: fading it out
   is colour onto colour and what appears through it is the cap's own words. */
.stw.out{opacity:0;transition:opacity ${FLOOD_FADE}ms ease;}

.stw-in{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;
  width:100%;opacity:0;transform:translateY(9px);
  transition:opacity .34s ease,transform .34s ease;}
.stw.up .stw-in,.stw.shrink .stw-in{opacity:1;transform:none;}
.stw.shrink .stw-in{opacity:0;transform:translateY(-15px);
  transition:opacity .22s ease,transform .3s ease;}

.stw-eye{font-family:${MONO};font-size:clamp(9px,1.2vw,11px);letter-spacing:.19em;
  text-transform:uppercase;font-weight:700;opacity:.6;}
.stw-nm{margin-top:10px;font-size:clamp(34px,7.4vw,88px);font-weight:800;
  letter-spacing:-.04em;line-height:.98;text-wrap:balance;text-align:center;}
/* It is quieter than the name and still has to READ (owner, live, 2026-08-31:
   "is the text too dark and blends in?"). .45 on this ground put it near the
   floor, so it takes the ink token one step down instead of an opacity. */
.stw-hand{color:#aab5c7;font-weight:600;}

.stw-figs{margin-top:26px;display:flex;flex-wrap:wrap;justify-content:center;
  align-items:flex-end;gap:16px 42px;max-width:1000px;}
/* THE STAMP, the ending's own: an overshoot on the way down, so a figure LANDS
   rather than fades. It is the one motion here that says a number just arrived.
   The fill holds the end state, since each figure mounts once and never leaves. */
.stw-fig{flex:none;text-align:center;animation:stw-stamp 300ms cubic-bezier(.2,.9,.3,1.3) both;}
.stw-fig b{display:block;font-size:clamp(24px,4.2vw,44px);font-weight:800;line-height:.92;
  letter-spacing:-.03em;font-variant-numeric:tabular-nums;}
.stw-fig b i{font-style:normal;font-weight:700;font-size:.52em;margin-left:5px;opacity:.9;}
.stw-fig b i.up{color:#6ee7b7;}
.stw-fig b i.dn{color:#fb7185;}
.stw-fig i.cl{display:block;font-style:normal;font-family:${MONO};
  font-size:clamp(9px,1.15vw,11px);letter-spacing:.16em;text-transform:uppercase;
  opacity:.72;margin-top:9px;}
.stw-fig.good b{color:#6ee7b7;}
/* A RECAP ROW IS SMALLER THAN A FIGURE, because there can be ten of them and
   they are a list rather than a headline. The value keeps tabular numerals so
   the places line up as they wrap. */
.stw-fig.row b{font-size:clamp(19px,2.6vw,27px);}
.stw-fig.row b i{font-size:.5em;opacity:.55;margin-left:2px;}
.stw-fig.row i.cl{font-size:clamp(8.5px,1vw,10px);letter-spacing:.13em;margin-top:6px;opacity:.66;}
/* The heading for the list, on its own line above it. */
.stw-cap{flex-basis:100%;text-align:center;margin-bottom:2px;
  font-family:${MONO};font-size:clamp(9px,1.1vw,10.5px);letter-spacing:.17em;
  text-transform:uppercase;font-weight:700;opacity:.5;
  animation:stw-stamp 300ms cubic-bezier(.2,.9,.3,1.3) both;}
/* The lead takes a line of its own at display size and the rest land in a row
   underneath it, exactly as the ending sets the IQ over its standings. */
.stw-fig.lead{flex-basis:100%;}
.stw-fig.lead b{font-size:clamp(46px,10vw,110px);line-height:.9;letter-spacing:-.05em;}
.stw-fig.lead i.cl{font-size:clamp(10px,1.4vw,13px);letter-spacing:.18em;opacity:.78;margin-top:12px;}
@keyframes stw-stamp{
  from{opacity:0;transform:translateY(10px) scale(1.26);}
  to{opacity:1;transform:none;}
}

@media (max-width:640px){
  .stw{padding:clamp(56px,13vh,120px) 16px 20px;}
  /* Larger and heavier on a phone, where the bands are 39px wide and the
     label is the only thing telling them apart. */
  .stw-b i{font-size:12px;font-weight:900;letter-spacing:.1em;bottom:12px;}
  .stw-figs{margin-top:20px;gap:12px 26px;}
  .stw-fig i.cl{margin-top:7px;}
}
@media (prefers-reduced-motion: reduce){
  .stw,.stw-in,.stw-fig,.stw-b,.stw-b i,.stw-wipe,.stw-lad i,.stw-mark{transition:none !important;animation:none !important;}
  .stw-b{transform:none;} .stw-wipe{transform:none;} .stw-b i{opacity:1;}
}
`;
