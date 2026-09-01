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
import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchDayStatus, etToday } from './useDayStats';

// ── the ending's constants, not a new set ──────────────────────────────────
const FLOOD_MIN = 600;      // the name alone, before any figure
const FLOOD_COUNT = 820;    // the lead's climb, which is also its dwell
// LONGER THAN THE ENDING'S, DELIBERATELY (owner, live, 2026-08-31: "the stats
// flash too quickly to read"). The ending can stamp at 380 and settle at 420
// because the card underneath repeats every figure in place, so a reader who
// missed one just reads it again. HERE THE FLOOD IS THE ONLY PLACE SOME OF
// THEM ARE EVER SAID: the cap carries the IQ and the rank, and nothing on the
// page says which game you are most improved at. So each figure gets long
// enough to land and the finished set is held for over a second.
const FLOOD_STAMP = 560;    // every other figure lands this far after the last
const FLOOD_SETTLE = 1200;  // a beat on the finished set, to read it whole
const FLOOD_SHRINK = 640;   // it collapses onto the cap's rectangle
const FLOOD_FADE = 200;     // colour onto colour, so the cap's words appear
// THE BACKSTOP IS 4s, NOT THE ENDING'S 12s. A finished game can hold a reader
// twelve seconds because they just finished something. An arrival cannot: past
// this the queue short-circuits, the flood leaves with what it has, and the cap
// fills in the rest when it lands.
const FLOOD_MAX = 4000;
// THE WARM-CACHE FLOOR, and the whole answer to the pop-up objection. If the
// read answers this fast the page was never waiting, so there is nothing to
// fill and nothing runs.
const FLOOR = 260;
// A home rendered this long after the document loaded is a client-side
// navigation back to it, not an arrival. Same test FLOOD_FRESH makes.
const FRESH = 2500;

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
  const [name, setName] = useState('');
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
      // THE FIRST-LOAD THEME INTRO OWNS ITS VISIT. It runs dark to light to dark
      // from 850ms to 2350ms and is once per browser; this is every visit, so
      // the intro takes that one and this stands down. Two full-screen events
      // cannot share a page load.
      try { if (!localStorage.getItem('sot_theme_intro2')) return; } catch (e) { return; }
    }
    const who = readName();
    if (!who && !force) return;   // no name, no gap, nothing to welcome
    const day = etToday();
    if (!force) {
      try {
        if (localStorage.getItem(DAY) === day) return;
        localStorage.setItem(DAY, day);
      } catch (e) { return; }
    }
    setName(who || 'you');

    // THE FLOOR. fetchDayStatus is memoised and the page fetches it anyway, so
    // this costs no request. If it answers inside FLOOR the page was never
    // waiting and nothing runs.
    // THE PREVIEW MUST NOT BE DEFEATED BY THE FLOOR. ?welcome=1 always plays,
    // including when the read answers instantly, because otherwise the one way
    // to look at this is to be unlucky with the cache.
    if (force) setOn(true);
    let fast = false;
    const floor = force ? null : setTimeout(() => { if (alive && !fast) setOn(true); }, FLOOR);
    fetchDayStatus().then((d) => {
      if (!alive) return;
      if (!d) { if (!force) { fast = true; if (floor) clearTimeout(floor); } return; }
      setData(d);
      setSettled(true);
      // Stamp the place we are about to show, so the NEXT arrival can say what
      // moved. Read before the write happens below, in the figure builder.
    });
    return () => { alive = false; if (floor) clearTimeout(floor); };
  }, []);

  useEffect(() => () => { timers.current.forEach(clearTimeout); timers.current = []; }, []);

  // ── the case, and its figures ────────────────────────────────────────────
  const view = useMemo(() => {
    const today = etToday();
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
        figs: [
          st ? { k: 'streak', lead: true, count: st, lab: 'day streak' } : null,
          num(data.communityRank) ? {
            k: 'rank', v: `#${data.communityRank.toLocaleString()}`,
            lab: num(data.communityTotal) ? `of ${data.communityTotal.toLocaleString()}` : 'rank',
          } : null,
        ].filter(Boolean),
      };
    }

    // AWAY. Not a greeting, a re-orientation. The absence is stated as a figure
    // and never as a verdict: no scolding, and the spent streak is reported as
    // the best it reached rather than as something lost.
    if (gap != null && gap >= 2) {
      return {
        figs: [
          { k: 'away', lead: true, count: gap, lab: gap === 1 ? 'day away' : 'days away' },
          num(data.communityRank) ? {
            k: 'rank', v: `#${data.communityRank.toLocaleString()}`,
            lab: num(data.communityTotal) ? `of ${data.communityTotal.toLocaleString()}` : 'rank',
          } : null,
          num(data.streakGameDays) >= 2 ? { k: 'best', v: String(data.streakGameDays), lab: 'best streak' } : null,
        ].filter(Boolean),
      };
    }

    return { figs: [] };
  }, [data]);

  // ── the two edges of the hold, anchored to mount ─────────────────────────
  useEffect(() => {
    if (!on) return;
    at(20, () => setPhase('up'));
    at(FLOOD_MIN, () => setHeld(true));
    at(FLOOD_MAX, () => setExpired(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on]);

  // ── walking the queue, one step per effect run ───────────────────────────
  useEffect(() => {
    if (!on || !held || goneRef.current) return;
    const figs = view.figs;
    // Still reading and nothing to show yet: hold here. That is the wait.
    if (!settled && !expired && shown >= figs.length) return;
    if (shown >= figs.length) return;
    // ONE DWELL PER STEP, guarded by a ref: this effect re-runs whenever the
    // payload arrives, and a dwell scheduled with a cleanup would be cancelled
    // and restarted, so a figure could sit for two dwells.
    if (stepRef.current === shown) return;
    stepRef.current = shown;
    const next = figs[shown];
    // ITS DWELL IS ITS COUNT, so the screen cannot leave mid-climb.
    at(next.lead ? FLOOD_COUNT + 180 : FLOOD_STAMP, () => setShown((s) => s + 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, held, shown, view, settled, expired]);

  // ── the collapse, once the queue has run out ─────────────────────────────
  useEffect(() => {
    if (!on || !held || goneRef.current) return;
    const ran = shown >= view.figs.length;
    // A settled read with no figures at all is not an arrival worth holding.
    if (!ran && !expired) return;
    if (!settled && !expired) return;
    goneRef.current = true;
    at(FLOOD_SETTLE, () => {
      const el = capRef && capRef.current;
      if (!el) { setPhase('out'); at(FLOOD_FADE, finish); return; }
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
  }, [on, held, shown, view, settled, expired]);

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
      <div className="stw-in">
        {/* THE DATE, not a per-case label: it is local, so it paints with the
            name rather than waiting on the read, and it is the same line the
            cap carries two rows down. */}
        <span className="stw-eye">{today}</span>
        <div className="stw-nm"><span className="stw-hand">{HELLO}</span>{name}</div>
        {/* Each figure mounts when the queue reaches it, so the stamp is an
            animation on mount rather than a class anyone has to toggle. */}
        <div className="stw-figs">
          {view.figs.map((f, i) => (i < shown ? (
            <div key={f.k} className={'stw-fig' + (f.lead ? ' lead' : '') + (f.good ? ' good' : '')}>
              <b>
                {f.count != null
                  ? <>{f.pre || ''}<Count to={f.count} ms={FLOOD_COUNT} /></>
                  : f.v}
                {f.sub ? <i className={f.bad ? 'dn' : 'up'}>{f.sub}</i> : null}
              </b>
              <i className="cl">{f.lab}</i>
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
  background:var(--stg-ground,#0b0f1a);color:var(--stg-ink,#e9edf4);
  opacity:0;-webkit-clip-path:inset(0 0 0 0);clip-path:inset(0 0 0 0);
  transition:opacity 180ms ease,clip-path ${FLOOD_SHRINK}ms cubic-bezier(.2,.8,.25,1),
    -webkit-clip-path ${FLOOD_SHRINK}ms cubic-bezier(.2,.8,.25,1);}
/* The ground does not change colour to greet anyone: the only lift is a wash
   under the name, so the one thing spending colour is the figures. */
.stw::after{content:'';position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(120% 78% at 50% 38%,rgba(var(--stg-lift,255,255,255),.055),transparent 72%);}
.stw.up,.stw.shrink{opacity:1;}
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
.stw-hand{color:var(--stg-ink2,#aab5c7);font-weight:600;}

.stw-figs{margin-top:26px;display:flex;flex-wrap:wrap;justify-content:center;
  align-items:flex-end;gap:16px 42px;}
/* THE STAMP, the ending's own: an overshoot on the way down, so a figure LANDS
   rather than fades. It is the one motion here that says a number just arrived.
   The fill holds the end state, since each figure mounts once and never leaves. */
.stw-fig{flex:none;text-align:center;animation:stw-stamp 300ms cubic-bezier(.2,.9,.3,1.3) both;}
.stw-fig b{display:block;font-size:clamp(24px,4.2vw,44px);font-weight:800;line-height:.92;
  letter-spacing:-.03em;font-variant-numeric:tabular-nums;}
.stw-fig b i{font-style:normal;font-weight:700;font-size:.52em;margin-left:5px;opacity:.9;}
.stw-fig b i.up{color:var(--stg-up,#6ee7b7);}
.stw-fig b i.dn{color:var(--stg-dn,#fb7185);}
.stw-fig i.cl{display:block;font-style:normal;font-family:${MONO};
  font-size:clamp(9px,1.15vw,11px);letter-spacing:.16em;text-transform:uppercase;
  opacity:.72;margin-top:9px;}
.stw-fig.good b{color:var(--stg-up,#6ee7b7);}
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
  .stw-figs{margin-top:20px;gap:12px 26px;}
  .stw-fig i.cl{margin-top:7px;}
}
@media (prefers-reduced-motion: reduce){
  .stw,.stw-in,.stw-fig{transition:none !important;animation:none !important;}
}
`;
