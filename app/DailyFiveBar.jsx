'use client';

// DailyFiveBar — the run strip on a daily game page (owner, 2026-08-17).
//
// The Daily Five is five dailies from five different categories played as one
// sitting (lib/daily-five.js). This is how a player moves between them: one
// band under the header carrying every game in the run, ticked as they are
// played, each a link that keeps the run attached, and the next one called out
// so a finished game turns into the next game.
//
// IT SERVES EVERY CIRCUIT, not just the marquee (fixed 2026-08-18). The
// trigger is readRunParam — `?five=1` for the Daily Five, `?circuit=<id>` for
// one of the fourteen skill circuits — which means the player either started
// the run deliberately from the console band or was handed on by this bar.
// It read the five flag ALONE until the fix, so a skill circuit rendered no
// strip at all and a finished game had nowhere to hand off to.
//
// IT SHOWS ONLY DURING A RUN. Opening /suds directly shows nothing. That is
// the right default rather than banding all 63 game pages permanently: a
// player who did not ask for a run should not be told they are behind on one.
//
// It renders inside DailyChrome's z-index:5 stacking context, so every overlay
// on the page still lands above it. On the Loft format the slate rail is hidden
// but this bar is NOT: the rail is a browse surface and dropping it was a choice
// about where CHOOSING another daily belongs. This is navigation for something
// already in progress, which is a different thing.
//
// COSTS NO REQUEST OF ITS OWN. It reads the day's completions from the shared
// /api/quiz/daily-me client, which the board panel and the end card are already
// asking for on the same page load; identical queries join one request (see
// app/dailyMeClient.js). A signed-out visitor has no identity to ask about, so
// the bar simply shows no ticks, exactly as the slate rail does.

import React, { useEffect, useState } from 'react';
import { circuitKeysFor, circuitHref, circuitName, readRunParam, isMarquee } from '@/lib/circuits';
import { DAILY_GAME_MAP } from '@/lib/daily-games';
import { fetchDailyMe, dailyMeQuery, dailyMeIdentity } from './dailyMeClient';

const etToday = () => {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
};

export default function DailyFiveBar({ slug }) {
  // Both the flag and the day are read in an effect, never during render: the
  // server has no window and no idea what today is in Eastern, and reading
  // either during render would make the first client paint disagree with the
  // server's. Null until mounted, so the bar is absent for a frame rather than
  // flashing the wrong run.
  // The RUN ID, not a boolean: which circuit, or null for none.
  const [on, setOn] = useState(null);
  const [day, setDay] = useState(null);
  const [perGame, setPerGame] = useState(null);

  useEffect(() => { setOn(readRunParam()); setDay(etToday()); }, []);

  useEffect(() => {
    if (!on || !day) return undefined;
    const { anonId, email } = dailyMeIdentity();
    if (!anonId && !email) return undefined;
    let alive = true;
    const load = () => {
      fetchDailyMe(dailyMeQuery({ anonId, email }))
        .then((d) => { if (alive && d && d.perGame) setPerGame(d.perGame); })
        .catch(() => {});
    };
    load();
    // Finishing this page's game invalidates the shared cache and fires this,
    // which is what ticks the chip you just played and advances "next" without
    // a reload.
    window.addEventListener('sot:daily-updated', load);
    return () => { alive = false; window.removeEventListener('sot:daily-updated', load); };
  }, [on, day]);

  if (!on || !day) return null;
  const members = circuitKeysFor(on, day);
  // A stale or hand-typed flag must not put Suds inside a run that does not
  // contain it, and a day with no run must not render an empty band. The
  // marquee's bank can run out; a skill circuit's roster cannot.
  if (members.length < 2 || !members.includes(slug)) return null;
  const marq = isMarquee(on);
  const runName = circuitName(on);

  // PLAYED, not SOLVED. `abandoned` is a started-and-left run and is not a tick.
  // Solved-versus-failed needs correct_count, which daily-me does not expose per
  // game; navigation only needs to know what is left. Same test the slate rail
  // uses, deliberately, so the two never disagree on one page.
  const done = perGame
    ? new Set(Object.keys(perGame).filter((k) => !(perGame[k] && perGame[k].abandoned)))
    : new Set();
  const played = members.filter((k) => done.has(k)).length;
  const complete = played === members.length;
  // The next unplayed game that is not the one you are looking at, so finishing
  // here has somewhere to go.
  const nextKey = members.find((k) => k !== slug && !done.has(k)) || null;
  const nextGame = nextKey ? DAILY_GAME_MAP[nextKey] : null;

  return (
    <div className={marq ? 'd5b' : 'd5b circ'}>
      <style dangerouslySetInnerHTML={{ __html: `
        .d5b{background:#0d1e56;border-bottom:1px solid #091640;position:relative;z-index:2;
             font-family:'Manrope',system-ui,-apple-system,sans-serif;}
        .d5b-in{max-width:1560px;margin:0 auto;padding:7px clamp(12px,2.5vw,34px);
                display:flex;align-items:center;gap:11px;}
        .d5b-k{position:relative;padding-left:11px;font-size:9px;font-weight:800;letter-spacing:.15em;
               text-transform:uppercase;color:#f0cd7a;white-space:nowrap;flex:none;}
        .d5b-k::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;border-radius:2px;
                       background:var(--gold,#e8b43a);}
        .d5b-rail{flex:1;min-width:0;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;-ms-overflow-style:none;}
        .d5b-rail::-webkit-scrollbar{display:none;}
        .d5b-row{display:flex;gap:6px;width:max-content;padding:1px 0;}
        .d5b-g{background:rgba(255,255,255,.10);border:1px solid #35529e;border-radius:999px;
               padding:5px 12px;font-size:11.5px;font-weight:700;color:#dbe6ff;white-space:nowrap;
               text-decoration:none;flex:none;}
        .d5b-g:hover{background:rgba(255,255,255,.22);border-color:#5f80cf;}
        .d5b-g.is-done{background:rgba(52,211,153,.15);border-color:#2f7d5e;color:#8ff0c4;}
        .d5b-g.is-now{background:var(--blue,#2563eb);border-color:#6d9bff;color:#fff;
                      box-shadow:0 1px 3px rgba(0,0,0,.35);}
        .d5b-n{font-size:11px;font-weight:800;color:#f0cd7a;white-space:nowrap;flex:none;
               font-variant-numeric:tabular-nums;}
        .d5b-n.done{color:#8ff0c4;}
        /* The hand-off. It is the whole reason the bar exists, so it is the one
           filled control on it and it names the game rather than saying "next". */
        .d5b-next{flex:none;background:var(--gold,#e8b43a);color:#3a2a05;border-radius:7px;
                  padding:6px 12px;font-size:10.5px;font-weight:800;letter-spacing:.05em;
                  text-decoration:none;white-space:nowrap;}
        .d5b-next:hover{background:#f0c65c;}
        /* Leaving the run is one tap and it is the SAME page without the flag, so
           nothing is lost and the board does not reload into a different puzzle.
           Without it the only way out of a run is the back button. */
        .d5b-x{font-size:10.5px;font-weight:800;letter-spacing:.04em;color:#93aae2;
               text-decoration:none;white-space:nowrap;flex:none;}
        .d5b-x:hover{color:#dbe6ff;}
        /* A SKILL CIRCUIT IS BLUE, THE MARQUEE IS GOLD, the same rule the
           console band already draws itself by. Gold is reserved for the Five
           because its roster is different every day and cannot be farmed by
           picking an easy one; a fixed circuit is one of fourteen. */
        .d5b.circ .d5b-k{color:#bcd2ff;}
        .d5b.circ .d5b-k::before{background:var(--blue-400,#60a5fa);}
        .d5b.circ .d5b-n{color:#bcd2ff;}
        .d5b.circ .d5b-n.done{color:#8ff0c4;}
        .d5b.circ .d5b-next{background:var(--blue,#2563eb);color:#fff;}
        .d5b.circ .d5b-next:hover{background:#3b7bf5;}
        @media(max-width:860px){.d5b-in{gap:9px;}}
        @media(max-width:560px){.d5b-x,.d5b-k{display:none;}}
      ` }} />
      <div className="d5b-in">
        <span className="d5b-k">{runName}</span>
        <nav className="d5b-rail" aria-label={`${runName} run`}>
          <div className="d5b-row">
            {members.map((k) => {
              const g = DAILY_GAME_MAP[k];
              if (!g) return null;
              const now = k === slug;
              const isDone = done.has(k) && !now;
              return (
                <a
                  key={k}
                  href={circuitHref(k, on)}
                  className={`d5b-g${now ? ' is-now' : (isDone ? ' is-done' : '')}`}
                  aria-current={now ? 'page' : undefined}
                  title={g.tag || g.name}
                >
                  {isDone ? '✓ ' : ''}{g.name}
                </a>
              );
            })}
          </div>
        </nav>
        <span className={complete ? 'd5b-n done' : 'd5b-n'}>{played}/{members.length}</span>
        {nextGame ? <a className="d5b-next" href={circuitHref(nextKey, on)}>Next: {nextGame.name}</a> : null}
        <a className="d5b-x" href={(DAILY_GAME_MAP[slug] || {}).href || `/${slug}`}>Leave</a>
      </div>
    </div>
  );
}
