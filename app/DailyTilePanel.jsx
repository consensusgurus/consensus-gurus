'use client';

// The expanded state of a daily-puzzle tile on the quiz home board (owner
// request, 2026-07-29). It OVERLAYS the tile grid rather than being inserted
// into it, so the board's height never changes and nothing on the page moves.
// DailyStrip renders it absolutely inside .dhome, so it covers the ENTIRE
// console including the stats bar at the top: the bar's own Play button sat
// inches from this panel's Play button, which read as two competing controls
// (owner, 2026-07-29).
//
// LAYOUT (owner, 2026-07-29): the panel is pinned to all four edges of the board
// body so it covers the grid, but its CONTENT is compact and top-aligned. An
// earlier version stretched the rows and the calendar to fill every pixel; that
// spread the stats into widely spaced lines and left the month floating in its
// column, so it was reverted. Natural row heights and a square calendar read
// cleaner, and the leftover navy at the bottom is simply quiet space.
//
// EQUAL CARD HEIGHTS (owner rule, 2026-08-01, and NOT a return to the above):
// the three cards in that row always end on the same line. The height comes
// from the archive card, whose calendar is padded to six week rows so it is
// the tallest possible month rather than whatever month is on screen; the
// record and leaderboard cards stretch to that line and spend the extra space
// on their own rows. The bottom strip below the row is unaffected, so the
// panel still ends in quiet space rather than stretching to the floor.
//
// What it shows: identity plus a one-sentence how-to-play (roster field `how` in
// lib/daily-games.js), a large Play button and an equally obvious close, today's
// record, the viewer's all-time record for the game, archive completion, streak
// detail, community size, a month calendar of the archive, and the game's
// all-time leaderboard. Everything past "today" comes from ONE lazy fetch of
// /api/quiz/daily-game, cached per game by the parent.

import React, { useEffect, useMemo, useState } from 'react';
import { Play, X, Flame, Crown, ChevronLeft, ChevronRight, CalendarDays, Trophy, TrendingUp, Share2, Users, Star } from 'lucide-react';
import { notifyShareCredit } from './ShareCreditPop';
import { DAILY_GAME_MAP } from '../lib/daily-games';
import { T } from '@/lib/theme';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const CAL_WD = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const TREND_MAX = 24; // most recent drops charted, so the row stays readable

// The Crowd Psychology games (owner, 2026-08-01). For these three the panel's
// bottom section leads with TODAY'S CROWD ANSWERS rather than the viewer's score
// history, because the crowd tally IS the game's artifact: the answer key is
// whatever the day's players said, and it moves all day. The history chart is
// still there, one click away, and stays the only view for every other game.
//
// SPOILER GATE (owner rule, 2026-08-01): the crowd view is offered ONLY to a
// player who has already locked in today's puzzle. Someone who has not played
// sees no crowd tab at all and lands on the chart, and /api/quiz/crowd-today
// independently refuses to return any tally to them, so the answers cannot be
// reached from here either by clicking or by calling the route.
const CROWD_GAMES = new Set(['outwit', 'outrank', 'feud']);
function shortDate(iso) {
  const p = String(iso || '').split('-');
  return p.length === 3 ? MONTH_SHORT[Number(p[1]) - 1] + ' ' + Number(p[2]) : '';
}

function etTodayISO() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}
function fmtPts(x) { const v = Math.round(Number(x) * 10) / 10; return Number.isInteger(v) ? String(v) : v.toFixed(1); }

export default function DailyTilePanel({
  game, accent, isDone = false, inProgress = false, streak = 0,
  todayRow = null, todayField = null, standings = [], meKey = null,
  data = null, canPin = false, pinned = false, onTogglePin = null, onClose,
}) {
  const todayISO = etTodayISO();
  const how = (DAILY_GAME_MAP[game.key] && DAILY_GAME_MAP[game.key].how) || game.tag;

  const drops = (data && Array.isArray(data.drops)) ? data.drops : [];
  const allTime = (data && data.allTime) || null;
  const mine = (data && data.mine) || null;
  const loading = !data;

  const [calMonth, setCalMonth] = useState(() => todayISO.slice(0, 7));
  useEffect(() => { setCalMonth(todayISO.slice(0, 7)); }, [game.key, todayISO]);

  // Today's crowd answers, for the three crowd games only, and only once the
  // viewer has finished today's puzzle. `isDone` gates the REQUEST (so a
  // non-player's browser never even asks) and the route gates the ANSWER by
  // account, which is what covers the case where this browser looks unplayed
  // but the account played elsewhere. crowd === null means still loading.
  const isCrowdGame = CROWD_GAMES.has(game.key);
  const [crowd, setCrowd] = useState(null);
  const [crowdFailed, setCrowdFailed] = useState(false);
  useEffect(() => {
    setCrowd(null); setCrowdFailed(false);
    if (!isCrowdGame || !isDone) return;
    let anonId = null, email = null;
    try { anonId = localStorage.getItem('sot_quiz_anon'); } catch (e) {}
    try { const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null'); email = id && id.email; } catch (e) {}
    if (!anonId && !email) { setCrowdFailed(true); return; }
    const qs = new URLSearchParams({ game: game.key });
    if (anonId) qs.set('anonId', anonId);
    if (email) qs.set('email', email);
    let alive = true;
    fetch('/api/quiz/crowd-today?' + qs.toString())
      .then((r) => r.json())
      .then((d) => { if (!alive) return; if (d && d.ok) setCrowd(d); else setCrowdFailed(true); })
      .catch(() => { if (alive) setCrowdFailed(true); });
    return () => { alive = false; };
  }, [game.key, isCrowdGame, isDone]);

  // The crowd tab exists only when there is (or may still be) crowd data to
  // show. `view` stays null until the reader picks a side, so the default is
  // crowd wherever it is available and the chart everywhere else, but an
  // explicit click is never overridden by data landing late.
  const crowdGroups = (crowd && crowd.played && Array.isArray(crowd.groups)) ? crowd.groups : [];
  const crowdReady = crowdGroups.length > 0;
  const crowdPending = isCrowdGame && isDone && !crowd && !crowdFailed;
  const crowdOffered = crowdReady || crowdPending;
  const [view, setView] = useState(null);
  const showCrowd = crowdOffered && view !== 'trend';

  // NO AUTO-SCROLL ON OPEN (owner, 2026-08-07). There used to be a
  // scrollIntoView here for small screens: back when the home board was a TILE
  // GRID, the in-flow panel replaced tiles that were hidden beneath it, so a
  // tile tapped low down could leave the page scrolled past where the panel
  // now began. The slate opens this drawer directly under its own row and
  // hides nothing, so the call had nothing left to correct and simply shifted
  // the page down on every open. Do not reintroduce it.

  // Esc closes, matching the Close button.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const dropByISO = useMemo(() => new Map(drops.map((d) => [d.dateISO, d])), [drops]);
  const earliestYM = drops.length ? drops[0].dateISO.slice(0, 7) : todayISO.slice(0, 7);
  const latestYM = todayISO.slice(0, 7);
  const [calY, calM] = calMonth.split('-').map(Number);
  const firstWeekday = new Date(Date.UTC(calY, calM - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(calY, calM, 0)).getUTCDate();
  const cells = [];
  for (let k = 0; k < firstWeekday; k++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // ALWAYS six week rows, even for a month that only needs four or five (owner,
  // 2026-08-01). The calendar is the tallest of the three columns, so letting
  // its height float by month made the whole row of cards change height as the
  // reader paged through the archive. Padding to the tallest POSSIBLE month
  // fixes the column, and the two columns to its left stretch to match it.
  while (cells.length < 42) cells.push(null);
  const shiftMonth = (delta) => {
    let y = calY, m = calM + delta;
    while (m < 1) { m += 12; y -= 1; }
    while (m > 12) { m -= 12; y += 1; }
    setCalMonth(y + '-' + String(m).padStart(2, '0'));
  };

  const todayScore = todayRow
    ? (todayRow.total != null && Number(todayRow.total) > 0
      ? fmtPts(todayRow.score) + '/' + fmtPts(todayRow.total)
      : (todayRow.score != null ? fmtPts(todayRow.score) : fmtPts(todayRow.points)))
    : null;
  const beatPct = (todayRow && todayField > 0)
    ? Math.max(0, Math.round(((todayField - todayRow.rank) / todayField) * 100)) : null;

  const totalDrops = drops.length;
  const playedCount = mine ? mine.plays : drops.filter((d) => d.played).length;
  const archivePct = totalDrops ? Math.round((playedCount / totalDrops) * 100) : null;
  const longest = mine ? Math.max(mine.longestStreak || 0, streak || 0) : streak;
  const dash = loading ? '·' : '—';

  const trend = useMemo(() => {
    const per = (mine && mine.perDrop) || {};
    const vals = drops.slice(-TREND_MAX).map((d) => ({
      iso: d.dateISO, href: d.href, isToday: d.isToday,
      pts: (per[d.dateISO] != null ? Number(per[d.dateISO]) : null),
    }));
    const played = vals.filter((v) => v.pts != null);
    const max = played.length ? Math.max(...played.map((v) => v.pts)) : 0;
    const avg = played.length ? played.reduce((a, v) => a + v.pts, 0) / played.length : null;
    return { vals, max, avg, count: played.length };
  }, [drops, mine]);
  const avgPct = (trend.max > 0 && trend.avg != null) ? Math.min(97, (trend.avg / trend.max) * 100) : null;
  // Past ~12 columns a per-bar date label stops fitting, so the chart falls back
  // to the two end dates.
  const denseTrend = trend.vals.length > 12;

  const board = (allTime && Array.isArray(allTime.board)) ? allTime.board.slice(0, 3) : [];
  const meOnBoard = board.some((r) => r.isMe);
  const myRank = allTime && allTime.myRank;
  const todayTop = (standings || []).slice(0, 3);
  const meInTodayTop = !!(meKey && todayTop.some((r) => r.userKey === meKey));

  return (
    <div className="dtp" style={{ '--gc': accent }} role="region" aria-label={game.name + ' details'}>
      <div className="dtp-hd">
        <span className="dtp-ic"><img src={game.img} alt="" aria-hidden="true" /></span>
        <div className="dtp-idt">
          <div className="dtp-nm">
            <span className="dtp-nmt">{game.name}</span>
            {streak >= 2 ? <span className="dtp-flame"><Flame size={12} strokeWidth={2.6} />{streak}</span> : null}
            {isDone ? <span className="dtp-donechip">Done today</span> : null}
            {/* Shares THIS game rather than the quizzes home the panel sits on,
                so the credit link sends people straight to it. */}
            <button
              type="button"
              className="dtp-sharechip"
              onClick={() => {
                const base = (typeof window !== 'undefined' && window.location) ? window.location.origin : '';
                notifyShareCredit('', base + game.href);
              }}
            ><Share2 size={11} strokeWidth={2.6} />Share for credit</button>
            {/* Pin this game to the top of the home board (owner, 2026-08-02).
                This is the ONLY pin control for a FINISHED game: that tile is
                itself a button, so it can only carry a static star, and the
                panel it opens is where the toggle lives. Registered viewers
                only, since the set is stored on the account. */}
            {canPin && onTogglePin ? (
              <button
                type="button"
                className={'dtp-pinchip' + (pinned ? ' on' : '')}
                onClick={onTogglePin}
                aria-pressed={pinned}
                title={pinned ? 'Remove from your games' : 'Show this game first on your board'}
              >
                <Star size={11} strokeWidth={2.6} fill={pinned ? T.gold : 'none'} />
                {pinned ? 'One of your games' : 'Pin to your games'}
              </button>
            ) : null}
          </div>
          <p className="dtp-how">{how}</p>
        </div>
        <div className="dtp-acts">
          <a href={game.href} className="dtp-play">
            <Play size={15} fill="currentColor" strokeWidth={0} />
            {isDone ? 'Play again' : (inProgress ? 'Resume' : 'Play')}
          </a>
          <button type="button" className="dtp-shrink" onClick={onClose}><X size={14} strokeWidth={2.6} />Close</button>
        </div>
      </div>

      <div className="dtp-grid">
        <section className="dtp-col">
          <div className="dtp-lab">Your record</div>
          <div className="dtp-stats">
            <div><b>{todayScore || (isDone ? 'Done' : '—')}</b><span>Today</span></div>
            <div><b>{todayRow && todayRow.rank ? '#' + todayRow.rank : '—'}</b><span>Rank today</span></div>
            <div><b>{streak || '—'}</b><span>Streak</span></div>
            <div><b>{loading ? dash : (myRank ? '#' + myRank : '—')}</b><span>All-time rank</span></div>
          </div>
          <div className="dtp-rows">
            <div className="dtp-row"><span>Archive played</span><b>{loading ? dash : playedCount + ' of ' + totalDrops + (archivePct != null ? ' · ' + archivePct + '%' : '')}</b></div>
            <div className="dtp-row"><span>Best day</span><b>{loading ? dash : (mine && mine.bestPoints != null ? fmtPts(mine.bestPoints) + ' pts' : '—')}</b></div>
            <div className="dtp-row"><span>Average day</span><b>{loading ? dash : (mine && mine.avgPoints != null ? fmtPts(mine.avgPoints) + ' pts' : '—')}</b></div>
            <div className="dtp-row"><span>Longest streak</span><b>{loading ? dash : (longest ? longest + ' day' + (longest === 1 ? '' : 's') : '—')}</b></div>
            {beatPct != null ? <div className="dtp-row beat"><span>Today you beat</span><b>{beatPct}% of players</b></div> : null}
          </div>
        </section>

        <section className="dtp-col">
          <div className="dtp-lab"><Trophy size={12} strokeWidth={2.4} />Today
            {todayField != null ? <span className="dtp-labct">{todayField.toLocaleString()} playing</span> : null}
          </div>
          <div className="dtp-lb">
            {todayTop.length ? (
              <>
                {todayTop.map((r, i) => {
                  const mineRow = meKey && r.userKey === meKey;
                  return (
                    <div key={'t' + (r.userKey || i)} className={'dtp-lrow' + (mineRow ? ' me' : '')}>
                      <span className="pl">{r.rank === 1 ? <Crown size={12} /> : (r.rank || i + 1)}</span>
                      <b>{r.username || 'Player'}{mineRow ? ' (you)' : ''}</b>
                      <span className="sc">{fmtPts(r.points)}</span>
                    </div>
                  );
                })}
                {todayRow && !meInTodayTop ? (
                  <div className="dtp-lrow me">
                    <span className="pl">{todayRow.rank || '—'}</span>
                    <b>You</b>
                    <span className="sc">{todayRow.points != null ? fmtPts(todayRow.points) : '—'}</span>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="dtp-empty">No scores yet today. Be the first.</div>
            )}
          </div>

          <div className="dtp-lab sm"><Trophy size={12} strokeWidth={2.4} />All-time
            {!loading && allTime && allTime.plays != null ? <span className="dtp-labct">{allTime.plays.toLocaleString()} players</span> : null}
          </div>
          <div className="dtp-lb">
            {loading ? (
              <div className="dtp-empty">Loading standings…</div>
            ) : board.length ? (
              <>
                {board.map((r, i) => (
                  <div key={r.userKey || i} className={'dtp-lrow' + (r.isMe ? ' me' : '')}>
                    <span className="pl">{r.rank === 1 ? <Crown size={12} /> : r.rank}</span>
                    <b>{r.username || 'Player'}{r.isMe ? ' (you)' : ''}</b>
                    <span className="sc">{fmtPts(r.points)}</span>
                  </div>
                ))}
                {myRank && !meOnBoard ? (
                  <div className="dtp-lrow me">
                    <span className="pl">{myRank}</span>
                    <b>You{allTime && allTime.provisional ? ' (prov.)' : ''}</b>
                    <span className="sc">{allTime.myPoints != null ? fmtPts(allTime.myPoints) : '—'}</span>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="dtp-empty">No all-time standings yet. Be the first.</div>
            )}
          </div>
          <div className="dtp-lfoot">
            {allTime && allTime.field ? allTime.field.toLocaleString() + ' ranked' : ''}
            <a href={`/quizzes/hub?tab=daily&game=${game.key}`}>Full standings →</a>
          </div>
        </section>

        <section className="dtp-col">
          <div className="dtp-lab"><CalendarDays size={12} strokeWidth={2.4} />Archive</div>
          <div className="dtp-calhd">
            <button type="button" onClick={() => shiftMonth(-1)} disabled={calMonth <= earliestYM} aria-label="Previous month"><ChevronLeft size={15} strokeWidth={2.6} /></button>
            <span className="dtp-mo">{MONTH_NAMES[(calM - 1) % 12]} {calY}</span>
            <button type="button" onClick={() => shiftMonth(1)} disabled={calMonth >= latestYM} aria-label="Next month"><ChevronRight size={15} strokeWidth={2.6} /></button>
          </div>
          <div className="dtp-wd">{CAL_WD.map((w, i) => <span key={'w' + i}>{w}</span>)}</div>
          <div className="dtp-cal">
            {cells.map((d, i) => {
              if (d === null) return <span key={'e' + i} className="dtp-cell empty" />;
              const iso = calY + '-' + String(calM).padStart(2, '0') + '-' + String(d).padStart(2, '0');
              const drop = dropByISO.get(iso);
              if (!drop) return <span key={iso} className="dtp-cell none">{d}</span>;
              const cls = 'dtp-cell' + (drop.played ? ' played' : ' open') + (drop.isToday ? ' today' : '');
              return <a key={iso} href={drop.href} className={cls} title={drop.played ? 'Played' : 'Not played yet'}>{d}</a>;
            })}
          </div>
          <div className="dtp-key">
            <span><i className="sw played" />Played</span>
            <span><i className="sw open" />Open</span>
            <span><i className="sw today" />Today</span>
          </div>
        </section>
      </div>

      {/* The bottom strip: today's crowd answers on the three crowd games (the
          default there), the day-by-day history everywhere else. Both fill the
          space the compact columns above leave behind. */}
      <section className="dtp-trend">
        <div className="dtp-lab">
          {showCrowd ? <Users size={12} strokeWidth={2.4} /> : <TrendingUp size={12} strokeWidth={2.4} />}
          {showCrowd
            ? 'Today’s crowd answers'
            : (trend.count > 0 ? `Your last ${trend.vals.length} days` : 'Your history')}
          {showCrowd
            ? (crowdReady && crowd.headline ? <span className="dtp-tsum">{crowd.headline}{crowd.field ? ' · ' + crowd.field.toLocaleString() + ' played' : ''}</span> : null)
            : (trend.count > 0 ? <span className="dtp-tsum">all-time best {fmtPts(mine.bestPoints)} &middot; avg {fmtPts(mine.avgPoints)}</span> : null)}
          {/* Only a player who has finished today's puzzle ever sees this
              toggle: with no crowd data there is nothing to switch to. */}
          {crowdOffered ? (
            <span className="dtp-tabs" role="group" aria-label="Bottom panel view">
              <button type="button" className={showCrowd ? 'on' : ''} aria-pressed={showCrowd} onClick={() => setView('crowd')}>Crowd</button>
              <button type="button" className={showCrowd ? '' : 'on'} aria-pressed={!showCrowd} onClick={() => setView('trend')}>Your history</button>
            </span>
          ) : null}
        </div>
        {showCrowd ? (
          crowdReady ? (
            <div className="dtp-cwrap">
              <div className="dtp-cg">
                {crowdGroups.map((g, gi) => (
                  <div className="dtp-ccard" key={'g' + gi}>
                    <div className="dtp-cq">
                      <span>{g.q}</span>
                      {g.note ? <b>{g.note}</b> : null}
                    </div>
                    {(g.rows || []).length ? (
                      <div className="dtp-crows">
                        {g.rows.map((r, ri) => (
                          <div className={'dtp-crow' + (r.you ? ' you' : '')} key={'r' + ri}>
                            <i className="bar" style={{ width: Math.max(3, Math.min(100, r.pct || 0)) + '%' }} aria-hidden="true" />
                            <span className="nm">{r.label}</span>
                            {r.sub ? <span className="sub">{r.sub}</span> : null}
                            {r.tag && !r.sub ? <span className="tg">{r.tag}</span> : null}
                            <span className="pc">{r.pct}%</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {g.text ? <div className="dtp-ctext">{g.text}</div> : null}
                  </div>
                ))}
              </div>
              {crowd.houseActive ? (
                <div className="dtp-cfoot">Early crowd: the day&rsquo;s pool is still seeded, so these shares will move as players arrive.</div>
              ) : null}
            </div>
          ) : (
            <div className="dtp-empty">Loading today&rsquo;s crowd&hellip;</div>
          )
        ) : loading ? (
          <div className="dtp-empty">Loading your history…</div>
        ) : trend.count > 0 ? (
          <>
            {/* The chart is two parallel rows sharing one column rule, so the
                bar and its date always line up. The dashed average line stays
                inside the bar row, whose height is the only thing the bar
                percentages are measured against. The per-day player counts
                that used to ride above the bars are gone (owner, 2026-07-31):
                on a phone the pills were wider than their own column and piled
                into an unreadable smear, and the chart is about YOUR scores. */}
            <div className="dtp-tkey">
              <span><i className="sw bar" />Your daily points</span>
              {trend.avg != null ? <span><i className="sw avg" />Your average, {fmtPts(trend.avg)}</span> : null}
            </div>
            <div className="dtp-bars">
              {avgPct != null ? (
                <span className="dtp-avg" style={{ bottom: avgPct + '%' }} aria-hidden="true">
                  <i>avg {fmtPts(trend.avg)}</i>
                </span>
              ) : null}
              {trend.vals.map((v) => {
                const h = v.pts != null && trend.max > 0 ? Math.max(5, (v.pts / trend.max) * 100) : 0;
                const title = shortDate(v.iso)
                  + (v.pts != null ? ' · you scored ' + fmtPts(v.pts) : ' · you did not play');
                return (
                  <a key={v.iso} href={v.href} className="dtp-barw" title={title} aria-label={title}>
                    {v.pts != null
                      ? <span className={'dtp-bar' + (v.isToday ? ' today' : '')} style={{ height: h + '%' }} />
                      : <span className="dtp-bar miss" />}
                  </a>
                );
              })}
            </div>
            {denseTrend ? (
              <div className="dtp-bx">
                <span>{shortDate(trend.vals[0].iso)}</span>
                <span>{shortDate(trend.vals[trend.vals.length - 1].iso)}</span>
              </div>
            ) : (
              <div className="dtp-daterow">
                {trend.vals.map((v) => (
                  <span key={'d' + v.iso} className={'dtp-dc' + (v.isToday ? ' today' : '')}>{shortDate(v.iso)}</span>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="dtp-empty">Play it once and your day by day history shows up here.</div>
        )}
      </section>

      <style>{`
        .dtp{position:absolute;inset:0;z-index:6;background:var(--white);border-radius:13px;color:var(--ink);
             padding:13px 16px;display:flex;flex-direction:column;gap:10px;overflow:hidden;
             font-family:'Manrope',system-ui,-apple-system,sans-serif;animation:dtpIn .16s ease-out;}
        /* Opacity only. A scale here left the panel measurably inset from the
           board edges: the component re-renders when its data lands, which
           re-inserts this stylesheet and restarts the animation, so the 0.99
           scale never settled and the panel sat ~4px inside its box. */
        @keyframes dtpIn{from{opacity:0;}to{opacity:1;}}
        .dtp-hd{display:flex;align-items:flex-start;gap:13px;flex:none;}
        .dtp-ic{flex:none;width:50px;height:50px;border-radius:12px;background:#f7f9fc;border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center;}
        .dtp-ic img{height:32px;width:auto;max-width:42px;object-fit:contain;}
        .dtp-idt{flex:1;min-width:0;}
        .dtp-nm{font-size:22px;font-weight:800;letter-spacing:-.3px;display:flex;align-items:center;gap:9px;flex-wrap:wrap;line-height:1.1;}
        .dtp-flame{display:inline-flex;align-items:center;gap:3px;background:rgba(232,180,58,0.16);border:1px solid rgba(232,180,58,0.42);border-radius:999px;padding:1px 8px;font-size:11.5px;font-weight:800;color:#8a5300;}
        .dtp-donechip{display:inline-flex;align-items:center;background:rgba(34,197,94,0.15);border:1px solid rgba(34,197,94,0.4);border-radius:999px;padding:1px 9px;font-size:11px;font-weight:800;color:#116932;}
        .dtp-sharechip{display:inline-flex;align-items:center;gap:5px;background:rgba(232,180,58,0.12);border:1px solid rgba(232,180,58,0.42);border-radius:999px;padding:2px 10px;font-size:11px;font-weight:800;color:#8a5300;font-family:inherit;cursor:pointer;transition:background .12s,color .12s;}
        .dtp-sharechip svg{transition:color .12s;}
        .dtp-sharechip:hover{background:var(--cta);color:var(--cta-ink);}
        .dtp-sharechip:hover svg{color:var(--ink);}
        /* Pin chip. The panel is WHITE (.dtp above), so this takes the same ink
           treatment as the share chip beside it rather than the navy-panel
           palette the board's tiles use. Unpinned it is a grey outline, pinned
           it fills gold, which matches the star on the tiles. This is the only
           pin control a FINISHED game has, so it has to be plainly visible. */
        .dtp-pinchip{display:inline-flex;align-items:center;gap:5px;background:transparent;border:1px solid var(--border);border-radius:999px;padding:2px 10px;font-size:11px;font-weight:800;color:#4d5872;font-family:inherit;cursor:pointer;transition:background .12s,color .12s,border-color .12s;}
        .dtp-pinchip:hover{background:rgba(232,180,58,0.16);border-color:rgba(232,180,58,0.55);color:#8a5300;}
        .dtp-pinchip.on{background:var(--cta);border-color:var(--cta);color:var(--cta-ink);}
        .dtp-how{font-size:12.5px;line-height:1.4;color:var(--slate);font-weight:600;margin:4px 0 0;max-width:64ch;}
        .dtp-acts{flex:none;display:flex;align-items:center;gap:8px;}
        .dtp-play{display:inline-flex;align-items:center;justify-content:center;gap:7px;background:var(--cta);color:var(--cta-ink);font-weight:800;font-size:15px;
                  border-radius:10px;padding:12px 24px;text-decoration:none;border:none;cursor:pointer;transition:background .12s,transform .12s;}
        .dtp-play:hover{background:var(--cta-hover);transform:translateY(-1px);}
        .dtp-shrink{display:inline-flex;align-items:center;justify-content:center;gap:6px;border:1px solid var(--gold);background:var(--cta);color:var(--cta-ink);
                    font-weight:800;font-size:13px;border-radius:10px;padding:12px 16px;cursor:pointer;font-family:inherit;transition:background .12s,transform .12s;}
        .dtp-shrink:hover{background:var(--cta-hover);border-color:var(--cta-hover);transform:translateY(-1px);}
        /* THE THREE CARDS ARE ALWAYS THE SAME HEIGHT (owner rule, 2026-08-01).
           The archive card sets that height, because its calendar is padded to
           six week rows (the tallest possible month, see the cells builder), so
           the row never changes height as the reader pages through months. The
           record and leaderboard cards stretch to meet it and hand the extra
           space to their own content: the stat rows spread, the leaderboard
           rows spread, and each card's footer sits on the bottom edge.
           (This is NOT the old "stretch everything to the panel floor" layout
           that was reverted on 2026-07-29 for looking sparse. The cards match
           the calendar and stop there; the leftover navy below is untouched.) */
        .dtp-grid{flex:none;display:grid;grid-template-columns:1.05fr .95fr .95fr;gap:13px;align-items:stretch;}
        .dtp-col{min-width:0;display:flex;flex-direction:column;background:var(--white);border:1.5px solid var(--border);border-radius:11px;padding:12px 13px;}
        .dtp-lab{display:flex;align-items:center;gap:6px;font-family:'DM Mono',ui-monospace,monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:500;margin-bottom:8px;flex:none;}
        .dtp-lab.sm{margin-top:10px;}
        /* community size lives in the leaderboard label, right aligned, rather than
           as its own stat row in column one (owner, 2026-07-29). */
        .dtp-labct{margin-left:auto;font-family:'DM Mono',ui-monospace,monospace;font-size:9.5px;letter-spacing:.06em;color:#8a9bb8;font-weight:500;flex:none;}
        .dtp-lab svg{color:var(--gc);}
        .dtp-stats{display:grid;grid-template-columns:1fr 1fr;gap:8px;flex:none;}
        .dtp-stats>div{background:#f7f9fc;border:1px solid #dde3ec;border-radius:9px;padding:6px 9px;}
        .dtp-stats b{display:block;font-size:17px;font-weight:800;line-height:1.15;font-variant-numeric:tabular-nums;}
        .dtp-stats span{font-family:'DM Mono',ui-monospace,monospace;font-size:8.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin-top:2px;display:block;}
        /* the rows take the height the calendar handed this column and spread
           through it, rather than bunching under the stat tiles */
        .dtp-rows{flex:1 1 auto;display:flex;flex-direction:column;justify-content:space-between;margin-top:8px;}
        .dtp-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:4px 0;border-bottom:1px solid #dde3ec;font-size:11.5px;}
        .dtp-row:last-child{border-bottom:none;}
        .dtp-row span{color:var(--muted);font-weight:600;}
        .dtp-row b{color:var(--ink);font-weight:700;font-variant-numeric:tabular-nums;text-align:right;}
        .dtp-row.beat b{color:#6ee7b7;}
        .dtp-calhd{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px;flex:none;}
        .dtp-mo{font-size:13px;font-weight:800;}
        .dtp-calhd button{width:25px;height:25px;display:flex;align-items:center;justify-content:center;border-radius:7px;border:1px solid #c8d0dc;background:transparent;color:var(--slate);cursor:pointer;}
        .dtp-calhd button:hover:not(:disabled){background:var(--surface);color:var(--ink);}
        .dtp-calhd button:disabled{opacity:.3;cursor:default;}
        .dtp-wd{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;flex:none;margin-bottom:3px;}
        .dtp-wd span{font-family:'DM Mono',ui-monospace,monospace;font-size:9px;color:var(--muted);text-align:center;}
        /* the month fills the column: each week row is an equal share of the height */
        .dtp-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;flex:none;}
        .dtp-cell{aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;border-radius:6px;color:#4b5563;text-decoration:none;font-variant-numeric:tabular-nums;}
        .dtp-cell.empty{background:transparent;}
        .dtp-cell.none{color:#3d4f70;}
        a.dtp-cell.played{background:rgba(34,197,94,0.2);border:1px solid rgba(34,197,94,0.45);color:#6ee7b7;}
        a.dtp-cell.open{background:var(--surface);border:1px solid #c8d0dc;color:var(--slate);}
        a.dtp-cell.open:hover{border-color:var(--gc);color:var(--ink);}
        a.dtp-cell.today{box-shadow:0 0 0 2px var(--gold);}
        .dtp-key{display:flex;flex-wrap:wrap;gap:5px 13px;margin-top:auto;padding-top:8px;font-size:10.5px;color:var(--muted);font-weight:600;flex:none;}
        .dtp-key span{display:inline-flex;align-items:center;gap:5px;}
        .dtp-key .sw{width:10px;height:10px;border-radius:3px;flex:none;}
        .dtp-key .sw.played{background:rgba(34,197,94,0.35);border:1px solid rgba(34,197,94,0.55);}
        .dtp-key .sw.open{background:var(--surface);border:1px solid #c8d0dc;}
        .dtp-key .sw.today{background:transparent;border:2px solid var(--gold);}
        /* leaderboard rows share the leftover height the same way: the two
           boards split it evenly and each spreads its own rows */
        .dtp-lb{flex:1 1 auto;display:flex;flex-direction:column;justify-content:space-between;}
        .dtp-lrow{display:flex;align-items:center;gap:9px;padding:4px 0;border-bottom:1px solid #dde3ec;font-size:11.5px;color:var(--muted);}
        .dtp-lrow:last-child{border-bottom:none;}
        .dtp-lrow .pl{width:17px;font-family:'DM Mono',ui-monospace,monospace;font-size:10.5px;color:var(--muted);flex:none;display:flex;align-items:center;}
        .dtp-lrow .pl svg{color:var(--gold-ink);}
        .dtp-lrow b{color:var(--ink);font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;flex:1;}
        .dtp-lrow .sc{margin-left:auto;font-family:'DM Mono',ui-monospace,monospace;font-size:11.5px;color:var(--ink);flex:none;}
        .dtp-lrow.me{background:#fdf4dd;border-radius:6px;padding:3px 8px;border-bottom:none;margin:1px -8px;}
        .dtp-lrow.me b,.dtp-lrow.me .pl,.dtp-lrow.me .sc{color:#8a5300;}
        .dtp-lfoot{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:auto;padding-top:9px;font-size:10.5px;color:var(--muted);font-weight:600;flex:none;}
        .dtp-lfoot a{color:#8a5300;text-decoration:none;font-weight:700;}
        .dtp-lfoot a:hover{text-decoration:underline;}
        .dtp-empty{font-size:12px;color:var(--muted);font-weight:600;padding:6px 0;}
        /* score trend */
        .dtp-trend{flex:1 1 auto;min-height:92px;display:flex;flex-direction:column;padding-top:2px;}
        .dtp-tsum{margin-left:auto;font-family:'Manrope',system-ui,sans-serif;font-size:11px;font-weight:700;letter-spacing:0;text-transform:none;color:var(--muted);}
        /* legend, so the bars, the dashed line and the bubbles all say what they are */
        .dtp-tkey{flex:none;display:flex;flex-wrap:wrap;align-items:center;gap:3px 14px;margin:-3px 0 6px;
                  font-family:'DM Mono',ui-monospace,monospace;font-size:9px;letter-spacing:.05em;text-transform:uppercase;color:#5b6577;}
        .dtp-tkey span{display:inline-flex;align-items:center;gap:5px;}
        .dtp-tkey .sw{flex:none;display:inline-block;}
        .dtp-tkey .sw.bar{width:7px;height:11px;border-radius:2px;background:var(--gc);opacity:.85;}
        .dtp-tkey .sw.avg{width:14px;height:0;border-top:1px dashed #8a9bb8;}
        /* every row reserves the same right gutter (--agut) so the columns stay in
           lockstep and the average label has clear space to sit in */
        .dtp-trend{--agut:44px;}
        .dtp-bars{position:relative;flex:1 1 auto;min-height:48px;display:flex;align-items:flex-end;gap:3px;border-bottom:1px solid #dde3ec;padding-bottom:1px;padding-right:var(--agut);}
        .dtp-avg{position:absolute;left:0;right:var(--agut);height:0;border-top:1px dashed var(--border);pointer-events:none;}
        .dtp-avg i{position:absolute;left:100%;bottom:-6px;margin-left:5px;font-style:normal;white-space:nowrap;
                   font-family:'DM Mono',ui-monospace,monospace;font-size:8.5px;line-height:12px;letter-spacing:.04em;color:#5b6577;}
        .dtp-daterow{flex:none;display:flex;gap:3px;margin-top:5px;padding-right:var(--agut);font-family:'DM Mono',ui-monospace,monospace;font-size:9px;color:#5b6577;}
        .dtp-dc{flex:1 1 0;min-width:0;max-width:48px;display:flex;justify-content:center;white-space:nowrap;overflow:hidden;}
        .dtp-dc.today{color:#8a5300;font-weight:500;}
        .dtp-barw{flex:1 1 0;min-width:0;max-width:48px;height:100%;display:flex;align-items:flex-end;justify-content:center;text-decoration:none;border-radius:3px;}
        .dtp-barw:hover{background:var(--surface);}
        .dtp-bar{display:block;width:100%;max-width:22px;background:var(--gc);border-radius:3px 3px 0 0;min-height:3px;opacity:.85;transition:opacity .12s;}
        .dtp-barw:hover .dtp-bar{opacity:1;}
        .dtp-bar.today{background:var(--cta);opacity:1;}
        .dtp-bar.miss{height:5px;background:var(--surface);border-radius:2px;}
        .dtp-bx{display:flex;justify-content:space-between;margin-top:5px;padding-right:var(--agut);font-family:'DM Mono',ui-monospace,monospace;font-size:9px;color:var(--muted);}
        /* crowd answers (outwit / outrank / feud) — the default bottom view for
           those three, with the history chart one click away via .dtp-tabs */
        .dtp-tabs{margin-left:auto;display:inline-flex;gap:2px;background:#f0f3f8;border:1px solid #dde3ec;border-radius:8px;padding:2px;flex:none;}
        .dtp-tabs button{font-family:'Manrope',system-ui,sans-serif;font-size:10.5px;font-weight:800;letter-spacing:0;text-transform:none;
                         border:none;background:transparent;color:var(--slate);border-radius:6px;padding:3px 9px;cursor:pointer;transition:background .12s,color .12s;}
        /* When the summary line is present it owns the free space, so the two
           of them ride right together instead of splitting the gap. */
        .dtp-tsum + .dtp-tabs{margin-left:8px;}
        .dtp-tabs button:hover{color:var(--ink);}
        .dtp-tabs button.on{background:var(--white);color:var(--ink);box-shadow:0 1px 2px rgba(28,30,36,.12);}
        .dtp-cwrap{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;gap:6px;overflow:auto;}
        /* One card per prompt. Feud and Outwit run five, so they sit side by
           side; Outrank has a single slate and its card simply spans the row. */
        .dtp-cg{display:grid;grid-template-columns:repeat(auto-fit,minmax(168px,1fr));gap:8px;align-items:start;}
        .dtp-ccard{min-width:0;background:var(--white);border:1.5px solid var(--border);border-radius:9px;padding:8px 9px;}
        .dtp-cq{display:flex;align-items:flex-start;gap:6px;font-size:11.5px;font-weight:800;line-height:1.3;color:var(--ink);margin-bottom:6px;}
        .dtp-cq span{flex:1 1 auto;min-width:0;}
        .dtp-cq b{flex:none;font-family:'DM Mono',ui-monospace,monospace;font-size:9.5px;font-weight:500;color:#5b6577;white-space:nowrap;padding-top:1px;}
        .dtp-crows{display:flex;flex-direction:column;gap:3px;}
        .dtp-crow{position:relative;display:flex;align-items:center;gap:6px;padding:3px 7px;border-radius:5px;background:#f7f9fc;overflow:hidden;font-size:11px;}
        .dtp-crow .bar{position:absolute;left:0;top:0;bottom:0;background:var(--gc);opacity:.17;border-radius:5px;}
        .dtp-crow.you{background:#fdf4dd;}
        .dtp-crow.you .bar{background:var(--cta);opacity:.34;}
        .dtp-crow .nm{position:relative;flex:1 1 auto;min-width:0;font-weight:700;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .dtp-crow.you .nm{color:#8a5300;}
        .dtp-crow .sub,.dtp-crow .tg{position:relative;flex:none;font-family:'DM Mono',ui-monospace,monospace;font-size:8.5px;letter-spacing:.04em;text-transform:uppercase;color:#5b6577;white-space:nowrap;}
        .dtp-crow.you .sub,.dtp-crow.you .tg{color:#8a5300;}
        .dtp-crow .pc{position:relative;flex:none;font-family:'DM Mono',ui-monospace,monospace;font-size:10px;color:var(--muted);font-variant-numeric:tabular-nums;}
        .dtp-ctext{font-size:10.5px;font-weight:600;line-height:1.45;color:var(--slate);margin-top:6px;}
        .dtp-cfoot{flex:none;font-size:10.5px;font-weight:600;color:#5b6577;}
        @media(max-width:980px){
          /* IN FLOW below 980px. As an absolutely positioned overlay with its
             own scrollbar, the panel swallowed the touch gesture: the page
             could only be scrolled by grabbing the thin margin outside it,
             which is near impossible on a phone (owner, 2026-07-29). In flow it
             grows to its natural height, DailyStrip hides the grid underneath
             it, and the page scrolls normally with no nested scroller. */
          .dtp{position:static;overflow:visible;height:auto;border-radius:11px;animation:none;}
          .dtp-trend{min-height:0;}
          /* An explicit HEIGHT, not min-height (owner, 2026-07-31: "the graphs
             look completely broken on mobile"). In flow the panel is auto
             height, so .dtp-bars had no definite height, so every bar's
             percentage height resolved against nothing and collapsed to the
             3px min: the chart rendered as a row of identical nubs. A real
             height makes the percentages resolve again. */
          .dtp-bars{height:118px;min-height:0;}
          /* In flow the panel is auto height, so the crowd list grows instead
             of becoming a nested scroller the page can't scroll past. */
          .dtp-cwrap{overflow:visible;min-height:0;}
          .dtp-grid{grid-template-columns:1fr 1fr;gap:16px;}
          .dtp-col:nth-child(3){grid-column:1/-1;}
        }
        @media(max-width:720px){
          .dtp{padding:13px;}
          .dtp-hd{flex-wrap:wrap;gap:11px;}
          .dtp-nm{font-size:19px;}
          /* The drawer opens directly under the slate row, which ALREADY shows
             the tile art, the game name and a Play button, and the row's own
             chevron closes it again. Repeating all of that plus the one-line
             definition cost most of a phone screen before the first real stat,
             so on a phone the drawer opens straight into "Your record" (owner,
             2026-08-07). What survives is the chip line: Done today, the streak
             flame, Share for credit and the pin, none of which the row repeats
             in full. Desktop is unchanged. */
          .dtp-ic,.dtp-nmt,.dtp-how,.dtp-acts{display:none;}
          /* With the icon gone the identity block is the whole header, and the
             chip row needs no leading gap above the grid below it. */
          .dtp-hd{gap:0;}
          .dtp-nm:empty{display:none;}
          .dtp-grid{grid-template-columns:1fr;gap:15px;}
          .dtp-col:nth-child(3){grid-column:auto;}
          /* One prompt per row on a phone: two 168px columns would truncate the
             answer labels, which are the whole point of the view. */
          .dtp-cg{grid-template-columns:1fr;}
        }
      `}</style>
    </div>
  );
}
