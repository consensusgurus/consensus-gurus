'use client';

// DailyFiveBand — the run strip at the top of the console (owner, 2026-08-17).
//
// Five dailies, one from each of five different categories, played as one
// sitting, with a board that ranks on the COMBINED placement across all five.
// The roster for each date lives in lib/daily-five.js; this is the surface that
// starts a run and shows where you are in it.
//
// PLACEMENT. Between the console's title band and its cap cards, so it is the
// first thing on the console and the first thing the eye lands on, and so the
// cap keeps all three of its cards. It is the only GOLD-ruled thing on the
// surface, which is deliberate: an open run is unfinished business, and gold is
// already what this console paints unfinished business with.
//
// IT COSTS ONE REQUEST, and only one. /api/quiz/daily-combined?five=1 answers
// every question the band asks at once: which of the five published today, what
// each paid the viewer, the viewer's combined total and rank, and the top of the
// board. The `five=1` flag narrows that route's slate to the day's five and sets
// bestN to 5; nothing else about it changes, which is why the run needs no
// scoring code, no table and no comparator of its own. See lib/daily-five.
//
// THE DAY IS READ IN AN EFFECT, never during render. The server has no idea
// what "today in Eastern" is at the moment this component renders, so computing
// it during render makes the first client paint disagree with the server's and
// React throws. Null until mounted, so the band is simply absent for a frame
// rather than flashing the wrong day. Same rule isSundayET follows.

import React, { useEffect, useState, useRef } from 'react';
import { Play, Trophy, ChevronLeft, ChevronRight, LayoutGrid, Share2 } from 'lucide-react';
import { fiveFor, FIVE_NAME } from '@/lib/daily-five';
import { ALL_CIRCUITS, MARQUEE_ID, circuitById, circuitKeysFor, circuitHref, isMarquee,
         circuitPageHref, circuitShareInvite, circuitShareUrl } from '@/lib/circuits';
import { notifyShareCredit } from './ShareCreditPop';
import { withRef } from '@/lib/referrals';
import { isMobileDevice } from '@/lib/is-mobile';
import { DAILY_GAME_MAP } from '@/lib/daily-games';
import { dailyMeIdentity } from './dailyMeClient';

const etToday = () => {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
};

const CAT_SHORT = { 'Crowd Psychology': 'Crowd' };
// The Loft's beat. One rhythm on the console rather than two.
const ROTATE_MS = 8000;

// The rotation lives in its own component so the interval's effect depends on
// nothing but the two things that actually govern it. Inside the band it would
// have had to list sel, hover, pick, open and popen, and every one of those
// changing would tear the timer down and restart it — which is how a "rotate
// every 8 seconds" quietly becomes "rotate 8 seconds after whatever you last
// did". onTick is kept in a ref for the same reason: it closes over sel, so it
// is a new function on every render.
//
// An auto-advancing carousel is exactly what prefers-reduced-motion is for, so
// it does not run at all for a reader who has asked for less of it.
function RotateEvery({ ms, on, onTick }) {
  const cb = useRef(onTick);
  cb.current = onTick;
  useEffect(() => {
    if (!on) return undefined;
    try {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    } catch (e) { /* no matchMedia is not a reason to skip the rotation */ }
    const t = setInterval(() => cb.current(), ms);
    return () => clearInterval(t);
  }, [on, ms]);
  return null;
}
const fmtPts = (n) => (Math.round(Number(n) * 10) / 10);

export default function DailyFiveBand() {
  const [day, setDay] = useState(null);
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(false);
  // Separate from `open` on purpose: `open` is the leaderboard, which desktop
  // and phone share, and `popen` is the phone-only list of the five, which
  // desktop always shows. One flag for both would mean opening the board on a
  // phone also unfolded the games, or the reverse.
  const [popen, setPopen] = useState(false);
  // WHICH CIRCUIT THE BAND IS SHOWING (owner, 2026-08-18). The marquee, the
  // Daily Five, is the default on every load; the arrows and the picker move
  // it. Deliberately NOT persisted: opening on the marquee every time is what
  // makes it the marquee. `pick` is the All-14 overlay, kept separate from
  // `open` (the leaderboard) and `popen` (the phone's list of the five) for the
  // same reason those two are separate from each other.
  const [sel, setSel] = useState(MARQUEE_ID);
  const [pick, setPick] = useState(false);
  // The FULL slate's payload, fetched LAZILY the first time the picker opens.
  // It is the only way to know how far along the other thirteen circuits are,
  // since a narrowed payload carries only the selected circuit's games, and
  // fetching it eagerly would double the band's cost for a panel most readers
  // never open. One extra fetch per page load, at most.
  const [pickData, setPickData] = useState(null);
  // AUTO-ROTATION. The band cycles the fourteen on the same 8s beat the Loft's
  // faces use, so the console has one rhythm rather than two. It stops the
  // moment the reader takes control and never restarts: moving the page under
  // somebody who has just chosen a circuit is worse than never having rotated.
  // It also holds while the pointer is over the band, while the picker is open
  // and while the leaderboard is expanded, because all three mean the reader is
  // reading THIS one.
  const [held, setHeld] = useState(false);
  const [hover, setHover] = useState(false);
  // ROTATION WITHOUT A REQUEST PER TICK. Every selection fetches its own board,
  // so a naive 8s rotation is a fetch every 8 seconds, for the whole time the
  // page is open, from every reader — which is exactly the egress the daily
  // caches exist to avoid. Each circuit is therefore fetched AT MOST ONCE per
  // page load and served from here after that. The cache is cleared, not
  // consulted, when a game finishes anywhere on the site.
  const boardCache = useRef(new Map());

  useEffect(() => {
    const d = etToday();
    setDay(d);
    // THE MARQUEE'S BANK CAN RUN OUT and the thirteen fixed circuits cannot, so
    // an unbanked date now opens on the first skill circuit rather than taking
    // the whole band down with it. Rendering nothing was the correct degrade
    // for a run that was only the Five; for a family of fourteen it is not.
    if (!fiveFor(d).length && ALL_CIRCUITS.length > 1) setSel(ALL_CIRCUITS[1].id);
  }, []);

  // THE BOARD BELOW IS MEASURED TO THE FOLD, so anything that changes this
  // band's height has to tell it. DailyStrip sets --dh-fit from the board's own
  // document top and re-runs on resize, on a cap ResizeObserver and on two late
  // timers; the band is neither the cap nor a resize, so opening the leaderboard
  // would otherwise leave the board ~200px too tall and running past the fold.
  // Mounting is already covered by those timers (this renders at hydration, well
  // inside 450ms), but the toggle is not, so nudge it. Deliberately a resize
  // event rather than a new observer: the fit effect already debounces through
  // one rAF, and a second observer above the board is another way to build the
  // loop that effect's own comment warns about.
  useEffect(() => {
    if (!day) return;
    try { window.dispatchEvent(new Event('resize')); } catch (e) {}
  }, [open, popen, pick, sel, day]);

  useEffect(() => {
    if (!day) return undefined;
    const keys = circuitKeysFor(sel, day);
    if (!keys.length) return undefined;
    let alive = true;
    // Show the cached board for this circuit immediately if we have one, so a
    // rotation does not blink. Otherwise clear: the previous circuit's points
    // and rank are wrong the instant the selection changes, and showing them
    // for a frame reads as a score that then drops.
    const hit = boardCache.current.get(sel);
    setData(hit || null);
    const { anonId, email } = dailyMeIdentity();
    const qs = new URLSearchParams(isMarquee(sel) ? { five: '1' } : { circuit: sel });
    if (anonId) qs.set('anonId', anonId);
    if (email) qs.set('email', email);
    const load = () => {
      fetch(`/api/quiz/daily-combined?${qs.toString()}`, { cache: 'no-store' })
        .then((r) => r.json())
        .then((d) => {
          if (!d || d.error) return;
          boardCache.current.set(sel, d);
          if (alive) setData(d);
        })
        .catch(() => {});
    };
    if (!hit) load();
    // A game finishing anywhere on the site fires this, which is what re-ticks
    // the run without a reload. EVERY circuit's board can have moved, not just
    // the one on screen, so the whole cache goes rather than just this entry.
    const refresh = () => { boardCache.current.clear(); load(); };
    window.addEventListener('sot:daily-updated', refresh);
    return () => { alive = false; window.removeEventListener('sot:daily-updated', refresh); };
  }, [day, sel]);

  // Lazy: nothing is fetched until the picker is opened, and then only once.
  useEffect(() => {
    if (!pick || !day || pickData) return undefined;
    let alive = true;
    const { anonId, email } = dailyMeIdentity();
    const qs = new URLSearchParams();
    if (anonId) qs.set('anonId', anonId);
    if (email) qs.set('email', email);
    fetch('/api/quiz/daily-combined?' + qs.toString(), { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => { if (alive && d && !d.error) setPickData(d); })
      .catch(() => {});
    return () => { alive = false; };
  }, [pick, day, pickData]);

  if (!day) return null;
  const circuit = circuitById(sel) || ALL_CIRCUITS[0];
  const marq = isMarquee(sel);
  const cIdx = ALL_CIRCUITS.findIndex((c) => c.id === sel);
  const keys = circuitKeysFor(sel, day);
  // A date with no entry in the bank simply has no run (see lib/daily-five rule
  // 4). Render nothing rather than an empty band.
  if (keys.length < 2) return null;

  // WHICH GAMES ACTUALLY PUBLISHED. The bank is checked by
  // scripts/verify-daily-five.mjs, so this should always be all five, but the
  // server is the authority on what ran: if a game somehow has no puzzle today
  // it is absent from `games` and the run is honestly shorter. Falling back to
  // the bank keeps the band on screen before the fetch lands.
  const ran = data && Array.isArray(data.games) && data.games.length
    ? new Set(data.games.map((g) => g.key))
    : null;
  const members = ran ? keys.filter((k) => ran.has(k)) : keys;

  const perGame = (data && data.me && data.me.perGame) || {};
  // PLAYED, not SOLVED. An abandoned row is a started-and-left run and is not a
  // tick, the same test the slate rail uses. Solved-versus-failed needs data
  // this payload does not carry per game, and the run only needs to know what
  // is left.
  const playedOf = (k) => {
    const p = perGame[k];
    return p && !p.abandoned ? p : null;
  };
  const doneCount = members.filter((k) => playedOf(k)).length;
  const nextKey = members.find((k) => !playedOf(k)) || null;
  const complete = doneCount === members.length;
  const total = data && data.me ? fmtPts(data.me.total) : 0;
  const maxTotal = (data && data.maxTotal) || members.length * 15;
  const myRank = data && data.me ? data.me.rank : null;
  const field = (data && data.overallField) || 0;

  const board = (data && Array.isArray(data.overall) ? data.overall : []).slice(0, 5);
  const partial = (data && data.partial) || 0;
  const meRow = data && data.me ? data.me : null;
  const meInTop = !!(meRow && board.some((r) => r.userKey === meRow.userKey));

  const nextGame = nextKey ? DAILY_GAME_MAP[nextKey] : null;

  // TO RANK ON A SKILL CIRCUIT YOU HAVE TO FINISH IT. The server is the
  // authority (it withholds the rank); this is only the label, because a player
  // sitting on four of five needs to be told why their standing is a dash.
  // Read from the payload rather than assumed, so an archived or ungated board
  // labels itself honestly. Defaults to gated, which is what every run is.
  const ranksAll = data ? !!data.rankRequiresAll : true;
  const ranked = !ranksAll || complete;

  // Per-circuit progress for the picker, off the full-slate payload. Null until
  // that lands, which the panel renders as the game count rather than as zero.
  const allPer = (pickData && pickData.me && pickData.me.perGame) || null;
  const progOf = (id) => {
    const ks = circuitKeysFor(id, day);
    if (id === sel) return { done: doneCount, total: members.length };
    if (!allPer) return { done: null, total: ks.length };
    return { done: ks.filter((k) => allPer[k] && !allPer[k].abandoned).length, total: ks.length };
  };
  // Circuits with a live run today, in cycle order. The marquee drops out on a
  // date its bank does not reach, and a rotation must not land on a band with
  // nothing in it.
  const live = ALL_CIRCUITS.filter((c) => circuitKeysFor(c.id, day).length >= 2);
  const step = (d, byHand = true) => {
    const list = live.length ? live : ALL_CIRCUITS;
    const i = list.findIndex((c) => c.id === sel);
    const n = list.length;
    setSel(list[((i < 0 ? 0 : i) + d + n) % n].id);
    setPick(false);
    // A hand on the arrows ends the rotation for good.
    if (byHand) setHeld(true);
  };
  // NEXT STEPS TO THE NEXT UNFINISHED CIRCUIT, not the next in the list, which
  // is what makes the cycler read as progress rather than as a carousel. Falls
  // back to the next in order before the full slate has been fetched.
  // ── SHARING THE SELECTED CIRCUIT ──────────────────────────────────────────
  // The band is the busiest circuit surface on the site, so it is where a
  // circuit actually gets shared from. It hands over the INVITE (the evergreen
  // line, no score, no date) rather than a result, because the person pressing
  // it here has usually not finished the run: the result share lives on
  // /daily-five, where a finished run is.
  //
  // The link is this circuit's OWN page, passed explicitly. ShareCreditPop
  // otherwise defaults to the current URL, which here is the home page, and a
  // recipient handed the whole homepage has to go find the run themselves.
  const shareCircuit = () => {
    const url = withRef(circuitShareUrl(sel));
    const text = circuitShareInvite(sel, url);
    if (notifyShareCredit(text, `https://${circuitShareUrl(sel)}`)) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.share && isMobileDevice()) {
        navigator.share({ text }).catch(() => {});
        return;
      }
    } catch (e) {}
    try { navigator.clipboard?.writeText(text); } catch (e) {}
  };

  const nextCircuit = () => {
    const n = ALL_CIRCUITS.length;
    const from = cIdx < 0 ? 0 : cIdx;
    for (let i = 1; i <= n; i += 1) {
      const c = ALL_CIRCUITS[(from + i) % n];
      const ks = circuitKeysFor(c.id, day);
      if (ks.length < 2) continue;
      if (!allPer) return c;
      if (ks.some((k) => !allPer[k] || allPer[k].abandoned)) return c;
    }
    return ALL_CIRCUITS[(from + 1) % n];
  };

  return (
    <div
      className={`d5${complete ? ' is-done' : ''}${popen ? ' is-popen' : ''}${marq ? '' : ' is-circ'}${pick ? ' is-pick' : ''}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <RotateEvery
        ms={ROTATE_MS}
        on={!held && !hover && !pick && !open && !popen && live.length > 1}
        onTick={() => step(1, false)}
      />
      {/* RAW, not a JSX text child: React escapes `>` inside a text node, so any
          child-combinator selector would reach the browser as `&gt;` and be
          dropped as invalid until hydration replaced the node. There are none in
          here, but the console's own stylesheet was bitten by exactly that and
          the rule is cheaper to follow than to rediscover. */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* THE EDGE IS LOAD-BEARING, not decoration. The band's ground
           (--ground #14264f) is DARKER than the page behind the console
           (--accent #1e3a8a), and every other part of the console is defined by
           contrast rather than by a border: the title band is the page colour,
           the cap cards are blue, the board is white. So the band's right edge
           met the page navy with nothing between them and the section read as a
           hole in the card rather than as part of it. The 1.5px rule is the same
           #2c437c the band already draws its own game cards in, which is lighter
           than BOTH the band and the page, so it reads against either. Left is
           covered by the 4px gold rule, so only the right needs one. */
        .d5{position:relative;background:var(--ground);color:#fff;padding:12px 16px 13px;
            border-right:1.5px solid #2c437c;
            font-family:'Manrope',system-ui,-apple-system,sans-serif;}
        /* Full-bleed on a phone (the console loses its own side edges there), so
           a right rule would be a stray line down the screen. */
        @media(max-width:900px){ .d5{border-right:none;} }
        /* The 4px rule where an icon would be: the home surface's own vocabulary,
           in gold because an open run is the same state the cap paints gold. It
           goes green once the run is complete, which is the only colour change
           on the band and the only reward it hands out. */
        .d5::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--gold);}
        .d5.is-done::before{background:var(--success);}
        /* The cap rounds its own top corners because it USED to be the first
           thing under the title band. It is not any more, so square them off
           where this band sits above it, or the cap's radius reads as a break in
           the middle of the card. On the live catboard variant .dh-sbar is
           already transparent and unrounded, so this only fires on the plain
           slate; it is here rather than in DailyStrip so the whole change stays
           in one file. */
        .d5 + .dh-sbar{border-radius:0;}
        .d5-hd{display:flex;align-items:center;gap:14px;margin-bottom:10px;}
        /* THE TITLE BLOCK TAKES THE SLACK, so the trailing controls are always
           hard right (owner, 2026-08-18). It used to size to its content, and
           the only thing pushing Board and Start to the right edge was the
           margin-left:auto on the score box — which renders ONLY once the
           viewer's own row has loaded. So a circuit you had not played yet, or
           any render before the fetch landed, drew Board and Start bunched up
           against the title in the middle of the band, and they jumped right
           when the score appeared. Growing this instead makes the alignment a
           property of the row rather than a side effect of whether there is a
           score to show. */
        .d5-ht{flex:1 1 auto;min-width:0;}
        .d5-e{font-size:9px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;color:var(--gold);}
        .d5.is-done .d5-e{color:#7ff0c0;}
        .d5-n{font-size:20px;font-weight:800;letter-spacing:-.35px;line-height:1.15;}
        .d5-s{font-size:11.5px;font-weight:600;color:#9fb6e8;margin-top:2px;
              white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        /* min-width, because the digits change on every rotation and a box that
           resizes moves the title block beside it. Wide enough for the longest
           thing it says, "of 75 pts · #12". */
        .d5-sc{margin-left:auto;flex:none;text-align:right;line-height:1.1;min-width:96px;}
        .d5-sc b{display:block;font-size:22px;font-weight:800;letter-spacing:-.6px;font-variant-numeric:tabular-nums;}
        .d5-sc i{font-style:normal;font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#9fb6e8;}
        /* min-width + centred, because the label carries the next game's NAME
           and that changes on every rotation. Without a floor the button
           resized, and everything to its left — the score box, and on a phone
           the circuit name — slid across with it. A floor stops the jitter and
           still grows for a genuinely long label. */
        .d5-go{flex:none;display:inline-flex;align-items:center;justify-content:center;min-width:164px;
               gap:6px;background:var(--gold);color:#3a2a05;
               border-radius:8px;padding:11px 16px;font-size:11px;font-weight:800;letter-spacing:.07em;
               text-transform:uppercase;text-decoration:none;white-space:nowrap;}
        .d5-go:hover{background:#f0c65c;}
        .d5-go.done{background:var(--success);color:#04301f;}
        .d5-bd{flex:none;background:rgba(255,255,255,.12);border:1px solid #2c437c;color:#dbe6ff;
               border-radius:8px;padding:10px 13px;font-size:10.5px;font-weight:800;letter-spacing:.07em;
               text-transform:uppercase;cursor:pointer;font-family:inherit;white-space:nowrap;}
        .d5-bd:hover{background:rgba(255,255,255,.2);}

        /* THE TRACK HAS AS MANY COLUMNS AS THE RUN HAS GAMES, not five. Two
           circuits are fours (Wordplay, Sorting), the marquee becomes a four
           the day Extra retires, and retirement can shorten any of them at read
           time — a hardcoded five left those with a card-shaped hole at the end
           of the row. Passed as a CUSTOM PROPERTY rather than an inline
           grid-template-columns on purpose: an inline value would outrank the
           phone rule below, which collapses the track to one column, and the
           five cards would come back side by side at 390px. */
        .d5-track{display:grid;grid-template-columns:repeat(var(--d5-cols,5),minmax(0,1fr));gap:7px;}
        .d5-g{position:relative;display:block;background:rgba(255,255,255,.07);border:1px solid #2c437c;
              border-radius:9px;padding:8px 10px;min-width:0;text-decoration:none;color:inherit;}
        .d5-g:hover{background:rgba(255,255,255,.14);border-color:#4a6ab5;}
        .d5-gi{display:flex;align-items:center;gap:6px;margin-bottom:4px;}
        .d5-num{flex:none;width:16px;height:16px;border-radius:50%;background:rgba(255,255,255,.16);
                color:#c7d7fb;font-size:9.5px;font-weight:800;display:flex;align-items:center;
                justify-content:center;font-variant-numeric:tabular-nums;}
        .d5-cat{font-size:8.5px;font-weight:800;letter-spacing:.11em;text-transform:uppercase;color:#8fa9de;
                white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        /* THESE ARE SPANS AND THEY MUST BE TOLD TO BE BLOCKS. A span is inline
           by default, so without this the name and the tagline render on one
           line with no space between them ("DatingPut history in order"), which
           is exactly how this shipped for one deploy. Anything added to a card
           here gets the same treatment; the card cannot use <div> because it is
           inside an <a>, and nesting block elements in an anchor is legal but
           reads badly in the surrounding JSX. */
        .d5-gbody{display:block;min-width:0;}
        /* DESCENDERS. A nowrap + ellipsis line needs overflow:hidden, and that
           clips at the CONTENT BOX, so a line-height under about 1.35 cuts the
           tail off every g, j, p, q and y ("Put history in order" lost both).
           Rather than open the leading up and move every row, the box is grown
           by 3px and the same 3px is taken back off the flow with a negative
           margin: the clip box clears the descenders and nothing shifts. Any
           new single-line clamped text here needs the same pair. */
        .d5-gn{display:block;font-size:14.5px;font-weight:800;letter-spacing:-.2px;line-height:1.2;
               padding-bottom:3px;margin-bottom:-3px;
               white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .d5-gt{display:block;font-size:10.5px;font-weight:600;color:#93aae2;margin-top:1px;
               padding-bottom:3px;margin-bottom:-3px;
               white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .d5-st{margin-top:6px;display:flex;align-items:center;gap:5px;font-size:10px;font-weight:800;
               letter-spacing:.04em;color:#8fa9de;}
        .d5-pts{margin-left:auto;font-variant-numeric:tabular-nums;font-size:11.5px;font-weight:800;}
        .d5-g.done{background:rgba(16,185,129,.14);border-color:#2f7d5e;}
        .d5-g.done .d5-st{color:#7ff0c0;}
        .d5-g.done .d5-num{background:var(--success);color:#04301f;}
        .d5-g.now{background:var(--blue);border-color:#7ba4ff;}
        .d5-g.now .d5-cat,.d5-g.now .d5-gt{color:#cfe0ff;}
        .d5-g.now .d5-st{color:#fff;}
        .d5-g.now .d5-num{background:#fff;color:var(--blue-deep);}

        /* the board, revealed under the track */
        .d5-lb{margin-top:11px;border-top:1px solid #2c437c;padding-top:10px;}
        .d5-lbh{font-size:9px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);
                margin-bottom:7px;}
        .d5-lbr{display:flex;align-items:center;gap:10px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.07);}
        .d5-lbr.me{background:rgba(37,99,235,.28);margin:0 -8px;padding:5px 8px;border-radius:6px;border-bottom:none;}
        .d5-rk{flex:none;width:20px;font-size:13px;font-weight:800;font-variant-numeric:tabular-nums;color:#8fa9de;text-align:right;}
        .d5-rk.g1{color:var(--gold);}.d5-rk.g2{color:var(--silver);}.d5-rk.g3{color:var(--bronze);}
        .d5-who{flex:1;min-width:0;font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .d5-pips{flex:none;display:flex;gap:3px;}
        .d5-pip{width:14px;height:4px;border-radius:2px;background:rgba(255,255,255,.16);}
        .d5-pip.on{background:var(--blue-400);}
        .d5-pip.top{background:var(--gold);}
        .d5-tot{flex:none;width:56px;text-align:right;font-size:14px;font-weight:800;font-variant-numeric:tabular-nums;}
        .d5-tot i{font-style:normal;font-size:9px;font-weight:700;color:#8fa9de;margin-left:3px;}
        .d5-note{margin-top:8px;font-size:10.5px;font-weight:600;color:#8fa9de;}

        /* ── phone (the console is one column at 900) ──
           Five cards side by side is unreadable at 390px, so the track becomes a
           list. It is also COLLAPSED BY DEFAULT here, which desktop is not:
           expanded it runs 303px, and the phone console's whole first screen is
           an argument for what to play next, with the slate's own peek budgeted
           at six rows. Two lines and five pips is the resting state, ~90px, and
           the pip bar is the control that opens the rest. */
        @media(max-width:900px){
          .d5{padding:11px 12px 12px;}
          /* THE HEADER IS TWO ROWS ON A PHONE, because three things do not fit
             on one line (owner report, 2026-08-18). The title block, the score
             box (96px floor) and the Start button (132px floor) with their gaps
             leave the title 105px at 390 and 71px at 360, and the eyebrow needs
             178 ("Circuit 8 of 15 4 of 5 played") or 225 with the marquee badge
             in front of it. So the eyebrow clipped to "Today's ru" and the name
             to "Table Gam", which between them are the only line on the band
             that says WHICH run you are looking at. Wrapping gives the title the
             full width and puts the score and the button on a row of their own,
             score left, button right.

             It costs 41px of band height, 97 to 138, and that is the trade
             taken deliberately: the board below is MEASURED from this band
             (--dh-fit) so nothing overflows, and a title you cannot read is
             worse than a shorter first screen. Do NOT "fix" this instead by
             shrinking the two floors, they exist because the digits and the
             next game's name change on every rotation and a box that resizes
             drags the title across with it. */
          .d5-hd{gap:9px;row-gap:8px;margin-bottom:9px;flex-wrap:wrap;}
          .d5-ht{flex:1 1 100%;}
          /* The margin-left:auto is what pushed this hard right on the one-row
             header. On a row of its own that would maroon the score in the
             middle, so it goes left and pushes the button right instead, and
             the 96px floor comes off with it: nothing sits to its left any
             more, so a width that changes with the digits moves nothing. */
          .d5-sc{margin-left:0;margin-right:auto;text-align:left;min-width:0;}
          .d5-n{font-size:17px;}
          .d5-s{display:none;}
          .d5-sc b{font-size:17px;}
          .d5-go{padding:9px 12px;font-size:10px;min-width:132px;}
          .d5-bd{display:none;}
          .d5-track{display:none;grid-template-columns:1fr;gap:5px;margin-top:9px;}
          .d5.is-popen .d5-track{display:grid;}
          .d5-pipbar{display:flex;align-items:center;gap:9px;width:100%;}
          .d5-piptog{display:flex;align-items:center;gap:8px;flex:1;min-width:0;padding:0;border:0;
                     background:transparent;font-family:inherit;cursor:pointer;
                     -webkit-tap-highlight-color:transparent;}
          /* Sized as a real tap target, not a text link: it is one of only two
             controls on the phone band. */
          .d5-pipbd{flex:none;background:rgba(255,255,255,.12);border:1px solid #2c437c;
                    border-radius:7px;padding:7px 11px;font-size:9.5px;font-weight:800;
                    letter-spacing:.11em;text-transform:uppercase;color:#dbe6ff;
                    text-decoration:none;-webkit-tap-highlight-color:transparent;}
          .d5-pipbd:active{background:rgba(255,255,255,.22);}
          /* Once the run is complete the header's primary control IS the board,
             so the small one here would be the same link twice on one screen. */
          .d5.is-done .d5-pipbd{display:none;}
          .d5-pips5{display:flex;gap:4px;flex:1;min-width:0;}
          .d5-pips5 span{flex:1;height:5px;border-radius:3px;background:rgba(255,255,255,.18);}
          .d5-pips5 span.done{background:var(--success);}
          .d5-pips5 span.now{background:var(--blue-400);}
          .d5-pipl{flex:none;font-size:9.5px;font-weight:800;letter-spacing:.1em;
                   text-transform:uppercase;color:#9fb6e8;}
          .d5-g{display:flex;align-items:center;gap:9px;padding:8px 10px;}
          .d5-gi{margin-bottom:0;flex:none;}
          .d5-gcat{display:none;}
          .d5-gbody{flex:1;}
          .d5-st{margin-top:0;flex:none;}
          .d5-gt{display:none;}
          .d5-lbr .d5-pips{display:none;}
        }
        @media(min-width:901px){ .d5-pipbar{display:none;} }

        /* ── CIRCUITS ──────────────────────────────────────────────────────
           The band is shared by all fourteen runs and its height does not
           change for any of them, which was the whole constraint. The console
           already spends 179px on this band and 335px above the board, and the
           board's height is MEASURED to the fold, so a second band would have
           come straight off the board. The cycler therefore sits INLINE on the
           name line that already exists, and the picker is absolutely
           positioned over the track, so opening it moves nothing.

           Colour is the only thing that says which kind of run you are looking
           at: the marquee keeps the gold rule it already had, a skill circuit
           takes blue, and complete is green for both. */
        .d5.is-circ::before{background:var(--blue);}
        .d5.is-circ.is-done::before{background:var(--success);}
        .d5.is-circ .d5-e{color:#8ab4ff;}
        .d5.is-circ.is-done .d5-e{color:#7ff0c0;}
        .d5.is-circ .d5-go{background:var(--blue);color:#fff;}
        .d5.is-circ .d5-go:hover{background:#4f86f7;}
        .d5.is-circ .d5-go.done{background:var(--success);color:#04301f;}
        .d5.is-circ .d5-lbh{color:#8ab4ff;}
        /* The marquee badge sits where the eyebrow text already sat, so it
           costs no line. Same gold as the rule, which is what ties the two
           together with no caption. */
        /* THE EYEBROW IS ONE LINE, ALWAYS. It is the tallest thing that varies
           with the selection: "Marquee Today's run 4 of 5 played" wraps at
           390px where "Circuit 5 of 14 not started" does not, so the band's
           height stepped 107 to 133 and back on every rotation and the whole
           console below it moved with it. Clipped rather than wrapped: losing
           the tail of a status line is invisible next to a page that jumps
           every eight seconds. */
        .d5-e{display:flex;align-items:center;gap:7px;white-space:nowrap;overflow:hidden;}
        /* THE BADGE NEEDS AIR UNDER IT AND PLAIN TEXT DOES NOT (owner, 2026-08-18).
           A filled chip is exactly as tall as the eyebrow's line box, so it ends
           flush against the title's, and "The Daily Five" read as mashed into
           "Marquee" with a measured gap of ZERO. The circuit eyebrow has no such
           problem: 9px text in a 13px line box already leaves its own leading.
           So the margin goes on the BADGE, not on the eyebrow, which means it
           costs its 5px only on the marquee and nothing at all on the other
           fifteen. It is the eyebrow's tallest item, so the extra height comes
           off its own margin box and the eyebrow text beside it stays put. */
        .d5-mq{flex:none;background:var(--gold);color:#3a2a05;border-radius:3px;padding:1px 5px;
               margin-bottom:5px;
               font-size:8px;font-weight:800;letter-spacing:.13em;}
        .d5-n{display:flex;align-items:center;gap:8px;min-width:0;}
        /* FLEX, not just min-width:0. The three controls beside it are
           flex:none, so without a grow-and-shrink basis the name is the only
           thing that can give and it gives ALL of it: measured 0px wide on a
           390px phone, i.e. the band lost its title completely. */
        /* SHRINK BUT DO NOT GROW. It has to shrink or it squeezes the controls
           beside it to nothing (measured 0px on a phone before this had a flex
           basis at all). It must NOT grow, or now that .d5-ht takes the slack
           the name would stretch the whole title block and drag the arrows to
           the far side of the band, away from the name they belong to. */
        /* DESCENDERS. Same trap .d5-gn and .d5-gt already carry a fix for
           lower down, and the third time this file has been bitten by it: a
           nowrap + ellipsis line needs overflow:hidden, that clips at the
           CONTENT box, and .d5-n runs line-height 1.15, so the tail comes off
           every g, j, p, q and y. "Word Building" lost its g. Rather than open
           the leading and move the whole header, grow the box by 4px and take
           the same 4px back off the flow: the clip box clears the descenders
           and nothing shifts. Any new clamped single line in this band needs
           the same pair. */
        .d5-nm{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
               padding-bottom:4px;margin-bottom:-4px;
               /* It is an anchor now (to the circuit's own page) and must not
                  pick up the global link colour or underline: it is still the
                  band's title and reads as one. */
               color:inherit;text-decoration:none;}
        .d5-nm:hover{text-decoration:underline;text-underline-offset:3px;}
        /* Nothing is hidden while the picker is open any more: in the flow it
           sits UNDER the header rather than on top of it, so the sub line, the
           track and the pip bar are all still there and still legible. */
        /* Phone-only copy of the cycler, in the pip bar. See the note on
           .d5-pcyc in the max-width:900 block below. */
        .d5-pcyc{display:none;}
        .d5-cyc{flex:none;width:21px;height:21px;border-radius:5px;background:rgba(255,255,255,.12);
                border:1px solid #2c437c;color:#dbe6ff;display:inline-flex;align-items:center;
                justify-content:center;cursor:pointer;font-family:inherit;padding:0;}
        .d5-cyc:hover{background:rgba(255,255,255,.24);}
        .d5-all{flex:none;display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,.12);
                border:1px solid #2c437c;color:#dbe6ff;border-radius:5px;height:21px;padding:0 9px;
                font-size:8.5px;font-weight:800;letter-spacing:.11em;text-transform:uppercase;
                cursor:pointer;font-family:inherit;white-space:nowrap;}
        .d5-all:hover{background:rgba(255,255,255,.24);}
        .d5-pipbd{cursor:pointer;font-family:inherit;}

        /* THE PICKER IS IN FLOW: it EXPANDS the band and pushes everything
           below it down (owner, 2026-08-18). It was an overlay, on the
           reasoning that the board below is sized from this band's document top
           so a panel in the flow would cost the board height. That reasoning
           was right about the cost and wrong about the trade: on a phone the
           cycler lives in the pip bar, which is BELOW the header, so the
           absolute panel covered its own close button and the menu could not be
           shut at all. A panel you cannot close is worse than a shorter board,
           and the board does not overflow anyway — --dh-fit is MEASURED from
           this band's height, and the fit effect already re-runs when it opens, so
           the board simply resizes to what is left. */
        .d5-pick{margin-top:10px;background:#0f2350;border:1px solid #3a5a9e;
                 border-radius:11px;padding:9px;}
        .d5-pkh{display:flex;align-items:center;gap:10px;padding:0 3px 8px;}
        .d5-pkh b{font-size:9px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#8fa9de;}
        .d5-pkh i{margin-left:auto;font-style:normal;font-size:9px;font-weight:800;letter-spacing:.1em;
                  text-transform:uppercase;color:#8fa9de;}
        /* THE PANEL CLOSES FROM ITS OWN HEADER, not only from the control that
           opened it. In the flow the panel is 549px tall on a phone, and the
           button that opened it is in the pip bar UNDERNEATH: at 390x844 that
           lands the close at y=799, inside the viewport by 45px and off the
           bottom of anything shorter. A control at the top of the thing you
           want to shut does not depend on how tall it is. */
        .d5-pkx{flex:none;background:rgba(255,255,255,.12);border:1px solid #2c437c;color:#dbe6ff;
                border-radius:5px;height:20px;padding:0 9px;font-size:8.5px;font-weight:800;
                letter-spacing:.11em;text-transform:uppercase;cursor:pointer;font-family:inherit;}
        .d5-pkx:hover{background:rgba(255,255,255,.24);}
        .d5-pkg{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;}
        .d5-pkc{position:relative;background:rgba(255,255,255,.07);border:1px solid #2c437c;
                border-radius:8px;padding:7px 9px 8px;cursor:pointer;overflow:hidden;text-align:left;
                font-family:inherit;color:inherit;}
        .d5-pkc:hover{background:rgba(255,255,255,.15);border-color:#5b8cf0;}
        .d5-pkc::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:#3d5794;}
        .d5-pkc.on::before{background:var(--blue);}
        .d5-pkc.fin::before{background:var(--success);}
        .d5-pkc.mq::before{background:var(--gold);}
        .d5-pkc.on{background:rgba(37,99,235,.28);border-color:#5b8cf0;}
        /* The marquee takes a double-width cell in the lead position, so the
           grid says which one it is with no caption at all. */
        .d5-pkc.mq{grid-column:span 2;background:rgba(232,180,58,.14);border-color:#7a6021;}
        .d5-pkc.mq.on{background:rgba(232,180,58,.3);}
        .d5-pkn{display:block;font-size:12px;font-weight:800;letter-spacing:-.15px;
                white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .d5-pkc.mq .d5-pkn{font-size:14px;}
        .d5-pks{display:block;font-size:9px;font-weight:700;color:#8fa9de;margin-top:1px;
                letter-spacing:.04em;text-transform:uppercase;
                white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .d5-pkc.mq .d5-pks{color:#d9b969;}
        .d5-pkp{display:flex;gap:3px;margin-top:6px;}
        .d5-pkp span{flex:1;height:4px;border-radius:3px;background:rgba(255,255,255,.2);}
        .d5-pkp span.on{background:var(--success);}
        .d5-pkp span.now{background:var(--gold);}
        /* A phone console is one column, so five across is unreadable and the
           overlay would run off the band entirely. Two across, scrolling. */
        @media(max-width:900px){
          /* No max-height and no inner scroll: in the flow the page scrolls,
             which is the one scroll a phone reader expects. */
          .d5-pick{margin-top:9px;}
          .d5-pkg{grid-template-columns:1fr 1fr;}
          .d5-pkc.mq{grid-column:span 2;}
          /* THE CYCLER CANNOT SHARE THE NAME LINE ON A PHONE. Measured at
             390px: the header row gives the title block 118px once the score
             box and the Resume button have taken theirs, and "The Daily Five"
             at 17px needs all of it. Two arrows and an All button do not fit
             beside that, and flexbox resolved the conflict by shrinking the
             name to zero. So below 900 the name line keeps ONLY the name, and
             the controls move to the pip bar, which already exists, is already
             phone-only, and has room for three 21px buttons next to a pips
             toggle that flexes. Icon-only there: the bar also carries Board. */
          .d5-n .d5-cyc,.d5-n .d5-all{display:none;}
          .d5-pcyc{display:inline-flex;align-items:center;gap:5px;flex:none;}
        }
      ` }} />

      <div className="d5-hd">
        <div className="d5-ht">
          <div className="d5-e">
            {marq ? <span className="d5-mq">Marquee</span> : null}
            {marq
              ? (complete ? 'Run complete' : `Today's run · ${doneCount} of ${members.length} played`)
              : `Circuit ${cIdx + 1} of ${ALL_CIRCUITS.length} · ${complete ? 'complete' : (doneCount ? `${doneCount} of ${members.length} played` : 'not started')}`}
          </div>
          {/* THE CYCLER IS INLINE ON THE NAME LINE, not a row of its own and
              not a pair of tabs. Tabs would have said the Five is one of two
              things; it is the HEAD of a list of fourteen, which is why
              stepping left from it wraps to the last circuit rather than
              stopping. */}
          <div className="d5-n">
            {/* The name is a LINK to the circuit's own page. That is
                identification, not navigation furniture: it is the one place
                that says what this run is to somebody who has not played it,
                and it is the page every share of this circuit lands on. */}
            <a className="d5-nm" href={circuitPageHref(sel)}>{marq ? FIVE_NAME : circuit.name}</a>
            <button type="button" className="d5-cyc" onClick={() => step(-1)} aria-label="Previous circuit">
              <ChevronLeft size={13} strokeWidth={2.8} />
            </button>
            <button type="button" className="d5-cyc" onClick={() => step(1)} aria-label="Next circuit">
              <ChevronRight size={13} strokeWidth={2.8} />
            </button>
            <button type="button" className="d5-cyc" onClick={shareCircuit} aria-label={`Share the ${circuit.name} circuit`}>
              <Share2 size={12} strokeWidth={2.8} />
            </button>
            <button type="button" className="d5-all" aria-expanded={pick} onClick={() => setPick((p) => !p)}>
              <LayoutGrid size={10} strokeWidth={2.8} />
              {pick ? 'Close' : `All ${ALL_CIRCUITS.length}`}
            </button>
          </div>
          {/* The ramp is worth saying out loud: it tells a first-time reader
              that the run opens with something they can finish in half a
              minute, which is the objection the word "five" raises. A skill
              circuit says what it exercises instead, plus the completion gate,
              which is the one rule that differs between the two kinds. */}
          <div className="d5-s">
            {circuit.blurb}
            {ranksAll && !complete ? ` Finish all ${members.length} to rank.` : ''}
          </div>
        </div>
        {/* ALWAYS MOUNTED, placeholder and all. It used to render only once the
            viewer's own row had loaded, so every rotation unmounted it, the
            title block widened into the gap, the name and the arrows slid
            across, and on a phone the whole header reflowed — eight seconds
            later it did it again. A box that is always there and only changes
            its digits cannot move anything. */}
        <div className="d5-sc">
          <b>{data && data.me ? total : '—'}</b>
          <i>of {maxTotal} pts{data && data.me && ranked && myRank ? ` · #${myRank}` : ''}</i>
        </div>
        <button type="button" className="d5-bd" onClick={() => setOpen((o) => !o)}>
          {open ? 'Hide board' : 'Board'}
        </button>
        {/* A COMPLETED RUN'S PRIMARY CONTROL IS THE BOARD (owner, 2026-08-17).
            It used to be a static "All five done" chip, which is a dead end at
            every width: the eyebrow above already says Run complete, so the chip
            restated it and led nowhere. The board is what a finished run is FOR,
            so it takes the slot. This is also the only board affordance a phone
            gets in this row, since the toggle beside it is hidden under 900. */}
        {complete && marq ? (
          <a className="d5-go done" href="/daily-five">
            <Trophy size={12} strokeWidth={2.6} />See the board
          </a>
        ) : complete ? (
          <button type="button" className="d5-go done" onClick={() => setSel(nextCircuit().id)}>
            <Play size={11} fill="currentColor" strokeWidth={0} />Next · {nextCircuit().name}
          </button>
        ) : (
          <a className="d5-go" href={circuitHref(nextKey || members[0], sel)}>
            <Play size={11} fill="currentColor" strokeWidth={0} />
            {doneCount ? 'Resume' : 'Start'}
            {nextGame ? ` · ${nextGame.name}` : ''}
          </a>
        )}
      </div>

      {pick ? (
        <div className="d5-pick">
          <div className="d5-pkh">
            <b>All circuits · today</b>
            <i>{allPer
              ? `${ALL_CIRCUITS.filter((c) => { const p = progOf(c.id); return p.total && p.done === p.total; }).length} of ${ALL_CIRCUITS.length} complete`
              : 'Loading your progress'}</i>
            <button type="button" className="d5-pkx" onClick={() => setPick(false)}>Close</button>
          </div>
          <div className="d5-pkg">
            {ALL_CIRCUITS.map((c) => {
              const p = progOf(c.id);
              const fin = !!p.total && p.done === p.total;
              const cls = `d5-pkc${c.marquee ? ' mq' : ''}${c.id === sel ? ' on' : ''}${fin ? ' fin' : ''}`;
              return (
                <button key={c.id} type="button" className={cls} onClick={() => { setSel(c.id); setPick(false); setHeld(true); }}>
                  <span className="d5-pkn">{c.marquee ? `★ ${c.name}` : c.name}</span>
                  <span className="d5-pks">
                    {!p.total ? 'no run today'
                      : p.done === null ? `${p.total} games`
                      : fin ? 'complete'
                      : p.done ? `${p.done} of ${p.total}`
                      : 'not started'}
                  </span>
                  <span className="d5-pkp">
                    {Array.from({ length: p.total || 5 }).map((_, i) => (
                      <span key={i} className={p.done === null ? '' : (i < p.done ? 'on' : (i === p.done ? 'now' : ''))} />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Phone only (display:none above 900). The pips ARE the toggle: they
          already say where you are in the run, so making them the thing you tap
          to see the five costs no extra row.
          THE BOARD LINK RIDES HERE TOO, because the header's board toggle is
          hidden under 900 and a landscape phone is still under 900, so a phone
          had no way to the board at all while a run was in progress. It is a
          LINK to /daily-five rather than the desktop's inline expander: the
          board wants more room than a phone band has, and the page is the same
          board with space to read it. Two elements rather than one, because an
          anchor cannot be nested inside a button. */}
      <div className="d5-pipbar">
        <button
          type="button"
          className="d5-piptog"
          aria-expanded={popen}
          onClick={() => setPopen((o) => !o)}
        >
          <span className="d5-pips5">
            {members.map((k) => {
              const p = playedOf(k);
              return <span key={k} className={p ? 'done' : (k === nextKey ? 'now' : '')} />;
            })}
          </span>
          <span className="d5-pipl">{popen ? 'Hide' : `All ${members.length}`}</span>
        </button>
        <span className="d5-pcyc">
          <button type="button" className="d5-cyc" onClick={() => step(-1)} aria-label="Previous circuit">
            <ChevronLeft size={13} strokeWidth={2.8} />
          </button>
          <button type="button" className="d5-cyc" onClick={() => step(1)} aria-label="Next circuit">
            <ChevronRight size={13} strokeWidth={2.8} />
          </button>
          <button type="button" className="d5-cyc" aria-expanded={pick} aria-label="All circuits" onClick={() => setPick((p) => !p)}>
            <LayoutGrid size={12} strokeWidth={2.8} />
          </button>
          <button type="button" className="d5-cyc" onClick={shareCircuit} aria-label={`Share the ${circuit.name} circuit`}>
            <Share2 size={12} strokeWidth={2.8} />
          </button>
        </span>
        {marq ? (
          <a className="d5-pipbd" href="/daily-five">Board</a>
        ) : (
          <button type="button" className="d5-pipbd" onClick={() => setOpen((o) => !o)}>Board</button>
        )}
      </div>

      <div className="d5-track" style={{ '--d5-cols': members.length }}>
        {members.map((k, i) => {
          const g = DAILY_GAME_MAP[k];
          if (!g) return null;
          const p = playedOf(k);
          const now = !p && k === nextKey;
          return (
            <a
              key={k}
              href={circuitHref(k, sel)}
              className={`d5-g${p ? ' done' : (now ? ' now' : '')}`}
              title={g.tag || g.name}
            >
              <span className="d5-gi">
                <span className="d5-num">{i + 1}</span>
                <span className="d5-cat d5-gcat">{CAT_SHORT[g.cat] || g.cat}</span>
              </span>
              <span className="d5-gbody">
                <span className="d5-gn">{g.name}</span>
                <span className="d5-gt">{g.tag}</span>
              </span>
              <span className="d5-st">
                {p ? '✓ Played' : (now ? 'Up next' : 'Not started')}
                <span className="d5-pts">{p ? fmtPts(p.points) : '—'}</span>
              </span>
            </a>
          );
        })}
      </div>

      {open ? (
        <div className="d5-lb">
          <div className="d5-lbh">
            Combined placement · {marq ? 'the five' : circuit.name}
            {field ? ` · ${field.toLocaleString()} ${ranksAll ? 'finishers' : 'players'}` : ''}
          </div>
          {board.length ? board.map((r, i) => (
            <BoardRow key={r.userKey} row={r} pos={i + 1} members={members} me={meRow && r.userKey === meRow.userKey} />
          )) : (
            <div className="d5-note">
              {ranksAll
                ? `Nobody has finished all ${members.length} yet today.${partial ? ` ${partial} ${partial === 1 ? 'player is' : 'players are'} partway through.` : ''} Be first.`
                : 'Nobody has scored on the run yet today. Be first.'}
            </div>
          )}
          {meRow && !meInTop ? (
            <BoardRow row={meRow} pos={meRow.rank} members={members} me />
          ) : null}
          <div className="d5-note">
            Each game pays the same 15/12/10/8/7/6/5/4/3/2/1 by finish, and the run adds them up.
            A game played on its own still counts, so there is nothing to opt into.
            {ranksAll ? ` You have to finish all ${members.length} to take a place on this board.` : ''}
          </div>
        </div>
      ) : null}
    </div>
  );
}

// One board row. The five pips say the SHAPE of somebody's run at a glance
// (gold where they won that game, blue where they finished it, empty where they
// have not played it), which is the thing a combined total on its own hides:
// the all-rounder and the specialist can reach the same number.
function BoardRow({ row, pos, members, me }) {
  const pg = row.perGame || {};
  return (
    <div className={me ? 'd5-lbr me' : 'd5-lbr'}>
      <span className={`d5-rk${pos === 1 ? ' g1' : pos === 2 ? ' g2' : pos === 3 ? ' g3' : ''}`}>{pos}</span>
      <span className="d5-who">{me ? 'You' : (row.username || 'Guest')}</span>
      <span className="d5-pips">
        {members.map((k) => {
          const p = pg[k];
          const cls = !p || p.abandoned ? '' : (p.rank === 1 ? 'top' : 'on');
          return <span key={k} className={`d5-pip ${cls}`} />;
        })}
      </span>
      <span className="d5-tot">{fmtPts(row.total)}<i>/{members.length * 15}</i></span>
    </div>
  );
}
