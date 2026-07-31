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
// What it shows: identity plus a one-sentence how-to-play (roster field `how` in
// lib/daily-games.js), a large Play button and an equally obvious close, today's
// record, the viewer's all-time record for the game, archive completion, streak
// detail, community size, a month calendar of the archive, and the game's
// all-time leaderboard. Everything past "today" comes from ONE lazy fetch of
// /api/quiz/daily-game, cached per game by the parent.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, X, Flame, Crown, ChevronLeft, ChevronRight, CalendarDays, Trophy, TrendingUp, Share2 } from 'lucide-react';
import { notifyShareCredit } from './ShareCreditPop';
import { DAILY_GAME_MAP } from '../lib/daily-games';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const CAL_WD = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const TREND_MAX = 24; // most recent drops charted, so the row stays readable
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
  data = null, onClose,
}) {
  const rootRef = useRef(null);
  const todayISO = etTodayISO();
  const how = (DAILY_GAME_MAP[game.key] && DAILY_GAME_MAP[game.key].how) || game.tag;

  const drops = (data && Array.isArray(data.drops)) ? data.drops : [];
  const allTime = (data && data.allTime) || null;
  const mine = (data && data.mine) || null;
  const loading = !data;

  const [calMonth, setCalMonth] = useState(() => todayISO.slice(0, 7));
  useEffect(() => { setCalMonth(todayISO.slice(0, 7)); }, [game.key, todayISO]);

  // On a small screen the panel is IN FLOW and the grid is hidden beneath it,
  // so a tile tapped low in a long grid can leave the page scrolled past where
  // the panel now begins. 'nearest' only moves the page when the panel is
  // actually out of view, so it never yanks the page on desktop.
  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth > 980) return;
    const el = rootRef.current;
    if (!el) return;
    const id = window.setTimeout(() => {
      try { el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {}
    }, 40);
    return () => window.clearTimeout(id);
  }, [game.key]);

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
  while (cells.length % 7) cells.push(null);
  const weeks = Math.max(1, cells.length / 7);
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
    <div className="dtp" ref={rootRef} style={{ '--gc': accent }} role="region" aria-label={game.name + ' details'}>
      <div className="dtp-hd">
        <span className="dtp-ic"><img src={game.img} alt="" aria-hidden="true" /></span>
        <div className="dtp-idt">
          <div className="dtp-nm">
            {game.name}
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
          </div>
          <p className="dtp-how">{how}</p>
        </div>
        <div className="dtp-acts">
          <a href={game.href} className="dtp-play">
            <Play size={15} fill="#1c1e24" strokeWidth={0} />
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

      {/* Day-by-day history: fills the space the compact columns leave behind. */}
      <section className="dtp-trend">
        <div className="dtp-lab">
          <TrendingUp size={12} strokeWidth={2.4} />
          {trend.count > 0 ? `Your last ${trend.vals.length} days` : 'Your history'}
          {trend.count > 0 ? (
            <span className="dtp-tsum">all-time best {fmtPts(mine.bestPoints)} &middot; avg {fmtPts(mine.avgPoints)}</span>
          ) : null}
        </div>
        {loading ? (
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
        .dtp{position:absolute;inset:0;z-index:6;background:#ffffff;border-radius:13px;color:#1c1e24;
             padding:13px 16px;display:flex;flex-direction:column;gap:10px;overflow:hidden;
             font-family:'Manrope',system-ui,-apple-system,sans-serif;animation:dtpIn .16s ease-out;}
        /* Opacity only. A scale here left the panel measurably inset from the
           board edges: the component re-renders when its data lands, which
           re-inserts this stylesheet and restarts the animation, so the 0.99
           scale never settled and the panel sat ~4px inside its box. */
        @keyframes dtpIn{from{opacity:0;}to{opacity:1;}}
        .dtp-hd{display:flex;align-items:flex-start;gap:13px;flex:none;}
        .dtp-ic{flex:none;width:50px;height:50px;border-radius:12px;background:#f7f9fc;border:1.5px solid #c3ccda;display:flex;align-items:center;justify-content:center;}
        .dtp-ic img{height:32px;width:auto;max-width:42px;object-fit:contain;}
        .dtp-idt{flex:1;min-width:0;}
        .dtp-nm{font-size:22px;font-weight:800;letter-spacing:-.3px;display:flex;align-items:center;gap:9px;flex-wrap:wrap;line-height:1.1;}
        .dtp-flame{display:inline-flex;align-items:center;gap:3px;background:rgba(232,180,58,0.16);border:1px solid rgba(232,180,58,0.42);border-radius:999px;padding:1px 8px;font-size:11.5px;font-weight:800;color:#8a5300;}
        .dtp-donechip{display:inline-flex;align-items:center;background:rgba(34,197,94,0.15);border:1px solid rgba(34,197,94,0.4);border-radius:999px;padding:1px 9px;font-size:11px;font-weight:800;color:#116932;}
        .dtp-sharechip{display:inline-flex;align-items:center;gap:5px;background:rgba(232,180,58,0.12);border:1px solid rgba(232,180,58,0.42);border-radius:999px;padding:2px 10px;font-size:11px;font-weight:800;color:#8a5300;font-family:inherit;cursor:pointer;transition:background .12s,color .12s;}
        .dtp-sharechip svg{transition:color .12s;}
        .dtp-sharechip:hover{background:#e8b43a;color:#1c1e24;}
        .dtp-sharechip:hover svg{color:#1c1e24;}
        .dtp-how{font-size:12.5px;line-height:1.4;color:#46506a;font-weight:600;margin:4px 0 0;max-width:64ch;}
        .dtp-acts{flex:none;display:flex;align-items:center;gap:8px;}
        .dtp-play{display:inline-flex;align-items:center;justify-content:center;gap:7px;background:#e8b43a;color:#1c1e24;font-weight:800;font-size:15px;
                  border-radius:10px;padding:12px 24px;text-decoration:none;border:none;cursor:pointer;transition:background .12s,transform .12s;}
        .dtp-play:hover{background:#f0c358;transform:translateY(-1px);}
        .dtp-shrink{display:inline-flex;align-items:center;justify-content:center;gap:6px;border:1px solid #e8b43a;background:#e8b43a;color:#1c1e24;
                    font-weight:800;font-size:13px;border-radius:10px;padding:12px 16px;cursor:pointer;font-family:inherit;transition:background .12s,transform .12s;}
        .dtp-shrink:hover{background:#f0c358;border-color:#f0c358;transform:translateY(-1px);}
        /* three columns take every remaining pixel */
        .dtp-grid{flex:none;display:grid;grid-template-columns:1.05fr .95fr .95fr;gap:13px;align-items:start;}
        .dtp-col{min-width:0;display:flex;flex-direction:column;background:#fff;border:1.5px solid #c3ccda;border-radius:11px;padding:12px 13px;}
        .dtp-lab{display:flex;align-items:center;gap:6px;font-family:'DM Mono',ui-monospace,monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#262b35;font-weight:500;margin-bottom:8px;flex:none;}
        .dtp-lab.sm{margin-top:10px;}
        /* community size lives in the leaderboard label, right aligned, rather than
           as its own stat row in column one (owner, 2026-07-29). */
        .dtp-labct{margin-left:auto;font-family:'DM Mono',ui-monospace,monospace;font-size:9.5px;letter-spacing:.06em;color:#8a9bb8;font-weight:500;flex:none;}
        .dtp-lab svg{color:var(--gc);}
        .dtp-stats{display:grid;grid-template-columns:1fr 1fr;gap:8px;flex:none;}
        .dtp-stats>div{background:#f7f9fc;border:1px solid #dde3ec;border-radius:9px;padding:6px 9px;}
        .dtp-stats b{display:block;font-size:17px;font-weight:800;line-height:1.15;font-variant-numeric:tabular-nums;}
        .dtp-stats span{font-family:'DM Mono',ui-monospace,monospace;font-size:8.5px;letter-spacing:.06em;text-transform:uppercase;color:#262b35;margin-top:2px;display:block;}
        /* the rows stretch to the bottom of the column instead of bunching at the top */
        .dtp-rows{flex:none;display:flex;flex-direction:column;margin-top:8px;}
        .dtp-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:4px 0;border-bottom:1px solid #dde3ec;font-size:11.5px;}
        .dtp-row:last-child{border-bottom:none;}
        .dtp-row span{color:#262b35;font-weight:600;}
        .dtp-row b{color:#1c1e24;font-weight:700;font-variant-numeric:tabular-nums;text-align:right;}
        .dtp-row.beat b{color:#6ee7b7;}
        .dtp-calhd{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px;flex:none;}
        .dtp-mo{font-size:13px;font-weight:800;}
        .dtp-calhd button{width:25px;height:25px;display:flex;align-items:center;justify-content:center;border-radius:7px;border:1px solid #c8d0dc;background:transparent;color:#46506a;cursor:pointer;}
        .dtp-calhd button:hover:not(:disabled){background:#f7f8fa;color:#1c1e24;}
        .dtp-calhd button:disabled{opacity:.3;cursor:default;}
        .dtp-wd{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;flex:none;margin-bottom:3px;}
        .dtp-wd span{font-family:'DM Mono',ui-monospace,monospace;font-size:9px;color:#262b35;text-align:center;}
        /* the month fills the column: each week row is an equal share of the height */
        .dtp-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;flex:none;}
        .dtp-cell{aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;border-radius:6px;color:#4b5563;text-decoration:none;font-variant-numeric:tabular-nums;}
        .dtp-cell.empty{background:transparent;}
        .dtp-cell.none{color:#3d4f70;}
        a.dtp-cell.played{background:rgba(34,197,94,0.2);border:1px solid rgba(34,197,94,0.45);color:#6ee7b7;}
        a.dtp-cell.open{background:#f7f8fa;border:1px solid #c8d0dc;color:#46506a;}
        a.dtp-cell.open:hover{border-color:var(--gc);color:#1c1e24;}
        a.dtp-cell.today{box-shadow:0 0 0 2px #e8b43a;}
        .dtp-key{display:flex;flex-wrap:wrap;gap:5px 13px;margin-top:8px;font-size:10.5px;color:#262b35;font-weight:600;flex:none;}
        .dtp-key span{display:inline-flex;align-items:center;gap:5px;}
        .dtp-key .sw{width:10px;height:10px;border-radius:3px;flex:none;}
        .dtp-key .sw.played{background:rgba(34,197,94,0.35);border:1px solid rgba(34,197,94,0.55);}
        .dtp-key .sw.open{background:#f7f8fa;border:1px solid #c8d0dc;}
        .dtp-key .sw.today{background:transparent;border:2px solid #e8b43a;}
        /* leaderboard rows share the leftover height the same way */
        .dtp-lb{flex:none;display:flex;flex-direction:column;}
        .dtp-lrow{display:flex;align-items:center;gap:9px;padding:4px 0;border-bottom:1px solid #dde3ec;font-size:11.5px;color:#262b35;}
        .dtp-lrow:last-child{border-bottom:none;}
        .dtp-lrow .pl{width:17px;font-family:'DM Mono',ui-monospace,monospace;font-size:10.5px;color:#262b35;flex:none;display:flex;align-items:center;}
        .dtp-lrow .pl svg{color:#a16207;}
        .dtp-lrow b{color:#1c1e24;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;flex:1;}
        .dtp-lrow .sc{margin-left:auto;font-family:'DM Mono',ui-monospace,monospace;font-size:11.5px;color:#1c1e24;flex:none;}
        .dtp-lrow.me{background:#fdf4dd;border-radius:6px;padding:3px 8px;border-bottom:none;margin:1px -8px;}
        .dtp-lrow.me b,.dtp-lrow.me .pl,.dtp-lrow.me .sc{color:#8a5300;}
        .dtp-lfoot{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:9px;font-size:10.5px;color:#262b35;font-weight:600;flex:none;}
        .dtp-lfoot a{color:#8a5300;text-decoration:none;font-weight:700;}
        .dtp-lfoot a:hover{text-decoration:underline;}
        .dtp-empty{font-size:12px;color:#262b35;font-weight:600;padding:6px 0;}
        /* score trend */
        .dtp-trend{flex:1 1 auto;min-height:92px;display:flex;flex-direction:column;padding-top:2px;}
        .dtp-tsum{margin-left:auto;font-family:'Manrope',system-ui,sans-serif;font-size:11px;font-weight:700;letter-spacing:0;text-transform:none;color:#262b35;}
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
        .dtp-avg{position:absolute;left:0;right:var(--agut);height:0;border-top:1px dashed #c3ccda;pointer-events:none;}
        .dtp-avg i{position:absolute;left:100%;bottom:-6px;margin-left:5px;font-style:normal;white-space:nowrap;
                   font-family:'DM Mono',ui-monospace,monospace;font-size:8.5px;line-height:12px;letter-spacing:.04em;color:#5b6577;}
        .dtp-daterow{flex:none;display:flex;gap:3px;margin-top:5px;padding-right:var(--agut);font-family:'DM Mono',ui-monospace,monospace;font-size:9px;color:#5b6577;}
        .dtp-dc{flex:1 1 0;min-width:0;max-width:48px;display:flex;justify-content:center;white-space:nowrap;overflow:hidden;}
        .dtp-dc.today{color:#8a5300;font-weight:500;}
        .dtp-barw{flex:1 1 0;min-width:0;max-width:48px;height:100%;display:flex;align-items:flex-end;justify-content:center;text-decoration:none;border-radius:3px;}
        .dtp-barw:hover{background:#f7f8fa;}
        .dtp-bar{display:block;width:100%;max-width:22px;background:var(--gc);border-radius:3px 3px 0 0;min-height:3px;opacity:.85;transition:opacity .12s;}
        .dtp-barw:hover .dtp-bar{opacity:1;}
        .dtp-bar.today{background:#e8b43a;opacity:1;}
        .dtp-bar.miss{height:5px;background:#f7f8fa;border-radius:2px;}
        .dtp-bx{display:flex;justify-content:space-between;margin-top:5px;padding-right:var(--agut);font-family:'DM Mono',ui-monospace,monospace;font-size:9px;color:#262b35;}
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
          .dtp-grid{grid-template-columns:1fr 1fr;gap:16px;}
          .dtp-col:nth-child(3){grid-column:1/-1;}
        }
        @media(max-width:720px){
          .dtp{padding:13px;}
          .dtp-hd{flex-wrap:wrap;gap:11px;}
          .dtp-acts{width:100%;}
          .dtp-play{flex:1;font-size:14px;padding:12px 16px;}
          .dtp-nm{font-size:19px;}
          .dtp-grid{grid-template-columns:1fr;gap:15px;}
          .dtp-col:nth-child(3){grid-column:auto;}
        }
      `}</style>
    </div>
  );
}
