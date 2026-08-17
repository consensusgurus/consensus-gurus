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

import React, { useEffect, useState } from 'react';
import { Play, Trophy } from 'lucide-react';
import { fiveFor, fiveHref, FIVE_NAME } from '@/lib/daily-five';
import { DAILY_GAME_MAP } from '@/lib/daily-games';
import { dailyMeIdentity } from './dailyMeClient';

const etToday = () => {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
};

const CAT_SHORT = { 'Crowd Psychology': 'Crowd' };
const fmtPts = (n) => (Math.round(Number(n) * 10) / 10);

export default function DailyFiveBand() {
  const [day, setDay] = useState(null);
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => { setDay(etToday()); }, []);

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
  }, [open, day]);

  useEffect(() => {
    if (!day) return undefined;
    const keys = fiveFor(day);
    if (!keys.length) return undefined;
    let alive = true;
    const { anonId, email } = dailyMeIdentity();
    const qs = new URLSearchParams({ five: '1' });
    if (anonId) qs.set('anonId', anonId);
    if (email) qs.set('email', email);
    const load = () => {
      fetch(`/api/quiz/daily-combined?${qs.toString()}`, { cache: 'no-store' })
        .then((r) => r.json())
        .then((d) => { if (alive && d && !d.error) setData(d); })
        .catch(() => {});
    };
    load();
    // A game finishing anywhere on the site fires this, which is what re-ticks
    // the run without a reload.
    window.addEventListener('sot:daily-updated', load);
    return () => { alive = false; window.removeEventListener('sot:daily-updated', load); };
  }, [day]);

  if (!day) return null;
  const keys = fiveFor(day);
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
  const meRow = data && data.me ? data.me : null;
  const meInTop = !!(meRow && board.some((r) => r.userKey === meRow.userKey));

  const nextGame = nextKey ? DAILY_GAME_MAP[nextKey] : null;

  return (
    <div className={complete ? 'd5 is-done' : 'd5'}>
      {/* RAW, not a JSX text child: React escapes `>` inside a text node, so any
          child-combinator selector would reach the browser as `&gt;` and be
          dropped as invalid until hydration replaced the node. There are none in
          here, but the console's own stylesheet was bitten by exactly that and
          the rule is cheaper to follow than to rediscover. */}
      <style dangerouslySetInnerHTML={{ __html: `
        .d5{position:relative;background:var(--ground);color:#fff;padding:12px 16px 13px;
            font-family:'Manrope',system-ui,-apple-system,sans-serif;}
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
        .d5-ht{min-width:0;}
        .d5-e{font-size:9px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;color:var(--gold);}
        .d5.is-done .d5-e{color:#7ff0c0;}
        .d5-n{font-size:20px;font-weight:800;letter-spacing:-.35px;line-height:1.15;}
        .d5-s{font-size:11.5px;font-weight:600;color:#9fb6e8;margin-top:2px;
              white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .d5-sc{margin-left:auto;flex:none;text-align:right;line-height:1.1;}
        .d5-sc b{display:block;font-size:22px;font-weight:800;letter-spacing:-.6px;font-variant-numeric:tabular-nums;}
        .d5-sc i{font-style:normal;font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#9fb6e8;}
        .d5-go{flex:none;display:inline-flex;align-items:center;gap:6px;background:var(--gold);color:#3a2a05;
               border-radius:8px;padding:11px 16px;font-size:11px;font-weight:800;letter-spacing:.07em;
               text-transform:uppercase;text-decoration:none;white-space:nowrap;}
        .d5-go:hover{background:#f0c65c;}
        .d5-go.done{background:var(--success);color:#04301f;}
        .d5-bd{flex:none;background:rgba(255,255,255,.12);border:1px solid #2c437c;color:#dbe6ff;
               border-radius:8px;padding:10px 13px;font-size:10.5px;font-weight:800;letter-spacing:.07em;
               text-transform:uppercase;cursor:pointer;font-family:inherit;white-space:nowrap;}
        .d5-bd:hover{background:rgba(255,255,255,.2);}

        .d5-track{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px;}
        .d5-g{position:relative;display:block;background:rgba(255,255,255,.07);border:1px solid #2c437c;
              border-radius:9px;padding:8px 10px;min-width:0;text-decoration:none;color:inherit;}
        .d5-g:hover{background:rgba(255,255,255,.14);border-color:#4a6ab5;}
        .d5-gi{display:flex;align-items:center;gap:6px;margin-bottom:4px;}
        .d5-num{flex:none;width:16px;height:16px;border-radius:50%;background:rgba(255,255,255,.16);
                color:#c7d7fb;font-size:9.5px;font-weight:800;display:flex;align-items:center;
                justify-content:center;font-variant-numeric:tabular-nums;}
        .d5-cat{font-size:8.5px;font-weight:800;letter-spacing:.11em;text-transform:uppercase;color:#8fa9de;
                white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .d5-gn{font-size:14.5px;font-weight:800;letter-spacing:-.2px;line-height:1.2;
               white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .d5-gt{font-size:10.5px;font-weight:600;color:#93aae2;margin-top:1px;
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

        /* ── phone (owner rule: the console is one column at 900) ──
           Five cards side by side is unreadable at 390px, so the track collapses
           to pips and the list is what the toggle opens. Two lines and five pips
           is the whole resting state, which is less of the first screen than one
           slate row per game it replaces. */
        @media(max-width:900px){
          .d5{padding:11px 12px 12px;}
          .d5-hd{gap:9px;margin-bottom:9px;}
          .d5-n{font-size:17px;}
          .d5-s{display:none;}
          .d5-sc b{font-size:17px;}
          .d5-go{padding:9px 12px;font-size:10px;}
          .d5-bd{display:none;}
          .d5-track{grid-template-columns:1fr;gap:5px;}
          .d5-pipbar{display:flex;gap:4px;}
          .d5-pipbar span{flex:1;height:5px;border-radius:3px;background:rgba(255,255,255,.18);}
          .d5-pipbar span.done{background:var(--success);}
          .d5-pipbar span.now{background:var(--blue-400);}
          .d5-g{display:flex;align-items:center;gap:9px;padding:8px 10px;}
          .d5-gi{margin-bottom:0;flex:none;}
          .d5-gcat{display:none;}
          .d5-gbody{min-width:0;flex:1;}
          .d5-st{margin-top:0;flex:none;}
          .d5-gt{display:none;}
          .d5-lbr .d5-pips{display:none;}
        }
        @media(min-width:901px){ .d5-pipbar{display:none;} }
      ` }} />

      <div className="d5-hd">
        <div className="d5-ht">
          <div className="d5-e">
            {complete ? 'Run complete' : `Today's run · ${doneCount} of ${members.length} played`}
          </div>
          <div className="d5-n">{FIVE_NAME}</div>
          {/* The ramp is worth saying out loud: it tells a first-time reader
              that the run opens with something they can finish in half a
              minute, which is the objection the word "five" raises. */}
          <div className="d5-s">
            One game from each of five categories, shortest first. A new five at midnight.
          </div>
        </div>
        {data && data.me ? (
          <div className="d5-sc">
            <b>{total}</b>
            <i>of {maxTotal} pts{myRank ? ` · #${myRank}` : ''}</i>
          </div>
        ) : null}
        <button type="button" className="d5-bd" onClick={() => setOpen((o) => !o)}>
          {open ? 'Hide board' : 'Board'}
        </button>
        {complete ? (
          <span className="d5-go done"><Trophy size={12} strokeWidth={2.6} />All five done</span>
        ) : (
          <a className="d5-go" href={fiveHref(nextKey || members[0])}>
            <Play size={11} fill="currentColor" strokeWidth={0} />
            {doneCount ? 'Resume' : 'Start'}
            {nextGame ? ` · ${nextGame.name}` : ''}
          </a>
        )}
      </div>

      <div className="d5-pipbar">
        {members.map((k) => {
          const p = playedOf(k);
          return <span key={k} className={p ? 'done' : (k === nextKey ? 'now' : '')} />;
        })}
      </div>

      <div className="d5-track">
        {members.map((k, i) => {
          const g = DAILY_GAME_MAP[k];
          if (!g) return null;
          const p = playedOf(k);
          const now = !p && k === nextKey;
          return (
            <a
              key={k}
              href={fiveHref(k)}
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
            Combined placement across the five{field ? ` · ${field.toLocaleString()} players` : ''}
          </div>
          {board.length ? board.map((r, i) => (
            <BoardRow key={r.userKey} row={r} pos={i + 1} members={members} me={meRow && r.userKey === meRow.userKey} />
          )) : <div className="d5-note">Nobody has scored on the run yet today. Be first.</div>}
          {meRow && !meInTop ? (
            <BoardRow row={meRow} pos={meRow.rank} members={members} me />
          ) : null}
          <div className="d5-note">
            Each game pays the same 15/12/10/8/7/6/5/4/3/2/1 by finish, and the run adds the five up.
            A game played on its own still counts, so there is nothing to opt into.
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
